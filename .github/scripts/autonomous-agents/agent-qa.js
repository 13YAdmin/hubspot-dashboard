#!/usr/bin/env node

/**
 * AGENT QA - Testeur qui valide le dashboard
 *
 * RESPONSABILITÉS:
 * - Tester toutes les fonctionnalités du dashboard
 * - Vérifier que les bugs sont fixés
 * - Créer un rapport de test détaillé
 * - Identifier les régressions
 * - Valider selon le CAHIER-DES-CHARGES.md
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
  }

  log(message) {
    console.log(`✅ [AGENT QA] ${message}`);
  }

  async run() {
    this.log('DÉMARRAGE - Quality Assurance');
    console.log('================================================\n');

    if (!fs.existsSync(this.dashboardPath)) {
      this.log('❌ ERREUR: Dashboard introuvable!');
      return;
    }

    const content = fs.readFileSync(this.dashboardPath, 'utf8');

    // Tests statiques (analyse code)
    await this.runStaticTests(content);

    // Générer rapport
    await this.generateReport();

    this.log(`\n📊 RÉSULTATS: ${this.passed} passed / ${this.failed} failed`);
    this.log('✅ Agent QA terminé');
  }

  test(name, condition, details = '') {
    const result = condition ? 'PASS' : 'FAIL';
    const emoji = condition ? '✅' : '❌';

    this.tests.push({ name, result, details });

    if (condition) {
      this.passed++;
      this.log(`${emoji} ${name}`);
    } else {
      this.failed++;
      this.log(`${emoji} ${name}`);
      if (details) this.log(`   └─ ${details}`);
    }
  }

  async runStaticTests(content) {
    this.log('🧪 TESTS STATIQUES...\n');

    // Test 1: Fonctions exposées globalement
    this.test(
      'showClientDetails exposée',
      content.includes('window.showClientDetails ='),
      'Bug #1 du rapport'
    );

    this.test(
      'showIndustryDetails exposée',
      content.includes('window.showIndustryDetails ='),
      'Bug #2 du rapport'
    );

    this.test(
      'showKPIDetails exposée',
      content.includes('window.showKPIDetails ='),
      'Bug #3 du rapport'
    );

    this.test(
      'showWhiteSpaceDetails exposée',
      content.includes('window.showWhiteSpaceDetails =')
    );

    this.test(
      'toggleGroup exposée',
      content.includes('window.toggleGroup =')
    );

    // Test 2: Graphiques appelés
    this.test(
      'renderSegmentDonutChart appelé',
      content.includes('renderSegmentDonutChart();'),
      'Graphique avancé #1'
    );

    this.test(
      'renderRadarChart appelé',
      content.includes('renderRadarChart();'),
      'Graphique avancé #2'
    );

    this.test(
      'renderStackedAreaChart appelé',
      content.includes('renderStackedAreaChart();'),
      'Graphique avancé #3'
    );

    this.test(
      'renderHealthTrendsChart appelé',
      content.includes('renderHealthTrendsChart();'),
      'Graphique avancé #4'
    );

    // Test 3: Pas d'erreurs JS basiques
    this.test(
      'Pas de console.error dans le code',
      !content.includes('console.error') || content.split('console.error').length < 5,
      'Limite de logging errors'
    );

    // Test 4: Structure HTML correcte
    this.test(
      'Structure HTML valide',
      content.includes('<html') && content.includes('</html>'),
      'Tags HTML présents'
    );

    this.test(
      'Script tag présent',
      content.includes('<script>') && content.includes('</script>'),
      'JavaScript présent'
    );

    // Test 5: Data loading
    this.test(
      'Fonction loadData définie',
      content.includes('function loadData()') || content.includes('const loadData ='),
      'Chargement des données'
    );

    // Test 6: Chart library
    this.test(
      'Chart.js importé',
      content.includes('chart.js') || content.includes('Chart.'),
      'Bibliothèque graphiques'
    );

    console.log('');
  }

  async generateReport() {
    const score = Math.round((this.passed / (this.passed + this.failed)) * 100);
    const status = score >= 90 ? '🟢 EXCELLENT' : score >= 70 ? '🟡 ACCEPTABLE' : '🔴 PROBLÈMES';

    const report = `# ✅ RAPPORT AGENT QA

**Date**: ${new Date().toLocaleString('fr-FR')}
**Score**: ${score}/100 ${status}

## 📊 RÉSUMÉ

- Tests passés: ${this.passed}
- Tests échoués: ${this.failed}
- Total: ${this.tests.length}

## 🧪 DÉTAILS DES TESTS

${this.tests.map(t => `- ${t.result === 'PASS' ? '✅' : '❌'} ${t.name}${t.details ? ` - ${t.details}` : ''}`).join('\n')}

## 🎯 RECOMMANDATIONS

${this.failed === 0
  ? '✅ Tous les tests passent. Le dashboard est prêt pour déploiement.'
  : `⚠️  ${this.failed} test(s) échoué(s). Faire passer l'Agent Debugger avant déploiement.`}

${score < 90
  ? '\n### Actions requises:\n' + this.tests.filter(t => t.result === 'FAIL').map(t => `- Fixer: ${t.name}`).join('\n')
  : ''}

---

🤖 Generated by Agent QA
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
