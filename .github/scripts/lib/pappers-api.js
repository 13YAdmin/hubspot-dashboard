/**
 * Client API Pappers.fr
 * Documentation: https://www.pappers.fr/api/documentation
 */

const https = require('https');

class PappersAPI {
  constructor(apiToken) {
    if (!apiToken) {
      throw new Error('❌ PAPPERS_API_TOKEN requis');
    }
    this.apiToken = apiToken;
    this.baseUrl = 'api.pappers.fr';
    this.requestDelay = 100; // 100ms entre chaque requête (10 req/s max)
  }

  /**
   * Requête générique à l'API Pappers
   */
  async makeRequest(endpoint, params = {}) {
    return new Promise((resolve, reject) => {
      // Ajouter le token à tous les paramètres
      const allParams = { ...params, api_token: this.apiToken };

      // Construire la query string
      const queryString = Object.entries(allParams)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      const path = `${endpoint}?${queryString}`;

      const options = {
        hostname: this.baseUrl,
        path: path,
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          try {
            const result = JSON.parse(data);

            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(result);
            } else {
              reject(new Error(`Pappers API error ${res.statusCode}: ${JSON.stringify(result)}`));
            }
          } catch (e) {
            reject(new Error(`Parse error: ${e.message}`));
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.end();
    });
  }

  /**
   * Récupérer les informations d'une entreprise par SIREN
   */
  async getEntreprise(siren) {
    try {
      const result = await this.makeRequest('/v2/entreprise', { siren });
      return result;
    } catch (error) {
      console.error(`   ⚠️  Erreur Pappers pour SIREN ${siren}: ${error.message}`);
      return null;
    }
  }

  /**
   * Récupérer toutes les filiales d'une entreprise
   * Retourne un tableau de filiales avec leurs informations
   */
  async getFiliales(siren) {
    const entreprise = await this.getEntreprise(siren);

    if (!entreprise) {
      return [];
    }

    // Vérifier si l'entreprise a des filiales
    if (!entreprise.filiales || entreprise.filiales.length === 0) {
      return [];
    }

    // Transformer les filiales en format standardisé
    const filiales = entreprise.filiales.map(filiale => {
      return {
        siren: filiale.siren || null,
        siret: filiale.siret || null,
        nom: filiale.nom_entreprise || filiale.denomination || 'Nom inconnu',
        denomination: filiale.denomination || filiale.nom_entreprise || '',
        forme_juridique: filiale.forme_juridique || '',
        code_naf: filiale.code_naf || '',
        libelle_code_naf: filiale.libelle_code_naf || '',
        adresse: this.formatAdresse(filiale),
        ville: filiale.siege?.ville || '',
        code_postal: filiale.siege?.code_postal || '',
        pays: filiale.siege?.pays || 'France',
        date_creation: filiale.date_creation || null,
        capital: filiale.capital || 0,
        effectif: filiale.effectif || null,
        chiffre_affaires: filiale.chiffre_affaires || null,
        site_web: filiale.site_internet || null,
        statut: filiale.statut_rcs || 'Actif',
        pourcentage_detention: filiale.pourcentage_detention || null
      };
    });

    return filiales;
  }

  /**
   * Rechercher une entreprise par nom
   */
  async rechercheEntreprise(nom, limit = 10) {
    try {
      const result = await this.makeRequest('/v2/recherche', {
        q: nom,
        par_page: limit
      });

      return result.resultats || [];
    } catch (error) {
      console.error(`   ⚠️  Erreur recherche pour "${nom}": ${error.message}`);
      return [];
    }
  }

  /**
   * Formater l'adresse d'une entreprise
   */
  formatAdresse(entreprise) {
    if (!entreprise.siege) return '';

    const siege = entreprise.siege;
    const parts = [
      siege.numero_voie,
      siege.type_voie,
      siege.nom_voie,
      siege.complement_adresse
    ].filter(Boolean);

    return parts.join(' ').trim();
  }

  /**
   * Delay entre les requêtes pour respecter rate limiting
   */
  async delay() {
    return new Promise(resolve => setTimeout(resolve, this.requestDelay));
  }

  /**
   * Récupérer les filiales de plusieurs entreprises avec rate limiting
   */
  async getFilialesMultiple(sirens) {
    const results = [];

    for (const siren of sirens) {
      const filiales = await this.getFiliales(siren);
      results.push({
        siren,
        filiales
      });

      // Respecter le rate limiting
      if (sirens.indexOf(siren) < sirens.length - 1) {
        await this.delay();
      }
    }

    return results;
  }

  /**
   * Vérifier si un SIREN est valide (9 chiffres)
   */
  static isValidSiren(siren) {
    if (!siren) return false;
    const cleaned = String(siren).replace(/\s/g, '');
    return /^\d{9}$/.test(cleaned);
  }

  /**
   * Nettoyer un SIREN (enlever espaces, etc.)
   */
  static cleanSiren(siren) {
    if (!siren) return null;
    return String(siren).replace(/\s/g, '').substring(0, 9);
  }
}

module.exports = PappersAPI;
