/**
 * Vercel Serverless Function pour récupérer les deals HubSpot
 *
 * Endpoint: /api/deals
 * Méthode: GET
 *
 * Cette fonction récupère tous les deals "Fermé gagné" de HubSpot
 * et les transforme au format CSV attendu par le dashboard.
 */

export default async function handler(req, res) {
  // Configuration CORS pour permettre les appels depuis le frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Gérer les requêtes OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Vérifier que le token HubSpot est configuré
  const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!HUBSPOT_TOKEN) {
    return res.status(500).json({
      error: 'Configuration manquante',
      message: 'HUBSPOT_ACCESS_TOKEN non configuré dans les variables d\'environnement'
    });
  }

  try {
    // Récupérer tous les deals avec pagination
    const allDeals = [];
    let after = null;
    let hasMore = true;

    console.log('🔄 Récupération des deals HubSpot...');

    while (hasMore) {
      const url = new URL('https://api.hubapi.com/crm/v3/objects/deals');
      url.searchParams.append('limit', '100'); // Max par page
      url.searchParams.append('properties', [
        'dealname',
        'amount',
        'closedate',
        'dealstage',
        'pipeline',
        'hs_object_id',
        'associations'
      ].join(','));

      if (after) {
        url.searchParams.append('after', after);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('❌ Erreur HubSpot API:', error);
        throw new Error(`HubSpot API error: ${response.status} - ${error}`);
      }

      const data = await response.json();

      if (data.results && data.results.length > 0) {
        allDeals.push(...data.results);
        console.log(`✅ ${allDeals.length} deals récupérés...`);
      }

      // Vérifier s'il y a d'autres pages
      hasMore = data.paging && data.paging.next;
      after = hasMore ? data.paging.next.after : null;
    }

    console.log(`✅ Total: ${allDeals.length} deals récupérés`);

    // Récupérer les associations (entreprises) pour chaque deal
    // On fait une requête batch pour optimiser
    const dealsWithCompanies = await enrichDealsWithCompanies(allDeals, HUBSPOT_TOKEN);

    // Transformer les données au format CSV attendu
    const csvData = transformToCSVFormat(dealsWithCompanies);

    // Retourner les données
    return res.status(200).json({
      success: true,
      count: csvData.length,
      data: csvData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    return res.status(500).json({
      error: 'Erreur lors de la récupération des deals',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Enrichir les deals avec les informations d'entreprise
 */
async function enrichDealsWithCompanies(deals, token) {
  console.log('🔄 Enrichissement avec les entreprises...');

  const enrichedDeals = [];

  // Récupérer les associations pour chaque deal
  for (const deal of deals) {
    const dealId = deal.id;

    try {
      // Récupérer les entreprises associées
      const assocUrl = `https://api.hubapi.com/crm/v4/objects/deals/${dealId}/associations/companies`;
      const assocResponse = await fetch(assocUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (assocResponse.ok) {
        const assocData = await assocResponse.json();

        if (assocData.results && assocData.results.length > 0) {
          // Récupérer le nom de la première entreprise associée
          const companyId = assocData.results[0].toObjectId;

          const companyUrl = `https://api.hubapi.com/crm/v3/objects/companies/${companyId}?properties=name`;
          const companyResponse = await fetch(companyUrl, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (companyResponse.ok) {
            const companyData = await companyResponse.json();
            deal.companyName = companyData.properties.name || 'Inconnu';
          } else {
            deal.companyName = 'Inconnu';
          }
        } else {
          deal.companyName = 'Inconnu';
        }
      } else {
        deal.companyName = 'Inconnu';
      }

      enrichedDeals.push(deal);

    } catch (error) {
      console.error(`Erreur pour deal ${dealId}:`, error.message);
      deal.companyName = 'Inconnu';
      enrichedDeals.push(deal);
    }
  }

  console.log(`✅ ${enrichedDeals.length} deals enrichis`);
  return enrichedDeals;
}

/**
 * Transformer les données HubSpot au format CSV attendu par le dashboard
 */
function transformToCSVFormat(deals) {
  return deals.map(deal => {
    const props = deal.properties;

    return {
      'Phase de la transaction': props.dealstage || '',
      'Montant': props.amount || '0',
      'Pipeline': props.pipeline || 'Non défini',
      'Associated Company (Primary)': deal.companyName || 'Inconnu',
      'Date de fermeture': props.closedate || '',
      'Propriétaire de la transaction': props.hubspot_owner_id || '',
      'Nom de la transaction': props.dealname || ''
    };
  });
}
