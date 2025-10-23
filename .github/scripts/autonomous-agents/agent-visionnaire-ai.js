#!/usr/bin/env node

/**
 * AGENT VISIONNAIRE - VERSION AI-POWERED (CTO - Elon Musk Mode)
 *
 * Utilise Claude AI pour générer de VRAIES idées innovantes
 *
 * Responsabilités:
 * - Proposer des innovations technologiques RÉELLES (pas liste hardcodée)
 * - Identifier des opportunités business avec analyse contextuelle
 * - Améliorer la qualité des données intelligemment
 * - Générer des moonshots disruptifs
 * - Penser 10x, pas 10%
 */

const fs = require('fs');
const path = require('path');
const { ClaudeAIEngine } = require('./claude-ai-engine');
const { UserEscalationSystem, escalateAPIKey } = require('./user-escalation-system');

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
      from: 'Agent Visionnaire (AI)',
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
}

// ============================================================================
// AGENT VISIONNAIRE AI-POWERED
// ============================================================================

class AgentVisionnaireAI {
  constructor() {
    this.ai = new ClaudeAIEngine();
    this.hub = new CommunicationHub();
    this.escalationSystem = new UserEscalationSystem();
    this.recommendations = [];
    this.useAI = CONFIG.useAI;

    if (this.useAI) {
      console.log('🚀 Agent Visionnaire AI - Mode INTELLIGENCE ARTIFICIELLE activé');
    } else {
      console.log('⚠️  Agent Visionnaire AI - Mode fallback (configurer ANTHROPIC_API_KEY)');
    }
  }

  /**
   * Point d'entrée principal
   */
  async run() {
    console.log('\n🚀 AGENT VISIONNAIRE (AI-POWERED) - CTO / Elon Musk Mode');
    console.log('============================================================\n');

    try {
      // 1. Analyser le contexte actuel du projet
      const context = await this.analyzeProjectContext();

      // 2. Générer des idées avec IA
      if (this.useAI) {
        await this.generateAIIdeas(context);
      } else {
        await this.generateFallbackIdeas();
      }

      // 3. Communiquer au Chef
      await this.communicateToChef();

      // 4. Sauvegarder le rapport
      await this.saveReport();

      console.log('\n✅ Agent Visionnaire AI - Exécution terminée');
      console.log(`💡 ${this.recommendations.length} recommandations générées`);

    } catch (error) {
      console.error('❌ Erreur Agent Visionnaire AI:', error.message);

      if (error.message.includes('API') && !this.useAI) {
        await this.escalateNeedForAI();
      }

      throw error;
    }
  }

  /**
   * Analyser le contexte du projet
   */
  async analyzeProjectContext() {
    console.log('🔍 Analyse du contexte projet...\n');

    const context = {
      timestamp: new Date().toISOString(),
      project: 'HubSpot Dashboard',
      stack: {
        frontend: 'Vanilla JS',
        viz: 'D3.js',
        hosting: 'GitHub Pages'
      },
      agents: {
        active: 8,
        total: 13
      },
      goals: [
        'Amélioration continue qualité',
        'Scaling entreprise virtuelle',
        'Innovation disruptive',
        'ROI maximum'
      ]
    };

    // Lire les recommandations existantes pour éviter doublons
    const existing = await this.hub.readRecommendations();
    context.existingRecommendations = existing.length;

    console.log('📊 Contexte analysé:');
    console.log(`   - Projet: ${context.project}`);
    console.log(`   - Stack: ${context.stack.frontend}, ${context.stack.viz}`);
    console.log(`   - Agents: ${context.agents.active}/${context.agents.total}`);
    console.log(`   - Recommandations existantes: ${context.existingRecommendations}`);

    return context;
  }

