/**
 * Endpoint API pour obtenir uniquement les métriques globales
 * Plus rapide que /api/deals car ne retourne pas toutes les données
 *
 * Utilisation: GET /api/metrics
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;

  if (!HUBSPOT_TOKEN) {
    return res.status(500).json({
      error: 'Configuration manquante',
      message: 'HUBSPOT_ACCESS_TOKEN non configuré'
    });
  }

  try {
    console.log('📊 Récupération des métriques HubSpot...');

    // Récupérer les deals de manière simplifiée (sans enrichissement complet)
    const deals = await fetchDealsForMetrics(HUBSPOT_TOKEN);

    // Calculer les métriques
    const metrics = calculateQuickMetrics(deals);

    return res.status(200).json({
      success: true,
      metrics: metrics,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
    return res.status(500).json({
      error: 'Erreur lors du calcul des métriques',
      message: error.message
    });
  }
}

async function fetchDealsForMetrics(token) {
  const allDeals = [];
  let after = null;
  let hasMore = true;

  while (hasMore) {
    const url = new URL('https://api.hubapi.com/crm/v3/objects/deals');
    url.searchParams.append('limit', '100');
    url.searchParams.append('properties', [
      'dealname',
      'amount',
      'closedate',
      'createdate',
      'dealstage',
      'pipeline',
      'hubspot_owner_id',
      'days_to_close',
      'hs_is_closed_won',
      'hs_analytics_source'
    ].join(','));

    if (after) url.searchParams.append('after', after);

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.results?.length > 0) {
      allDeals.push(...data.results);
    }

    hasMore = data.paging?.next;
    after = hasMore ? data.paging.next.after : null;
  }

  return allDeals;
}

function calculateQuickMetrics(deals) {
  const metrics = {
    total_deals: deals.length,
    total_revenue: 0,
    won_deals: 0,
    won_revenue: 0,
    avg_deal_size: 0,
    avg_days_to_close: 0,
    deals_by_stage: {},
    deals_by_owner: {},
    deals_by_pipeline: {},
    deals_by_source: {},
    deals_by_month: {}
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

    // Days to close
    if (props.days_to_close) {
      totalDaysToClose += parseFloat(props.days_to_close);
      dealsWithDays++;
    }

    // By stage
    const stage = props.dealstage || 'Inconnu';
    if (!metrics.deals_by_stage[stage]) {
      metrics.deals_by_stage[stage] = { count: 0, revenue: 0 };
    }
    metrics.deals_by_stage[stage].count++;
    metrics.deals_by_stage[stage].revenue += amount;

    // By owner
    const owner = props.hubspot_owner_id || 'Non assigné';
    if (!metrics.deals_by_owner[owner]) {
      metrics.deals_by_owner[owner] = { count: 0, revenue: 0 };
    }
    metrics.deals_by_owner[owner].count++;
    metrics.deals_by_owner[owner].revenue += amount;

    // By pipeline
    const pipeline = props.pipeline || 'Non défini';
    if (!metrics.deals_by_pipeline[pipeline]) {
      metrics.deals_by_pipeline[pipeline] = { count: 0, revenue: 0 };
    }
    metrics.deals_by_pipeline[pipeline].count++;
    metrics.deals_by_pipeline[pipeline].revenue += amount;

    // By source
    const source = props.hs_analytics_source || 'Direct';
    if (!metrics.deals_by_source[source]) {
      metrics.deals_by_source[source] = { count: 0, revenue: 0 };
    }
    metrics.deals_by_source[source].count++;
    metrics.deals_by_source[source].revenue += amount;

    // By month (close date)
    if (props.closedate) {
      const month = props.closedate.substring(0, 7); // YYYY-MM
      if (!metrics.deals_by_month[month]) {
        metrics.deals_by_month[month] = { count: 0, revenue: 0 };
      }
      metrics.deals_by_month[month].count++;
      metrics.deals_by_month[month].revenue += amount;
    }
  });

  metrics.avg_deal_size = metrics.total_deals > 0 ? metrics.total_revenue / metrics.total_deals : 0;
  metrics.avg_days_to_close = dealsWithDays > 0 ? totalDaysToClose / dealsWithDays : 0;
  metrics.win_rate = metrics.total_deals > 0 ? (metrics.won_deals / metrics.total_deals) * 100 : 0;

  return metrics;
}
