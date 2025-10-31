# 📊 Dashboard HubSpot - Account Management

> Dashboard professionnel pour le suivi client HubSpot avec focus sur les relations parent/filiales

[![Live Dashboard](https://img.shields.io/badge/Dashboard-Live-brightgreen)](https://13yadmin.github.io/hubspot-dashboard/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-Automated-blue)](https://github.com/13YAdmin/hubspot-dashboard/actions)

**Dashboard Live**: https://13yadmin.github.io/hubspot-dashboard/

---

## 🎯 Objectif

Dashboard opérationnel multi-profils (Account Managers, Managers, Direction) pour :
- Suivre le portefeuille clients HubSpot
- Identifier les opportunités (white spaces)
- Analyser la santé des comptes
- Visualiser les groupes parent/filiales

---

## ✨ Fonctionnalités

### KPIs Globaux
- 💰 CA Total
- 📈 CA 2025 (année en cours)
- 👥 Nombre de clients actifs
- 🎯 Ticket moyen

### Groupes Parent/Filiales
- Vue hiérarchique expand/collapse
- Agrégation automatique du CA (parent + filiales)
- Détection des relations HubSpot
- Badge nombre de filiales

### White Spaces (Opportunités)
- Détection automatique des filiales non contactées
- Calcul du potentiel estimé (5-15% du CA parent)
- Scoring de priorité (HAUTE/MOYENNE/BASSE)
- Recommandations Account Manager

### Health Scores
- Score 0-100 par client
- Visualisation par couleur (vert/orange/rouge)
- Basé sur : CA évolution, récence, engagement

### Filtres
- Par année (2022-2025, Toutes)
- Interface responsive mobile/desktop

### Modals Détaillées
- Informations client complètes
- Recommandations contextuelles
- Timeline estimée pour conversion

---

## 🏗️ Architecture

**Simple & Fiable - GitHub Pages + GitHub Actions**

```
┌─────────────────────────────────────────┐
│   GitHub Actions Workflow               │
│   (Toutes les 2 heures)                 │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Fetch HubSpot API                     │
│   - 2000+ companies                     │
│   - Relations parent/child              │
│   - Health scores                       │
│   - Calculs opportunités                │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Génération data.json                  │
│   (81 deals + companies enrichies)     │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Déploiement GitHub Pages              │
│   https://13yadmin.github.io/           │
└─────────────────────────────────────────┘
```

---

## 🚀 Démarrage Rapide

### Prérequis
- Compte GitHub avec GitHub Pages activé
- API key HubSpot (avec droits lecture)

### Configuration

1. **Cloner le repository**
```bash
git clone https://github.com/13YAdmin/hubspot-dashboard.git
cd hubspot-dashboard
```

2. **Configurer l'API key HubSpot**

Ajouter dans les secrets GitHub (`Settings > Secrets > Actions`):
```
HUBSPOT_ACCESS_TOKEN=your_token_here
```

3. **Activer GitHub Pages**

`Settings > Pages > Source: gh-pages branch`

4. **Lancer le workflow manuellement (première fois)**
```bash
gh workflow run "Fetch HubSpot Data"
```

Le dashboard sera accessible sur `https://YOUR_USERNAME.github.io/hubspot-dashboard/`

---

## 📁 Structure du Projet

```
hubspot-dashboard/
├── .github/
│   ├── workflows/
│   │   └── fetch-hubspot-data.yml    # Workflow principal (2h)
│   └── scripts/
│       ├── fetch-hubspot.js           # Script fetch HubSpot
│       └── lib/
│           ├── api.js                 # Client API + pagination
│           ├── health-score.js        # Calcul health scores
│           ├── industry-detector.js   # Détection secteurs
│           └── segment-detector.js    # Segmentation clients
├── public/
│   └── index.html                     # Dashboard (1196 lignes)
└── README.md                          # Ce fichier
```

**Total**: ~3000 lignes de code (vs 6000+ avant refonte)

---

## 🔧 Workflow GitHub Actions

Le workflow `fetch-hubspot-data.yml` s'exécute :
- ⏰ Automatiquement toutes les 2 heures
- 🔘 Manuellement via GitHub Actions
- 📌 À chaque push sur `main` (désactivé pour éviter trop d'appels API)

**Étapes du workflow**:
1. Créé les custom properties HubSpot (si première exécution)
2. Fetch toutes les données (owners, companies, deals)
3. Calcule health scores + détecte segments
4. Génère `public/data.json`
5. Push les scores vers HubSpot
6. Déploie sur GitHub Pages (`gh-pages` branch)

**Temps d'exécution**: ~10-20 minutes (selon volume de données)

---

## 📊 Données Traitées

- **Companies**: 2000+ entreprises avec relations parent/child
- **Deals**: 81 deals avec historique
- **Owners**: Account Managers assignés
- **Notes**: Toutes les notes avec analyse de sentiment
- **Engagement**: Emails, calls, meetings

---

## 🎨 Design

- **Framework**: Vanilla CSS (CSS Variables)
- **Responsive**: Mobile-first design
- **Performance**: < 3s loading time
- **Accessibilité**: Contraste, navigation clavier

**Palette de couleurs**:
- Primary: `#4F46E5` (Indigo)
- Secondary: `#10B981` (Green)
- Warning: `#F59E0B` (Amber)
- Danger: `#EF4444` (Red)

---

## 🔐 Sécurité

- ✅ API key dans GitHub Secrets (jamais exposée)
- ✅ Workflow avec permissions minimales
- ✅ Data.json ne contient pas d'infos sensibles
- ✅ Pas de backend = pas de surface d'attaque

---

## 📈 Performance

| Métrique | Valeur |
|----------|--------|
| Taille HTML | 1196 lignes |
| Chargement initial | < 3s |
| Deals affichés | 81 |
| Companies traitées | 2000+ |
| Workflow runtime | ~10-20min |
| Refresh data | Toutes les 2h |

---

## 🛠️ Développement Local

**Tester le dashboard localement**:
```bash
# Ouvrir directement dans le navigateur
open public/index.html

# Ou servir avec un serveur local
npx http-server public -p 8080
```

**Tester le fetch HubSpot**:
```bash
# Définir l'API key
export HUBSPOT_ACCESS_TOKEN="your_token"

# Lancer le script
node .github/scripts/fetch-hubspot.js
```

---

## 🐛 Debugging

### Le dashboard ne charge pas
1. Vérifier que GitHub Pages est activé sur la branche `gh-pages`
2. Vérifier que `data.json` existe sur gh-pages: `https://13yadmin.github.io/hubspot-dashboard/data.json`
3. Regarder les logs du workflow GitHub Actions

### Pas de données récentes
1. Vérifier que le workflow s'est exécuté récemment (Actions tab)
2. Vérifier les secrets GitHub (`HUBSPOT_ACCESS_TOKEN` défini)
3. Regarder les logs du workflow pour erreurs API

### Erreur API HubSpot
1. Vérifier que le token a les droits (companies, deals, owners)
2. Vérifier le rate limiting HubSpot (limite 100 req/10s)

---

## 📝 Philosophie du Projet

> **"Moins c'est mieux"**

Ce dashboard a été **reconstruit from scratch** pour éliminer la complexité inutile :

- ❌ **Abandonné**: 16 agents IA autonomes qui cassaient tout
- ❌ **Abandonné**: Workflows complexes toutes les 5 minutes
- ❌ **Abandonné**: Sur-ingénierie avec systèmes auto-évolutifs

- ✅ **Adopté**: Architecture simple et fiable
- ✅ **Adopté**: Code lisible et maintenable
- ✅ **Adopté**: Focus sur les fonctionnalités essentielles

**Résultat**: Un dashboard qui fonctionne vraiment, sans bugs, sans complexité.

---

## 🤝 Contribution

Ce projet est maintenu en interne. Pour toute question ou suggestion :
- Créer une issue sur GitHub
- Contact : [votre email]

---

## 📜 Licence

Propriétaire - Tous droits réservés

---

## 🎉 Changelog

### v2.0.0 (31 octobre 2025)
- 🔥 Reconstruction complète from scratch
- ➖ Suppression de 52,000 lignes de code obsolète
- ✨ Nouveau dashboard simplifié (1196 lignes)
- 🏗️ Architecture GitHub Pages + Actions
- 📊 Toutes fonctionnalités essentielles présentes
- 🚀 Performance optimisée

### v1.x (octobre 2025 - archived)
- Système avec 16 agents IA autonomes
- Score QA bloqué à 39/100
- Trop complexe, bugs constants
- → Abandonné et reconstruit

---

<div align="center">

**Dashboard HubSpot - Simple, Efficace, Fiable**

Made with 🤖 by [Claude Code](https://claude.com/claude-code)

[Dashboard Live](https://13yadmin.github.io/hubspot-dashboard/) • [GitHub Repo](https://github.com/13YAdmin/hubspot-dashboard)

</div>
