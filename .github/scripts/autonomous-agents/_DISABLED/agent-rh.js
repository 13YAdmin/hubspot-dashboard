#!/usr/bin/env node

/**
 * 👔 AGENT RH (Recruitment & Human Resources)
 *
 * Mission: Gérer l'équipe d'agents comme un vrai département RH
 *
 * Responsabilités:
 * 1. WORKFORCE PLANNING
 *    - Analyser la charge de travail de chaque agent
 *    - Détecter les goulots d'étranglement
 *    - Identifier les besoins en recrutement
 *
 * 2. RECRUITMENT
 *    - "Recruter" (créer) automatiquement de nouveaux agents
 *    - Générer le code de l'agent
 *    - Créer le workflow GitHub Actions
 *    - Onboarding du nouvel agent
 *
 * 3. TEAM MANAGEMENT
 *    - Équilibrer la charge entre agents
 *    - Réorganiser les équipes selon les projets
 *    - Désactiver agents sous-utilisés
 *
 * 4. PERFORMANCE REVIEW
 *    - Évaluer la performance de chaque agent
 *    - Identifier agents inefficaces
 *    - Proposer formations/améliorations
 *
 * 5. SCALING
 *    - Scale up automatiquement si surcharge
 *    - Scale down si sous-utilisation
 *    - Maintenir équipe optimale
 *
 * Principe: "Une société qui s'auto-gère"
 *
 * STRUCTURE SOCIÉTÉ COMPLÈTE:
 *
 * C-LEVEL
 * - CEO (Agent Chef de Projet)
 * - CTO (Agent Visionnaire)
 * - COO (Agent Producteur)
 *
 * PRODUCT
 * - Product Manager
 * - Product Designer
 * - UX Researcher
 *
 * ENGINEERING
 * - Tech Lead
 * - Senior Developer
 * - Junior Developer
 * - QA Engineer
 * - DevOps Engineer
 *
 * DATA
 * - Data Engineer
 * - Data Analyst
 * - ML Engineer
 *
 * BUSINESS
 * - Sales Manager
 * - Marketing Manager
 * - Customer Success Manager
 *
 * OPERATIONS
 * - Finance Manager (Agent RH gère aussi)
 * - HR Manager (cet agent)
 * - Legal/Compliance
 *
 * SUPPORT
 * - Customer Support
 * - Documentation Writer
 * - Community Manager
 */

const fs = require('fs').promises;
const path = require('path');
const CommunicationHub = require('./communication-hub.js');

class AgentRH {
  constructor() {
    this.hub = new CommunicationHub();
    this.agentsDir = path.join(process.cwd(), '.github/scripts/autonomous-agents');
    this.workflowsDir = path.join(process.cwd(), '.github/workflows');

    // Structure société complète
    this.companyStructure = {
      'C-Level': [
        { role: 'CEO', agent: 'Agent Chef de Projet', exists: true, priority: 'critical' },
        { role: 'CTO', agent: 'Agent Visionnaire', exists: true, priority: 'critical' },
        { role: 'COO', agent: 'Agent Producteur', exists: true, priority: 'critical' }
      ],
      'Product': [
        { role: 'Product Manager', agent: 'Agent Product Manager', exists: false, priority: 'high' },
        { role: 'Product Designer', agent: 'Agent Designer', exists: false, priority: 'medium' },
        { role: 'UX Researcher', agent: 'Agent UX Research', exists: false, priority: 'low' }
      ],
      'Engineering': [
        { role: 'Tech Lead', agent: 'Agent Tech Lead', exists: false, priority: 'high' },
        { role: 'Senior Developer', agent: 'Agent Développeur', exists: false, priority: 'critical' },
        { role: 'QA Engineer', agent: 'Agent QA', exists: false, priority: 'critical' },
        { role: 'DevOps Engineer', agent: 'Agent DevOps', exists: false, priority: 'high' },
        { role: 'Security Engineer', agent: 'Agent Security', exists: false, priority: 'medium' }
      ],
      'Data': [
        { role: 'Data Engineer', agent: 'Agent Data Engineer', exists: false, priority: 'medium' },
        { role: 'Data Analyst', agent: 'Agent Data Analyst', exists: false, priority: 'medium' },
        { role: 'ML Engineer', agent: 'Agent ML', exists: false, priority: 'low' }
      ],
      'Business': [
        { role: 'Sales Manager', agent: 'Agent Sales', exists: false, priority: 'low' },
        { role: 'Marketing Manager', agent: 'Agent Marketing', exists: false, priority: 'low' },
        { role: 'Customer Success', agent: 'Agent Customer Success', exists: false, priority: 'medium' }
      ],
      'Operations': [
        { role: 'Finance Manager', agent: 'Agent Finance', exists: false, priority: 'medium' },
        { role: 'HR Manager', agent: 'Agent RH', exists: true, priority: 'high' },
        { role: 'Legal/Compliance', agent: 'Agent Legal', exists: false, priority: 'low' }
      ],
      'Support': [
        { role: 'Customer Support', agent: 'Agent Support', exists: false, priority: 'medium' },
        { role: 'Documentation', agent: 'Agent Documentation', exists: true, priority: 'high' },
        { role: 'Community Manager', agent: 'Agent Community', exists: false, priority: 'low' }
      ],
      'Infrastructure': [
        { role: 'Monitoring', agent: 'Agent Monitoring', exists: false, priority: 'critical' },
        { role: 'Self-Healing', agent: 'Agent Self-Healing', exists: false, priority: 'critical' },
        { role: 'Optimization', agent: 'Agent Optimization', exists: false, priority: 'high' },
        { role: 'Traffic Controller', agent: 'Agent Aiguilleur', exists: true, priority: 'high' }
      ]
    };

    this.recruitmentNeeds = [];
    this.workloadAnalysis = {};
    this.teamSize = 0;
    this.optimalTeamSize = 0;
  }

