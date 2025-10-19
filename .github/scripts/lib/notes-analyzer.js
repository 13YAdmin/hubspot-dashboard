/**
 * Notes Analyzer - Analyze notes content for sentiment and insights
 */

function analyzeNotes(notes) {
  const analysis = {
    totalNotes: notes.length,
    totalChars: 0,
    avgLength: 0,
    hasRecent: false,
    sentiment: 'neutral',
    keywords: { positive: 0, negative: 0, action: 0, meeting: 0 },
    latestNote: null
  };

  if (notes.length === 0) return analysis;

  const positiveWords = ['excellent', 'satisfait', 'content', 'positif', 'bon', 'super', 'génial', 'parfait', 'réussi', 'succès', 'happy', 'great', 'good', 'success'];
  const negativeWords = ['problème', 'insatisfait', 'mécontent', 'négatif', 'mauvais', 'échec', 'annulé', 'retard', 'issue', 'problem', 'bad', 'cancel', 'delay'];
  const actionWords = ['rdv', 'meeting', 'appel', 'call', 'réunion', 'présentation', 'démo', 'proposition', 'contrat', 'signature'];

  notes.forEach(note => {
    const body = note.body.toLowerCase();
    analysis.totalChars += body.length;

    positiveWords.forEach(word => { if (body.includes(word)) analysis.keywords.positive++; });
    negativeWords.forEach(word => { if (body.includes(word)) analysis.keywords.negative++; });
    actionWords.forEach(word => { if (body.includes(word)) analysis.keywords.action++; });
    if (body.includes('meeting') || body.includes('réunion') || body.includes('rdv')) {
      analysis.keywords.meeting++;
    }
  });

  analysis.avgLength = Math.round(analysis.totalChars / notes.length);

  if (analysis.keywords.positive > analysis.keywords.negative * 2) {
    analysis.sentiment = 'positive';
  } else if (analysis.keywords.negative > analysis.keywords.positive * 2) {
    analysis.sentiment = 'negative';
  }

  const sortedByDate = notes.filter(n => n.timestamp).sort((a, b) => {
    return new Date(b.timestamp) - new Date(a.timestamp);
  });

  if (sortedByDate.length > 0) {
    analysis.latestNote = sortedByDate[0];
    const daysSinceLatest = (Date.now() - new Date(sortedByDate[0].timestamp).getTime()) / (1000 * 60 * 60 * 24);
    analysis.hasRecent = daysSinceLatest < 90;
  }

  return analysis;
}

module.exports = { analyzeNotes };
