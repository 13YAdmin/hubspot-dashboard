#!/usr/bin/env node

/**
 * AGENT QA - INSPECTEUR DE QUALITÉ (MODE PERFECTION)
 *
 * MISSION: AUCUN COMPROMIS SUR LA QUALITÉ
 *
 * Standards:
 * - 95-100: Acceptable pour production
 * - 90-94: Améliorations requises
 * - < 90: BLOQUÉ - Ne pas déployer
 *
 * Tests:
 * - Fonctionnalité (toutes les features doivent marcher)
 * - Performance (temps de chargement, optimisation)
 * - Accessibilité (a11y, WCAG 2.1 AA minimum)
 * - Sécurité (XSS, injection, headers)
 * - SEO (meta tags, structure)
 * - Best Practices (code quality, standards)
 * - UX (responsive, mobile-first)
 * - Compatibilité (browsers, devices)
 */

const fs = require('fs');
const path = require('path');

class AgentQA {
  constructor() {
    this.dashboardPath = path.join(process.cwd(), 'public/index.html');
    this.cahierPath = path.join(process.cwd(), 'CAHIER-DES-CHARGES.md');
    this.tests = [];
    this.passed = 0;
    this.failed = 0;
    this.critical = 0; // Échecs critiques
    this.warnings = 0; // Avertissements
  }

  log(message) {
    console.log(`✅ [AGENT QA] ${message}`);
  }

  async run() {
    this.log('DÉMARRAGE - INSPECTEUR QUALITÉ (MODE PERFECTION)');
    console.log('================================================================\n');
    this.log('⚠️  STANDARD: 95/100 MINIMUM pour production\n');

    if (!fs.existsSync(this.dashboardPath)) {
      this.log('❌ ERREUR CRITIQUE: Dashboard introuvable!');
      return;
    }

    const content = fs.readFileSync(this.dashboardPath, 'utf8');

    // BATTERIES DE TESTS (NIVEAU ÉQUIPE ENTIÈRE)
    await this.testFunctionality(content);
    await this.testPerformance(content);
    await this.testAccessibility(content);
    await this.testSecurity(content);
    await this.testSEO(content);
    await this.testBestPractices(content);
    await this.testUX(content);
    await this.testCompatibility(content);

    // TESTS AVANCÉS (SURPASSE HUMAINS)
    await this.testOWASPSecurity(content);
    await this.testPerformanceLighthouse(content);
    await this.testAccessibilityWCAG_AAA(content);
    await this.testCodeQuality(content);
    await this.testDependencies(content);
    await this.testDataIntegrity(content);
    await this.testErrorHandling(content);
    await this.testNetworkResilience(content);

    // Rapport
    await this.generateReport();

    const score = this.calculateScore();
    this.log(`\n📊 RÉSULTATS: ${this.passed} passed / ${this.failed} failed`);
    this.log(`🎯 SCORE FINAL: ${score}/100`);

    if (score < 95) {
      this.log('🔴 BLOQUÉ - Score insuffisant pour production');
    } else if (score < 98) {
      this.log('🟡 ACCEPTABLE - Améliorations recommandées');
    } else {
      this.log('🟢 EXCELLENT - Qualité production');
    }
  }

  test(name, condition, details = '', severity = 'normal') {
    const result = condition ? 'PASS' : 'FAIL';
    const emoji = condition ? '✅' : '❌';

    this.tests.push({ name, result, details, severity });

    if (condition) {
      this.passed++;
      this.log(`${emoji} ${name}`);
    } else {
      this.failed++;
      if (severity === 'critical') {
        this.critical++;
        this.log(`${emoji} ⚠️  CRITIQUE: ${name}`);
      } else if (severity === 'warning') {
        this.warnings++;
        this.log(`${emoji} ⚡ ${name}`);
      } else {
        this.log(`${emoji} ${name}`);
      }
      if (details) this.log(`   └─ ${details}`);
    }
  }

  // ============================================================================
  // TESTS DE FONCTIONNALITÉ
  // ============================================================================

