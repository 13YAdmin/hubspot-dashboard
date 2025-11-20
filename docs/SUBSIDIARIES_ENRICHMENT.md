# 🔍 Système d'Enrichissement des Filiales

Découverte automatique des filiales de vos clients via l'API Pappers.fr pour identifier de nouvelles opportunités commerciales.

## 📋 Vue d'ensemble

Ce système identifie automatiquement les **filiales non présentes dans HubSpot** de vos clients actifs, pour maximiser vos opportunités de cross-sell et d'expansion compte.

### Fonctionnement

```
1. 📊 Récupération des clients actifs (avec deals)
   ↓
2. 🔍 Interrogation API Pappers.fr pour chaque SIREN
   ↓
3. 🎯 Filtrage des filiales déjà dans HubSpot
   ↓
4. 📈 Scoring de priorité (0-100 points)
   ↓
5. 📄 Génération CSV pour validation manuelle
   ↓
6. ✅ Import manuel dans HubSpot après validation
```

## 🎯 Résultats attendus

D'après notre analyse actuelle:
- **42 clients actifs** avec deals dans HubSpot
- **Estimation: 150-300 nouvelles filiales** à découvrir
- **Potentiel commercial**: Plusieurs millions d'euros d'opportunités

### Exemples de découvertes attendues

Pour LVMH (1.8M€ de CA):
- Louis Vuitton Malletier
- Sephora
- CEVA Logistics
- Parfums Christian Dior
- Bulgari Horlogerie

Pour Sanofi (1.9M€ de CA):
- Genzyme
- Sanofi Pasteur
- Sanofi-Aventis
- Sanofi-Synthelabo

## 🚀 Utilisation

### 1. Prérequis

Le système est déjà configuré avec:
- ✅ Token Pappers API (`PAPPERS_API_TOKEN` dans GitHub Secrets)
- ✅ Token HubSpot (`HUBSPOT_ACCESS_TOKEN` déjà configuré)
- ✅ Workflow GitHub Actions automatique

### 2. Exécution manuelle

Depuis GitHub:
1. Aller dans **Actions**
2. Sélectionner **Enrich Subsidiaries**
3. Cliquer sur **Run workflow** → **Run workflow**

Le workflow s'exécute aussi automatiquement **le 1er de chaque mois à 9h UTC**.

### 3. Récupération du CSV

Une fois le workflow terminé:
1. Ouvrir le run dans **Actions**
2. Descendre jusqu'à **Artifacts**
3. Télécharger `subsidiaries-csv-{run_number}`
4. Ouvrir le fichier CSV dans Excel/Google Sheets

### 4. Validation des opportunités

Le CSV contient 15 colonnes:

| Colonne | Description |
|---------|-------------|
| **Priorité** | HAUTE / MOYENNE / BASSE |
| **Score** | Score 0-100 calculé automatiquement |
| **Nom Filiale** | Raison sociale de la filiale |
| **SIREN** | Numéro SIREN (identifiant unique) |
| **Domaine** | Site web de la filiale (si disponible) |
| **Secteur** | Code NAF et libellé d'activité |
| **Ville** | Localisation |
| **Effectif** | Nombre d'employés |
| **CA Filiale** | Chiffre d'affaires annuel |
| **Année Création** | Date de création |
| **Parent** | Nom du client parent dans HubSpot |
| **CA Parent** | CA total du parent avec vous |
| **Valeur Estimée** | Estimation du deal potentiel |
| **Facteurs Scoring** | Détail du calcul du score |
| **Parent ID (HubSpot)** | ID HubSpot du parent |

**Recommandations de validation:**
- ✅ **Priorités HAUTE**: Contacter rapidement
- ⚠️ **Priorités MOYENNE**: Inclure dans campagne nurturing
- ℹ️ **Priorités BASSE**: Garder en veille

### 5. Import dans HubSpot

Deux options pour importer les filiales validées:

#### Option A: Import CSV natif HubSpot (recommandé)