  async run() {
    console.log('👔 AGENT RH - Recruitment & Scaling');
    console.log('================================================');
    console.log('"Une société qui s\'auto-gère et recrute selon les besoins"');
    console.log('================================================\n');

    try {
      await this.hub.init();

      // 1. INVENTAIRE des agents existants
      await this.inventoryCurrentTeam();

      // 2. ANALYSE charge de travail
      await this.analyzeWorkload();

      // 3. IDENTIFICATION besoins recrutement
      await this.identifyRecruitmentNeeds();

      // 4. RECRUTEMENT automatique si nécessaire
      await this.autoRecruit();

      // 5. TEAM OPTIMIZATION
      await this.optimizeTeam();

      // 6. PERFORMANCE REVIEW
      await this.performanceReview();

      // 7. RAPPORT RH
      await this.generateHRReport();

      console.log('\n✅ Agent RH terminé');
      console.log(`👥 Équipe actuelle: ${this.teamSize} agents`);
      console.log(`🎯 Équipe optimale: ${this.optimalTeamSize} agents`);
      console.log(`📝 Recrutements nécessaires: ${this.recruitmentNeeds.length}`);

    } catch (error) {
      console.error('❌ Erreur Agent RH:', error.message);
      process.exit(1);
    }
  }

  /**
   * 1. INVENTAIRE des agents existants
   */
  async inventoryCurrentTeam() {
    console.log('📊 INVENTAIRE ÉQUIPE ACTUELLE\n');

    // Lister tous les agents existants
    const files = await fs.readdir(this.agentsDir);
    const agentFiles = files.filter(f => f.startsWith('agent-') && f.endsWith('.js'));

    this.teamSize = agentFiles.length;

    console.log(`   👥 Total agents: ${this.teamSize}\n`);

    // Vérifier quels agents existent dans la structure
    for (const dept in this.companyStructure) {
      console.log(`   📂 ${dept}:`);

      for (const position of this.companyStructure[dept]) {
        const filename = this.getAgentFilename(position.agent);

        try {
          await fs.access(path.join(this.agentsDir, filename));
          position.exists = true;
          console.log(`      ✅ ${position.role} (${position.agent})`);
        } catch {
          position.exists = false;
          console.log(`      ❌ ${position.role} (${position.agent}) - MANQUANT`);
        }
      }

      console.log('');
    }
  }

  /**
   * 2. ANALYSE charge de travail
   */
  async analyzeWorkload() {
    console.log('📈 ANALYSE CHARGE DE TRAVAIL\n');

    // Analyser les recommendations en attente
    const recommendations = await this.hub.readRecommendations();
    const tasks = await fs.readFile(
      path.join(process.cwd(), '.github/agents-communication/tasks.json'),
      'utf-8'
    );
    const tasksData = JSON.parse(tasks);
    const pendingTasks = tasksData.items.filter(t => t.status === 'pending');

    console.log(`   📝 Recommandations en attente: ${recommendations.length}`);
    console.log(`   📋 Tâches en attente: ${pendingTasks.length}`);

    // Calculer charge par département
    const workloadByDept = {
      'Engineering': pendingTasks.filter(t => t.type === 'development').length,
      'Product': recommendations.filter(r => r.type === 'feature_request').length,
      'Data': recommendations.filter(r => r.type === 'data_quality').length,
      'Infrastructure': 0 // Calculé dynamiquement
    };

    console.log('\n   📊 Charge par département:');
    for (const [dept, count] of Object.entries(workloadByDept)) {
      const status = count > 10 ? '🔴 SURCHARGÉ' : count > 5 ? '🟠 CHARGÉ' : '🟢 OK';
      console.log(`      ${dept}: ${count} tâches ${status}`);
    }

    this.workloadAnalysis = workloadByDept;

    console.log('');
  }