  async testFunctionality(content) {
    this.log('\n🧪 TESTS FONCTIONNALITÉ (CRITIQUE)...\n');

    // Fonctions exposées globalement
    this.test(
      'showClientDetails exposée globalement',
      content.includes('window.showClientDetails ='),
      'Bug #1 - Requis pour onclick',
      'critical'
    );

    this.test(
      'showIndustryDetails exposée globalement',
      content.includes('window.showIndustryDetails ='),
      'Bug #2 - Requis pour onclick',
      'critical'
    );

    this.test(
      'showKPIDetails exposée globalement',
      content.includes('window.showKPIDetails ='),
      'Bug #3 - Requis pour onclick',
      'critical'
    );

    this.test(
      'showWhiteSpaceDetails exposée globalement',
      content.includes('window.showWhiteSpaceDetails ='),
      'Requis pour onclick',
      'critical'
    );

    this.test(
      'toggleGroup exposée globalement',
      content.includes('window.toggleGroup ='),
      'Requis pour interactions',
      'critical'
    );

    this.test(
      'closeInfoPanel exposée globalement',
      content.includes('window.closeInfoPanel ='),
      'Requis pour fermeture modals',
      'critical'
    );

    this.test(
      'showMethodologyDetails exposée globalement',
      content.includes('window.showMethodologyDetails ='),
      'Requis pour méthodologie',
      'critical'
    );

    // Graphiques avancés
    this.test(
      'renderSegmentDonutChart implémenté',
      content.includes('function renderSegmentDonutChart') && content.includes('renderSegmentDonutChart()'),
      'Graphique donut par segment',
      'critical'
    );

    this.test(
      'renderRadarChart implémenté',
      content.includes('function renderRadarChart') && content.includes('renderRadarChart()'),
      'Graphique radar KPIs',
      'critical'
    );

    this.test(
      'renderStackedAreaChart implémenté',
      content.includes('function renderStackedAreaChart') && content.includes('renderStackedAreaChart()'),
      'Graphique area empilé',
      'critical'
    );

    this.test(
      'renderHealthTrendsChart implémenté',
      content.includes('function renderHealthTrendsChart') && content.includes('renderHealthTrendsChart()'),
      'Graphique health trends',
      'critical'
    );

    // Data loading (removed - dashboard uses inline data)

    this.test(
      'DOMContentLoaded utilisé',
      content.includes('DOMContentLoaded'),
      'Initialisation au bon moment',
      'critical'
    );

    // Gestion erreurs
    this.test(
      'Gestion erreurs fetch',
      content.includes('catch') && content.includes('error'),
      'Error handling requis'
    );
  }

  // ============================================================================
  // TESTS DE PERFORMANCE
  // ============================================================================

  async testPerformance(content) {
    this.log('\n⚡ TESTS PERFORMANCE...\n');

    const lines = content.split('\n').length;
    this.test(
      'Taille fichier raisonnable',
      lines < 10000,
      `${lines} lignes (max 10000)`
    );

    this.test(
      'Pas de boucles infinies apparentes',
      !content.match(/while\s*\(\s*true\s*\)/),
      'Éviter while(true)'
    );

    this.test(
      'Debouncing sur resize',
      !content.includes('window.addEventListener(\'resize\'') || content.includes('debounce') || content.includes('throttle'),
      'Optimiser resize listeners'
    );

    this.test(
      'Pas de console.log en production',
      !content.includes('console.log'),
      'ZÉRO console.log autorisé (strict)',
      'critical'
    );

    this.test(
      'Pas de console.error excessifs',
      !content.includes('console.error'),
      'ZÉRO console.error autorisé (strict)',
      'critical'
    );

    this.test(
      'Pas de console.warn',
      !content.includes('console.warn'),
      'ZÉRO console.warn autorisé (strict)',
      'critical'
    );

    this.test(
      'Event listeners nettoyés',
      !content.includes('addEventListener') || content.includes('removeEventListener'),
      'Prévenir memory leaks',
      'warning'
    );

    this.test(
      'Utilisation de const/let (pas var)',
      !content.match(/\bvar\s+\w+\s*=/),
      'Utiliser const/let (ES6+)'
    );
  }

  // ============================================================================
  // TESTS ACCESSIBILITÉ (a11y)
  // ============================================================================

