/**
 * Notes Analyzer - Analyze notes content for sentiment and insights
 * Version améliorée avec pondération temporelle et mots-clés négatifs forts
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

  // Mots positifs
  const positiveWords = [
    'excellent', 'satisfait', 'content', 'positif', 'bon', 'super', 'génial', 'parfait',
    'réussi', 'succès', 'happy', 'great', 'good', 'success', 'intéressé', 'enthousiaste',
    'prometteur', 'opportunité', 'avancée', 'progrès', 'signature', 'accord'
  ];

  // Mots négatifs - AMÉLIORÉ avec mots forts
  const negativeWords = [
    'problème', 'insatisfait', 'mécontent', 'négatif', 'mauvais', 'échec', 'annulé', 'retard',
    'issue', 'problem', 'bad', 'cancel', 'delay', 'refus', 'rejected', 'perdu', 'lost'
  ];

  // NOUVEAU: Mots négatifs FORTS (poids x3) - Relations dormantes/inexistantes
  const criticalNegativeWords = [
    'inexistant', 'inexistante', 'dormant', 'dormante', 'inactif', 'inactive',
    'plus de contact', 'aucun contact', 'aucune réponse', 'ne répond plus',
    'arrêté', 'arrêtée', 'terminé', 'terminée', 'fin de relation', 'fin du contrat',
    'perdu le client', 'client perdu', 'churn', 'désengagement', 'désengagé',
    'plus de nouvelles', 'sans nouvelles', 'ghosting', 'rupture', 'relation morte'
  ];

  const actionWords = [
    'rdv', 'meeting', 'appel', 'call', 'réunion', 'présentation', 'démo',
    'proposition', 'contrat', 'signature'
  ];

  let positiveScore = 0;
  let negativeScore = 0;

  notes.forEach(note => {
    const body = note.body.toLowerCase();
    analysis.totalChars += body.length;

    // Calculer l'âge de la note (pour pondération temporelle)
    const noteAge = note.timestamp ? (Date.now() - new Date(note.timestamp).getTime()) / (1000 * 60 * 60 * 24) : 365;

    // Pondération: notes récentes (< 90 jours) ont poids x2, notes anciennes (> 365 jours) ont poids x0.5
    let timeWeight = 1;
    if (noteAge < 90) {
      timeWeight = 2; // Notes récentes comptent double
    } else if (noteAge > 365) {
      timeWeight = 0.5; // Notes anciennes comptent moitié
    }

    // Compter mots positifs
    positiveWords.forEach(word => {
      if (body.includes(word)) {
        analysis.keywords.positive++;
        positiveScore += (1 * timeWeight);
      }
    });

    // Compter mots négatifs normaux
    negativeWords.forEach(word => {
      if (body.includes(word)) {
        analysis.keywords.negative++;
        negativeScore += (1 * timeWeight);
      }
    });

    // Compter mots négatifs CRITIQUES (poids x3)
    criticalNegativeWords.forEach(word => {
      if (body.includes(word)) {
        analysis.keywords.negative += 3; // Compter comme 3 mots négatifs
        negativeScore += (3 * timeWeight); // Triple poids + pondération temporelle
      }
    });

    // Actions
    actionWords.forEach(word => {
      if (body.includes(word)) analysis.keywords.action++;
    });

    if (body.includes('meeting') || body.includes('réunion') || body.includes('rdv')) {
      analysis.keywords.meeting++;
    }
  });

  analysis.avgLength = Math.round(analysis.totalChars / notes.length);

  // Calcul du sentiment basé sur le score pondéré
  const sentimentRatio = positiveScore > 0 ? negativeScore / positiveScore : (negativeScore > 0 ? 999 : 0);

  if (negativeScore > positiveScore * 1.5) {
    // Plus de négatif que de positif (ratio > 1.5) → NÉGATIF
    analysis.sentiment = 'negative';
  } else if (positiveScore > negativeScore * 1.5) {
    // Plus de positif que de négatif (ratio > 1.5) → POSITIF
    analysis.sentiment = 'positive';
  } else {
    // Entre les deux → NEUTRE
    analysis.sentiment = 'neutral';
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
