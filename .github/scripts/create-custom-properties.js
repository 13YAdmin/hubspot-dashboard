#!/usr/bin/env node

/**
 * Création des custom properties dans HubSpot pour stocker les scores calculés
 * À exécuter UNE SEULE FOIS pour initialiser les propriétés
 */

const https = require('https');

const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

if (!HUBSPOT_TOKEN) {
  console.error('❌ HUBSPOT_ACCESS_TOKEN non défini');
  process.exit(1);
}

console.log('🎯 Création des custom properties dans HubSpot...\n');

// Définition des custom properties à créer
const customProperties = [
  {
    name: 'health_score',
    label: 'Health Score',
    type: 'number',
    fieldType: 'number',
    groupName: 'companyinformation',
    description: 'Score de santé client calculé automatiquement (0-100). Basé sur engagement, revenue, notes et tendance.',
    options: []
  },
  {
    name: 'client_segment',
    label: 'Client Segment',
    type: 'enumeration',
    fieldType: 'select',
    groupName: 'companyinformation',
    description: 'Segment client calculé automatiquement basé sur CA et santé.',
    options: [
      { label: 'Strategic', value: 'strategic', description: 'CA >200k, Health >70', displayOrder: 0 },
      { label: 'Key Account', value: 'key_account', description: 'CA >100k, Health >50', displayOrder: 1 },
      { label: 'Growth', value: 'growth', description: 'CA >50k, Tendance positive', displayOrder: 2 },
      { label: 'At Risk', value: 'at_risk', description: 'Health <30 ou tendance négative', displayOrder: 3 },
      { label: 'Dormant', value: 'dormant', description: 'Aucune activité récente', displayOrder: 4 }
    ]
  },
  {
    name: 'revenue_trend',
    label: 'Revenue Trend (%)',
    type: 'number',
    fieldType: 'number',
    groupName: 'companyinformation',
    description: 'Tendance du CA en pourcentage (année sur année). Positif = croissance, négatif = déclin.',
    options: []
  },
  {
    name: 'relationship_sentiment',
    label: 'Relationship Sentiment',
    type: 'enumeration',
    fieldType: 'select',
    groupName: 'companyinformation',
    description: 'Sentiment relationnel calculé depuis les notes. Basé sur analyse de mots-clés positifs/négatifs.',
    options: [
      { label: 'Excellent', value: 'excellent', displayOrder: 0 },
      { label: 'Très positif', value: 'very_positive', displayOrder: 1 },
      { label: 'Positif', value: 'positive', displayOrder: 2 },
      { label: 'Neutre favorable', value: 'neutral_favorable', displayOrder: 3 },
      { label: 'Neutre', value: 'neutral', displayOrder: 4 },
      { label: 'Préoccupant', value: 'concerning', displayOrder: 5 },
      { label: 'Négatif', value: 'negative', displayOrder: 6 },
      { label: 'Très négatif', value: 'very_negative', displayOrder: 7 }
    ]
  },
  {
    name: 'is_white_space',
    label: 'White Space',
    type: 'bool',
    fieldType: 'booleancheckbox',
    groupName: 'companyinformation',
    description: 'Filiale sans deals identifiée comme opportunité White Space (cross-sell non exploité).',
    options: []
  },
  {
    name: 'last_score_update',
    label: 'Last Score Update',
    type: 'datetime',
    fieldType: 'date',
    groupName: 'companyinformation',
    description: 'Date de dernière mise à jour automatique des scores.',
    options: []
  }
];

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
          reject(new Error(`Parse error: ${e.message} - Data: ${data}`));
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

// Créer les custom properties
async function createProperties() {
  let created = 0;
  let alreadyExists = 0;
  let errors = 0;

  for (const prop of customProperties) {
    try {
      console.log(`📝 Création de la propriété: ${prop.name}...`);

      await makeRequest('POST', '/crm/v3/properties/companies', prop);

      console.log(`   ✅ ${prop.label} créée avec succès`);
      created++;

    } catch (error) {
      if (error.message.includes('409') || error.message.includes('already exists')) {
        console.log(`   ⚠️  ${prop.label} existe déjà (skip)`);
        alreadyExists++;
      } else {
        console.error(`   ❌ Erreur: ${error.message}`);
        errors++;
      }
    }
  }

  console.log('\n=====================================');
  console.log('📊 Résumé:');
  console.log(`   ✅ Créées: ${created}`);
  console.log(`   ⚠️  Déjà existantes: ${alreadyExists}`);
  console.log(`   ❌ Erreurs: ${errors}`);
  console.log('=====================================\n');

  if (errors > 0) {
    console.error('⚠️  Certaines propriétés n\'ont pas pu être créées. Vérifier les permissions API.');
    process.exit(1);
  } else {
    console.log('✅ Configuration des custom properties terminée !');
  }
}

createProperties().catch(err => {
  console.error('❌ Erreur fatale:', err.message);
  process.exit(1);
});
