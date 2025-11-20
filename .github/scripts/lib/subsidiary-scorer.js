/**
 * Calcul de la priorité des filiales découvertes
 * Basé sur le CA parent, secteur, taille de la filiale, etc.
 */

class SubsidiaryScorer {
  /**
   * Calculer le score de priorité d'une filiale
   * @param {Object} subsidiary - Données de la filiale depuis Pappers
   * @param {Object} parent - Données du parent (company HubSpot)
   * @param {number} parentRevenue - CA total du parent
   * @returns {Object} Score et métadonnées
   */
  static calculateScore(subsidiary, parent, parentRevenue) {
    let score = 0;
    const factors = [];

    // FACTEUR 1: CA du parent (40 points max)
    const revenueScore = this.scoreByParentRevenue(parentRevenue);
    score += revenueScore;
    factors.push(`CA parent: ${revenueScore}pts`);

    // FACTEUR 2: Taille de la filiale (30 points max)
    const sizeScore = this.scoreBySubsidiarySize(subsidiary);
    score += sizeScore;
    if (sizeScore > 0) {
      factors.push(`Taille filiale: ${sizeScore}pts`);
    }

    // FACTEUR 3: Secteur d'activité (20 points max)
    const sectorScore = this.scoreBySector(subsidiary, parent);
    score += sectorScore;
    if (sectorScore > 0) {
      factors.push(`Secteur: ${sectorScore}pts`);
    }

    // FACTEUR 4: Présence web (10 points max)
    const webScore = this.scoreByWebPresence(subsidiary);
    score += webScore;
    if (webScore > 0) {
      factors.push(`Web: ${webScore}pts`);
    }

    // FACTEUR 5: Bonuses spéciaux
    const bonusScore = this.calculateBonuses(subsidiary, parent);
    score += bonusScore;
    if (bonusScore > 0) {
      factors.push(`Bonus: ${bonusScore}pts`);
    }

    // Déterminer la priorité finale
    const priority = this.determinePriority(score);

    return {
      score: Math.round(score),
      priority,
      factors,
      details: {
        revenueScore,
        sizeScore,
        sectorScore,
        webScore,
        bonusScore
      }
    };
  }

  /**
   * Score basé sur le CA du parent (0-40 points)
   */
  static scoreByParentRevenue(revenue) {
    if (revenue >= 1000000) return 40;  // > 1M€
    if (revenue >= 500000) return 30;   // 500k-1M€
    if (revenue >= 200000) return 20;   // 200k-500k€
    if (revenue >= 100000) return 10;   // 100k-200k€
    return 5;                           // < 100k€
  }

  /**
   * Score basé sur la taille de la filiale (0-30 points)
   */
  static scoreBySubsidiarySize(subsidiary) {
    let score = 0;

    // Effectif
    if (subsidiary.effectif) {
      const effectif = parseInt(subsidiary.effectif);
      if (effectif >= 500) score += 15;
      else if (effectif >= 100) score += 10;
      else if (effectif >= 50) score += 7;
      else if (effectif >= 10) score += 5;
    }

    // CA propre de la filiale
    if (subsidiary.chiffre_affaires) {
      const ca = parseInt(subsidiary.chiffre_affaires);
      if (ca >= 10000000) score += 15;      // > 10M€
      else if (ca >= 5000000) score += 10;  // 5-10M€
      else if (ca >= 1000000) score += 7;   // 1-5M€
      else if (ca >= 500000) score += 5;    // 500k-1M€
    }

    return Math.min(score, 30); // Cap à 30 points
  }

