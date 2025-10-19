/**
 * Health Score Calculator - Calculate 0-100 health score (VERSION SÉVÈRE)
 */

function calculateHealthScore(companyData, notesAnalysis, engagement) {
  let score = 0; // Base à 0, pas de cadeau

  // 1. Notes (35 points max) - SÉVÈRE
  if (notesAnalysis.totalNotes > 0) {
    // Faut BEAUCOUP de notes pour des points
    if (notesAnalysis.totalNotes >= 20) score += 15;
    else if (notesAnalysis.totalNotes >= 10) score += 8;
    else if (notesAnalysis.totalNotes >= 5) score += 4;
    else score += 1; // Très peu si moins de 5 notes

    // Qualité
    if (notesAnalysis.avgLength > 300) score += 8;
    else if (notesAnalysis.avgLength > 150) score += 3;

    // Récence - OBLIGATOIRE pour points
    if (notesAnalysis.hasRecent) score += 7;
    else score -= 10; // Pénalité si pas de note récente

    // Sentiment - impact fort
    if (notesAnalysis.sentiment === 'positive') score += 5;
    else if (notesAnalysis.sentiment === 'negative') score -= 20; // Grosse pénalité
  } else {
    score -= 25; // Grosse pénalité si aucune note
  }

  // 2. Engagement (30 points max) - SÉVÈRE
  const totalEmails = engagement.emails || 0;
  const totalCalls = engagement.calls || 0;
  const totalMeetings = engagement.meetings || 0;

  // Il faut VRAIMENT de l'engagement
  if (totalEmails >= 20) score += 6;
  else if (totalEmails >= 10) score += 3;
  else if (totalEmails >= 5) score += 1;

  if (totalCalls >= 10) score += 10;
  else if (totalCalls >= 5) score += 5;
  else if (totalCalls >= 2) score += 2;

  if (totalMeetings >= 5) score += 14;
  else if (totalMeetings >= 3) score += 8;
  else if (totalMeetings >= 1) score += 3;
  else score -= 5; // Pénalité si aucun meeting

  // 3. Keywords (10 points max) - SÉVÈRE
  if (notesAnalysis.keywords.action >= 10) score += 5;
  else if (notesAnalysis.keywords.action >= 5) score += 2;

  if (notesAnalysis.keywords.meeting >= 5) score += 5;
  else if (notesAnalysis.keywords.meeting >= 3) score += 2;

  // 4. Revenue (25 points max) - TRÈS SÉVÈRE
  const revenue = companyData.totalRevenue || 0;
  if (revenue >= 200000) score += 25;
  else if (revenue >= 100000) score += 18;
  else if (revenue >= 50000) score += 12;
  else if (revenue >= 20000) score += 6;
  else if (revenue >= 10000) score += 2;
  else score -= 5; // Pénalité si CA trop faible

  return Math.max(0, Math.min(100, Math.round(score)));
}

module.exports = { calculateHealthScore };
