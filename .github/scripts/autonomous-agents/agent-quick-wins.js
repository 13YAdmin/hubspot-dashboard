#!/usr/bin/env node

/**
 * ⚡ AGENT QUICK WINS
 *
 * Mission: Implémenter les améliorations rapides Phase 2 pour faire monter le score
 *
 * Corrections ciblées:
 * 1. Event delegation (memory leak fix)
 * 2. Sélecteurs DOM défensifs
 * 3. Export PDF/Excel (librairies légères)
 * 4. Filtres avancés (date range, multi-select)
 * 5. Mode comparaison années
 *
 * Objectif: Score 87 → 90 (+3 points)
 * Durée: 1-2 jours max
 */

const fs = require('fs').promises;
const path = require('path');

const CORRECTIONS = {
  eventDelegation: {
    priority: 1,
    impact: '+1 point',
    description: 'Remplacer les event listeners individuels par delegation',
    file: 'public/index.html',
    search: /onclick="([^"]+)"/g,
    status: 'pending'
  },
  defensiveSelectors: {
    priority: 1,
    impact: '+1 point',
    description: 'Ajouter checks null sur tous les querySelector',
    file: 'public/index.html',
    patterns: [
      'document.querySelector',
      'document.getElementById'
    ],
    status: 'pending'
  },
  exportPDF: {
    priority: 2,
    impact: '+0.5 point',
    description: 'Ajouter export PDF avec jsPDF',
    implementation: 'Add button + jsPDF integration',
    status: 'pending'
  },
  exportExcel: {
    priority: 2,
    impact: '+0.5 point',
    description: 'Ajouter export Excel avec SheetJS',
    implementation: 'Add button + xlsx integration',
    status: 'pending'
  },
  advancedFilters: {
    priority: 3,
    impact: '+0.5 point',
    description: 'Ajouter filtres date range et multi-select',
    status: 'pending'
  }
};

class AgentQuickWins {
  constructor() {
    this.corrections = [];
    this.score = 0;
    this.report = [];
  }

  async run() {
    console.log('⚡ AGENT QUICK WINS - Démarrage');
    console.log('================================================\n');

    try {
      // 1. Analyser le fichier index.html
      await this.analyzeCode();

      // 2. Identifier les quick wins applicables
      await this.identifyQuickWins();

      // 3. Générer les patches
      await this.generatePatches();

      // 4. Générer le rapport
      await this.generateReport();

      console.log('\n✅ Agent Quick Wins terminé');
      console.log(`📊 Quick wins identifiés: ${this.corrections.length}`);

    } catch (error) {
      console.error('❌ Erreur Agent Quick Wins:', error.message);
      process.exit(1);
    }
  }