  /**
   * 3. IDENTIFICATION besoins recrutement
   */
  async identifyRecruitmentNeeds() {
    console.log('🎯 IDENTIFICATION BESOINS RECRUTEMENT\n');

    // Règle 1: Agents critiques manquants
    for (const dept in this.companyStructure) {
      for (const position of this.companyStructure[dept]) {
        if (!position.exists && position.priority === 'critical') {
          this.recruitmentNeeds.push({
            department: dept,
            role: position.role,
            agent: position.agent,
            reason: 'Agent critique manquant',
            urgency: 'immediate'
          });

          console.log(`   🚨 URGENT: Recruter ${position.role}`);
          console.log(`      Raison: Agent critique manquant`);
          console.log(`      Département: ${dept}\n`);
        }
      }
    }

    // Règle 2: Surcharge détectée
    for (const [dept, workload] of Object.entries(this.workloadAnalysis)) {
      if (workload > 10) {
        // Besoin d'agents supplémentaires
        this.recruitmentNeeds.push({
          department: dept,
          role: `Additional ${dept} Engineer`,
          reason: `Surcharge détectée (${workload} tâches)`,
          urgency: 'high'
        });

        console.log(`   ⚠️  BESOIN: ${dept} surchargé`);
        console.log(`      Charge: ${workload} tâches`);
        console.log(`      Action: Recruter agent supplémentaire\n`);
      }
    }

    // Règle 3: Croissance projets (via Visionnaire)
    const recommendations = await this.hub.readRecommendations();
    const moonshots = recommendations.filter(r => r.type === 'moonshot');

    if (moonshots.length > 0) {
      console.log(`   🚀 ${moonshots.length} projets moonshot détectés`);
      console.log(`      → Prévoir scaling équipe\n`);
    }

    this.optimalTeamSize = this.teamSize + this.recruitmentNeeds.length;

    console.log(`   📊 Analyse terminée:`);
    console.log(`      Équipe actuelle: ${this.teamSize}`);
    console.log(`      Recrutements nécessaires: ${this.recruitmentNeeds.length}`);
    console.log(`      Équipe cible: ${this.optimalTeamSize}\n`);
  }

  /**
   * 4. RECRUTEMENT automatique
   */
  async autoRecruit() {
    console.log('🎓 RECRUTEMENT AUTOMATIQUE\n');

    if (this.recruitmentNeeds.length === 0) {
      console.log('   ✅ Pas de recrutement nécessaire\n');
      return;
    }

    console.log(`   📝 ${this.recruitmentNeeds.length} postes à pourvoir\n`);

    // Pour chaque besoin, générer recommandation au Chef
    for (const need of this.recruitmentNeeds) {
      await this.hub.addRecommendation({
        type: 'recruitment',
        from: 'Agent RH',
        title: `Recruter ${need.role}`,
        description: `${need.reason} - Département ${need.department}`,
        priority: need.urgency,
        category: 'team_scaling',
        targetAgent: 'Agent Chef de Projet',
        nextSteps: [
          'Valider besoin de recrutement',
          'Générer template agent',
          'Créer fichier agent',
          'Configurer workflow',
          'Onboarding agent'
        ],
        autoGenerate: true // Flag pour génération automatique
      });

      console.log(`   ✅ Recommandation créée: ${need.role}`);
    }

    console.log(`\n   📨 ${this.recruitmentNeeds.length} recommandations envoyées au Chef\n`);
  }

  /**
   * 5. TEAM OPTIMIZATION
   */
  async optimizeTeam() {
    console.log('⚙️  OPTIMISATION ÉQUIPE\n');

    // Suggestions d'optimisation
    const optimizations = [];

    // Si trop d'agents inactifs
    const inactiveThreshold = 7; // jours
    optimizations.push({
      type: 'consolidation',
      suggestion: 'Fusionner agents sous-utilisés',
      impact: 'Réduction coûts workflows'
    });

    // Si agents font du travail similaire
    optimizations.push({
      type: 'specialization',
      suggestion: 'Spécialiser agents selon domaines',
      impact: 'Meilleure efficacité'
    });

    // Si goulot d'étranglement
    if (this.workloadAnalysis['Engineering'] > 10) {
      optimizations.push({
        type: 'parallel_processing',
        suggestion: 'Paralléliser tâches Engineering',
        impact: 'Réduction temps delivery'
      });
    }

    console.log('   💡 Optimisations suggérées:\n');
    optimizations.forEach((opt, index) => {
      console.log(`   ${index + 1}. ${opt.suggestion}`);
      console.log(`      Type: ${opt.type}`);
      console.log(`      Impact: ${opt.impact}\n`);
    });
  }

