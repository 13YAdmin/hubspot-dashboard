#!/usr/bin/env node

/**
 * Enrichissement automatique des filiales via API Pappers
 * Génère un CSV de nouvelles opportunités à valider avant import HubSpot
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const PappersAPI = require('./lib/pappers-api');
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
console.log('🔍 ENRICHISSEMENT DES FILIALES - API PAPPERS');
console.log('═══════════════════════════════════════════════════\n');

const pappers = new PappersAPI(PAPPERS_TOKEN);

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

    console.log(`   → ${allDeals.length} deals récupérés...`);

  } while (after);

  // Filtrer les deals gagnés ou en cours
  const activeDeals = allDeals.filter(deal => {
    const stage = deal.properties.dealstage || '';
    return !stage.includes('lost') && !stage.includes('closed');
  });

  console.log(`\n   ✅ ${activeDeals.length} deals actifs identifiés\n`);
  return activeDeals;
}

/**
 * ÉTAPE 2: Récupérer les companies associées aux deals
 */
async function fetchCompaniesFromDeals(deals) {
  console.log('🏢 ÉTAPE 2: Récupération des companies avec deals...\n');

  // Extraire tous les company IDs uniques
  const companyIds = new Set();
  deals.forEach(deal => {
    if (deal.associations?.companies?.results) {
      deal.associations.companies.results.forEach(assoc => {
        companyIds.add(assoc.id);
      });
    }
  });

  console.log(`   → ${companyIds.size} companies uniques à récupérer\n`);

  // Récupérer les détails de chaque company
  const companies = [];
  const companyIdArray = Array.from(companyIds);

  // Batch de 100 companies max par requête
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
 * ÉTAPE 3: Calculer le CA par company
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
 * ÉTAPE 4: Récupérer toutes les companies existantes dans HubSpot
 * (pour filtrer les doublons)
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
 * ÉTAPE 5: Enrichir avec Pappers API
 */
async function enrichWithPappers(activeCompanies, revenues, allHubspotCompanies) {
  console.log('🔍 ÉTAPE 4: Enrichissement via Pappers API...\n');

  const newSubsidiaries = [];
  let companiesProcessed = 0;
  let totalFiliales = 0;

  // Créer un Set de tous les SIRENs déjà dans HubSpot
  const existingSirens = new Set();
  allHubspotCompanies.forEach(company => {
    const siren = PappersAPI.cleanSiren(company.properties.siren);
    if (siren) {
      existingSirens.add(siren);
    }
  });

  console.log(`   → ${existingSirens.size} SIRENs déjà présents dans HubSpot\n`);

  // Pour chaque company active, rechercher ses filiales
  for (const company of activeCompanies) {
    const companyId = company.id;
    const companyName = company.properties.name || 'Sans nom';
    const siren = PappersAPI.cleanSiren(company.properties.siren);

    companiesProcessed++;
    console.log(`   [${companiesProcessed}/${activeCompanies.length}] ${companyName}...`);

    // Si pas de SIREN, on ne peut pas interroger Pappers
    if (!siren || !PappersAPI.isValidSiren(siren)) {
      console.log(`      ⚠️  Pas de SIREN valide\n`);
      continue;
    }

    // Récupérer les filiales depuis Pappers
    const filiales = await pappers.getFiliales(siren);

    if (filiales.length === 0) {
      console.log(`      → Aucune filiale\n`);
      continue;
    }

    console.log(`      → ${filiales.length} filiales trouvées`);
    totalFiliales += filiales.length;

    // Filtrer les filiales qui ne sont PAS déjà dans HubSpot
    const newFiliales = filiales.filter(filiale => {
      return filiale.siren && !existingSirens.has(filiale.siren);
    });

    if (newFiliales.length === 0) {
      console.log(`      → Toutes déjà dans HubSpot\n`);
      continue;
    }

    console.log(`      → ${newFiliales.length} nouvelles opportunités`);

    // Scorer chaque nouvelle filiale
    const parentRevenue = revenues[companyId] || 0;
    for (const filiale of newFiliales) {
      const scoreResult = SubsidiaryScorer.calculateScore(filiale, company.properties, parentRevenue);
      const estimatedValue = SubsidiaryScorer.estimateValue(filiale, parentRevenue);

      newSubsidiaries.push({
        // Info filiale
        name: filiale.nom,
        siren: filiale.siren,
        domain: filiale.site_web || '',
        sector: filiale.libelle_code_naf || '',
        city: filiale.ville || '',
        country: filiale.pays || 'France',
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
        scoringFactors: scoreResult.factors.join('; ')
      });
    }

    console.log('');

    // Respecter le rate limiting Pappers (10 req/s)
    await pappers.delay();
  }

  console.log('═══════════════════════════════════════════════════');
  console.log(`📊 ${totalFiliales} filiales trouvées au total`);
  console.log(`✨ ${newSubsidiaries.length} nouvelles opportunités identifiées`);
  console.log('═══════════════════════════════════════════════════\n');

  return newSubsidiaries;
}

/**
 * ÉTAPE 6: Générer le CSV pour validation manuelle
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
    return b.score - a.score; // Score décroissant
  });

  // Headers CSV
  const headers = [
    'Priorité',
    'Score',
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
    'Parent ID (HubSpot)'
  ];

  // Générer les lignes CSV
  const rows = subsidiaries.map(sub => {
    return [
      sub.priority,
      sub.score,
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
      sub.parentId
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');

  // Écrire le fichier
  const filename = `subsidiaries_${new Date().toISOString().split('T')[0]}.csv`;
  const filepath = path.join(__dirname, '../../public', filename);

  // Créer le dossier public s'il n'existe pas
  const publicDir = path.dirname(filepath);
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  fs.writeFileSync(filepath, csvContent, 'utf8');

  console.log(`   ✅ CSV généré: ${filename}`);
  console.log(`   📍 Emplacement: public/${filename}\n`);

  // Statistiques
  const stats = {
    total: subsidiaries.length,
    haute: subsidiaries.filter(s => s.priority === 'HAUTE').length,
    moyenne: subsidiaries.filter(s => s.priority === 'MOYENNE').length,
    basse: subsidiaries.filter(s => s.priority === 'BASSE').length,
    totalEstimatedValue: subsidiaries.reduce((sum, s) => sum + s.estimatedValue, 0)
  };

  console.log('═══════════════════════════════════════════════════');
  console.log('📊 STATISTIQUES:');
  console.log(`   🔴 Priorité HAUTE:   ${stats.haute}`);
  console.log(`   🟡 Priorité MOYENNE: ${stats.moyenne}`);
  console.log(`   ⚪ Priorité BASSE:   ${stats.basse}`);
  console.log(`   💰 Valeur estimée totale: ${formatCurrency(stats.totalEstimatedValue)}`);
  console.log('═══════════════════════════════════════════════════\n');

  return filename;
}

/**
 * Helper: Échapper les valeurs CSV
 */
function escapeCsvValue(value) {
  if (!value) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Helper: Formater montant en euros
 */
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

    // Étape 1: Récupérer les deals actifs
    const activeDeals = await fetchActiveDeals();

    // Étape 2: Récupérer les companies associées
    const activeCompanies = await fetchCompaniesFromDeals(activeDeals);

    // Calculer le CA par company
    const revenues = calculateRevenueByCompany(activeDeals);

    // Étape 3: Récupérer TOUTES les companies HubSpot (pour filtrage)
    const allHubspotCompanies = await fetchAllCompanies();

    // Étape 4: Enrichissement via Pappers
    const newSubsidiaries = await enrichWithPappers(activeCompanies, revenues, allHubspotCompanies);

    // Étape 5: Générer le CSV
    const filename = generateCSV(newSubsidiaries);

    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log('✅ ENRICHISSEMENT TERMINÉ !');
    console.log(`⏱️  Durée: ${duration}s\n`);

    if (filename) {
      console.log('📋 PROCHAINES ÉTAPES:');
      console.log('   1. Télécharger le CSV depuis les Artifacts GitHub');
      console.log('   2. Valider les filiales à importer');
      console.log('   3. Importer dans HubSpot via l\'import CSV ou API\n');
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERREUR FATALE:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Lancer le script
main();
