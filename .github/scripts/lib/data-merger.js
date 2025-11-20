/**
 * Fusionneur de données multi-sources
 * Combine intelligemment Pappers + Wikipedia + Web
 * Détecte les doublons et calcule les scores de confiance
 */

class DataMerger {
  /**
   * Fusionner les résultats de toutes les sources
   * @param {Object} pappersData - Données depuis Pappers API
   * @param {Object} wikipediaData - Données depuis Wikipedia
   * @param {Object} webData - Données depuis scraping web
   * @returns {Array} Filiales fusionnées et dédupliquées
   */
  static mergeAllSources(pappersData, wikipediaData, webData) {
    const allSubsidiaries = [];

    // PAPPERS: Confiance HAUTE (données officielles INSEE)
    if (pappersData && pappersData.length > 0) {
      pappersData.forEach(filiale => {
        allSubsidiaries.push({
          name: filiale.nom,
          siren: filiale.siren,
          siret: filiale.siret,
          domain: filiale.site_web || '',
          sector: filiale.libelle_code_naf || '',
          city: filiale.ville || '',
          country: filiale.pays || 'France',
          effectif: filiale.effectif,
          chiffre_affaires: filiale.chiffre_affaires,
          date_creation: filiale.date_creation,
          sources: ['pappers'],
          confidence: 0.95, // Confiance très haute
          sourceUrls: []
        });
      });
    }

    // WIKIPEDIA: Confiance MOYENNE
    if (wikipediaData && wikipediaData.length > 0) {
      wikipediaData.forEach(sub => {
        allSubsidiaries.push({
          name: sub.name,
          siren: null,
          siret: null,
          domain: '',
          sector: '',
          city: '',
          country: 'France',
          effectif: null,
          chiffre_affaires: null,
          date_creation: null,
          sources: ['wikipedia'],
          confidence: sub.confidence || 0.6,
          sourceUrls: [sub.sourceUrl]
        });
      });
    }

    // WEB SCRAPING: Confiance BASSE à MOYENNE
    if (webData && webData.length > 0) {
      webData.forEach(sub => {
        allSubsidiaries.push({
          name: sub.name,
          siren: null,
          siret: null,
          domain: '',
          sector: '',
          city: '',
          country: '',
          effectif: null,
          chiffre_affaires: null,
          date_creation: null,
          sources: ['web'],
          confidence: sub.confidence || 0.5,
          sourceUrls: [sub.sourceUrl]
        });
      });
    }

    // Dédupliquer et fusionner
    const merged = this.deduplicateAndMerge(allSubsidiaries);

    // Trier par confiance décroissante
    merged.sort((a, b) => b.confidence - a.confidence);

    return merged;
  }

  /**
   * Dédupliquer et fusionner les entrées similaires
   */
  static deduplicateAndMerge(subsidiaries) {
    const groups = new Map();

    // Grouper les entrées similaires
    for (const sub of subsidiaries) {
      const key = this.generateMatchKey(sub.name);

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key).push(sub);
    }

    // Fusionner chaque groupe
    const merged = [];

    for (const [key, group] of groups.entries()) {
      const mergedEntry = this.mergeGroup(group);
      merged.push(mergedEntry);
    }

