#!/usr/bin/env node

/**
 * USER ESCALATION SYSTEM - Communication Agent → Utilisateur
 *
 * Permet aux agents de contacter l'utilisateur pour:
 * - Demander des permissions
 * - Demander des clés API
 * - Prendre des décisions critiques business
 * - Signaler des blocages non-contournables
 *
 * Utilisé UNIQUEMENT en dernier recours après avoir tout essayé
 */

const fs = require('fs');
const path = require('path');

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  escalationsFile: path.resolve(__dirname, '../../../.github/agents-communication/user-escalations.json'),
  userEmail: process.env.USER_EMAIL || '', // À configurer
  severityLevels: {
    CRITICAL: 1,  // Blocage complet, projet arrêté
    HIGH: 2,      // Blocage partiel, impact important
    MEDIUM: 3,    // Peut attendre, mais important
    LOW: 4        // Informatif, pas urgent
  },
  escalationTypes: {
    API_KEY: 'api_key',           // Besoin clé API tierce
    PERMISSION: 'permission',      // Besoin permission GitHub/autre
    DECISION: 'decision',          // Décision business critique
    BUDGET: 'budget',              // Dépense importante
    TECHNICAL: 'technical'         // Limite technique non-contournable
  }
};

// ============================================================================
// USER ESCALATION SYSTEM
// ============================================================================

class UserEscalationSystem {
  constructor() {
    this.escalationsFile = CONFIG.escalationsFile;
    this.ensureEscalationsFile();
  }

  /**
   * S'assurer que le fichier d'escalations existe
   */
  ensureEscalationsFile() {
    const dir = path.dirname(this.escalationsFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.escalationsFile)) {
      const initial = {
        escalations: [],
        stats: {
          total: 0,
          resolved: 0,
          pending: 0,
          blocked: 0
        },
        lastUpdate: new Date().toISOString()
      };
      fs.writeFileSync(this.escalationsFile, JSON.stringify(initial, null, 2));
    }
  }

  /**
   * Créer une nouvelle escalation vers l'utilisateur
   *
   * @param {object} escalation - Détails de l'escalation
   * @returns {string} - ID de l'escalation créée
   */
  async createEscalation(escalation) {
    const data = this.readEscalations();

    const id = `ESC-${Date.now()}`;
    const newEscalation = {
      id,
      agent: escalation.agent || 'Unknown Agent',
      timestamp: new Date().toISOString(),
      severity: escalation.severity || 'MEDIUM',
      type: escalation.type || 'TECHNICAL',
      title: escalation.title,
      description: escalation.description,
      attempted_solutions: escalation.attemptedSolutions || [],
      blocking: escalation.blocking !== undefined ? escalation.blocking : false,
      proposed_action: escalation.proposedAction || '',
      required_from_user: escalation.requiredFromUser || '',
      status: 'pending',
      created_at: new Date().toISOString(),
      resolved_at: null,
      resolution: null
    };

    data.escalations.push(newEscalation);
    data.stats.total++;
    data.stats.pending++;
    data.lastUpdate = new Date().toISOString();

    this.writeEscalations(data);

    // Log pour GitHub Actions
    console.log('\n🔴 ESCALATION UTILISATEUR CRÉÉE');
    console.log('================================\n');
    console.log(`ID: ${id}`);
    console.log(`Agent: ${newEscalation.agent}`);
    console.log(`Sévérité: ${newEscalation.severity}`);
    console.log(`Type: ${newEscalation.type}`);
    console.log(`Titre: ${newEscalation.title}`);
    console.log(`\nDescription:`);
    console.log(newEscalation.description);
    console.log(`\nSolutions tentées:`);
    newEscalation.attempted_solutions.forEach(s => console.log(`  - ${s}`));
    console.log(`\nAction proposée:`);
    console.log(newEscalation.proposed_action);
    console.log(`\nAction requise de l'utilisateur:`);
    console.log(newEscalation.required_from_user);
    console.log(`\n${newEscalation.blocking ? '🚨 BLOCAGE CRITIQUE' : 'ℹ️  Peut continuer en mode dégradé'}`);
    console.log('\n================================');

    // Créer une GitHub Issue automatiquement si possible
    if (process.env.GITHUB_TOKEN) {
      await this.createGitHubIssue(newEscalation);
    }

    return id;
  }

  /**
   * Créer une GitHub Issue pour l'escalation
   */
  async createGitHubIssue(escalation) {
    // TODO: Implémenter création GitHub Issue via API
    // Nécessite: gh CLI ou API GitHub
    console.log(`\n💡 Créer manuellement une GitHub Issue avec:`);
    console.log(`   Label: 🔴 ESCALATION-USER`);
    console.log(`   Titre: [${escalation.severity}] ${escalation.title}`);
  }

  /**
   * Lire toutes les escalations
   */
  readEscalations() {
    const content = fs.readFileSync(this.escalationsFile, 'utf8');
    return JSON.parse(content);
  }

  /**
   * Écrire les escalations
   */
  writeEscalations(data) {
    fs.writeFileSync(this.escalationsFile, JSON.stringify(data, null, 2));
  }

  /**
   * Résoudre une escalation
   */
  async resolveEscalation(escalationId, resolution) {
    const data = this.readEscalations();
    const escalation = data.escalations.find(e => e.id === escalationId);

    if (!escalation) {
      throw new Error(`Escalation ${escalationId} not found`);
    }

    escalation.status = 'resolved';
    escalation.resolved_at = new Date().toISOString();
    escalation.resolution = resolution;

    data.stats.pending--;
    data.stats.resolved++;
    data.lastUpdate = new Date().toISOString();

    this.writeEscalations(data);

    console.log(`✅ Escalation ${escalationId} résolue`);
  }

  /**
   * Marquer une escalation comme bloquée
   */
  async blockEscalation(escalationId, reason) {
    const data = this.readEscalations();
    const escalation = data.escalations.find(e => e.id === escalationId);

    if (!escalation) {
      throw new Error(`Escalation ${escalationId} not found`);
    }

    escalation.status = 'blocked';
    escalation.block_reason = reason;

    data.stats.pending--;
    data.stats.blocked++;
    data.lastUpdate = new Date().toISOString();

    this.writeEscalations(data);

    console.log(`⚠️  Escalation ${escalationId} bloquée: ${reason}`);
  }

  /**
   * Obtenir toutes les escalations pending
   */
  getPendingEscalations() {
    const data = this.readEscalations();
    return data.escalations.filter(e => e.status === 'pending');
  }

  /**
   * Obtenir les statistiques d'escalations
   */
  getStats() {
    const data = this.readEscalations();
    return data.stats;
  }

  /**
   * Vérifier si une escalation similaire existe déjà
   */
  hasSimilarEscalation(title, type) {
    const data = this.readEscalations();
    return data.escalations.some(e =>
      e.status === 'pending' &&
      e.type === type &&
      e.title.toLowerCase().includes(title.toLowerCase())
    );
  }
}

