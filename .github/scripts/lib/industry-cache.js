/**
 * SYSTÈME DE CACHE POUR DÉTECTIONS D'INDUSTRIES
 *
 * Stocke les détections précédentes pour éviter de re-analyser
 * les mêmes entreprises à chaque run et améliorer les performances.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CACHE_FILE = path.join(__dirname, '../industry-cache.json');

// Stats de performance
let stats = {
  hits: 0,      // Trouvé dans cache
  misses: 0,    // Pas dans cache, détection nécessaire
  additions: 0  // Nouvelles détections ajoutées
};

/**
 * Génère une clé unique pour identifier une entreprise
 */
function generateCacheKey(companyName, domain = '') {
  // Normaliser pour consistance
  const normalized = `${companyName.toLowerCase().trim()}|${domain.toLowerCase().trim()}`;

  // Hash MD5 pour clé courte et unique
  return crypto.createHash('md5').update(normalized).digest('hex');
}

/**
 * Charge le cache depuis le fichier
 */
function loadCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const data = fs.readFileSync(CACHE_FILE, 'utf-8');
      const cache = JSON.parse(data);

      console.log(`📦 Cache chargé: ${Object.keys(cache.entries || {}).length} entrées`);

      return cache;
    }
  } catch (error) {
    console.warn(`⚠️  Erreur lecture cache: ${error.message}`);
  }

  // Cache vide par défaut
  return {
    version: '1.0',
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    entries: {}
  };
}

/**
 * Sauvegarde le cache dans le fichier
 */
function saveCache(cache) {
  try {
    cache.lastUpdated = new Date().toISOString();

    fs.writeFileSync(
      CACHE_FILE,
      JSON.stringify(cache, null, 2),
      'utf-8'
    );

    console.log(`💾 Cache sauvegardé: ${Object.keys(cache.entries).length} entrées`);
    return true;
  } catch (error) {
    console.error(`❌ Erreur sauvegarde cache: ${error.message}`);
    return false;
  }
}

/**
 * Récupère une détection depuis le cache
 */
function getCachedIndustry(companyName, domain = '', cache) {
  const key = generateCacheKey(companyName, domain);
  const entry = cache.entries[key];

  if (entry) {
    stats.hits++;
    console.log(`  ✓ Cache HIT: ${companyName} → ${entry.industry || 'null'}`);
    return entry.industry;
  }

  stats.misses++;
  return undefined; // Pas dans le cache
}

/**
 * Ajoute une détection au cache
 */
function setCachedIndustry(companyName, domain, industry, cache) {
  const key = generateCacheKey(companyName, domain);

  cache.entries[key] = {
    companyName: companyName,
    domain: domain,
    industry: industry,
    detectedAt: new Date().toISOString(),
    confidence: industry ? 'auto' : 'none'
  };

  stats.additions++;
  return cache;
}

/**
 * Nettoie les entrées anciennes (> 90 jours)
 */
function cleanOldEntries(cache, maxAgeDays = 90) {
  const now = new Date();
  const maxAge = maxAgeDays * 24 * 60 * 60 * 1000; // En millisecondes

  let cleaned = 0;

  for (const [key, entry] of Object.entries(cache.entries)) {
    const detectedAt = new Date(entry.detectedAt);
    const age = now - detectedAt;

    if (age > maxAge) {
      delete cache.entries[key];
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Nettoyage cache: ${cleaned} entrées anciennes supprimées`);
  }

  return cache;
}

/**
 * Récupère les statistiques de performance
 */
function getStats() {
  return {
    ...stats,
    hitRate: stats.hits + stats.misses > 0
      ? ((stats.hits / (stats.hits + stats.misses)) * 100).toFixed(1) + '%'
      : 'N/A'
  };
}

/**
 * Réinitialise les statistiques
 */
function resetStats() {
  stats = { hits: 0, misses: 0, additions: 0 };
}

/**
 * Affiche les statistiques de performance
 */
function printStats() {
  const perf = getStats();

  console.log('\n📊 PERFORMANCES CACHE:');
  console.log(`  Cache Hits:   ${perf.hits} (trouvés dans cache)`);
  console.log(`  Cache Misses: ${perf.misses} (détections nécessaires)`);
  console.log(`  Additions:    ${perf.additions} (nouvelles entrées)`);
  console.log(`  Hit Rate:     ${perf.hitRate}`);

  if (perf.hits + perf.misses > 0) {
    const timesSaved = perf.hits; // Chaque hit = 1 détection économisée
    console.log(`  ⚡ Gain:       ~${timesSaved} détections économisées`);
  }
}

/**
 * Réinitialise complètement le cache (pour tests ou régénération)
 */
function clearCache() {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      fs.unlinkSync(CACHE_FILE);
      console.log('🗑️  Cache supprimé');
      return true;
    }
  } catch (error) {
    console.error(`❌ Erreur suppression cache: ${error.message}`);
    return false;
  }

  return true;
}

/**
 * Obtient des informations sur le cache
 */
function getCacheInfo() {
  if (!fs.existsSync(CACHE_FILE)) {
    return { exists: false, entries: 0, size: 0 };
  }

  try {
    const data = fs.readFileSync(CACHE_FILE, 'utf-8');
    const cache = JSON.parse(data);
    const fileStats = fs.statSync(CACHE_FILE);

    return {
      exists: true,
      entries: Object.keys(cache.entries || {}).length,
      size: fileStats.size,
      createdAt: cache.createdAt,
      lastUpdated: cache.lastUpdated,
      version: cache.version
    };
  } catch (error) {
    return { exists: true, error: error.message };
  }
}

module.exports = {
  loadCache,
  saveCache,
  getCachedIndustry,
  setCachedIndustry,
  cleanOldEntries,
  getStats,
  resetStats,
  printStats,
  clearCache,
  getCacheInfo,
  generateCacheKey
};
