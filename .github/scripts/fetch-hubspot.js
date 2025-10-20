#!/usr/bin/env node

/**
 * Script GitHub Actions - ACCOUNT MANAGEMENT DASHBOARD PRO
 * Récupère et analyse TOUTES les données HubSpot pour Account Management
 *
 * Données récupérées :
 * - Deals complets avec toutes les propriétés
 * - Companies avec toutes les infos
 * - Contacts (tous les décideurs)
 * - TOUTES les notes (sans limite) avec analyse de contenu
 * - Engagement history (emails, calls, meetings)
 * - Timeline complète des interactions
 *
 * Analyse Account Management :
 * - Scoring relationnel basé sur les notes
 * - Détection des clients dormants (vraie logique)
 * - Health score par compte
 * - Recommandations Account Management
 */

const fs = require('fs');
const path = require('path');

// Import des modules
const { fetchHubSpot, fetchAllPaginated, fetchAllNotes, fetchEngagementHistory } = require('./lib/api');
const { analyzeNotes } = require('./lib/notes-analyzer');
const { calculateHealthScore } = require('./lib/health-score');
const { detectSegment } = require('./lib/segment-detector');
const { detectIndustry } = require('./lib/industry-detector');

const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

if (!HUBSPOT_TOKEN) {
  console.error('❌ HUBSPOT_ACCESS_TOKEN non défini');
  process.exit(1);
}

// ============================================================================
// MAIN - Orchestration complète
// ============================================================================

