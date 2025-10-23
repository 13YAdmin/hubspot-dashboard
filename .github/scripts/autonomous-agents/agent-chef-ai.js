#!/usr/bin/env node

/**
 * AGENT CHEF DE PROJET - VERSION AI-POWERED
 *
 * Utilise Claude AI pour prendre de VRAIES décisions intelligentes
 *
 * Responsabilités:
 * - Analyser l'état du projet avec IA
 * - Prendre des décisions stratégiques intelligentes
 * - Coordonner les autres agents
 * - Prioriser intelligemment selon le contexte
 * - Escalader vers l'utilisateur si vraiment nécessaire
 */

const fs = require('fs');
const path = require('path');
const { ClaudeAIEngine } = require('./claude-ai-engine');
const { UserEscalationSystem, escalateAPIKey, escalateDecision } = require('./user-escalation-system');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  projectRoot: path.resolve(__dirname, '../../..'),
  communicationDir: path.resolve(__dirname, '../../../.github/agents-communication'),
  useAI: !!process.env.ANTHROPIC_API_KEY // Active IA si clé disponible
};

// ============================================================================
// COMMUNICATION HUB
// ============================================================================

class CommunicationHub {
  constructor() {
    this.baseDir = CONFIG.communicationDir;
  }

  async readRecommendations() {
    const file = path.join(this.baseDir, 'recommendations.json');
    if (!fs.existsSync(file)) return [];
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(data) ? data : (data.items || []);
  }

  async readTasks() {
    const file = path.join(this.baseDir, 'tasks.json');
    if (!fs.existsSync(file)) return [];
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return Array.isArray(data) ? data : (data.items || []);
  }

  async createTask(task) {
    const file = path.join(this.baseDir, 'tasks.json');
    let data = { items: [], lastUpdate: new Date().toISOString() };

    if (fs.existsSync(file)) {
      const existing = JSON.parse(fs.readFileSync(file, 'utf8'));
      data.items = Array.isArray(existing) ? existing : (existing.items || []);
    }

    const newTask = {
      id: `TASK-${Date.now()}`,
      ...task,
      createdBy: 'Agent Chef (AI)',
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    data.items.push(newTask);
    data.lastUpdate = new Date().toISOString();

    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return newTask.id;
  }

  async updateRecommendation(recId, updates) {
    const file = path.join(this.baseDir, 'recommendations.json');
    if (!fs.existsSync(file)) return;

    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const items = Array.isArray(data) ? data : (data.items || []);

    const rec = items.find(r => r.id === recId);
    if (rec) {
      Object.assign(rec, updates);

      if (data.items) {
        data.items = items;
        data.lastUpdate = new Date().toISOString();
      }

      fs.writeFileSync(file, JSON.stringify(Array.isArray(data) ? items : data, null, 2));
    }
  }
}

// ============================================================================
// AGENT CHEF AI-POWERED
// ============================================================================

class AgentChefAI {
  constructor() {
    this.ai = new ClaudeAIEngine();
    this.hub = new CommunicationHub();
    this.escalationSystem = new UserEscalationSystem();
    this.decisions = [];
    this.useAI = CONFIG.useAI;

    if (this.useAI) {
      console.log('🤖 Agent Chef AI - Mode INTELLIGENCE ARTIFICIELLE activé');
    } else {
      console.log('⚠️  Agent Chef AI - Mode fallback (configurer ANTHROPIC_API_KEY pour activer l\'IA)');
    }
  }

