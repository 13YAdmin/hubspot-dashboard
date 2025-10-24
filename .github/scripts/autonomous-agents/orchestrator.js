#!/usr/bin/env node

/**
 * ORCHESTRATEUR - Fait tourner TOUTE la boucle d'entreprise
 *
 * BOUCLE COMPLÈTE:
 * 1. Producteur AI → Analyse dashboard + bugs → Recommandations concrètes
 * 2. Visionnaire AI → Lit cahier des charges → Propose features
 * 3. RH AI → Vérifie charge travail → Recrute si besoin
 * 4. Chef AI → Lit recommendations → Priorise avec IA → Crée tasks
 * 5. Dev → Lit tasks → Code sur public/index.html
 * 6. QA → Teste dashboard
 * 7. Debugger → Fixe bugs
 * 8. Aiguilleur → Surveille workflows
 * 9. REPEAT
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class Orchestrator {
  constructor() {
    this.agentsDir = __dirname;
    this.results = {};
  }

  log(message) {
    console.log(`\n🎯 [ORCHESTRATEUR] ${message}`);
    console.log('='.repeat(60));
  }

  async runAgent(agentName, agentFile) {
    this.log(`Lancement: ${agentName}`);
    try {
      const output = execSync(`node ${path.join(this.agentsDir, agentFile)}`, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 120000
      });
      console.log(output);
      this.results[agentName] = 'SUCCESS';
      return true;
    } catch (error) {
      console.error(`❌ Erreur ${agentName}:`, error.message);
      this.results[agentName] = 'FAILED';
      return false;
    }
  }

  async run() {
    console.log('\n\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║         🏢 ORCHESTRATEUR - BOUCLE D\'ENTREPRISE IA        ║');
    console.log('║                                                           ║');
    console.log('║  But: Améliorer le dashboard HubSpot automatiquement     ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n');

    const startTime = Date.now();

    // ========================================================================
    // PHASE 1: ANALYSE & VISION
    // ========================================================================

    this.log('PHASE 1: ANALYSE & VISION');
    console.log('\nLes agents IA analysent le dashboard et proposent des améliorations...\n');

    // Producteur détecte les problèmes
    await this.runAgent('Producteur AI (COO)', 'agent-producteur-ai.js');

    // Visionnaire propose des innovations
    await this.runAgent('Visionnaire AI (CTO)', 'agent-visionnaire-ai.js');

    // RH vérifie les ressources
    await this.runAgent('RH AI', 'agent-rh-ai.js');

    // ========================================================================
    // PHASE 2: DÉCISION & PRIORISATION
    // ========================================================================

    this.log('PHASE 2: DÉCISION & PRIORISATION');
    console.log('\nLe Chef IA lit les recommandations et décide...\n');

    // Chef priorise et crée les tasks
    await this.runAgent('Chef AI (CEO)', 'agent-chef-ai.js');

    // Vérifier si des tasks ont été créées
    const tasksFile = path.join(__dirname, '../../../.github/agents-communication/tasks.json');
    let tasksCreated = 0;
    if (fs.existsSync(tasksFile)) {
      const tasks = JSON.parse(fs.readFileSync(tasksFile, 'utf8'));
      tasksCreated = (tasks.items || []).length;
    }

    console.log(`\n📋 ${tasksCreated} tâches créées par le Chef\n`);

    // ========================================================================
    // PHASE 3: IMPLÉMENTATION
    // ========================================================================

    if (tasksCreated > 0) {
      this.log('PHASE 3: IMPLÉMENTATION');
      console.log('\nLes agents implémentent les tâches...\n');

      // Dev implémente
      await this.runAgent('Dev', 'agent-dev.js');

      // QA teste
      await this.runAgent('QA', 'agent-qa.js');

      // Debugger corrige si nécessaire
      await this.runAgent('Debugger', 'agent-debugger.js');
    } else {
      console.log('\n⚠️  Aucune tâche à implémenter pour le moment\n');
    }

    // ========================================================================
    // PHASE 4: SURVEILLANCE
    // ========================================================================

    this.log('PHASE 4: SURVEILLANCE');
    console.log('\nL\'Aiguilleur IA surveille les workflows...\n');

    await this.runAgent('Aiguilleur AI', 'agent-aiguilleur-ai.js');

    // ========================================================================
    // PHASE 5: COMMUNICATION & RAPPORTS
    // ========================================================================

    this.log('PHASE 5: COMMUNICATION & RAPPORTS');
    console.log('\nL\'Agent Publishing IA génère les rapports et documentation...\n');

    await this.runAgent('Publishing AI', 'agent-publishing-ai.js');

    // ========================================================================
    // RÉSUMÉ
    // ========================================================================

    const duration = Math.round((Date.now() - startTime) / 1000);

    console.log('\n\n');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    📊 RÉSUMÉ COMPLET                      ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n');

    console.log('⏱️  Durée totale:', duration, 'secondes\n');
    console.log('📊 Résultats par agent:\n');

    Object.entries(this.results).forEach(([agent, status]) => {
      const emoji = status === 'SUCCESS' ? '✅' : '❌';
      console.log(`   ${emoji} ${agent}: ${status}`);
    });

    const successCount = Object.values(this.results).filter(r => r === 'SUCCESS').length;
    const totalCount = Object.keys(this.results).length;

    console.log(`\n📈 Score global: ${successCount}/${totalCount} agents réussis`);

    // Lire le score QA
    const qaReportPath = path.join(process.cwd(), 'RAPPORT-AGENT-QA.md');
    if (fs.existsSync(qaReportPath)) {
      const qaReport = fs.readFileSync(qaReportPath, 'utf8');
      const scoreMatch = qaReport.match(/Score\*\*:\s*(\d+)/);
      if (scoreMatch) {
        console.log(`\n🎯 Score QA Dashboard: ${scoreMatch[1]}/100`);
      }
    }

    console.log('\n📝 Rapports générés:');
    console.log('   - RAPPORT-QUOTIDIEN.md (Synthèse IA)');
    console.log('   - ORGANIGRAMME.md');
    console.log('   - DOCUMENTATION.md');
    console.log('   - RAPPORT-AGENT-PRODUCTEUR-AI.md');
    console.log('   - RAPPORT-AGENT-VISIONNAIRE-AI.md');
    console.log('   - RAPPORT-AGENT-RH-AI.md');
    console.log('   - RAPPORT-AGENT-CHEF-AI.md');
    console.log('   - RAPPORT-AGENT-DEV.md');
    console.log('   - RAPPORT-AGENT-QA.md');
    console.log('   - RAPPORT-AGENT-DEBUGGER.md');
    console.log('   - RAPPORT-AGENT-AIGUILLEUR-AI.md');

    console.log('\n💬 Communication Hub:');
    console.log('   - .github/agents-communication/recommendations.json');
    console.log('   - .github/agents-communication/tasks.json');

    console.log('\n\n✅ BOUCLE COMPLÈTE TERMINÉE\n');

    console.log('🔄 Prochaine exécution: automatique toutes les heures\n');
  }
}

// Exécution
if (require.main === module) {
  const orchestrator = new Orchestrator();
  orchestrator.run().catch(error => {
    console.error('❌ ERREUR ORCHESTRATEUR:', error);
    process.exit(1);
  });
}

module.exports = Orchestrator;
