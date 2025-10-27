#!/usr/bin/env node

/**
 * AGENT RH - VERSION AI-POWERED (HR Manager)
 *
 * Utilise Claude AI pour des décisions intelligentes de recrutement
 *
 * Responsabilités:
 * - Analyser intelligemment la charge de travail
 * - Détecter les besoins réels de recrutement (pas juste comptage)
 * - Recommander les bons agents au bon moment
 * - Anticiper les besoins futurs selon roadmap
 * - Optimiser la structure de l'équipe
 */

const fs = require('fs');
const path = require('path');
const { ClaudeAIEngine } = require('./claude-ai-engine');
const { UserEscalationSystem } = require('./user-escalation-system');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  projectRoot: path.resolve(__dirname, '../../..'),
  communicationDir: path.resolve(__dirname, '../../../.github/agents-communication'),
  useAI: !!process.env.ANTHROPIC_API_KEY
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
      from: 'Agent RH (AI)',
      timestamp: new Date().toISOString(),
      ...recommendation,
      status: 'pending'
    };

    data.items.push(newRec);
    data.lastUpdate = new Date().toISOString();

    fs.writeFileSync(file, JSON.stringify(data, null, 2));
    return newRec.id;
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
}

// ============================================================================
// AGENT RH AI-POWERED
// ============================================================================

class AgentRHAI {
  constructor() {
    this.ai = new ClaudeAIEngine();
    this.hub = new CommunicationHub();
    this.escalationSystem = new UserEscalationSystem();
    this.recruitmentNeeds = [];
    this.useAI = CONFIG.useAI;

    if (this.useAI) {
      console.log('👔 Agent RH AI - Mode INTELLIGENCE ARTIFICIELLE activé');
    } else {
      console.log('⚠️  Agent RH AI - Mode fallback (configurer ANTHROPIC_API_KEY)');
    }
  }

  /**
   * Point d'entrée principal
   */
  async run() {
    console.log('\n👔 AGENT RH (AI-POWERED) - HR Manager');
    console.log('======================================\n');

    try {
      // 1. Analyser l'état de l'équipe
      const teamState = await this.analyzeTeamState();

      // 2. Analyser la charge de travail
      const workload = await this.analyzeWorkload();

      // 3. Décider des recrutements avec IA
      if (this.useAI) {
        await this.makeAIRecruitmentDecisions(teamState, workload);
      } else {
        await this.makeFallbackDecisions(teamState, workload);
      }

      // 4. Communiquer au Chef
      await this.communicateToChef();

      // 5. Sauvegarder le rapport
      await this.saveReport(teamState, workload);

      console.log('\n✅ Agent RH AI - Exécution terminée');
      console.log(`👥 ${this.recruitmentNeeds.length} recommandations de recrutement`);

    } catch (error) {
      console.error('❌ Erreur Agent RH AI:', error.message);
      throw error;
    }
  }

  /**
   * Analyser l'état de l'équipe
   */
  async analyzeTeamState() {
    console.log('🔍 Analyse de l\'équipe...\n');

    const agentsDir = path.join(CONFIG.projectRoot, '.github/scripts/autonomous-agents');
    const agentFiles = fs.readdirSync(agentsDir).filter(f => f.startsWith('agent-') && f.endsWith('.js'));

    const activeAgents = agentFiles.map(f => {
      const name = f.replace('agent-', '').replace('.js', '').replace('-ai', '');
      return {
        file: f,
        name,
        isAI: f.includes('-ai')
      };
    });

    const allRoles = [
      { name: 'Chef', priority: 'critical', exists: activeAgents.some(a => a.name === 'chef') },
      { name: 'Visionnaire', priority: 'critical', exists: activeAgents.some(a => a.name === 'visionnaire') },
      { name: 'Producteur', priority: 'critical', exists: activeAgents.some(a => a.name === 'producteur') },
      { name: 'RH', priority: 'high', exists: activeAgents.some(a => a.name === 'rh') },
      { name: 'Développeur', priority: 'critical', exists: activeAgents.some(a => a.name.includes('dev')) },
      { name: 'QA', priority: 'critical', exists: activeAgents.some(a => a.name === 'qa') },
      { name: 'Debugger', priority: 'critical', exists: activeAgents.some(a => a.name === 'debugger') },
      { name: 'Monitoring', priority: 'critical', exists: activeAgents.some(a => a.name === 'monitoring') },
      { name: 'Self-Healing', priority: 'critical', exists: activeAgents.some(a => a.name.includes('healing')) },
      { name: 'Tech Lead', priority: 'high', exists: activeAgents.some(a => a.name.includes('tech')) },
      { name: 'DevOps', priority: 'high', exists: activeAgents.some(a => a.name === 'devops') },
      { name: 'Publishing', priority: 'medium', exists: activeAgents.some(a => a.name === 'publishing') },
      { name: 'Aiguilleur', priority: 'medium', exists: activeAgents.some(a => a.name === 'aiguilleur') }
    ];

    const state = {
      activeAgents: activeAgents.length,
      totalRoles: allRoles.length,
      aiAgents: activeAgents.filter(a => a.isAI).length,
      missingCritical: allRoles.filter(r => r.priority === 'critical' && !r.exists),
      missingHigh: allRoles.filter(r => r.priority === 'high' && !r.exists),
      allRoles
    };

    console.log(`👥 État de l'équipe:`);
    console.log(`   - Agents actifs: ${state.activeAgents}`);
    console.log(`   - Agents AI: ${state.aiAgents}`);
    console.log(`   - Rôles critiques manquants: ${state.missingCritical.length}`);
    console.log(`   - Rôles high priority manquants: ${state.missingHigh.length}`);

    return state;
  }