// ============================================================================
// FONCTIONS HELPERS
// ============================================================================

/**
 * Escalader rapidement un besoin de clé API
 */
async function escalateAPIKey(agent, apiName, purpose, estimatedCost = 'N/A', alternatives = []) {
  const system = new UserEscalationSystem();

  // Vérifier si escalation similaire existe
  if (system.hasSimilarEscalation(apiName, CONFIG.escalationTypes.API_KEY)) {
    console.log(`ℹ️  Escalation similaire pour ${apiName} existe déjà`);
    return null;
  }

  return await system.createEscalation({
    agent,
    severity: 'HIGH',
    type: CONFIG.escalationTypes.API_KEY,
    title: `Besoin ${apiName} API Key`,
    description: `L'agent ${agent} a besoin d'une clé API pour ${apiName}.\n\nObjectif: ${purpose}\n\nCoût estimé: ${estimatedCost}/mois`,
    attemptedSolutions: alternatives.length > 0 ?
      alternatives.map(alt => `Testé ${alt.name}: ${alt.reason}`) :
      ['Aucune alternative gratuite trouvée'],
    blocking: true,
    proposedAction: `Obtenir une clé API ${apiName} et la configurer dans GitHub Secrets`,
    requiredFromUser: `1. Créer un compte ${apiName}\n2. Générer une API key\n3. Ajouter ${apiName.toUpperCase()}_API_KEY dans GitHub Secrets`
  });
}

/**
 * Escalader rapidement un besoin de permission
 */
async function escalatePermission(agent, permission, reason, impact) {
  const system = new UserEscalationSystem();

  return await system.createEscalation({
    agent,
    severity: 'CRITICAL',
    type: CONFIG.escalationTypes.PERMISSION,
    title: `Besoin permission: ${permission}`,
    description: `L'agent ${agent} a besoin de la permission "${permission}".\n\nRaison: ${reason}\n\nImpact: ${impact}`,
    attemptedSolutions: ['Vérifier permissions existantes', 'Chercher workarounds'],
    blocking: true,
    proposedAction: `Accorder la permission "${permission}"`,
    requiredFromUser: `Configurer la permission dans les settings GitHub/projet`
  });
}

/**
 * Escalader rapidement une décision business
 */
async function escalateDecision(agent, decision, options, impact, recommendation) {
  const system = new UserEscalationSystem();

  return await system.createEscalation({
    agent,
    severity: 'MEDIUM',
    type: CONFIG.escalationTypes.DECISION,
    title: `Décision requise: ${decision}`,
    description: `L'agent ${agent} a besoin d'une décision concernant: ${decision}\n\nImpact: ${impact}`,
    attemptedSolutions: ['Analyse des options', 'Évaluation des risques'],
    blocking: false,
    proposedAction: `Option recommandée: ${recommendation}`,
    requiredFromUser: `Choisir parmi:\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`
  });
}

// ============================================================================
// EXPORT
// ============================================================================

module.exports = {
  UserEscalationSystem,
  escalateAPIKey,
  escalatePermission,
  escalateDecision,
  CONFIG
};

// ============================================================================
// TEST (si exécuté directement)
// ============================================================================

if (require.main === module) {
  const system = new UserEscalationSystem();

  console.log('\n🧪 Test du User Escalation System\n');

  // Test création escalation
  escalateAPIKey(
    'Agent Visionnaire',
    'OpenAI',
    'Implémenter AI-powered deal analysis',
    '$30',
    [
      { name: 'Hugging Face', reason: 'Pas assez performant pour notre use case' },
      { name: 'Local models', reason: 'Trop lent, latence inacceptable' }
    ]
  ).then(id => {
    console.log(`\n✅ Escalation créée: ${id}\n`);

    // Afficher stats
    const stats = system.getStats();
    console.log('📊 Stats:');
    console.log(JSON.stringify(stats, null, 2));
  });
}
