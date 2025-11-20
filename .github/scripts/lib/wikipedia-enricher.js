/**
 * Enrichisseur Wikipedia
 * Récupère les filiales depuis les pages Wikipedia des entreprises
 * API gratuite et légale
 */

const https = require('https');

class WikipediaEnricher {
  constructor() {
    this.baseUrl = 'fr.wikipedia.org';
    this.apiPath = '/w/api.php';
    this.requestDelay = 200; // 200ms entre requêtes (politesse)
  }

  /**
   * Requête à l'API Wikipedia
   */
  async makeRequest(params) {
    return new Promise((resolve, reject) => {
      const queryString = Object.entries(params)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      const path = `${this.apiPath}?${queryString}`;

      const options = {
        hostname: this.baseUrl,
        path: path,
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'HubSpot-Dashboard/1.0 (Business Intelligence Tool)'
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
            resolve(result);
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
   * Rechercher la page Wikipedia d'une entreprise
   */
  async searchCompanyPage(companyName) {
    try {
      const result = await this.makeRequest({
        action: 'query',
        format: 'json',
        list: 'search',
        srsearch: companyName,
        srlimit: 3
      });

      if (!result.query || !result.query.search || result.query.search.length === 0) {
        return null;
      }

      // Prendre le premier résultat
      return result.query.search[0].title;
    } catch (error) {
      console.error(`   ⚠️  Wikipedia search error for ${companyName}: ${error.message}`);
      return null;
    }
  }

  /**
   * Extraire le contenu d'une page Wikipedia
   */
  async getPageContent(pageTitle) {
    try {
      const result = await this.makeRequest({
        action: 'query',
        format: 'json',
        prop: 'extracts|info',
        titles: pageTitle,
        explaintext: true,
        exsectionformat: 'plain',
        inprop: 'url'
      });

      if (!result.query || !result.query.pages) {
        return null;
      }

      const pages = Object.values(result.query.pages);
      if (pages.length === 0 || pages[0].pageid === undefined) {
        return null;
      }

      return {
        title: pages[0].title,
        extract: pages[0].extract || '',
        url: pages[0].fullurl || ''
      };
    } catch (error) {
      console.error(`   ⚠️  Wikipedia content error: ${error.message}`);
      return null;
    }
  }

  /**
   * Extraire les filiales depuis le texte Wikipedia
   */
  extractSubsidiaries(content, parentName) {
    if (!content || !content.extract) {
      return [];
    }

    const text = content.extract;
    const subsidiaries = [];

    // Patterns pour identifier les filiales
    const patterns = [
      // "filiale de X", "filiales : A, B, C"
      /filiales?\s*:?\s*([^\.]+)/gi,
      // "dont X possède Y"
      /dont\s+[^\.]*possède\s+([^\.]+)/gi,
      // "appartient au groupe X"
      /appartient\s+au\s+groupe\s+([^\.]+)/gi,
      // "marques : A, B, C"
      /marques?\s*:?\s*([^\.]+)/gi,
      // "divisions : A, B, C"
      /divisions?\s*:?\s*([^\.]+)/gi,
      // Entre parenthèses après le nom
      /\((?:filiale|marque|division)\s+de\s+([^\)]+)\)/gi
    ];

    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const extracted = match[1];
        // Split sur les virgules, points-virgules, "et"
        const items = extracted.split(/,|;|\set\s/);

        for (let item of items) {
          item = item.trim();

          // Filtrer les items trop courts ou trop longs
          if (item.length < 3 || item.length > 100) continue;

          // Filtrer les mots communs qui ne sont pas des noms d'entreprise
          const excludeWords = ['notamment', 'autres', 'etc', 'divers', 'plusieurs'];
          if (excludeWords.some(word => item.toLowerCase().includes(word))) continue;

          // Nettoyer les artefacts
          item = item.replace(/\([^\)]*\)/g, ''); // Enlever parenthèses
          item = item.replace(/\[[^\]]*\]/g, ''); // Enlever crochets
          item = item.trim();

          if (item.length >= 3) {
            subsidiaries.push({
              name: item,
              source: 'wikipedia',
              sourceUrl: content.url,
              confidence: 0.6, // Confiance moyenne pour Wikipedia
              parentName: parentName
            });
          }
        }
      }
    }

    // Dédupliquer
    const uniqueSubsidiaries = [];
    const seen = new Set();

    for (const sub of subsidiaries) {
      const key = sub.name.toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueSubsidiaries.push(sub);
      }
    }

    return uniqueSubsidiaries;
  }

  /**
   * Enrichir avec Wikipedia - fonction principale
   */
  async enrichCompany(companyName) {
    try {
      console.log(`      [Wikipedia] Recherche de "${companyName}"...`);

      // 1. Trouver la page Wikipedia
      const pageTitle = await this.searchCompanyPage(companyName);
      if (!pageTitle) {
        console.log(`      [Wikipedia] Pas de page trouvée`);
        return [];
      }

      console.log(`      [Wikipedia] Page trouvée: "${pageTitle}"`);

      // 2. Récupérer le contenu
      await this.delay();
      const content = await this.getPageContent(pageTitle);
      if (!content) {
        console.log(`      [Wikipedia] Impossible de récupérer le contenu`);
        return [];
      }

      // 3. Extraire les filiales
      const subsidiaries = this.extractSubsidiaries(content, companyName);

      console.log(`      [Wikipedia] ${subsidiaries.length} filiales potentielles extraites`);

      return subsidiaries;

    } catch (error) {
      console.error(`      [Wikipedia] Erreur: ${error.message}`);
      return [];
    }
  }

  /**
   * Enrichir plusieurs companies
   */
  async enrichMultiple(companies) {
    const results = [];

    for (const company of companies) {
      const subsidiaries = await this.enrichCompany(company.name);

      if (subsidiaries.length > 0) {
        results.push({
          companyId: company.id,
          companyName: company.name,
          subsidiaries
        });
      }

      // Respecter la politesse envers Wikipedia
      if (companies.indexOf(company) < companies.length - 1) {
        await this.delay();
      }
    }

    return results;
  }

  /**
   * Delay entre requêtes
   */
  async delay() {
    return new Promise(resolve => setTimeout(resolve, this.requestDelay));
  }

  /**
   * Valider et nettoyer une filiale candidate
   */
  static validateSubsidiary(subsidiary) {
    // Vérifications de base
    if (!subsidiary.name || subsidiary.name.length < 3) {
      return false;
    }

    // Mots-clés qui indiquent que ce n'est probablement pas une entreprise
    const invalidKeywords = [
      'page', 'article', 'section', 'wikipedia', 'source',
      'citation', 'référence', 'modifier', 'historique'
    ];

    const nameLower = subsidiary.name.toLowerCase();
    if (invalidKeywords.some(kw => nameLower.includes(kw))) {
      return false;
    }

    return true;
  }

  /**
   * Enrichir avec validation stricte
   */
  async enrichCompanyWithValidation(companyName) {
    const subsidiaries = await this.enrichCompany(companyName);
    return subsidiaries.filter(sub => WikipediaEnricher.validateSubsidiary(sub));
  }
}

module.exports = WikipediaEnricher;
