#!/usr/bin/env node

/**
 * AGENT DEV - Développeur qui IMPLÉMENTE VRAIMENT
 *
 * MODE ACTION PAS BLABLA:
 * 1. Lit tasks.json
 * 2. Traite les tâches "pending" assignées à "Agent Dev"
 * 3. MODIFIE public/index.html
 * 4. Marque les tâches comme "completed"
 */

const fs = require('fs');
const path = require('path');

class AgentDev {
  constructor() {
    this.dashboardPath = path.join(process.cwd(), 'public/index.html');
    this.tasksPath = path.join(__dirname, '../../../.github/agents-communication/tasks.json');
    this.implemented = 0;
    this.skipped = 0;
  }

  log(message) {
    console.log(`🔧 [AGENT DEV] ${message}`);
  }

  async run() {
    this.log('DÉMARRAGE - MODE IMPLÉMENTATION RÉELLE');
    console.log('================================================\n');

    // 1. Lire les tâches
    if (!fs.existsSync(this.tasksPath)) {
      this.log('❌ tasks.json introuvable');
      return;
    }

    const tasks = JSON.parse(fs.readFileSync(this.tasksPath, 'utf8'));
    const myTasks = tasks.items.filter(t =>
      (t.assignedTo === 'Agent Dev' || t.assignedTo === 'Agent Développeur') &&
      t.status === 'pending'
    );

    if (myTasks.length === 0) {
      this.log('✅ Aucune tâche pending pour moi');
      return;
    }

    this.log(`📋 ${myTasks.length} tâches à traiter\n`);

    // 2. Charger le dashboard
    if (!fs.existsSync(this.dashboardPath)) {
      this.log('❌ public/index.html introuvable!');
      return;
    }

    let content = fs.readFileSync(this.dashboardPath, 'utf8');
    const originalContent = content;

    // 3. Implémenter chaque tâche
    for (const task of myTasks) {
      this.log(`\n🔨 TASK: ${task.title}`);
      this.log(`   Description: ${task.description}`);

      try {
        content = await this.implementTask(task, content);
        task.status = 'completed';
        task.completedAt = new Date().toISOString();
        task.completedBy = 'Agent Dev';
        this.implemented++;
        this.log(`   ✅ IMPLÉMENTÉ`);
      } catch (error) {
        this.log(`   ❌ ÉCHEC: ${error.message}`);
        this.skipped++;
      }
    }

    // 4. Sauvegarder si modifié
    if (content !== originalContent) {
      fs.writeFileSync(this.dashboardPath, content, 'utf8');
      this.log(`\n✅ ${this.implemented} fixes appliqués sur public/index.html`);
    } else {
      this.log('\nℹ️  Aucune modification nécessaire');
    }

    // 5. Sauvegarder tasks.json
    fs.writeFileSync(this.tasksPath, JSON.stringify(tasks, null, 2));
    this.log(`✅ tasks.json mis à jour (${this.implemented} completed)\n`);

    // 6. Générer rapport
    await this.generateReport();
  }

  async implementTask(task, content) {
    const title = task.title.toLowerCase();
    const desc = task.description.toLowerCase();

    // BUG #1: Exposer showClientDetails
    if (title.includes('showclientdetails')) {
      return this.exposeFunction(content, 'showClientDetails');
    }

    // BUG #2: Exposer showIndustryDetails
    if (title.includes('showindustrydetails')) {
      return this.exposeFunction(content, 'showIndustryDetails');
    }

    // BUG #3-7: Exposer 5 fonctions modals
    if (title.includes('5 fonctions') || title.includes('modals')) {
      let result = content;
      const functions = ['showKPIDetails', 'showMethodologyDetails', 'closeInfoPanel', 'zoomCompanyTree', 'resetCompanyTreeZoom'];
      for (const func of functions) {
        result = this.exposeFunction(result, func);
      }
      return result;
    }

    // BUG #8: Corriger index client modal secteur
    if (title.includes('index client') || desc.includes('currentdisplayedclients')) {
      return content.replace(
        /processedData\.indexOf\(client\)/g,
        'currentDisplayedClients.findIndex(c => c.companyId === client.companyId)'
      );
    }

    // BUG #9: Appeler 4 graphiques avancés
    if (title.includes('graphiques avancés') || title.includes('4 graphiques')) {
      const graphCalls = `
    // Graphiques avancés
    renderSegmentDonutChart();
    renderRadarChart();
    renderStackedAreaChart();
    renderHealthTrendsChart();
`;
      // Chercher renderDashboard() et ajouter après les graphiques de base
      const match = content.match(/(function renderDashboard\(\)[^}]*renderHealthScore\(\);)/s);
      if (match) {
        return content.replace(match[1], match[1] + graphCalls);
      }
    }