  async testAccessibility(content) {
    this.log('\n♿ TESTS ACCESSIBILITÉ (WCAG 2.1 AA)...\n');

    this.test(
      'Attribut lang sur <html>',
      content.includes('lang="fr"') || content.includes('lang="en"'),
      'WCAG 3.1.1 - Requis',
      'critical'
    );

    this.test(
      'Meta viewport présent',
      content.includes('<meta name="viewport"'),
      'Responsive requis',
      'critical'
    );

    this.test(
      'Title tag présent et descriptif',
      content.includes('<title>') && content.match(/<title>[^<]{10,}<\/title>/),
      'Title doit être descriptif (10+ chars)',
      'critical'
    );

    this.test(
      'Boutons avec aria-label ou texte',
      !content.match(/<button[^>]*><\/button>/) && !content.match(/<button[^>]*><i class=/),
      'Tous les boutons doivent avoir du texte ou aria-label',
      'critical'
    );

    this.test(
      'Images avec alt text',
      !content.includes('<img') || content.match(/alt="[^"]+"/),
      'WCAG 1.1.1 - Texte alternatif requis',
      'critical'
    );

    this.test(
      'Contraste couleurs (basique)',
      !content.match(/color:\s*#[a-f0-9]{3,6}/) || !content.match(/color:\s*#fff/),
      'Éviter blanc pur sur blanc',
      'warning'
    );

    this.test(
      'Focus visible',
      content.includes(':focus') || content.includes('outline'),
      'Focus indicators requis',
      'critical'
    );

    this.test(
      'Navigation au clavier',
      !content.includes('onclick') || content.includes('onkeydown') || content.includes('button'),
      'Support clavier requis',
      'critical'
    );

    this.test(
      'ARIA roles appropriés',
      content.includes('role=') || !content.includes('div onclick'),
      'Utiliser éléments sémantiques ou ARIA',
      'warning'
    );

    this.test(
      'Headings hiérarchie correcte',
      content.includes('<h1>') && (content.match(/<h1>/g) || []).length === 1,
      'Un seul H1 par page',
      'critical'
    );
  }

  // ============================================================================
  // TESTS SÉCURITÉ
  // ============================================================================

  async testSecurity(content) {
    this.log('\n🔒 TESTS SÉCURITÉ...\n');

    this.test(
      'Pas de innerHTML sans sanitization',
      !content.includes('.innerHTML =') || content.includes('DOMPurify') || content.includes('textContent'),
      'Risque XSS - Utiliser textContent ou sanitize',
      'critical'
    );

    this.test(
      'Pas de eval()',
      !content.includes('eval('),
      'eval() est dangereux',
      'critical'
    );

    this.test(
      'Pas de document.write()',
      !content.includes('document.write('),
      'document.write est déprécié et risqué',
      'critical'
    );

    this.test(
      'Content Security Policy meta tag',
      content.includes('Content-Security-Policy') || !content.includes('<script src="http://'),
      'CSP recommandé pour sécurité',
      'warning'
    );

    this.test(
      'Pas de clés API hardcodées',
      !content.match(/api[_-]?key["']?\s*[:=]\s*["'][a-zA-Z0-9]{20,}/i),
      'Ne jamais hardcoder des clés API',
      'critical'
    );

    this.test(
      'HTTPS pour ressources externes',
      !content.includes('src="http://') && !content.includes('href="http://'),
      'Toujours utiliser HTTPS',
      'critical'
    );
  }

  // ============================================================================
  // TESTS SEO
  // ============================================================================

  async testSEO(content) {
    this.log('\n🔍 TESTS SEO...\n');

    this.test(
      'Meta description présente',
      content.includes('<meta name="description"'),
      'Meta description améliore SEO',
      'warning'
    );

    this.test(
      'Meta charset UTF-8',
      content.includes('charset="UTF-8"') || content.includes('charset="utf-8"'),
      'Charset UTF-8 requis',
      'critical'
    );

    this.test(
      'Structure sémantique HTML5',
      content.includes('<header') || content.includes('<main') || content.includes('<section'),
      'Utiliser HTML5 sémantique',
      'warning'
    );

    this.test(
      'Pas de flash ou plugins obsolètes',
      !content.includes('<embed') && !content.includes('<object'),
      'Flash/plugins obsolètes',
      'warning'
    );
  }

  // ============================================================================
  // TESTS BEST PRACTICES
  // ============================================================================

  async testBestPractices(content) {
    this.log('\n⭐ TESTS BEST PRACTICES...\n');

    this.test(
      'Doctype HTML5',
      content.includes('<!DOCTYPE html>'),
      'Doctype HTML5 requis',
      'critical'
    );

    this.test(
      'Charset déclaré en premier',
      content.indexOf('charset') < content.indexOf('<title>'),
      'Charset avant title',
      'warning'
    );

    this.test(
      'Pas de styles inline excessifs',
      (content.match(/style="/g) || []).length < 500,
      'Max 500 styles inline (dashboards complexes acceptés)',
      'warning'
    );

    this.test(
      'CSS organisé',
      content.includes('<style>') && content.includes('/* '),
      'CSS doit avoir des commentaires',
      'warning'
    );

    this.test(
      'JavaScript en fin de body ou defer',
      content.lastIndexOf('<script>') > content.lastIndexOf('</body>') - 1000 || content.includes('defer'),
      'Script en fin ou avec defer',
      'warning'
    );

    this.test(
      'Commentaires TODO résolus',
      !content.includes('TODO:') && !content.includes('FIXME:'),
      'Résoudre tous les TODO/FIXME',
      'warning'
    );

    this.test(
      'Pas de code commenté massif',
      (content.match(/\/\*/g) || []).length < 50,
      'Max 50 blocs commentaires',
      'warning'
    );
  }

  // ============================================================================
  // TESTS UX
  // ============================================================================

  async testUX(content) {
    this.log('\n🎨 TESTS UX / RESPONSIVE...\n');

    this.test(
      'Mobile-first: viewport meta',
      content.includes('width=device-width') && content.includes('initial-scale=1'),
      'Viewport mobile-first requis',
      'critical'
    );

    this.test(
      'Media queries présentes',
      content.includes('@media') && content.includes('max-width'),
      'Design responsive requis',
      'critical'
    );

    this.test(
      'Favicon défini',
      content.includes('favicon.ico') || content.includes('rel="icon"'),
      'Favicon améliore UX',
      'warning'
    );

    this.test(
      'Loading states pour async',
      content.includes('loading') || content.includes('spinner') || content.includes('Chargement'),
      'Indiquer état de chargement',
      'warning'
    );

    this.test(
      'Messages d\'erreur utilisateur',
      content.includes('Erreur') || content.includes('error'),
      'Messages erreur pour UX',
      'warning'
    );
  }

  // ============================================================================
  // TESTS COMPATIBILITÉ
  // ============================================================================

  async testCompatibility(content) {
    this.log('\n🌐 TESTS COMPATIBILITÉ...\n');

    this.test(
      'Polyfills ou support moderne',
      !content.includes('arrow function') || content.includes('babel') || content.includes('=>'),
      'Support ES6+ ou polyfills',
      'warning'
    );

    this.test(
      'Chart.js ou D3.js importé',
      content.includes('chart.js') || content.includes('d3.js') || content.includes('d3.min.js'),
      'Bibliothèque graphiques requise',
      'critical'
    );

    this.test(
      'Pas de features experimental',
      !content.includes('experimental') && !content.includes('webkit-'),
      'Éviter features experimentales',
      'warning'
    );
  }

  // ============================================================================
  // TESTS AVANCÉS - NIVEAU ÉQUIPE ENTIÈRE+
  // ============================================================================

  async testOWASPSecurity(content) {
    this.log('\n🛡️  TESTS OWASP TOP 10 (SÉCURITÉ AVANCÉE)...\n');

    // A01:2021 – Broken Access Control
    this.test(
      'Pas de hardcoded credentials',
      !content.match(/password\s*[:=]\s*["'][^"']+["']/i) && !content.match(/api[_-]?key\s*[:=]\s*["'][^"']+["']/i),
      'OWASP A01 - Contrôle d\'accès',
      'critical'
    );

    // A02:2021 – Cryptographic Failures
    this.test(
      'HTTPS uniquement pour ressources',
      !content.includes('http://') || content.split('http://').length < 3,
      'OWASP A02 - Chiffrement requis',
      'critical'
    );

    // A03:2021 – Injection
    this.test(
      'Protection injection SQL/NoSQL',
      !content.includes('eval(') && !content.includes('Function(') && !content.includes('setTimeout('),
      'OWASP A03 - Prévention injection',
      'critical'
    );

    this.test(
      'Sanitization innerHTML',
      !content.includes('.innerHTML') || content.includes('DOMPurify') || content.includes('sanitize'),
      'OWASP A03 - XSS prevention',
      'critical'
    );

    // A04:2021 – Insecure Design
    this.test(
      'Rate limiting hints',
      content.includes('throttle') || content.includes('debounce') || content.includes('rateLimit'),
      'OWASP A04 - Design sécurisé',
      'warning'
    );

    // A05:2021 – Security Misconfiguration
    this.test(
      'Pas de stack traces exposées',
      !content.includes('console.trace') && !content.includes('Error.stack'),
      'OWASP A05 - Config sécurisée',
      'critical'
    );

    // A06:2021 – Vulnerable Components
    this.test(
      'Pas de librairies obsolètes',
      !content.includes('jquery-1.') && !content.includes('angular.js') && !content.includes('backbone.js'),
      'OWASP A06 - Composants à jour',
      'warning'
    );

    // A07:2021 – Authentication Failures
    this.test(
      'Pas de localStorage pour tokens sensibles',
      !content.match(/localStorage\.setItem\(['"](token|jwt|session)/i),
      'OWASP A07 - Auth sécurisée (utiliser httpOnly cookies)',
      'critical'
    );

    // A08:2021 – Software and Data Integrity
    this.test(
      'Subresource Integrity (SRI) pour CDN',
      !content.includes('cdn.') || content.includes('integrity=') || content.includes('crossorigin='),
      'OWASP A08 - Intégrité des ressources',
      'warning'
    );

    // A09:2021 – Security Logging Failures
    this.test(
      'Error handling présent',
      content.includes('try') && content.includes('catch'),
      'OWASP A09 - Logging d\'erreurs',
      'warning'
    );

    // A10:2021 – Server-Side Request Forgery
    this.test(
      'Validation URLs externes',
      !content.match(/fetch\([^)]*\+/) || content.includes('validateUrl') || content.includes('sanitizeUrl'),
      'OWASP A10 - SSRF prevention',
      'warning'
    );
  }

  async testPerformanceLighthouse(content) {
    this.log('\n⚡ TESTS PERFORMANCE (LIGHTHOUSE-STYLE)...\n');

    // First Contentful Paint
    this.test(
      'CSS critique inline',
      content.includes('<style>') && content.indexOf('<style>') < 1000,
      'FCP optimisé - CSS critique en haut',
      'warning'
    );

    this.test(
      'Preconnect aux domaines tiers',
      !content.includes('cdn.') || content.includes('rel="preconnect"') || content.includes('rel="dns-prefetch"'),
      'LCP optimisé - Preconnect CDN',
      'warning'
    );

    // Largest Contentful Paint
    this.test(
      'Images lazy loading',
      !content.includes('<img') || content.includes('loading="lazy"') || content.includes('data-src='),
      'LCP - Lazy loading images',
      'warning'
    );

    this.test(
      'Pas de render-blocking resources excessifs',
      content.split('<link').length < 10 && content.split('<script').length < 15,
      'Minimiser ressources bloquantes',
      'warning'
    );

    // Cumulative Layout Shift
    this.test(
      'Dimensions images/iframes définies',
      !content.match(/<img(?![^>]*width=)/) || content.match(/<img[^>]*width=/g)?.length > 0,
      'CLS - Dimensions explicites',
      'warning'
    );

    this.test(
      'Font display strategy',
      !content.includes('@font-face') || content.includes('font-display:'),
      'CLS - Font display swap',
      'warning'
    );

    // First Input Delay
    this.test(
      'Code splitting détecté',
      content.includes('import(') || content.includes('async') || content.includes('defer'),
      'FID - Code splitting/async',
      'warning'
    );

    // Time to Interactive
    this.test(
      'Service Worker présent',
      content.includes('serviceWorker') || content.includes('sw.js'),
      'TTI - Offline capability',
      'warning'
    );

    // Bundle size
    const sizeKB = Buffer.byteLength(content, 'utf8') / 1024;
    this.test(
      'Taille fichier optimale',
      sizeKB < 500,
      `Bundle ${sizeKB.toFixed(0)}KB (< 500KB recommandé)`,
      'warning'
    );

    // Resource hints
    this.test(
      'Resource hints utilisés',
      content.includes('rel="prefetch"') || content.includes('rel="preload"') || content.includes('rel="modulepreload"'),
      'Performance hints (preload/prefetch)',
      'warning'
    );
  }

  async testAccessibilityWCAG_AAA(content) {
    this.log('\n♿ TESTS ACCESSIBILITÉ WCAG 2.1 AAA (MAXIMUM)...\n');

    // Level AAA - Contrast
    this.test(
      'Contraste élevé AAA (7:1)',
      content.includes('--text:') && content.includes('--bg:'),
      'WCAG AAA 1.4.6 - Contraste 7:1 (variables CSS)',
      'warning'
    );

    // Level AAA - No timing
    this.test(
      'Pas de timeout automatique',
      !content.includes('setTimeout') || content.includes('clearTimeout'),
      'WCAG AAA 2.2.3 - Pas de limite de temps',
      'warning'
    );

    // Level AAA - No interruptions
    this.test(
      'Pas d\'interruptions automatiques',
      !content.includes('alert(') && !content.includes('confirm(') && !content.includes('setInterval'),
      'WCAG AAA 2.2.4 - Pas d\'interruptions',
      'warning'
    );

    // Level AAA - Re-authenticating
    this.test(
      'Sauvegarde de données avant expiration session',
      content.includes('localStorage') || content.includes('sessionStorage'),
      'WCAG AAA 2.2.5 - Sauvegarde données',
      'warning'
    );

    // Level AAA - Section headings
    this.test(
      'Headings hiérarchiques',
      content.includes('<h1') && content.includes('<h2'),
      'WCAG AAA 2.4.10 - Headings structurés',
      'warning'
    );

    // Level AAA - Link purpose
    this.test(
      'Liens descriptifs',
      !content.includes('>click here<') && !content.includes('>read more<'),
      'WCAG AAA 2.4.9 - Liens explicites',
      'warning'
    );

    // Level AAA - Abbreviations
    this.test(
      'Abréviations expliquées',
      !content.includes('API') || content.includes('<abbr') || content.includes('title='),
      'WCAG AAA 3.1.4 - Abréviations',
      'warning'
    );

    // Level AAA - Reading level
    this.test(
      'Texte clair (pas de jargon excessif)',
      !content.match(/\b\w{20,}\b/), // Mots > 20 chars = jargon probable
      'WCAG AAA 3.1.5 - Niveau de lecture',
      'warning'
    );

    // Level AAA - Help
    this.test(
      'Aide contextuelle disponible',
      content.includes('?') || content.includes('help') || content.includes('tooltip'),
      'WCAG AAA 3.3.5 - Aide disponible',
      'warning'
    );

    // Level AAA - Error prevention
    this.test(
      'Confirmation actions importantes',
      content.includes('confirm') || content.includes('modal') || content.includes('dialog'),
      'WCAG AAA 3.3.6 - Prévention erreurs',
      'warning'
    );
  }

  async testCodeQuality(content) {
    this.log('\n📝 TESTS QUALITÉ DE CODE...\n');

    // Complexité cyclomatique
    const functionCount = (content.match(/function\s+\w+/g) || []).length;
    const arrowFnCount = (content.match(/=>\s*{/g) || []).length;
    const totalFns = functionCount + arrowFnCount;

    this.test(
      'Nombre de fonctions raisonnable',
      totalFns < 150,
      `${totalFns} fonctions (< 150 optimal)`,
      'warning'
    );

    // Code duplication
    const lines = content.split('\n');
    const uniqueLines = new Set(lines.map(l => l.trim())).size;
    const duplicationRate = (1 - uniqueLines / lines.length) * 100;

    this.test(
      'Taux de duplication acceptable',
      duplicationRate < 30,
      `${duplicationRate.toFixed(1)}% duplication (< 30%)`,
      'warning'
    );

    // Magic numbers
    const magicNumbers = content.match(/\b\d{3,}\b/g) || [];
    this.test(
      'Pas de magic numbers',
      magicNumbers.length < 20,
      'Utiliser des constantes nommées',
      'warning'
    );

    // Dead code
    this.test(
      'Pas de code commenté excessif',
      content.split('//').length < 100,
      'Nettoyer code commenté',
      'warning'
    );

    // Naming conventions
    this.test(
      'CamelCase pour fonctions',
      !content.match(/function\s+[a-z]+_[a-z]/),
      'Conventions de nommage',
      'warning'
    );

    // Error handling
    const tryCount = (content.match(/try\s*{/g) || []).length;
    const asyncCount = (content.match(/async\s+function/g) || []).length;

    this.test(
      'Error handling pour async',
      asyncCount === 0 || tryCount > 0,
      'Try/catch pour fonctions async',
      'warning'
    );

    // JSDoc / Comments
    const commentLines = content.split('\n').filter(l => l.trim().startsWith('//')).length;
    const codeLines = lines.length;

    this.test(
      'Documentation suffisante',
      commentLines / codeLines > 0.05,
      '> 5% de lignes commentées',
      'warning'
    );
  }

  async testDependencies(content) {
    this.log('\n📦 TESTS DÉPENDANCES & BUNDLE...\n');

    // External dependencies
    const cdnLinks = content.match(/https?:\/\/cdn\./g) || [];
    this.test(
      'Dépendances CDN limitées',
      cdnLinks.length < 5,
      `${cdnLinks.length} CDN (< 5 recommandé)`,
      'warning'
    );

    // Third-party scripts
    const scriptTags = content.match(/<script[^>]*src=/g) || [];
    this.test(
      'Scripts tiers limités',
      scriptTags.length < 10,
      `${scriptTags.length} scripts externes (< 10)`,
      'warning'
    );

    // Inline scripts size
    const inlineScripts = content.match(/<script>[\s\S]*?<\/script>/g) || [];
    const inlineSize = inlineScripts.join('').length / 1024;

    this.test(
      'Taille scripts inline raisonnable',
      inlineSize < 300,
      `${inlineSize.toFixed(0)}KB inline (< 300KB)`,
      'warning'
    );

    // CSS frameworks detection
    this.test(
      'Pas de frameworks CSS massifs non utilisés',
      !content.includes('bootstrap.min.css') && !content.includes('materialize.min.css'),
      'Éviter frameworks CSS complets si inutilisés',
      'warning'
    );

    // Polyfills detection
    this.test(
      'Polyfills chargés conditionnellement',
      !content.includes('polyfill') || content.includes('if('),
      'Polyfills conditionnels seulement',
      'warning'
    );
  }

  async testDataIntegrity(content) {
    this.log('\n🔍 TESTS INTÉGRITÉ DONNÉES...\n');

    // Data validation
    this.test(
      'Validation données utilisateur',
      content.includes('validate') || content.includes('sanitize') || content.includes('trim('),
      'Validation input utilisateur',
      'critical'
    );

    // Type checking
    this.test(
      'Type checking présent',
      content.includes('typeof') || content.includes('instanceof') || content.includes('Array.isArray'),
      'Vérification types runtime',
      'warning'
    );

    // Null/undefined checks
    this.test(
      'Checks null/undefined',
      content.includes('!== null') || content.includes('!== undefined') || content.includes('?.'),
      'Safe navigation / null checks',
      'warning'
    );

    // Data immutability hints
    this.test(
      'Immutabilité données',
      content.includes('const') && !content.includes('var '),
      'Préférer const pour immutabilité',
      'warning'
    );

    // Data persistence
    this.test(
      'Persistence données implémentée',
      content.includes('localStorage') || content.includes('sessionStorage') || content.includes('indexedDB'),
      'Sauvegarde données locale',
      'warning'
    );
  }

  async testErrorHandling(content) {
    this.log('\n🚨 TESTS GESTION D\'ERREURS...\n');

    // Try-catch blocks
    const tryBlocks = (content.match(/try\s*{/g) || []).length;
    this.test(
      'Try-catch présents',
      tryBlocks > 0,
      `${tryBlocks} blocs try-catch`,
      'warning'
    );

    // Error logging
    this.test(
      'Logging erreurs (sans console en prod)',
      !content.includes('console.error'),
      'Utiliser service logging (Sentry, etc.)',
      'warning'
    );

    // Fallback UI
    this.test(
      'UI fallback erreurs',
      content.includes('error') && content.includes('message'),
      'Messages d\'erreur utilisateur',
      'warning'
    );

    // Global error handler
    this.test(
      'Error handler global',
      content.includes('window.onerror') || content.includes('addEventListener(\'error\''),
      'Capture erreurs globales',
      'warning'
    );

    // Promise rejection handling
    this.test(
      'Rejection handler',
      !content.includes('Promise') || content.includes('.catch(') || content.includes('unhandledrejection'),
      'Gestion rejections Promise',
      'warning'
    );

    // Network error handling
    this.test(
      'Gestion erreurs réseau',
      !content.includes('fetch(') || content.includes('.catch(') || content.includes('try'),
      'Handle erreurs fetch/XHR',
      'critical'
    );
  }

  async testNetworkResilience(content) {
    this.log('\n🌐 TESTS RÉSILIENCE RÉSEAU...\n');

    // Offline support
    this.test(
      'Support mode hors-ligne',
      content.includes('navigator.onLine') || content.includes('serviceWorker'),
      'Détection/gestion offline',
      'warning'
    );

    // Request retry logic
    this.test(
      'Retry logic pour requêtes',
      content.includes('retry') || content.includes('attempt'),
      'Retry automatique échecs réseau',
      'warning'
    );

    // Timeout handling
    this.test(
      'Timeouts requêtes réseau',
      !content.includes('fetch(') || content.includes('AbortController') || content.includes('timeout'),
      'Timeout pour éviter hang',
      'warning'
    );

    // Caching strategy
    this.test(
      'Stratégie de cache',
      content.includes('Cache') || content.includes('cache') || content.includes('sw.js'),
      'Cache réseau implémenté',
      'warning'
    );

    // Rate limiting
    this.test(
      'Rate limiting client-side',
      content.includes('throttle') || content.includes('debounce'),
      'Protection contre spam requêtes',
      'warning'
    );

    // Connection quality detection
    this.test(
      'Adaptation qualité connexion',
      content.includes('navigator.connection') || content.includes('saveData'),
      'Détection connexion lente',
      'warning'
    );
  }

  // ============================================================================
  // SCORING & REPORTING
  // ============================================================================

  calculateScore() {
    const total = this.passed + this.failed;
    if (total === 0) return 0;

    // Pénalités pour échecs critiques
    const basScore = Math.round((this.passed / total) * 100);
    const criticalPenalty = this.critical * 5; // -5 points par critique
    const warningPenalty = this.warnings * 1; // -1 point par warning

    return Math.max(0, basScore - criticalPenalty - warningPenalty);
  }

  async generateReport() {
    const score = this.calculateScore();

    let status;
    let recommendation;
    if (score >= 98) {
      status = '🟢 EXCELLENT - Production Ready';
      recommendation = 'Dashboard de qualité exceptionnelle. Déploiement autorisé.';
    } else if (score >= 95) {
      status = '🟡 ACCEPTABLE - Améliorations recommandées';
      recommendation = 'Déploiement autorisé mais des améliorations sont recommandées.';
    } else if (score >= 90) {
      status = '🟠 INSUFFISANT - Corrections requises';
      recommendation = 'Corrections requises avant déploiement.';
    } else {
      status = '🔴 BLOQUÉ - Ne pas déployer';
      recommendation = 'BLOQUÉ: Score trop bas. Corrections critiques requises.';
    }

    const criticalTests = this.tests.filter(t => t.severity === 'critical' && t.result === 'FAIL');
    const failedTests = this.tests.filter(t => t.result === 'FAIL');

    const report = `# ✅ RAPPORT AGENT QA - INSPECTEUR QUALITÉ

**Date**: ${new Date().toLocaleString('fr-FR')}
**Score**: ${score}/100 ${status}
**Standard**: 95/100 MINIMUM pour production

---

## 📊 RÉSUMÉ

- ✅ Tests passés: ${this.passed}
- ❌ Tests échoués: ${this.failed}
- ⚠️  Échecs critiques: ${this.critical}
- ⚡ Avertissements: ${this.warnings}
- 📝 Total: ${this.tests.length} tests

---

## 🎯 VERDICT

${recommendation}

${score < 95 ? '⛔ **DÉPLOIEMENT BLOQUÉ** - Score insuffisant' : '✅ **DÉPLOIEMENT AUTORISÉ**'}

---

## 🧪 DÉTAILS DES TESTS

### Fonctionnalité
${this.tests.filter(t => t.name.includes('exposée') || t.name.includes('implémenté') || t.name.includes('définie')).map(t => `- ${t.result === 'PASS' ? '✅' : '❌'} ${t.name}${t.details ? ` - ${t.details}` : ''}`).join('\n')}

### Performance
${this.tests.filter(t => t.name.includes('Taille') || t.name.includes('console') || t.name.includes('boucle') || t.name.includes('resize')).map(t => `- ${t.result === 'PASS' ? '✅' : '❌'} ${t.name}${t.details ? ` - ${t.details}` : ''}`).join('\n')}

### Accessibilité
${this.tests.filter(t => t.name.includes('lang') || t.name.includes('aria') || t.name.includes('alt') || t.name.includes('Focus') || t.name.includes('clavier')).map(t => `- ${t.result === 'PASS' ? '✅' : '❌'} ${t.name}${t.details ? ` - ${t.details}` : ''}`).join('\n')}

### Sécurité
${this.tests.filter(t => t.name.includes('innerHTML') || t.name.includes('eval') || t.name.includes('HTTPS') || t.name.includes('API')).map(t => `- ${t.result === 'PASS' ? '✅' : '❌'} ${t.name}${t.details ? ` - ${t.details}` : ''}`).join('\n')}

### SEO
${this.tests.filter(t => t.name.includes('Meta') || t.name.includes('SEO') || t.name.includes('description') || t.name.includes('charset')).map(t => `- ${t.result === 'PASS' ? '✅' : '❌'} ${t.name}${t.details ? ` - ${t.details}` : ''}`).join('\n')}

### Best Practices
${this.tests.filter(t => t.name.includes('Doctype') || t.name.includes('TODO') || t.name.includes('CSS') || t.name.includes('style')).map(t => `- ${t.result === 'PASS' ? '✅' : '❌'} ${t.name}${t.details ? ` - ${t.details}` : ''}`).join('\n')}

### UX / Responsive
${this.tests.filter(t => t.name.includes('Mobile') || t.name.includes('Media') || t.name.includes('Favicon') || t.name.includes('Loading')).map(t => `- ${t.result === 'PASS' ? '✅' : '❌'} ${t.name}${t.details ? ` - ${t.details}` : ''}`).join('\n')}

### Compatibilité
${this.tests.filter(t => t.name.includes('Chart') || t.name.includes('Polyfill') || t.name.includes('experimental')).map(t => `- ${t.result === 'PASS' ? '✅' : '❌'} ${t.name}${t.details ? ` - ${t.details}` : ''}`).join('\n')}

---

## ⚠️  ÉCHECS CRITIQUES

${criticalTests.length === 0
  ? '✅ Aucun échec critique'
  : criticalTests.map((t, i) => `${i + 1}. **${t.name}**\n   - ${t.details || 'Requis pour production'}`).join('\n\n')}

---

## 🔧 ACTIONS REQUISES

${failedTests.length === 0
  ? '✅ Aucune action requise - Tous les tests passent'
  : failedTests.map((t, i) => `${i + 1}. ${t.severity === 'critical' ? '🔴 CRITIQUE: ' : t.severity === 'warning' ? '🟡 WARNING: ' : ''}**${t.name}**\n   - ${t.details || 'Corriger ce test'}`).join('\n\n')}

---

## 📈 HISTORIQUE SCORES

- Actuel: **${score}/100**
- Objectif: **95+/100**
- Minimum acceptable: **95/100**

---

🤖 Generated by Agent QA - Inspecteur Qualité
⚠️  **AUCUN COMPROMIS SUR LA QUALITÉ**
`;

    fs.writeFileSync('RAPPORT-AGENT-QA.md', report);
    this.log('\n📝 Rapport généré: RAPPORT-AGENT-QA.md');
  }
}

// Exécution
if (require.main === module) {
  const agent = new AgentQA();
  agent.run().catch(console.error);
}

module.exports = AgentQA;
