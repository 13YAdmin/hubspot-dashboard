/**
 * Health Score Calculator - Calculate 0-100 health score
 */

function calculateHealthScore(companyData, notesAnalysis, engagement) {
  let score = 50;

  // 1. Notes (40 points max)
  if (notesAnalysis.totalNotes > 0) {
    score += Math.min(notesAnalysis.totalNotes * 2, 20);
    if (notesAnalysis.avgLength > 200) score += 10;
    else if (notesAnalysis.avgLength > 100) score += 5;
    if (notesAnalysis.hasRecent) score += 10;
    if (notesAnalysis.sentiment === 'positive') score += 15;
    else if (notesAnalysis.sentiment === 'negative') score -= 15;
  } else {
    score -= 20;
  }

  // 2. Engagement (30 points max)
  score += Math.min(engagement.emails * 0.5, 10);
  score += Math.min(engagement.calls * 2, 10);
  score += Math.min(engagement.meetings * 3, 10);

  // 3. Keywords (10 points max)
  if (notesAnalysis.keywords.action > 5) score += 5;
  if (notesAnalysis.keywords.meeting > 3) score += 5;

  // 4. Revenue (20 points max)
  const revenue = companyData.totalRevenue || 0;
  if (revenue > 100000) score += 20;
  else if (revenue > 50000) score += 15;
  else if (revenue > 20000) score += 10;
  else if (revenue > 10000) score += 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

module.exports = { calculateHealthScore };
