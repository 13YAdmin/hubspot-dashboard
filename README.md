# 🎯 HubSpot Dashboard - Account Manager PRO

Dashboard interactif **ultra-enrichi** pour analyser les performances commerciales directement depuis HubSpot avec cross-référencement complet des données.

## ✨ Nouveautés Version PRO

### 🔥 Enrichissement Automatique
- ✅ **Deals** avec 17+ propriétés (montant, dates, probabilité, source...)
- ✅ **Entreprises** complètes (industrie, ville, pays, CA annuel, effectifs...)
- ✅ **Contacts** associés (décideurs avec email, titre, téléphone...)
- ✅ **Account Managers** (owners avec noms complets)
- ✅ **Métriques avancées** (par owner, pipeline, source, mois...)

### 📊 Données Disponibles (27+ Champs)
| Catégorie | Champs |
|-----------|--------|
| **Deal** | ID, Nom, Montant, Phase, Pipeline, Date création, Date fermeture, Type, Probabilité, Jours pour closer, Nombre de contacts, Nombre de notes, Source |
| **Entreprise** | Nom, Domaine, Industrie, Ville, Pays, Nombre d'employés, CA Annuel |
| **Contact** | Nom complet, Email, Titre, Téléphone |
| **Owner** | Nom AM, Email AM |

## 🚀 Fonctionnalités

### 🔌 API Endpoints

#### `GET /api/deals`
Récupère tous les deals avec enrichissement complet :
```json
{
  "success": true,
  "count": 250,
  "data": [...], // Tableau de deals enrichis
  "metrics": {
    "total_deals": 250,
    "total_revenue": 1250000,
    "won_deals": 180,
    "won_revenue": 980000,
    "avg_deal_size": 5000,
    "avg_days_to_close": 45,
    "companies_count": 120,
    "contacts_count": 340,
    "deals_by_owner": {...},
    "deals_by_pipeline": {...},
    "deals_by_source": {...}
  }
}
```

#### `GET /api/metrics`
Récupère uniquement les métriques globales (plus rapide) :
```json
{
  "success": true,
  "metrics": {
    "total_deals": 250,
    "total_revenue": 1250000,
    "deals_by_stage": {...},
    "deals_by_owner": {...},
    "deals_by_month": {...},
    "win_rate": 72.5
  }
}
```

### 📈 Analyses Stratégiques
- Chiffre d'affaires par client avec tendances
- Segmentation intelligente (Stratégique, Clé, Régulier, À Risque, Dormant)
- Scoring clients basé sur CA, tendance, récence, et engagement
- Performance par Account Manager
- ROI par source d'acquisition
- Timeline et évolution temporelle

### 🎨 Visualisations
- Graphiques interactifs (Chart.js)
- Tooltips détaillés avec drill-down
- Filtres dynamiques (année, pipeline, owner, source)
- Export PDF professionnel
- Export CSV enrichi (27+ colonnes)

## 📦 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/13YAdmin/hubspot-dashboard.git
cd hubspot-dashboard
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer HubSpot Private App

**Créer une Private App dans HubSpot avec toutes les permissions CRM :**

1. Va dans **HubSpot** → **Settings** (⚙️) → **Integrations** → **Private Apps**
2. Clique sur **"Create a private app"**
3. Nom : `Dashboard Account Manager PRO`
4. Onglet **"Scopes"** - Coche ces permissions :

**CRM (Lecture)** :
- ✅ `crm.objects.deals.read`
- ✅ `crm.objects.companies.read`
- ✅ `crm.objects.contacts.read`
- ✅ `crm.objects.owners.read`
- ✅ `crm.schemas.deals.read`
- ✅ `crm.schemas.companies.read`
- ✅ `crm.schemas.contacts.read`

5. Clique sur **"Create app"**
6. **COPIE LE TOKEN** (commence par `pat-...`)

### 4. Configurer les variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
HUBSPOT_ACCESS_TOKEN=pat-eu1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

⚠️ **Important** : Ne partage JAMAIS ce token publiquement !

### 5. Lancer en local

```bash
npm run dev
```

Ouvre http://localhost:3000

## 🌐 Déploiement sur Vercel

### Option 1 : Via GitHub (Recommandé - Déploiement Automatique)

1. **Push ton code sur GitHub** :
```bash
git add .
git commit -m "Update dashboard"
git push
```

2. **Connecte-toi à Vercel** : https://vercel.com

3. **Import Project** :
   - Clique "Add New..." → "Project"
   - Sélectionne ton repo GitHub
   - Clique "Import"

4. **Configure** :
   - Framework Preset : `Other`
   - Root Directory : `.`
   - Build Command : (laisse vide)
   - Output Directory : `public`

5. **Ajoute la variable d'environnement** :
   - Nom : `HUBSPOT_ACCESS_TOKEN`
   - Valeur : Ton token HubSpot (commence par `pat-...`)

6. **Deploy** !

🎉 **Chaque push sur GitHub redéploie automatiquement !**

### Option 2 : Via CLI Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

Puis ajoute le token dans les settings Vercel.

## 📂 Structure du Projet

