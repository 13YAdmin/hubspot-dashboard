#!/usr/bin/env node

/**
 * Script DEBUG - Liste TOUTES les propriétés HubSpot disponibles pour companies
 * Pour trouver le bon champ "industry"
 */

const { fetchHubSpot } = require('./lib/api');

const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

if (!HUBSPOT_TOKEN) {
  console.error('❌ HUBSPOT_ACCESS_TOKEN non défini');
  process.exit(1);
}

async function debugProperties() {
  console.log('🔍 DEBUG - Récupération de TOUTES les propriétés companies HubSpot...\n');

  try {
    // Récupérer toutes les propriétés de companies
    const propertiesResponse = await fetchHubSpot('/crm/v3/properties/companies');

    console.log(`✅ ${propertiesResponse.results.length} propriétés trouvées\n`);

    // Filtrer celles qui contiennent "industry" ou "sector" ou "business"
    const industryProps = propertiesResponse.results.filter(prop => {
      const name = prop.name.toLowerCase();
      const label = (prop.label || '').toLowerCase();
      return name.includes('industry') ||
             name.includes('sector') ||
             name.includes('business') ||
             name.includes('type') ||
             label.includes('industry') ||
             label.includes('secteur') ||
             label.includes('activité');
    });

    console.log('🎯 PROPRIÉTÉS POTENTIELLES POUR INDUSTRY:');
    console.log('==========================================\n');

    industryProps.forEach(prop => {
      console.log(`📋 Name: ${prop.name}`);
      console.log(`   Label: ${prop.label || 'N/A'}`);
      console.log(`   Type: ${prop.type}`);
      console.log(`   Field Type: ${prop.fieldType}`);
      if (prop.options && prop.options.length > 0) {
        console.log(`   Options: ${prop.options.length} valeurs possibles`);
        console.log(`   Exemples: ${prop.options.slice(0, 5).map(o => o.label).join(', ')}...`);
      }
      console.log('');
    });

    // Récupérer UNE company pour voir les vraies valeurs
    console.log('\n🏢 TEST - Récupération d\'une company réelle avec TOUTES les propriétés...\n');

    const testCompany = await fetchHubSpot('/crm/v3/objects/companies?limit=1&properties=' +
      industryProps.map(p => p.name).join(','));

    if (testCompany.results && testCompany.results.length > 0) {
      const company = testCompany.results[0];
      console.log(`Company: ${company.properties.name || 'Sans nom'}\n`);
      console.log('VALEURS DES CHAMPS INDUSTRY:');
      console.log('============================\n');

      industryProps.forEach(prop => {
        const value = company.properties[prop.name];
        if (value) {
          console.log(`✅ ${prop.name}: "${value}"`);
        } else {
          console.log(`⚠️  ${prop.name}: vide`);
        }
      });
    }

    console.log('\n✅ DEBUG TERMINÉ');
    console.log('\n💡 UTILISE CES INFORMATIONS POUR MODIFIER fetch-hubspot.js');

  } catch (error) {
    console.error('❌ ERREUR:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

debugProperties();
