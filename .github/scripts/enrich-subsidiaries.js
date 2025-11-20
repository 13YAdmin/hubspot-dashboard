#!/usr/bin/env node

/**
 * Enrichissement MULTI-SOURCES des filiales
 * Combine: Pappers API + Wikipedia + Web Scraping
 * Génère un CSV de nouvelles opportunités à valider avant import HubSpot
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const PappersAPI = require('./lib/pappers-api');
const WikipediaEnricher = require('./lib/wikipedia-enricher');
const WebEnricher = require('./lib/web-enricher');
const DataMerger = require('./lib/data-merger');
const SubsidiaryScorer = require('./lib/subsidiary-scorer');

const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const PAPPERS_TOKEN = process.env.PAPPERS_API_TOKEN;

if (!HUBSPOT_TOKEN) {
  console.error('❌ HUBSPOT_ACCESS_TOKEN non défini');
  process.exit(1);
}

if (!PAPPERS_TOKEN) {
  console.error('❌ PAPPERS_API_TOKEN non défini');
  process.exit(1);
}

console.log('═══════════════════════════════════════════════════');
console.log('🔍 ENRICHISSEMENT MULTI-SOURCES DES FILIALES');
console.log('📊 Sources: Pappers API + Wikipedia + Web Scraping');
console.log('═══════════════════════════════════════════════════\n');

const pappers = new PappersAPI(PAPPERS_TOKEN);
const wikipedia = new WikipediaEnricher();
const webEnricher = new WebEnricher();

// Helper pour requêtes HubSpot
function makeHubSpotRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.hubapi.com',
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = data ? JSON.parse(data) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(result);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(result)}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

/**
 * ÉTAPE 1: Récupérer tous les deals actifs de HubSpot
 */
async function fetchActiveDeals() {
  console.log('📊 ÉTAPE 1: Récupération des deals actifs...\n');

  const allDeals = [];
  let after = null;

  do {
    const params = new URLSearchParams({
      limit: '100',
      properties: 'dealname,amount,closedate,dealstage,pipeline,hs_object_id',
      associations: 'company'
    });

    if (after) {
      params.append('after', after);
    }

    const result = await makeHubSpotRequest('GET', `/crm/v3/objects/deals?${params.toString()}`);

    if (result.results) {
      allDeals.push(...result.results);
    }

    after = result.paging?.next?.after || null;

  } while (after);

  const activeDeals = allDeals.filter(deal => {
    const stage = deal.properties.dealstage || '';
    return !stage.includes('lost') && !stage.includes('closed');
  });

  console.log(`   ✅ ${activeDeals.length} deals actifs identifiés\n`);
  return activeDeals;
}

/**
 * ÉTAPE 2: Récupérer les companies associées aux deals
 */
async function fetchCompaniesFromDeals(deals) {
  console.log('🏢 ÉTAPE 2: Récupération des companies avec deals...\n');

  const companyIds = new Set();
  deals.forEach(deal => {
    if (deal.associations?.companies?.results) {
      deal.associations.companies.results.forEach(assoc => {
        companyIds.add(assoc.id);
      });
    }
  });

  console.log(`   → ${companyIds.size} companies uniques à récupérer\n`);

  const companies = [];
  const companyIdArray = Array.from(companyIds);

  for (let i = 0; i < companyIdArray.length; i += 100) {
    const batch = companyIdArray.slice(i, i + 100);

    const result = await makeHubSpotRequest('POST', '/crm/v3/objects/companies/batch/read', {
      properties: ['name', 'domain', 'siren', 'industry', 'city', 'country'],
      inputs: batch.map(id => ({ id }))
    });

    if (result.results) {
      companies.push(...result.results);
    }

    console.log(`   → ${companies.length}/${companyIdArray.length} companies récupérées...`);
  }

  console.log(`\n   ✅ ${companies.length} companies actives récupérées\n`);
  return companies;
}

/**
 * ÉTAPE 3: Récupérer toutes les companies existantes dans HubSpot
 */
