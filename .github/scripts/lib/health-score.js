/**
 * Health Score Calculator - Calculate 0-100 health score (VERSION ÉQUILIBRÉE)
 */

function calculateHealthScore(companyData, notesAnalysis, engagement) {
  let score = 20; // Base 20 - petit bonus de départ

  // 1. Notes (35 points max) - ÉQUILIBRÉ
  if (notesAnalysis.totalNotes > 0) {
    // Récompense progressive pour les notes
    if (notesAnalysis.totalNotes >= 15) score += 18;
    else if (notesAnalysis.totalNotes >= 10) score += 12;
    else if (notesAnalysis.totalNotes >= 5) score += 7;
    else score += 3; // Au moins quelques points pour effort

    // Qualité des notes
    if (notesAnalysis.avgLength > 250) score += 7;
    else if (notesAnalysis.avgLength > 120) score += 4;
    else if (notesAnalysis.avgLength > 50) score += 1;

    // Récence importante mais pas bloquante
    if (notesAnalysis.hasRecent) score += 5;
    else score -= 5; // Pénalité modérée

    // Sentiment avec impact mesuré
    if (notesAnalysis.sentiment === 'positive') score += 5;
    else if (notesAnalysis.sentiment === 'negative') score -= 10; // Pénalité moyenne
  } else {
    score -= 15; // Pénalité modérée si aucune note
  }

  // 2. Engagement (30 points max) - ÉQUILIBRÉ
  const totalEmails = engagement.emails || 0;
  const totalCalls = engagement.calls || 0;
  const totalMeetings = engagement.meetings || 0;

  // Emails - seuils accessibles
  if (totalEmails >= 15) score += 8;
  else if (totalEmails >= 8) score += 5;
  else if (totalEmails >= 3) score += 2;

  // Calls - seuils raisonnables
  if (totalCalls >= 8) score += 11;
  else if (totalCalls >= 4) score += 7;
  else if (totalCalls >= 1) score += 3;

  // Meetings - très important mais pas punitif
  if (totalMeetings >= 4) score += 11;
  else if (totalMeetings >= 2) score += 7;
  else if (totalMeetings >= 1) score += 3;
  // Pas de pénalité si aucun meeting

  // 3. Keywords (10 points max) - ÉQUILIBRÉ
  if (notesAnalysis.keywords.action >= 8) score += 5;
  else if (notesAnalysis.keywords.action >= 4) score += 3;
  else if (notesAnalysis.keywords.action >= 1) score += 1;

  if (notesAnalysis.keywords.meeting >= 4) score += 5;
  else if (notesAnalysis.keywords.meeting >= 2) score += 3;
  else if (notesAnalysis.keywords.meeting >= 1) score += 1;

  // 4. Revenue (25 points max) - ÉQUILIBRÉ
  const revenue = companyData.totalRevenue || 0;
  if (revenue >= 150000) score += 25;
  else if (revenue >= 75000) score += 18;
  else if (revenue >= 40000) score += 12;
  else if (revenue >= 20000) score += 6;
  else if (revenue >= 10000) score += 3;
  // Pas de pénalité pour CA faible

  return Math.max(0, Math.min(100, Math.round(score)));
}

module.exports = { calculateHealthScore };
