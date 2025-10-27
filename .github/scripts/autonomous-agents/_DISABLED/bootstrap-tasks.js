#!/usr/bin/env node

/**
 * BOOTSTRAP TASKS - Force le Chef à créer des tâches depuis le rapport d'audit
 *
 * Lit RAPPORT-FINAL-AUDIT.md et CORRECTIONS-IMMEDIATES.md
 * Crée des tasks concrètes pour chaque bug
 * Lance la boucle Dev → QA → Debug immédiatement
 */

const fs = require('fs');
const path = require('path');

const tasksFile = path.join(__dirname, '../../../.github/agents-communication/tasks.json');

console.log('🚀 BOOTSTRAP - Création des tâches depuis le rapport d\'audit\n');

// Lire le rapport d'audit
const correctionsPath = path.join(process.cwd(), 'CORRECTIONS-IMMEDIATES.md');
const auditPath = path.join(process.cwd(), 'RAPPORT-FINAL-AUDIT.md');

if (!fs.existsSync(correctionsPath)) {
  console.log('⚠️  CORRECTIONS-IMMEDIATES.md introuvable (archivé)');
  console.log('📋 Création des tâches depuis les specs hardcodées...\n');
} else {
  console.log('📖 Lecture du rapport d\'audit...\n');
}

// Créer les tasks basées sur les bugs identifiés
const tasks = {
  items: [
    {
      id: `TASK-${Date.now()}-1`,
      title: 'Fix Bug #1: Exposer showClientDetails globalement',
      description: 'Ajouter window.showClientDetails = showClientDetails après la ligne 5245',
      type: 'bugfix',
      priority: 'critical',
      file: 'public/index.html',
      line: 5245,
      estimatedTime: '2 minutes',
      assignedTo: 'Agent Dev',
      createdBy: 'Bootstrap',
      createdAt: new Date().toISOString(),
      status: 'pending'
    },
    {
      id: `TASK-${Date.now()}-2`,
      title: 'Fix Bug #2: Exposer showIndustryDetails globalement',
      description: 'Ajouter window.showIndustryDetails = showIndustryDetails après la ligne 3660',
      type: 'bugfix',
      priority: 'critical',
      file: 'public/index.html',
      line: 3660,
      estimatedTime: '2 minutes',
      assignedTo: 'Agent Dev',
      createdBy: 'Bootstrap',
      createdAt: new Date().toISOString(),
      status: 'pending'
    },
    {
      id: `TASK-${Date.now()}-3`,
      title: 'Fix Bug #3-7: Exposer 5 fonctions modals',
      description: 'Exposer showKPIDetails, showMethodologyDetails, closeInfoPanel, zoomCompanyTree, resetCompanyTreeZoom',
      type: 'bugfix',
      priority: 'major',
      file: 'public/index.html',
      estimatedTime: '5 minutes',
      assignedTo: 'Agent Dev',
      createdBy: 'Bootstrap',
      createdAt: new Date().toISOString(),
      status: 'pending'
    },
    {
      id: `TASK-${Date.now()}-4`,
      title: 'Fix Bug #8: Corriger index client dans modal secteur',
      description: 'Remplacer processedData.indexOf(client) par currentDisplayedClients.findIndex(c => c.companyId === client.companyId) ligne 3634',
      type: 'bugfix',
      priority: 'major',
      file: 'public/index.html',
      line: 3634,
      estimatedTime: '5 minutes',
      assignedTo: 'Agent Dev',
      createdBy: 'Bootstrap',
      createdAt: new Date().toISOString(),
      status: 'pending'
    },
    {
      id: `TASK-${Date.now()}-5`,
      title: 'Fix Bug #9: Appeler 4 graphiques avancés',
      description: 'Ajouter renderSegmentDonutChart(), renderRadarChart(), renderStackedAreaChart(), renderHealthTrendsChart() dans renderDashboard() après ligne 1764',
      type: 'feature',
      priority: 'minor',
      file: 'public/index.html',
      line: 1764,
      estimatedTime: '2 minutes',
      assignedTo: 'Agent Dev',
      createdBy: 'Bootstrap',
      createdAt: new Date().toISOString(),
      status: 'pending'
    }
  ],
  lastUpdate: new Date().toISOString()
};

// Sauvegarder
fs.writeFileSync(tasksFile, JSON.stringify(tasks, null, 2));

console.log(`✅ ${tasks.items.length} tâches créées!\n`);

tasks.items.forEach((task, i) => {
  console.log(`${i + 1}. [${task.priority}] ${task.title}`);
  console.log(`   → ${task.description}`);
  console.log(`   → Assigné à: ${task.assignedTo}`);
  console.log(`   → Temps estimé: ${task.estimatedTime}\n`);
});

console.log('📋 Tasks sauvegardées dans:', tasksFile);
console.log('\n🚀 Prêt à lancer la boucle Dev → QA → Debug!\n');