async function fetchAllCompanies() {
  console.log('📋 ÉTAPE 3: Récupération de toutes les companies HubSpot...\n');

  const allCompanies = [];
  let after = null;

  do {
    const params = new URLSearchParams({
      limit: '100',
      properties: 'name,domain,siren'
    });

    if (after) {
      params.append('after', after);
    }

    const result = await makeHubSpotRequest('GET', `/crm/v3/objects/companies?${params.toString()}`);

    if (result.results) {
      allCompanies.push(...result.results);
    }

    after = result.paging?.next?.after || null;

  } while (after);

  console.log(`   ✅ ${allCompanies.length} companies HubSpot récupérées\n`);
  return allCompanies;
}

/**
 * Calculer le CA par company
 */
function calculateRevenueByCompany(deals) {
  const revenues = {};

  deals.forEach(deal => {
    if (deal.associations?.companies?.results) {
      deal.associations.companies.results.forEach(assoc => {
        const companyId = assoc.id;
        const amount = parseFloat(deal.properties.amount) || 0;

        if (!revenues[companyId]) {
          revenues[companyId] = 0;
        }
        revenues[companyId] += amount;
      });
    }
  });

  return revenues;
}

/**
 * ÉTAPE 4: ENRICHISSEMENT MULTI-SOURCES
 * Lance Pappers + Wikipedia + Web en parallèle pour chaque client
 */