  /**
   * Score basé sur le secteur d'activité (0-20 points)
   */
  static scoreBySector(subsidiary, parent) {
    // Secteurs prioritaires (tech, digital, services)
    const highPrioritySectors = [
      '6201', '6202', // Programmation, conseil informatique
      '6311', '6312', // Traitement de données, portails internet
      '7021', '7022', // Conseil en relations publiques, conseil de gestion
      '7111', '7112', // Activités d'architecture, ingénierie
      '7311', '7312', // Publicité, régie publicitaire
      '7320',         // Études de marché
      '8299'          // Services administratifs
    ];

    if (!subsidiary.code_naf) return 0;

    const naf = subsidiary.code_naf.substring(0, 4);

    // Match parfait avec secteurs prioritaires
    if (highPrioritySectors.includes(naf)) {
      return 20;
    }

    // Même secteur que le parent (si on a l'info)
    if (parent.industry && subsidiary.libelle_code_naf) {
      const industryMatch = subsidiary.libelle_code_naf.toLowerCase().includes(
        parent.industry.toLowerCase()
      );
      if (industryMatch) {
        return 15;
      }
    }

    // Secteurs moyennement intéressants
    const mediumPrioritySectors = [
      '70', // Activités des sièges sociaux, conseil de gestion
      '73', // Publicité et études de marché
      '82'  // Activités administratives
    ];

    if (mediumPrioritySectors.some(prefix => naf.startsWith(prefix))) {
      return 10;
    }

    return 5; // Score de base
  }

  /**
   * Score basé sur la présence web (0-10 points)
   */
  static scoreByWebPresence(subsidiary) {
    let score = 0;

    if (subsidiary.site_web) {
      score += 10;
    }

    return score;
  }

  /**
   * Bonuses spéciaux (0-20 points)
   */
  static calculateBonuses(subsidiary, parent) {
    let bonus = 0;

    // Bonus si société récente (< 3 ans) = innovation potentielle
    if (subsidiary.date_creation) {
      const yearCreated = new Date(subsidiary.date_creation).getFullYear();
      const currentYear = new Date().getFullYear();
      if (currentYear - yearCreated <= 3) {
        bonus += 5;
      }
    }

    // Bonus si forte détention (> 80%)
    if (subsidiary.pourcentage_detention && subsidiary.pourcentage_detention >= 80) {
      bonus += 5;
    }

    // Bonus si filiale en Île-de-France (proximité géographique)
    if (subsidiary.code_postal) {
      const dept = subsidiary.code_postal.substring(0, 2);
      if (['75', '77', '78', '91', '92', '93', '94', '95'].includes(dept)) {
        bonus += 5;
      }
    }

    // Bonus si nom contient "digital", "tech", "innovation"
    if (subsidiary.nom) {
      const keywords = ['digital', 'tech', 'innovation', 'consulting', 'services'];
      const nameLC = subsidiary.nom.toLowerCase();
      if (keywords.some(kw => nameLC.includes(kw))) {
        bonus += 5;
      }
    }

    return Math.min(bonus, 20); // Cap à 20 points
  }

  /**
   * Déterminer la priorité finale (HAUTE/MOYENNE/BASSE)
   */
  static determinePriority(score) {
    if (score >= 70) return 'HAUTE';
    if (score >= 40) return 'MOYENNE';
    return 'BASSE';
  }

  /**
   * Estimer la valeur potentielle d'une opportunité
   */
  static estimateValue(subsidiary, parentRevenue) {
    // Estimation simple: 10-30% du CA parent, ajusté par la taille de la filiale
    let baseValue = parentRevenue * 0.15; // 15% par défaut

    // Ajuster selon la taille de la filiale
    if (subsidiary.effectif) {
      const effectif = parseInt(subsidiary.effectif);
      if (effectif >= 500) baseValue *= 1.5;
      else if (effectif >= 100) baseValue *= 1.2;
      else if (effectif < 10) baseValue *= 0.5;
    }

    // Ajuster selon le CA de la filiale si disponible
    if (subsidiary.chiffre_affaires) {
      const ca = parseInt(subsidiary.chiffre_affaires);
      // Si la filiale est très grosse, ajuster l'estimation
      if (ca >= 10000000) {
        baseValue = Math.max(baseValue, ca * 0.05); // 5% du CA de la filiale
      }
    }

    return Math.round(baseValue);
  }

  /**
   * Formater un résumé textuel du scoring
   */
  static formatSummary(scoreResult) {
    const { score, priority, factors } = scoreResult;
    return `${priority} (${score}/100) - ${factors.join(', ')}`;
  }
}

module.exports = SubsidiaryScorer;
