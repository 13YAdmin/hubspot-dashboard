#!/usr/bin/env node

/**
 * CLAUDE AI ENGINE - Intelligence Artificielle pour les Agents
 *
 * Ce module permet aux agents d'utiliser Claude (Anthropic API) pour:
 * - Prendre des décisions intelligentes
 * - Analyser du code
 * - Résoudre des problèmes complexes
 * - Générer des solutions créatives
 * - Comprendre le contexte
 *
 * Utilise les tokens Claude de l'utilisateur via ANTHROPIC_API_KEY
 */

const https = require('https');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  apiKey: process.env.ANTHROPIC_API_KEY || '',
  model: 'claude-3-5-sonnet-20241022', // Latest Sonnet model
  maxTokens: 4096,
  temperature: 0.7,
  apiUrl: 'api.anthropic.com',
  apiVersion: '2023-06-01'
};

// ============================================================================
// CLAUDE AI ENGINE
// ============================================================================

class ClaudeAIEngine {
  constructor() {
    this.apiKey = CONFIG.apiKey;
    this.model = CONFIG.model;

    if (!this.apiKey) {
      console.warn('⚠️  ANTHROPIC_API_KEY non configuré - Mode fallback activé');
      this.fallbackMode = true;
    } else {
      console.log('✅ Claude AI Engine initialisé');
      this.fallbackMode = false;
    }
  }