1. Dans HubSpot, aller dans **Contacts** → **Companies**
2. Cliquer sur **Import**
3. Sélectionner **Import from file**
4. Mapper les colonnes:
   - `Nom Filiale` → `Company name`
   - `Domaine` → `Company domain name`
   - `SIREN` → Custom property `siren`
   - `Ville` → `City`
   - `Secteur` → `Industry`
5. **Important**: Dans les options avancées:
   - Cocher **Create associations**
   - Associer via `Parent ID (HubSpot)` comme **Parent Company**

#### Option B: Script d'import automatique (TODO)

Un script `import-subsidiaries.js` pourrait être créé pour:
- Lire le CSV validé
- Créer les companies via API HubSpot
- Établir automatiquement les associations parent/enfant

## 📊 Système de Scoring

Le score de priorité (0-100) est calculé selon 5 facteurs:

### 1. CA du parent (40 points max)
- > 1M€: 40 points
- 500k-1M€: 30 points
- 200k-500k€: 20 points
- 100k-200k€: 10 points
- < 100k€: 5 points

### 2. Taille de la filiale (30 points max)
**Effectif:**
- ≥ 500: +15 pts
- ≥ 100: +10 pts
- ≥ 50: +7 pts
- ≥ 10: +5 pts

**CA propre:**
- > 10M€: +15 pts
- 5-10M€: +10 pts
- 1-5M€: +7 pts
- 500k-1M€: +5 pts

### 3. Secteur d'activité (20 points max)
**Secteurs prioritaires (20 pts):**
- Services IT et consulting
- Tech, digital, innovation
- Marketing, publicité
- Ingénierie

**Secteurs intéressants (10 pts):**
- Services aux entreprises
- Activités administratives

### 4. Présence web (10 points max)
- Site web présent: +10 pts

### 5. Bonuses (20 points max)
- Société récente (< 3 ans): +5 pts
- Forte détention par parent (> 80%): +5 pts
- Île-de-France: +5 pts
- Mots-clés stratégiques dans nom: +5 pts

### Seuils de priorité
- **HAUTE**: Score ≥ 70
- **MOYENNE**: Score 40-69
- **BASSE**: Score < 40

## 🔧 Architecture technique

### Fichiers créés

```
.github/
├── workflows/
│   └── enrich-subsidiaries.yml      # Workflow GitHub Actions
└── scripts/
    ├── enrich-subsidiaries.js       # Script principal
    └── lib/
        ├── pappers-api.js           # Client API Pappers
        └── subsidiary-scorer.js     # Calcul des scores

public/
└── subsidiaries_YYYY-MM-DD.csv      # CSV généré

docs/
└── SUBSIDIARIES_ENRICHMENT.md       # Cette documentation
```

### Workflow automatique

**Déclencheurs:**
- Manuel via GitHub Actions
- Automatique: 1er du mois à 9h UTC

**Durée estimée:** 10-20 minutes pour 42 clients

**Rate limiting respecté:**
- Pappers: 10 req/s (plan Pro)
- HubSpot: 100 req/10s

### API Pappers.fr

**Abonnement:** Plan Pro à 49€/mois
- 500 requêtes/mois
- 10 requêtes/seconde
- Accès API entreprise avec filiales

**Endpoints utilisés:**
```
GET /v2/entreprise?siren={siren}&api_token={token}
```

**Données retournées:**
- Liste des filiales avec SIREN
- Raison sociale, forme juridique
- Effectif, CA, secteur d'activité
- Adresse, site web
- Pourcentage de détention

## 📈 Suivi et métriques

### Métriques clés à suivre

1. **Taux de découverte**
   - Nombre de filiales trouvées / Nombre de clients interrogés
   - Objectif: > 3 filiales/client en moyenne

2. **Taux de conversion validation**
   - Filiales validées pour import / Total découvert
   - Objectif: > 60% des priorités HAUTE validées

