/**
 * Vercel Serverless Function pour récupérer les deals HubSpot - VERSION ENRICHIE
 *
 * Endpoint: /api/deals
 * Méthode: GET
 *
 * Cette fonction récupère tous les deals de HubSpot avec enrichissement complet :
 * - Deals avec toutes les propriétés
 * - Entreprises associées (avec détails)
 * - Contacts associés (décideurs)
 * - Owners (Account Managers)
 * - Métriques d'engagement
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
    console.log('🚀 Démarrage de la récupération enrichie des données HubSpot...');

    // 1. Récupérer tous les owners (Account Managers) en premier
    const owners = await fetchOwners(HUBSPOT_TOKEN);
    console.log(`✅ ${owners.length} owners récupérés`);

    // 2. Récupérer tous les deals avec pagination et propriétés étendues
    const allDeals = await fetchAllDeals(HUBSPOT_TOKEN);
    console.log(`✅ Total: ${allDeals.length} deals récupérés`);

    // 3. Enrichir avec les associations (entreprises, contacts)
    const enrichedDeals = await enrichDealsWithAssociations(allDeals, HUBSPOT_TOKEN, owners);

    // 4. Transformer les données au format attendu par le dashboard
    const csvData = transformToCSVFormat(enrichedDeals);

    // 5. Calculer des métriques globales
    const metrics = calculateMetrics(enrichedDeals);

    // Retourner les données enrichies
    return res.status(200).json({
      success: true,
      count: csvData.length,
      data: csvData,
      metrics: metrics,
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
 * Récupérer tous les owners (Account Managers)
 */
async function fetchOwners(token) {
  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/owners/', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn('⚠️ Impossible de récupérer les owners');
      return [];
    }

    const data = await response.json();

    // Créer un map id -> owner pour lookup rapide
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

    return ownerMap;
  } catch (error) {
    console.warn('⚠️ Erreur lors de la récupération des owners:', error.message);
    return {};
  }
}

/**
 * Récupérer tous les deals avec pagination
 */
async function fetchAllDeals(token) {
  const allDeals = [];
  let after = null;
  let hasMore = true;

  console.log('🔄 Récupération des deals HubSpot...');

  while (hasMore) {
    const url = new URL('https://api.hubapi.com/crm/v3/objects/deals');
    url.searchParams.append('limit', '100');

    // Propriétés étendues pour analyse complète
    url.searchParams.append('properties', [
      'dealname',
      'amount',
      'closedate',
      'createdate',
      'dealstage',
      'pipeline',
      'hs_object_id',
      'hubspot_owner_id',
      'dealtype',
      'hs_deal_stage_probability',
      'hs_lastmodifieddate',
      'hs_createdate',
      'num_contacted_notes',
      'num_associated_contacts',
      'hs_analytics_source',
      'hs_deal_amount_calculation_preference',
      'days_to_close',
      'hs_is_closed',
      'hs_is_closed_won'
    ].join(','));

    if (after) {
      url.searchParams.append('after', after);
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
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
      console.log(`📊 ${allDeals.length} deals récupérés...`);
    }

    // Vérifier s'il y a d'autres pages
    hasMore = data.paging && data.paging.next;
    after = hasMore ? data.paging.next.after : null;
  }

  return allDeals;
}

/**
 * Enrichir les deals avec toutes les associations (entreprises, contacts)
 */
async function enrichDealsWithAssociations(deals, token, owners) {
  console.log('🔄 Enrichissement avec entreprises et contacts...');

  const enrichedDeals = [];

  for (const deal of deals) {
    const dealId = deal.id;

    try {
      // Récupérer les associations en parallèle (optimisation)
      const [companyData, contactsData] = await Promise.all([
        fetchDealCompany(dealId, token),
        fetchDealContacts(dealId, token)
      ]);

      // Enrichir le deal
      deal.enriched = {
        company: companyData,
        contacts: contactsData,
        owner: owners[deal.properties.hubspot_owner_id] || null
      };

      enrichedDeals.push(deal);

    } catch (error) {
      console.error(`⚠️ Erreur pour deal ${dealId}:`, error.message);
      deal.enriched = {
        company: null,
        contacts: [],
        owner: null
      };
      enrichedDeals.push(deal);
    }
  }

  console.log(`✅ ${enrichedDeals.length} deals enrichis`);
  return enrichedDeals;
}

/**
 * Récupérer l'entreprise associée à un deal
 */
async function fetchDealCompany(dealId, token) {
  try {
    // Récupérer l'association
    const assocUrl = `https://api.hubapi.com/crm/v4/objects/deals/${dealId}/associations/companies`;
    const assocResponse = await fetch(assocUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!assocResponse.ok) return null;

    const assocData = await assocResponse.json();

    if (!assocData.results || assocData.results.length === 0) return null;

    // Récupérer les détails de l'entreprise
    const companyId = assocData.results[0].toObjectId;
    const companyUrl = `https://api.hubapi.com/crm/v3/objects/companies/${companyId}?properties=name,domain,industry,city,country,numberofemployees,annualrevenue,lifecyclestage`;

    const companyResponse = await fetch(companyUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!companyResponse.ok) return null;

    const companyData = await companyResponse.json();
    return {
      id: companyData.id,
      name: companyData.properties.name || 'Inconnu',
      domain: companyData.properties.domain || '',
      industry: companyData.properties.industry || '',
      city: companyData.properties.city || '',
      country: companyData.properties.country || '',
      employees: companyData.properties.numberofemployees || '',
      revenue: companyData.properties.annualrevenue || '',
      stage: companyData.properties.lifecyclestage || ''
    };

  } catch (error) {
    console.error(`Erreur company pour deal ${dealId}:`, error.message);
    return null;
  }
}

