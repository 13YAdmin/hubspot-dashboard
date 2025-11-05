#!/usr/bin/env node

/**
 * Script de test du détecteur d'industries
 */

const { detectIndustry } = require('./lib/industry-detector');

// Cas de test
const testCases = [
  // Luxe français
  { name: 'LVMH', domain: 'lvmh.com', expected: 'Luxury Goods & Jewelry' },
  { name: 'Hermès International', domain: 'hermes.com', expected: 'Luxury Goods & Jewelry' },
  { name: 'Kering SA', domain: 'kering.com', expected: 'Luxury Goods & Jewelry' },
  { name: 'Chanel SAS', domain: 'chanel.com', expected: 'Luxury Goods & Jewelry' },

  // Tech
  { name: 'Microsoft France', domain: 'microsoft.com', expected: 'Computer Software' },
  { name: 'Acme Software Solutions', domain: 'acme-soft.com', expected: 'Computer Software' },
  { name: 'CloudTech Platform', domain: 'cloudtech.io', expected: 'Computer Software' },
  { name: 'SecureNet Cybersecurity', domain: 'securenet.com', expected: 'Computer & Network Security' },

  // Finance
  { name: 'BNP Paribas', domain: 'bnpparibas.com', expected: 'Banking' },
  { name: 'Capital Investissement Partners', domain: 'cap-invest.fr', expected: 'Venture Capital & Private Equity' },
  { name: 'AXA Assurances', domain: 'axa.fr', expected: 'Insurance' },

  // Services
  { name: 'McKinsey Consulting', domain: 'mckinsey.com', expected: 'Management Consulting' },
  { name: 'Digital Marketing Agency', domain: 'dma.com', expected: 'Marketing & Advertising' },

  // Manufacturing
  { name: 'Renault SA', domain: 'renault.com', expected: 'Automotive' },
  { name: 'Industrial Manufacturing Corp', domain: 'indmanu.com', expected: 'Manufacturing' },

  // Santé
  { name: 'Hôpital Saint-Louis', domain: 'hopital-saintlouis.fr', expected: 'Hospital & Health Care' },
  { name: 'PharmaBio Research', domain: 'pharmabio.com', expected: 'Pharmaceuticals' },

  // Difficiles (sans beaucoup d'indices)
  { name: 'ABC Company', domain: 'abc.com', expected: null },
  { name: 'Groupe XYZ', domain: 'xyz.fr', expected: null }
];

console.log('🧪 TEST DU DÉTECTEUR D\'INDUSTRIES\n');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

testCases.forEach((test, idx) => {
  console.log(`\n[Test ${idx + 1}] ${test.name} (${test.domain})`);

  const result = detectIndustry(test.name, test.domain);

  if (result === test.expected) {
    console.log(`✅ PASS - Résultat: ${result || 'null'}`);
    passed++;
  } else {
    console.log(`❌ FAIL - Attendu: ${test.expected || 'null'}, Obtenu: ${result || 'null'}`);
    failed++;
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\n📊 RÉSULTATS: ${passed}/${testCases.length} tests passés (${failed} échecs)`);

if (failed === 0) {
  console.log('🎉 Tous les tests sont passés !');
  process.exit(0);
} else {
  console.log('⚠️  Certains tests ont échoué');
  process.exit(1);
}
