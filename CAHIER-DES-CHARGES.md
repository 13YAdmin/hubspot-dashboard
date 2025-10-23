# 📋 CAHIER DES CHARGES - HubSpot Dashboard Account Manager PRO

> Document généré automatiquement basé sur l'analyse complète du projet
> Date: 2025-10-23
> Version: 1.0

## 🎯 OBJECTIF GÉNÉRAL

Dashboard interactif ultra-enrichi pour analyser les performances commerciales directement depuis HubSpot avec cross-référencement complet des données et synchronisation bidirectionnelle.

**URL Live**: https://13yadmin.github.io/hubspot-dashboard/

---

## 📊 FONCTIONNALITÉS PRINCIPALES

### 1. ENRICHISSEMENT AUTOMATIQUE DES DONNÉES

#### 1.1 Analyse des Notes
- ✅ **TOUTES les notes** analysées sans limite
- ✅ **Sentiment granulaire** sur 8 niveaux (Excellent → Très mauvais)
- ✅ **Extraction de keywords** (positifs, négatifs, actions)
- ✅ **Parsing intelligent** du contenu HTML des notes
- ✅ **Détection automatique** des noms de contacts dans les notes

**Fichiers concernés**:
- `.github/scripts/lib/notes-analyzer.js`
- Fonction: `analyzeNotes()`

#### 1.2 Historique d'Engagement
- ✅ Récupération complète des **emails**
- ✅ Récupération complète des **calls**
- ✅ Récupération complète des **meetings**
- ✅ Calcul de la **dernière activité**
- ✅ Timeline des interactions

**Fichiers concernés**:
- `.github/scripts/lib/api.js`
- Fonction: `fetchEngagementHistory()`

#### 1.3 Score Santé (Health Score 0-100)
- ✅ **Calcul équilibré** basé sur 5 composantes:
  * Base: 20 points
  * Notes: 35 points (quantité, qualité, sentiment, récence)
  * Engagement: 30 points (emails, calls, meetings)
  * Keywords: 10 points (actions, meetings)
  * Revenue: 25 points (CA)
- ✅ **Pénalités** pour inactivité et sentiment négatif
- ✅ **Seuils accessibles** et équilibrés

**Fichiers concernés**:
- `.github/scripts/lib/health-score.js`
- Fonction: `calculateHealthScore()`

#### 1.4 Détection de Segments
- ✅ **6 segments automatiques**:
  * Dormant (inactivité >12 mois + health<40)
  * À Risque (sentiment négatif OU baisse CA + health<50)
  * Stratégique (CA>100k + health>70 + notes>10)
  * Clé (CA>50k + health>60)
  * Régulier (CA>10k + health>40)
  * Prospect (nouveau ou petit client)

**Fichiers concernés**:
- `.github/scripts/lib/segment-detector.js`
- Fonction: `detectSegment()`

#### 1.5 Détection Intelligente des Secteurs
- ✅ **40+ secteurs** identifiés
- ✅ **300+ keywords** EN + FR
- ✅ **84% de précision** sur tests
- ✅ **Multi-niveaux**:
  * Base entreprises connues (30+)
  * Patterns de domaine (.bank, .tech, etc.)
  * Analyse par keywords
  * Scoring intelligent
- ✅ **5 champs HubSpot** analysés:
  * industry
  * hs_industry
  * industry_category
  * business_type
  * type

**Fichiers concernés**:
- `.github/scripts/lib/industry-detector.js`
- `.github/scripts/lib/INDUSTRY-DETECTOR.md`
- Fonction: `detectIndustry()`

#### 1.6 Cross-référencement Total
- ✅ **Deals → Companies** (association automatique)
- ✅ **Companies → Contacts** (décideurs)
- ✅ **Companies → Notes** (toutes les notes)
- ✅ **Parent → Filiales** (relations hiérarchiques)
- ✅ **Mapping complet** des relations

---

### 2. GROUPES PARENT/FILIALES

#### 2.1 Détection Automatique
- ✅ Identification des **groupes parents**
- ✅ Identification des **filiales** (childCompanyIds)
- ✅ Détection des **white spaces** (filiales sans deals)
- ✅ Gestion des **entreprises standalone**

#### 2.2 Agrégation des Données
- ✅ **CA Total Groupe** = CA parent + Σ(CA filiales)
- ✅ **Health Score** = moyenne pondérée par CA
- ✅ **Segment** = priorité la plus élevée du groupe
- ✅ **Compteur filiales**

