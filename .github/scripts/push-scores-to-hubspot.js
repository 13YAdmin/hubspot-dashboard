#!/usr/bin/env node

/**
 * Push des scores calculés vers HubSpot
 * Exécuté après fetch-hubspot.js pour mettre à jour les custom properties
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

if (!HUBSPOT_TOKEN) {
  console.error('❌ HUBSPOT_ACCESS_TOKEN non défini');
  process.exit(1);
}

console.log('🚀 Push des scores calculés vers HubSpot...\n');

// Charger les données traitées
const dataPath = path.join(__dirname, '../../public/data.json');
if (!fs.existsSync(dataPath)) {
  console.error('❌ Fichier data.json introuvable. Exécuter fetch-hubspot.js d\'abord.');
  process.exit(1);
}

const rawData = fs.readFileSync(dataPath, 'utf8');
const { data: deals, companies } = JSON.parse(rawData);

console.log(`📊 Chargement de ${deals.length} deals et ${Object.keys(companies).length} companies`);

// Fonction helper pour faire des requêtes HTTPS
function makeRequest(method, path, body = null) {
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

// Agréger les données par company pour calculer les scores
function aggregateDataByCompany() {
  const companyStats = {};

  deals.forEach(deal => {
    const companyId = deal.companyId;
    const companyName = deal.companyName || 'Inconnu';

    if (!companyId) return;

    if (!companyStats[companyId]) {
      companyStats[companyId] = {
        companyId,
        name: companyName,
        totalRevenue: 0,
        years: {},
        deals: [],
        notes: 0,
        sentiment: deal.sentiment || 'Neutre',
        healthScore: deal.healthScore || 50,
        segment: deal.segment || 'Growth'
      };
    }

    const stats = companyStats[companyId];
    const amount = parseFloat(deal.amount) || 0;
    const year = deal.year || new Date(deal.closeDate || deal.createDate).getFullYear();

    stats.totalRevenue += amount;
    stats.deals.push(deal);

    if (!stats.years[year]) {
      stats.years[year] = 0;
    }
    stats.years[year] += amount;

    if (deal.latestNoteBody) {
      stats.notes++;
    }

    // Garder le dernier sentiment/health/segment
    if (deal.sentiment) stats.sentiment = deal.sentiment;
    if (deal.healthScore) stats.healthScore = deal.healthScore;
    if (deal.segment) stats.segment = deal.segment;
  });

  return Object.values(companyStats);
}

// Calculer la tendance revenue (year-over-year)
function calculateTrend(years) {
  const yearKeys = Object.keys(years).sort();
  if (yearKeys.length < 2) return 0;

  const latestYear = yearKeys[yearKeys.length - 1];
  const previousYear = yearKeys[yearKeys.length - 2];

  const latestRevenue = years[latestYear] || 0;
  const previousRevenue = years[previousYear] || 0;

  if (previousRevenue === 0) return 0;

  return ((latestRevenue - previousRevenue) / previousRevenue * 100).toFixed(1);
}

// Mapper les segments vers les valeurs d'énumération
function mapSegment(segment) {
  const mapping = {
    'Strategic': 'strategic',
    'Key Account': 'key_account',
    'Growth': 'growth',
    'At Risk': 'at_risk',
    'Dormant': 'dormant'
  };
  return mapping[segment] || 'growth';
}

// Mapper les sentiments vers les valeurs d'énumération
function mapSentiment(sentiment) {
  const mapping = {
    'Excellent': 'excellent',
    'Très positif': 'very_positive',
    'Positif': 'positive',
    'Neutre favorable': 'neutral_favorable',
    'Neutre': 'neutral',
    'Préoccupant': 'concerning',
    'Négatif': 'negative',
    'Très négatif': 'very_negative'
  };
  return mapping[sentiment] || 'neutral';
}

// Push des scores pour une company
async function pushCompanyScores(company) {
  const trend = calculateTrend(company.years);

  const properties = {
    health_score: Math.round(company.healthScore),
    client_segment: mapSegment(company.segment),
    revenue_trend: parseFloat(trend),
    relationship_sentiment: mapSentiment(company.sentiment),
    last_score_update: new Date().toISOString()
  };

  try {
    await makeRequest('PATCH', `/crm/v3/objects/companies/${company.companyId}`, {
      properties
    });
    return { success: true, name: company.name };
  } catch (error) {
    return { success: false, name: company.name, error: error.message };
  }
}

// Fonction principale
async function pushAllScores() {
  const companiesData = aggregateDataByCompany();

  console.log(`📤 Mise à jour de ${companiesData.length} companies...\n`);

  let success = 0;
  let failures = 0;
  const errors = [];

  // Traiter en batch de 10 pour éviter rate limiting
  const BATCH_SIZE = 10;
  for (let i = 0; i < companiesData.length; i += BATCH_SIZE) {
    const batch = companiesData.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      batch.map(company => pushCompanyScores(company))
    );

    results.forEach(result => {
      if (result.success) {
        console.log(`   ✅ ${result.name}`);
        success++;
      } else {
        console.log(`   ❌ ${result.name}: ${result.error}`);
        failures++;
        errors.push({ name: result.name, error: result.error });
      }
    });

    // Petit délai entre les batches
    if (i + BATCH_SIZE < companiesData.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('\n=====================================');
  console.log('📊 Résumé:');
  console.log(`   ✅ Succès: ${success}`);
  console.log(`   ❌ Échecs: ${failures}`);
  console.log('=====================================\n');

  if (failures > 0) {
    console.log('⚠️  Erreurs rencontrées:');
    errors.slice(0, 5).forEach(err => {
      console.log(`   - ${err.name}: ${err.error}`);
    });
    if (errors.length > 5) {
      console.log(`   ... et ${errors.length - 5} autres erreurs`);
    }
  }

  if (failures > companiesData.length / 2) {
    console.error('\n❌ Trop d\'erreurs. Vérifier les permissions API.');
    process.exit(1);
  } else {
    console.log('\n✅ Scores pushés vers HubSpot !');
  }
}

pushAllScores().catch(err => {
  console.error('❌ Erreur fatale:', err.message);
  process.exit(1);
});