async function enrichWithAllSources(activeCompanies, revenues, allHubspotCompanies) {
  console.log('🔍 ÉTAPE 4: ENRICHISSEMENT MULTI-SOURCES...\n');
  console.log('   📊 Pappers API (données officielles INSEE)');
  console.log('   📚 Wikipedia (pages entreprises)');
  console.log('   🌐 Web Scraping (sites corporate)\n');

  const existingSirens = new Set();
  const existingNames = new Set();

  allHubspotCompanies.forEach(company => {
    const siren = PappersAPI.cleanSiren(company.properties.siren);
    if (siren) existingSirens.add(siren);

    const name = DataMerger.generateMatchKey(company.properties.name);
    existingNames.add(name);
  });

  console.log(`   → ${existingSirens.size} SIRENs déjà dans HubSpot`);
  console.log(`   → ${existingNames.size} noms d'entreprises déjà dans HubSpot\n`);

  const allNewSubsidiaries = [];
  let companiesProcessed = 0;

  for (const company of activeCompanies) {
    const companyId = company.id;
    const companyName = company.properties.name || 'Sans nom';
    const siren = PappersAPI.cleanSiren(company.properties.siren);
    const domain = company.properties.domain || '';

    companiesProcessed++;
    console.log(`\n   [${companiesProcessed}/${activeCompanies.length}] ${companyName}`);
    console.log('   ' + '─'.repeat(50));

    // LANCER LES 3 SOURCES EN PARALLÈLE
    const [pappersFiliales, wikipediaFiliales, webFiliales] = await Promise.all([
      // Source 1: Pappers API
      (async () => {
        if (!siren || !PappersAPI.isValidSiren(siren)) {
          console.log(`      [Pappers] ⚠️  Pas de SIREN valide`);
          return [];
        }
        console.log(`      [Pappers] Interrogation du SIREN ${siren}...`);
        const filiales = await pappers.getFiliales(siren);
        console.log(`      [Pappers] ${filiales.length} filiales trouvées`);
        return filiales;
      })(),

      // Source 2: Wikipedia
      (async () => {
        const filiales = await wikipedia.enrichCompanyWithValidation(companyName);
        return filiales;
      })(),

      // Source 3: Web Scraping
      (async () => {
        if (!domain) {
          console.log(`      [Web] ⚠️  Pas de domaine`);
          return [];
        }
        const filiales = await webEnricher.enrichCompany({
          id: companyId,
          name: companyName,
          domain: domain
        });
        return filiales;
      })()
    ]);

    // FUSIONNER LES DONNÉES DES 3 SOURCES
    console.log(`\n      [Fusion] Combinaison des résultats...`);
    const mergedSubsidiaries = DataMerger.mergeAllSources(
      pappersFiliales,
      wikipediaFiliales,
      webFiliales
    );

    console.log(`      [Fusion] ${mergedSubsidiaries.length} filiales uniques après fusion`);

    // FILTRER LES FILIALES DÉJÀ DANS HUBSPOT
    const newFiliales = mergedSubsidiaries.filter(filiale => {
      // Filtrer par SIREN
      if (filiale.siren && existingSirens.has(filiale.siren)) {
        return false;
      }

      // Filtrer par nom
      const nameKey = DataMerger.generateMatchKey(filiale.name);
      if (existingNames.has(nameKey)) {
        return false;
      }

      return true;
    });

    console.log(`      [Filtre] ${newFiliales.length} nouvelles filiales (pas dans HubSpot)`);

    if (newFiliales.length === 0) {
      console.log(`      ✅ Aucune nouvelle opportunité`);
      continue;
    }

    // ENRICHIR LES DONNÉES MANQUANTES (tentative de trouver SIREN via Pappers)
    console.log(`      [Enrichissement] Recherche des SIRENs manquants...`);
    let enriched = 0;

    for (const filiale of newFiliales) {
      if (!filiale.siren && filiale.confidence >= 0.6) {
        try {
          await DataMerger.enrichMissingData(filiale, pappers);
          if (filiale.siren) {
            enriched++;
          }
        } catch (error) {
          // Ignorer les erreurs d'enrichissement
        }
        await pappers.delay(); // Respecter rate limiting
      }
    }

    if (enriched > 0) {
      console.log(`      [Enrichissement] ${enriched} SIRENs ajoutés via Pappers`);
    }

    // SCORER CHAQUE FILIALE
    const parentRevenue = revenues[companyId] || 0;

    for (const filiale of newFiliales) {
      const scoreResult = SubsidiaryScorer.calculateScore(
        filiale,
        company.properties,
        parentRevenue
      );

      const estimatedValue = SubsidiaryScorer.estimateValue(filiale, parentRevenue);

      allNewSubsidiaries.push({
        // Info filiale
        name: filiale.name,
        siren: filiale.siren || '',
        domain: filiale.domain || '',
        sector: filiale.sector || '',
        city: filiale.city || '',
        country: filiale.country || 'France',
        effectif: filiale.effectif || '',
        chiffre_affaires: filiale.chiffre_affaires || '',
        date_creation: filiale.date_creation || '',

        // Info parent
        parentId: companyId,
        parentName: companyName,
        parentRevenue: parentRevenue,

        // Scoring
        priority: scoreResult.priority,
        score: scoreResult.score,
        estimatedValue: estimatedValue,
        scoringFactors: scoreResult.factors.join('; '),

        // Sources
        sources: DataMerger.formatSources(filiale),
        confidence: Math.round(filiale.confidence * 100),
        sourceUrls: filiale.sourceUrls.join(' | ')
      });
    }

    console.log(`      ✅ ${newFiliales.length} opportunités ajoutées`);
  }

  // STATISTIQUES FINALES
  console.log('\n═══════════════════════════════════════════════════');
  console.log('📊 STATISTIQUES MULTI-SOURCES:');

  const stats = DataMerger.generateStats(allNewSubsidiaries.map(s => ({
    ...s,
    sources: s.sources.split(' + ').map(src => {
      if (src.includes('Pappers')) return 'pappers';
      if (src.includes('Wikipedia')) return 'wikipedia';
      if (src.includes('Site web')) return 'web';
      return src;
    })
  })));

  console.log(`   Total: ${stats.total} nouvelles filiales`);
  console.log(`   └─ Confiance HAUTE (≥80%): ${stats.byConfidence.high}`);
  console.log(`   └─ Confiance MOYENNE (50-79%): ${stats.byConfidence.medium}`);
  console.log(`   └─ Confiance BASSE (<50%): ${stats.byConfidence.low}`);
  console.log(``);
  console.log(`   Sources:`);
  console.log(`   └─ Multi-sources: ${stats.bySources.multiple}`);
  console.log(`   └─ Pappers seul: ${stats.bySources.pappers}`);
  console.log(`   └─ Wikipedia seul: ${stats.bySources.wikipedia}`);
  console.log(`   └─ Web seul: ${stats.bySources.web}`);
  console.log(``);
  console.log(`   Données complètes:`);
  console.log(`   └─ Avec SIREN: ${stats.withSiren}/${stats.total}`);
  console.log(`   └─ Avec domaine web: ${stats.withDomain}/${stats.total}`);
  console.log('═══════════════════════════════════════════════════\n');

  return allNewSubsidiaries;
}

