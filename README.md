# 🎯 HubSpot Dashboard - Account Manager PRO

Dashboard interactif **ultra-enrichi** pour analyser les performances commerciales directement depuis HubSpot avec cross-référencement complet des données.

🌐 **Dashboard Live**: https://13yadmin.github.io/hubspot-dashboard/

## ✨ Fonctionnalités

### 🔥 Enrichissement Automatique Complet
- ✅ **TOUTES les notes** analysées (sentiment granulaire 8 niveaux, keywords, contenu)
- ✅ **Engagement history** complet (emails, calls, meetings)
- ✅ **Score Santé SÉVÈRE** (0-100) - notation exigeante basée sur notes + engagement + CA
- ✅ **Détection de segments** discrète (affichage minimal par point de couleur)
- ✅ **Cross-référencement** total : Deals → Companies → Contacts → Notes
- ✅ **Parsing intelligent des contacts** (extraction automatique des noms depuis les notes)

### 📊 Données Enrichies (40+ Champs par Deal)

| Catégorie | Champs |
|-----------|--------|
| **Deal** | ID, Nom, Montant, Stage, Pipeline, Dates, Probabilité |
| **Entreprise** | Nom, Domaine, Industrie, CA Annuel, Effectifs, Owner |
| **Notes** | Nombre total, Longueur moyenne, Sentiment, Keywords (positif/négatif/action), Dernière note |
| **Engagement** | Emails, Calls, Meetings, Dernière activité |
| **Analysis** | Health Score (0-100), Segment, Raison du segment, Priorité |

### 🤖 Architecture Automatisée
- 📦 **GitHub Actions** : Fetch automatique des données HubSpot **toutes les 2 heures**
- 🔄 **Bouton Actualiser** : Actualisation manuelle instantanée via GitHub Actions
- 🌍 **GitHub Pages** : Hébergement gratuit et automatique
- ⚡ **Chargement direct** : Dashboard s'affiche immédiatement au démarrage
- 🏗️ **Architecture modulaire** : Code organisé en modules réutilisables

## 🚀 Installation

### 1. Fork ou Clone le projet

```bash
git clone https://github.com/13YAdmin/hubspot-dashboard.git
cd hubspot-dashboard
```

### 2. Configurer HubSpot Private App

**Créer une Private App dans HubSpot :**

1. Va dans **HubSpot** → **Settings** (⚙️) → **Integrations** → **Private Apps**
2. Clique sur **"Create a private app"**
3. Nom : `Dashboard Account Manager PRO`
4. Onglet **"Scopes"** - Coche TOUTES les permissions CRM :

**CRM (Lecture)** :
- ✅ `crm.objects.deals.read`
- ✅ `crm.objects.companies.read`
- ✅ `crm.objects.contacts.read`
- ✅ `crm.objects.owners.read`
- ✅ `crm.objects.notes.read`
- ✅ `crm.schemas.deals.read`
- ✅ `crm.schemas.companies.read`
- ✅ `crm.schemas.contacts.read`
- ✅ `crm.associations.deals.read`
- ✅ `crm.associations.companies.read`

5. Clique sur **"Create app"**
6. **COPIE LE TOKEN** (commence par `pat-...`)

### 3. Configurer GitHub Repository

#### Configurer le Secret GitHub

1. Va dans ton repo GitHub → **Settings** → **Secrets and variables** → **Actions**
2. Clique sur **"New repository secret"**
3. Nom : `HUBSPOT_ACCESS_TOKEN`
4. Valeur : Ton token HubSpot (commence par `pat-...`)
5. Clique **"Add secret"**

#### Activer GitHub Pages

1. Va dans **Settings** → **Pages**
2. Source : **Deploy from a branch**
3. Branch : **gh-pages** / **/ (root)**
4. Clique **Save**

### 4. Lancer le Premier Fetch

Le workflow GitHub Actions se lance automatiquement :
- ✅ Au premier push
- ✅ Toutes les 2 heures
- ✅ Manuellement depuis l'onglet "Actions"

Pour lancer manuellement :
1. Va dans **Actions** → **Fetch HubSpot Data**
2. Clique **"Run workflow"** → **"Run workflow"**

### 5. Accéder au Dashboard

Ton dashboard sera disponible sur :
```
https://[TON-USERNAME].github.io/hubspot-dashboard/
```

🎉 **C'est tout ! Le dashboard se met à jour automatiquement !**

## 📂 Structure du Projet

```
hubspot-dashboard/
├── 📁 .github/
│   ├── 📁 workflows/
│   │   └── fetch-hubspot-data.yml    # GitHub Actions workflow
│   └── 📁 scripts/
│       ├── fetch-hubspot.js          # Script principal d'enrichissement
│       └── 📁 lib/
│           ├── api.js                # Fonctions API HubSpot
│           ├── notes-analyzer.js     # Analyse de contenu des notes
│           ├── health-score.js       # Calcul du health score
│           └── segment-detector.js   # Détection de segments
│
├── 📁 public/
│   ├── index.html                    # Dashboard (se charge automatiquement)
│   └── data.json                     # Données générées (auto-update)
│
├── 📄 README.md                      # Documentation (ce fichier)
├── 📄 DEPLOYMENT.md                  # Guide de déploiement
├── 📄 QUICKSTART.md                  # Guide rapide
└── 📄 GIT-CHEATSHEET.md              # Aide-mémoire Git
```

