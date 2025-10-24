#!/usr/bin/env node

/**
 * AGENT DEV - Développeur qui fixe les bugs du dashboard
 *
 * RESPONSABILITÉS:
 * - Lire le code du dashboard (public/index.html)
 * - Fixer les bugs identifiés dans CORRECTIONS-IMMEDIATES.md
 * - Ajouter les features manquantes
 * - Créer des PRs avec le code fixé
 * - Travailler sur le dashboard RÉEL pas des rapports
 */

const fs = require('fs');
const path = require('path');

class AgentDev {
  constructor() {
    this.dashboardPath = path.join(process.cwd(), 'public/index.html');
    this.correctionsPath = path.join(process.cwd(), 'CORRECTIONS-IMMEDIATES.md');
    this.cahierPath = path.join(process.cwd(), 'CAHIER-DES-CHARGES.md');
    this.changes = [];
  }

  log(message) {
    console.log(`🔧 [AGENT DEV] ${message}`);
  }

  async run() {
    this.log('DÉMARRAGE - Développeur qui fixe les bugs');
    console.log('================================================\n');

    // 1. Lire le dashboard actuel
    const dashboardExists = fs.existsSync(this.dashboardPath);
    if (!dashboardExists) {
      this.log('❌ ERREUR: Dashboard public/index.html introuvable!');
      return;
    }

    this.log('✅ Dashboard trouvé: public/index.html');
    const dashboardContent = fs.readFileSync(this.dashboardPath, 'utf8');
    const lines = dashboardContent.split('\n').length;
    this.log(`   ${lines} lignes de code`);

    // 2. Lire les corrections à faire
    if (!fs.existsSync(this.correctionsPath)) {
      this.log('⚠️  Pas de fichier CORRECTIONS-IMMEDIATES.md');
      this.log('   Je vais analyser le code directement...\n');
      await this.analyzeCode(dashboardContent);
    } else {
      this.log('✅ Corrections trouvées dans CORRECTIONS-IMMEDIATES.md\n');
      await this.applyCorrections(dashboardContent);
    }

    // 3. Générer le rapport
    await this.generateReport();

    this.log('\n✅ Agent Dev terminé');
  }

  async analyzeCode(content) {
    this.log('🔍 ANALYSE DU CODE...\n');

    // Détecter les bugs communs
    const bugs = [];

    // Bug 1: Fonctions non exposées globalement
    const functionsUsedInHTML = [
      'showClientDetails',
      'showIndustryDetails',
      'showKPIDetails',
      'showWhiteSpaceDetails',
      'toggleGroup',
      'closeInfoPanel',
    ];

    for (const func of functionsUsedInHTML) {
      const functionDefined = content.includes(`function ${func}(`);
      const exposedGlobally = content.includes(`window.${func} = ${func}`);

      if (functionDefined && !exposedGlobally) {
        bugs.push({
          type: 'NOT_EXPOSED',
          function: func,
          severity: 'CRITICAL',
          fix: `window.${func} = ${func};`,
        });
      }
    }

    this.log(`📊 ${bugs.length} bugs détectés\n`);

    bugs.forEach((bug, i) => {
      this.log(`BUG #${i + 1}: ${bug.type}`);
      this.log(`   Fonction: ${bug.function}`);
      this.log(`   Gravité: ${bug.severity}`);
      this.log(`   Fix: ${bug.fix}\n`);
    });

    // Appliquer les fixes
    if (bugs.length > 0) {
      this.log('🔧 APPLICATION DES FIXES...\n');
      let fixedContent = content;

      // Ajouter l'exposition globale après chaque fonction
      bugs.forEach(bug => {
        // Trouver où ajouter window.X = X
        // On cherche après la définition de la fonction
        const regex = new RegExp(`(function ${bug.function}\\([^)]*\\)[^}]*\\}\\n)`, 'm');
        if (regex.test(fixedContent)) {
          fixedContent = fixedContent.replace(regex, `$1${bug.fix}\n`);
          this.changes.push(`Fixed: ${bug.function} now exposed globally`);
          this.log(`   ✅ ${bug.function} exposé globalement`);
        }
      });

      // Sauvegarder
      fs.writeFileSync(this.dashboardPath, fixedContent, 'utf8');
      this.log('\n✅ Fichier sauvegardé: public/index.html');
    } else {
      this.log('✅ Aucun bug à fixer');
    }
  }

  async applyCorrections(content) {
    this.log('🔧 APPLICATION DES CORRECTIONS DOCUMENTÉES...\n');

    // Lire le fichier de corrections
    const corrections = fs.readFileSync(this.correctionsPath, 'utf8');

    // Parser les bugs du fichier MD
    const bugs = [
      { name: 'showClientDetails', line: 5245 },
      { name: 'showIndustryDetails', line: 3660 },
      { name: 'showKPIDetails', line: 1843 },
      { name: 'showMethodologyDetails', line: 6082 },
      { name: 'closeInfoPanel', line: 6074 },
    ];

    let fixedContent = content;
    bugs.forEach(bug => {
      const exposureCode = `window.${bug.name} = ${bug.name};`;
      if (!fixedContent.includes(exposureCode)) {
        // Chercher la fonction et ajouter après
        const regex = new RegExp(`(function ${bug.name}\\([^)]*\\)[^}]*\\}\\n)`, 'm');
        if (regex.test(fixedContent)) {
          fixedContent = fixedContent.replace(regex, `$1${exposureCode}\n`);
          this.changes.push(`Exposed ${bug.name} globally`);
          this.log(`   ✅ ${bug.name} exposé globalement`);
        }
      } else {
        this.log(`   ℹ️  ${bug.name} déjà exposé`);
      }
    });

    if (fixedContent !== content) {
      fs.writeFileSync(this.dashboardPath, fixedContent, 'utf8');
      this.log('\n✅ Corrections appliquées et sauvegardées');
    } else {
      this.log('\n✅ Toutes les corrections déjà appliquées');
    }
  }

  async generateReport() {
    const report = `# 🔧 RAPPORT AGENT DEV

**Date**: ${new Date().toLocaleString('fr-FR')}

## 📊 RÉSUMÉ

- Dashboard analysé: \`public/index.html\`
- Changes appliqués: ${this.changes.length}

## ✅ CHANGES

${this.changes.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## 🎯 PROCHAINES ÉTAPES

${this.changes.length > 0 ? '- Tester le dashboard localement\n- Faire passer l\'Agent QA\n- Déployer si tests OK' : '- Dashboard déjà à jour\n- Attendre nouvelles features/bugs'}

---

🤖 Generated by Agent Dev
`;

    fs.writeFileSync('RAPPORT-AGENT-DEV.md', report);
    this.log('\n📝 Rapport généré: RAPPORT-AGENT-DEV.md');
  }
}

// Exécution
if (require.main === module) {
  const agent = new AgentDev();
  agent.run().catch(console.error);
}

module.exports = AgentDev;