/**
 * ÉTAPE 5: Générer le CSV
 */
function generateCSV(subsidiaries) {
  console.log('📄 ÉTAPE 5: Génération du CSV...\n');

  if (subsidiaries.length === 0) {
    console.log('   ⚠️  Aucune nouvelle filiale à exporter\n');
    return null;
  }

  // Trier par priorité puis score
  const priorityOrder = { 'HAUTE': 1, 'MOYENNE': 2, 'BASSE': 3 };
  subsidiaries.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.score - a.score;
  });

  // Headers CSV
  const headers = [
    'Priorité',
    'Score',
    'Confiance %',
    'Nom Filiale',
    'SIREN',
    'Domaine',
    'Secteur',
    'Ville',
    'Effectif',
    'CA Filiale',
    'Année Création',
    'Parent',
    'CA Parent',
    'Valeur Estimée',
    'Facteurs Scoring',
    'Sources',
    'URLs Sources',
    'Parent ID (HubSpot)'
  ];

  // Générer les lignes CSV
  const rows = subsidiaries.map(sub => {
    return [
      sub.priority,
      sub.score,
      sub.confidence,
      escapeCsvValue(sub.name),
      sub.siren,
      escapeCsvValue(sub.domain),
      escapeCsvValue(sub.sector),
      escapeCsvValue(sub.city),
      sub.effectif,
      sub.chiffre_affaires,
      sub.date_creation,
      escapeCsvValue(sub.parentName),
      Math.round(sub.parentRevenue),
      Math.round(sub.estimatedValue),
      escapeCsvValue(sub.scoringFactors),
      escapeCsvValue(sub.sources),
      escapeCsvValue(sub.sourceUrls),
      sub.parentId
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');

  const filename = `subsidiaries_${new Date().toISOString().split('T')[0]}.csv`;
  const filepath = path.join(__dirname, '../../public', filename);

  const publicDir = path.dirname(filepath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(filepath, csvContent, 'utf8');

  console.log(`   ✅ CSV généré: ${filename}\n`);

  // Statistiques
  const stats = {
    total: subsidiaries.length,
    haute: subsidiaries.filter(s => s.priority === 'HAUTE').length,
    moyenne: subsidiaries.filter(s => s.priority === 'MOYENNE').length,
    basse: subsidiaries.filter(s => s.priority === 'BASSE').length,
    totalEstimatedValue: subsidiaries.reduce((sum, s) => sum + s.estimatedValue, 0)
  };

  console.log('═══════════════════════════════════════════════════');
  console.log('📊 RÉSUMÉ PAR PRIORITÉ:');
  console.log(`   🔴 HAUTE (à contacter en priorité): ${stats.haute}`);
  console.log(`   🟡 MOYENNE (campagne nurturing): ${stats.moyenne}`);
  console.log(`   ⚪ BASSE (veille): ${stats.basse}`);
  console.log(`   💰 Valeur estimée totale: ${formatCurrency(stats.totalEstimatedValue)}`);
  console.log('═══════════════════════════════════════════════════\n');

  return filename;
}

function escapeCsvValue(value) {
  if (!value) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0
  }).format(amount);
}

/**
 * FONCTION PRINCIPALE
 */
async function main() {
  try {
    const startTime = Date.now();

    const activeDeals = await fetchActiveDeals();
    const activeCompanies = await fetchCompaniesFromDeals(activeDeals);
    const revenues = calculateRevenueByCompany(activeDeals);
    const allHubspotCompanies = await fetchAllCompanies();

    const newSubsidiaries = await enrichWithAllSources(
      activeCompanies,
      revenues,
      allHubspotCompanies
    );

    const filename = generateCSV(newSubsidiaries);

    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log('✅ ENRICHISSEMENT TERMINÉ !');
    console.log(`⏱️  Durée: ${Math.floor(duration / 60)}min ${duration % 60}s\n`);

    if (filename) {
      console.log('📋 PROCHAINES ÉTAPES:');
      console.log('   1. Télécharger le CSV depuis les Artifacts GitHub');
      console.log('   2. Valider les filiales à importer');
      console.log('   3. Importer dans HubSpot via CSV ou API\n');
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERREUR FATALE:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
