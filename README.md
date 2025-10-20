# 🎯 HubSpot Dashboard - Account Manager PRO

Dashboard interactif **ultra-enrichi** pour analyser les performances commerciales directement depuis HubSpot avec cross-référencement complet des données.

🌐 **Dashboard Live**: https://13yadmin.github.io/hubspot-dashboard/

## ✨ Fonctionnalités

### 🔥 Enrichissement Automatique Complet
- ✅ **TOUTES les notes** analysées (sentiment granulaire 8 niveaux, keywords, contenu)
- ✅ **Engagement history** complet (emails, calls, meetings)
- ✅ **Score Santé ÉQUILIBRÉ** (0-100) - notation équilibrée basée sur notes + engagement + CA
- ✅ **Détection de segments** intelligente
- ✅ **Cross-référencement** total : Deals → Companies → Contacts → Notes
- ✅ **Parsing intelligent des contacts** (extraction automatique des noms depuis les notes)
- ✅ **🤖 Détection intelligente des secteurs d'activité** (40+ secteurs, 300+ keywords, 84% précision)

### 📊 Visualisations Avancées

| Graphique | Description |
|-----------|-------------|
| **KPIs Globaux** | CA total, nombre clients, health score moyen |
| **Évolution CA Global** | Tendance revenue multi-années |
| **Top 10 Clients** | Classement par CA avec health scores |
| **Répartition Secteurs** | Pie chart industries (40+ mappings EN→FR) |
| **Cartographie Relations** | Arbre hiérarchique groupes/filiales |
| **Recommandations** | Insights stratégiques Account Manager |

### 📈 Données Enrichies (40+ Champs par Client)

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
│   │   └── fetch-hubspot-data.yml      # GitHub Actions workflow
│   └── 📁 scripts/
│       ├── fetch-hubspot.js            # Script principal d'enrichissement
│       ├── test-detector.js            # Tests détecteur industries
│       └── 📁 lib/
│           ├── api.js                  # Fonctions API HubSpot
│           ├── notes-analyzer.js       # Analyse de contenu des notes
│           ├── health-score.js         # Calcul du health score ÉQUILIBRÉ
│           ├── segment-detector.js     # Détection de segments
│           ├── industry-detector.js    # 🤖 Détection intelligente industries
│           └── INDUSTRY-DETECTOR.md    # Documentation détecteur
│
├── 📁 public/
│   ├── index.html                      # Dashboard (se charge automatiquement)
│   └── data.json                       # Données générées (auto-update)
│
├── 📄 README.md                        # Documentation (ce fichier)
└── 📄 .env.example                     # Exemple config HubSpot token
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
- Détection de sentiment granulaire (8 niveaux)
- Extraction de keywords (positifs/négatifs/action)
- Calcul de métriques (longueur moyenne, récence)

### `.github/scripts/lib/health-score.js`
Calcul du Score Santé (0-100) - VERSION ÉQUILIBRÉE :
- **35 pts** : Notes (quantité, qualité, sentiment, récence)
- **30 pts** : Engagement (emails, calls, meetings)
- **10 pts** : Keywords d'action
- **25 pts** : CA (revenue)
- **Base 20** : Bonus de départ
- Seuils accessibles et pénalités réduites

### `.github/scripts/lib/segment-detector.js`
Détection intelligente de segments :
- **Dormant** : Pas d'activité >12 mois + no notes récentes + health<40
- **À Risque** : Sentiment négatif OU baisse CA + health<50
- **Stratégique** : CA>100k + health>70 + notes>10
- **Clé** : CA>50k + health>60
- **Régulier** : CA>10k + health>40
- **Prospect** : Nouveau ou petit client

### `.github/scripts/lib/industry-detector.js` 🤖 NOUVEAU
**Détecteur intelligent de secteurs d'activité** - Analyse automatique quand données HubSpot manquantes :