  /**
   * Faire une requête à Claude pour une décision ou analyse
   *
   * @param {string} systemPrompt - Le rôle/contexte de l'agent
   * @param {string} userMessage - La question/demande
   * @param {object} options - Options supplémentaires
   * @returns {Promise<string>} - Réponse de Claude
   */
  async ask(systemPrompt, userMessage, options = {}) {
    if (this.fallbackMode) {
      return this.fallbackResponse(systemPrompt, userMessage);
    }

    const temperature = options.temperature ?? CONFIG.temperature;
    const maxTokens = options.maxTokens ?? CONFIG.maxTokens;

    const requestBody = {
      model: this.model,
      max_tokens: maxTokens,
      temperature: temperature,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage
        }
      ]
    };

    try {
      const response = await this.makeAPIRequest(requestBody);
      return response.content[0].text;
    } catch (error) {
      console.error('❌ Erreur Claude API:', error.message);
      return this.fallbackResponse(systemPrompt, userMessage);
    }
  }

  /**
   * Faire une requête HTTP à l'API Claude
   */
  async makeAPIRequest(body) {
    return new Promise((resolve, reject) => {
      const bodyString = JSON.stringify(body);

      const options = {
        hostname: CONFIG.apiUrl,
        port: 443,
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': CONFIG.apiVersion,
          'Content-Length': Buffer.byteLength(bodyString)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(data));
            } catch (e) {
              reject(new Error('Invalid JSON response'));
            }
          } else {
            reject(new Error(`API Error: ${res.statusCode} - ${data}`));
          }
        });
      });

      req.on('error', (error) => {
        reject(error);
      });

      req.write(bodyString);
      req.end();
    });
  }

  /**
   * Réponse de secours si Claude API n'est pas disponible
   * Utilise une logique simple basée sur des règles
   */
  fallbackResponse(systemPrompt, userMessage) {
    console.warn('⚠️  Mode fallback - Réponse sans IA');

    // Analyse basique sans IA
    const response = {
      decision: 'ANALYZE_MANUALLY',
      reasoning: 'Claude API non disponible - analyse manuelle recommandée',
      confidence: 'low',
      recommendation: 'Configurer ANTHROPIC_API_KEY pour activer l\'IA réelle'
    };

    return JSON.stringify(response, null, 2);
  }

  /**
   * Demander à Claude d'analyser du code
   */
  async analyzeCode(code, context = '') {
    const systemPrompt = `Tu es un expert en analyse de code. Tu identifies:
- Les bugs potentiels
- Les problèmes de performance
- Les mauvaises pratiques
- Les opportunités d'amélioration
Tu réponds en JSON avec: { bugs: [], performance: [], improvements: [] }`;

    const userMessage = `Analyse ce code:\n\n${context ? `Contexte: ${context}\n\n` : ''}${code}`;

    const response = await this.ask(systemPrompt, userMessage, { temperature: 0.3 });

    try {
      return JSON.parse(response);
    } catch {
      return { error: 'Failed to parse response', raw: response };
    }
  }

  /**
   * Demander à Claude de prendre une décision
   */
  async makeDecision(situation, options, constraints = []) {
    const systemPrompt = `Tu es un chef de projet expert. Tu prends des décisions basées sur:
- L'impact business
- La faisabilité technique
- Les risques
- Le ROI
Tu réponds en JSON avec: { decision: string, reasoning: string, risks: [], nextSteps: [] }`;

    const userMessage = `Situation: ${situation}

Options disponibles:
${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}

${constraints.length > 0 ? `Contraintes:\n${constraints.map(c => `- ${c}`).join('\n')}` : ''}

Quelle est la meilleure décision?`;

    const response = await this.ask(systemPrompt, userMessage, { temperature: 0.5 });

    try {
      return JSON.parse(response);
    } catch {
      return { error: 'Failed to parse response', raw: response };
    }
  }

  /**
   * Demander à Claude de résoudre un bug
   */
  async debugIssue(errorMessage, codeContext, attempts = []) {
    const systemPrompt = `Tu es un expert debugger. Tu analyses les erreurs et proposes des solutions concrètes.
Tu réponds en JSON avec: { root_cause: string, solution: string, code_fix: string, explanation: string }`;

    const userMessage = `Erreur: ${errorMessage}

Contexte du code:
${codeContext}

${attempts.length > 0 ? `Tentatives précédentes:\n${attempts.map(a => `- ${a}`).join('\n')}` : ''}

Comment résoudre ce bug?`;

    const response = await this.ask(systemPrompt, userMessage, { temperature: 0.3 });

    try {
      return JSON.parse(response);
    } catch {
      return { error: 'Failed to parse response', raw: response };
    }
  }

  /**
   * Demander à Claude de générer des idées innovantes
   */
  async brainstormIdeas(topic, constraints = [], targetAudience = '') {
    const systemPrompt = `Tu es un visionnaire technologique style Elon Musk. Tu proposes des idées innovantes, disruptives, qui changent la donne.
Tu penses 10x, pas 10%. Tu réponds en JSON avec: { ideas: [{ title: string, description: string, impact: string, feasibility: string }] }`;

    const userMessage = `Sujet: ${topic}

${targetAudience ? `Audience cible: ${targetAudience}` : ''}

${constraints.length > 0 ? `Contraintes:\n${constraints.map(c => `- ${c}`).join('\n')}` : ''}

Propose 5 idées innovantes et disruptives.`;

    const response = await this.ask(systemPrompt, userMessage, { temperature: 0.9 });

    try {
      return JSON.parse(response);
    } catch {
      return { error: 'Failed to parse response', raw: response };
    }
  }

  /**
   * Demander à Claude d'évaluer la qualité du code
   */
  async evaluateCodeQuality(code, metrics = ['readability', 'performance', 'maintainability']) {
    const systemPrompt = `Tu es un expert en qualité de code. Tu évalues le code selon plusieurs critères et donnes un score sur 100.
Tu réponds en JSON avec: { overall_score: number, scores: { metric: number }, issues: [], recommendations: [] }`;

    const userMessage = `Évalue la qualité de ce code selon: ${metrics.join(', ')}

Code:
${code}`;

    const response = await this.ask(systemPrompt, userMessage, { temperature: 0.3 });

    try {
      return JSON.parse(response);
    } catch {
      return { error: 'Failed to parse response', raw: response };
    }
  }

  /**
   * Demander à Claude de prioriser des tâches
   */
  async prioritizeTasks(tasks, criteria = ['impact', 'effort', 'urgency']) {
    const systemPrompt = `Tu es un chef de projet expert en priorisation. Tu ordonnes les tâches selon leur valeur business.
Tu réponds en JSON avec: { prioritized_tasks: [{ task: string, priority: number, reasoning: string }] }`;

    const userMessage = `Priorise ces tâches selon: ${criteria.join(', ')}

Tâches:
${tasks.map((task, i) => `${i + 1}. ${typeof task === 'string' ? task : task.description || task.title}`).join('\n')}`;

    const response = await this.ask(systemPrompt, userMessage, { temperature: 0.4 });

    try {
      return JSON.parse(response);
    } catch {
      return { error: 'Failed to parse response', raw: response };
    }
  }

  /**
   * Demander à Claude d'analyser des métriques
   */
  async analyzeMetrics(metrics, context = '') {
    const systemPrompt = `Tu es un expert en analyse de données. Tu identifies les tendances, anomalies, et insights importants.
Tu réponds en JSON avec: { insights: [], anomalies: [], recommendations: [], trend: string }`;

    const userMessage = `Analyse ces métriques:

${JSON.stringify(metrics, null, 2)}

${context ? `Contexte: ${context}` : ''}`;

    const response = await this.ask(systemPrompt, userMessage, { temperature: 0.4 });

    try {
      return JSON.parse(response);
    } catch {
      return { error: 'Failed to parse response', raw: response };
    }
  }
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = { ClaudeAIEngine, CONFIG };

// ============================================================================
// TEST (si exécuté directement)
// ============================================================================

if (require.main === module) {
  const engine = new ClaudeAIEngine();

  console.log('\n🧪 Test du Claude AI Engine\n');

  // Test simple
  engine.makeDecision(
    'Le dashboard a 2 bugs critiques et 5 améliorations possibles',
    [
      'Corriger les bugs d\'abord',
      'Implémenter les améliorations d\'abord',
      'Faire les deux en parallèle'
    ],
    ['Budget limité', 'Deadline dans 1 semaine']
  ).then(decision => {
    console.log('✅ Décision de Claude:\n');
    console.log(JSON.stringify(decision, null, 2));
  }).catch(error => {
    console.error('❌ Erreur:', error.message);
  });
}
