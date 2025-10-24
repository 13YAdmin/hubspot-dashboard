#!/usr/bin/env node

/**
 * AGENT VISIONNAIRE AI - CRO/CTO HYBRID (Elon Musk + Steve Jobs Mode)
 *
 * MISSION: BUSINESS FIRST, TECH SECOND
 *
 * Responsabilités:
 * - Penser REVENU et VALEUR BUSINESS avant tech
 * - Identifier opportunités WHITE SPACE, UPSELL, CROSS-SELL
 * - Proposer features qui génèrent du $$$ mesurable
 * - Analyser impact business chiffré (ARR, conversion, efficiency)
 * - Moonshots qui changent la donne commerciale
 * - Account managers doivent CLOSER PLUS avec ce dashboard
 *
 * Style: Elon Musk (vision 10x) + Steve Jobs (obsession produit)
 *
 * Contexte Business:
 * - Dashboard pour Account Managers HubSpot
 * - But: Identifier white space, upsell, générer revenu
 * - Chaque feature = Impact business CHIFFRÉ
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
      from: 'Agent Visionnaire (CRO/CTO)',
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
// AGENT VISIONNAIRE AI-POWERED (CRO/CTO)
// ============================================================================

class AgentVisionnaireAI {
  constructor() {
    this.ai = new ClaudeAIEngine();
    this.hub = new CommunicationHub();
    this.escalationSystem = new UserEscalationSystem();
    this.recommendations = [];
    this.useAI = CONFIG.useAI;

    if (this.useAI) {
      console.log('🚀 Agent Visionnaire AI - Mode CRO/CTO (Business + Tech)');
    } else {
      console.log('⚠️  Agent Visionnaire AI - Mode fallback');
    }
  }

  /**
   * Point d'entrée principal
   */
  async run() {
    console.log('\n🚀 AGENT VISIONNAIRE (CRO/CTO) - Business Value First');
    console.log('===========================================================\n');

    try {
      // 1. Analyser le contexte BUSINESS
      const context = await this.analyzeBusinessContext();

      // 2. Générer des idées orientées REVENU avec IA
      if (this.useAI) {
        await this.generateBusinessIdeas(context);
      } else {
        await this.generateFallbackIdeas();
      }

      // 3. Communiquer au Chef
      await this.communicateToChef();

      // 4. Sauvegarder le rapport
      await this.saveReport();

      console.log('\n✅ Agent Visionnaire AI - Exécution terminée');
      console.log(`💡 ${this.recommendations.length} recommandations business générées`);

    } catch (error) {
      console.error('❌ Erreur Agent Visionnaire AI:', error.message);

      if (error.message.includes('API') && !this.useAI) {
        await this.escalateNeedForAI();
      }

      throw error;
    }
  }

  /**
   * Analyser le contexte BUSINESS (pas juste tech!)
   */
  async analyzeBusinessContext() {
    console.log('💰 Analyse du contexte BUSINESS...\n');

    // Lire le cahier des charges
    const cahierPath = path.join(CONFIG.projectRoot, 'CAHIER-DES-CHARGES.md');
    let cahier = '';
    if (fs.existsSync(cahierPath)) {
      cahier = fs.readFileSync(cahierPath, 'utf8');
    }

    // Lire le dashboard actuel
    const dashboardPath = path.join(CONFIG.projectRoot, 'public/index.html');
    let dashboardSize = 0;
    if (fs.existsSync(dashboardPath)) {
      dashboardSize = fs.readFileSync(dashboardPath, 'utf8').split('\n').length;
    }

    // Compter agents et recs
    const agentsDir = path.join(CONFIG.projectRoot, '.github/scripts/autonomous-agents');
    const agentFiles = fs.readdirSync(agentsDir).filter(f => f.startsWith('agent-') && f.endsWith('.js'));

    const recommendations = await this.hub.readRecommendations();

    const context = {
      timestamp: new Date().toISOString(),

      // BUSINESS CONTEXT
      business: {
        product: 'HubSpot Dashboard pour Account Managers',
        purpose: 'Générer du revenu via white space, upsell, cross-sell',
        users: 'Account Managers / Customer Success',
        kpis: ['ARR', 'Upsell Rate', 'White Space Identified', 'Time to Close'],
        painPoints: [
          'Account managers perdent du temps à chercher les opportunités',
          'White space invisible = revenus perdus',
          'Pas de priorisation des accounts à fort potentiel',
          'Décisions business basées sur le gut feeling vs data'
        ]
      },

      // TECH CONTEXT
      tech: {
        stack: 'Vanilla JS + D3.js',
        linesOfCode: dashboardSize,
        agents: {
          total: agentFiles.length,
          aiPowered: agentFiles.filter(f => f.includes('-ai.js')).length
        },
        recommendations: recommendations.length
      },

      // CAHIER DES CHARGES (si existe)
      specs: cahier.substring(0, 1000) // Premier 1000 chars
    };

    console.log('📊 Contexte analysé:');
    console.log(`   - Produit: ${context.business.product}`);
    console.log(`   - But: ${context.business.purpose}`);
    console.log(`   - Utilisateurs: ${context.business.users}`);
    console.log(`   - Dashboard: ${context.tech.linesOfCode} lignes`);
    console.log(`   - Agents: ${context.tech.agents.total} (${context.tech.agents.aiPowered} AI)`);
    console.log(`   - Recs existantes: ${context.tech.recommendations}`);

    return context;
  }

  /**
   * Générer des idées orientées BUSINESS avec IA
   */
  async generateBusinessIdeas(context) {
    console.log('\n💰 Génération d\'idées BUSINESS avec Claude AI...\n');

    // 1. OPPORTUNITÉS REVENU
    console.log('💵 Analyse opportunités revenu...');
    await this.analyzeRevenueOpportunities(context);

    // 2. EFFICACITÉ ACCOUNT MANAGERS
    console.log('⚡ Analyse efficacité Account Managers...');
    await this.analyzeEfficiencyGains(context);

    // 3. MOONSHOTS BUSINESS
    console.log('🚀 Génération moonshots business...');
    await this.generateMoonshots(context);
  }

  /**
   * Analyser opportunités de revenu
   */
  async analyzeRevenueOpportunities(context) {
    const systemPrompt = `Tu es un Chief Revenue Officer (CRO) visionnaire.
Tu penses business FIRST, tech SECOND.
Ton job: identifier des opportunités qui génèrent du REVENU MESURABLE.

Style: Elon Musk + Steve Jobs
- Pense 10x, pas 10%
- Obsession: Valeur business tangible
- Chaque idée doit avoir un impact chiffré

Réponds en JSON avec:
{
  "opportunities": [
    {
      "title": "Nom court",
      "description": "Quoi et POURQUOI business",
      "businessImpact": "Impact chiffré (ARR, conversion, efficiency)",
      "userValue": "Ce que l'account manager gagne concrètement",
      "implementation": "Comment techniquement",
      "priority": "critical/high/medium",
      "estimatedROI": "Retour sur investissement estimé"
    }
  ]
}`;

    const userMessage = `Contexte:
Produit: ${context.business.product}
But: ${context.business.purpose}
Utilisateurs: ${context.business.users}
Pain points:
${context.business.painPoints.map(p => `- ${p}`).join('\n')}

Dashboard actuel: ${context.tech.linesOfCode} lignes, ${context.tech.agents.total} agents

MISSION: Propose 5 features qui génèrent du REVENU MESURABLE.
Focus: White space, upsell, cross-sell, efficiency.
Chaque feature DOIT avoir un impact business CHIFFRÉ.`;

    try {
      const response = await this.ai.ask(systemPrompt, userMessage, { temperature: 0.8, maxTokens: 3000 });

      const result = JSON.parse(response);

      if (result.opportunities && Array.isArray(result.opportunities)) {
        for (const opp of result.opportunities) {
          this.recommendations.push({
            type: 'revenue_opportunity',
            title: opp.title,
            description: opp.description,
            businessImpact: opp.businessImpact,
            userValue: opp.userValue,
            implementation: opp.implementation,
            estimatedROI: opp.estimatedROI,
            priority: opp.priority || 'high',
            category: 'Revenue Generation',
            targetAgent: 'Agent Chef de Projet',
            estimatedImpact: 'high'
          });

          console.log(`   ✅ ${opp.title} → ${opp.businessImpact}`);
        }
      }
    } catch (error) {
      console.error('   ❌ Erreur génération opportunités:', error.message);
    }
  }

  /**
   * Analyser gains d'efficacité pour Account Managers
   */
  async analyzeEfficiencyGains(context) {
    const systemPrompt = `Tu es un CRO/CTO obsédé par l'efficacité des équipes sales.
Tu identifies des features qui font gagner du TEMPS = ARGENT.

Pense: Combien de temps économisé? Combien de deals en plus?

Réponds en JSON avec:
{
  "efficiencyGains": [
    {
      "title": "Nom court",
      "description": "Quoi et POURQUOI",
      "timeSaved": "Temps économisé par account manager par jour/semaine",
      "dealsImpact": "Impact sur le nombre de deals closés",
      "implementation": "Comment techniquement",
      "priority": "critical/high/medium"
    }
  ]
}`;

    const userMessage = `Contexte:
Account Managers utilisent le dashboard pour:
- Identifier white space
- Prioriser accounts
- Préparer conversations upsell
- Tracker opportunités

Pain points actuels:
${context.business.painPoints.map(p => `- ${p}`).join('\n')}

MISSION: Propose 3 features qui font GAGNER DU TEMPS = CLOSER PLUS DE DEALS.`;

    try {
      const response = await this.ai.ask(systemPrompt, userMessage, { temperature: 0.8, maxTokens: 2000 });

      const result = JSON.parse(response);

      if (result.efficiencyGains && Array.isArray(result.efficiencyGains)) {
        for (const gain of result.efficiencyGains) {
          this.recommendations.push({
            type: 'efficiency_gain',
            title: gain.title,
            description: gain.description,
            businessImpact: `${gain.timeSaved} économisé → ${gain.dealsImpact}`,
            implementation: gain.implementation,
            priority: gain.priority || 'high',
            category: 'Sales Efficiency',
            targetAgent: 'Agent Chef de Projet',
            estimatedImpact: 'high'
          });

          console.log(`   ✅ ${gain.title} → ${gain.timeSaved}`);
        }
      }
    } catch (error) {
      console.error('   ❌ Erreur génération efficiency gains:', error.message);
    }
  }

  /**
   * Générer des moonshots business
   */
  async generateMoonshots(context) {
    const systemPrompt = `Tu es Elon Musk + Steve Jobs combined.
Tu penses DISRUPTIF. Tu changes la donne.

Pas de "améliorer un graphique" - pense "révolutionner comment les account managers travaillent".

Réponds en JSON avec:
{
  "moonshots": [
    {
      "title": "Vision audacieuse",
      "description": "Le futur que tu vois",
      "businessImpact": "Impact business massif (chiffré si possible)",
      "whyNow": "Pourquoi c'est le bon moment",
      "firstStep": "Première étape concrète",
      "priority": "high/medium"
    }
  ]
}`;

    const userMessage = `Contexte: Dashboard HubSpot pour Account Managers

Tendances actuelles:
- AI/ML pour prédictions
- Automation
- Real-time data
- Conversational interfaces

MISSION: Propose 2 MOONSHOTS qui changent radicalement comment on génère du revenu avec HubSpot.
Pense BIG. Pense 10x. Pense disruptif.`;

    try {
      const response = await this.ai.ask(systemPrompt, userMessage, { temperature: 0.9, maxTokens: 2000 });

      const result = JSON.parse(response);

      if (result.moonshots && Array.isArray(result.moonshots)) {
        for (const moonshot of result.moonshots) {
          this.recommendations.push({
            type: 'moonshot',
            title: moonshot.title,
            description: moonshot.description,
            businessImpact: moonshot.businessImpact,
            whyNow: moonshot.whyNow,
            implementation: moonshot.firstStep,
            priority: moonshot.priority || 'medium',
            category: 'Innovation',
            targetAgent: 'Agent Chef de Projet',
            estimatedImpact: 'very_high'
          });

          console.log(`   🚀 ${moonshot.title}`);
        }
      }
    } catch (error) {
      console.error('   ❌ Erreur génération moonshots:', error.message);
    }
  }

  /**
   * Fallback sans IA
   */
  async generateFallbackIdeas() {
    console.log('⚠️  Mode fallback - Idées business basiques\n');

    this.recommendations.push({
      type: 'revenue_opportunity',
      title: 'Alertes White Space Automatiques',
      description: 'Notifications push quand white space détecté sur un account',
      businessImpact: '+20% opportunités identifiées → +$150K ARR estimé',
      priority: 'high',
      category: 'Revenue Generation'
    });

    this.recommendations.push({
      type: 'efficiency_gain',
      title: 'Priorisation AI des Accounts',
      description: 'Scoring AI des accounts selon potentiel upsell',
      businessImpact: '2h/jour économisées par AM → +15% deals closés',
      priority: 'high',
      category: 'Sales Efficiency'
    });
  }

  /**
   * Communiquer les recommandations au Chef
   */
  async communicateToChef() {
    console.log('\n📤 Communication des recommandations au Chef...\n');

    for (const rec of this.recommendations) {
      await this.hub.addRecommendation(rec);
      console.log(`✉️  [${rec.priority}] ${rec.title}`);
      if (rec.businessImpact) {
        console.log(`   💰 Impact: ${rec.businessImpact}`);
      }
    }

    console.log(`\n✅ ${this.recommendations.length} recommandations envoyées au Chef`);
  }

  /**
   * Escalader besoin API
   */
  async escalateNeedForAI() {
    console.log('\n📞 Escalade: Besoin Claude AI pour vraies innovations\n');

    await escalateAPIKey(
      'Agent Visionnaire',
      'Claude (Anthropic)',
      'Générer de vraies idées business innovantes (pas liste hardcodée)',
      'Selon usage (~$10-50/mois estimé)',
      [
        { name: 'Liste hardcodée', reason: 'Pas de vraie intelligence, idées répétitives' },
        { name: 'Templates basiques', reason: 'Pas d\'analyse contextuelle' }
      ]
    );
  }

  /**
   * Sauvegarder le rapport
   */
  async saveReport() {
    const reportPath = path.join(CONFIG.projectRoot, 'RAPPORT-AGENT-VISIONNAIRE-AI.md');

    const report = `# 🚀 RAPPORT - Agent Visionnaire (CRO/CTO)

**Date**: ${new Date().toLocaleString('fr-FR')}
**Mode**: ${this.useAI ? '✅ Intelligence Artificielle (Claude) - Business Focus' : '⚠️  Fallback'}

---

## 💰 MISSION

Générer de la VALEUR BUSINESS tangible via le dashboard.
Chaque feature = Impact revenu CHIFFRÉ.

**Contexte**: Dashboard HubSpot pour Account Managers
**But**: White space, upsell, cross-sell → Générer du CA

---

## 💡 RECOMMANDATIONS BUSINESS

Total: ${this.recommendations.length}

${this.recommendations.map((r, i) => `
### ${i + 1}. ${r.title}

**Type**: ${r.type || 'N/A'}
**Priorité**: ${r.priority}
**Catégorie**: ${r.category || 'N/A'}

**Description**: ${r.description}

${r.businessImpact ? `**💰 Impact Business**: ${r.businessImpact}` : ''}

${r.userValue ? `**👤 Valeur Account Manager**: ${r.userValue}` : ''}

${r.estimatedROI ? `**📈 ROI Estimé**: ${r.estimatedROI}` : ''}

${r.implementation ? `**🔧 Implémentation**: ${r.implementation}` : ''}

${r.whyNow ? `**⏰ Pourquoi Maintenant**: ${r.whyNow}` : ''}
`).join('\n---\n')}

---

## 🎯 RÉSUMÉ

${this.useAI ?
  `✅ Agent Visionnaire fonctionne avec IA - Focus BUSINESS FIRST` :
  `⚠️  Mode fallback - Configurer ANTHROPIC_API_KEY pour vraies innovations`}

${this.recommendations.length > 0 ?
  `${this.recommendations.length} recommandations business générées` :
  'Aucune recommandation générée'}

---

**🤖 Généré par Agent Visionnaire (CRO/CTO)**
**"Business Value First, Tech Second"**
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
      console.log('\n✅ Agent Visionnaire (CRO/CTO) - Succès');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n❌ Agent Visionnaire (CRO/CTO) - Échec:', error);
      process.exit(1);
    });
}

module.exports = { AgentVisionnaireAI, CONFIG };