  /**
   * Point d'entrée principal
   */
  async run() {
    console.log('\n🤖 AGENT CHEF DE PROJET (AI-POWERED)');
    console.log('=====================================\n');

    try {
      // 1. Analyser l'état actuel
      const projectState = await this.analyzeProjectState();

      // 2. Lire les recommandations des autres agents
      const recommendations = await this.hub.readRecommendations();
      console.log(`\n💡 ${recommendations.length} recommandations à évaluer`);

      // 3. Lire les tâches en cours
      const tasks = await this.hub.readTasks();
      console.log(`📋 ${tasks.length} tâches dans le système`);

      // 4. Utiliser l'IA pour décider quoi faire
      if (this.useAI) {
        await this.makeAIDecisions(projectState, recommendations, tasks);
      } else {
        await this.makeFallbackDecisions(recommendations);
      }

      // 5. Sauvegarder le rapport
      await this.saveReport();

      console.log('\n✅ Agent Chef AI - Exécution terminée');
      console.log(`📊 ${this.decisions.length} décisions prises`);

    } catch (error) {
      console.error('❌ Erreur Agent Chef AI:', error.message);

      // Si erreur = pas de clé API, escalader
      if (error.message.includes('API') && !this.useAI) {
        await this.escalateNeedForAI();
      }

      throw error;
    }
  }

  /**
   * Analyser l'état du projet
   */
  async analyzeProjectState() {
    console.log('🔍 Analyse de l\'état du projet...\n');

    const state = {
      timestamp: new Date().toISOString(),
      files: {},
      health: 'unknown'
    };

    // Vérifier index.html
    const indexPath = path.join(CONFIG.projectRoot, 'public/index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      state.files.indexHtml = {
        exists: true,
        size: content.split('\n').length
      };
    }

    // Vérifier agents
    const agentsDir = path.join(CONFIG.projectRoot, '.github/scripts/autonomous-agents');
    const agentFiles = fs.readdirSync(agentsDir).filter(f => f.startsWith('agent-') && f.endsWith('.js'));
    state.agents = {
      count: agentFiles.length,
      files: agentFiles
    };

    console.log(`📊 État du projet:`);
    console.log(`   - Agents: ${state.agents.count}`);
    console.log(`   - Fichiers détectés: ${Object.keys(state.files).length}`);

    return state;
  }

  /**
   * Prendre des décisions avec l'IA Claude
   */
  async makeAIDecisions(projectState, recommendations, tasks) {
    console.log('\n🤖 Prise de décisions avec Claude AI...\n');

    // Filtrer les recommandations pending
    const pendingRecs = recommendations.filter(r => r.status === 'pending');

    if (pendingRecs.length === 0) {
      console.log('ℹ️  Aucune recommandation pending à traiter');
      return;
    }

    console.log(`📝 ${pendingRecs.length} recommandations à évaluer avec l'IA`);

    // Préparer le contexte pour Claude
    const context = `État du projet:
- ${projectState.agents.count} agents actifs
- ${recommendations.length} recommandations totales
- ${tasks.length} tâches en cours

Recommandations pending (${pendingRecs.length}):
${pendingRecs.slice(0, 10).map((r, i) => `${i + 1}. [${r.priority}] ${r.title} (par ${r.from})`).join('\n')}`;

    // Demander à Claude de prioriser et décider
    try {
      const decision = await this.ai.makeDecision(
        context,
        [
          'Approuver les recommandations high priority et créer des tâches',
          'Rejeter les recommandations non pertinentes',
          'Demander plus d\'informations avant de décider',
          'Escalader vers l\'utilisateur pour décision business'
        ],
        [
          'Carte blanche sur le projet',
          'Objectif: amélioration continue',
          'Budget: raisonnable',
          'Qualité > Rapidité'
        ]
      );

      console.log('\n🧠 Décision de Claude:\n');
      console.log(JSON.stringify(decision, null, 2));

      this.decisions.push({
        type: 'ai_decision',
        timestamp: new Date().toISOString(),
        decision: decision
      });

      // Appliquer les décisions
      await this.applyAIDecisions(decision, pendingRecs);

    } catch (error) {
      console.error('❌ Erreur lors de la décision IA:', error.message);
      await this.makeFallbackDecisions(pendingRecs);
    }
  }

