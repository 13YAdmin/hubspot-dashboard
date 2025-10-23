#!/usr/bin/env node

/**
 * AGENT PUBLISHING/OPERATIONS - Directeur des Opérations
 *
 * Responsabilités:
 * - Maintenir README.md et documentation à jour
 * - Mettre à jour l'organigramme de la société automatiquement
 * - Synchroniser la documentation avec l'état réel du système
 * - Générer la vitrine de l'entreprise (showcase)
 * - Publier les rapports et status updates
 * - Maintenir la cohérence de toute la documentation
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  projectRoot: path.resolve(__dirname, '../../..'),
  communicationDir: path.resolve(__dirname, '../../../.github/agents-communication'),
  docsDir: path.resolve(__dirname, '../../..'),
  readme: 'README.md',
  orgChartFile: 'SOCIÉTÉ-AUTONOME.md',
  autoUpdateFiles: [
    'README.md',
    'SOCIÉTÉ-AUTONOME.md',
    'STATUS-AUTO.md'
  ]
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

  async readMetrics() {
    const file = path.join(this.baseDir, 'metrics.json');
    if (!fs.existsSync(file)) return {};
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    return data || {};
  }
}

// ============================================================================
// AGENT PUBLISHING - CLASSE PRINCIPALE
// ============================================================================

class AgentPublishing {
  constructor() {
    this.hub = new CommunicationHub();
    this.agentsState = {
      active: [],
      pending: [],
      total: 0
    };
    this.workflowsState = {
      active: 0,
      total: 0
    };
    this.metrics = {};
    this.updates = [];
  }

  /**
   * Point d'entrée principal
   */
  async run() {
    console.log('📰 AGENT PUBLISHING/OPERATIONS - Directeur des Opérations');
    console.log('==========================================================\n');

    try {
      // 1. Analyser l'état actuel du système
      await this.analyzeSystemState();

      // 2. Détecter les changements depuis la dernière publication
      const changes = await this.detectChanges();

      // 3. Mettre à jour README.md
      if (changes.readme) {
        await this.updateReadme();
      }

      // 4. Mettre à jour l'organigramme
      if (changes.orgChart) {
        await this.updateOrgChart();
      }

      // 5. Générer le status auto-update
      await this.generateStatusReport();

      // 6. Sauvegarder les métriques de publication
      await this.savePublishingMetrics();

      console.log('\n✅ Agent Publishing - Exécution terminée');
      console.log(`📊 ${this.updates.length} mises à jour effectuées`);

    } catch (error) {
      console.error('❌ Erreur Agent Publishing:', error.message);
      throw error;
    }
  }

  /**
   * Analyse l'état actuel du système
   */
  async analyzeSystemState() {
    console.log('🔍 Analyse de l\'état du système...\n');

    // Analyser les agents actifs
    this.agentsState = await this.scanAgents();
    console.log(`👥 Agents: ${this.agentsState.active.length} actifs sur ${this.agentsState.total} définis`);

    // Analyser les workflows
    this.workflowsState = await this.scanWorkflows();
    console.log(`🔄 Workflows: ${this.workflowsState.active} actifs`);

    // Récupérer les métriques du Communication Hub
    this.metrics = await this.hub.readMetrics();
    console.log(`📊 Métriques: ${Object.keys(this.metrics).length} collectées`);

    // Compter les recommandations et tâches
    const recommendations = await this.hub.readRecommendations();
    const tasks = await this.hub.readTasks();
    console.log(`💡 Recommandations: ${recommendations.length} dans le hub`);
    console.log(`📋 Tâches: ${tasks.length} dans le système`);
  }

  /**
   * Scanne les agents actifs
   */
  async scanAgents() {
    const agentsDir = path.join(CONFIG.projectRoot, '.github/scripts/autonomous-agents');

    const active = [];
    const allAgents = [
      { name: 'Agent Chef de Projet', file: 'agent-chef.js', role: 'CEO', priority: 'critical' },
      { name: 'Agent Visionnaire', file: 'agent-visionnaire.js', role: 'CTO', priority: 'critical' },
      { name: 'Agent Producteur', file: 'agent-producteur.js', role: 'COO', priority: 'critical' },
      { name: 'Agent RH', file: 'agent-rh.js', role: 'HR Manager', priority: 'high' },
      { name: 'Agent Aiguilleur', file: 'agent-aiguilleur.js', role: 'Traffic Controller', priority: 'high' },
      { name: 'Agent Quick Wins', file: 'agent-quick-wins.js', role: 'Fast Implementation', priority: 'high' },
      { name: 'Agent Publishing', file: 'agent-publishing.js', role: 'Director of Operations', priority: 'high' },
      { name: 'Agent Développeur', file: 'agent-developer.js', role: 'Senior Developer', priority: 'critical' },
      { name: 'Agent QA', file: 'agent-qa.js', role: 'QA Engineer', priority: 'critical' },
      { name: 'Agent Debugger', file: 'agent-debugger.js', role: 'Debugger', priority: 'critical' },
      { name: 'Agent Monitoring', file: 'agent-monitoring.js', role: 'Health Monitor', priority: 'critical' },
      { name: 'Agent Self-Healing', file: 'agent-self-healing.js', role: 'Auto-Repair', priority: 'critical' },
      { name: 'Agent Tech Lead', file: 'agent-tech-lead.js', role: 'Tech Lead', priority: 'high' }
    ];

    for (const agent of allAgents) {
      const agentPath = path.join(agentsDir, agent.file);
      if (fs.existsSync(agentPath)) {
        active.push(agent);
      }
    }

    return {
      active,
      pending: allAgents.filter(a => !active.find(b => b.file === a.file)),
      total: allAgents.length
    };
  }

  /**
   * Scanne les workflows actifs
   */
  async scanWorkflows() {
    const workflowsDir = path.join(CONFIG.projectRoot, '.github/workflows');

    if (!fs.existsSync(workflowsDir)) {
      return { active: 0, total: 0 };
    }

    const files = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));

    return {
      active: files.length,
      total: files.length
    };
  }

  /**
   * Détecte les changements nécessitant une mise à jour
   */
  async detectChanges() {
    console.log('\n🔍 Détection des changements...\n');

    const changes = {
      readme: false,
      orgChart: false,
      status: true  // Status toujours mis à jour
    };

    // Vérifier si le README nécessite une mise à jour
    const readmePath = path.join(CONFIG.projectRoot, CONFIG.readme);
    if (fs.existsSync(readmePath)) {
      const content = fs.readFileSync(readmePath, 'utf8');

      // Vérifier si les badges sont à jour
      const currentAgentCount = `${this.agentsState.active.length}/${this.agentsState.total}`;
      if (!content.includes(currentAgentCount)) {
        changes.readme = true;
        console.log(`📝 README nécessite mise à jour (agents: ${currentAgentCount})`);
      }

      // Vérifier si workflows count est à jour
      if (!content.includes(`${this.workflowsState.active} actifs`)) {
        changes.readme = true;
        console.log(`📝 README nécessite mise à jour (workflows: ${this.workflowsState.active})`);
      }
    } else {
      changes.readme = true;
      console.log(`📝 README n'existe pas, création nécessaire`);
    }

    // Vérifier si l'organigramme nécessite une mise à jour
    const orgChartPath = path.join(CONFIG.projectRoot, CONFIG.orgChartFile);
    if (fs.existsSync(orgChartPath)) {
      const content = fs.readFileSync(orgChartPath, 'utf8');

      // Vérifier si les agents actifs sont marqués correctement
      for (const agent of this.agentsState.active) {
        if (!content.includes(`✅ Existe`) || content.includes(`❌ À recruter`)) {
          changes.orgChart = true;
          console.log(`📝 Organigramme nécessite mise à jour`);
          break;
        }
      }
    }

    return changes;
  }

  /**
   * Met à jour le README.md avec l'état actuel
   */
  async updateReadme() {
    console.log('\n📝 Mise à jour du README.md...\n');

    const readmePath = path.join(CONFIG.projectRoot, CONFIG.readme);

    if (!fs.existsSync(readmePath)) {
      console.log('⚠️  README.md n\'existe pas, skip mise à jour');
      return;
    }

    let content = fs.readFileSync(readmePath, 'utf8');

    // Mettre à jour les badges
    const agentBadge = `[![Agents](https://img.shields.io/badge/Agents-${this.agentsState.active.length}%2F${this.agentsState.total}-blue)]()`;
    const workflowBadge = `[![Workflows](https://img.shields.io/badge/Workflows-${this.workflowsState.active}%20actifs-orange)]()`;

    content = content.replace(/\[\!\[Agents\]\(.*?\)\]\(\)/, agentBadge);
    content = content.replace(/\[\!\[Workflows\]\(.*?\)\]\(\)/, workflowBadge);

    // Mettre à jour la section "Agents Actifs"
    const activeAgentsList = this.agentsState.active.map(a =>
      `| ${a.name} | ${a.role} | ✅ Actif |`
    ).join('\n');

    // Sauvegarder
    fs.writeFileSync(readmePath, content, 'utf8');

    this.updates.push({ file: 'README.md', action: 'updated', timestamp: new Date().toISOString() });
    console.log('✅ README.md mis à jour');
  }

  /**
   * Met à jour l'organigramme de la société
   */
  async updateOrgChart() {
    console.log('\n📝 Mise à jour de l\'organigramme...\n');

    const orgChartPath = path.join(CONFIG.projectRoot, CONFIG.orgChartFile);

    if (!fs.existsSync(orgChartPath)) {
      console.log('⚠️  SOCIÉTÉ-AUTONOME.md n\'existe pas, skip mise à jour');
      return;
    }

    let content = fs.readFileSync(orgChartPath, 'utf8');

    // Mettre à jour les statuts des agents
    for (const agent of this.agentsState.active) {
      // Marquer comme existant
      const regex = new RegExp(`(${agent.name}.*?)❌ À recruter`, 'g');
      content = content.replace(regex, `$1✅ Existe`);
    }

    // Mettre à jour les compteurs
    content = content.replace(/Équipe Actuelle: \d+ agents/, `Équipe Actuelle: ${this.agentsState.active.length} agents`);

    // Sauvegarder
    fs.writeFileSync(orgChartPath, content, 'utf8');

    this.updates.push({ file: 'SOCIÉTÉ-AUTONOME.md', action: 'updated', timestamp: new Date().toISOString() });
    console.log('✅ Organigramme mis à jour');
  }

  /**
   * Génère le rapport de status auto-update
   */
  async generateStatusReport() {
    console.log('\n📊 Génération du status report...\n');

    const statusPath = path.join(CONFIG.projectRoot, 'STATUS-AUTO.md');

    const recommendations = await this.hub.readRecommendations();
    const tasks = await this.hub.readTasks();

    const report = `# 📊 STATUS AUTO-UPDATE - Système Autonome

**Date**: ${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}
**Généré par**: Agent Publishing (Directeur des Opérations)

---

## 🏢 ÉTAT DE LA SOCIÉTÉ

### 👥 Équipe

- **Agents actifs**: ${this.agentsState.active.length} / ${this.agentsState.total}
- **Agents à recruter**: ${this.agentsState.pending.length}

#### Agents Actifs

${this.agentsState.active.map(a => `- ✅ **${a.name}** (${a.role})`).join('\n')}

#### Agents à Recruter (Priorités)

${this.agentsState.pending
  .filter(a => a.priority === 'critical')
  .map(a => `- 🔴 **${a.name}** (${a.role}) - CRITICAL`)
  .join('\n')}

${this.agentsState.pending
  .filter(a => a.priority === 'high')
  .map(a => `- 🟠 **${a.name}** (${a.role}) - HIGH`)
  .join('\n')}

---

## 🔄 WORKFLOWS

- **Workflows actifs**: ${this.workflowsState.active}

---

## 💡 COMMUNICATION HUB

### Recommandations

- **Total**: ${recommendations.length}
- **Pending**: ${recommendations.filter(r => r.status === 'pending').length}
- **Approved**: ${recommendations.filter(r => r.status === 'approved').length}
- **Rejected**: ${recommendations.filter(r => r.status === 'rejected').length}

### Tâches

- **Total**: ${tasks.length}
- **Pending**: ${tasks.filter(t => t.status === 'pending').length}
- **In Progress**: ${tasks.filter(t => t.status === 'in_progress').length}
- **Completed**: ${tasks.filter(t => t.status === 'completed').length}

---

## 📈 MÉTRIQUES SYSTÈME

${Object.keys(this.metrics).length > 0 ?
  Object.entries(this.metrics).map(([key, value]) => `- **${key}**: ${JSON.stringify(value)}`).join('\n') :
  '- Aucune métrique disponible'}

---

## 🔄 DERNIÈRES PUBLICATIONS

${this.updates.map(u => `- ${u.timestamp}: ${u.action} ${u.file}`).join('\n') || '- Aucune mise à jour récente'}

---

## 🎯 SANTÉ DU SYSTÈME

- 🟢 **Opérationnel**: ${this.agentsState.active.length} agents actifs
- 🟢 **Workflows**: ${this.workflowsState.active} actifs
- ${recommendations.filter(r => r.status === 'pending').length > 10 ? '🟠' : '🟢'} **Recommandations**: ${recommendations.filter(r => r.status === 'pending').length} en attente
- ${tasks.filter(t => t.status === 'pending').length > 20 ? '🟠' : '🟢'} **Tâches**: ${tasks.filter(t => t.status === 'pending').length} en attente

---

**📰 Auto-généré par Agent Publishing**
**"Vitrine de la société autonome"**
`;

    fs.writeFileSync(statusPath, report, 'utf8');

    this.updates.push({ file: 'STATUS-AUTO.md', action: 'generated', timestamp: new Date().toISOString() });
    console.log('✅ Status report généré');
  }

  /**
   * Sauvegarde les métriques de publication
   */
  async savePublishingMetrics() {
    const metricsPath = path.join(CONFIG.communicationDir, 'publishing-metrics.json');

    const metrics = {
      lastRun: new Date().toISOString(),
      agentsActive: this.agentsState.active.length,
      agentsTotal: this.agentsState.total,
      workflowsActive: this.workflowsState.active,
      updatesCount: this.updates.length,
      updates: this.updates
    };

    fs.writeFileSync(metricsPath, JSON.stringify(metrics, null, 2), 'utf8');
    console.log(`\n📊 Métriques sauvegardées: publishing-metrics.json`);
  }
}

// ============================================================================
// EXÉCUTION
// ============================================================================

if (require.main === module) {
  const agent = new AgentPublishing();

  agent.run()
    .then(() => {
      console.log('\n✅ Agent Publishing - Succès');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Agent Publishing - Échec:', error);
      process.exit(1);
    });
}

module.exports = { AgentPublishing, CONFIG };