async function main() {
  console.log('🚀 ACCOUNT MANAGEMENT DASHBOARD PRO');
  console.log('Récupération COMPLÈTE de toutes les données HubSpot...\n');

  try {
    // ÉTAPE 1 : Récupérer tous les owners
    console.log('📋 ÉTAPE 1/5 - Récupération des owners...');
    const ownersData = await fetchAllPaginated('/crm/v3/owners/', []);
    const owners = {};
    ownersData.forEach(owner => {
      owners[owner.id] = {
        id: owner.id,
        name: `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || owner.email,
        email: owner.email
      };
    });
    console.log(`✅ ${Object.keys(owners).length} owners récupérés\n`);

    // ÉTAPE 2 : Récupérer toutes les companies
    console.log('🏢 ÉTAPE 2/5 - Récupération des companies...');
    const companiesData = await fetchAllPaginated('/crm/v3/objects/companies', [
      'name',
      'domain',
      'industry',
      'annualrevenue',
      'numberofemployees',
      'hubspot_owner_id'
    ]);
    const companies = {};
    let industriesFound = 0;
    let industriesEmpty = 0;
    let industriesDetected = 0;
    const industryValues = new Set();

    companiesData.forEach(company => {
      let industryValue = company.properties.industry || '';
      const companyName = company.properties.name || 'Sans nom';
      const companyDomain = company.properties.domain || '';

      // Si industry vide, essayer de la détecter intelligemment
      if (!industryValue && companyName !== 'Sans nom') {
        const detectedIndustry = detectIndustry(companyName, companyDomain);
        if (detectedIndustry) {
          industryValue = detectedIndustry;
          industriesDetected++;
        }
      }

      if (industryValue) {
        industriesFound++;
        industryValues.add(industryValue);
      } else {
        industriesEmpty++;
      }

      companies[company.id] = {
        id: company.id,
        name: companyName,
        domain: companyDomain,
        industry: industryValue,
        revenue: parseFloat(company.properties.annualrevenue || 0),
        employees: parseInt(company.properties.numberofemployees || 0),
        ownerId: company.properties.hubspot_owner_id || '',
        parentCompanyIds: [], // Sera rempli après
        childCompanyIds: []   // Sera rempli après
      };
    });
    console.log(`✅ ${Object.keys(companies).length} companies récupérées`);
    console.log(`📊 Industries HubSpot: ${industriesFound - industriesDetected} trouvées`);
    console.log(`🤖 Industries détectées automatiquement: ${industriesDetected}`);
    console.log(`⚠️  Industries manquantes: ${industriesEmpty}`);
    if (industryValues.size > 0) {
      console.log(`📋 Secteurs uniques: ${industryValues.size} différents`);
      console.log(`📋 Liste: ${Array.from(industryValues).sort().slice(0, 10).join(', ')}${industryValues.size > 10 ? '...' : ''}`);
    }

    // Récupérer les associations parent/child pour chaque company
    console.log('🔗 Récupération des relations parent/child...');
    let relationsCount = 0;
    for (const companyId in companies) {
      try {
        // Récupérer les associations company→company
        const assocs = await fetchHubSpot(`/crm/v4/objects/companies/${companyId}/associations/companies`);

        if (assocs.results && assocs.results.length > 0) {
          assocs.results.forEach(assoc => {
            const associatedCompanyId = assoc.toObjectId;
            const associationType = assoc.associationTypes?.[0]?.typeId;

            // Type 13 = Parent company to child company (cette company est parent)
            // Type 14 = Child company to parent company (cette company est enfant)
            if (associationType === 13) {
              companies[companyId].childCompanyIds.push(associatedCompanyId);
              relationsCount++;
            } else if (associationType === 14) {
              companies[companyId].parentCompanyIds.push(associatedCompanyId);
              relationsCount++;
            }
          });
        }
      } catch (err) {
        // Pas d'associations, ce n'est pas une erreur
      }
    }
    console.log(`✅ ${relationsCount} relations parent/child détectées\n`);

    // ÉTAPE 3 : Récupérer tous les deals
    console.log('💼 ÉTAPE 3/5 - Récupération des deals...');
    const dealsData = await fetchAllPaginated('/crm/v3/objects/deals', [
      'dealname',
      'amount',
      'closedate',
      'createdate',
      'dealstage',
      'pipeline',
      'hubspot_owner_id',
      'hs_deal_stage_probability'
    ]);
    console.log(`✅ ${dealsData.length} deals récupérés\n`);

    // ÉTAPE 4 : Enrichir chaque deal avec TOUTES les données
    console.log('🔍 ÉTAPE 4/5 - Enrichissement complet des données...');
    const enrichedDeals = [];

    for (let i = 0; i < dealsData.length; i++) {
      const deal = dealsData[i];
      const dealProps = deal.properties;

      console.log(`\n[${i + 1}/${dealsData.length}] Traitement: ${dealProps.dealname || 'Sans nom'}`);

      // Récupérer la company associée
      let companyId = null;
      let companyData = null;
      try {
        const assocs = await fetchHubSpot(`/crm/v4/objects/deals/${deal.id}/associations/companies`);
        if (assocs.results && assocs.results.length > 0) {
          companyId = assocs.results[0].toObjectId;
          companyData = companies[companyId];
          console.log(`  ✓ Company: ${companyData?.name || companyId}`);
        }
      } catch (err) {
        console.warn(`  ⚠️ Pas de company associée`);
      }

      // Récupérer TOUTES les notes du deal ET de la company
      let allNotes = [];

      // Notes du deal
      const dealNotes = await fetchAllNotes(deal.id, 'deals');
      console.log(`  ✓ ${dealNotes.length} notes du deal`);
      allNotes.push(...dealNotes);

      // Notes de la company
      if (companyId) {
        const companyNotes = await fetchAllNotes(companyId, 'companies');
        console.log(`  ✓ ${companyNotes.length} notes de la company`);
        allNotes.push(...companyNotes);
      }

      // Récupérer l'engagement history de la company
      let engagement = { emails: 0, calls: 0, meetings: 0, lastActivity: null };
      if (companyId) {
        engagement = await fetchEngagementHistory(companyId);
        console.log(`  ✓ Engagement: ${engagement.emails} emails, ${engagement.calls} calls, ${engagement.meetings} meetings`);
      }

      // Analyser les notes
      const notesAnalysis = analyzeNotes(allNotes);
      console.log(`  ✓ Analyse notes: ${notesAnalysis.sentiment} sentiment, ${notesAnalysis.totalNotes} notes`);

      // Calculer le CA total et par année
      const closeDate = dealProps.closedate ? new Date(dealProps.closedate) : null;
      const year = closeDate ? closeDate.getFullYear() : new Date().getFullYear();
      const amount = parseFloat(dealProps.amount || 0);

      // Préparer les données pour le health score et segment
      const companyAnalysisData = {
        totalRevenue: amount,
        lastDealDate: closeDate,
        yearlyRevenue: { [year]: amount }
      };

      // Calculer le health score
      const healthScore = calculateHealthScore(companyAnalysisData, notesAnalysis, engagement);
      console.log(`  ✓ Health Score: ${healthScore}/100`);

      // Déterminer le segment
      const segmentInfo = detectSegment(companyAnalysisData, notesAnalysis, healthScore);
      console.log(`  ✓ Segment: ${segmentInfo.segment} (${segmentInfo.reason})`);

      // Créer l'objet enrichi
      const enrichedDeal = {
        // Deal info
        dealId: deal.id,
        dealName: dealProps.dealname || 'Sans nom',
        amount: amount,
        closeDate: dealProps.closedate || '',
        createDate: dealProps.createdate || '',
        stage: dealProps.dealstage || '',
        pipeline: dealProps.pipeline || '',
        probability: dealProps.hs_deal_stage_probability || '',

        // Company info
        companyId: companyId || '',
        companyName: companyData?.name || '',
        companyDomain: companyData?.domain || '',
        companyIndustry: companyData?.industry || '',
        companyRevenue: companyData?.revenue || 0,
        companyEmployees: companyData?.employees || 0,
        companyParentIds: companyData?.parentCompanyIds || [],
        companyChildIds: companyData?.childCompanyIds || [],

        // Owner info
        ownerId: dealProps.hubspot_owner_id || companyData?.ownerId || '',
        ownerName: owners[dealProps.hubspot_owner_id || companyData?.ownerId]?.name || '',
        ownerEmail: owners[dealProps.hubspot_owner_id || companyData?.ownerId]?.email || '',

        // Analysis
        totalNotes: notesAnalysis.totalNotes,
        notesAvgLength: notesAnalysis.avgLength,
        notesHasRecent: notesAnalysis.hasRecent,
        notesSentiment: notesAnalysis.sentiment,
        notesPositiveKeywords: notesAnalysis.keywords.positive,
        notesNegativeKeywords: notesAnalysis.keywords.negative,
        notesActionKeywords: notesAnalysis.keywords.action,
        notesMeetingKeywords: notesAnalysis.keywords.meeting,
        latestNoteDate: notesAnalysis.latestNote?.timestamp || '',
        latestNoteBody: notesAnalysis.latestNote?.body || '',

        // Engagement
        engagementEmails: engagement.emails,
        engagementCalls: engagement.calls,
        engagementMeetings: engagement.meetings,
        engagementLastActivity: engagement.lastActivity ? engagement.lastActivity.toISOString() : '',

        // Scores
        healthScore: healthScore,
        segment: segmentInfo.segment,
        segmentColor: segmentInfo.color,
        segmentPriority: segmentInfo.priority,
        segmentReason: segmentInfo.reason,

        // Metadata
        year: year
      };

      enrichedDeals.push(enrichedDeal);
    }

    console.log(`\n✅ ${enrichedDeals.length} deals enrichis avec toutes les données\n`);

    // ÉTAPE 5 : Générer le fichier data.json
    console.log('💾 ÉTAPE 5/5 - Génération du fichier data.json...');

    const output = {
      success: true,
      timestamp: new Date().toISOString(),
      count: enrichedDeals.length,
      data: enrichedDeals,
      companies: companies, // Ajouter toutes les companies avec leurs relations
      metadata: {
        totalOwners: Object.keys(owners).length,
        totalCompanies: Object.keys(companies).length,
        totalDeals: dealsData.length,
        totalRelations: relationsCount,
        industriesFromHubSpot: industriesFound - industriesDetected,
        industriesDetectedAuto: industriesDetected,
        industriesMissing: industriesEmpty,
        enrichmentComplete: true,
        features: [
          'All notes analyzed',
          'Engagement history tracked',
          'Health scores calculated',
          'Segments detected',
          'Dormant clients identified',
          'Parent/child company relationships',
          'Smart industry detection (AI-powered)'
        ]
      }
    };

    const outputPath = path.join(__dirname, '../../public/data.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

    console.log('\n✅ TERMINÉ !');
    console.log(`📊 ${enrichedDeals.length} deals avec analyse complète`);
    console.log(`💾 Fichier: ${outputPath}`);

    // Statistiques finales
    const segments = enrichedDeals.reduce((acc, deal) => {
      acc[deal.segment] = (acc[deal.segment] || 0) + 1;
      return acc;
    }, {});

    console.log('\n📈 STATISTIQUES:');
    Object.entries(segments).forEach(([segment, count]) => {
      console.log(`  ${segment}: ${count}`);
    });

  } catch (error) {
    console.error('\n❌ ERREUR:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