  /**
   * Appliquer les décisions de l'IA
   */
  async applyAIDecisions(decision, recommendations) {
    console.log('\n⚡ Application des décisions...\n');

    // Si décision inclut d'approuver des recs
    if (decision.decision && decision.decision.toLowerCase().includes('approuver')) {
      // Approuver les high priority
      const highPriority = recommendations.filter(r => r.priority === 'high' || r.priority === 'critical');

      for (const rec of highPriority.slice(0, 5)) { // Limiter à 5 pour ne pas surcharger
        console.log(`✅ Approuver: ${rec.title}`);

        // Créer une tâche
        await this.hub.createTask({
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          fromRecommendation: rec.id,
          assignedTo: 'Agent Développeur' // ou autre selon le type
        });

        // Mettre à jour la recommandation
        await this.hub.updateRecommendation(rec.id, {
          status: 'approved',
          approvedBy: 'Agent Chef (AI)',
          approvedAt: new Date().toISOString()
        });
      }
    }

    // Si décision inclut d'escalader
    if (decision.decision && decision.decision.toLowerCase().includes('escalader')) {
      console.log('📞 Escalade vers utilisateur suggérée par l\'IA');
      // TODO: Créer escalation si pertinent
    }
  }

  /**
   * Décisions de secours (sans IA)
   */
  async makeFallbackDecisions(recommendations) {
    console.log('\n⚠️  Mode fallback - Décisions basées sur règles simples\n');

    const criticalRecs = recommendations.filter(r =>
      r.status === 'pending' &&
      r.priority === 'critical'
    );

    if (criticalRecs.length > 0) {
      console.log(`🔴 ${criticalRecs.length} recommandations CRITICAL - auto-approbation`);

      for (const rec of criticalRecs) {
        await this.hub.updateRecommendation(rec.id, {
          status: 'approved',
          approvedBy: 'Agent Chef (Fallback)',
          approvedAt: new Date().toISOString()
        });
      }

      this.decisions.push({
        type: 'fallback_approval',
        count: criticalRecs.length,
        items: criticalRecs.map(r => r.title)
      });
    }
  }

  /**
   * Escalader le besoin d'avoir l'API Claude
   */
  async escalateNeedForAI() {
    console.log('\n📞 Escalade: Besoin Claude AI API Key\n');

    await escalateAPIKey(
      'Agent Chef',
      'Claude (Anthropic)',
      'Permettre aux agents de prendre de vraies décisions intelligentes avec IA',
      'Selon usage (~$10-50/mois estimé)',
      [
        { name: 'Règles simples', reason: 'Pas assez intelligent, décisions sous-optimales' },
        { name: 'Scripts basiques', reason: 'Impossible de comprendre le contexte complexe' }
      ]
    );
  }

  /**
   * Sauvegarder le rapport
   */
  async saveReport() {
    const reportPath = path.join(CONFIG.projectRoot, 'RAPPORT-AGENT-CHEF-AI.md');

    const report = `# 🤖 RAPPORT - Agent Chef AI-Powered

**Date**: ${new Date().toLocaleString('fr-FR')}
**Mode**: ${this.useAI ? '✅ Intelligence Artificielle (Claude)' : '⚠️  Fallback (règles simples)'}

---

## 📊 Décisions Prises

Total: ${this.decisions.length}

${this.decisions.map((d, i) => `
### ${i + 1}. ${d.type}

${JSON.stringify(d, null, 2)}
`).join('\n')}

---

## 🎯 Résumé

${this.useAI ?
  '✅ Agent Chef fonctionne avec Intelligence Artificielle via Claude API' :
  '⚠️  Agent Chef fonctionne en mode fallback (configurer ANTHROPIC_API_KEY pour activer l\'IA)'}

${this.decisions.length > 0 ?
  `${this.decisions.length} décisions prises automatiquement` :
  'Aucune décision nécessaire pour le moment'}

---

**🤖 Généré par Agent Chef AI-Powered**
**"Vraie intelligence, vraies décisions"**
`;

    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`\n📄 Rapport sauvegardé: RAPPORT-AGENT-CHEF-AI.md`);
  }
}

// ============================================================================
// EXÉCUTION
// ============================================================================

if (require.main === module) {
  const agent = new AgentChefAI();

  agent.run()
    .then(() => {
      console.log('\n✅ Agent Chef AI - Succès');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Agent Chef AI - Échec:', error);
      process.exit(1);
    });
}

module.exports = { AgentChefAI, CONFIG };