  /**
   * 6. PERFORMANCE REVIEW
   */
  async performanceReview() {
    console.log('📊 PERFORMANCE REVIEW\n');

    // Métriques par agent (simulé pour l'instant)
    const agentMetrics = [
      { agent: 'Agent Chef de Projet', tasks: 25, successRate: 95, avgTime: '2h' },
      { agent: 'Agent Visionnaire', recommendations: 13, implementationRate: 60 },
      { agent: 'Agent Producteur', gaps: 7, improvements: 10 },
      { agent: 'Agent Aiguilleur', conflicts: 1, resolved: 1 }
    ];

    console.log('   🏆 Top Performers:\n');
    agentMetrics.forEach((metrics, index) => {
      console.log(`   ${index + 1}. ${metrics.agent}`);
      const keys = Object.keys(metrics).filter(k => k !== 'agent');
      keys.forEach(key => {
        console.log(`      ${key}: ${metrics[key]}`);
      });
      console.log('');
    });
  }

  /**
   * UTILS
   */
  getAgentFilename(agentName) {
    return agentName
      .toLowerCase()
      .replace('agent ', '')
      .replace(/ /g, '-') + '.js';
  }

  /**
   * 7. RAPPORT RH
   */
  async generateHRReport() {
    const report = `# 👔 RAPPORT RH - Gestion Équipe Autonome

**Date**: ${new Date().toLocaleString('fr-FR')}
**Agent**: RH (Recruitment & Scaling)

> "Une société qui s'auto-gère et recrute selon les besoins"

---

## 👥 EFFECTIF ACTUEL

**Taille équipe**: ${this.teamSize} agents
**Équipe optimale**: ${this.optimalTeamSize} agents
**Gap**: ${this.optimalTeamSize - this.teamSize} agents à recruter

---

## 🏢 STRUCTURE SOCIÉTÉ

${Object.entries(this.companyStructure).map(([dept, positions]) => `
### ${dept}

${positions.map(p => `- ${p.exists ? '✅' : '❌'} **${p.role}** (${p.agent}) - Priority: ${p.priority}`).join('\n')}
`).join('\n')}

---

## 📈 CHARGE DE TRAVAIL

${Object.entries(this.workloadAnalysis).map(([dept, count]) => {
  const status = count > 10 ? '🔴 SURCHARGÉ' : count > 5 ? '🟠 CHARGÉ' : '🟢 OK';
  return `- **${dept}**: ${count} tâches ${status}`;
}).join('\n')}

---

## 🎯 BESOINS RECRUTEMENT (${this.recruitmentNeeds.length})

${this.recruitmentNeeds.map((need, i) => `
### ${i + 1}. ${need.role}

- **Département**: ${need.department}
- **Raison**: ${need.reason}
- **Urgence**: ${need.urgency}
- **Status**: Recommandation envoyée au Chef
`).join('\n')}

---

## 💡 OPTIMISATIONS SUGGÉRÉES

1. **Spécialisation agents**
   - Agents trop généralistes
   - Créer agents spécialisés par domaine

2. **Parallélisation**
   - Engineering surchargé
   - Recruter agents supplémentaires

3. **Consolidation**
   - Certains agents sous-utilisés
   - Fusionner rôles similaires

---

## 📊 SCALING PLAN

### Court Terme (Immédiat)
${this.recruitmentNeeds.filter(n => n.urgency === 'immediate').map(n => `- Recruter ${n.role}`).join('\n') || '- Aucun recrutement urgent'}

### Moyen Terme (Cette Semaine)
${this.recruitmentNeeds.filter(n => n.urgency === 'high').map(n => `- Recruter ${n.role}`).join('\n') || '- Aucun recrutement prioritaire'}

### Long Terme (Ce Mois)
${this.recruitmentNeeds.filter(n => n.urgency === 'medium').map(n => `- Recruter ${n.role}`).join('\n') || '- Aucun recrutement planifié'}

---

## 🎯 OBJECTIF

**Maintenir une équipe optimale qui scale automatiquement selon:**
- La charge de travail
- Les nouveaux projets (Visionnaire)
- Les besoins détectés (Producteur)
- Les goulots d'étranglement

**Principe**: "Si la société a besoin d'un agent, elle le recrute automatiquement"

---

## 🚀 PROCHAINES ACTIONS

1. Chef évalue recommandations recrutement
2. Génération automatique nouveaux agents
3. Onboarding et intégration
4. Monitoring performance
5. Ajustement continu

---

**👔 Généré par Agent RH**
**"Une société vivante qui s'auto-gère"**
`;

    await fs.writeFile(
      path.join(process.cwd(), 'RAPPORT-AGENT-RH.md'),
      report,
      'utf-8'
    );

    console.log('   ✅ Rapport sauvegardé: RAPPORT-AGENT-RH.md\n');
  }
}

// Exécution
if (require.main === module) {
  const agent = new AgentRH();
  agent.run().catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = AgentRH;