3. **Taux de conversion deals**
   - Deals créés depuis filiales importées
   - Objectif: > 20% dans les 6 mois

4. **Valeur générée**
   - CA total des deals issus de filiales
   - Objectif: > 500k€ dans l'année

### Rapports disponibles

Dans HubSpot, créer des rapports custom:
- **White spaces dashboard**: Filiales sans deals vs avec deals
- **Pipeline attribution**: Deals sourcés depuis filiales
- **ROI enrichissement**: Investissement Pappers vs CA généré

## 🐛 Troubleshooting

### Erreur "PAPPERS_API_TOKEN non défini"

**Solution:**
```bash
gh secret set PAPPERS_API_TOKEN --body "votre_token_ici"
```

### Aucune filiale découverte

**Causes possibles:**
1. Les clients n'ont pas de SIREN renseigné dans HubSpot
   - ✅ Compléter les SIRENs manuellement
2. Les filiales sont déjà toutes dans HubSpot
   - ✅ C'est une bonne nouvelle !
3. Le client n'a réellement pas de filiales
   - ℹ️ Normal pour les PME indépendantes

### Quota Pappers API dépassé

**Plan actuel:** 500 req/mois
- 42 clients = 42 requêtes
- Marge pour 11 exécutions/mois

**Si quota atteint:**
- Upgrader vers plan supérieur (120€/mois pour 1200 req)
- Ou limiter aux top 20 clients uniquement

### CSV vide ou incomplet

**Vérifications:**
1. Vérifier les logs du workflow
2. Tester en local:
   ```bash
   export HUBSPOT_ACCESS_TOKEN="..."
   export PAPPERS_API_TOKEN="..."
   node .github/scripts/enrich-subsidiaries.js
   ```

## 🎯 Optimisations futures

### Phase 2: Import automatique (TODO)

Créer un script `import-subsidiaries.js`:
- Lire le CSV validé (après review manuelle)
- Créer les companies dans HubSpot
- Établir les associations parent/enfant
- Marquer comme white spaces

### Phase 3: Enrichissement continu

- Monitoring des nouveaux deals → enrichissement auto des filiales
- Webhook Pappers pour mises à jour en temps réel
- Intelligence: prioriser selon historique de conversion

### Phase 4: Intégration dashboard

- Afficher les filiales découvertes dans le dashboard
- Compteur "X nouvelles opportunités ce mois"
- CTA direct vers Pappers pour exploration

## 📚 Références

- [Documentation API Pappers](https://www.pappers.fr/api/documentation)
- [HubSpot CRM API](https://developers.hubspot.com/docs/api/crm/companies)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)

## 💡 FAQ

**Q: Pourquoi Pappers et pas LinkedIn/scraping?**
R: Pappers fournit des données officielles (INSEE), avec API légale et fiable. LinkedIn scraping violerait les ToS.

**Q: Peut-on enrichir automatiquement sans validation?**
R: Non recommandé. La validation manuelle évite:
- Import de filiales non pertinentes
- Doublons avec nomenclatures différentes
- Filiales inactives ou liquidées

**Q: Que faire si une filiale découverte n'a pas de site web?**
R: Utiliser LinkedIn Company Search ou Google pour trouver le domaine manuellement avant import.

**Q: Les filiales sont-elles automatiquement liées au parent?**
R: Oui, si vous utilisez l'import HubSpot avec associations. Sinon, le script d'import automatique le fera.

## ✅ Checklist de mise en production

- [x] Token Pappers configuré dans GitHub Secrets
- [x] Token HubSpot configuré
- [x] Workflow créé et actif
- [x] Scripts testés
- [ ] Premier run manuel pour valider
- [ ] CSV téléchargé et reviewé
- [ ] Premier batch importé dans HubSpot
- [ ] Dashboard HubSpot pour suivi créé
- [ ] Process de validation documenté pour l'équipe

---

**Dernière mise à jour:** 2025-11-20
**Version:** 1.0
**Auteur:** Système automatisé Claude Code
