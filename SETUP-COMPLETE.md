# ✅ Setup Complet - Dashboard Account Manager

## 🎉 Ton Dashboard est EN LIGNE !

**URL du Dashboard** : https://13yadmin.github.io/hubspot-dashboard/

---

## 📊 Ce Qui a Été Configuré

### ✅ GitHub Actions
- **Workflow automatique** qui tourne toutes les 6 heures
- Récupère toutes tes données HubSpot :
  - Deals avec 17+ propriétés
  - Entreprises complètes
  - Contacts associés
  - Notes des sales (pour scoring Account Management)
  - Owners (Account Managers)
- Calcule le **score de relation** basé sur :
  - Nombre de notes
  - Qualité des notes (longueur)
  - Récence des interactions
  - Nombre de contacts associés
- Génère automatiquement `data.json` avec toutes les données enrichies
- Déploie sur **GitHub Pages** automatiquement

### ✅ GitHub Pages
- Site web public : https://13yadmin.github.io/hubspot-dashboard/
- **Mise à jour automatique** toutes les 6 heures
- Dashboard qui charge automatiquement au démarrage
- Affiche :
  - Score de relation moyen
  - Nombre de notes total
  - Timestamp de dernière mise à jour

### ✅ Sécurité
- Token HubSpot stocké dans **GitHub Secrets** (100% sécurisé)
- Jamais exposé dans le code ou les logs
- Repository public mais token privé

### ✅ Données Enrichies Account Management

**27+ colonnes de données** incluant :
- Deal classique : nom, montant, phase, pipeline, dates
- Entreprise : domaine, industrie, ville, pays, CA annuel, employés
- Contact : nom, email, titre, téléphone
- Account Manager : nom complet, email
- **Nouvelles colonnes Account Management** :
  - Score Relation (0-100)
  - Dernière Note (aperçu 200 caractères)
  - Date Dernière Note
  - Nombre de notes
  - Nombre de contacts

---

## 🚀 Comment Ça Marche

### Workflow Automatique

```
Toutes les 6 heures (automatique)
    ↓
GitHub Actions se lance
    ↓
Appelle l'API HubSpot avec ton token
    ↓
Récupère TOUT : deals, companies, contacts, notes
    ↓
Calcule les scores de relation
    ↓
Génère data.json enrichi
    ↓
Déploie sur GitHub Pages
    ↓
Ton dashboard est à jour !
```

### Quand Tu Ouvres le Dashboard

```
https://13yadmin.github.io/hubspot-dashboard/
    ↓
Page se charge automatiquement
    ↓
Lit data.json (dernière mise à jour)
    ↓
Affiche tous tes deals enrichis
    ↓
Calcule métriques, segments, tendances
    ↓
Dashboard Account Manager complet !
```

---

## 🎯 Utilisation

### 1. Ouvrir le Dashboard

Va sur : **https://13yadmin.github.io/hubspot-dashboard/**

Le dashboard se charge automatiquement avec tes dernières données HubSpot.

### 2. Forcer une Mise à Jour Manuelle

Si tu veux mettre à jour les données MAINTENANT (sans attendre les 6h) :

1. Va sur GitHub : https://github.com/13YAdmin/hubspot-dashboard/actions
2. Clique sur "Fetch HubSpot Data"
3. Clique sur "Run workflow" (bouton en haut à droite)
4. Clique sur "Run workflow" (vert)
5. Attends 1-2 minutes
6. Rafraîchis ton dashboard

### 3. Modifier la Fréquence de Mise à Jour

**Actuellement** : Toutes les 6 heures

**Pour changer** :
1. Va dans `.github/workflows/fetch-hubspot-data.yml`
2. Ligne 7 : `- cron: '0 */6 * * *'`
3. Change `*/6` :
   - `*/1` = toutes les heures
   - `*/12` = toutes les 12 heures
   - `0 9 * * *` = tous les jours à 9h
   - `0 9 * * 1` = tous les lundis à 9h

**Syntaxe cron** : `minute heure jour mois jour-semaine`

---

## 📊 Nouvelles Métriques Account Management

### Score de Relation (0-100)

Calculé automatiquement pour chaque deal :

**Points pour les notes** (max 30) :
- +5 points par note
- Max 30 points

**Points pour la récence** (max 20) :
- Note < 30 jours : +20 points
- Note < 90 jours : +10 points
- Note < 180 jours : +5 points

**Points pour la qualité** (max 20) :
- Note > 200 caractères : +20 points
- Note > 100 caractères : +10 points
- Note > 50 caractères : +5 points