#### 2.3 Interface Expand/Collapse
- ✅ **Clic sur ligne groupe** → expand/collapse
- ✅ **Icônes ▶/▼** animées
- ✅ **Badge nombre filiales**
- ✅ **Indentation visuelle** (└─) pour hiérarchie
- ✅ **Styles différenciés**:
  * Ligne groupe: fond violet, gras, cliquable
  * Ligne enfant: fond gris, indentée
  * Ligne standalone: style normal
- ✅ **État persisté** lors du re-render
- ✅ **Event listeners** directs sur TR

**Fichiers concernés**:
- `public/index.html`
- Fonction: `processGroupedData()`
- Fonction: `toggleGroup()`
- Variable: `groupExpandedStates`

#### 2.4 Bugs Connus (À Vérifier)
- ⚠️ Doublons filiales potentiels
- ⚠️ Event listeners non fonctionnels dans certains cas
- ⚠️ État expand/collapse perdu au re-render

---

### 3. VISUALISATIONS AVANCÉES

#### 3.1 KPIs Globaux
- ✅ **CA Total** formaté avec unités (k€, M€)
- ✅ **Nombre de clients** actifs
- ✅ **Health Score moyen** de tous les comptes
- ✅ **Modal détaillée** au clic sur chaque KPI

**Fichiers concernés**:
- `public/index.html`
- Fonction: `renderKPIs()`
- Fonction: `showKPIDetails()`

#### 3.2 Graphique Évolution CA Global
- ✅ **Multi-années** (2022-2025)
- ✅ **Line chart** avec gradient
- ✅ **Tooltip interactif** au survol
- ✅ **Axe Y** avec formatage k€/M€

**Fichiers concernés**:
- `public/index.html`
- Fonction: `renderRevenueGlobalChart()`

#### 3.3 Graphique Top 10 Clients
- ✅ **Classement par CA**
- ✅ **Bar chart horizontal**
- ✅ **Health scores** affichés
- ✅ **Colors** selon segment

**Fichiers concernés**:
- `public/index.html`
- Fonction: `renderClientEvolutionChart()`

#### 3.4 Diagramme Circulaire Secteurs
- ✅ **Pie chart** des industries
- ✅ **40+ mappings EN→FR**
- ✅ **Filtres par année** (Toutes, 2022, 2023, 2024, 2025)
- ✅ **Clic sur tranche** → modal détails du secteur
- ✅ **Pourcentages** calculés automatiquement
- ✅ **Couleurs** distinctes par secteur

**Fichiers concernés**:
- `public/index.html`
- Fonction: `renderIndustryPieChart(filterYear)`
- Fonction: `showIndustryDetails(industryNameFr, filterYear)`
- Fonction: `filterIndustryChart(year)`

**Bugs Connus**:
- ⚠️ Clic sur tranches ne fonctionne pas toujours

#### 3.5 Donut Chart Segments
- ✅ **6 segments** visualisés
- ✅ **Compteurs** par segment
- ✅ **Couleurs** selon priorité

**Fichiers concernés**:
- `public/index.html`
- Fonction: `renderSegmentDonutChart()`

#### 3.6 Radar Chart
- ✅ **5 axes** (Notes, Engagement, Keywords, Sentiment, Revenue)
- ✅ **Score moyen** global

**Fichiers concernés**:
- `public/index.html`
- Fonction: `renderRadarChart()`

#### 3.7 Stacked Area Chart
- ✅ **Évolution CA** par segment
- ✅ **Multi-segments** empilés
- ✅ **Légende interactive**

**Fichiers concernés**:
- `public/index.html`
- Fonction: `renderStackedAreaChart()`

#### 3.8 Health Trends Chart
- ✅ **Évolution health scores** dans le temps
- ✅ **Line chart** multi-clients

**Fichiers concernés**:
- `public/index.html`
- Fonction: `renderHealthTrendsChart()`

---

### 4. CARTOGRAPHIE RELATIONS (ARBRE HIÉRARCHIQUE)

#### 4.1 État Actuel
- ⚠️ **Masquée par défaut** (remplacée par tableau)
- ⚠️ **Non fonctionnelle** selon STATUS-SESSION.md
- ✅ Canvas avec zoom/pan
- ✅ Détection des composantes connexes