  /**
   * Analyser la charge de travail
   */
  async analyzeWorkload() {
    console.log('\n📊 Analyse de la charge de travail...\n');

    const recommendations = await this.hub.readRecommendations();
    const tasks = await this.hub.readTasks();

    const workload = {
      totalRecommendations: recommendations.length,
      pendingRecommendations: recommendations.filter(r => r.status === 'pending').length,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status === 'pending').length,
      inProgressTasks: tasks.filter(t => t.status === 'in_progress').length
    };

    console.log(`📋 Charge de travail:`);
    console.log(`   - Recommandations pending: ${workload.pendingRecommendations}/${workload.totalRecommendations}`);
    console.log(`   - Tâches pending: ${workload.pendingTasks}/${workload.totalTasks}`);
    console.log(`   - Tâches en cours: ${workload.inProgressTasks}`);

    return workload;
  }

  /**
   * Décisions de recrutement avec IA
   */
  async makeAIRecruitmentDecisions(teamState, workload) {
    console.log('\n🧠 Analyse intelligente des besoins de recrutement...\n');

    const situation = `Équipe actuelle:
- ${teamState.activeAgents} agents actifs (dont ${teamState.aiAgents} AI-powered)
- ${teamState.missingCritical.length} rôles CRITICAL manquants: ${teamState.missingCritical.map(r => r.name).join(', ')}
- ${teamState.missingHigh.length} rôles HIGH priority manquants: ${teamState.missingHigh.map(r => r.name).join(', ')}

Charge de travail:
- ${workload.pendingRecommendations} recommandations en attente
- ${workload.pendingTasks} tâches pending
- ${workload.inProgressTasks} tâches en cours

Contexte:
- Projet: Dashboard HubSpot autonome
- Objectif: Système qui s'auto-améliore, s'auto-répare, scale automatiquement
- Contrainte: Les agents doivent pouvoir travailler de manière autonome`;

    const decision = await this.ai.makeDecision(
      situation,
      [
        'Recruter uniquement les rôles CRITICAL manquants immédiatement',
        'Recruter tous les rôles manquants (CRITICAL + HIGH) progressivement',
        'Prioriser selon charge de travail actuelle',
        'Attendre et observer avant de recruter'
      ],
      [
        'Les agents ont carte blanche pour recruter',
        'Privilégier qualité sur quantité',
        'Nouveaux agents doivent apporter valeur immédiate',
        'Budget raisonnable (agents = code gratuit)'
      ]
    );

    console.log('\n🎯 Décision IA:\n');
    console.log(JSON.stringify(decision, null, 2));

    // Analyser la décision et créer les recommandations
    if (decision.decision && !decision.error) {
      // Recruter les critiques si la décision le recommande
      if (decision.decision.toLowerCase().includes('critical') ||
          decision.decision.toLowerCase().includes('immédiat')) {

        for (const role of teamState.missingCritical) {
          this.recruitmentNeeds.push({
            role: role.name,
            priority: 'critical',
            reasoning: decision.reasoning || 'Rôle critique manquant identifié par IA',
            urgency: 'immediate'
          });
        }
      }

      // Recruter progressivement si recommandé
      if (decision.decision.toLowerCase().includes('progressivement') ||
          decision.decision.toLowerCase().includes('tous')) {

        for (const role of teamState.missingHigh.slice(0, 3)) { // Limiter à 3
          this.recruitmentNeeds.push({
            role: role.name,
            priority: 'high',
            reasoning: decision.reasoning || 'Rôle important identifié par IA',
            urgency: 'this_week'
          });
        }
      }

      // Prioriser selon workload
      if (decision.decision.toLowerCase().includes('workload') ||
          decision.decision.toLowerCase().includes('charge')) {

        if (workload.pendingTasks > 10) {
          this.recruitmentNeeds.push({
            role: 'Développeur',
            priority: 'critical',
            reasoning: `Charge de travail élevée: ${workload.pendingTasks} tâches pending`,
            urgency: 'immediate'
          });
        }
      }
    }

    console.log(`\n✅ ${this.recruitmentNeeds.length} besoins de recrutement identifiés par l'IA`);
  }

  /**
   * Décisions de secours (sans IA)
   */
  async makeFallbackDecisions(teamState, workload) {
    console.log('\n⚠️  Mode fallback - Règles simples de recrutement\n');

    // Règle simple: recruter les critiques manquants
    for (const role of teamState.missingCritical) {
      this.recruitmentNeeds.push({
        role: role.name,
        priority: 'critical',
        reasoning: 'Rôle critique manquant',
        urgency: 'immediate'
      });
    }

    // Si beaucoup de tâches, recruter développeur
    if (workload.pendingTasks > 10 && !teamState.allRoles.find(r => r.name === 'Développeur')?.exists) {
      this.recruitmentNeeds.push({
        role: 'Développeur',
        priority: 'critical',
        reasoning: `Charge élevée: ${workload.pendingTasks} tâches`,
        urgency: 'immediate'
      });
    }

    console.log(`✅ ${this.recruitmentNeeds.length} besoins identifiés (mode fallback)`);
  }

  /**
   * Communiquer au Chef
   */
  async communicateToChef() {
    console.log('\n📤 Communication des recommandations au Chef...\n');

    for (const need of this.recruitmentNeeds) {
      await this.hub.addRecommendation({
        type: 'recruitment',
        title: `Recruter Agent ${need.role}`,
        description: `Recrutement recommandé par Agent RH (AI).\n\nRaison: ${need.reasoning}\n\nUrgence: ${need.urgency}`,
        priority: need.priority,
        category: 'Recruitment',
        urgency: need.urgency,
        autoGenerate: true, // Flag pour génération automatique future
        targetAgent: 'Agent Chef'
      });

      console.log(`✉️  [${need.priority}] Recruter ${need.role}`);
    }

    console.log(`\n✅ ${this.recruitmentNeeds.length} recommandations envoyées au Chef`);
  }

  /**
   * Sauvegarder le rapport
   */
  async saveReport(teamState, workload) {
    const reportPath = path.join(CONFIG.projectRoot, 'RAPPORT-AGENT-RH-AI.md');

    const report = `# 👔 RAPPORT RH - AI-Powered (HR Manager)

**Date**: ${new Date().toLocaleString('fr-FR')}
**Mode**: ${this.useAI ? '✅ Intelligence Artificielle (Claude)' : '⚠️  Fallback (règles simples)'}

---

## 👥 ÉTAT DE L'ÉQUIPE

- **Agents actifs**: ${teamState.activeAgents}
- **Agents AI-powered**: ${teamState.aiAgents}
- **Rôles critiques manquants**: ${teamState.missingCritical.length}
- **Rôles high priority manquants**: ${teamState.missingHigh.length}

### Rôles Manquants

#### 🔴 CRITICAL

${teamState.missingCritical.map(r => `- ${r.name}`).join('\n') || '- Aucun'}

#### 🟠 HIGH Priority

${teamState.missingHigh.map(r => `- ${r.name}`).join('\n') || '- Aucun'}

---

## 📊 CHARGE DE TRAVAIL

- **Recommandations pending**: ${workload.pendingRecommendations}
- **Tâches pending**: ${workload.pendingTasks}
- **Tâches en cours**: ${workload.inProgressTasks}

---

## 👥 RECOMMANDATIONS DE RECRUTEMENT

Total: ${this.recruitmentNeeds.length}

${this.recruitmentNeeds.map((need, i) => `
### ${i + 1}. Agent ${need.role}

- **Priorité**: ${need.priority}
- **Urgence**: ${need.urgency}
- **Raisonnement**: ${need.reasoning}
`).join('\n')}

${this.recruitmentNeeds.length === 0 ? 'Aucun recrutement nécessaire pour le moment.' : ''}

---

## 🎯 RÉSUMÉ

${this.useAI ?
  `✅ Agent RH utilise Claude AI pour analyser intelligemment les besoins de recrutement.

L'analyse prend en compte:
- L'état actuel de l'équipe
- La charge de travail réelle
- Les objectifs du projet
- Les priorités business
- L'urgence des besoins

Les décisions ne sont PAS basées sur des règles fixes, mais sur une analyse contextuelle intelligente.` :
  `⚠️  Agent RH fonctionne en mode fallback (règles simples).

Pour activer l'analyse intelligente:
1. Configurer ANTHROPIC_API_KEY dans GitHub Secrets
2. Voir CONFIGURATION-IA.md

Avec IA: analyse contextuelle, décisions optimales
Sans IA: règles fixes, décisions basiques`}

---

**👔 Généré par Agent RH AI-Powered**
**"Right people, right time, right roles"**
`;

    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`\n📄 Rapport sauvegardé: RAPPORT-AGENT-RH-AI.md`);
  }
}

// ============================================================================
// EXÉCUTION
// ============================================================================

if (require.main === module) {
  const agent = new AgentRHAI();

  agent.run()
    .then(() => {
      console.log('\n✅ Agent RH AI - Succès');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Agent RH AI - Échec:', error);
      process.exit(1);
    });
}

module.exports = { AgentRHAI, CONFIG };
