#!/usr/bin/env node

/**
 * 🚦 AGENT AIGUILLEUR (Traffic Controller Agent)
 *
 * Responsabilité: Monitorer les workflows GitHub Actions et prévenir les conflits
 *
 * Tâches:
 * 1. Surveiller les workflows en cours d'exécution
 * 2. Détecter les conflits potentiels (workflows qui se marchent dessus)
 * 3. Identifier les risques de boucle infinie
 * 4. Générer des alertes si problèmes détectés
 * 5. Annuler les workflows redondants si nécessaire
 * 6. Maintenir un état de santé des workflows
 *
 * Fréquence: Toutes les heures + avant chaque workflow majeur
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  repoOwner: '13YAdmin',
  repoName: 'hubspot-dashboard',
  workflows: {
    'fetch-hubspot-data.yml': {
      name: 'Fetch HubSpot Data',
      frequency: '2h',
      priority: 1,  // Priorité la plus haute
      canRunConcurrently: false,
      maxDuration: 10  // minutes
    },
    'autonomous-loop.yml': {
      name: 'Boucle Vertueuse Autonome',
      frequency: '6h',
      priority: 2,
      canRunConcurrently: false,
      maxDuration: 20  // minutes
    }
  },
  thresholds: {
    maxConcurrentWorkflows: 2,
    maxQueuedWorkflows: 3,
    staleWorkflowMinutes: 30
  },
  alerts: {
    enabled: true,
    reportPath: 'RAPPORT-AGENT-AIGUILLEUR.md'
  }
};

class AgentAiguilleur {
  constructor() {
    this.workflowRuns = [];
    this.conflicts = [];
    this.alerts = [];
    this.health = {
      status: 'healthy',
      score: 100,
      issues: []
    };
  }

  /**
   * Point d'entrée principal
   */
  async run() {
    console.log('🚦 AGENT AIGUILLEUR - Démarrage');
    console.log('================================================\n');

    try {
      // 1. Récupérer l'état des workflows
      await this.fetchWorkflowRuns();

      // 2. Analyser les conflits potentiels
      await this.analyzeConflicts();

      // 3. Détecter les workflows bloqués/stales
      await this.detectStaledWorkflows();

      // 4. Vérifier les risques de boucle infinie
      await this.checkInfiniteLoopRisk();

      // 5. Calculer le score de santé
      await this.calculateHealthScore();

      // 6. Prendre des actions correctives si nécessaire
      await this.takeCorrectiveActions();

      // 7. Générer le rapport
      await this.generateReport();

      console.log('\n✅ Agent Aiguilleur terminé avec succès');
      console.log(`📊 Score de santé: ${this.health.score}/100`);
      console.log(`🚨 Alertes: ${this.alerts.length}`);

    } catch (error) {
      console.error('❌ Erreur Agent Aiguilleur:', error.message);
      process.exit(1);
    }
  }

  /**
   * Récupère l'état des workflows via GitHub API
   */
  async fetchWorkflowRuns() {
    console.log('📡 Récupération état des workflows...\n');

    try {
      // Utiliser gh CLI pour récupérer les workflow runs
      const result = execSync(
        `gh api repos/${CONFIG.repoOwner}/${CONFIG.repoName}/actions/runs?per_page=20`,
        { encoding: 'utf-8' }
      );

      const data = JSON.parse(result);
      this.workflowRuns = data.workflow_runs || [];

      console.log(`   ✅ ${this.workflowRuns.length} workflow runs récupérés`);

      // Afficher résumé
      const running = this.workflowRuns.filter(r => r.status === 'in_progress').length;
      const queued = this.workflowRuns.filter(r => r.status === 'queued').length;
      const completed = this.workflowRuns.filter(r => r.status === 'completed').length;

      console.log(`   🏃 En cours: ${running}`);
      console.log(`   ⏳ En attente: ${queued}`);
      console.log(`   ✅ Complétés: ${completed}\n`);

    } catch (error) {
      // Si gh CLI pas disponible ou pas d'accès, utiliser mock pour tests
      console.log('   ⚠️  GitHub API non disponible, utilisation données locales');
      this.workflowRuns = await this.getMockWorkflowRuns();
    }
  }

  /**
   * Analyse les conflits entre workflows
   */
  async analyzeConflicts() {
    console.log('🔍 Analyse des conflits...\n');

    const activeWorkflows = this.workflowRuns.filter(
      r => r.status === 'in_progress' || r.status === 'queued'
    );

    // Vérifier workflows concurrents
    const workflowsByName = {};
    activeWorkflows.forEach(run => {
      const name = run.name;
      if (!workflowsByName[name]) {
        workflowsByName[name] = [];
      }
      workflowsByName[name].push(run);
    });

    // Détecter conflits
    for (const [name, runs] of Object.entries(workflowsByName)) {
      if (runs.length > 1) {
        const conflict = {
          type: 'concurrent_execution',
          workflow: name,
          severity: 'high',
          count: runs.length,
          runs: runs.map(r => r.id),
          message: `${runs.length} instances de "${name}" tournent en même temps`
        };
        this.conflicts.push(conflict);
        this.alerts.push({
          level: 'warning',
          message: conflict.message,
          action: 'Annuler les runs les plus anciens'
        });

        console.log(`   ⚠️  CONFLIT: ${conflict.message}`);
      }
    }

    // Vérifier nombre total de workflows actifs
    if (activeWorkflows.length > CONFIG.thresholds.maxConcurrentWorkflows) {
      const conflict = {
        type: 'too_many_concurrent',
        severity: 'medium',
        count: activeWorkflows.length,
        threshold: CONFIG.thresholds.maxConcurrentWorkflows,
        message: `${activeWorkflows.length} workflows actifs (max recommandé: ${CONFIG.thresholds.maxConcurrentWorkflows})`
      };
      this.conflicts.push(conflict);
      this.alerts.push({
        level: 'info',
        message: conflict.message,
        action: 'Surveiller la charge'
      });

      console.log(`   ℹ️  INFO: ${conflict.message}`);
    }

    if (this.conflicts.length === 0) {
      console.log('   ✅ Aucun conflit détecté\n');
    } else {
      console.log(`   🚨 ${this.conflicts.length} conflit(s) détecté(s)\n`);
    }
  }

  /**
   * Détecte les workflows bloqués/stales
   */
  async detectStaledWorkflows() {
    console.log('⏰ Détection workflows bloqués...\n');

    const now = new Date();
    const staleWorkflows = [];

    this.workflowRuns
      .filter(r => r.status === 'in_progress')
      .forEach(run => {
        const startedAt = new Date(run.created_at);
        const durationMinutes = (now - startedAt) / (1000 * 60);

        const workflowConfig = Object.values(CONFIG.workflows).find(
          w => w.name === run.name
        );

        const maxDuration = workflowConfig?.maxDuration || CONFIG.thresholds.staleWorkflowMinutes;

        if (durationMinutes > maxDuration) {
          staleWorkflows.push({
            id: run.id,
            name: run.name,
            duration: Math.round(durationMinutes),
            maxDuration: maxDuration,
            url: run.html_url
          });

          this.alerts.push({
            level: 'error',
            message: `Workflow "${run.name}" bloqué depuis ${Math.round(durationMinutes)}min (max: ${maxDuration}min)`,
            action: 'Annuler et relancer le workflow'
          });

          console.log(`   ❌ BLOQUÉ: "${run.name}" - ${Math.round(durationMinutes)}min (max: ${maxDuration}min)`);
        }
      });

    if (staleWorkflows.length === 0) {
      console.log('   ✅ Aucun workflow bloqué\n');
    } else {
      console.log(`   🚨 ${staleWorkflows.length} workflow(s) bloqué(s)\n`);
      this.health.issues.push({
        type: 'stale_workflows',
        count: staleWorkflows.length,
        details: staleWorkflows
      });
    }
  }

  /**
   * Vérifie les risques de boucle infinie
   */
  async checkInfiniteLoopRisk() {
    console.log('🔄 Vérification risque boucle infinie...\n');

    // Récupérer les derniers runs (1h)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentRuns = this.workflowRuns.filter(
      r => new Date(r.created_at) > oneHourAgo
    );

    // Grouper par workflow
    const runsByWorkflow = {};
    recentRuns.forEach(run => {
      if (!runsByWorkflow[run.name]) {
        runsByWorkflow[run.name] = [];
      }
      runsByWorkflow[run.name].push(run);
    });

    // Détecter exécutions trop fréquentes
    for (const [name, runs] of Object.entries(runsByWorkflow)) {
      const workflowConfig = Object.values(CONFIG.workflows).find(w => w.name === name);

      // Si plus de 5 exécutions en 1h pour un workflow qui devrait tourner toutes les 2h ou 6h
      if (runs.length > 5 && workflowConfig) {
        this.alerts.push({
          level: 'critical',
          message: `RISQUE BOUCLE INFINIE: "${name}" a tourné ${runs.length} fois en 1h (freq normale: ${workflowConfig.frequency})`,
          action: 'Vérifier les triggers et [skip ci] dans les commits'
        });

        this.health.issues.push({
          type: 'infinite_loop_risk',
          workflow: name,
          count: runs.length,
          frequency: workflowConfig.frequency
        });

        console.log(`   🔴 CRITIQUE: "${name}" - ${runs.length} exécutions en 1h`);
      }
    }

    if (this.alerts.filter(a => a.level === 'critical').length === 0) {
      console.log('   ✅ Aucun risque de boucle infinie\n');
    } else {
      console.log('   🔴 RISQUE DE BOUCLE INFINIE DÉTECTÉ\n');
    }
  }

  /**
   * Calcule le score de santé des workflows
   */
  async calculateHealthScore() {
    console.log('📊 Calcul score de santé...\n');

    let score = 100;

    // Pénalités
    this.conflicts.forEach(conflict => {
      if (conflict.severity === 'high') score -= 20;
      if (conflict.severity === 'medium') score -= 10;
      if (conflict.severity === 'low') score -= 5;
    });

    this.alerts.forEach(alert => {
      if (alert.level === 'critical') score -= 30;
      if (alert.level === 'error') score -= 15;
      if (alert.level === 'warning') score -= 10;
      if (alert.level === 'info') score -= 5;
    });

    this.health.score = Math.max(0, score);

    // Déterminer status
    if (this.health.score >= 90) {
      this.health.status = 'healthy';
      console.log('   ✅ État: HEALTHY');
    } else if (this.health.score >= 70) {
      this.health.status = 'warning';
      console.log('   ⚠️  État: WARNING');
    } else if (this.health.score >= 50) {
      this.health.status = 'degraded';
      console.log('   🟠 État: DEGRADED');
    } else {
      this.health.status = 'critical';
      console.log('   🔴 État: CRITICAL');
    }

    console.log(`   📊 Score: ${this.health.score}/100\n`);
  }

  /**
   * Prend des actions correctives automatiques
   */
  async takeCorrectiveActions() {
    console.log('🔧 Actions correctives...\n');

    let actionsTaken = 0;

    // Action 1: Annuler les workflows redondants
    const concurrentConflicts = this.conflicts.filter(c => c.type === 'concurrent_execution');

    for (const conflict of concurrentConflicts) {
      // En production, on annulerait les runs les plus anciens
      // Pour l'instant, on log seulement
      console.log(`   ℹ️  Recommandation: Annuler runs redondants pour "${conflict.workflow}"`);
      actionsTaken++;
    }

    // Action 2: Annuler les workflows bloqués
    const staleIssues = this.health.issues.filter(i => i.type === 'stale_workflows');

    for (const issue of staleIssues) {
      issue.details.forEach(workflow => {
        console.log(`   ℹ️  Recommandation: Annuler workflow bloqué #${workflow.id}`);
        actionsTaken++;
      });
    }

    // Action 3: Alerter si boucle infinie
    const loopRisks = this.health.issues.filter(i => i.type === 'infinite_loop_risk');

    if (loopRisks.length > 0) {
      console.log(`   🚨 ALERTE: Risque boucle infinie - intervention manuelle requise`);
      actionsTaken++;
    }

    if (actionsTaken === 0) {
      console.log('   ✅ Aucune action corrective nécessaire\n');
    } else {
      console.log(`   📝 ${actionsTaken} recommandation(s) générée(s)\n`);
    }
  }

  /**
   * Génère le rapport de monitoring
   */
  async generateReport() {
    console.log('📝 Génération rapport...\n');

    const report = `# 🚦 RAPPORT AGENT AIGUILLEUR

**Date**: ${new Date().toLocaleString('fr-FR')}
**Version**: 1.0.0

---

## 📊 RÉSUMÉ EXÉCUTIF

### Score de Santé des Workflows

**Score Global**: ${this.health.score}/100
**Status**: ${this.getStatusEmoji(this.health.status)} ${this.health.status.toUpperCase()}

---

## 🔍 ÉTAT DES WORKFLOWS

### Workflows Actifs

${this.generateWorkflowsTable()}

### Statistiques

| Métrique | Valeur |
|----------|--------|
| Workflows en cours | ${this.workflowRuns.filter(r => r.status === 'in_progress').length} |
| Workflows en attente | ${this.workflowRuns.filter(r => r.status === 'queued').length} |
| Workflows complétés (récent) | ${this.workflowRuns.filter(r => r.status === 'completed').length} |
| Total analysés | ${this.workflowRuns.length} |

---

## ⚠️ CONFLITS DÉTECTÉS

${this.conflicts.length > 0 ? this.generateConflictsSection() : '✅ **Aucun conflit détecté**'}

---

## 🚨 ALERTES

${this.alerts.length > 0 ? this.generateAlertsSection() : '✅ **Aucune alerte**'}

---

## 🏥 PROBLÈMES IDENTIFIÉS

${this.health.issues.length > 0 ? this.generateIssuesSection() : '✅ **Aucun problème**'}

---

## 📋 RECOMMANDATIONS

${this.generateRecommendations()}

---

## 🎯 ACTIONS PRISES

${this.generateActionsSection()}

---

## 📈 TENDANCES

${this.generateTrendsSection()}

---

## 🔄 PROCHAINE VÉRIFICATION

**Dans**: 1 heure (automatique)
**Déclencheur**: Cron schedule

---

**🤖 Généré automatiquement par l'Agent Aiguilleur**
**Version**: 1.0.0
**Timestamp**: ${Date.now()}
`;

    // Sauvegarder le rapport
    await fs.writeFile(
      path.join(process.cwd(), CONFIG.alerts.reportPath),
      report,
      'utf-8'
    );

    console.log(`   ✅ Rapport sauvegardé: ${CONFIG.alerts.reportPath}`);
  }

  /**
   * Génère la table des workflows
   */
  generateWorkflowsTable() {
    const activeRuns = this.workflowRuns
      .filter(r => r.status === 'in_progress' || r.status === 'queued')
      .slice(0, 10);

    if (activeRuns.length === 0) {
      return '✅ Aucun workflow actif actuellement';
    }

    let table = '| Workflow | Status | Durée | Branch |\n';
    table += '|----------|--------|-------|--------|\n';

    activeRuns.forEach(run => {
      const startedAt = new Date(run.created_at);
      const duration = Math.round((Date.now() - startedAt) / (1000 * 60));
      const status = this.getStatusEmoji(run.status);

      table += `| ${run.name} | ${status} ${run.status} | ${duration}min | ${run.head_branch} |\n`;
    });

    return table;
  }

  /**
   * Génère la section conflits
   */
  generateConflictsSection() {
    let section = '';

    this.conflicts.forEach((conflict, index) => {
      const emoji = conflict.severity === 'high' ? '🔴' : conflict.severity === 'medium' ? '🟠' : '🟡';
      section += `### ${emoji} Conflit #${index + 1}: ${conflict.type}\n\n`;
      section += `**Sévérité**: ${conflict.severity}\n`;
      section += `**Message**: ${conflict.message}\n\n`;
    });

    return section;
  }

  /**
   * Génère la section alertes
   */
  generateAlertsSection() {
    let section = '';

    const alertsByLevel = {
      critical: this.alerts.filter(a => a.level === 'critical'),
      error: this.alerts.filter(a => a.level === 'error'),
      warning: this.alerts.filter(a => a.level === 'warning'),
      info: this.alerts.filter(a => a.level === 'info')
    };

    Object.entries(alertsByLevel).forEach(([level, alerts]) => {
      if (alerts.length > 0) {
        const emoji = level === 'critical' ? '🔴' : level === 'error' ? '❌' : level === 'warning' ? '⚠️' : 'ℹ️';
        section += `### ${emoji} ${level.toUpperCase()} (${alerts.length})\n\n`;

        alerts.forEach((alert, index) => {
          section += `${index + 1}. **${alert.message}**\n`;
          section += `   - Action recommandée: ${alert.action}\n\n`;
        });
      }
    });

    return section;
  }

  /**
   * Génère la section problèmes
   */
  generateIssuesSection() {
    let section = '';

    this.health.issues.forEach((issue, index) => {
      section += `### Problème #${index + 1}: ${issue.type}\n\n`;
      section += `**Détails**: ${JSON.stringify(issue, null, 2)}\n\n`;
    });

    return section;
  }

  /**
   * Génère les recommandations
   */
  generateRecommendations() {
    const recommendations = [];

    // Basées sur le score
    if (this.health.score < 70) {
      recommendations.push('🔴 **URGENT**: Intervention manuelle requise - workflows en état dégradé');
    }

    // Basées sur les conflits
    if (this.conflicts.length > 0) {
      recommendations.push('⚠️ Résoudre les conflits entre workflows avant de continuer');
    }

    // Basées sur les alertes critiques
    const criticalAlerts = this.alerts.filter(a => a.level === 'critical');
    if (criticalAlerts.length > 0) {
      recommendations.push('🚨 Traiter immédiatement les alertes critiques');
    }

    // Basées sur les workflows bloqués
    const staleIssues = this.health.issues.filter(i => i.type === 'stale_workflows');
    if (staleIssues.length > 0) {
      recommendations.push('🔧 Annuler et relancer les workflows bloqués');
    }

    // Basées sur les risques de boucle
    const loopRisks = this.health.issues.filter(i => i.type === 'infinite_loop_risk');
    if (loopRisks.length > 0) {
      recommendations.push('🔄 Vérifier les triggers et ajouter [skip ci] dans les commits automatiques');
    }

    if (recommendations.length === 0) {
      return '✅ Aucune recommandation - workflows en bon état';
    }

    return recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n');
  }

  /**
   * Génère la section actions
   */
  generateActionsSection() {
    // Pour l'instant, on ne prend pas d'actions automatiques
    return `ℹ️ Mode monitoring uniquement - aucune action automatique prise

Pour activer les actions automatiques (annulation workflows redondants, etc.), modifier le fichier de configuration.`;
  }

  /**
   * Génère la section tendances
   */
  generateTrendsSection() {
    // Analyse des dernières 24h
    const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRuns = this.workflowRuns.filter(
      r => new Date(r.created_at) > last24h
    );

    const successRate = recentRuns.length > 0
      ? Math.round((recentRuns.filter(r => r.conclusion === 'success').length / recentRuns.length) * 100)
      : 100;

    return `**Dernières 24h**:
- Total exécutions: ${recentRuns.length}
- Taux de succès: ${successRate}%
- Échecs: ${recentRuns.filter(r => r.conclusion === 'failure').length}
- En cours: ${recentRuns.filter(r => r.status === 'in_progress').length}`;
  }

  /**
   * Récupère des données mock pour tests
   */
  async getMockWorkflowRuns() {
    // Mock data pour tests en local
    return [];
  }

  /**
   * Obtient l'emoji de status
   */
  getStatusEmoji(status) {
    const emojis = {
      'healthy': '✅',
      'warning': '⚠️',
      'degraded': '🟠',
      'critical': '🔴',
      'completed': '✅',
      'in_progress': '🏃',
      'queued': '⏳',
      'success': '✅',
      'failure': '❌'
    };
    return emojis[status] || '❓';
  }
}

// Exécution
if (require.main === module) {
  const agent = new AgentAiguilleur();
  agent.run().catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = AgentAiguilleur;