**Points pour les contacts** (max 15) :
- +3 points par contact associé
- Max 15 points

**Total** : 0-100

### High-Priority Accounts

Identifiés automatiquement :
- CA > 10 000€
- Score relation > 50
- Top 20 affichés dans les métriques

---

## 🔧 Modifications Futures

### Ajouter de Nouvelles Propriétés HubSpot

Édite `.github/scripts/fetch-hubspot.js` ligne 57-74 et ajoute les propriétés :

```javascript
const deals = await fetchAllPaginated('/crm/v3/objects/deals', [
  'dealname',
  'amount',
  // ... propriétés existantes ...
  'ta_propriete_custom'  // ← Ajoute ici
]);
```

### Modifier le Dashboard

Édite `public/index.html` :
- Styles : lignes 1-680
- HTML : lignes 680-750
- JavaScript : lignes 750-1800

Puis commit et push :
```bash
git add -A
git commit -m "Update dashboard"
git push
```

Le workflow se relancera automatiquement !

---

## 📈 Métriques Disponibles

Le fichier `data.json` contient :

```json
{
  "success": true,
  "timestamp": "2025-10-19T10:26:00.000Z",
  "count": 250,
  "data": [...],  // 250 deals enrichis
  "metrics": {
    "total_deals": 250,
    "total_revenue": 1250000,
    "won_deals": 180,
    "won_revenue": 980000,
    "avg_deal_size": 5000,
    "avg_relationship_score": 68,
    "deals_with_notes": 180,
    "total_notes": 450,
    "companies_count": 120,
    "deals_by_owner": {...},
    "deals_by_pipeline": {...},
    "high_priority_accounts": [
      {
        "company": "Acme Corp",
        "amount": 50000,
        "relationshipScore": 85,
        "notesCount": 12,
        "owner": "Jean Dupont"
      },
      // ... top 20
    ]
  },
  "metadata": {
    "owners_count": 8,
    "companies_count": 120,
    "deals_count": 250,
    "notes_total": 450,
    "avg_relationship_score": 68
  }
}
```

---

## 🎓 Next Steps

### Personnaliser le Scoring

Modifie `.github/scripts/fetch-hubspot.js` fonction `calculateRelationshipScore` (ligne 225-265)

### Ajouter des Filtres

Édite `public/index.html` et ajoute des filtres dans la section "Filtres" (ligne ~700)

### Créer des Alertes

Tu peux créer des notifications (email, Slack) si certains comptes ont un score < 30 en ajoutant une étape dans le workflow.

### Export Automatique

Ajoute un step dans le workflow pour envoyer un rapport PDF par email automatiquement.

---

## 🆘 Troubleshooting

### Le dashboard ne charge pas les données

1. Vérifie que le workflow s'est bien exécuté : https://github.com/13YAdmin/hubspot-dashboard/actions
2. Vérifie que `data.json` existe sur la branche `gh-pages`
3. Lance manuellement le workflow

### Erreur "Failed to fetch"

Le fichier `data.json` n'existe pas encore. Lance le workflow manuellement.

### Les données sont anciennes

Le workflow tourne toutes les 6h. Lance-le manuellement pour forcer la mise à jour.

### Erreur dans le workflow

Vérifie les logs : https://github.com/13YAdmin/hubspot-dashboard/actions
Erreurs possibles :
- Token HubSpot expiré → Regénère-le dans HubSpot et mets à jour le secret GitHub
- Permissions insuffisantes → Vérifie les scopes de ton Private App

---

## 📞 Ressources

- **Dashboard** : https://13yadmin.github.io/hubspot-dashboard/
- **Repository** : https://github.com/13YAdmin/hubspot-dashboard
- **Actions** : https://github.com/13YAdmin/hubspot-dashboard/actions
- **Settings** : https://github.com/13YAdmin/hubspot-dashboard/settings

---

## 🎉 Résumé

✅ **Dashboard en ligne** : https://13yadmin.github.io/hubspot-dashboard/
✅ **Mise à jour automatique** : Toutes les 6 heures
✅ **Données enrichies** : Deals, companies, contacts, notes, scoring
✅ **Account Management** : Score de relation, high-priority accounts
✅ **Zéro maintenance** : Tout est automatisé
✅ **100% gratuit** : GitHub Pages + Actions

**Tu n'as RIEN à faire**, tout se met à jour automatiquement ! 🚀

Profite de ton dashboard Account Manager PRO !
