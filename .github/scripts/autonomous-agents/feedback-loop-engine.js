#!/usr/bin/env node

/**
 * 🔄 FEEDBACK LOOP ENGINE - Moteur de boucles symbiotiques
 *
 * Gère les cycles de feedback entre TOUS les agents avec escalade automatique.
 *
 * PRINCIPES:
 * 1. Chaque agent peut renvoyer vers n'importe quel autre agent
 * 2. Les boucles de feedback sont illimitées jusqu'à résolution
 * 3. Si échec répété (>3 fois) → Escalade au niveau supérieur
 * 4. Historique complet tracké pour chaque feature
 *
 * CYCLES DE FEEDBACK:
 *
 * Cycle Normal:
 * Visionnaire → Chef → Développeur → QA → ✅ Déploiement
 *
 * Cycle avec Bug Simple:
 * Visionnaire → Chef → Développeur → QA ❌
 *                                       ↓
 *                             Debugger ← ┘
 *                                ↓
 *                             QA (re-test)
 *                                ↓
 *                               ✅
 *
 * Cycle avec Bug Complexe (3+ tentatives):
 * QA ❌ → Debugger ❌ → QA ❌ → Debugger ❌ → QA ❌
 *                                              ↓
 *                                    ESCALADE: Développeur
 *                                              ↓
 *                                            QA
 *                                              ↓
 *                                             ✅
 *
 * Cycle avec Feature Impossible:
 * Développeur (tentative 1) ❌ → QA ❌ → Debugger ❌
 * Développeur (tentative 2) ❌ → QA ❌ → Debugger ❌
 * Développeur (tentative 3) ❌ → ESCALADE: Chef
 *                                          ↓
 *                             Re-évaluation faisabilité
 *                                          ↓
 *                                   Si vraiment impossible
 *                                          ↓
 *                                  ESCALADE: Visionnaire
 *                                          ↓
 *                              Proposer alternative/pivot
 *
 * ÉTATS POSSIBLES:
 * - pending: En attente
 * - in_progress: En cours
 * - testing: En test QA
 * - failed: Échec (retour en arrière)
 * - blocked: Bloqué (escalade nécessaire)
 * - completed: Terminé
 * - abandoned: Abandonné (après escalade Visionnaire)
 */

const fs = require('fs').promises;
const path = require('path');
const CommunicationHub = require('./communication-hub.js');

class FeedbackLoopEngine {
  constructor() {
    this.hub = new CommunicationHub();
    this.loopsDir = path.join(process.cwd(), '.github/agents-communication/loops');

    // Configuration des seuils d'escalade
    this.escalationThresholds = {
      debugger: 3,      // Après 3 tentatives Debugger, escalade au Développeur
      developer: 3,     // Après 3 tentatives Développeur, escalade au Chef
      chef: 2           // Après 2 re-évaluations Chef, escalade au Visionnaire
    };
  }

  async init() {
    await this.hub.init();

    // Créer dossier loops
    try {
      await fs.mkdir(this.loopsDir, { recursive: true });
    } catch (error) {
      // Directory exists
    }

    console.log('✅ Feedback Loop Engine initialisé');
  }

