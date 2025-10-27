#!/usr/bin/env node

/**
 * AGENT PRODUCTEUR - VERSION AI-POWERED (COO - Process Improvement)
 *
 * Utilise Claude AI pour détecter intelligemment les problèmes du système
 *
 * Responsabilités:
 * - Détecter automatiquement les process gaps (sans qu'on ait à les signaler)
 * - Identifier les agents manquants critiques
 * - Analyser les failles d'architecture
 * - Proposer des améliorations de processus
 * - Anticiper les problèmes avant qu'ils arrivent
 *
 * Philosophie: "Si je dois le dire, c'est que le système a raté"
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
      from: 'Agent Producteur (AI)',
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
// AGENT PRODUCTEUR AI-POWERED
// ============================================================================

class AgentProducteurAI {
  constructor() {
    this.ai = new ClaudeAIEngine();
    this.hub = new CommunicationHub();
    this.escalationSystem = new UserEscalationSystem();
    this.improvements = [];
    this.useAI = CONFIG.useAI;

    if (this.useAI) {
      console.log('🏭 Agent Producteur AI - Mode INTELLIGENCE ARTIFICIELLE activé');
    } else {
      console.log('⚠️  Agent Producteur AI - Mode fallback (configurer ANTHROPIC_API_KEY)');
    }
  }

  /**
   * 🔧 AUTO-HEALING: Vérifie que la détection de problèmes fonctionne
   */
  async autoHealDetection() {
    console.log('\n🔧 AUTO-HEALING: Vérification détection de problèmes...\n');

    const issues = [];

    // 1. Vérifier que le dossier de communication existe
    if (!fs.existsSync(CONFIG.communicationDir)) {
      console.log('🔨 FIX: Création du dossier de communication...');
      fs.mkdirSync(CONFIG.communicationDir, { recursive: true });
      issues.push('Communication dir créé');
    }

    // 2. Vérifier qu'on a détecté des améliorations récemment
    const recommendationsPath = path.join(CONFIG.communicationDir, 'recommendations.json');
    if (fs.existsSync(recommendationsPath)) {
      const recs = JSON.parse(fs.readFileSync(recommendationsPath, 'utf8'));
      const recArray = Array.isArray(recs) ? recs : (recs.items || []);
      const producerRecs = recArray.filter(r => r.source === 'Agent Producteur (AI)');

      if (producerRecs.length === 0) {
        console.log('⚠️  Aucune amélioration détectée récemment - analyse approfondie requise');
        issues.push('Analyse peu productive → approfondir');
      }
    }

    // 3. Vérifier que l'IA fonctionne
    if (!this.useAI) {
      console.log('⚠️  IA NON ACTIVÉE - Détection limitée aux règles simples');
      issues.push('IA désactivée → mode fallback');
    }

    // 4. Vérifier que les fichiers essentiels existent
    const essentialPaths = [
      path.join(CONFIG.projectRoot, 'public/index.html'),
      path.join(CONFIG.projectRoot, 'RAPPORT-AGENT-QA.md')
    ];

    for (const filePath of essentialPaths) {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Fichier critique manquant: ${path.basename(filePath)}`);
        issues.push(`${path.basename(filePath)} manquant`);
      }
    }

    if (issues.length > 0) {
      console.log(`\n✅ AUTO-HEALING: ${issues.length} problème(s) détecté(s):`);
      issues.forEach(i => console.log(`  - ${i}`));
    } else {
      console.log('✅ Système de détection en bonne santé\n');
    }

    return issues;
  }

  /**
   * Point d'entrée principal
   */
  async run() {
    console.log('\n🏭 AGENT PRODUCTEUR (AI-POWERED) - COO / Process Improvement');
    console.log('==============================================================\n');

    try {
      // 0. AUTO-HEALING FIRST
      await this.autoHealDetection();

      // 1. Analyser le système complet
      const systemState = await this.analyzeSystemState();

      // 2. Détecter les problèmes avec IA
      if (this.useAI) {
        await this.detectIssuesWithAI(systemState);
      } else {
        await this.detectIssuesWithRules(systemState);
      }

      // 3. Communiquer au Chef
      await this.communicateToChef();

      // 4. Sauvegarder le rapport
      await this.saveReport(systemState);

      console.log('\n✅ Agent Producteur AI - Exécution terminée');
      console.log(`🔧 ${this.improvements.length} améliorations recommandées`);

    } catch (error) {
      console.error('❌ Erreur Agent Producteur AI:', error.message);
      throw error;
    }
  }

  /**
   * Analyser l'état complet du système
   */
  async analyzeSystemState() {
    console.log('🔍 Analyse complète du système...\n');

    const state = {
      timestamp: new Date().toISOString(),
      agents: {},
      workflows: {},
      communication: {},
      code: {}
    };

    // Analyser les agents
    const agentsDir = path.join(CONFIG.projectRoot, '.github/scripts/autonomous-agents');
    const agentFiles = fs.readdirSync(agentsDir).filter(f => f.startsWith('agent-') && f.endsWith('.js'));
    state.agents = {
      count: agentFiles.length,
      files: agentFiles,
      aiPowered: agentFiles.filter(f => f.includes('-ai')).length
    };

    // Analyser les workflows
    const workflowsDir = path.join(CONFIG.projectRoot, '.github/workflows');
    const workflowFiles = fs.readdirSync(workflowsDir).filter(f => f.endsWith('.yml'));
    state.workflows = {
      count: workflowFiles.length,
      files: workflowFiles
    };

    // Analyser communication hub
    const commDir = CONFIG.communicationDir;
    if (fs.existsSync(commDir)) {
      const commFiles = fs.readdirSync(commDir);
      state.communication = {
        files: commFiles,
        hasRecommendations: commFiles.includes('recommendations.json'),
        hasTasks: commFiles.includes('tasks.json'),
        hasEscalations: commFiles.includes('user-escalations.json')
      };
    }

    // Analyser le code principal
    const indexPath = path.join(CONFIG.projectRoot, 'public/index.html');
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, 'utf8');
      state.code = {
        indexExists: true,
        size: content.split('\n').length,
        hasTests: false // TODO: détecter tests
      };
    }

    console.log('📊 État système:');
    console.log(`   - Agents: ${state.agents.count} (${state.agents.aiPowered} AI)`);
    console.log(`   - Workflows: ${state.workflows.count}`);
    console.log(`   - Communication Hub: ${state.communication.files?.length || 0} fichiers`);
    console.log(`   - Code: ${state.code.size || 0} lignes`);

    return state;
  }

  /**
   * Détecter les problèmes avec IA
   */
  async detectIssuesWithAI(systemState) {
    console.log('\n🧠 Détection intelligente des problèmes...\n');

    const situation = `Analyse du système autonome:

Agents:
- ${systemState.agents.count} agents actifs
- ${systemState.agents.aiPowered} agents AI-powered
- Fichiers: ${systemState.agents.files.join(', ')}

Workflows:
- ${systemState.workflows.count} workflows
- Fichiers: ${systemState.workflows.files.join(', ')}

Communication:
- Recommendations: ${systemState.communication.hasRecommendations ? 'Oui' : 'Non'}
- Tasks: ${systemState.communication.hasTasks ? 'Oui' : 'Non'}
- Escalations: ${systemState.communication.hasEscalations ? 'Oui' : 'Non'}

Code:
- Index.html: ${systemState.code.size || 0} lignes
- Tests: ${systemState.code.hasTests ? 'Oui' : 'Non'}

Contexte:
- Objectif: Système autonome qui s'auto-améliore, s'auto-répare
- Philosophie: "Si je dois le dire, c'est que le système a raté"
- Les agents doivent détecter leurs propres problèmes`;

    const analysis = await this.ai.makeDecision(
      situation,
      [
        'Le système fonctionne parfaitement, aucune amélioration nécessaire',
        'Des process gaps existent, identifier et recommander corrections',
        'Architecture a des failles, proposer refactoring',
        'Agents manquants critiques détectés, escalader au RH'
      ],
      [
        'Carte blanche pour améliorer',
        'Privilégier auto-réparation et auto-détection',
        'Éviter dépendances manuelles',
        'Penser scalabilité long terme'
      ]
    );

    console.log('\n🎯 Analyse IA:\n');
    console.log(JSON.stringify(analysis, null, 2));

    // Analyser la réponse et créer des recommandations
    if (analysis && !analysis.error) {
      // Process gaps
      if (analysis.decision && analysis.decision.toLowerCase().includes('process')) {
        await this.analyzeProcessGaps(systemState);
      }

      // Architecture issues
      if (analysis.decision && analysis.decision.toLowerCase().includes('architecture')) {
        await this.analyzeArchitecture(systemState);
      }

      // Agents manquants
      if (analysis.decision && analysis.decision.toLowerCase().includes('manquant')) {
        this.improvements.push({
          type: 'missing_agent',
          title: 'Agents critiques manquants détectés',
          description: analysis.reasoning || 'Certains agents critiques sont manquants',
          priority: 'high',
          category: 'Team Structure'
        });
      }

      // Utiliser les risques identifiés par l'IA
      if (analysis.risks && analysis.risks.length > 0) {
        for (const risk of analysis.risks) {
          this.improvements.push({
            type: 'risk',
            title: `Risque détecté: ${risk}`,
            description: `Risque identifié par analyse IA: ${risk}`,
            priority: 'medium',
            category: 'Risk Management'
          });
        }
      }

      // Utiliser les next steps de l'IA
      if (analysis.nextSteps && analysis.nextSteps.length > 0) {
        for (const step of analysis.nextSteps.slice(0, 3)) {
          this.improvements.push({
            type: 'next_step',
            title: step,
            description: `Action recommandée par IA: ${step}`,
            priority: 'medium',
            category: 'Process Improvement'
          });
        }
      }
    }

    console.log(`\n✅ ${this.improvements.length} problèmes détectés par l'IA`);
  }

  /**
   * Analyser les process gaps avec IA
   */
  async analyzeProcessGaps(systemState) {
    console.log('🔍 Analyse des process gaps...');

    const processAnalysis = await this.ai.ask(
      `Tu es un expert en processus d'ingénierie logicielle et systèmes autonomes. Tu identifies les process gaps - des processus manquants qui peuvent causer des problèmes.`,
      `Analyse ce système autonome et identifie les process gaps:

Agents: ${systemState.agents.files.join(', ')}
Workflows: ${systemState.workflows.files.join(', ')}

Quels processus manquent? (ex: boucles de feedback, tests automatiques, rollback, etc.)

Réponds en JSON: { gaps: [{ name: string, impact: string, fix: string }] }`
    );

    try {
      const gaps = JSON.parse(processAnalysis);
      if (gaps.gaps) {
        for (const gap of gaps.gaps) {
          this.improvements.push({
            type: 'process_gap',
            title: gap.name,
            description: `Impact: ${gap.impact}\n\nSolution: ${gap.fix}`,
            priority: 'high',
            category: 'Process Gap'
          });
        }
      }
    } catch (e) {
      console.log('⚠️  Impossible de parser l\'analyse des process gaps');
    }
  }

  /**
   * Analyser l'architecture avec IA
   */
  async analyzeArchitecture(systemState) {
    console.log('🏗️  Analyse de l\'architecture...');

    const archAnalysis = await this.ai.ask(
      `Tu es un expert en architecture de systèmes distribués et autonomes. Tu identifies les failles d'architecture.`,
      `Analyse cette architecture:

Structure:
- ${systemState.agents.count} agents autonomes
- ${systemState.workflows.count} workflows GitHub Actions
- Communication via fichiers JSON
- Hébergement: GitHub Pages

Quelles sont les failles? (ex: single point of failure, race conditions, scalability, etc.)

Réponds en JSON: { flaws: [{ name: string, severity: string, solution: string }] }`
    );

    try {
      const flaws = JSON.parse(archAnalysis);
      if (flaws.flaws) {
        for (const flaw of flaws.flaws) {
          this.improvements.push({
            type: 'architecture_flaw',
            title: flaw.name,
            description: `Sévérité: ${flaw.severity}\n\nSolution: ${flaw.solution}`,
            priority: flaw.severity === 'high' ? 'high' : 'medium',
            category: 'Architecture'
          });
        }
      }
    } catch (e) {
      console.log('⚠️  Impossible de parser l\'analyse d\'architecture');
    }
  }

  /**
   * Détecter avec règles simples (fallback)
   */
  async detectIssuesWithRules(systemState) {
    console.log('\n⚠️  Mode fallback - Détection basique\n');

    // Règle 1: Pas assez d'agents AI
    if (systemState.agents.aiPowered < systemState.agents.count / 2) {
      this.improvements.push({
        type: 'process_gap',
        title: 'Pas assez d\'agents AI-powered',
        description: `Seulement ${systemState.agents.aiPowered}/${systemState.agents.count} agents utilisent l'IA`,
        priority: 'high',
        category: 'AI Integration'
      });
    }

    // Règle 2: Pas de tests
    if (!systemState.code.hasTests) {
      this.improvements.push({
        type: 'process_gap',
        title: 'Tests automatiques manquants',
        description: 'Aucun test détecté - risque de bugs non détectés',
        priority: 'high',
        category: 'Testing'
      });
    }

    // Règle 3: Pas d'escalations
    if (!systemState.communication.hasEscalations) {
      this.improvements.push({
        type: 'architecture_flaw',
        title: 'Système d\'escalation non utilisé',
        description: 'Les agents ne peuvent pas contacter l\'utilisateur si bloqués',
        priority: 'medium',
        category: 'Communication'
      });
    }

    console.log(`✅ ${this.improvements.length} problèmes détectés (mode fallback)`);
  }

  /**
   * Communiquer au Chef
   */
  async communicateToChef() {
    console.log('\n📤 Communication des améliorations au Chef...\n');

    for (const improvement of this.improvements) {
      await this.hub.addRecommendation({
        type: 'process_improvement',
        title: improvement.title,
        description: improvement.description,
        priority: improvement.priority,
        category: improvement.category,
        improvementType: improvement.type,
        targetAgent: 'Agent Chef'
      });

      console.log(`✉️  [${improvement.priority}] ${improvement.title}`);
    }

    console.log(`\n✅ ${this.improvements.length} recommandations envoyées au Chef`);
  }

  /**
   * Sauvegarder le rapport
   */
  async saveReport(systemState) {
    const reportPath = path.join(CONFIG.projectRoot, 'RAPPORT-AGENT-PRODUCTEUR-AI.md');

    const report = `# 🏭 RAPPORT PRODUCTEUR - AI-Powered (COO)

**Date**: ${new Date().toLocaleString('fr-FR')}
**Mode**: ${this.useAI ? '✅ Intelligence Artificielle (Claude)' : '⚠️  Fallback (règles simples)'}

**Philosophie**: "Si je dois le dire, c'est que le système a raté"

---

## 📊 ÉTAT SYSTÈME

### Agents
- **Total**: ${systemState.agents.count}
- **AI-powered**: ${systemState.agents.aiPowered}
- **Fichiers**: ${systemState.agents.files.join(', ')}

### Workflows
- **Total**: ${systemState.workflows.count}
- **Fichiers**: ${systemState.workflows.files.join(', ')}

### Communication Hub
- Recommendations: ${systemState.communication.hasRecommendations ? '✅' : '❌'}
- Tasks: ${systemState.communication.hasTasks ? '✅' : '❌'}
- Escalations: ${systemState.communication.hasEscalations ? '✅' : '❌'}

### Code
- **Index.html**: ${systemState.code.size || 0} lignes
- **Tests**: ${systemState.code.hasTests ? '✅' : '❌'}

---

## 🔧 AMÉLIORATIONS RECOMMANDÉES

Total: ${this.improvements.length}

${this.improvements.map((imp, i) => `
### ${i + 1}. ${imp.title}

- **Type**: ${imp.type}
- **Catégorie**: ${imp.category}
- **Priorité**: ${imp.priority}

**Description**:
${imp.description}
`).join('\n---\n')}

${this.improvements.length === 0 ? 'Aucune amélioration nécessaire - Le système fonctionne parfaitement! ✅' : ''}

---

## 📈 STATISTIQUES

- **Process gaps**: ${this.improvements.filter(i => i.type === 'process_gap').length}
- **Architecture flaws**: ${this.improvements.filter(i => i.type === 'architecture_flaw').length}
- **Risques**: ${this.improvements.filter(i => i.type === 'risk').length}
- **Next steps**: ${this.improvements.filter(i => i.type === 'next_step').length}

---

## 🎯 RÉSUMÉ

${this.useAI ?
  `✅ Agent Producteur utilise Claude AI pour détecter intelligemment les problèmes du système.

L'analyse couvre:
- Process gaps (boucles manquantes, tests, etc.)
- Failles d'architecture (SPOF, race conditions, etc.)
- Agents manquants critiques
- Risques potentiels
- Opportunités d'amélioration

Les détections sont contextuelles et intelligentes, pas juste des règles fixes.` :
  `⚠️  Agent Producteur fonctionne en mode fallback (règles simples).

Pour activer la détection intelligente:
1. Configurer ANTHROPIC_API_KEY dans GitHub Secrets
2. Voir CONFIGURATION-IA.md

Avec IA: détection contextuelle, analyse profonde
Sans IA: règles fixes, détection basique`}

---

**🏭 Généré par Agent Producteur AI-Powered**
**"Si je dois le dire, c'est que le système a raté"**
`;

    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`\n📄 Rapport sauvegardé: RAPPORT-AGENT-PRODUCTEUR-AI.md`);
  }
}

// ============================================================================
// EXÉCUTION
// ============================================================================

if (require.main === module) {
  const agent = new AgentProducteurAI();

  agent.run()
    .then(() => {
      console.log('\n✅ Agent Producteur AI - Succès');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Agent Producteur AI - Échec:', error);
      process.exit(1);
    });
}

module.exports = { AgentProducteurAI, CONFIG };