  /**
   * Générer des idées avec Claude AI
   */
  async generateAIIdeas(context) {
    console.log('\n🧠 Génération d\'idées avec Claude AI...\n');

    // 1. Innovations technologiques
    console.log('💡 Génération innovations tech...');
    const techIdeas = await this.ai.brainstormIdeas(
      `Améliorer un dashboard HubSpot actuellement en ${context.stack.frontend} et ${context.stack.viz}. Le projet doit scaler et être maintenu par des agents autonomes.`,
      [
        'Doit être faisable par des agents autonomes',
        'Budget raisonnable (préférer solutions gratuites/open-source)',
        'Impact sur qualité, performance ou innovation',
        'Pas de solutions nécessitant intervention manuelle constante'
      ],
      'Sales teams et agents autonomes'
    );

    if (!techIdeas.error) {
      for (const idea of techIdeas.ideas || []) {
        this.recommendations.push({
          type: 'tech_innovation',
          title: idea.title,
          description: idea.description,
          priority: this.mapFeasibilityToPriority(idea.feasibility),
          estimatedImpact: idea.impact,
          feasibility: idea.feasibility,
          category: 'Tech Innovation'
        });
      }
    }

    // 2. Opportunités business
    console.log('💼 Analyse opportunités business...');
    const businessIdeas = await this.ai.brainstormIdeas(
      `Identifier des opportunités business pour un dashboard HubSpot utilisé par des sales teams. Penser aux features qui augmentent la valeur, le ROI, ou créent de nouveaux use cases.`,
      [
        'Doit avoir impact business mesurable',
        'Faisable avec stack actuel ou avec migration',
        'Objectif: augmenter usage, satisfaction, ou revenus'
      ],
      'Sales managers, Account executives, Revenue operations'
    );

    if (!businessIdeas.error) {
      for (const idea of businessIdeas.ideas || []) {
        this.recommendations.push({
          type: 'business_opportunity',
          title: idea.title,
          description: idea.description,
          priority: this.mapImpactToPriority(idea.impact),
          estimatedImpact: idea.impact,
          feasibility: idea.feasibility,
          category: 'Business Opportunity'
        });
      }
    }

    // 3. Moonshots (idées 10x)
    console.log('🌙 Génération moonshots...');
    const moonshots = await this.ai.brainstormIdeas(
      `Proposer des idées DISRUPTIVES et 10x pour transformer un dashboard HubSpot en quelque chose de révolutionnaire. Penser comme Elon Musk: pas d'amélioration incrémentale, mais changement de paradigme complet.`,
      [
        'Doit être révolutionnaire, pas juste une amélioration',
        'Peut nécessiter changement tech radical',
        'Objectif: créer quelque chose que personne d\'autre n\'a'
      ],
      'Early adopters, innovators, visionnaires'
    );

    if (!moonshots.error) {
      for (const idea of moonshots.ideas || []) {
        this.recommendations.push({
          type: 'moonshot',
          title: idea.title,
          description: idea.description,
          priority: 'medium', // Moonshots = pas urgent mais important
          estimatedImpact: idea.impact,
          feasibility: idea.feasibility,
          category: 'Moonshot',
          tags: ['disruptive', '10x', 'long-term']
        });
      }
    }

    console.log(`\n✅ ${this.recommendations.length} idées générées avec IA`);
  }

  /**
   * Générer des idées de secours (sans IA)
   */
  async generateFallbackIdeas() {
    console.log('\n⚠️  Mode fallback - Idées basiques\n');

    // Quelques idées hardcodées basiques
    this.recommendations.push({
      type: 'tech_innovation',
      title: 'Migrer vers framework moderne',
      description: 'Considérer React, Vue ou Svelte pour meilleure maintenabilité',
      priority: 'medium',
      estimatedImpact: 'high',
      category: 'Tech Innovation'
    });

    this.recommendations.push({
      type: 'business_opportunity',
      title: 'Analytics avancées',
      description: 'Ajouter prédictions et insights automatiques',
      priority: 'high',
      estimatedImpact: 'high',
      category: 'Business Opportunity'
    });

    console.log('⚠️  2 idées basiques générées (configurer IA pour vraies idées)');
  }

  /**
   * Mapper feasibility to priority
   */
  mapFeasibilityToPriority(feasibility) {
    if (!feasibility) return 'medium';
    const f = feasibility.toLowerCase();
    if (f.includes('high') || f.includes('easy')) return 'high';
    if (f.includes('low') || f.includes('hard')) return 'low';
    return 'medium';
  }

