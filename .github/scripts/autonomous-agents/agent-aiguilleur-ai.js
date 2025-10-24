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
  // Workflows CRITIQUES qui DOIVENT tourner
  criticalWorkflows: [
    { name: '🏢 Entreprise Autonome IA', maxDelayMinutes: 10, file: 'autonomous-company.yml' },
    { name: '🔄 Boucle Dev → QA → Debug', maxDelayMinutes: 20, file: 'dev-qa-debug-loop.yml' }
  ],
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

      // 2. 🚨 Lire TOUS les workflows configurés
      await this.readAllWorkflows();

      // 3. Détecter workflows legacy problématiques
      await this.detectLegacyWorkflows();

      // 4. Analyser avec IA si disponible
      if (this.useAI) {
        await this.analyzeWithAI();
      } else {
        await this.analyzeWithRules();
      }

      // 5. Communiquer aux autres agents si nécessaire
      await this.communicateToAgents();

      // 6. Générer rapport
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
   * Lire TOUS les workflows du projet
   */
  async readAllWorkflows() {
    console.log('📂 Lecture de TOUS les workflows configurés...\n');

    try {
      const workflowsDir = path.join(CONFIG.projectRoot, '.github/workflows');
      const workflowFiles = fs.readdirSync(workflowsDir)
        .filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));

      this.allWorkflows = [];

      for (const file of workflowFiles) {
        const filePath = path.join(workflowsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Extraire le nom et le schedule
        const nameMatch = content.match(/name:\s*(.+)/);
        const scheduleMatch = content.match(/schedule:\s*\n\s*-\s*cron:\s*['"](.+)['"]/);

        const workflow = {
          file,
          name: nameMatch ? nameMatch[1].trim() : file,
          hasSchedule: !!scheduleMatch,
          schedule: scheduleMatch ? scheduleMatch[1] : null,
          content: content.substring(0, 500) // Premier 500 chars pour analyse IA
        };

        this.allWorkflows.push(workflow);
        console.log(`   📄 ${workflow.name}${workflow.hasSchedule ? ` (cron: ${workflow.schedule})` : ' (manuel)'}`);
      }

      console.log(`\n   ✅ ${this.allWorkflows.length} workflows configurés\n`);

    } catch (error) {
      console.log('   ⚠️  Impossible de lire workflows, skip');
      this.allWorkflows = [];
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

    // Calculer le dernier run de chaque workflow
    const lastRunByWorkflow = {};
    for (const run of this.workflowRuns) {
      if (!lastRunByWorkflow[run.name] || new Date(run.created_at) > new Date(lastRunByWorkflow[run.name].created_at)) {
        lastRunByWorkflow[run.name] = run;
      }
    }

    // Trouver workflows configurés mais qui n'ont PAS tourné récemment
    const workflowsNotRunning = this.allWorkflows
      .filter(w => w.hasSchedule) // Seulement ceux avec schedule
      .filter(w => {
        const lastRun = lastRunByWorkflow[w.name];
        if (!lastRun) return true; // Jamais tourné
        const minutesSinceLastRun = (Date.now() - new Date(lastRun.created_at)) / 1000 / 60;
        // Si cron toutes les 5min mais pas tourné depuis 15min = problème!
        if (w.schedule.includes('*/5') && minutesSinceLastRun > 15) return true;
        if (w.schedule.includes('*/15') && minutesSinceLastRun > 45) return true;
        if (w.schedule.includes('0 *') && minutesSinceLastRun > 120) return true; // Toutes les heures
        return false;
      });

    const situation = `🚨 ANALYSE COMPLÈTE DES WORKFLOWS - DÉTECTION AUTOMATIQUE

📊 WORKFLOWS CONFIGURÉS: ${this.allWorkflows.length}
${this.allWorkflows.map(w => `- ${w.name}${w.hasSchedule ? ` [cron: ${w.schedule}]` : ' [manuel]'}`).join('\n')}

🏃 WORKFLOWS EN COURS: ${runningRuns.length}
${runningRuns.map(r => `- ${r.name} (depuis ${this.getTimeSince(r.created_at)})`).join('\n')}

⚠️ WORKFLOWS AVEC SCHEDULE MAIS PAS TOURNÉS: ${workflowsNotRunning.length}
${workflowsNotRunning.map(w => {
  const lastRun = lastRunByWorkflow[w.name];
  const delay = lastRun ? this.getTimeSince(lastRun.created_at) : 'JAMAIS';
  return `- 🔴 ${w.name} [schedule: ${w.schedule}] → Dernier run: ${delay}`;
}).join('\n')}

❌ ÉCHECS RÉCENTS: ${failedRuns.length}
${failedRuns.map(r => `- ${r.name} (${r.conclusion})`).join('\n')}

📂 WORKFLOWS LEGACY: ${this.legacyIssues.length}
${this.legacyIssues.map(i => `- ${i.workflow}: ${i.issue}`).join('\n')}

🎯 CONTEXTE:
- Dashboard HubSpot autonome avec agents IA
- MISSION: Les workflows DOIVENT tourner automatiquement
- Si un workflow a un schedule mais ne tourne pas = PROBLÈME CRITIQUE
- Le CEO attend des résultats rapides

⚠️ VOTRE MISSION IA:
Déterminez AUTOMATIQUEMENT quels workflows ne tournent PAS alors qu'ils DEVRAIENT.
Si des workflows critiques ne tournent pas = escalade IMMÉDIATE.
`;

    const analysis = await this.ai.makeDecision(
      situation,
      [
        'Tout va bien - Workflows tournent normalement',
        '🚨 ALERTE: Workflows critiques ne tournent PAS - Escalade CEO',
        'Workflows échouent - Corrections nécessaires',
        'Conflicts entre workflows - Annuler legacy',
        'Problème GitHub Actions - Attendre'
      ],
      [
        '🚨 PRIORITÉ: Détecter workflows qui ne tournent PAS',
        'Workflows avec schedule DOIVENT tourner automatiquement',
        'Si workflow critique ne tourne pas depuis >15min = ALERTE',
        'Escalader au CEO si workflows bloqués'
      ]
    );

    console.log('🎯 Analyse IA:\n');
    console.log(JSON.stringify(analysis, null, 2));

    // Interpréter les décisions
    if (analysis && !analysis.error) {
      // 🔧 AUTO-RÉPARATION: Workflows qui ne tournent pas = FIX AUTOMATIQUE
      if (workflowsNotRunning.length > 0) {
        console.log(`\n🚨 ${workflowsNotRunning.length} workflow(s) ne tournent PAS - RÉPARATION AUTOMATIQUE...\n`);

        // FIXER AUTOMATIQUEMENT - plus d'escalade, on répare!
        await this.autoFixWorkflows(workflowsNotRunning, lastRunByWorkflow);

        this.recommendations.push({
          type: 'workflows_auto_fixed',
          title: `🔧 ${workflowsNotRunning.length} workflow(s) auto-réparés`,
          description: `L'Aiguilleur AI a détecté et FIXÉ automatiquement ${workflowsNotRunning.length} workflow(s) qui ne tournaient pas.`,
          priority: 'high'
        });
      }

      // Workflows échouent (différent de "ne tournent pas") = suggestions IA
      if (analysis.decision && analysis.decision.toLowerCase().includes('alerte') && failedRuns.length > 0) {
        this.recommendations.push({
          type: 'workflows_failing',
          title: `⚠️ ${failedRuns.length} workflow(s) échouent`,
          description: analysis.reasoning || 'Workflows échouent - corrections nécessaires',
          priority: 'high'
        });
      }

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
   * 🔧 AUTO-RÉPARER LES WORKFLOWS CASSÉS
   * L'IA détecte ET FIXE automatiquement - zéro intervention humaine
   */
  async autoFixWorkflows(workflowsNotRunning, lastRunByWorkflow) {
    console.log('\n🔧 AUTO-RÉPARATION DES WORKFLOWS\n');

    for (const workflow of workflowsNotRunning) {
      console.log(`🔨 Fixing: ${workflow.name}...`);

      try {
        // 1. Vérifier si le workflow existe sur GitHub
        const checkCmd = `gh workflow list | grep -i "${workflow.name.substring(0, 30)}" || echo "NOT_FOUND"`;
        const { execSync } = require('child_process');
        const ghResult = execSync(checkCmd, { encoding: 'utf8', stdio: 'pipe' });

        if (ghResult.includes('NOT_FOUND')) {
          console.log(`⚠️  Workflow "${workflow.name}" non trouvé sur GitHub - Probable push manquant`);

          // FIX AUTOMATIQUE: Commit + Push
          console.log('🚀 PUSH AUTOMATIQUE DU WORKFLOW...');
          execSync(`git add "${path.join(CONFIG.projectRoot, '.github/workflows', workflow.file)}"`, { cwd: CONFIG.projectRoot });
          execSync(`git commit -m "🤖 Aiguilleur AI: Auto-push workflow ${workflow.name}" || echo "Already committed"`, { cwd: CONFIG.projectRoot });
          execSync('git push origin main', { cwd: CONFIG.projectRoot });
          console.log('✅ Workflow pushé sur GitHub!');

          // Attendre 5 secondes que GitHub actualise
          await new Promise(resolve => setTimeout(resolve, 5000));
        }

        // 2. Trigger le workflow manuellement
        console.log(`⚡ Déclenchement manuel de "${workflow.name}"...`);
        const triggerCmd = `gh workflow run "${workflow.file}" --ref main`;
        execSync(triggerCmd, { cwd: CONFIG.projectRoot, stdio: 'inherit' });
        console.log(`✅ Workflow "${workflow.name}" déclenché!\n`);

      } catch (error) {
        console.log(`❌ Erreur réparation ${workflow.name}:`, error.message);

        // Escalade SEULEMENT si vraiment impossible de fixer
        this.escalateToCEO(`🚨 IMPOSSIBLE DE FIXER: ${workflow.name}

Erreur: ${error.message}

⚠️  Intervention manuelle requise - problème GitHub Actions ou permissions.`);
      }
    }

    console.log('✅ AUTO-RÉPARATION TERMINÉE\n');
  }

  /**
   * Escalade automatique au CEO (seulement pour problèmes NON auto-réparables)
   */
  escalateToCEO(message) {
    console.log('\n🚨 ESCALADE AU CEO!\n');

    try {
      const meetingNotesPath = path.join(CONFIG.projectRoot, 'MEETING-NOTES-CEO.md');

      if (!fs.existsSync(meetingNotesPath)) {
        console.log('⚠️  Meeting Notes non trouvé, skip escalade');
        return;
      }

      let content = fs.readFileSync(meetingNotesPath, 'utf8');

      const escalation = `

---

## 🚨 ALERTE AIGUILLEUR - ${new Date().toLocaleString('fr-FR')}

${message}

**Status**: ⚠️ ESCALADE AUTOMATIQUE - Intervention manuelle requise

---
`;

      // Insérer après "## 📝 HISTORIQUE DES RÉUNIONS"
      content = content.replace(
        /(## 📝 HISTORIQUE DES RÉUNIONS)/,
        `$1${escalation}`
      );

      fs.writeFileSync(meetingNotesPath, content);
      console.log('✅ Escalade ajoutée dans MEETING-NOTES-CEO.md\n');

    } catch (error) {
      console.log('❌ Erreur escalade CEO:', error.message);
    }
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
