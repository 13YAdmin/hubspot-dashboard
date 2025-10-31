/**
 * Health Score Calculator - Calculate 0-100 health score with Revenue Trend
 *
 * Score = Base (15) + Notes (25) + Engagement (25) + Revenue Base (15) + Revenue Trend (20)
 */

function calculateHealthScore(companyData, notesAnalysis, engagement) {
  try {
    let score = 15; // Base 15

    // 1. Notes (25 points max)
    if (notesAnalysis.totalNotes > 0) {
      // Quantity
      if (notesAnalysis.totalNotes >= 15) score += 12;
      else if (notesAnalysis.totalNotes >= 10) score += 8;
      else if (notesAnalysis.totalNotes >= 5) score += 5;
      else score += 2;

      // Quality
      if (notesAnalysis.avgLength > 250) score += 5;
      else if (notesAnalysis.avgLength > 120) score += 3;
      else if (notesAnalysis.avgLength > 50) score += 1;

      // Recency
      if (notesAnalysis.hasRecent) score += 4;
      else score -= 3;

      // Sentiment
      if (notesAnalysis.sentiment === 'positive') score += 4;
      else if (notesAnalysis.sentiment === 'negative') score -= 8;
    } else {
      score -= 10;
    }

    // 2. Engagement (25 points max)
    const totalEmails = engagement.emails || 0;
    const totalCalls = engagement.calls || 0;
    const totalMeetings = engagement.meetings || 0;

    // Emails
    if (totalEmails >= 15) score += 7;
    else if (totalEmails >= 8) score += 4;
    else if (totalEmails >= 3) score += 2;

    // Calls
    if (totalCalls >= 8) score += 9;
    else if (totalCalls >= 4) score += 6;
    else if (totalCalls >= 1) score += 2;

    // Meetings
    if (totalMeetings >= 4) score += 9;
    else if (totalMeetings >= 2) score += 6;
    else if (totalMeetings >= 1) score += 2;

    // 3. Revenue Base (15 points max) - Static revenue
    const revenue = companyData.totalRevenue || 0;
    if (revenue >= 1000000) score += 15;
    else if (revenue >= 500000) score += 12;
    else if (revenue >= 200000) score += 9;
    else if (revenue >= 100000) score += 6;
    else if (revenue >= 50000) score += 3;

    // 4. Revenue Trend (20 points max) - NEW! Dynamic temporal analysis
    const trendScore = calculateRevenueTrend(companyData);
    score += trendScore;

    return Math.max(0, Math.min(100, Math.round(score)));
  } catch (error) {
    console.error('Error calculating health score:', error.message);
    return 0;
  }
}

/**
 * Calculate Revenue Trend Score (0-20 points)
 *
 * Analyzes CA growth/decline over years to reward growing clients
 * and penalize declining ones.
 */
function calculateRevenueTrend(companyData) {
  try {
    const yearlyRevenue = companyData.yearlyRevenue || {};

    // Get years with revenue
    const years = Object.keys(yearlyRevenue)
      .map(y => parseInt(y))
      .filter(y => yearlyRevenue[y] > 0)
      .sort();

    if (years.length < 2) {
      // Not enough data for trend, use current year performance
      const currentYear = new Date().getFullYear();
      const current = yearlyRevenue[currentYear] || 0;

      if (current >= 500000) return 15;
      if (current >= 200000) return 10;
      if (current >= 100000) return 5;
      return 0;
    }

    // Calculate trend: (last year - first year) / first year * 100
    const firstYear = years[0];
    const lastYear = years[years.length - 1];
    const firstRevenue = yearlyRevenue[firstYear];
    const lastRevenue = yearlyRevenue[lastYear];

    const trendPercent = ((lastRevenue - firstRevenue) / firstRevenue) * 100;

    // Score based on trend
    let trendScore = 0;

    // Exceptional growth (>200%)
    if (trendPercent > 200) trendScore = 20;
    // Strong growth (100-200%)
    else if (trendPercent > 100) trendScore = 18;
    // Good growth (50-100%)
    else if (trendPercent > 50) trendScore = 15;
    // Moderate growth (20-50%)
    else if (trendPercent > 20) trendScore = 12;
    // Slight growth (0-20%)
    else if (trendPercent > 0) trendScore = 8;
    // Stable (-10 to 0%)
    else if (trendPercent > -10) trendScore = 5;
    // Slight decline (-10 to -30%)
    else if (trendPercent > -30) trendScore = 0;
    // Moderate decline (-30 to -50%)
    else if (trendPercent > -50) trendScore = -5;
    // Strong decline (-50 to -70%)
    else if (trendPercent > -70) trendScore = -10;
    // Critical decline (<-70%)
    else trendScore = -15;

    // Bonus for strong recent performance (current year)
    const currentYear = new Date().getFullYear();
    const currentRevenue = yearlyRevenue[currentYear] || 0;
    const avgPastRevenue = years
      .filter(y => y < currentYear)
      .reduce((sum, y) => sum + yearlyRevenue[y], 0) / Math.max(1, years.filter(y => y < currentYear).length);

    if (currentRevenue > avgPastRevenue * 1.5) {
      trendScore += 3; // Bonus for strong current year
    }

    return Math.max(-15, Math.min(20, trendScore));
  } catch (error) {
    console.error('Error calculating revenue trend:', error.message);
    return 0;
  }
}

module.exports = { calculateHealthScore };