  /**
   * Créer une nouvelle loop pour une feature
   */
  async createLoop(featureId, recommendation) {
    const loop = {
      id: `LOOP-${featureId}`,
      featureId: featureId,
      recommendation: recommendation,
      status: 'pending',
      currentAgent: 'Agent Chef de Projet',
      history: [
        {
          timestamp: new Date().toISOString(),
          from: 'Agent Visionnaire',
          to: 'Agent Chef de Projet',
          action: 'recommendation_created',
          data: recommendation
        }
      ],
      attempts: {
        debugger: 0,
        developer: 0,
        chef: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const filepath = path.join(this.loopsDir, `${loop.id}.json`);
    await fs.writeFile(filepath, JSON.stringify(loop, null, 2));

    console.log(`✅ Loop créée: ${loop.id}`);
    return loop;
  }

  /**
   * Transition d'un agent à un autre
   */
  async transition(loopId, from, to, action, data, result = null) {
    const filepath = path.join(this.loopsDir, `${loopId}.json`);
    const loop = JSON.parse(await fs.readFile(filepath, 'utf-8'));

    // Ajouter à l'historique
    loop.history.push({
      timestamp: new Date().toISOString(),
      from: from,
      to: to,
      action: action,
      data: data,
      result: result
    });

    // Incrémenter compteur de tentatives si échec
    if (result === 'failed') {
      if (from === 'Agent Debugger') loop.attempts.debugger++;
      if (from === 'Agent Développeur') loop.attempts.developer++;
      if (from === 'Agent Chef de Projet') loop.attempts.chef++;
    }

    // Vérifier si escalade nécessaire
    const escalation = this.checkEscalation(loop, from);

    if (escalation) {
      console.log(`⚠️  ESCALADE détectée: ${from} → ${escalation.to}`);
      console.log(`   Raison: ${escalation.reason}`);

      // Forcer la transition vers l'agent d'escalade
      loop.currentAgent = escalation.to;
      loop.status = 'escalated';

      loop.history.push({
        timestamp: new Date().toISOString(),
        from: from,
        to: escalation.to,
        action: 'escalation',
        reason: escalation.reason,
        attempts: loop.attempts
      });
    } else {
      loop.currentAgent = to;
      loop.status = this.getStatusFromAction(action, result);
    }

    loop.updatedAt = new Date().toISOString();

    await fs.writeFile(filepath, JSON.stringify(loop, null, 2));

    console.log(`🔄 Transition: ${from} → ${to} (${action})`);
    if (result) console.log(`   Résultat: ${result}`);

    return loop;
  }

  /**
   * Vérifier si une escalade est nécessaire
   */
  checkEscalation(loop, currentAgent) {
    // Debugger → Développeur (après 3 tentatives)
    if (currentAgent === 'Agent Debugger' && loop.attempts.debugger >= this.escalationThresholds.debugger) {
      return {
        to: 'Agent Développeur',
        reason: `Debugger a échoué ${loop.attempts.debugger} fois, bug trop complexe`
      };
    }

    // Développeur → Chef (après 3 tentatives)
    if (currentAgent === 'Agent Développeur' && loop.attempts.developer >= this.escalationThresholds.developer) {
      return {
        to: 'Agent Chef de Projet',
        reason: `Développeur a échoué ${loop.attempts.developer} fois, feature potentiellement impossible`
      };
    }

    // Chef → Visionnaire (après 2 re-évaluations)
    if (currentAgent === 'Agent Chef de Projet' && loop.attempts.chef >= this.escalationThresholds.chef) {
      return {
        to: 'Agent Visionnaire',
        reason: `Chef a re-évalué ${loop.attempts.chef} fois, besoin d'alternative/pivot`
      };
    }

    return null;
  }

  /**
   * Déterminer le statut basé sur l'action et le résultat
   */
  getStatusFromAction(action, result) {
    if (action === 'deployment' && result === 'success') return 'completed';
    if (action === 'alternative_proposed') return 'pending'; // Nouvelle boucle commence
    if (action === 'abandon') return 'abandoned';
    if (result === 'failed') return 'failed';
    if (action === 'testing') return 'testing';
    if (action === 'implementation') return 'in_progress';
    return 'in_progress';
  }

  /**
   * Obtenir toutes les loops actives
   */
  async getActiveLoops() {
    const files = await fs.readdir(this.loopsDir);
    const loops = [];

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(this.loopsDir, file), 'utf-8');
        const loop = JSON.parse(content);

        if (loop.status !== 'completed' && loop.status !== 'abandoned') {
          loops.push(loop);
        }
      }
    }