**Fichiers concernés**:
- `public/index.html`
- Fonction: `renderCompanyTree()`
- Fonction: `initCompanyTreeZoom()`
- Fonction: `showCompanyDetails()`

**Actions Requises**:
- 🔧 À masquer ou retirer complètement
- 🔧 OU à corriger et rendre fonctionnelle

---

### 5. TABLEAU DE SEGMENTATION

#### 5.1 Colonnes Principales
- ✅ **Nom Client** (avec indicateur groupe/enfant)
- ✅ **Secteur d'Activité** (mappé EN→FR)
- ✅ **Segment** (badge coloré)
- ✅ **Health Score** (0-100)
- ✅ **CA Total** (formaté k€/M€)
- ✅ **Tendance** (%, icône ↑↓)
- ✅ **Dernière Activité** (date relative)
- ✅ **Actions** (bouton "Voir détails")

#### 5.2 Fonctionnalités
- ✅ **Tri** sur toutes les colonnes
- ✅ **Filtres par année** (2022-2025)
- ✅ **Filtres par segment** (dropdown)
- ✅ **Search bar** (nom client)
- ✅ **Pagination** (optionnelle)

#### 5.3 Hiérarchie Groupe/Filiales
- ✅ **3 types de lignes**:
  * group-row: Ligne parent cliquable
  * child-row: Ligne filiale indentée
  * standalone: Ligne normale
- ✅ **Event handling** via data-row-type
- ✅ **Expand/collapse** fonctionnel

**Fichiers concernés**:
- `public/index.html`
- Fonction: `renderSegmentationTable()`

**Bugs Connus**:
- ⚠️ Modal détails ne s'ouvre pas toujours (showClientDetails)

---

### 6. TABLEAU WHITE SPACES (OPPORTUNITÉS)

#### 6.1 Détection Automatique
- ✅ **2 types d'opportunités**:
  * Filiales mappées HubSpot sans deals (cross-sell direct)
  * Filiales dans relations parent/child jamais contactées (prospection froide)

#### 6.2 Calcul du Potentiel
- ✅ **Estimation** basée sur health score parent:
  * Health ≥70 → 15% du CA parent
  * Health ≥50 → 10% du CA parent
  * Health <50 → 5% du CA parent

#### 6.3 Scoring de Priorité
- ✅ **HAUTE**: Potentiel ≥50k€ + Health ≥70
- ✅ **MOYENNE**: Potentiel ≥20k€ OU Health ≥50
- ✅ **BASSE**: Autres cas

#### 6.4 Colonnes du Tableau
- ✅ Opportunité (nom + badge si non contactée)
- ✅ Groupe Parent
- ✅ Secteur d'Activité
- ✅ CA Parent
- ✅ Potentiel Estimé (montant + %)
- ✅ Priorité (badge coloré)
- ✅ Action (bouton cliquable)

#### 6.5 Modal Détails
- ✅ KPIs: Secteur, CA Parent, Potentiel, Priorité
- ✅ Recommandations Account Manager contextuelles
- ✅ Timeline estimée (2-3 mois HAUTE, 3-6 mois MOYENNE)
- ✅ Distinction visuelle mappé vs non contacté

**Fichiers concernés**:
- `public/index.html`
- Fonction: `renderWhiteSpaces()`
- Fonction: `renderWhiteSpacesTable()`
- Fonction: `showWhiteSpaceDetails()`

---

### 7. RECOMMANDATIONS ACCOUNT MANAGER

#### 7.1 Génération Automatique
- ✅ **Analyse par segment**:
  * Dormant → Réactivation urgente
  * À Risque → Plan de sauvetage
  * Stratégique → Consolidation
  * Clé → Développement
  * Régulier → Maintien
  * Prospect → Conversion

#### 7.2 Insights Stratégiques
- ✅ **Top 3 actions prioritaires**
- ✅ **Alertes** sur comptes critiques
- ✅ **Opportunités** identifiées

**Fichiers concernés**:
- `public/index.html`
- Fonction: `renderRecommendations()`
- Fonction: `getRecommendation()`

---

### 8. SYNCHRONISATION BIDIRECTIONNELLE HUBSPOT