    return merged;
  }

  /**
   * Générer une clé de matching pour détecter les doublons
   */
  static generateMatchKey(name) {
    return name
      .toLowerCase()
      .trim()
      // Enlever les formes juridiques
      .replace(/\b(sas|sarl|sa|sasu|eurl|sci|snc|scs|sca|scop|eig|gie|sep)\b/gi, '')
      // Enlever les accents
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      // Enlever la ponctuation
      .replace(/[^\w\s]/g, '')
      // Normaliser les espaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Fusionner un groupe d'entrées similaires
   */
  static mergeGroup(group) {
    if (group.length === 1) {
      return group[0];
    }

    // Prendre comme base l'entrée avec la meilleure confiance
    const base = group.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );

    // Fusionner les informations de toutes les sources
    const merged = { ...base };

    // Combiner les sources
    const allSources = new Set();
    const allUrls = [];

    for (const entry of group) {
      entry.sources.forEach(s => allSources.add(s));
      allUrls.push(...entry.sourceUrls);

      // Compléter les champs manquants
      if (!merged.siren && entry.siren) merged.siren = entry.siren;
      if (!merged.domain && entry.domain) merged.domain = entry.domain;
      if (!merged.sector && entry.sector) merged.sector = entry.sector;
      if (!merged.city && entry.city) merged.city = entry.city;
      if (!merged.effectif && entry.effectif) merged.effectif = entry.effectif;
      if (!merged.chiffre_affaires && entry.chiffre_affaires) {
        merged.chiffre_affaires = entry.chiffre_affaires;
      }
    }

    merged.sources = Array.from(allSources);
    merged.sourceUrls = [...new Set(allUrls)];

    // Recalculer la confiance : boost si plusieurs sources concordent
    merged.confidence = this.calculateMergedConfidence(group);

    // Prendre le nom le plus complet (le plus long)
    merged.name = group.reduce((longest, current) =>
      current.name.length > longest.name.length ? current : longest
    ).name;

    return merged;
  }

  /**
   * Calculer la confiance fusionnée
   */
  static calculateMergedConfidence(group) {
    // Si plusieurs sources concordent → boost de confiance
    const uniqueSources = new Set();
    let maxConfidence = 0;

    for (const entry of group) {
      entry.sources.forEach(s => uniqueSources.add(s));
      maxConfidence = Math.max(maxConfidence, entry.confidence);
    }

    // Boost si multi-sources
    let confidence = maxConfidence;

    if (uniqueSources.size >= 3) {
      confidence = Math.min(0.98, confidence + 0.2); // +0.2 si 3+ sources
    } else if (uniqueSources.size === 2) {
      confidence = Math.min(0.95, confidence + 0.1); // +0.1 si 2 sources
    }

    // Boost supplémentaire si Pappers est présent
    if (uniqueSources.has('pappers')) {
      confidence = Math.min(0.99, confidence + 0.05);
    }

    return Math.round(confidence * 100) / 100;
  }

  /**
   * Formater les sources pour affichage
   */
  static formatSources(subsidiary) {
    const sourceNames = {
      'pappers': 'Pappers API',
      'wikipedia': 'Wikipedia',
      'web': 'Site web'
    };

    return subsidiary.sources
      .map(s => sourceNames[s] || s)
      .join(' + ');
  }

  /**
   * Catégoriser par niveau de confiance
   */
  static categorizeByConfidence(subsidiaries) {
    return {
      high: subsidiaries.filter(s => s.confidence >= 0.8),
      medium: subsidiaries.filter(s => s.confidence >= 0.5 && s.confidence < 0.8),
      low: subsidiaries.filter(s => s.confidence < 0.5)
    };
  }

  /**
   * Enrichir avec des données manquantes (tentative de résolution)
   */
  static async enrichMissingData(subsidiary, pappersAPI) {
    // Si on a un nom mais pas de SIREN, essayer de le trouver via Pappers
    if (!subsidiary.siren && subsidiary.name) {
      try {
        const results = await pappersAPI.rechercheEntreprise(subsidiary.name, 1);

        if (results && results.length > 0) {
          const match = results[0];

          // Vérifier que c'est bien un bon match (similarité de nom)
          const similarity = this.calculateNameSimilarity(
            subsidiary.name,
            match.nom_entreprise || match.denomination
          );

          if (similarity > 0.8) {
            // Bon match ! Enrichir les données
            subsidiary.siren = match.siren;
            subsidiary.siret = match.siege?.siret;
            subsidiary.domain = match.site_internet || subsidiary.domain;
            subsidiary.sector = match.libelle_code_naf || subsidiary.sector;
            subsidiary.city = match.siege?.ville || subsidiary.city;
            subsidiary.effectif = match.effectif || subsidiary.effectif;
            subsidiary.chiffre_affaires = match.chiffre_affaires || subsidiary.chiffre_affaires;

            // Boost de confiance
            subsidiary.confidence = Math.min(0.95, subsidiary.confidence + 0.15);

            if (!subsidiary.sources.includes('pappers')) {
              subsidiary.sources.push('pappers_enriched');
            }
          }
        }
      } catch (error) {
        // Échec silencieux
      }
    }

    return subsidiary;
  }

  /**
   * Calculer la similarité entre deux noms (0-1)
   */
  static calculateNameSimilarity(name1, name2) {
    const key1 = this.generateMatchKey(name1);
    const key2 = this.generateMatchKey(name2);

    // Distance de Levenshtein normalisée
    const distance = this.levenshteinDistance(key1, key2);
    const maxLen = Math.max(key1.length, key2.length);

    return 1 - (distance / maxLen);
  }

  /**
   * Distance de Levenshtein (similarité de chaînes)
   */
  static levenshteinDistance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Filtrer les résultats de mauvaise qualité
   */
  static filterLowQuality(subsidiaries, minConfidence = 0.4) {
    return subsidiaries.filter(sub => {
      // Confiance minimale
      if (sub.confidence < minConfidence) return false;

      // Nom valide
      if (!sub.name || sub.name.length < 3) return false;

      // Si aucune source fiable, rejeter
      if (sub.sources.length === 0) return false;

      return true;
    });
  }

  /**
   * Générer un résumé statistique
   */
  static generateStats(subsidiaries) {
    const categorized = this.categorizeByConfidence(subsidiaries);

    const sourceCounts = {
      pappers: 0,
      wikipedia: 0,
      web: 0,
      multiple: 0
    };

    subsidiaries.forEach(sub => {
      if (sub.sources.length > 1) {
        sourceCounts.multiple++;
      } else if (sub.sources.includes('pappers')) {
        sourceCounts.pappers++;
      } else if (sub.sources.includes('wikipedia')) {
        sourceCounts.wikipedia++;
      } else if (sub.sources.includes('web')) {
        sourceCounts.web++;
      }
    });

    return {
      total: subsidiaries.length,
      byConfidence: {
        high: categorized.high.length,
        medium: categorized.medium.length,
        low: categorized.low.length
      },
      bySources: sourceCounts,
      withSiren: subsidiaries.filter(s => s.siren).length,
      withDomain: subsidiaries.filter(s => s.domain).length
    };
  }
}

module.exports = DataMerger;