/**
 * Récupérer les contacts associés à un deal
 */
async function fetchDealContacts(dealId, token) {
  try {
    // Récupérer les associations
    const assocUrl = `https://api.hubapi.com/crm/v4/objects/deals/${dealId}/associations/contacts`;
    const assocResponse = await fetch(assocUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!assocResponse.ok) return [];

    const assocData = await assocResponse.json();

    if (!assocData.results || assocData.results.length === 0) return [];

    // Récupérer les détails de chaque contact (limité à 5 pour performance)
    const contactIds = assocData.results.slice(0, 5).map(r => r.toObjectId);
    const contacts = [];

    for (const contactId of contactIds) {
      try {
        const contactUrl = `https://api.hubapi.com/crm/v3/objects/contacts/${contactId}?properties=firstname,lastname,email,jobtitle,phone`;
        const contactResponse = await fetch(contactUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (contactResponse.ok) {
          const contactData = await contactResponse.json();
          contacts.push({
            id: contactData.id,
            firstName: contactData.properties.firstname || '',
            lastName: contactData.properties.lastname || '',
            email: contactData.properties.email || '',
            jobTitle: contactData.properties.jobtitle || '',
            phone: contactData.properties.phone || '',
            fullName: `${contactData.properties.firstname || ''} ${contactData.properties.lastname || ''}`.trim()
          });
        }
      } catch (err) {
        console.warn(`Erreur contact ${contactId}:`, err.message);
      }
    }

    return contacts;

  } catch (error) {
    console.error(`Erreur contacts pour deal ${dealId}:`, error.message);
    return [];
  }
}

/**
 * Transformer les données HubSpot au format CSV enrichi
 */
function transformToCSVFormat(deals) {
  return deals.map(deal => {
    const props = deal.properties;
    const enriched = deal.enriched || {};

    return {
      // Colonnes originales (compatibilité)
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
      'Nombre de contacts': props.num_associated_contacts || '0',
      'Nombre de notes': props.num_contacted_notes || '0',
      'Source': props.hs_analytics_source || '',

      // Entreprise (détails)
      'Entreprise - Domaine': enriched.company?.domain || '',
      'Entreprise - Industrie': enriched.company?.industry || '',
      'Entreprise - Ville': enriched.company?.city || '',
      'Entreprise - Pays': enriched.company?.country || '',
      'Entreprise - Employés': enriched.company?.employees || '',
      'Entreprise - CA Annuel': enriched.company?.revenue || '',

      // Contact principal (premier contact)
      'Contact - Nom': enriched.contacts?.[0]?.fullName || '',
      'Contact - Email': enriched.contacts?.[0]?.email || '',
      'Contact - Titre': enriched.contacts?.[0]?.jobTitle || '',
      'Contact - Téléphone': enriched.contacts?.[0]?.phone || '',

      // Account Manager
      'AM - Nom': enriched.owner?.fullName || '',
      'AM - Email': enriched.owner?.email || ''
    };
  });
}

/**
 * Calculer des métriques globales
 */
function calculateMetrics(deals) {
  const metrics = {
    total_deals: deals.length,
    total_revenue: 0,
    won_deals: 0,
    won_revenue: 0,
    avg_deal_size: 0,
    avg_days_to_close: 0,
    companies_count: new Set(),
    contacts_count: 0,
    deals_by_owner: {},
    deals_by_pipeline: {},
    deals_by_source: {}
  };

  let totalDaysToClose = 0;
  let dealsWithDays = 0;

  deals.forEach(deal => {
    const props = deal.properties;
    const amount = parseFloat(props.amount || 0);

    metrics.total_revenue += amount;

    // Won deals
    if (props.hs_is_closed_won === 'true' || props.dealstage === 'Fermé gagné') {
      metrics.won_deals++;
      metrics.won_revenue += amount;
    }

    // Companies
    if (deal.enriched?.company?.id) {
      metrics.companies_count.add(deal.enriched.company.id);
    }

    // Contacts
    metrics.contacts_count += deal.enriched?.contacts?.length || 0;

    // Days to close
    if (props.days_to_close) {
      totalDaysToClose += parseFloat(props.days_to_close);
      dealsWithDays++;
    }

    // By owner
    const ownerId = props.hubspot_owner_id || 'Inconnu';
    metrics.deals_by_owner[ownerId] = (metrics.deals_by_owner[ownerId] || 0) + 1;

    // By pipeline
    const pipeline = props.pipeline || 'Non défini';
    metrics.deals_by_pipeline[pipeline] = (metrics.deals_by_pipeline[pipeline] || 0) + 1;

    // By source
    const source = props.hs_analytics_source || 'Inconnu';
    metrics.deals_by_source[source] = (metrics.deals_by_source[source] || 0) + 1;
  });

  metrics.avg_deal_size = metrics.total_deals > 0 ? metrics.total_revenue / metrics.total_deals : 0;
  metrics.avg_days_to_close = dealsWithDays > 0 ? totalDaysToClose / dealsWithDays : 0;
  metrics.companies_count = metrics.companies_count.size;

  return metrics;
}