    return loops;
  }

  /**
   * Générer rapport de loop pour une feature
   */
  async generateLoopReport(loopId) {
    const filepath = path.join(this.loopsDir, `${loopId}.json`);
    const loop = JSON.parse(await fs.readFile(filepath, 'utf-8'));

    let report = `# 🔄 RAPPORT DE BOUCLE - ${loopId}\n\n`;
    report += `**Feature**: ${loop.recommendation.title}\n`;
    report += `**Status**: ${loop.status}\n`;
    report += `**Agent actuel**: ${loop.currentAgent}\n\n`;
    report += `---\n\n`;
    report += `## 📊 Tentatives\n\n`;
    report += `- Debugger: ${loop.attempts.debugger}/${this.escalationThresholds.debugger}\n`;
    report += `- Développeur: ${loop.attempts.developer}/${this.escalationThresholds.developer}\n`;
    report += `- Chef: ${loop.attempts.chef}/${this.escalationThresholds.chef}\n\n`;
    report += `---\n\n`;
    report += `## 📜 Historique Complet\n\n`;

    loop.history.forEach((entry, index) => {
      const emoji = this.getEmojiForAction(entry.action);
      report += `### ${index + 1}. ${emoji} ${entry.from} → ${entry.to}\n\n`;
      report += `**Action**: ${entry.action}\n`;
      report += `**Timestamp**: ${entry.timestamp}\n`;
      if (entry.result) report += `**Résultat**: ${entry.result}\n`;
      if (entry.reason) report += `**Raison**: ${entry.reason}\n`;
      report += `\n`;
    });

    return report;
  }

  /**
   * Emoji pour chaque action
   */
  getEmojiForAction(action) {
    const emojis = {
      'recommendation_created': '🚀',
      'task_created': '📋',
      'implementation': '💻',
      'testing': '🧪',
      'bug_found': '🐛',
      'bug_fixed': '🔧',
      'escalation': '⚠️',
      'deployment': '🚀',
      'alternative_proposed': '💡',
      'abandon': '❌'
    };
    return emojis[action] || '🔄';
  }

  /**
   * Afficher l'état de toutes les loops
   */
  async displayLoopsStatus() {
    console.log('\n🔄 FEEDBACK LOOPS STATUS\n');
    console.log('================================================\n');

    const activeLoops = await this.getActiveLoops();

    if (activeLoops.length === 0) {
      console.log('✅ Aucune loop active\n');
      return;
    }

    console.log(`📊 ${activeLoops.length} loop(s) active(s):\n`);

    for (const loop of activeLoops) {
      console.log(`   ${loop.id}:`);
      console.log(`   - Feature: ${loop.recommendation.title}`);
      console.log(`   - Status: ${loop.status}`);
      console.log(`   - Agent actuel: ${loop.currentAgent}`);
      console.log(`   - Tentatives: D:${loop.attempts.debugger} / Dev:${loop.attempts.developer} / Chef:${loop.attempts.chef}`);
      console.log('');
    }

    console.log('================================================\n');
  }

  /**
   * Simuler une boucle complète pour tester
   */
  async simulateCompleteLoop() {
    console.log('🧪 SIMULATION D\'UNE BOUCLE COMPLÈTE\n');
    console.log('================================================\n');

    // 1. Visionnaire propose une feature
    const recommendation = {
      type: 'tech_innovation',
      title: 'Intégrer Observable Plot',
      description: 'Remplacer Chart.js par Observable Plot',
      priority: 'high'
    };

    const loop = await this.createLoop('FEAT-001', recommendation);

    // 2. Chef crée une tâche
    await this.transition(loop.id, 'Agent Chef de Projet', 'Agent Développeur', 'task_created', {
      task: 'Implémenter Observable Plot',
      estimatedTime: '2 jours'
    }, 'success');

    // 3. Développeur implémente
    await this.transition(loop.id, 'Agent Développeur', 'Agent QA', 'implementation', {
      files: ['index.html', 'charts.js'],
      changes: '+150 -80 lines'
    }, 'success');

    // 4. QA teste et trouve un bug
    await this.transition(loop.id, 'Agent QA', 'Agent Debugger', 'testing', {
      test: 'Test sur mobile'
    }, 'failed');

    // 5. Debugger corrige (tentative 1)
    await this.transition(loop.id, 'Agent Debugger', 'Agent QA', 'bug_fixed', {
      bug: 'Graphique cassé sur mobile',
      fix: 'Ajout responsive CSS'
    }, 'success');

    // 6. QA re-teste et trouve encore un bug
    await this.transition(loop.id, 'Agent QA', 'Agent Debugger', 'testing', {
      test: 'Re-test mobile'
    }, 'failed');

    // 7. Debugger corrige (tentative 2)
    await this.transition(loop.id, 'Agent Debugger', 'Agent QA', 'bug_fixed', {
      bug: 'Animation lag sur mobile',
      fix: 'Optimisation rendering'
    }, 'success');

    // 8. QA re-teste et trouve encore un bug (3ème fois!)
    await this.transition(loop.id, 'Agent QA', 'Agent Debugger', 'testing', {
      test: 'Re-test mobile avec animations'
    }, 'failed');

    // 9. Debugger échoue (tentative 3) → ESCALADE automatique vers Développeur
    await this.transition(loop.id, 'Agent Debugger', 'Agent QA', 'bug_fixed', {
      bug: 'Performance critique sur vieux mobiles',
      fix: 'Tentative d\'optimisation'
    }, 'failed');

    // ESCALADE détectée automatiquement → Développeur reprend

    // 10. Développeur refait l'implémentation (approche différente)
    await this.transition(loop.id, 'Agent Développeur', 'Agent QA', 'implementation', {
      approach: 'Lazy loading + Progressive enhancement',
      changes: '+200 -150 lines'
    }, 'success');

    // 11. QA teste et valide
    await this.transition(loop.id, 'Agent QA', 'Agent Chef de Projet', 'testing', {
      test: 'Test complet desktop + mobile + tablette'
    }, 'success');

    // 12. Chef déploie
    await this.transition(loop.id, 'Agent Chef de Projet', 'Deployed', 'deployment', {
      environment: 'production',
      score: '87 → 90 (+3 points)'
    }, 'success');

    console.log('\n✅ Simulation terminée\n');

    // Générer rapport
    const report = await this.generateLoopReport(loop.id);
    console.log(report);
  }
}

// Export
module.exports = FeedbackLoopEngine;

// Test si exécuté directement
if (require.main === module) {
  (async () => {
    const engine = new FeedbackLoopEngine();
    await engine.init();
    await engine.simulateCompleteLoop();
    await engine.displayLoopsStatus();
  })();
}