  /**
   * Mapper impact to priority
   */
  mapImpactToPriority(impact) {
    if (!impact) return 'medium';
    const i = impact.toLowerCase();
    if (i.includes('high') || i.includes('major')) return 'high';
    if (i.includes('critical') || i.includes('game')) return 'critical';
    if (i.includes('low') || i.includes('minor')) return 'low';
    return 'medium';
  }

  /**
   * Communiquer les recommandations au Chef
   */
  async communicateToChef() {
    console.log('\n📤 Communication des recommandations au Chef...\n');

    for (const rec of this.recommendations) {
      await this.hub.addRecommendation(rec);
      console.log(`✉️  [${rec.priority}] ${rec.title}`);
    }

    console.log(`\n✅ ${this.recommendations.length} recommandations envoyées au Chef`);
  }

  /**
   * Escalader le besoin d'IA
   */
  async escalateNeedForAI() {
    console.log('\n📞 Escalade: Besoin Claude AI pour vraies idées innovantes\n');

    await escalateAPIKey(
      'Agent Visionnaire',
      'Claude (Anthropic)',
      'Générer de vraies idées innovantes et disruptives (pas juste liste hardcodée)',
      'Selon usage (~$10-50/mois)',
      [
        { name: 'Liste hardcodée', reason: 'Idées toujours les mêmes, pas d\'innovation réelle' },
        { name: 'Scripts pattern matching', reason: 'Pas de créativité, pas de contexte' }
      ]
    );
  }

  /**
   * Sauvegarder le rapport
   */
  async saveReport() {
    const reportPath = path.join(CONFIG.projectRoot, 'RAPPORT-AGENT-VISIONNAIRE-AI.md');

    const report = `# 🚀 RAPPORT - Agent Visionnaire AI-Powered (CTO)

**Date**: ${new Date().toLocaleString('fr-FR')}
**Mode**: ${this.useAI ? '✅ Intelligence Artificielle (Claude)' : '⚠️  Fallback (idées basiques)'}

---

## 💡 RECOMMANDATIONS GÉNÉRÉES

Total: ${this.recommendations.length}

${this.recommendations.map((r, i) => `
### ${i + 1}. ${r.title}

- **Type**: ${r.type}
- **Catégorie**: ${r.category}
- **Priorité**: ${r.priority}
- **Impact estimé**: ${r.estimatedImpact || 'N/A'}
- **Faisabilité**: ${r.feasibility || 'N/A'}

**Description**:
${r.description}

${r.tags ? `**Tags**: ${r.tags.join(', ')}` : ''}
`).join('\n---\n')}

---

## 📊 STATISTIQUES

- **Innovations tech**: ${this.recommendations.filter(r => r.type === 'tech_innovation').length}
- **Opportunités business**: ${this.recommendations.filter(r => r.type === 'business_opportunity').length}
- **Moonshots**: ${this.recommendations.filter(r => r.type === 'moonshot').length}

---

## 🎯 RÉSUMÉ

${this.useAI ?
  `✅ Agent Visionnaire utilise Claude AI pour générer de vraies idées innovantes et contextuelles.

Les recommandations sont générées en analysant:
- Le contexte complet du projet
- Les contraintes réelles
- Les opportunités de marché
- L'impact business potentiel

Ce ne sont PAS des idées hardcodées, mais de vraies propositions intelligentes.` :
  `⚠️  Agent Visionnaire fonctionne en mode fallback (idées basiques hardcodées).

Pour activer les vraies idées innovantes avec IA:
1. Configurer ANTHROPIC_API_KEY dans GitHub Secrets
2. Voir CONFIGURATION-IA.md pour détails

Avec IA: vraies idées disruptives, contextuelles, innovantes
Sans IA: liste basique prédéfinie`}

---

**🚀 Généré par Agent Visionnaire AI-Powered**
**"Think 10x, not 10%"**
`;

    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`\n📄 Rapport sauvegardé: RAPPORT-AGENT-VISIONNAIRE-AI.md`);
  }
}

// ============================================================================
// EXÉCUTION
// ============================================================================

if (require.main === module) {
  const agent = new AgentVisionnaireAI();

  agent.run()
    .then(() => {
      console.log('\n✅ Agent Visionnaire AI - Succès');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Agent Visionnaire AI - Échec:', error);
      process.exit(1);
    });
}

module.exports = { AgentVisionnaireAI, CONFIG };
