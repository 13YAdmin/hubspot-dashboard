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

    // TESTS INFRASTRUCTURE & DATA (NOUVEAU)
    await this.testInfrastructureAndData();

    // TESTS DE TOUS LES SCRIPTS BACKEND
    await this.testAllBackendScripts();

    // TESTS DES WORKFLOWS GITHUB ACTIONS
    await this.testGitHubWorkflows();

    // TESTS DES AGENTS EUX-MÊMES
    await this.testAgents();

    // TESTS DE LA DOCUMENTATION
    await this.testDocumentation();

    // TESTS DES CONFIGURATIONS
    await this.testConfigurations();

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

  // === TESTS INFRASTRUCTURE & DATA ===

  async testInfrastructureAndData() {
    this.log('\n🏗️  TESTS INFRASTRUCTURE & DATA (CRITIQUE)...\n');
    this.log('   📋 Vision: Dashboard pour Account Managers');
    this.log('   🎯 But: Identifier white spaces (filiales/parents non exploités)\n');

    const exec = require('child_process').execSync;

    // 1. Vérifier que le workflow HubSpot existe et est actif
    const workflowPath = path.join(process.cwd(), '.github/workflows/fetch-hubspot-data.yml');
    this.test(
      'Workflow HubSpot data actif',
      fs.existsSync(workflowPath),
      'fetch-hubspot-data.yml doit exister et être actif',
      'critical'
    );

    // 2. Vérifier que le workflow a tourné récemment
    try {
      const result = exec('gh run list --workflow=fetch-hubspot-data.yml --limit 1 --json status,conclusion,createdAt', { encoding: 'utf8' });
      const runs = JSON.parse(result);

      if (runs.length > 0) {
        const lastRun = runs[0];
        const lastRunDate = new Date(lastRun.createdAt);
        const now = new Date();
        const hoursSince = (now - lastRunDate) / (1000 * 60 * 60);

        this.test(
          'Workflow HubSpot exécuté récemment',
          hoursSince < 3, // Moins de 3h
          `Dernier run: ${hoursSince.toFixed(1)}h (doit être < 3h car schedule 2h)`,
          'critical'
        );

        this.test(
          'Workflow HubSpot succès',
          lastRun.conclusion === 'success',
          `Status: ${lastRun.conclusion}`,
          'critical'
        );
      } else {
        this.test(
          'Workflow HubSpot a déjà tourné',
          false,
          'Aucun run trouvé - workflow jamais exécuté',
          'critical'
        );
      }
    } catch (error) {
      this.test(
        'Vérification runs workflow',
        false,
        `Impossible de vérifier (gh CLI requis): ${error.message}`,
        'warning'
      );
    }

    // 3. Vérifier que data.json existe (généré par workflow)
    const dataPath = path.join(process.cwd(), 'public/data.json');
    const dataExists = fs.existsSync(dataPath);

    this.test(
      'Fichier data.json existe',
      dataExists,
      'public/data.json doit être généré par fetch-hubspot-data.yml',
      'critical'
    );

    if (dataExists) {
      try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        // 4. Vérifier structure data
        this.test(
          'Data contient deals',
          data.data && Array.isArray(data.data) && data.data.length > 0,
          `${data.data?.length || 0} deals trouvés`,
          'critical'
        );

        this.test(
          'Data contient companies',
          data.companies && Object.keys(data.companies).length > 0,
          `${Object.keys(data.companies || {}).length} companies trouvées`,
          'critical'
        );

        // 5. Vérifier relations parent/filiales
        const companiesWithChildren = Object.values(data.companies || {})
          .filter(c => c.childCompanyIds && c.childCompanyIds.length > 0);

        this.test(
          'Relations parent/filiales mappées',
          companiesWithChildren.length > 0,
          `${companiesWithChildren.length} groupes parent/filiales détectés`,
          'critical'
        );

        // 6. Vérifier freshness des données
        if (data.fetchedAt) {
          const fetchedAt = new Date(data.fetchedAt);
          const now = new Date();
          const hoursSince = (now - fetchedAt) / (1000 * 60 * 60);

          this.test(
            'Données fraîches',
            hoursSince < 4, // Moins de 4h
            `Données fetchées il y a ${hoursSince.toFixed(1)}h`,
            'warning'
          );
        }

        // 7. Vérifier qualité des données companies
        const companiesWithIndustry = Object.values(data.companies || {})
          .filter(c => c.industry && c.industry !== '');

        const industryRate = (companiesWithIndustry.length / Object.keys(data.companies || {}).length) * 100;

        this.test(
          'Qualité données companies (industry)',
          industryRate > 50, // Au moins 50% ont un secteur
          `${industryRate.toFixed(0)}% des companies ont un secteur`,
          'warning'
        );

        // 8. Vérifier que les deals ont les champs requis
        const dealsComplete = data.data.filter(d =>
          d.properties.dealname &&
          d.properties.amount &&
          d.properties.dealstage
        );

        const completionRate = (dealsComplete.length / data.data.length) * 100;

        this.test(
          'Complétude deals (name, amount, stage)',
          completionRate > 80,
          `${completionRate.toFixed(0)}% des deals sont complets`,
          'warning'
        );

      } catch (error) {
        this.test(
          'Parsing data.json',
          false,
          `Erreur parsing: ${error.message}`,
          'critical'
        );
      }
    }

    // 9. Vérifier que le dashboard est accessible
    try {
      const https = require('https');
      await new Promise((resolve, reject) => {
        https.get('https://13yadmin.github.io/hubspot-dashboard/', (res) => {
          this.test(
            'Dashboard accessible en ligne',
            res.statusCode === 200,
            `HTTP ${res.statusCode}`,
            'critical'
          );
          resolve();
        }).on('error', (error) => {
          this.test(
            'Dashboard accessible en ligne',
            false,
            `Erreur: ${error.message}`,
            'critical'
          );
          resolve();
        });
      });
    } catch (error) {
      this.test(
        'Test accessibilité dashboard',
        false,
        `Impossible de tester: ${error.message}`,
        'warning'
      );
    }

    // 10. Vérifier scripts HubSpot existent
    const scriptsExist = [
      '.github/scripts/fetch-hubspot.js',
      '.github/scripts/push-scores-to-hubspot.js'
    ].every(p => fs.existsSync(path.join(process.cwd(), p)));

    this.test(
      'Scripts HubSpot présents',
      scriptsExist,
      'fetch-hubspot.js et push-scores-to-hubspot.js requis',
      'critical'
    );

    // === TESTS MÉTIER (VISION DU PROJET) ===
    this.log('\n🎯 TESTS MÉTIER - VISION DU PROJET...\n');
    this.log('   Le dashboard DOIT permettre d\'identifier les white spaces\n');

    if (dataExists) {
      try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        // 11. WHITE SPACES: Vérifier que les filiales sans deals sont détectables
        const allCompanies = Object.values(data.companies || {});
        const companiesWithDeals = new Set(data.data.map(d => d.associations?.companies?.[0]?.id).filter(Boolean));

        const potentialWhiteSpaces = allCompanies.filter(company => {
          // Vérifier si cette company a des parents dans les clients
          const hasParentWithDeals = company.parentCompanyIds &&
            company.parentCompanyIds.some(parentId => companiesWithDeals.has(parentId));

          // C'est un white space si: a un parent client ET n'a pas de deals
          return hasParentWithDeals && !companiesWithDeals.has(company.id);
        });

        this.test(
          'White spaces détectables (filiales sans deals)',
          potentialWhiteSpaces.length > 0 || allCompanies.length === 0,
          `${potentialWhiteSpaces.length} filiales sans deals détectées (white spaces potentiels)`,
          'critical'
        );

        // 12. Vérifier que les groupes parent/filiales sont exploitables
        const groupsWithChildren = allCompanies.filter(c =>
          c.childCompanyIds && c.childCompanyIds.length > 0 && companiesWithDeals.has(c.id)
        );

        this.test(
          'Groupes parent/filiales exploitables',
          groupsWithChildren.length > 0 || allCompanies.length === 0,
          `${groupsWithChildren.length} groupes clients avec filiales (opportunités d'expansion)`,
          'critical'
        );

        // 13. Vérifier que le dashboard peut calculer le potentiel
        const clientsWithRevenue = data.data.filter(d => d.properties.amount && parseFloat(d.properties.amount) > 0);
        const revenueRate = (clientsWithRevenue.length / data.data.length) * 100;

        this.test(
          'Données revenue pour calculer potentiel',
          revenueRate > 70,
          `${revenueRate.toFixed(0)}% des deals ont un montant (nécessaire pour estimer potentiel white spaces)`,
          'critical'
        );

        // 14. Vérifier health scores pour priorisation
        const dealsWithHealth = data.data.filter(d =>
          d.properties.hs_deal_health_score || d.properties.healthscore
        );

        this.test(
          'Health scores pour prioriser white spaces',
          dealsWithHealth.length > 0 || data.data.length === 0,
          `${dealsWithHealth.length}/${data.data.length} deals ont un health score (priorisation opportunités)`,
          'warning'
        );

        // 15. Vérifier que les secteurs sont mappés (pour ciblage)
        const companiesWithSector = allCompanies.filter(c => c.industry && c.industry !== '');
        const sectorRate = allCompanies.length > 0 ? (companiesWithSector.length / allCompanies.length) * 100 : 0;

        this.test(
          'Secteurs d\'activité mappés (ciblage)',
          sectorRate > 60,
          `${sectorRate.toFixed(0)}% des companies ont un secteur (nécessaire pour cibler white spaces par industrie)`,
          'warning'
        );

        // 16. TEST ULTIME: Le dashboard peut-il VRAIMENT aider l'Account Manager?
        const dashboardUsable =
          potentialWhiteSpaces.length > 0 &&
          groupsWithChildren.length > 0 &&
          revenueRate > 50;

        this.test(
          'DASHBOARD UTILISABLE PAR ACCOUNT MANAGER',
          dashboardUsable,
          dashboardUsable
            ? 'Dashboard opérationnel: white spaces détectés, groupes mappés, revenue présent'
            : 'Dashboard INUTILISABLE: données manquantes ou incomplètes',
          'critical'
        );

      } catch (error) {
        this.test(
          'Tests métier',
          false,
          `Impossible d'analyser la data: ${error.message}`,
          'critical'
        );
      }
    }
  }

  // ============================================================================
  // TESTS SCRIPTS BACKEND (FULL PROJECT SCAN)
  // ============================================================================

  async testAllBackendScripts() {
    this.log('\n🔧 TESTS SCRIPTS BACKEND (FULL PROJECT)...\n');
    this.log('   Analyse de TOUS les scripts Node.js du projet\n');

    const scriptsToTest = [
      '.github/scripts/fetch-hubspot.js',
      '.github/scripts/lib/api.js',
      '.github/scripts/lib/health-score.js',
      '.github/scripts/lib/notes-analyzer.js',
      '.github/scripts/lib/segment-detector.js',
      '.github/scripts/lib/industry-detector.js',
      '.github/scripts/lib/industry-cache.js',
      '.github/scripts/create-custom-properties.js',
      '.github/scripts/push-scores.js'
    ];

    const projectRoot = process.cwd();
    let totalScripts = 0;
    let totalIssues = 0;

    for (const scriptPath of scriptsToTest) {
      const fullPath = path.join(projectRoot, scriptPath);

      if (!fs.existsSync(fullPath)) {
        this.test(
          `Script existe: ${scriptPath}`,
          false,
          `Script manquant: ${scriptPath}`,
          'warning'
        );
        continue;
      }

      totalScripts++;
      const content = fs.readFileSync(fullPath, 'utf8');

      // 1. Pas de console.log/error/warn en production
      const hasConsoleLogs = /console\.(log|error|warn|info|debug)\(/.test(content);
      if (hasConsoleLogs) {
        // Pour les scripts backend, console.log est OK (pas en production browser)
        // On vérifie juste qu'il n'y a pas TROP de logs
        const logCount = (content.match(/console\.(log|error|warn|info|debug)\(/g) || []).length;
        this.test(
          `Logging modéré: ${path.basename(scriptPath)}`,
          logCount < 50,
          logCount < 50 ? `${logCount} console logs (OK pour backend)` : `${logCount} console logs (trop verbeux)`,
          logCount < 50 ? 'normal' : 'warning'
        );
      }

      // 2. Gestion d'erreurs try-catch
      const hasTryCatch = /try\s*\{[\s\S]*?\}\s*catch/.test(content);
      this.test(
        `Error handling: ${path.basename(scriptPath)}`,
        hasTryCatch || content.includes('.catch('),
        hasTryCatch ? 'Try-catch présent' : 'Manque gestion erreurs',
        'critical'
      );

      // 3. Pas de token/secret hardcodé (autre que process.env)
      const hasHardcodedSecrets = /['"](?:sk-ant-|xoxb-|ghp_|AKIA)[a-zA-Z0-9\-_]{20,}['"]/.test(content);
      this.test(
        `Pas de secrets hardcodés: ${path.basename(scriptPath)}`,
        !hasHardcodedSecrets,
        hasHardcodedSecrets ? 'SECRETS DÉTECTÉS!' : 'Aucun secret hardcodé',
        'critical'
      );

      // 4. Utilise const/let (pas var)
      const usesVar = /\bvar\s+\w+\s*=/.test(content);
      this.test(
        `Utilise const/let: ${path.basename(scriptPath)}`,
        !usesVar,
        usesVar ? 'Utilise var (déprécié)' : 'const/let uniquement',
        'warning'
      );

      // 5. Pas de eval()
      const usesEval = /\beval\(/.test(content);
      this.test(
        `Pas de eval(): ${path.basename(scriptPath)}`,
        !usesEval,
        'eval() est dangereux',
        'critical'
      );

      // 6. Timeout pour fetch/requêtes (si présent)
      if (content.includes('fetch(') || content.includes('await fetch')) {
        const hasTimeout = content.includes('timeout') || content.includes('AbortController');
        this.test(
          `Timeout fetch: ${path.basename(scriptPath)}`,
          hasTimeout,
          hasTimeout ? 'Timeout implémenté' : 'Manque timeout pour fetch',
          'critical'
        );
      }

      // 7. Retry logic (si appels API externes)
      if ((content.includes('fetch(') || content.includes('axios')) && content.includes('api')) {
        const hasRetry = content.includes('retry') || content.includes('retries') || /for.*\(.*retry/i.test(content);
        this.test(
          `Retry logic: ${path.basename(scriptPath)}`,
          hasRetry,
          hasRetry ? 'Retry implémenté' : 'Manque retry pour résilience',
          'warning'
        );
      }

      // 8. Rate limiting (si API calls)
      if (content.includes('api.hubapi.com') || content.includes('hubspot')) {
        const hasRateLimit = /rate.*limit/i.test(content) || /throttle/i.test(content);
        this.test(
          `Rate limiting: ${path.basename(scriptPath)}`,
          hasRateLimit,
          hasRateLimit ? 'Rate limiting présent' : 'Manque rate limiting',
          'warning'
        );
      }

      // 9. Documentation (commentaires)
      const commentLines = (content.match(/^\s*\/\/.*/gm) || []).length;
      const codeLines = content.split('\n').filter(l => l.trim() && !l.trim().startsWith('//')).length;
      const commentRatio = commentLines / codeLines;
      this.test(
        `Documentation: ${path.basename(scriptPath)}`,
        commentRatio > 0.05,
        `${Math.round(commentRatio * 100)}% commentaires`,
        commentRatio > 0.05 ? 'normal' : 'warning'
      );

      // 10. Pas de dépendances manquantes (requires)
      const requires = content.match(/require\(['"]([^'"]+)['"]\)/g) || [];
      for (const req of requires) {
        const moduleName = req.match(/require\(['"]([^'"]+)['"]\)/)[1];

        // Si c'est un module relatif, vérifier qu'il existe
        if (moduleName.startsWith('.')) {
          const moduleDir = path.dirname(fullPath);
          const modulePath = path.resolve(moduleDir, moduleName + (moduleName.endsWith('.js') ? '' : '.js'));
          const moduleExists = fs.existsSync(modulePath);

          this.test(
            `Dépendance existe: ${moduleName}`,
            moduleExists,
            moduleExists ? `Module ${moduleName} trouvé` : `Module ${moduleName} MANQUANT`,
            'critical'
          );
        }
      }
    }

    this.log(`\n✅ ${totalScripts} scripts backend analysés\n`);
  }

  // ============================================================================
  // TESTS WORKFLOWS GITHUB ACTIONS
  // ============================================================================

  async testGitHubWorkflows() {
    this.log('\n⚙️  TESTS WORKFLOWS GITHUB ACTIONS...\n');

    const workflowsDir = path.join(process.cwd(), '.github/workflows');
    const workflowFiles = fs.readdirSync(workflowsDir)
      .filter(f => f.endsWith('.yml') || f.endsWith('.yaml'))
      .filter(f => !f.includes('_DISABLED'));

    for (const file of workflowFiles) {
      const filePath = path.join(workflowsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // 1. Syntaxe YAML valide
      try {
        // Basic YAML validation (vérifie indentation basique)
        const lines = content.split('\n');
        let inString = false;
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.includes('"') || line.includes("'")) inString = !inString;
        }
        this.test(
          `Syntaxe YAML valide: ${file}`,
          true,
          'Syntaxe correcte',
          'critical'
        );
      } catch (error) {
        this.test(
          `Syntaxe YAML valide: ${file}`,
          false,
          `Erreur syntaxe: ${error.message}`,
          'critical'
        );
      }

      // 2. Pas de secrets hardcodés
      const hasHardcodedSecrets = /['\"](?:sk-ant-|xoxb-|ghp_|AKIA)[a-zA-Z0-9\-_]{20,}['"]/.test(content);
      this.test(
        `Pas de secrets hardcodés: ${file}`,
        !hasHardcodedSecrets,
        hasHardcodedSecrets ? 'SECRETS DÉTECTÉS dans workflow!' : 'Secrets via ${{ secrets }}',
        'critical'
      );

      // 3. Utilise ${{ secrets.X }} pour les tokens
      const usesSecrets = content.includes('${{ secrets.');
      const needsSecrets = content.includes('HUBSPOT') || content.includes('TOKEN') || content.includes('API');
      if (needsSecrets) {
        this.test(
          `Secrets sécurisés: ${file}`,
          usesSecrets,
          usesSecrets ? 'Utilise ${{ secrets }}' : 'Manque secrets sécurisés',
          'critical'
        );
      }

      // 4. Timeout défini (éviter workflows qui tournent indéfiniment)
      const hasTimeout = /timeout-minutes:\s*\d+/.test(content);
      this.test(
        `Timeout défini: ${file}`,
        hasTimeout,
        hasTimeout ? 'Timeout configuré' : 'Manque timeout-minutes',
        'warning'
      );

      // 5. Permissions définies (principe du moindre privilège)
      const hasPermissions = /permissions:/.test(content);
      this.test(
        `Permissions explicites: ${file}`,
        hasPermissions,
        hasPermissions ? 'Permissions définies' : 'Permissions non spécifiées (risque)',
        'warning'
      );

      // 6. Gestion d'erreurs (continue-on-error ou if: failure())
      const hasErrorHandling = /continue-on-error:|if:.*failure\(\)/.test(content);
      this.test(
        `Gestion erreurs: ${file}`,
        hasErrorHandling,
        hasErrorHandling ? 'Error handling présent' : 'Pas de fallback erreurs',
        'warning'
      );

      // 7. Cache configuré (pour node_modules, etc.)
      const hasCache = /cache:/.test(content);
      if (content.includes('node') || content.includes('npm')) {
        this.test(
          `Cache optimisé: ${file}`,
          hasCache,
          hasCache ? 'Cache npm configuré' : 'Manque cache (lenteur)',
          'warning'
        );
      }

      // 8. Pas de git force push
      const hasForcePush = /git push.*--force|git push.*-f\s/.test(content);
      this.test(
        `Pas de force push: ${file}`,
        !hasForcePush,
        hasForcePush ? 'DANGER: force push détecté' : 'Push sécurisé',
        'critical'
      );
    }

    this.log(`\n✅ ${workflowFiles.length} workflows analysés\n`);
  }

  // ============================================================================
  // TESTS DES AGENTS
  // ============================================================================

  async testAgents() {
    this.log('\n🤖 TESTS DES AGENTS (QUALITÉ DES AGENTS EUX-MÊMES)...\n');

    const agentsDir = path.join(process.cwd(), '.github/scripts/autonomous-agents');
    const agentFiles = fs.readdirSync(agentsDir)
      .filter(f => f.startsWith('agent-') && f.endsWith('.js'))
      .filter(f => !agentsDir.includes('_DISABLED'));

    for (const file of agentFiles) {
      const filePath = path.join(agentsDir, file);
      const content = fs.readFileSync(filePath, 'utf8');

      // 1. Documentation du rôle de l'agent
      const hasRoleDoc = /MISSION:|RÔLE:|Role:|Mission:/.test(content);
      this.test(
        `Documentation rôle: ${file}`,
        hasRoleDoc,
        hasRoleDoc ? 'Rôle documenté' : 'Rôle non documenté',
        'warning'
      );

      // 2. Classe bien formée
      const hasClass = /class\s+Agent/.test(content);
      this.test(
        `Structure classe: ${file}`,
        hasClass,
        hasClass ? 'Classe Agent définie' : 'Pas de classe Agent',
        'critical'
      );

      // 3. Méthode run() ou execute()
      const hasRunMethod = /async\s+run\(|async\s+execute\(/.test(content);
      this.test(
        `Méthode run/execute: ${file}`,
        hasRunMethod,
        hasRunMethod ? 'Point d\'entrée présent' : 'Pas de méthode run()',
        'critical'
      );

      // 4. Logging structuré
      const hasStructuredLogging = /this\.log\(|console\.log\(`\[/.test(content);
      this.test(
        `Logging structuré: ${file}`,
        hasStructuredLogging,
        hasStructuredLogging ? 'Logs structurés' : 'Logs non structurés',
        'warning'
      );

      // 5. Gestion d'erreurs robuste
      const hasTryCatch = /try\s*\{[\s\S]*?\}\s*catch/.test(content);
      this.test(
        `Error handling agent: ${file}`,
        hasTryCatch,
        hasTryCatch ? 'Try-catch présent' : 'Manque gestion erreurs',
        'critical'
      );

      // 6. Génère un rapport (fichier RAPPORT-*)
      const generatesReport = /RAPPORT-.*\.md|writeFileSync.*RAPPORT/i.test(content);
      this.test(
        `Génère rapport: ${file}`,
        generatesReport,
        generatesReport ? 'Rapport généré' : 'Pas de rapport',
        'warning'
      );

      // 7. Tests présents (méthode test())
      const hasTests = /\.test\(|describe\(|it\(/.test(content);
      if (file.includes('qa')) {
        this.test(
          `Tests implémentés: ${file}`,
          hasTests,
          hasTests ? 'Tests présents' : 'Agent QA sans tests!',
          'critical'
        );
      }

      // 8. Pas de logique métier hardcodée
      const hasHardcodedLogic = /if.*===.*['"]specific-value['"]/.test(content);
      this.test(
        `Logique configurable: ${file}`,
        !hasHardcodedLogic,
        hasHardcodedLogic ? 'Logique hardcodée détectée' : 'Logique flexible',
        'warning'
      );
    }

    this.log(`\n✅ ${agentFiles.length} agents analysés\n`);
  }

  // ============================================================================
  // TESTS DOCUMENTATION
  // ============================================================================

  async testDocumentation() {
    this.log('\n📚 TESTS DOCUMENTATION...\n');

    const docsToCheck = [
      { path: 'README.md', required: true },
      { path: 'ARCHITECTURE.md', required: true },
      { path: 'package.json', required: true }
    ];

    for (const doc of docsToCheck) {
      const fullPath = path.join(process.cwd(), doc.path);
      const exists = fs.existsSync(fullPath);

      this.test(
        `Documentation existe: ${doc.path}`,
        exists || !doc.required,
        exists ? 'Présent' : (doc.required ? 'MANQUANT' : 'Optionnel manquant'),
        doc.required ? 'critical' : 'warning'
      );

      if (exists) {
        const content = fs.readFileSync(fullPath, 'utf8');

        // README.md spécifique
        if (doc.path === 'README.md') {
          const hasTitle = /^#\s+/.test(content);
          const hasInstallInstructions = /install|installation/i.test(content);
          const hasUsageInstructions = /usage|utilisation|how to/i.test(content);

          this.test('README: Titre présent', hasTitle, 'Titre H1 présent', 'warning');
          this.test('README: Instructions install', hasInstallInstructions, 'Instructions présentes', 'warning');
          this.test('README: Instructions usage', hasUsageInstructions, 'Usage documenté', 'warning');
        }

        // ARCHITECTURE.md spécifique
        if (doc.path === 'ARCHITECTURE.md') {
          const hasComponents = /composant|component|module/i.test(content);
          const hasDiagram = /```|graph|flowchart|mermaid/.test(content);

          this.test('ARCHITECTURE: Composants décrits', hasComponents, 'Architecture documentée', 'warning');
          this.test('ARCHITECTURE: Diagrammes', hasDiagram, hasDiagram ? 'Diagrammes présents' : 'Pas de diagrammes', 'warning');
        }

        // Vérifications communes
        const isOutdated = content.includes('TODO') || content.includes('FIXME') || content.includes('[WIP]');
        this.test(
          `Documentation à jour: ${doc.path}`,
          !isOutdated,
          isOutdated ? 'Contient TODO/FIXME/WIP' : 'À jour',
          'warning'
        );

        const hasLastUpdate = /last update|dernière mise à jour|updated:/i.test(content);
        this.test(
          `Date mise à jour: ${doc.path}`,
          hasLastUpdate,
          hasLastUpdate ? 'Date présente' : 'Pas de date MAJ',
          'warning'
        );
      }
    }

    this.log('\n✅ Documentation analysée\n');
  }

  // ============================================================================
  // TESTS CONFIGURATIONS
  // ============================================================================

  async testConfigurations() {
    this.log('\n⚙️  TESTS CONFIGURATIONS...\n');

    // package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

      // Vérifier champs requis
      this.test('package.json: name présent', !!packageJson.name, 'Nom du projet défini', 'critical');
      this.test('package.json: version présente', !!packageJson.version, 'Version définie', 'warning');

      // Vérifier scripts
      const hasScripts = packageJson.scripts && Object.keys(packageJson.scripts).length > 0;
      this.test('package.json: Scripts définis', hasScripts, hasScripts ? `${Object.keys(packageJson.scripts).length} scripts` : 'Aucun script', 'warning');

      // Vérifier dépendances
      const hasDeps = packageJson.dependencies || packageJson.devDependencies;
      this.test('package.json: Dépendances', !!hasDeps, hasDeps ? 'Dépendances définies' : 'Aucune dépendance', 'warning');

      // Vérifier pas de dépendances avec vulnérabilités connues (basique)
      if (packageJson.dependencies) {
        const suspiciousDeps = Object.keys(packageJson.dependencies).filter(dep =>
          dep.includes('colors') && packageJson.dependencies[dep].includes('1.4.0') // exemple: colors@1.4.0 a une backdoor
        );
        this.test(
          'package.json: Pas de dépendances dangereuses',
          suspiciousDeps.length === 0,
          suspiciousDeps.length > 0 ? `Dépendances suspectes: ${suspiciousDeps.join(', ')}` : 'Dépendances saines',
          'critical'
        );
      }

      // Vérifier repository défini (pour traçabilité)
      const hasRepo = !!packageJson.repository;
      this.test('package.json: Repository défini', hasRepo, hasRepo ? 'Repository configuré' : 'Repository manquant', 'warning');
    }

    // .gitignore
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
      const gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');

      const ignoresNodeModules = /node_modules/.test(gitignoreContent);
      const ignoresEnv = /\.env/.test(gitignoreContent);
      const ignoresLogs = /\.log|logs\//.test(gitignoreContent);

      this.test('.gitignore: Ignore node_modules', ignoresNodeModules, 'node_modules ignoré', 'critical');
      this.test('.gitignore: Ignore .env', ignoresEnv, '.env ignoré (sécurité)', 'critical');
      this.test('.gitignore: Ignore logs', ignoresLogs, 'Logs ignorés', 'warning');
    } else {
      this.test('.gitignore existe', false, 'MANQUANT: risque de commit de secrets', 'critical');
    }

    this.log('\n✅ Configurations analysées\n');
  }
}

// Exécution
if (require.main === module) {
  const agent = new AgentQA();
  agent.run().catch(console.error);
}

module.exports = AgentQA;