    // QA FIX #1: Ajouter meta viewport
    if (title.includes('viewport') || desc.includes('viewport') || desc.includes('responsive')) {
      return this.addViewportMeta(content);
    }

    // QA FIX #2: Nettoyer console.log
    if (title.includes('console') || desc.includes('console.log') || desc.includes('console.error')) {
      return this.cleanConsoleLogs(content);
    }

    // QA FIX #3: Ajouter focus indicators
    if (title.includes('focus') || desc.includes('focus indicator') || desc.includes('accessibilité')) {
      return this.addFocusIndicators(content);
    }

    // QA FIX #4: Importer Chart.js
    if (title.includes('chart.js') || desc.includes('chart.js') || desc.includes('graphiques')) {
      return this.addChartJs(content);
    }

    // QA FIX #5: Ajouter meta description
    if (title.includes('meta description') || desc.includes('seo')) {
      return this.addMetaDescription(content);
    }

    // QA FIX #6: Ajouter favicon
    if (title.includes('favicon')) {
      return this.addFavicon(content);
    }

    // Autres tâches : skip pour l'instant
    throw new Error('Type de tâche non supporté par Agent Dev simple');
  }

  exposeFunction(content, functionName) {
    const exposureCode = `window.${functionName} = ${functionName};`;

    // Si déjà exposé, skip
    if (content.includes(exposureCode)) {
      return content;
    }

    // Chercher la définition de la fonction
    const regex = new RegExp(
      `(function ${functionName}\\s*\\([^)]*\\)\\s*\\{[^}]*\\})`,'s'
    );

    const match = content.match(regex);
    if (match) {
      // Ajouter l'exposition juste après
      return content.replace(match[0], match[0] + '\n' + exposureCode);
    }

    return content;
  }

  // === MÉTHODES QA FIXES ===

  addViewportMeta(content) {
    if (content.includes('name="viewport"')) {
      return content; // Déjà présent
    }
    return content.replace(
      /(<meta charset="utf-8"\/>)/,
      '$1\n<meta name="viewport" content="width=device-width, initial-scale=1.0"/>'
    );
  }

  cleanConsoleLogs(content) {
    // Commenter tous les console.log, console.error, console.warn
    return content
      .replace(/^(\s*)console\.log\(/gm, '$1// console.log(')
      .replace(/^(\s*)console\.error\(/gm, '$1// console.error(')
      .replace(/^(\s*)console\.warn\(/gm, '$1// console.warn(');
  }

  addFocusIndicators(content) {
    if (content.includes('*:focus')) {
      return content; // Déjà présent
    }
    const focusCSS = `
/* Focus indicators for accessibility */
*:focus {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

button:focus, a:focus, input:focus, select:focus {
  outline: 3px solid var(--accent-light);
  outline-offset: 2px;
}
`;
    return content.replace(
      /(\* \{ margin: 0; padding: 0; box-sizing: border-box; \})/,
      '$1\n' + focusCSS
    );
  }

  addChartJs(content) {
    if (content.includes('chart.js') || content.includes('Chart.js')) {
      return content; // Déjà présent
    }
    return content.replace(
      /(<\/style>)/,
      '$1\n\n<!-- Chart.js for data visualization -->\n<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>'
    );
  }

  addMetaDescription(content) {
    if (content.includes('name="description"')) {
      return content; // Déjà présent
    }
    return content.replace(
      /(<meta name="viewport"[^>]*>)/,
      '$1\n<meta name="description" content="Dashboard HubSpot pour Account Managers - Visualisation des clients, KPIs et opportunités"/>'
    );
  }

  addFavicon(content) {
    if (content.includes('rel="icon"')) {
      return content; // Déjà présent
    }
    return content.replace(
      /(<\/head>)/,
      '<link rel="icon" href="data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><text y=\'.9em\' font-size=\'90\'>📊</text></svg>"/>\n$1'
    );
  }

  async generateReport() {
    const report = `# 🔧 RAPPORT AGENT DEV

**Date**: ${new Date().toLocaleString('fr-FR')}

## 📊 RÉSUMÉ

- ✅ Tâches implémentées: ${this.implemented}
- ⏭️  Tâches skipped: ${this.skipped}

## 🎯 RÉSULTAT

${this.implemented > 0 ? '✅ Code modifié sur public/index.html' : 'ℹ️  Aucune modification'}

---

🤖 Agent Dev - Mode Action
`;

    fs.writeFileSync('RAPPORT-AGENT-DEV.md', report);
  }
}

// Exécution
if (require.main === module) {
  const agent = new AgentDev();
  agent.run().catch(console.error);
}

module.exports = AgentDev;
