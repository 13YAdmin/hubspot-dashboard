# 📊 HubSpot Dashboard - Account Manager

Dashboard interactif pour analyser les données clients HubSpot avec connexion API directe.

## 🚀 Fonctionnalités

- 📈 Analyses stratégiques des clients (CA, tendances, scoring)
- 🎯 Segmentation intelligente (Stratégique, Clé, Régulier, À Risque, Dormant)
- 📊 Graphiques interactifs avec tooltips
- 🔍 Détails clients avec calculs de score transparents
- 📥 Export HTML interactif
- 🔄 Connexion directe à l'API HubSpot (pas besoin d'export CSV)

## 📦 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/TON-USERNAME/hubspot-dashboard-vercel.git
cd hubspot-dashboard-vercel
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env.local` à la racine :

```env
HUBSPOT_ACCESS_TOKEN=ton-token-hubspot-ici
```

**Comment obtenir ton token HubSpot :**
1. Va dans HubSpot → Settings → Integrations → Private Apps
2. Créer une Private App
3. Donner les permissions : `crm.objects.deals.read` et `crm.objects.companies.read`
4. Copier le Access Token

### 4. Lancer en local

```bash
npm run dev
```

Ouvre http://localhost:3000

## 🌐 Déploiement sur Vercel

### Option 1 : Via GitHub (Recommandé)

1. Push ton code sur GitHub
2. Va sur [vercel.com](https://vercel.com)
3. Clique "New Project"
4. Importe ton repo GitHub
5. Ajoute la variable d'environnement `HUBSPOT_ACCESS_TOKEN`
6. Déploie !

### Option 2 : Via CLI Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

## 📂 Structure du Projet

```
hubspot-dashboard-vercel/
├── api/
│   ├── deals.js          # Récupère les deals HubSpot
│   └── companies.js      # Récupère les entreprises HubSpot (optionnel)
├── public/
│   └── index.html        # Dashboard principal
├── .env.local            # Variables d'environnement (local)
├── .gitignore
├── package.json
├── vercel.json           # Config Vercel
└── README.md
```

## 🔒 Sécurité

- ✅ Le token HubSpot n'est **jamais** exposé côté client
- ✅ Toutes les requêtes API passent par le backend Vercel
- ✅ Les variables d'environnement sont chiffrées sur Vercel

## 🛠️ Développement

### Modifier le dashboard

Édite `public/index.html` - tous les styles et scripts sont inclus dans le fichier.

### Modifier les fonctions API

Édite les fichiers dans `/api/` pour changer la logique de récupération des données.

### Test en local

```bash
npm run dev
```

Vercel CLI simule l'environnement de production localement.

## 📊 Méthodologie

### Score Client (0-100)
- **40 pts** : CA Total (1pt par 2 500€, max 40)
- **30 pts** : Tendance d'évolution
- **20 pts** : Récence d'activité
- **10 pts** : Nombre de deals

### Segments
- **Stratégique** : CA > 100k€ + croissance positive
- **Clé** : CA > 50k€ + stable
- **Régulier** : CA > 10k€
- **À Risque** : Tendance < -20%
- **Dormant** : Inactif 2023-2024

### Tendance
Comparaison intelligente des 2 dernières années actives, ajustée par l'écart temporel et bonus de récence.

## 🤝 Support

Pour toute question ou problème, ouvre une issue sur GitHub.

## 📝 License

MIT

---

Made with ❤️ for Account Managers
