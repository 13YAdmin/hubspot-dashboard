# 🔍 Enrichissement Local des Filiales

Version locale du système d'enrichissement - **plus rapide et plus flexible que GitHub Actions**.

## 🚀 Utilisation Rapide

```bash
# 1. Définir les tokens (une seule fois par session terminal)
export HUBSPOT_ACCESS_TOKEN="votre_token_hubspot_ici"
export PAPPERS_API_TOKEN="votre_token_pappers_ici"

# 2. Lancer l'enrichissement
./enrich-local.sh
```

## ⏱️ Durée d'exécution

- **Temps estimé** : 15-20 minutes
- **41 clients** interrogés via 3 sources chacun
- **Sources** : Pappers API + Wikipedia + Web Scraping

## 📊 Résultats

Le CSV sera généré dans :
```
public/subsidiaries_YYYY-MM-DD.csv
```

## 🎯 Avantages de la version locale

✅ **Plus rapide** : Pas d'attente GitHub Actions
✅ **Logs en temps réel** : Voir la progression directement
✅ **Débug facile** : Erreurs visibles immédiatement
✅ **Flexible** : Modifier le code et relancer instantanément
✅ **Pas de limite** : Pas de timeout GitHub (30 min)

## 🔧 Options Avancées

### Tester sur un seul client

Pour tester rapidement, modifiez temporairement le script :

```javascript
// Dans enrich-subsidiaries.js, ligne ~248
// Remplacer:
for (const company of activeCompanies) {

// Par (pour tester sur LVMH seulement):
for (const company of activeCompanies.filter(c => c.properties.name === 'LVMH')) {
```

### Activer les logs détaillés

Les logs sont déjà très verbeux, vous verrez :
- Chaque client traité
- Résultats de Pappers, Wikipedia, Web pour chaque client
- Fusion des données en temps réel
- Statistiques finales

### Exécuter seulement Pappers (rapide)

Si vous voulez juste Pappers sans Wikipedia ni Web :

```javascript
// Dans enrich-subsidiaries.js, ligne ~259
// Commentez Wikipedia et Web:
const [pappersFiliales, wikipediaFiliales, webFiliales] = await Promise.all([
  // Pappers...
  [],  // Désactiver Wikipedia
  []   // Désactiver Web
]);
```

## 📋 Colonnes du CSV généré

| Colonne | Description |
|---------|-------------|
| Priorité | HAUTE / MOYENNE / BASSE |
| Score | 0-100 (calculé automatiquement) |
| Confiance % | 50-99% selon les sources |
| Nom Filiale | Raison sociale |
| SIREN | Numéro INSEE (si trouvé) |
| Domaine | Site web |
| Secteur | Code NAF et libellé |
| Ville | Localisation |
| Effectif | Nombre d'employés |
| CA Filiale | Chiffre d'affaires |
| Parent | Nom du client parent |
| CA Parent | CA total avec vous |
| Valeur Estimée | Estimation du deal potentiel |
| Sources | Pappers / Wikipedia / Web |
| URLs Sources | URLs où la filiale a été trouvée |

## 🐛 Troubleshooting

### Erreur "HUBSPOT_ACCESS_TOKEN non défini"

```bash
export HUBSPOT_ACCESS_TOKEN="votre_token"
```

### Erreur "PAPPERS_API_TOKEN non défini"

```bash
export PAPPERS_API_TOKEN="votre_token"
```

### Erreur "node: command not found"

Installez Node.js :
```bash
brew install node
```

### Timeout sur certains sites web

Normal ! Le script continue même si certains sites sont lents ou injoignables.

### Quota Pappers dépassé

Le plan actuel permet 500 requêtes/mois. Si dépassé :
- Upgrader le plan Pappers
- Ou limiter aux top clients uniquement

## 🔄 Workflow GitHub vs Local

| Aspect | GitHub Actions | Local |
|--------|---------------|-------|
| **Vitesse** | ⏳ Attente queue | ⚡ Immédiat |
| **Logs** | ❌ Après exécution | ✅ Temps réel |
| **Débug** | ❌ Difficile | ✅ Facile |
| **Timeout** | ⚠️ 30 min max | ✅ Illimité |
| **Flexibilité** | ❌ Commit requis | ✅ Test instantané |

**Recommandation** : Utilisez la version locale ! GitHub Actions est surtout utile pour l'automatisation mensuelle.

## 💡 Astuces

### Sauvegarder vos tokens

Ajoutez à votre `~/.zshrc` (ou `~/.bashrc`) :

```bash
# HubSpot & Pappers
export HUBSPOT_ACCESS_TOKEN="pat-eu1-..."
export PAPPERS_API_TOKEN="7938b0b9..."
```

Puis rechargez :
```bash
source ~/.zshrc
```

### Exécuter en background

```bash
./enrich-local.sh > enrichment.log 2>&1 &
tail -f enrichment.log
```

### Notifier à la fin

```bash
./enrich-local.sh && osascript -e 'display notification "Enrichissement terminé !" with title "HubSpot"'
```

---

**Créé le** : 2025-11-20
**Version** : 1.0 Local
