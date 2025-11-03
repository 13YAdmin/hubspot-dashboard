/**
 * Segment Detector - Determine client segment based on data
 */

function detectSegment(companyData, notesAnalysis, healthScore) {
  const { totalRevenue, lastDealDate, yearlyRevenue } = companyData;

  // DORMANT: No activity >12 months, no recent notes, low health
  const daysSinceLastDeal = lastDealDate ? (Date.now() - lastDealDate.getTime()) / (1000 * 60 * 60 * 24) : 999999;
  const isDormant = daysSinceLastDeal > 365 && !notesAnalysis.hasRecent && healthScore < 40;

  if (isDormant) {
    return {
      segment: 'Dormant',
      color: '#95a5a6',
      priority: 4,
      reason: `Pas d'activité depuis ${Math.round(daysSinceLastDeal / 30)} mois`
    };
  }

  // AT RISK: Negative sentiment or declining revenue
  const hasNegativeTrend = (yearlyRevenue?.['2024'] || 0) < (yearlyRevenue?.['2023'] || 0);
  const isAtRisk = notesAnalysis.sentiment === 'negative' || (hasNegativeTrend && healthScore < 50);

  if (isAtRisk) {
    return {
      segment: 'À Risque',
      color: '#e74c3c',
      priority: 1,
      reason: healthScore < 50 ? 'Health score faible' : 'Sentiment négatif'
    };
  }

  // VIP: Very high revenue, good health (NEW! Top-tier segment)
  const isVIP = totalRevenue > 500000 && healthScore > 55;

  if (isVIP) {
    return {
      segment: 'VIP',
      color: '#f59e0b',
      priority: 1,
      reason: `CA ${Math.round(totalRevenue / 1000)}k€, compte stratégique majeur`
    };
  }

  // STRATEGIC: High revenue, good health (lowered threshold from 70 to 60)
  const isStrategic = totalRevenue > 100000 && healthScore > 60 && notesAnalysis.totalNotes > 10;

  if (isStrategic) {
    return {
      segment: 'Stratégique',
      color: '#9b59b6',
      priority: 1,
      reason: `CA ${Math.round(totalRevenue / 1000)}k€, excellent health`
    };
  }

  // KEY: Good revenue, good health (lowered threshold from 60 to 55)
  const isKey = totalRevenue > 50000 && healthScore > 55;

  if (isKey) {
    return {
      segment: 'Clé',
      color: '#3498db',
      priority: 2,
      reason: `CA ${Math.round(totalRevenue / 1000)}k€, relation stable`
    };
  }

  // REGULAR: Decent revenue, active
  const isRegular = totalRevenue > 10000 && healthScore > 40;

  if (isRegular) {
    return {
      segment: 'Régulier',
      color: '#2ecc71',
      priority: 3,
      reason: 'Client régulier'
    };
  }

  // DEFAULT: Prospect or small client
  return {
    segment: 'Prospect',
    color: '#f39c12',
    priority: 3,
    reason: 'Faible CA ou nouveau'
  };
}

module.exports = { detectSegment };