```
hubspot-dashboard/
├── 📁 api/
│   ├── deals.js              # API enrichie (deals + companies + contacts + owners)
│   └── metrics.js            # API métriques rapides
│
├── 📁 public/
│   └── index.html            # Dashboard complet (HTML + CSS + JS)
│
├── 📄 README.md              # Documentation technique (ce fichier)
├── 📄 DEPLOYMENT.md          # Guide de déploiement pas à pas
├── 📄 QUICKSTART.md          # Guide de démarrage rapide
├── 📄 GIT-CHEATSHEET.md      # Aide-mémoire Git
│
├── 📄 .env.example           # Template variables d'environnement
├── 📄 .gitignore             # Fichiers à ignorer
├── 📄 package.json           # Configuration Node.js
└── 📄 vercel.json            # Configuration Vercel
```

## 🔒 Sécurité

- ✅ Le token HubSpot n'est **jamais** exposé côté client
- ✅ Toutes les requêtes API passent par les fonctions serverless Vercel
- ✅ Variables d'environnement chiffrées sur Vercel
- ✅ CORS configuré pour autoriser uniquement ton domaine
- ✅ `.gitignore` empêche de commit le `.env.local`

## 🛠️ Développement

### Modifier le dashboard

Édite `public/index.html` - tout le HTML, CSS et JavaScript est dans ce fichier.

### Modifier les fonctions API

- **`api/deals.js`** : Logique d'enrichissement des deals
- **`api/metrics.js`** : Calcul des métriques rapides

### Tester les API en local

```bash
# Lance le serveur de dev
npm run dev

# Teste les endpoints
curl http://localhost:3000/api/deals
curl http://localhost:3000/api/metrics
```

### Ajouter de nouvelles propriétés HubSpot

Édite `api/deals.js` ligne 128-148 et ajoute les propriétés dans le tableau :

```javascript
url.searchParams.append('properties', [
  'dealname',
  'amount',
  // ... propriétés existantes ...
  'ta_nouvelle_propriete_custom'  // ← Ajoute ici
].join(','));
```

## 📊 Méthodologie

### Score Client (0-100)
- **40 pts** : CA Total (1pt par 2 500€, max 40)
- **30 pts** : Tendance d'évolution (croissance/baisse)
- **20 pts** : Récence d'activité (dernier deal)
- **10 pts** : Nombre de deals

### Segments
- **Stratégique** : CA > 100k€ + croissance positive
- **Clé** : CA > 50k€ + stable
- **Régulier** : CA > 10k€
- **À Risque** : Tendance < -20%
- **Dormant** : Inactif en 2023-2024

### Tendance
Comparaison intelligente des 2 dernières années actives, ajustée par l'écart temporel et bonus de récence pour 2024.

### Métriques Enrichies
- **Deals par Owner** : Performance des Account Managers
- **Deals par Pipeline** : Répartition par année/type
- **Deals par Source** : ROI des canaux d'acquisition
- **Win Rate** : Taux de conversion global
- **Avg Days to Close** : Temps moyen de conversion

## 🔧 Troubleshooting

### Erreur : "HUBSPOT_ACCESS_TOKEN non configuré"
→ Vérifie que tu as bien ajouté la variable d'environnement dans Vercel

### Erreur : "HubSpot API error: 401"
→ Ton token est invalide ou expiré. Génère-en un nouveau dans HubSpot

### Erreur : "HubSpot API error: 403"
→ Ton Private App n'a pas toutes les permissions. Vérifie les scopes dans HubSpot

### Le bouton "Charger les Deals" ne fait rien
→ Ouvre la Console du navigateur (F12) pour voir les erreurs détaillées

### L'API est lente (> 30 secondes)
→ Normal si tu as beaucoup de deals (>500). L'enrichissement prend du temps. Utilise `/api/metrics` pour un aperçu rapide.

## 📈 Performance

### Limites Vercel Free Tier
| Ressource | Limite Gratuite | Usage Estimé |
|-----------|----------------|--------------|
| Exécutions | 100k/mois | ~5k-10k (5-10%) |
| Bande passante | 100 GB | ~1-2 GB (1-2%) |
| Temps d'exécution | 10s max | ~3-8s par call |

✅ **Le plan gratuit est largement suffisant pour un usage normal !**

### Optimisations
- Utilise `/api/metrics` pour les métriques rapides (pas d'enrichissement)
- L'API met en cache les owners pour éviter les appels répétés
- Les requêtes sont parallélisées quand possible (Promise.all)
- Limite à 5 contacts par deal pour éviter les timeouts

## 🎓 Pour Aller Plus Loin

### Ajouter des filtres personnalisés
Édite `public/index.html` et ajoute des filtres dans la section "Filtres" (ligne ~700)

### Créer de nouveaux segments
Modifie la fonction `assignSegment()` dans `public/index.html` (ligne ~1050)

### Personnaliser les graphiques
Utilise Chart.js - Documentation : https://www.chartjs.org/docs/

### Ajouter d'autres objets HubSpot
Crée de nouveaux endpoints API (ex: `api/tickets.js`, `api/products.js`)

## 🤝 Support

- 📖 Guide de déploiement : `DEPLOYMENT.md`
- ⚡ Guide de démarrage : `QUICKSTART.md`
- 📚 Aide-mémoire Git : `GIT-CHEATSHEET.md`
- 🐛 Issues GitHub : https://github.com/13YAdmin/hubspot-dashboard/issues

## 📝 License

MIT

---

**Made with ❤️ for Account Managers**

🚀 Version PRO - Enrichissement complet avec cross-référencement HubSpot