#### 8.1 Custom Properties Créées
- ✅ `health_score` (Number 0-100)
- ✅ `client_segment` (Enum: strategic, key_account, growth, at_risk, dormant)
- ✅ `revenue_trend` (Number %)
- ✅ `relationship_sentiment` (Enum: excellent, good, neutral, poor, critical)
- ✅ `last_score_update` (DateTime)

#### 8.2 Scripts de Synchronisation
- ✅ **create-custom-properties.js** (exécuté 1 fois au setup)
- ✅ **push-scores-to-hubspot.js** (exécuté toutes les 2h)
- ✅ **Traitement en batch** de 10 pour éviter rate limiting
- ✅ **Logs détaillés** succès/échecs

#### 8.3 Workflow GitHub Actions
- ✅ **Toutes les 2 heures** (cron)
- ✅ **Manuel** (workflow_dispatch)
- ✅ **Push sur main** (auto)

**Fichiers concernés**:
- `.github/scripts/create-custom-properties.js`
- `.github/scripts/push-scores-to-hubspot.js`
- `.github/workflows/fetch-hubspot-data.yml`
- `HUBSPOT-SYNC.md`

---

### 9. ARCHITECTURE & AUTOMATION

#### 9.1 GitHub Actions
- ✅ **Fetch automatique** toutes les 2 heures
- ✅ **Bouton Actualiser** pour lancement manuel
- ✅ **Déploiement automatique** sur GitHub Pages
- ✅ **Gestion des permissions** (write access)

#### 9.2 Permissions HubSpot Requises
**Read**:
- ✅ crm.objects.deals.read
- ✅ crm.objects.companies.read
- ✅ crm.objects.contacts.read
- ✅ crm.objects.owners.read
- ✅ crm.objects.notes.read
- ✅ crm.schemas.*.read
- ✅ crm.associations.*.read

**Write**:
- ✅ crm.objects.companies.write
- ✅ crm.schemas.companies.write

#### 9.3 Structure Modulaire
```
.github/scripts/
├── fetch-hubspot.js          # Script principal
├── create-custom-properties.js
├── push-scores-to-hubspot.js
├── lib/
│   ├── api.js               # Fonctions API HubSpot
│   ├── notes-analyzer.js    # Analyse notes
│   ├── health-score.js      # Calcul health score
│   ├── segment-detector.js  # Détection segments
│   ├── industry-detector.js # Détection industries
│   └── industry-cache.js    # Cache performance
```

---

### 10. DONNÉES ENRICHIES (40+ CHAMPS PAR CLIENT)

#### 10.1 Deal
- ✅ ID, Nom, Montant, Stage, Pipeline
- ✅ Dates (création, clôture, modification)
- ✅ Probabilité

#### 10.2 Entreprise
- ✅ Nom, Domaine, Industrie
- ✅ CA Annuel, Effectifs
- ✅ Owner (Account Manager)
- ✅ Parent IDs, Child IDs

#### 10.3 Notes
- ✅ Nombre total
- ✅ Longueur moyenne
- ✅ Sentiment (8 niveaux)
- ✅ Keywords positifs/négatifs/actions
- ✅ Dernière note (date + contenu)

#### 10.4 Engagement
- ✅ Nombre emails
- ✅ Nombre calls
- ✅ Nombre meetings
- ✅ Dernière activité (date)

#### 10.5 Analysis
- ✅ Health Score (0-100)
- ✅ Segment
- ✅ Raison du segment
- ✅ Priorité
- ✅ Tendance CA (%)

---

## 🐛 BUGS CONNUS & PROBLÈMES IDENTIFIÉS

### Bugs Critiques
1. ❌ **showClientDetails ne fonctionne pas toujours**
   - Modal ne s'ouvre pas au clic sur lignes standalone/child
   - Logs nécessaires pour debug
   - Fichier: `public/index.html:4838`

2. ❌ **Clic sur tranches secteurs ne fait rien**
   - User feedback: "il n'y a toujours rien quand je clique sur les différentes tranches"
   - Fonction: `showIndustryDetails()` potentiellement non appelée
   - Fichier: `public/index.html:3464`

3. ⚠️ **Event listeners expand/collapse instables**
   - Plusieurs tentatives de fix (event delegation, direct listeners)
   - État actuel incertain après multiples commits
   - Fichiers: `public/index.html:1538` (toggleGroup)