  async analyzeCode() {
    console.log('🔍 Analyse du code...\n');

    const indexPath = path.join(process.cwd(), 'public/index.html');
    const content = await fs.readFile(indexPath, 'utf-8');

    // Compter les onclick inline
    const onclickMatches = content.match(/onclick="/g);
    const onclickCount = onclickMatches ? onclickMatches.length : 0;

    // Compter les querySelector sans check
    const querySelectorMatches = content.match(/document\.querySelector[^;]+;/g);
    const querySelectorCount = querySelectorMatches ? querySelectorMatches.length : 0;

    console.log(`   📏 Taille fichier: ${content.length} caractères`);
    console.log(`   ⚠️  Onclick inline: ${onclickCount}`);
    console.log(`   ⚠️  querySelector: ${querySelectorCount}`);
    console.log(`   ℹ️  Export PDF/Excel: Non implémenté`);
    console.log(`   ℹ️  Filtres avancés: Non implémentés\n`);

    return {
      content,
      onclickCount,
      querySelectorCount
    };
  }

  async identifyQuickWins() {
    console.log('🎯 Identification quick wins...\n');

    // Tous les quick wins sont applicables
    this.corrections = Object.entries(CORRECTIONS)
      .map(([name, config]) => ({
        name,
        ...config,
        feasibility: 'high'
      }))
      .sort((a, b) => a.priority - b.priority);

    this.corrections.forEach((correction, index) => {
      console.log(`   ${index + 1}. ${correction.description}`);
      console.log(`      Priority: ${correction.priority} | Impact: ${correction.impact}`);
    });

    console.log(`\n   ✅ ${this.corrections.length} quick wins identifiés\n`);
  }

  async generatePatches() {
    console.log('🔧 Génération patches...\n');

    const patches = [];

    // Patch 1: Event delegation
    patches.push({
      name: 'Event Delegation',
      file: 'public/index.html',
      action: 'Replace inline onclick with event delegation',
      code: `
// Ajouter dans DOMContentLoaded:
document.body.addEventListener('click', (e) => {
  const target = e.target;

  // Bouton "Voir détails"
  if (target.matches('[data-action="show-details"]')) {
    const index = parseInt(target.dataset.index);
    showClientDetails(index);
  }

  // Secteurs
  if (target.matches('[data-action="show-industry"]')) {
    const industry = target.dataset.industry;
    showIndustryDetails(industry);
  }

  // Autres actions...
});
      `.trim()
    });

    // Patch 2: Defensive selectors
    patches.push({
      name: 'Defensive Selectors',
      file: 'public/index.html',
      action: 'Add null checks on all DOM queries',
      code: `
// Remplacer:
// const element = document.querySelector('.selector');
// element.style.display = 'block';

// Par:
const element = document.querySelector('.selector');
if (element) {
  element.style.display = 'block';
}
      `.trim()
    });

    // Patch 3: Export PDF
    patches.push({
      name: 'Export PDF',
      file: 'public/index.html',
      action: 'Add PDF export with jsPDF',
      code: `
<!-- Ajouter dans <head> -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>

<!-- Ajouter bouton export -->
<button onclick="exportToPDF()" class="btn-export">
  📄 Exporter PDF
</button>

<script>
function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.text('Dashboard HubSpot', 10, 10);
  doc.text('Date: ' + new Date().toLocaleDateString('fr-FR'), 10, 20);

  // Ajouter les métriques principales
  doc.text('Nombre total de clients: ' + processedData.length, 10, 30);

  doc.save('dashboard-hubspot.pdf');

  showNotification('✅ PDF exporté avec succès');
}
</script>
      `.trim()
    });

    // Patch 4: Export Excel
    patches.push({
      name: 'Export Excel',
      file: 'public/index.html',
      action: 'Add Excel export with SheetJS',
      code: `
<!-- Ajouter dans <head> -->
<script src="https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js"></script>

<!-- Ajouter bouton export -->
<button onclick="exportToExcel()" class="btn-export">
  📊 Exporter Excel
</button>

<script>
function exportToExcel() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Clients
  const wsData = processedData.map(client => ({
    'Nom': client.companyName,
    'Secteur': client.industry,
    'Score Santé': client.healthScore,
    'CA 2025': client.revenue2025,
    'Note Moyenne': client.averageNoteScore
  }));

  const ws = XLSX.utils.json_to_sheet(wsData);
  XLSX.utils.book_append_sheet(wb, ws, 'Clients');

  // Sauvegarder
  XLSX.writeFile(wb, 'dashboard-hubspot.xlsx');

  showNotification('✅ Excel exporté avec succès');
}
</script>
      `.trim()
    });

    console.log(`   ✅ ${patches.length} patches générés\n`);

    // Sauvegarder les patches
    await fs.writeFile(
      path.join(process.cwd(), 'PATCHES-QUICK-WINS.md'),
      this.formatPatches(patches),
      'utf-8'
    );

    console.log('   📝 Patches sauvegardés: PATCHES-QUICK-WINS.md\n');
  }

  formatPatches(patches) {
    let content = '# ⚡ PATCHES QUICK WINS\n\n';
    content += '**Agent**: Quick Wins\n';
    content += `**Date**: ${new Date().toLocaleString('fr-FR')}\n`;
    content += `**Objectif**: Score 87 → 90 (+3 points)\n\n`;
    content += '---\n\n';

    patches.forEach((patch, index) => {
      content += `## Patch #${index + 1}: ${patch.name}\n\n`;
      content += `**Fichier**: ${patch.file}\n`;
      content += `**Action**: ${patch.action}\n\n`;
      content += '```javascript\n';
      content += patch.code;
      content += '\n```\n\n';
      content += '---\n\n';
    });

    return content;
  }

  async generateReport() {
    const report = `# ⚡ RAPPORT AGENT QUICK WINS

**Date**: ${new Date().toLocaleString('fr-FR')}

---

## 🎯 MISSION

Implémenter les améliorations rapides Phase 2 pour augmenter le score qualité.

**Objectif**: 87 → 90 (+3 points)
**Durée estimée**: 1-2 jours

---

## 📊 QUICK WINS IDENTIFIÉS

${this.corrections.map((c, i) => `
### ${i + 1}. ${c.description}

- **Priority**: ${c.priority}
- **Impact**: ${c.impact}
- **Feasibility**: ${c.feasibility}
- **Status**: ${c.status}
`).join('\n')}

---

## 🔧 PATCHES GÉNÉRÉS

Les patches d'implémentation ont été générés dans:
**PATCHES-QUICK-WINS.md**

---

## 📈 SCORE PROJETÉ

| Métrique | Avant | Après | Amélioration |
|----------|-------|-------|--------------|
| Event delegation | Non | Oui | +1 point |
| Defensive selectors | Non | Oui | +1 point |
| Export PDF/Excel | Non | Oui | +1 point |
| **Score total** | **87** | **90** | **+3** |

---

## ⏱️ PLANNING

**Jour 1**:
- Event delegation
- Defensive selectors

**Jour 2**:
- Export PDF/Excel
- Filtres avancés
- Tests validation

---

**🤖 Généré par Agent Quick Wins**
`;

    await fs.writeFile(
      path.join(process.cwd(), 'RAPPORT-AGENT-QUICK-WINS.md'),
      report,
      'utf-8'
    );

    console.log('✅ Rapport généré: RAPPORT-AGENT-QUICK-WINS.md');
  }
}

// Exécution
if (require.main === module) {
  const agent = new AgentQuickWins();
  agent.run().catch(error => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  });
}

module.exports = AgentQuickWins;
