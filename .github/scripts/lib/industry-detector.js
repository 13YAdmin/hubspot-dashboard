/**
 * DÉTECTION INTELLIGENTE DU SECTEUR D'ACTIVITÉ
 *
 * Analyse le nom de l'entreprise et le domaine pour détecter automatiquement
 * le secteur d'activité quand les données HubSpot sont manquantes.
 */

// Base de keywords par secteur (EN + FR)
const INDUSTRY_KEYWORDS = {
  // Tech & IT
  'Computer Software': [
    'software', 'logiciel', 'tech', 'digital', 'cloud', 'saas', 'platform',
    'data', 'analytics', 'intelligence', 'ai', 'ml', 'app', 'web', 'mobile',
    'dev', 'code', 'programming', 'solutions', 'systems', 'informatique'
  ],
  'IT Services and IT Consulting': [
    'consulting', 'conseil', 'services', 'integration', 'support', 'managed',
    'msp', 'infrastructure', 'network', 'helpdesk', 'it', 'technology'
  ],
  'Internet': [
    'internet', 'web', 'online', 'digital', 'e-commerce', 'ecommerce',
    'marketplace', 'platform', 'portal', 'website'
  ],
  'Computer & Network Security': [
    'security', 'securite', 'cyber', 'firewall', 'antivirus', 'protection',
    'defense', 'soc', 'pentest', 'vulnerability', 'compliance', 'encryption'
  ],

  // Finance
  'Financial Services': [
    'financial', 'finance', 'financier', 'bank', 'banque', 'asset', 'wealth',
    'investment', 'investissement', 'capital', 'fund', 'fonds', 'gestion'
  ],
  'Banking': [
    'bank', 'banque', 'banking', 'bancaire', 'credit', 'savings', 'loan',
    'mortgage', 'deposit'
  ],
  'Insurance': [
    'insurance', 'assurance', 'assureur', 'mutuelle', 'coverage', 'policy',
    'claim', 'underwriting', 'reinsurance'
  ],
  'Venture Capital & Private Equity': [
    'venture', 'capital', 'equity', 'vc', 'pe', 'investment', 'fund',
    'portfolio', 'startup', 'investor'
  ],
  'Accounting': [
    'accounting', 'comptable', 'audit', 'tax', 'fiscal', 'cpa', 'bookkeeping',
    'financial reporting', 'expertise comptable'
  ],

  // Luxe & Mode
  'Luxury Goods & Jewelry': [
    'luxury', 'luxe', 'jewelry', 'bijoux', 'jewellery', 'watches', 'montres',
    'haute', 'premium', 'prestige', 'exclusive', 'maison', 'couture'
  ],
  'Apparel & Fashion': [
    'fashion', 'mode', 'apparel', 'clothing', 'textile', 'vetement',
    'wear', 'garment', 'boutique', 'collection', 'pret-a-porter'
  ],
  'Cosmetics': [
    'cosmetics', 'cosmetique', 'beauty', 'beaute', 'makeup', 'skincare',
    'parfum', 'perfume', 'fragrance', 'soins'
  ],

  // Santé
  'Hospital & Health Care': [
    'hospital', 'hopital', 'clinic', 'clinique', 'health', 'sante',
    'medical', 'healthcare', 'care', 'patient', 'surgery', 'treatment'
  ],
  'Medical Devices': [
    'medical device', 'dispositif medical', 'equipment', 'diagnostic',
    'implant', 'instrument', 'surgical'
  ],
  'Pharmaceuticals': [
    'pharmaceutical', 'pharma', 'drug', 'medicament', 'medicine', 'biotech',
    'laboratory', 'laboratoire', 'research', 'clinical'
  ],
  'Biotechnology': [
    'biotech', 'biotechnology', 'bio', 'genetic', 'genomic', 'life sciences',
    'molecular', 'cell', 'therapy'
  ],

  // Manufacturing & Industrial
  'Manufacturing': [
    'manufacturing', 'fabrication', 'production', 'factory', 'usine',
    'industrial', 'industrie', 'plant', 'assembly', 'maker'
  ],
  'Automotive': [
    'automotive', 'automobile', 'auto', 'car', 'vehicle', 'vehicule',
    'motor', 'transport', 'mobility'
  ],
  'Machinery': [
    'machinery', 'machine', 'equipment', 'equipement', 'mechanical',
    'tool', 'outil', 'industrial equipment'
  ],
  'Aviation & Aerospace': [
    'aviation', 'aerospace', 'aeronautique', 'aircraft', 'airline',
    'flight', 'aero', 'space', 'spatial'
  ],

  // Retail & Consumer
  'Retail': [
    'retail', 'commerce', 'store', 'magasin', 'shop', 'boutique',
    'supermarket', 'hypermarket', 'distribution'
  ],
  'Consumer Goods': [
    'consumer', 'goods', 'fmcg', 'cpg', 'product', 'produit',
    'brand', 'marque', 'packaging'
  ],
  'Food & Beverages': [
    'food', 'beverage', 'restaurant', 'cafe', 'bar', 'catering',
    'alimentation', 'boisson', 'cuisine', 'wine', 'vin'
  ],

  // Services
  'Management Consulting': [
    'consulting', 'consultant', 'conseil', 'advisory', 'strategy',
    'strategie', 'management', 'transformation', 'advisory'
  ],
  'Marketing & Advertising': [
    'marketing', 'advertising', 'publicite', 'agency', 'agence',
    'communication', 'media', 'brand', 'digital marketing', 'seo', 'sem'
  ],
  'Human Resources': [
    'human resources', 'hr', 'rh', 'recruitment', 'recrutement',
    'staffing', 'talent', 'employment', 'personnel'
  ],
  'Legal Services': [
    'legal', 'law', 'avocat', 'attorney', 'lawyer', 'cabinet',
    'juridique', 'litigation', 'counsel'
  ],

  // Real Estate & Construction
  'Real Estate': [
    'real estate', 'immobilier', 'property', 'propriete', 'realty',
    'housing', 'logement', 'foncier', 'estate'
  ],
  'Construction': [
    'construction', 'building', 'batiment', 'contractor', 'btp',
    'engineering', 'genie civil', 'travaux'
  ],
  'Architecture & Planning': [
    'architecture', 'architect', 'architecte', 'design', 'urban planning',
    'urbanisme', 'interior design'
  ],

  // Media & Entertainment
  'Media Production': [
    'media', 'production', 'film', 'video', 'tv', 'television',
    'broadcast', 'studio', 'content', 'cinema'
  ],
  'Entertainment': [
    'entertainment', 'divertissement', 'game', 'gaming', 'music',
    'musique', 'event', 'evenement', 'concert', 'show'
  ],
  'Publishing': [
    'publishing', 'edition', 'publisher', 'editeur', 'book', 'livre',
    'magazine', 'press', 'presse', 'journal'
  ],

  // Énergie & Utilities
  'Oil & Energy': [
    'oil', 'energy', 'energie', 'petrole', 'petroleum', 'gas',
    'gaz', 'fuel', 'fossil', 'refinery'
  ],
  'Renewables & Environment': [
    'renewable', 'solar', 'solaire', 'wind', 'eolien', 'green',
    'environment', 'environnement', 'ecology', 'sustainable', 'durable'
  ],
  'Utilities': [
    'utilities', 'utility', 'water', 'eau', 'electricity', 'electricite',
    'power', 'grid', 'reseau'
  ],

  // Éducation
  'Education': [
    'education', 'school', 'ecole', 'university', 'universite',
    'college', 'training', 'formation', 'learning', 'academic'
  ],

  // Transport & Logistique
  'Transportation/Trucking/Railroad': [
    'transport', 'logistics', 'logistique', 'shipping', 'freight',
    'delivery', 'livraison', 'trucking', 'railroad', 'cargo'
  ],

  // Telecom
  'Telecommunications': [
    'telecom', 'telecommunications', 'telephone', 'mobile',
    'network', 'reseau', 'operator', 'operateur', 'connectivity'
  ]
};