## 🔧 Architecture Modulaire

Le code est organisé en modules pour faciliter la maintenance :

### `.github/scripts/lib/api.js`
Gestion des appels HubSpot API :
- `fetchHubSpot()` - Appel API générique
- `fetchAllPaginated()` - Récupération paginée
- `fetchAllNotes()` - Toutes les notes d'un objet
- `fetchEngagementHistory()` - Historique complet

### `.github/scripts/lib/notes-analyzer.js`
Analyse de contenu des notes :
- Détection de sentiment (positif/négatif/neutre)
- Extraction de keywords
- Calcul de métriques (longueur moyenne, récence)

### `.github/scripts/lib/health-score.js`
Calcul du Score Santé (0-100) - VERSION SÉVÈRE :
- **35 pts** : Notes (quantité, qualité, sentiment, récence)
- **30 pts** : Engagement (emails, calls, meetings)
- **10 pts** : Keywords d'action
- **25 pts** : CA (revenue)
- **Pénalités** : -25 si aucune note, -20 si sentiment négatif, -10 si pas récent, -5 si aucun meeting

### `.github/scripts/lib/segment-detector.js`
Détection intelligente de segments :
- **Dormant** : Pas d'activité >12 mois + no notes récentes + health<40
- **À Risque** : Sentiment négatif OU baisse CA + health<50
- **Stratégique** : CA>100k + health>70 + notes>10
- **Clé** : CA>50k + health>60
- **Régulier** : CA>10k + health>40
- **Prospect** : Nouveau ou petit client

## ⚙️ Configuration

### Actualiser les Données Manuellement

1. Clique sur le bouton **"Actualiser"** en haut à droite du dashboard
2. GitHub Actions s'ouvre dans un nouvel onglet
3. Clique sur **"Fetch HubSpot Data"** → **"Run workflow"** → **"Run workflow"** (bouton vert)
4. Attends 2-3 minutes puis rafraîchis le dashboard (Cmd+Shift+R)

### Modifier la Fréquence de Mise à Jour

Actuellement : **toutes les 2 heures** (~1080 min/mois)

Édite `.github/workflows/fetch-hubspot-data.yml` :

```yaml
on:
  schedule:
    - cron: '0 */2 * * *'  # Toutes les 2 heures (actuel)
    # - cron: '0 */1 * * *'  # Toutes les heures
    # - cron: '0 0 * * *'    # Une fois par jour à minuit
```

### Ajouter de Nouvelles Propriétés HubSpot

Édite `.github/scripts/fetch-hubspot.js` ligne 86-95 :

```javascript
const dealsData = await fetchAllPaginated('/crm/v3/objects/deals', [
  'dealname',
  'amount',
  'closedate',
  'createdate',
  'ta_propriete_custom'  // ← Ajoute ici
]);
```

## 📊 Méthodologie

### Score Santé (0-100) - VERSION SÉVÈRE
```
Score = Notes (35) + Engagement (30) + Keywords (10) + Revenue (25) + Pénalités
Base : 0 (pas de cadeau !)
```

**Détails** :
- **Notes** (35 pts max) - SÉVÈRE :
  - ≥20 notes = +15 pts / ≥10 notes = +8 pts / ≥5 notes = +4 pts / <5 notes = +1 pt
  - Longueur moyenne >300 chars = +8 pts / >150 chars = +3 pts
  - Note récente (<90 jours) = +7 pts / **sinon -10 pts** (pénalité)
  - Sentiment positif = +5 pts / **sentiment négatif = -20 pts** (grosse pénalité)
  - **Aucune note = -25 pts** (grosse pénalité)

- **Engagement** (30 pts max) - SÉVÈRE :
  - Emails : ≥20 = +6 pts / ≥10 = +3 pts / ≥5 = +1 pt
  - Calls : ≥10 = +10 pts / ≥5 = +5 pts / ≥2 = +2 pts
  - Meetings : ≥5 = +14 pts / ≥3 = +8 pts / ≥1 = +3 pts / **aucun = -5 pts** (pénalité)

- **Keywords** (10 pts max) - SÉVÈRE :
  - ≥10 mots d'action = +5 pts / ≥5 = +2 pts
  - ≥5 mentions meeting = +5 pts / ≥3 = +2 pts

- **Revenue** (25 pts max) - TRÈS SÉVÈRE :
  - ≥200k€ = +25 pts / ≥100k€ = +18 pts / ≥50k€ = +12 pts
  - ≥20k€ = +6 pts / ≥10k€ = +2 pts / **<10k€ = -5 pts** (pénalité)

### Segments

