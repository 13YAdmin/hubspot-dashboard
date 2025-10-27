#!/usr/bin/env node

/**
 * AGENT CHEF DE PROJET - Orchestrateur Autonome
 *
 * Responsabilités:
 * - Analyse l'état du projet automatiquement
 * - Prend des décisions sur les actions à mener
 * - Coordonne les autres agents
 * - Génère des rapports de décision
 * - Priorise les tâches selon l'impact business
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  projectRoot: path.resolve(__dirname, '../../..'),
  thresholds: {
    maxFileSize: 5000,  // Lignes max pour un fichier
    maxFunctions: 50,   // Fonctions max dans un fichier
    minTestCoverage: 80,  // % minimum couverture tests
    maxBugs: 0          // Bugs critiques tolérés
  },
  priorities: {
    CRITICAL: 1,
    HIGH: 2,
    MEDIUM: 3,
    LOW: 4
  }
};

// ============================================================================
// AGENT CHEF - CLASSE PRINCIPALE
// ============================================================================

class AgentChef {
  constructor() {
    this.projectState = null;
    this.decisions = [];
    this.actions = [];
  }

  /**
   * Point d'entrée principal - Analyse et décision
   */
  async run() {
    console.log('🤖 AGENT CHEF DE PROJET - Démarrage');
    console.log('================================================\n');

    try {
      // 1. Analyser l'état du projet
      this.projectState = await this.analyzeProject();

      // 2. Identifier les problèmes
      const problems = this.identifyProblems();

      // 3. Prioriser les actions
      const prioritizedActions = this.prioritizeActions(problems);

      // 4. Prendre des décisions
      this.makeDecisions(prioritizedActions);

      // 5. Générer le plan d'action
      const actionPlan = this.generateActionPlan();

      // 6. Sauvegarder le rapport
      await this.saveReport(actionPlan);

      // 7. Exécuter ou déléguer
      if (process.env.AUTO_EXECUTE === 'true') {
        await this.executeActions(actionPlan);
      } else {
        console.log('ℹ️  Mode lecture seule - Aucune action exécutée');
        console.log('   Pour exécuter automatiquement, définir AUTO_EXECUTE=true');
      }

      console.log('\n✅ Agent Chef - Exécution terminée');
      return actionPlan;

    } catch (error) {
      console.error('❌ Erreur Agent Chef:', error.message);
      throw error;
    }
  }

  /**
   * Analyse l'état actuel du projet
   */
  async analyzeProject() {
    console.log('🔍 Analyse de l\'état du projet...\n');

    const state = {
      timestamp: new Date().toISOString(),
      files: {},
      metrics: {},
      health: {}
    };

    // Analyser index.html
    const indexPath = path.join(CONFIG.projectRoot, 'public/index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      const lines = content.split('\n');

      state.files.indexHtml = {
        path: indexPath,
        size: lines.length,
        functions: this.countFunctions(content),
        hasIssues: lines.length > CONFIG.thresholds.maxFileSize
      };

      console.log(`📄 index.html: ${lines.length} lignes, ${state.files.indexHtml.functions} fonctions`);
    }

    // Analyser les docs
    const docs = ['CAHIER-DES-CHARGES.md', 'RAPPORT-FINAL-AUDIT.md', 'STATUS-SESSION.md'];
    state.files.documentation = [];

    for (const doc of docs) {
      const docPath = path.join(CONFIG.projectRoot, doc);
      if (fs.existsSync(docPath)) {
        const content = fs.readFileSync(docPath, 'utf8');
        state.files.documentation.push({
          name: doc,
          size: content.split('\n').length,
          lastModified: fs.statSync(docPath).mtime
        });
      }
    }

    // Métriques globales
    state.metrics = {
      totalFiles: Object.keys(state.files).length,
      documentationUpToDate: this.checkDocumentationFreshness(state.files.documentation),
      codeQuality: this.calculateCodeQuality(state.files.indexHtml)
    };

    // Santé du projet
    state.health = {
      overall: 'UNKNOWN',
      details: {}
    };

    console.log(`\n📊 Métriques:`);
    console.log(`   - Fichiers analysés: ${state.metrics.totalFiles}`);
    console.log(`   - Documentation à jour: ${state.metrics.documentationUpToDate ? 'Oui' : 'Non'}`);
    console.log(`   - Qualité code: ${state.metrics.codeQuality}/100`);

    return state;
  }

  /**
   * Compte le nombre de fonctions dans le code
   */
  countFunctions(content) {
    const functionRegex = /function\s+\w+\s*\(/g;
    const arrowFunctionRegex = /const\s+\w+\s*=\s*\(/g;

    const functions = content.match(functionRegex) || [];
    const arrowFunctions = content.match(arrowFunctionRegex) || [];

    return functions.length + arrowFunctions.length;
  }

  /**
   * Vérifie si la documentation est récente
   */
  checkDocumentationFreshness(docs) {
    if (!docs || docs.length === 0) return false;

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    for (const doc of docs) {
      if (new Date(doc.lastModified) > oneDayAgo) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calcule la qualité du code (0-100)
   */
  calculateCodeQuality(indexHtml) {
    if (!indexHtml) return 0;

    let score = 100;

    // Pénalité taille fichier
    if (indexHtml.size > CONFIG.thresholds.maxFileSize) {
      const penalty = Math.min(30, (indexHtml.size - CONFIG.thresholds.maxFileSize) / 100);
      score -= penalty;
    }

    // Pénalité nombre de fonctions
    if (indexHtml.functions > CONFIG.thresholds.maxFunctions) {
      const penalty = Math.min(20, (indexHtml.functions - CONFIG.thresholds.maxFunctions) / 2);
      score -= penalty;
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Identifie les problèmes dans le projet
   */
  identifyProblems() {
    console.log('\n🔍 Identification des problèmes...\n');

    const problems = [];

    // Problème 1: Fichier trop volumineux
    if (this.projectState.files.indexHtml &&
        this.projectState.files.indexHtml.size > CONFIG.thresholds.maxFileSize) {
      problems.push({
        id: 'LARGE_FILE',
        type: 'ARCHITECTURE',
        severity: 'HIGH',
        description: `index.html trop volumineux (${this.projectState.files.indexHtml.size} lignes)`,
        impact: 'Maintenabilité difficile, risque de bugs',
        solution: 'Découper en modules',
        estimatedEffort: '8h'
      });
    }

    // Problème 2: Trop de fonctions dans un fichier
    if (this.projectState.files.indexHtml &&
        this.projectState.files.indexHtml.functions > CONFIG.thresholds.maxFunctions) {
      problems.push({
        id: 'TOO_MANY_FUNCTIONS',
        type: 'ARCHITECTURE',
        severity: 'MEDIUM',
        description: `Trop de fonctions dans index.html (${this.projectState.files.indexHtml.functions})`,
        impact: 'Code complexe, difficile à tester',
        solution: 'Refactoring modulaire',
        estimatedEffort: '4h'
      });
    }

    // Problème 3: Documentation pas à jour
    if (!this.projectState.metrics.documentationUpToDate) {
      problems.push({
        id: 'OUTDATED_DOCS',
        type: 'DOCUMENTATION',
        severity: 'LOW',
        description: 'Documentation pas mise à jour récemment',
        impact: 'Équipe pas informée des derniers changements',
        solution: 'Mise à jour automatique documentation',
        estimatedEffort: '1h'
      });
    }

    console.log(`🎯 Problèmes identifiés: ${problems.length}`);
    problems.forEach(p => {
      console.log(`   [${p.severity}] ${p.id}: ${p.description}`);
    });

    return problems;
  }

  /**
   * Priorise les actions selon l'impact business
   */
  prioritizeActions(problems) {
    console.log('\n📊 Priorisation des actions...\n');

    const prioritized = problems.sort((a, b) => {
      const severityOrder = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });

    prioritized.forEach((p, idx) => {
      p.priority = idx + 1;
      console.log(`   ${p.priority}. [${p.severity}] ${p.id} - Effort: ${p.estimatedEffort}`);
    });

    return prioritized;
  }

  /**
   * Prend des décisions basées sur les problèmes
   */
  makeDecisions(prioritizedActions) {
    console.log('\n🎯 Prises de décision...\n');

    for (const action of prioritizedActions) {
      const decision = {
        problemId: action.id,
        decision: '',
        reasoning: '',
        delegateTo: null,
        immediate: false
      };

      switch (action.id) {
        case 'LARGE_FILE':
          decision.decision = 'REFACTORING_PRIORITAIRE';
          decision.reasoning = 'Fichier volumineux = risque élevé de bugs et maintenance difficile';
          decision.delegateTo = 'Agent Refactoreur';
          decision.immediate = false;
          break;

        case 'TOO_MANY_FUNCTIONS':
          decision.decision = 'REFACTORING_MODULAIRE';
          decision.reasoning = 'Trop de fonctions = complexité élevée';
          decision.delegateTo = 'Agent Refactoreur';
          decision.immediate = false;
          break;

        case 'OUTDATED_DOCS':
          decision.decision = 'UPDATE_DOCUMENTATION';
          decision.reasoning = 'Documentation pas à jour = équipe pas informée';
          decision.delegateTo = 'Agent Documentation';
          decision.immediate = true;
          break;

        default:
          decision.decision = 'ANALYSE_MANUELLE_REQUISE';
          decision.reasoning = 'Problème non catégorisé';
          decision.delegateTo = null;
          decision.immediate = false;
      }

      this.decisions.push(decision);

      console.log(`   ${action.id}:`);
      console.log(`      → Décision: ${decision.decision}`);
      console.log(`      → Délégation: ${decision.delegateTo || 'Manuel'}`);
      console.log(`      → Immédiat: ${decision.immediate ? 'Oui' : 'Non'}`);
    }
  }

  /**
   * Génère le plan d'action complet
   */
  generateActionPlan() {
    console.log('\n📋 Génération du plan d\'action...\n');

    const plan = {
      timestamp: new Date().toISOString(),
      projectState: this.projectState,
      problems: this.decisions.length,
      decisions: this.decisions,
      phases: []
    };

    // Phase 1: Actions immédiates
    const immediateActions = this.decisions.filter(d => d.immediate);
    if (immediateActions.length > 0) {
      plan.phases.push({
        phase: 1,
        name: 'Actions Immédiates',
        duration: '1h',
        actions: immediateActions.map(d => ({
          problem: d.problemId,
          action: d.decision,
          agent: d.delegateTo
        }))
      });
    }

    // Phase 2: Actions court terme
    const shortTermActions = this.decisions.filter(d => !d.immediate && d.delegateTo);
    if (shortTermActions.length > 0) {
      plan.phases.push({
        phase: 2,
        name: 'Court Terme',
        duration: '1 semaine',
        actions: shortTermActions.map(d => ({
          problem: d.problemId,
          action: d.decision,
          agent: d.delegateTo
        }))
      });
    }

    console.log(`✅ Plan d'action généré:`);
    console.log(`   - ${plan.problems} problèmes adressés`);
    console.log(`   - ${plan.phases.length} phases définies`);

    return plan;
  }

  /**
   * Sauvegarde le rapport de décision
   */
  async saveReport(actionPlan) {
    const reportPath = path.join(CONFIG.projectRoot, 'RAPPORT-AGENT-CHEF.md');

    const report = `# 🤖 RAPPORT - Agent Chef de Projet

**Date**: ${new Date().toISOString()}
**Version**: 1.0

## 📊 État du Projet

### Métriques
${JSON.stringify(this.projectState.metrics, null, 2)}

### Santé
- Qualité code: ${this.projectState.metrics.codeQuality}/100
- Documentation: ${this.projectState.metrics.documentationUpToDate ? '✅ À jour' : '⚠️ Pas à jour'}

## 🎯 Problèmes Identifiés

Total: ${this.decisions.length}

${this.decisions.map((d, idx) => `
### ${idx + 1}. ${d.problemId}
- **Décision**: ${d.decision}
- **Raisonnement**: ${d.reasoning}
- **Délégué à**: ${d.delegateTo || 'Manuel'}
- **Immédiat**: ${d.immediate ? 'Oui' : 'Non'}
`).join('\n')}

## 📋 Plan d'Action

${actionPlan.phases.map(phase => `
### Phase ${phase.phase}: ${phase.name}
**Durée**: ${phase.duration}

${phase.actions.map((a, idx) => `${idx + 1}. **${a.problem}**: ${a.action} (Agent: ${a.agent})`).join('\n')}
`).join('\n')}

## 🚀 Prochaines Étapes

${actionPlan.phases.length > 0 ?
  `1. Lancer les agents pour la Phase 1\n2. Valider les corrections\n3. Passer à la Phase 2` :
  'Aucune action requise - projet en bon état'}

---

🤖 Généré automatiquement par l'Agent Chef de Projet
`;

    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`\n📄 Rapport sauvegardé: ${reportPath}`);
  }

  /**
   * Exécute les actions (si AUTO_EXECUTE=true)
   */
  async executeActions(actionPlan) {
    console.log('\n🚀 Exécution des actions...\n');

    for (const phase of actionPlan.phases) {
      console.log(`📌 Phase ${phase.phase}: ${phase.name}`);

      for (const action of phase.actions) {
        console.log(`   → ${action.problem}: ${action.action}`);
        console.log(`      Délégué à: ${action.agent}`);

        // TODO: Lancer les agents spécialisés
        console.log(`      ⏳ Exécution différée (agent à implémenter)`);
      }
    }

    console.log('\n✅ Toutes les actions planifiées');
  }
}

// ============================================================================
// EXÉCUTION
// ============================================================================

if (require.main === module) {
  const agent = new AgentChef();

  agent.run()
    .then(plan => {
      console.log('\n✅ Agent Chef - Succès');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Agent Chef - Échec:', error);
      process.exit(1);
    });
}

module.exports = { AgentChef, CONFIG };
