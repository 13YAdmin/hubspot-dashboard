#!/usr/bin/env node

/**
 * 🚨 DATA QUALITY VALIDATOR
 *
 * Ce script valide que les données générées respectent les règles critiques.
 * Il DOIT être exécuté après fetch-hubspot.js pour détecter les régressions.
 *
 * VALIDATIONS:
 * 1. White Spaces: Minimum 15 opportunités détectées
 * 2. Multi-level hierarchies: Parents avec enfants correctement traités
 * 3. Data integrity: Pas de données manquantes critiques
 *
 * Usage:
 *   node .github/scripts/validate-data-quality.js
 *
 * Exit codes:
 *   0 = Validation OK
 *   1 = Validation échouée (régression détectée)
 */

const fs = require('fs');
const path = require('path');

// Configuration des seuils critiques
const THRESHOLDS = {
  MIN_WHITE_SPACES: 15,
  MIN_DEALS: 50,
  MIN_COMPANIES: 100,
  MAX_REGRESSION_PERCENT: 20 // Alerte si perte > 20% des opportunités
};

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function validateData() {
  log('\n🔍 VALIDATION DE LA QUALITÉ DES DONNÉES\n', 'cyan');

  // 1. Charger les données
  const dataPath = path.join(__dirname, '../../public/data.json');

  if (!fs.existsSync(dataPath)) {
    log('❌ ERREUR: data.json introuvable', 'red');
    log(`   Path: ${dataPath}`, 'red');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const { data: deals, companies } = data;

  log(`📊 Données chargées:`, 'cyan');
  log(`   - Deals: ${deals.length}`);
  log(`   - Companies: ${Object.keys(companies).length}`);

  let errors = 0;
  let warnings = 0;

  // 2. Validation des données de base
  log('\n✓ Validation des données de base:', 'cyan');

  if (deals.length < THRESHOLDS.MIN_DEALS) {
    log(`   ❌ Trop peu de deals: ${deals.length} (attendu: ${THRESHOLDS.MIN_DEALS}+)`, 'red');
    errors++;
  } else {
    log(`   ✅ Deals: ${deals.length}`, 'green');
  }

  if (Object.keys(companies).length < THRESHOLDS.MIN_COMPANIES) {
    log(`   ❌ Trop peu de companies: ${Object.keys(companies).length} (attendu: ${THRESHOLDS.MIN_COMPANIES}+)`, 'red');
    errors++;
  } else {
    log(`   ✅ Companies: ${Object.keys(companies).length}`, 'green');
  }

  // 3. Validation des hiérarchies parent-enfant
  log('\n✓ Validation des hiérarchies:', 'cyan');

  const companiesWithChildren = Object.values(companies).filter(c =>
    c.childCompanyIds && c.childCompanyIds.length > 0
  );

  const companiesWithParents = Object.values(companies).filter(c =>
    c.parentCompanyIds && c.parentCompanyIds.length > 0
  );

  log(`   - Companies avec enfants: ${companiesWithChildren.length}`);
  log(`   - Companies avec parents: ${companiesWithParents.length}`);

  // 4. 🚨 VALIDATION CRITIQUE - WHITE SPACES
  log('\n🚨 VALIDATION CRITIQUE - WHITE SPACES:', 'cyan');

  // Build companyDeals map
  const companyDeals = {};
  deals.forEach(deal => {
    if (!companyDeals[deal.companyId]) {
      companyDeals[deal.companyId] = [];
    }
    companyDeals[deal.companyId].push(deal);
  });

  // Use generic white space detector module
  const { detectWhiteSpaces } = require('./lib/white-space-detector');
  const whiteSpaces = detectWhiteSpaces(companies, companyDeals);

  log(`   📊 White spaces détectés: ${whiteSpaces.length}`);

  if (whiteSpaces.length < THRESHOLDS.MIN_WHITE_SPACES) {
    log(`   ❌ RÉGRESSION CRITIQUE: Seulement ${whiteSpaces.length} white spaces (attendu: ${THRESHOLDS.MIN_WHITE_SPACES}+)`, 'red');
    log(`   ⚠️  Vérifier renderGroupsTable() ligne 1726-1738`, 'red');
    log(`   ⚠️  La condition doit être: if (hasChildren) { ... }`, 'red');
    log(`   ⚠️  PAS: if (hasChildren && !hasParent) { ... }`, 'red');
    errors++;
  } else {
    log(`   ✅ White spaces OK: ${whiteSpaces.length} opportunités`, 'green');
  }

  // Afficher quelques exemples de white spaces
  if (whiteSpaces.length > 0) {
    log('\n   Exemples de white spaces détectés:');
    whiteSpaces.slice(0, 5).forEach(ws => {
      log(`   - ${ws.companyName} (${ws.type}) → parent: ${ws.parentName}`);
    });
    if (whiteSpaces.length > 5) {
      log(`   ... et ${whiteSpaces.length - 5} autres`);
    }
  }

  // 5. Validation des champs critiques
  log('\n✓ Validation des champs critiques:', 'cyan');

  const dealsWithMissingData = deals.filter(d =>
    !d.companyName || !d.companyId || d.amount === undefined
  );

  if (dealsWithMissingData.length > 0) {
    log(`   ⚠️  ${dealsWithMissingData.length} deals avec données manquantes`, 'yellow');
    warnings++;
  } else {
    log(`   ✅ Tous les deals ont les champs requis`, 'green');
  }

  // 6. Résumé final
  log('\n' + '='.repeat(60), 'cyan');

  if (errors > 0) {
    log(`\n❌ VALIDATION ÉCHOUÉE: ${errors} erreur(s) critique(s)`, 'red');
    log('   Le déploiement devrait être bloqué.', 'red');
    process.exit(1);
  } else if (warnings > 0) {
    log(`\n⚠️  VALIDATION OK avec ${warnings} avertissement(s)`, 'yellow');
    log('   Vérifier les warnings mais déploiement autorisé.', 'yellow');
    process.exit(0);
  } else {
    log('\n✅ VALIDATION RÉUSSIE - Toutes les vérifications passées', 'green');
    log('   Les données sont de qualité et prêtes pour le déploiement.', 'green');
    process.exit(0);
  }
}

// Exécution
try {
  validateData();
} catch (error) {
  log(`\n❌ ERREUR CRITIQUE lors de la validation:`, 'red');
  log(`   ${error.message}`, 'red');
  if (error.stack) {
    log(`\n${error.stack}`, 'red');
  }
  process.exit(1);
}
