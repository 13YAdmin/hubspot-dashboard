/**
 * Enrichisseur Web (sites corporate)
 * Recherche les filiales sur les sites web officiels des entreprises
 */

const https = require('https');
const http = require('http');

class WebEnricher {
  constructor() {
    this.timeout = 10000; // 10 secondes max par requête
    this.requestDelay = 1000; // 1 seconde entre requêtes (politesse)
  }

  /**
   * Fetch une URL et retourne le contenu HTML
   */
  async fetchUrl(url) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const protocol = urlObj.protocol === 'https:' ? https : http;

      const options = {
        hostname: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; HubSpot-Dashboard/1.0)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
        },
        timeout: this.timeout
      };

      const req = protocol.request(options, (res) => {
        // Suivre les redirections
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, url).toString();
          return this.fetchUrl(redirectUrl).then(resolve).catch(reject);
        }

        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
          // Limiter la taille pour éviter les gros fichiers
          if (data.length > 500000) { // 500KB max
            req.destroy();
            resolve(data);
          }
        });

        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        });
      });

      req.on('error', (e) => {
        reject(e);
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  /**
   * URLs candidates pour trouver les filiales
   */
  getCandidateUrls(domain) {
    const base = `https://${domain}`;

    return [
      `${base}/nos-marques`,
      `${base}/marques`,
      `${base}/nos-filiales`,
      `${base}/filiales`,
      `${base}/subsidiaries`,
      `${base}/brands`,
      `${base}/companies`,
      `${base}/groupe`,
      `${base}/group`,
      `${base}/about`,
      `${base}/a-propos`,
      `${base}/organisation`,
      `${base}/organization`,
      `${base}/fr/nos-marques`,
      `${base}/fr/marques`,
      `${base}/en/brands`,
      `${base}/en/subsidiaries`
    ];
  }

  /**
   * Extraire les noms d'entreprises depuis HTML
   */
  extractCompanyNames(html, parentName) {
    if (!html) return [];

    const companies = new Set();

    // Pattern 1: Liens avec texte qui ressemble à un nom d'entreprise
    const linkRegex = /<a[^>]*>([^<]+)<\/a>/gi;
    let match;

    while ((match = linkRegex.exec(html)) !== null) {
      const text = match[1].trim();

      // Doit avoir au moins 3 caractères et commencer par une majuscule
      if (text.length >= 3 && /^[A-Z]/.test(text)) {
        // Filtrer les liens de navigation communs
        if (!this.isNavigationLink(text)) {
          companies.add(text);
        }
      }
    }

    // Pattern 2: Listes (ul/ol) avec items qui ressemblent à des noms
    const listRegex = /<li[^>]*>([^<]+)<\/li>/gi;

    while ((match = listRegex.exec(html)) !== null) {
      const text = this.cleanHtmlText(match[1]);

      if (text.length >= 3 && /^[A-Z]/.test(text)) {
        if (!this.isNavigationLink(text)) {
          companies.add(text);
        }
      }
    }

    // Pattern 3: Divs ou spans avec classes "brand", "company", "subsidiary"
    const brandRegex = /<(?:div|span)[^>]*class="[^"]*(?:brand|company|subsidiary|marque|filiale)[^"]*"[^>]*>([^<]+)<\/(?:div|span)>/gi;

    while ((match = brandRegex.exec(html)) !== null) {
      const text = this.cleanHtmlText(match[1]);

      if (text.length >= 3) {
        companies.add(text);
      }
    }

    // Pattern 4: Headings (h2, h3) qui sont des noms d'entreprise
    const headingRegex = /<h[2-4][^>]*>([^<]+)<\/h[2-4]>/gi;

    while ((match = headingRegex.exec(html)) !== null) {
      const text = this.cleanHtmlText(match[1]);

      if (text.length >= 3 && text.length < 50 && /^[A-Z]/.test(text)) {
        if (!this.isNavigationLink(text)) {
          companies.add(text);
        }
      }
    }

    // Convertir en array et filtrer
    return Array.from(companies)
      .filter(name => this.isValidCompanyName(name, parentName))
      .map(name => ({
        name: name,
        source: 'web_scraping',
        sourceUrl: null, // Sera ajouté par l'appelant
        confidence: 0.5, // Confiance moyenne pour scraping
        parentName: parentName
      }));
  }

  /**
   * Nettoyer le texte HTML (enlever balises, espaces multiples, etc.)
   */
  cleanHtmlText(text) {
    return text
      .replace(/<[^>]*>/g, '') // Enlever balises HTML
      .replace(/&nbsp;/g, ' ') // Remplacer &nbsp;
      .replace(/&amp;/g, '&') // Remplacer &amp;
      .replace(/&[a-z]+;/gi, '') // Enlever autres entités HTML
      .replace(/\s+/g, ' ') // Normaliser espaces
      .trim();
  }

  /**
   * Vérifier si c'est un lien de navigation (pas une entreprise)
   */
  isNavigationLink(text) {
    const navKeywords = [
      'accueil', 'home', 'contact', 'mentions', 'legal', 'cookies',
      'confidentialité', 'privacy', 'carrières', 'careers', 'jobs',
      'presse', 'press', 'investisseurs', 'investors', 'en savoir plus',
      'learn more', 'voir plus', 'see more', 'tous', 'all', 'retour',
      'back', 'suivant', 'next', 'précédent', 'previous', 'menu',
      'recherche', 'search', 'newsletter', 'connexion', 'login',
      'inscription', 'register', 'compte', 'account', 'panier', 'cart'
    ];

    const textLower = text.toLowerCase();
    return navKeywords.some(kw => textLower.includes(kw));
  }

  /**
   * Valider qu'un nom est bien un nom d'entreprise
   */
  isValidCompanyName(name, parentName) {
    // Pas trop court ni trop long
    if (name.length < 3 || name.length > 100) return false;

    // Ne doit pas être le parent lui-même
    if (name.toLowerCase() === parentName.toLowerCase()) return false;

    // Doit contenir au moins une lettre
    if (!/[a-zA-Z]/.test(name)) return false;

    // Ne doit pas être uniquement des chiffres
    if (/^\d+$/.test(name)) return false;

    // Filtrer les phrases complètes (pas des noms)
    if (name.split(' ').length > 6) return false;

    // Mots-clés qui indiquent que ce n'est pas une entreprise
    const invalidKeywords = [
      'copyright', '©', '®', 'tous droits', 'all rights',
      'cliquez ici', 'click here', 'en savoir', 'learn more',
      'découvrir', 'discover', 'télécharger', 'download'
    ];

    const nameLower = name.toLowerCase();
    if (invalidKeywords.some(kw => nameLower.includes(kw))) return false;

    return true;
  }

  /**
   * Enrichir une company via son site web
   */
  async enrichCompany(company) {
    const domain = company.domain;

    if (!domain || domain === '') {
      console.log(`      [Web] Pas de domaine pour ${company.name}`);
      return [];
    }

    console.log(`      [Web] Scraping de ${domain}...`);

    const candidateUrls = this.getCandidateUrls(domain);
    const allSubsidiaries = [];
    const successfulUrls = [];

    // Tester chaque URL candidate
    for (const url of candidateUrls) {
      try {
        const html = await this.fetchUrl(url);
        const subsidiaries = this.extractCompanyNames(html, company.name);

        if (subsidiaries.length > 0) {
          // Ajouter l'URL source
          subsidiaries.forEach(sub => {
            sub.sourceUrl = url;
          });

          allSubsidiaries.push(...subsidiaries);
          successfulUrls.push(url);

          console.log(`      [Web] ${subsidiaries.length} filiales trouvées sur ${url}`);
        }

        // Delay entre requêtes
        await this.delay();

      } catch (error) {
        // Ignorer silencieusement les erreurs (404, timeout, etc.)
        // Ces pages n'existent souvent pas
      }
    }

    // Dédupliquer
    const uniqueSubsidiaries = this.deduplicateSubsidiaries(allSubsidiaries);

    console.log(`      [Web] Total: ${uniqueSubsidiaries.length} filiales uniques`);

    return uniqueSubsidiaries;
  }

  /**
   * Dédupliquer les filiales par nom
   */
  deduplicateSubsidiaries(subsidiaries) {
    const seen = new Map();

    for (const sub of subsidiaries) {
      const key = sub.name.toLowerCase().trim();

      if (!seen.has(key)) {
        seen.set(key, sub);
      } else {
        // Si doublon, garder celui avec la meilleure URL source
        const existing = seen.get(key);
        if (this.isPreferredUrl(sub.sourceUrl, existing.sourceUrl)) {
          seen.set(key, sub);
        }
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Déterminer quelle URL est préférable
   */
  isPreferredUrl(url1, url2) {
    // Préférer les URLs plus spécifiques
    const preferredPaths = ['/filiales', '/subsidiaries', '/marques', '/brands'];

    const score1 = preferredPaths.some(p => url1.includes(p)) ? 2 : 1;
    const score2 = preferredPaths.some(p => url2.includes(p)) ? 2 : 1;

    return score1 > score2;
  }

  /**
   * Enrichir plusieurs companies
   */
  async enrichMultiple(companies) {
    const results = [];

    for (const company of companies) {
      const subsidiaries = await this.enrichCompany(company);

      if (subsidiaries.length > 0) {
        results.push({
          companyId: company.id,
          companyName: company.name,
          subsidiaries
        });
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
}

module.exports = WebEnricher;