// Patterns de domaines spécifiques
const DOMAIN_PATTERNS = {
  '.bank': 'Banking',
  '.insurance': 'Insurance',
  '.tech': 'Computer Software',
  '.consulting': 'Management Consulting',
  '.法律': 'Legal Services',
  '.attorney': 'Legal Services',
  '.luxury': 'Luxury Goods & Jewelry'
};

// Grandes entreprises connues avec leurs secteurs
const KNOWN_COMPANIES = {
  // Luxe français
  'lvmh': 'Luxury Goods & Jewelry',
  'hermes': 'Luxury Goods & Jewelry',
  'kering': 'Luxury Goods & Jewelry',
  'chanel': 'Luxury Goods & Jewelry',
  'dior': 'Luxury Goods & Jewelry',
  'cartier': 'Luxury Goods & Jewelry',
  'louis vuitton': 'Luxury Goods & Jewelry',
  'gucci': 'Luxury Goods & Jewelry',

  // Tech
  'microsoft': 'Computer Software',
  'google': 'Internet',
  'apple': 'Computer Software',
  'amazon': 'Internet',
  'facebook': 'Internet',
  'meta': 'Internet',
  'salesforce': 'Computer Software',
  'oracle': 'Computer Software',
  'sap': 'Computer Software',

  // Finance
  'bnp': 'Banking',
  'societe generale': 'Banking',
  'credit agricole': 'Banking',
  'axa': 'Insurance',
  'allianz': 'Insurance',

  // Auto
  'renault': 'Automotive',
  'peugeot': 'Automotive',
  'citroen': 'Automotive',
  'tesla': 'Automotive',
  'volkswagen': 'Automotive',

  // Telecom
  'orange': 'Telecommunications',
  'bouygues': 'Telecommunications',
  'sfr': 'Telecommunications',
  'vodafone': 'Telecommunications'
};