### Bugs Mineurs
4. ⚠️ **Doublons filiales potentiels**
   - Fix appliqué avec système 2 passes
   - À vérifier en production
   - Fichier: `public/index.html:1327` (processGroupedData)

5. ⚠️ **Cartographie non fonctionnelle**
   - Actuellement masquée
   - Décision : retirer complètement OU corriger
   - Fichier: `public/index.html:3696` (renderCompanyTree)

6. ⚠️ **Industries parfois vides malgré mapping**
   - Fix appliqué avec 5 champs HubSpot
   - Détection auto si vide
   - À vérifier si toujours présent

### Issues de Performance
7. ⚠️ **Fichier index.html trop volumineux (6643 lignes)**
   - Difficile à maintenir
   - Suggestion : découper en modules
   - Risque de régression à chaque modification

8. ⚠️ **Re-render complet du tableau à chaque action**
   - Peut être lent avec beaucoup de données
   - Optimisation possible : virtual scrolling

---

## ✅ CRITÈRES DE VALIDATION

### Fonctionnalités à Tester
1. ✅ Chargement automatique des données au démarrage
2. ✅ KPIs affichés correctement
3. ✅ Tous les graphiques s'affichent sans erreur
4. ✅ Filtres année fonctionnent sur tous les graphiques
5. ✅ Clic sur tranches secteurs ouvre modal détails
6. ✅ Expand/collapse groupes fonctionne
7. ✅ Clic sur lignes standalone ouvre modal détails
8. ✅ Clic sur lignes enfants ouvre modal détails
9. ✅ CA total groupe = parent + filiales
10. ✅ Pas de doublons dans le tableau
11. ✅ Tri sur colonnes fonctionne
12. ✅ Filtres segment fonctionnent
13. ✅ Search bar filtre correctement
14. ✅ Tableau white spaces affiche opportunités
15. ✅ Modal white spaces avec recommandations
16. ✅ Industries mappées EN→FR correctement
17. ✅ Health scores calculés (pas tous à 0)
18. ✅ Segments détectés intelligemment
19. ✅ Recommandations Account Manager générées
20. ✅ Synchronisation HubSpot fonctionnelle
21. ✅ Workflow GitHub Actions s'exécute sans erreur
22. ✅ Déploiement GitHub Pages automatique
23. ✅ Responsive design (mobile/tablette)
24. ✅ Pas d'erreurs console JavaScript

### Tests de Non-Régression
- Après chaque correction de bug, vérifier que :
  1. Les autres fonctionnalités marchent toujours
  2. Pas de nouvelles erreurs console
  3. Performance acceptable (< 3s chargement)

---

## 🔧 AMÉLIORATIONS SUGGÉRÉES

### Court Terme
1. **Découper index.html** en modules JavaScript séparés
2. **Ajouter tests unitaires** pour fonctions critiques
3. **Optimiser re-renders** avec virtual DOM ou diff
4. **Logger toutes les erreurs** dans console

### Moyen Terme
5. **Export PDF/Excel** des tableaux
6. **Graphiques supplémentaires** (funnel, heatmap)
7. **Filtres avancés** (multi-sélection segments, CA min/max)
8. **Notifications** pour comptes à risque

### Long Terme
9. **API REST** pour accès externe
10. **Webhooks HubSpot** pour mise à jour temps réel
11. **Intelligence artificielle** pour prédictions
12. **Mobile app** native

---

## 📈 MÉTRIQUES DE QUALITÉ

### Performance
- ⏱️ Chargement initial : < 3 secondes
- ⏱️ Render tableau : < 1 seconde
- ⏱️ Workflow GitHub : < 5 minutes

### Fiabilité
- 🎯 Taux de succès API HubSpot : > 95%
- 🎯 Données synchronisées : 100%
- 🎯 Zero erreur JavaScript bloquante

### Maintenabilité
- 📝 Documentation : Complète (README, STATUS, PLAN)
- 📝 Code commenté : Fonctions principales
- 📝 Logs détaillés : Workflow + scripts

---

## 🚀 PROCHAINES ÉTAPES

1. **Audit complet** par Agent 1 (toutes fonctionnalités)
2. **Correction bugs** par Agent 2 (bugs prioritaires)
3. **Suggestions améliorations** par Agent 3 (roadmap)
4. **Tests de validation** complets
5. **Déploiement production** après validation

---

**Document vivant - À mettre à jour après chaque session de développement**
