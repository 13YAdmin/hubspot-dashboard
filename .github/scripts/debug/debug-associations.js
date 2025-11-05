#!/usr/bin/env node

/**
 * 🔍 DEBUG ASSOCIATIONS HUBSPOT
 *
 * Ce script explore TOUTES les associations entre companies pour comprendre
 * pourquoi certaines relations (comme CEVA → CMA CGM) ne sont pas capturées.
 */

const TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

if (!TOKEN) {
  console.error('❌ HUBSPOT_ACCESS_TOKEN manquant');
  process.exit(1);
}

async function fetchHubSpot(endpoint, options = {}) {
  const url = `https://api.hubapi.com${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

async function main() {
  console.log('\n🔍 DEBUG ASSOCIATIONS HUBSPOT\n');

  // 1. Chercher CMA CGM
  console.log('📦 Recherche CMA CGM...');
  const searchCMA = await fetchHubSpot(`/crm/v3/objects/companies/search`, {
    method: 'POST',
    body: JSON.stringify({
      filterGroups: [{
        filters: [{
          propertyName: 'name',
          operator: 'CONTAINS_TOKEN',
          value: 'CMA CGM'
        }]
      }],
      properties: ['name', 'domain']
    })
  });

  const cmaCGM = searchCMA.results?.[0];
  if (!cmaCGM) {
    console.error('❌ CMA CGM introuvable');
    process.exit(1);
  }

  console.log(`✅ CMA CGM trouvé: ${cmaCGM.id} - ${cmaCGM.properties.name}`);

  // 2. Chercher CEVA Logistics
  console.log('\n📦 Recherche CEVA Logistics...');
  const searchCEVA = await fetchHubSpot(`/crm/v3/objects/companies/search`, {
    method: 'POST',
    body: JSON.stringify({
      filterGroups: [{
        filters: [{
          propertyName: 'name',
          operator: 'CONTAINS_TOKEN',
          value: 'CEVA Logistics'
        }]
      }],
      properties: ['name', 'domain']
    })
  });

  const cevaLogistics = searchCEVA.results?.[0];
  if (!cevaLogistics) {
    console.error('❌ CEVA Logistics introuvable');
    process.exit(1);
  }

  console.log(`✅ CEVA Logistics trouvé: ${cevaLogistics.id} - ${cevaLogistics.properties.name}`);

  // 3. Récupérer TOUTES les associations de CMA CGM
  console.log(`\n🔗 Associations de CMA CGM (${cmaCGM.id}):`);
  try {
    const assocsCMA = await fetchHubSpot(`/crm/v4/objects/companies/${cmaCGM.id}/associations/companies`);

    if (assocsCMA.results && assocsCMA.results.length > 0) {
      console.log(`\n📊 ${assocsCMA.results.length} associations trouvées:\n`);

      assocsCMA.results.forEach((assoc, idx) => {
        console.log(`${idx + 1}. Company ID: ${assoc.toObjectId}`);
        console.log(`   Types: ${JSON.stringify(assoc.associationTypes, null, 2)}`);
        console.log('');
      });
    } else {
      console.log('⚠️  Aucune association trouvée pour CMA CGM');
    }
  } catch (err) {
    console.error(`❌ Erreur récupération associations CMA: ${err.message}`);
  }

  // 4. Récupérer TOUTES les associations de CEVA Logistics
  console.log(`\n🔗 Associations de CEVA Logistics (${cevaLogistics.id}):`);
  try {
    const assocsCEVA = await fetchHubSpot(`/crm/v4/objects/companies/${cevaLogistics.id}/associations/companies`);

    if (assocsCEVA.results && assocsCEVA.results.length > 0) {
      console.log(`\n📊 ${assocsCEVA.results.length} associations trouvées:\n`);

      assocsCEVA.results.forEach((assoc, idx) => {
        console.log(`${idx + 1}. Company ID: ${assoc.toObjectId}`);
        console.log(`   Types: ${JSON.stringify(assoc.associationTypes, null, 2)}`);

        // Check si c'est CMA CGM
        if (assoc.toObjectId === cmaCGM.id) {
          console.log('   🎯 C\'EST CMA CGM !');
        }
        console.log('');
      });
    } else {
      console.log('⚠️  Aucune association trouvée pour CEVA Logistics');
    }
  } catch (err) {
    console.error(`❌ Erreur récupération associations CEVA: ${err.message}`);
  }

  // 5. Lister TOUS les types d'associations possibles
  console.log('\n📋 Types d\'associations company→company disponibles dans HubSpot:');
  try {
    const assocTypes = await fetchHubSpot('/crm/v4/associations/companies/companies/labels');
    console.log(JSON.stringify(assocTypes, null, 2));
  } catch (err) {
    console.error(`❌ Erreur récupération types: ${err.message}`);
  }
}

main().catch(err => {
  console.error('\n❌ ERREUR:', err.message);
  process.exit(1);
});