/**
 * Normalise un texte pour la comparaison
 */
function normalize(text) {
  if (!text) return '';
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever accents
    .replace(/[^a-z0-9\s]/g, ' ')    // Enlever ponctuation
    .replace(/\s+/g, ' ')             // Normaliser espaces
    .trim();
}

/**
 * Extrait les mots significatifs d'un texte
 */
function extractKeywords(text) {
  const normalized = normalize(text);
  const words = normalized.split(' ');

  // Enlever les mots vides (stop words)
  const stopWords = new Set([
    'the', 'le', 'la', 'les', 'de', 'du', 'des', 'un', 'une',
    'sa', 'sas', 'sarl', 'ltd', 'llc', 'inc', 'corp', 'co',
    'group', 'groupe', 'company', 'compagnie', 'international',
    'france', 'french', 'francais', 'european', 'europeen'
  ]);

  return words.filter(w => w.length > 2 && !stopWords.has(w));
}

/**
 * Score la correspondance entre le texte et les keywords d'un secteur
 */
function scoreIndustry(text, keywords) {
  const textKeywords = extractKeywords(text);
  let score = 0;

  for (const keyword of keywords) {
    const normalizedKeyword = normalize(keyword);

    // Match exact
    if (textKeywords.includes(normalizedKeyword)) {
      score += 10;
    }

    // Match partiel (contient)
    const normalizedText = normalize(text);
    if (normalizedText.includes(normalizedKeyword)) {
      score += 5;
    }

    // Match sur mots individuels
    for (const word of textKeywords) {
      if (word.includes(normalizedKeyword) || normalizedKeyword.includes(word)) {
        score += 2;
      }
    }
  }

  return score;
}

/**
 * FONCTION PRINCIPALE - Détecte intelligemment le secteur d'activité
 */
function detectIndustry(companyName, domain = '') {
  if (!companyName) return null;

  const normalizedName = normalize(companyName);
  const normalizedDomain = normalize(domain);

  // 1. Vérifier les entreprises connues
  for (const [company, industry] of Object.entries(KNOWN_COMPANIES)) {
    if (normalizedName.includes(company) || normalizedDomain.includes(company)) {
      console.log(`  ✓ Entreprise connue détectée: ${companyName} → ${industry}`);
      return industry;
    }
  }

  // 2. Vérifier les patterns de domaine
  for (const [pattern, industry] of Object.entries(DOMAIN_PATTERNS)) {
    if (domain && domain.endsWith(pattern)) {
      console.log(`  ✓ Pattern domaine détecté: ${domain} → ${industry}`);
      return industry;
    }
  }

  // 3. Scorer tous les secteurs en analysant nom + domaine
  const scores = {};
  const combinedText = `${companyName} ${domain}`;

  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    scores[industry] = scoreIndustry(combinedText, keywords);
  }

  // 4. Trouver le meilleur score
  const sortedIndustries = Object.entries(scores)
    .sort((a, b) => b[1] - a[1]);

  const bestMatch = sortedIndustries[0];
  const bestScore = bestMatch[1];
  const secondBest = sortedIndustries[1];
  const secondScore = secondBest ? secondBest[1] : 0;

  // Seuil minimum de confiance: score >= 8 OU (score >= 6 ET 2x meilleur que le second)
  const hasGoodScore = bestScore >= 8;
  const isClearWinner = bestScore >= 6 && bestScore >= secondScore * 2;

  if (hasGoodScore || isClearWinner) {
    console.log(`  ✓ Détection par analyse: ${companyName} → ${bestMatch[0]} (score: ${bestScore})`);
    return bestMatch[0];
  }

  // 5. Pas de détection fiable
  console.log(`  ⚠️ Pas de secteur détecté pour: ${companyName} (meilleur score: ${bestScore}, ambiguïté: ${secondScore})`);
  return null;
}

module.exports = {
  detectIndustry
};