| Segment | Critères |
|---------|----------|
| **Dormant** | Inactivité >12 mois + Pas de notes récentes + Health <40 |
| **À Risque** | Sentiment négatif OU (Baisse CA + Health <50) |
| **Stratégique** | CA >100k€ + Health >70 + Notes >10 |
| **Clé** | CA >50k€ + Health >60 |
| **Régulier** | CA >10k€ + Health >40 |
| **Prospect** | Nouveau ou petit client |

## 🛠️ Développement

### Tester Localement le Script

```bash
# Créer .env.local avec ton token
echo "HUBSPOT_ACCESS_TOKEN=pat-eu1-xxx" > .env.local

# Installer Node.js si pas déjà fait
# puis :
export $(cat .env.local | xargs)
node .github/scripts/fetch-hubspot.js
```

Le fichier `public/data.json` sera généré localement.

### Modifier le Dashboard

Édite `public/index.html` - tout le HTML, CSS et JavaScript est dans ce fichier.

Le dashboard se charge automatiquement au démarrage grâce à :
```javascript
window.addEventListener('DOMContentLoaded', () => {
  loadHubSpotData();  // Charge data.json automatiquement
});
```

## 🔒 Sécurité

- ✅ Token HubSpot stocké dans GitHub Secrets (chiffré)
- ✅ Jamais exposé dans le code ou les logs
- ✅ GitHub Actions s'exécute dans un environnement isolé
- ✅ Données publiques sur GitHub Pages (pas de données sensibles)
- ✅ `.gitignore` empêche le commit du `.env.local`

## 🔧 Troubleshooting

### Workflow échoue avec "HUBSPOT_ACCESS_TOKEN non défini"
→ Vérifie que tu as bien ajouté le secret dans **Settings** → **Secrets and variables** → **Actions**

### Workflow échoue avec "HubSpot API error: 401"
→ Ton token est invalide ou expiré. Génère-en un nouveau dans HubSpot et mets à jour le secret GitHub

### Workflow échoue avec "HubSpot API error: 403"
→ Ton Private App n'a pas toutes les permissions. Vérifie les scopes dans HubSpot (surtout `notes.read` et `associations`)

### Dashboard affiche "Erreur: Impossible de charger les données"
→ Le workflow n'a pas encore généré `data.json`. Va dans **Actions** et lance le workflow manuellement

### Le dashboard affiche des données anciennes
→ Fais un hard refresh (CTRL+SHIFT+R ou CMD+SHIFT+R sur Mac) pour vider le cache du navigateur

### Les clients dormants ne sont pas détectés
→ Vérifie que le script récupère bien les notes avec `fetchAllNotes()` dans `lib/api.js`

### Les données sont trop anciennes (>2 heures)
→ Le workflow automatique tourne toutes les 2 heures. Pour des données plus fraîches :
  1. Clique sur le bouton "Actualiser" en haut à droite du dashboard
  2. Lance manuellement le workflow dans GitHub Actions
  3. Attends 2-3 minutes que le workflow se termine
  4. Rafraîchis le dashboard (Cmd+Shift+R)

## 📈 Performance

### GitHub Actions Free Tier
| Ressource | Limite Gratuite | Usage Estimé |
|-----------|----------------|--------------|
| Minutes | 2000/mois | ~1080 min/mois (54%) |
| Stockage | 500 MB | ~1-5 MB (<1%) |
| Bande passante | Illimitée | N/A |

✅ **Le plan gratuit GitHub est largement suffisant !**

### GitHub Pages
- 🌍 Hébergement gratuit
- ⚡ CDN mondial
- 📦 Limite : 1 GB de stockage
- 🔄 Limite : 100 GB/mois de bande passante

### Optimisations
- Architecture modulaire pour maintenabilité
- Pagination automatique des requêtes HubSpot
- Cache des owners pour éviter appels répétés
- Chargement automatique du dashboard (pas de bouton)

## 🎓 Pour Aller Plus Loin

### Ajouter un Nouveau Module d'Analyse

Crée un fichier dans `.github/scripts/lib/` :

```javascript
// .github/scripts/lib/mon-module.js
function monAnalyse(data) {
  // Ta logique ici
  return result;
}

module.exports = { monAnalyse };
```

Puis importe-le dans `fetch-hubspot.js` :
```javascript
const { monAnalyse } = require('./lib/mon-module');
```

### Personnaliser les Graphiques

Le dashboard utilise Chart.js - Documentation : https://www.chartjs.org/docs/

### Créer un Rapport PDF Personnalisé

Ajoute des sections dans `public/index.html` et utilise la fonction d'export PDF intégrée.

## 🤝 Support

- 📖 Guide de déploiement : `DEPLOYMENT.md`
- ⚡ Guide de démarrage : `QUICKSTART.md`
- 📚 Aide-mémoire Git : `GIT-CHEATSHEET.md`
- 🐛 Issues GitHub : https://github.com/13YAdmin/hubspot-dashboard/issues

## 📝 License

MIT

---

**Made with ❤️ for Account Managers**

🚀 Version PRO - Architecture modulaire avec enrichissement complet HubSpot
