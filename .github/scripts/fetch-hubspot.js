#!/usr/bin/env node

/**
 * Script GitHub Actions pour récupérer les données HubSpot
 * Enrichit avec : deals, companies, contacts, notes, engagements
 * Génère public/data.json pour le dashboard
 */

const fs = require('fs');
const path = require('path');

const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

if (!HUBSPOT_TOKEN) {
  console.error('❌ HUBSPOT_ACCESS_TOKEN non défini');
  process.exit(1);
}

const API_BASE = 'https://api.hubapi.com';

// ============================================================================
// Fetch Helpers
// ============================================================================

async function fetchHubSpot(endpoint, params = {}) {
  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      url.searchParams.append(key, value.join(','));
    } else {
      url.searchParams.append(key, value);
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HubSpot API error (${response.status}): ${error}`);
  }

  return response.json();
}

async function fetchAllPaginated(endpoint, propertyList = []) {
  const results = [];
  let after = null;
  let hasMore = true;

  while (hasMore) {
    const params = {
      limit: 100
    };

    if (propertyList.length > 0) {
      params.properties = propertyList;
    }

    if (after) {
      params.after = after;
    }

    const data = await fetchHubSpot(endpoint, params);

    if (data.results && data.results.length > 0) {
      results.push(...data.results);
      console.log(`  ✓ ${results.length} items récupérés...`);
    }

    hasMore = data.paging && data.paging.next;
    after = hasMore ? data.paging.next.after : null;
  }

  return results;
}

// ============================================================================
// Data Fetchers
// ============================================================================

async function fetchOwners() {
  console.log('📋 Récupération des owners...');
  try {
    const data = await fetchHubSpot('/crm/v3/owners/');
    const ownerMap = {};

    data.results.forEach(owner => {
      ownerMap[owner.id] = {
        id: owner.id,
        email: owner.email,
        firstName: owner.firstName || '',
        lastName: owner.lastName || '',
        fullName: `${owner.firstName || ''} ${owner.lastName || ''}`.trim() || owner.email
      };
    });

    console.log(`  ✅ ${Object.keys(ownerMap).length} owners`);
    return ownerMap;
  } catch (error) {
    console.warn('  ⚠️ Erreur owners:', error.message);
    return {};
  }
}

async function fetchDeals() {
  console.log('💰 Récupération des deals...');

  const deals = await fetchAllPaginated('/crm/v3/objects/deals', [
    'dealname',
    'amount',
    'closedate',
    'createdate',
    'dealstage',
    'pipeline',
    'hubspot_owner_id',
    'dealtype',
    'hs_deal_stage_probability',
    'days_to_close',
    'hs_is_closed_won',
    'hs_analytics_source',
    'num_associated_contacts',
    'num_contacted_notes',
    'hs_lastmodifieddate'
  ]);

  console.log(`  ✅ ${deals.length} deals`);
  return deals;
}

async function fetchCompanies() {
  console.log('🏢 Récupération des entreprises...');

  const companies = await fetchAllPaginated('/crm/v3/objects/companies', [
    'name',
    'domain',
    'industry',
    'city',
    'country',
    'numberofemployees',
    'annualrevenue',
    'lifecyclestage',
    'hs_lastmodifieddate'
  ]);

  const companyMap = {};
  companies.forEach(company => {
    companyMap[company.id] = {
      id: company.id,
      name: company.properties.name || 'Inconnu',
      domain: company.properties.domain || '',
      industry: company.properties.industry || '',
      city: company.properties.city || '',
      country: company.properties.country || '',
      employees: company.properties.numberofemployees || '',
      revenue: company.properties.annualrevenue || '',
      stage: company.properties.lifecyclestage || ''
    };
  });

  console.log(`  ✅ ${Object.keys(companyMap).length} entreprises`);
  return companyMap;
}

async function fetchDealAssociations(dealId, objectType) {
  try {
    const data = await fetchHubSpot(`/crm/v4/objects/deals/${dealId}/associations/${objectType}`);
    return data.results || [];
  } catch (error) {
    return [];
  }
}

async function fetchEngagements(objectId, objectType) {
  try {
    const data = await fetchHubSpot(`/crm/v4/objects/${objectType}/${objectId}/associations/notes`);

    if (!data.results || data.results.length === 0) return [];

    const notes = [];

    // Récupérer les détails de chaque note (limité à 10 pour performance)
    for (const assoc of data.results.slice(0, 10)) {
      try {
        const noteData = await fetchHubSpot(`/crm/v3/objects/notes/${assoc.toObjectId}`, {
          properties: ['hs_note_body', 'hs_timestamp', 'hubspot_owner_id']
        });

        notes.push({
          id: noteData.id,
          body: noteData.properties.hs_note_body || '',
          timestamp: noteData.properties.hs_timestamp || '',
          ownerId: noteData.properties.hubspot_owner_id || ''
        });
      } catch (err) {
        // Skip si erreur sur une note
      }
    }

    return notes;
  } catch (error) {
    return [];
  }
}

async function enrichDeals(deals, companies, owners) {
  console.log('🔄 Enrichissement des deals...');

  const enrichedDeals = [];
  let processed = 0;

  for (const deal of deals) {
    processed++;
    if (processed % 10 === 0) {
      console.log(`  ⏳ ${processed}/${deals.length} deals enrichis...`);
    }

    try {
      // Récupérer les associations
      const [companyAssocs, contactAssocs] = await Promise.all([
        fetchDealAssociations(deal.id, 'companies'),
        fetchDealAssociations(deal.id, 'contacts')
      ]);

      // Récupérer les notes (engagements)
      const notes = await fetchEngagements(deal.id, 'deals');

      // Enrichir le deal
      const companyId = companyAssocs[0]?.toObjectId;
      const company = companyId ? companies[companyId] : null;

      deal.enriched = {
        company: company,
        contactIds: contactAssocs.map(c => c.toObjectId),
        contactCount: contactAssocs.length,
        owner: owners[deal.properties.hubspot_owner_id] || null,
        notes: notes,
        notesCount: notes.length,
        // Calculer un score de relation basé sur les notes
        relationshipScore: calculateRelationshipScore(notes, deal)
      };

      enrichedDeals.push(deal);

    } catch (error) {
      console.warn(`  ⚠️ Erreur deal ${deal.id}:`, error.message);
      deal.enriched = {
        company: null,
        contactIds: [],
        contactCount: 0,
        owner: null,
        notes: [],
        notesCount: 0,
        relationshipScore: 0
      };
      enrichedDeals.push(deal);
    }
  }

  console.log(`  ✅ ${enrichedDeals.length} deals enrichis avec notes et relations`);
  return enrichedDeals;
}

// ============================================================================
// Account Management Scoring
// ============================================================================

function calculateRelationshipScore(notes, deal) {
  let score = 0;

  // Points pour le nombre de notes (engagement)
  score += Math.min(notes.length * 5, 30); // Max 30 points

  // Points pour la récence des notes
  if (notes.length > 0) {
    const latestNote = notes.reduce((latest, note) => {
      const noteTime = new Date(note.timestamp).getTime();
      const latestTime = new Date(latest.timestamp).getTime();
      return noteTime > latestTime ? note : latest;
    });

    const daysSinceNote = (Date.now() - new Date(latestNote.timestamp).getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceNote < 30) score += 20;
    else if (daysSinceNote < 90) score += 10;
    else if (daysSinceNote < 180) score += 5;
  }

  // Points pour la qualité des notes (longueur = indicateur de détail)
  const avgNoteLength = notes.reduce((sum, note) => sum + (note.body?.length || 0), 0) / Math.max(notes.length, 1);
  if (avgNoteLength > 200) score += 20;
  else if (avgNoteLength > 100) score += 10;
  else if (avgNoteLength > 50) score += 5;

  // Points pour le nombre de contacts associés
  const contactCount = parseInt(deal.properties.num_associated_contacts || 0);
  score += Math.min(contactCount * 3, 15); // Max 15 points

  return Math.min(score, 100);
}

function transformToCSVFormat(deals) {
  return deals.map(deal => {
    const props = deal.properties;
    const enriched = deal.enriched || {};

    return {
      // Colonnes originales
      'Phase de la transaction': props.dealstage || '',
      'Montant': props.amount || '0',
      'Pipeline': props.pipeline || 'Non défini',
      'Associated Company (Primary)': enriched.company?.name || 'Inconnu',
      'Date de fermeture': props.closedate || '',
      'Propriétaire de la transaction': enriched.owner?.fullName || props.hubspot_owner_id || '',
      'Nom de la transaction': props.dealname || '',

      // Nouvelles colonnes enrichies
      'Deal ID': deal.id,
      'Date de création': props.createdate || '',
      'Type de deal': props.dealtype || '',
      'Probabilité': props.hs_deal_stage_probability || '',
      'Jours pour closer': props.days_to_close || '',
      'Nombre de contacts': enriched.contactCount || '0',
      'Nombre de notes': enriched.notesCount || '0',
      'Source': props.hs_analytics_source || '',

      // Entreprise (détails)
      'Entreprise - Domaine': enriched.company?.domain || '',
      'Entreprise - Industrie': enriched.company?.industry || '',
      'Entreprise - Ville': enriched.company?.city || '',
      'Entreprise - Pays': enriched.company?.country || '',
      'Entreprise - Employés': enriched.company?.employees || '',
      'Entreprise - CA Annuel': enriched.company?.revenue || '',

      // Account Manager
      'AM - Nom': enriched.owner?.fullName || '',
      'AM - Email': enriched.owner?.email || '',

      // Score de relation (Account Management)
      'Score Relation': enriched.relationshipScore || 0,

      // Notes (aperçu)
      'Dernière Note': enriched.notes?.[0]?.body?.substring(0, 200) || '',
      'Date Dernière Note': enriched.notes?.[0]?.timestamp || ''
    };
  });
}

function calculateMetrics(deals) {
  const metrics = {
    total_deals: deals.length,
    total_revenue: 0,
    won_deals: 0,
    won_revenue: 0,
    avg_deal_size: 0,
    avg_relationship_score: 0,
    deals_with_notes: 0,
    total_notes: 0,
    companies_count: new Set(),
    deals_by_owner: {},
    deals_by_pipeline: {},
    high_priority_accounts: []
  };

  let totalRelationshipScore = 0;

  deals.forEach(deal => {
    const props = deal.properties;
    const enriched = deal.enriched || {};
    const amount = parseFloat(props.amount || 0);

    metrics.total_revenue += amount;

    if (props.hs_is_closed_won === 'true' || props.dealstage === 'Fermé gagné') {
      metrics.won_deals++;
      metrics.won_revenue += amount;
    }

    if (enriched.company?.id) {
      metrics.companies_count.add(enriched.company.id);
    }

    if (enriched.notesCount > 0) {
      metrics.deals_with_notes++;
      metrics.total_notes += enriched.notesCount;
    }

    totalRelationshipScore += enriched.relationshipScore || 0;

    // By owner
    const ownerId = props.hubspot_owner_id || 'Non assigné';
    if (!metrics.deals_by_owner[ownerId]) {
      metrics.deals_by_owner[ownerId] = {
        count: 0,
        revenue: 0,
        avg_relationship: 0,
        deals: []
      };
    }
    metrics.deals_by_owner[ownerId].count++;
    metrics.deals_by_owner[ownerId].revenue += amount;
    metrics.deals_by_owner[ownerId].deals.push(enriched.relationshipScore || 0);

    // By pipeline
    const pipeline = props.pipeline || 'Non défini';
    if (!metrics.deals_by_pipeline[pipeline]) {
      metrics.deals_by_pipeline[pipeline] = { count: 0, revenue: 0 };
    }
    metrics.deals_by_pipeline[pipeline].count++;
    metrics.deals_by_pipeline[pipeline].revenue += amount;

    // High priority accounts (gros CA + bon relationship score)
    if (amount > 10000 && enriched.relationshipScore > 50) {
      metrics.high_priority_accounts.push({
        company: enriched.company?.name || 'Inconnu',
        amount: amount,
        relationshipScore: enriched.relationshipScore,
        notesCount: enriched.notesCount,
        owner: enriched.owner?.fullName || 'Non assigné'
      });
    }
  });

  // Calculs finaux
  metrics.avg_deal_size = metrics.total_deals > 0 ? metrics.total_revenue / metrics.total_deals : 0;
  metrics.avg_relationship_score = metrics.total_deals > 0 ? totalRelationshipScore / metrics.total_deals : 0;
  metrics.companies_count = metrics.companies_count.size;

  // Calculer avg relationship par owner
  Object.keys(metrics.deals_by_owner).forEach(ownerId => {
    const ownerData = metrics.deals_by_owner[ownerId];
    ownerData.avg_relationship = ownerData.deals.reduce((a, b) => a + b, 0) / ownerData.deals.length;
    delete ownerData.deals; // Supprimer le tableau pour alléger le JSON
  });

  // Trier high priority accounts
  metrics.high_priority_accounts.sort((a, b) => b.relationshipScore - a.relationshipScore);
  metrics.high_priority_accounts = metrics.high_priority_accounts.slice(0, 20); // Top 20

  return metrics;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  console.log('🚀 Démarrage de la récupération HubSpot...\n');

  try {
    // 1. Récupérer les données de base
    const [owners, companies] = await Promise.all([
      fetchOwners(),
      fetchCompanies()
    ]);

    // 2. Récupérer les deals
    const deals = await fetchDeals();

    // 3. Enrichir les deals avec associations, notes, et scoring
    const enrichedDeals = await enrichDeals(deals, companies, owners);

    // 4. Transformer au format CSV
    const csvData = transformToCSVFormat(enrichedDeals);

    // 5. Calculer les métriques
    const metrics = calculateMetrics(enrichedDeals);

    // 6. Générer le fichier JSON final
    const output = {
      success: true,
      timestamp: new Date().toISOString(),
      count: csvData.length,
      data: csvData,
      metrics: metrics,
      metadata: {
        owners_count: Object.keys(owners).length,
        companies_count: Object.keys(companies).length,
        deals_count: deals.length,
        notes_total: metrics.total_notes,
        avg_relationship_score: Math.round(metrics.avg_relationship_score)
      }
    };

    // 7. Sauvegarder dans public/data.json
    const outputPath = path.join(__dirname, '../../public/data.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');

    console.log('\n✅ Données sauvegardées dans public/data.json');
    console.log(`📊 Résumé:`);
    console.log(`   - ${output.count} deals`);
    console.log(`   - ${output.metadata.companies_count} entreprises`);
    console.log(`   - ${output.metadata.notes_total} notes`);
    console.log(`   - Score relation moyen: ${output.metadata.avg_relationship_score}/100`);
    console.log(`   - ${metrics.high_priority_accounts.length} comptes prioritaires identifiés`);

  } catch (error) {
    console.error('\n❌ Erreur:', error);
    process.exit(1);
  }
}

main();
