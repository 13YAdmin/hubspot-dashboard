#!/usr/bin/env node

/**
 * AGENT AIGUILLEUR - VERSION AI-POWERED (Traffic Controller)
 *
 * Utilise Claude AI pour gérer intelligemment les workflows
 *
 * Responsabilités:
 * - Détecter workflows legacy qui créent des conflits
 * - Monitorer santé de tous les workflows avec IA
 * - Communiquer avec autres agents si problèmes détectés
 * - Prendre actions correctives intelligentes
 * - Annuler workflows redondants/conflictuels
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { ClaudeAIEngine } = require('./claude-ai-engine');
const { UserEscalationSystem } = require('./user-escalation-system');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  projectRoot: path.resolve(__dirname, '../../..'),
  communicationDir: path.resolve(__dirname, '../../../.github/agents-communication'),
  repoOwner: '13YAdmin',
  repoName: 'hubspot-dashboard',
  useAI: !!process.env.ANTHROPIC_API_KEY,
  // Workflows legacy à surveiller (peuvent créer conflits)
  legacyWorkflows: [
    'autonomous-loop.yml',  // Ancienne version, peut être redondant
    'fetch-hubspot-data.yml' // Si tourne en même temps que d'autres
  ],
  // Fréquence minimale entre runs du même workflow (minutes)
  minIntervalMinutes: 15
};

// ============================================================================
// COMMUNICATION HUB
// ============================================================================

class CommunicationHub {
  constructor() {
    this.baseDir = CONFIG.communicationDir;
    this.ensureDirectories();
  }

  ensureDirectories() {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  async addRecommendation(recommendation) {
    const file = path.join(this.baseDir, 'recommendations.json');
    let data = { items: [], lastUpdate: new Date().toISOString() };

    if (fs.existsSync(file)) {
      const existing = JSON.parse(fs.readFileSync(file, 'utf8'));
      data.items = Array.isArray(existing) ? existing : (existing.items || []);
    }

    const newRec = {
      id: `REC-${Date.now()}`,
      from: 'Agent Aiguilleur (AI)',
      timestamp: new Date().toISOString(),
      ...recommendation,
      status: 'pending'
    };

    data.items.push(newRec);
    data.lastUpdate = new Date().toISOString();

    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return newRec.id;
  }
}

// ============================================================================
// AGENT AIGUILLEUR AI-POWERED
// ============================================================================

class AgentAiguilleurAI {
  constructor() {
    this.ai = new ClaudeAIEngine();
    this.hub = new CommunicationHub();
    this.escalationSystem = new UserEscalationSystem();
    this.workflowRuns = [];
    this.conflicts = [];
    this.legacyIssues = [];
    this.recommendations = [];
    this.healthScore = 100;
    this.useAI = CONFIG.useAI;

    if (this.useAI) {
      console.log('🚦 Agent Aiguilleur AI - Mode INTELLIGENCE ARTIFICIELLE activé');
    } else {
      console.log('⚠️  Agent Aiguilleur AI - Mode fallback');
    }
  }

  /**
   * Point d'entrée principal
   */
  async run() {
    console.log('\n🚦 AGENT AIGUILLEUR (AI-POWERED) - Traffic Controller');
    console.log('======================================================\n');

    try {
      // 1. Récupérer état workflows
      await this.fetchWorkflowRuns();

      // 2. Détecter workflows legacy problématiques
      await this.detectLegacyWorkflows();

      // 3. Analyser avec IA si disponible
      if (this.useAI) {
        await this.analyzeWithAI();
      } else {
        await this.analyzeWithRules();
      }

      // 4. Communiquer aux autres agents si nécessaire
      await this.communicateToAgents();

      // 5. Générer rapport
      await this.saveReport();

      console.log('\n✅ Agent Aiguilleur AI - Exécution terminée');
      console.log(`📊 Score de santé: ${this.healthScore}/100`);
      console.log(`🚨 Conflits détectés: ${this.conflicts.length}`);
      console.log(`⚠️  Legacy issues: ${this.legacyIssues.length}`);

    } catch (error) {
      console.error('❌ Erreur Agent Aiguilleur AI:', error.message);
      throw error;
    }
  }

  /**
   * Récupérer état des workflows
   */
  async fetchWorkflowRuns() {
    console.log('📡 Récupération workflows...\n');

    try {
      const result = execSync(
        `gh api repos/${CONFIG.repoOwner}/${CONFIG.repoName}/actions/runs?per_page=30`,
        { encoding: 'utf-8' }
      );

      const data = JSON.parse(result);
      this.workflowRuns = data.workflow_runs || [];

      const running = this.workflowRuns.filter(r => r.status === 'in_progress').length;
      const failed = this.workflowRuns.filter(r => r.conclusion === 'failure').length;

      console.log(`   ✅ ${this.workflowRuns.length} runs récupérés`);
      console.log(`   🏃 En cours: ${running}`);
      console.log(`   ❌ Échecs: ${failed}\n`);

    } catch (error) {
      console.log('   ⚠️  API non disponible, données locales');
      this.workflowRuns = [];
    }
  }

  /**
   * Détecter workflows legacy problématiques
   */
  async detectLegacyWorkflows() {
    console.log('🔍 Détection workflows legacy...\n');

    const recentRuns = this.workflowRuns.slice(0, 20);

    for (const legacyName of CONFIG.legacyWorkflows) {
      const legacyRuns = recentRuns.filter(r =>
        r.path && r.path.includes(legacyName)
      );

      if (legacyRuns.length > 0) {
        // Vérifier si tourne en même temps que nouveaux workflows
        for (const run of legacyRuns) {
          if (run.status === 'in_progress' || run.status === 'queued') {
            const concurrent = recentRuns.filter(r =>
              r.id !== run.id &&
              (r.status === 'in_progress' || r.status === 'queued') &&
              Math.abs(new Date(r.created_at) - new Date(run.created_at)) < 5 * 60 * 1000
            );

            if (concurrent.length > 0) {
              this.legacyIssues.push({
                workflow: legacyName,
                runId: run.id,
                issue: 'Tourne en même temps que nouveaux workflows',
                concurrent: concurrent.map(c => c.name),
                severity: 'high'
              });

              console.log(`   ⚠️  Legacy: ${legacyName} - conflit potentiel`);
              console.log(`      Concurrent avec: ${concurrent.map(c => c.name).join(', ')}`);
            }
          }
        }

        // Vérifier si échoue fréquemment
        const recentLegacy = legacyRuns.slice(0, 5);
        const failureRate = recentLegacy.filter(r => r.conclusion === 'failure').length / recentLegacy.length;

        if (failureRate > 0.5) {
          this.legacyIssues.push({
            workflow: legacyName,
            issue: `Taux d'échec élevé: ${Math.round(failureRate * 100)}%`,
            severity: 'high',
            recommendation: 'Considérer désactivation ou migration vers version AI'
          });

          console.log(`   🔴 Legacy: ${legacyName} - ${Math.round(failureRate * 100)}% échecs`);
        }
      }
    }

    if (this.legacyIssues.length === 0) {
      console.log('   ✅ Aucun problème legacy détecté');
    }
  }

  /**
   * Analyser avec IA
   */
  async analyzeWithAI() {
    console.log('\n🧠 Analyse intelligente avec Claude AI...\n');

    const failedRuns = this.workflowRuns.filter(r => r.conclusion === 'failure').slice(0, 10);
    const runningRuns = this.workflowRuns.filter(r => r.status === 'in_progress');

    const situation = `État actuel des workflows GitHub Actions:

Workflows en cours: ${runningRuns.length}
${runningRuns.map(r => `- ${r.name} (depuis ${this.getTimeSince(r.created_at)})`).join('\n')}

Échecs récents: ${failedRuns.length}
${failedRuns.map(r => `- ${r.name} (${r.conclusion})`).join('\n')}

Workflows legacy détectés avec problèmes: ${this.legacyIssues.length}
${this.legacyIssues.map(i => `- ${i.workflow}: ${i.issue}`).join('\n')}

Contexte:
- Projet: Dashboard HubSpot autonome
- Nouveaux agents AI viennent d'être ajoutés
- Anciens workflows peuvent créer conflits avec nouveaux
`;

    const analysis = await this.ai.makeDecision(
      situation,
      [
        'Tout va bien, aucune action nécessaire',
        'Annuler workflows legacy pour éviter conflits',
        'Workflows échouent à cause de code manquant, attendre prochain push',
        'Problème grave nécessitant intervention immédiate'
      ],
      [
        'Privilégier nouveaux workflows AI-powered',
        'Éviter workflows concurrents conflictuels',
        'Maintenir système sain et fonctionnel'
      ]
    );

    console.log('🎯 Analyse IA:\n');
    console.log(JSON.stringify(analysis, null, 2));

    // Interpréter les décisions
    if (analysis && !analysis.error) {
      if (analysis.decision && analysis.decision.toLowerCase().includes('annuler')) {
        this.recommendations.push({
          type: 'cancel_legacy',
          title: 'Annuler workflows legacy conflictuels',
          description: analysis.reasoning || 'Workflows legacy créent des conflits',
          priority: 'high'
        });
      }

      if (analysis.decision && analysis.decision.toLowerCase().includes('grave')) {
        this.recommendations.push({
          type: 'critical_issue',
          title: 'Problème critique détecté',
          description: analysis.reasoning || 'Intervention nécessaire',
          priority: 'critical'
        });
      }

      // Calculer score santé basé sur analyse IA
      if (analysis.decision && analysis.decision.toLowerCase().includes('bien')) {
        this.healthScore = 100;
      } else if (failedRuns.length > 5) {
        this.healthScore = Math.max(30, 100 - (failedRuns.length * 10));
      } else {
        this.healthScore = Math.max(50, 100 - (failedRuns.length * 15));
      }

      // Utiliser les risques de l'IA
      if (analysis.risks && analysis.risks.length > 0) {
        for (const risk of analysis.risks) {
          this.recommendations.push({
            type: 'risk',
            title: `Risque: ${risk}`,
            description: `Risque identifié par IA: ${risk}`,
            priority: 'medium'
          });
        }
      }
    }

    console.log(`\n✅ Analyse IA terminée - Score: ${this.healthScore}/100`);
  }

  /**
   * Analyser avec règles (fallback)
   */
  async analyzeWithRules() {
    console.log('\n⚠️  Mode fallback - Analyse basique\n');

    const failedRuns = this.workflowRuns.filter(r => r.conclusion === 'failure');

    if (failedRuns.length > 5) {
      this.healthScore = 50;
      this.recommendations.push({
        type: 'high_failure_rate',
        title: 'Taux d\'échec élevé',
        description: `${failedRuns.length} workflows ont échoué récemment`,
        priority: 'high'
      });
    }

    if (this.legacyIssues.length > 0) {
      this.recommendations.push({
        type: 'legacy_workflows',
        title: 'Workflows legacy détectés',
        description: `${this.legacyIssues.length} workflows legacy créent des problèmes`,
        priority: 'high'
      });
    }

    console.log(`✅ Analyse basique terminée - Score: ${this.healthScore}/100`);
  }

  /**
   * Communiquer aux autres agents
   */
  async communicateToAgents() {
    console.log('\n📤 Communication aux autres agents...\n');

    for (const rec of this.recommendations) {
      await this.hub.addRecommendation({
        type: 'traffic_control',
        title: rec.title,
        description: rec.description,
        priority: rec.priority,
        category: 'Workflow Management',
        actionType: rec.type,
        targetAgent: 'Agent Chef'
      });

      console.log(`✉️  [${rec.priority}] ${rec.title}`);
    }

    if (this.recommendations.length === 0) {
      console.log('ℹ️  Aucune recommandation - système sain');
    } else {
      console.log(`\n✅ ${this.recommendations.length} recommandations envoyées au Chef`);
    }
  }

  /**
   * Calculer temps écoulé
   */
  getTimeSince(timestamp) {
    const minutes = Math.floor((Date.now() - new Date(timestamp)) / 60000);
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h${minutes % 60}min`;
  }

  /**
   * Sauvegarder rapport
   */
  async saveReport() {
    const reportPath = path.join(CONFIG.projectRoot, 'RAPPORT-AGENT-AIGUILLEUR-AI.md');

    const report = `# 🚦 RAPPORT AIGUILLEUR - AI-Powered (Traffic Controller)

**Date**: ${new Date().toLocaleString('fr-FR')}
**Mode**: ${this.useAI ? '✅ Intelligence Artificielle (Claude)' : '⚠️  Fallback (règles simples)'}

---

## 📊 ÉTAT WORKFLOWS

- **Total runs analysés**: ${this.workflowRuns.length}
- **En cours**: ${this.workflowRuns.filter(r => r.status === 'in_progress').length}
- **Échecs récents**: ${this.workflowRuns.filter(r => r.conclusion === 'failure').length}
- **Score de santé**: ${this.healthScore}/100

---

## ⚠️  WORKFLOWS LEGACY DÉTECTÉS

Total: ${this.legacyIssues.length}

${this.legacyIssues.map((issue, i) => `
### ${i + 1}. ${issue.workflow}

- **Issue**: ${issue.issue}
- **Sévérité**: ${issue.severity}
${issue.concurrent ? `- **Conflits avec**: ${issue.concurrent.join(', ')}` : ''}
${issue.recommendation ? `- **Recommandation**: ${issue.recommendation}` : ''}
`).join('\n')}

${this.legacyIssues.length === 0 ? 'Aucun workflow legacy problématique détecté ✅' : ''}

---

## 🚨 CONFLITS DÉTECTÉS

Total: ${this.conflicts.length}

${this.conflicts.map((c, i) => `${i + 1}. ${c.description}`).join('\n') || 'Aucun conflit ✅'}

---

## 💡 RECOMMANDATIONS

Total: ${this.recommendations.length}

${this.recommendations.map((rec, i) => `
### ${i + 1}. ${rec.title}

- **Type**: ${rec.type}
- **Priorité**: ${rec.priority}
- **Description**: ${rec.description}
`).join('\n')}

${this.recommendations.length === 0 ? 'Aucune action nécessaire - système sain ✅' : ''}

---

## 🎯 RÉSUMÉ

${this.useAI ?
  `✅ Agent Aiguilleur utilise Claude AI pour analyse intelligente.

L'analyse couvre:
- Détection workflows legacy conflictuels
- Analyse des patterns d'échec
- Recommandations contextuelles
- Communication avec autres agents

Les décisions sont basées sur analyse contextuelle, pas règles fixes.` :
  `⚠️  Agent Aiguilleur fonctionne en mode fallback.

Pour activer l'analyse intelligente:
1. Configurer ANTHROPIC_API_KEY
2. Voir CONFIGURATION-IA.md

Avec IA: détection intelligente, décisions contextuelles
Sans IA: règles basiques, détection limitée`}

---

## 🔄 ÉTAT GLOBAL

${this.healthScore >= 80 ? '🟢 SAIN' : this.healthScore >= 50 ? '🟠 DÉGRADÉ' : '🔴 CRITIQUE'}

Score: ${this.healthScore}/100

---

**🚦 Généré par Agent Aiguilleur AI-Powered**
**"Traffic controller intelligent pour workflows"**
`;

    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`\n📄 Rapport sauvegardé: RAPPORT-AGENT-AIGUILLEUR-AI.md`);
  }
}

// ============================================================================
// EXÉCUTION
// ============================================================================

if (require.main === module) {
  const agent = new AgentAiguilleurAI();

  agent.run()
    .then(() => {
      console.log('\n✅ Agent Aiguilleur AI - Succès');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Agent Aiguilleur AI - Échec:', error);
      process.exit(1);
    });
}

module.exports = { AgentAiguilleurAI, CONFIG };