**Algorithme multi-niveaux** :
1. **Base entreprises connues** : 30+ grandes entreprises (LVMH, Microsoft, BNP, etc.)
2. **Patterns de domaine** : Extensions spécifiques (.bank, .tech, .insurance)
3. **Analyse par keywords** : 40+ secteurs, 300+ mots-clés (EN + FR)
4. **Scoring intelligent** : Match exact (+10), contient (+5), partiel (+2)
5. **Validation** : Seuil de confiance pour éviter faux positifs

**Normalisation** :
- Minuscules + suppression accents
- Stop words retirés (SA, SAS, Ltd, Group, etc.)
- Analyse combinée nom + domaine

**Exemples** :
- "LVMH" → Luxury Goods & Jewelry (entreprise connue)
- "CloudTech Platform" → Computer Software (keywords: tech, platform)
- "Digital Marketing Agency" → Marketing & Advertising (keywords)
- "ABC Company" → null (pas assez d'indices)

**Performance** : 84% de précision sur tests

**Voir documentation complète** : `.github/scripts/lib/INDUSTRY-DETECTOR.md`

## ⚙️ Configuration

### Actualiser les Données Manuellement

1. Clique sur le bouton **"Actualiser"** en haut à droite du dashboard
2. GitHub Actions s'ouvre dans un nouvel onglet
3. Clique sur **"Fetch HubSpot Data"** → **"Run workflow"** → **"Run workflow"** (bouton vert)
4. Attends 2-3 minutes puis rafraîchis le dashboard (Cmd+Shift+R)

### Modifier la Fréquence de Mise à Jour

Actuellement : **toutes les 2 heures**

Édite `.github/workflows/fetch-hubspot-data.yml` :

```yaml
on:
  schedule:
    - cron: '0 */2 * * *'  # Toutes les 2 heures (actuel)
    # - cron: '0 */1 * * *'  # Toutes les heures
    # - cron: '0 0 * * *'    # Une fois par jour à minuit
```

### Ajouter de Nouvelles Propriétés HubSpot

Édite `.github/scripts/fetch-hubspot.js` dans la section des propriétés à récupérer.

## 📊 Méthodologie

### Score Santé (0-100) - VERSION ÉQUILIBRÉE
```
Score = Base(20) + Notes(35) + Engagement(30) + Keywords(10) + Revenue(25)
```

**Détails** :
- **Base** : 20 pts (petit bonus de départ)

- **Notes** (35 pts max) - ÉQUILIBRÉ :
  - ≥15 notes = +18 pts / ≥10 notes = +12 pts / ≥5 notes = +7 pts / quelques notes = +3 pts
  - Longueur moyenne >250 chars = +7 pts / >120 chars = +4 pts
  - Note récente (<90 jours) = +5 pts / **sinon -5 pts**
  - Sentiment positif = +5 pts / **sentiment négatif = -10 pts**
  - **Aucune note = -15 pts**

- **Engagement** (30 pts max) - ÉQUILIBRÉ :
  - Emails : ≥15 = +8 pts / ≥8 = +5 pts / ≥3 = +2 pts
  - Calls : ≥8 = +11 pts / ≥4 = +7 pts / ≥1 = +3 pts
  - Meetings : ≥4 = +11 pts / ≥2 = +7 pts / ≥1 = +3 pts (pas de pénalité)

- **Keywords** (10 pts max) - ÉQUILIBRÉ :
  - ≥8 mots d'action = +5 pts / ≥4 = +3 pts
  - ≥4 mentions meeting = +5 pts / ≥2 = +3 pts

- **Revenue** (25 pts max) - ÉQUILIBRÉ :
  - ≥150k€ = +25 pts / ≥75k€ = +18 pts / ≥40k€ = +12 pts
  - ≥20k€ = +6 pts / ≥10k€ = +3 pts (pas de pénalité)

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

# Exporter le token et lancer le script
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

## 📝 License

MIT

---

**Made with ❤️ for Account Managers**

🚀 Version PRO - Architecture modulaire avec enrichissement complet HubSpot + GitHub Pages
