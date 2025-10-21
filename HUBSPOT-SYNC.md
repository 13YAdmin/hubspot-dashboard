# 🔄 Synchronisation Bidirectionnelle HubSpot

Cette fonctionnalité permet de **pusher les scores calculés** par le dashboard **vers HubSpot**, transformant le flow unidirectionnel en synchronisation bidirectionnelle.

## 📊 Données synchronisées

Les scores suivants sont calculés automatiquement et pushés vers HubSpot toutes les 2 heures :

| Custom Property | Type | Description | Exemple |
|----------------|------|-------------|---------|
| `health_score` | Number (0-100) | Score de santé client basé sur engagement, CA, notes et tendance | `85` |
| `client_segment` | Enumeration | Segment automatique : Strategic, Key Account, Growth, At Risk, Dormant | `strategic` |
| `revenue_trend` | Number (%) | Tendance du CA année-sur-année en pourcentage | `+15.3` |
| `relationship_sentiment` | Enumeration | Sentiment relationnel depuis l'analyse des notes | `excellent` |
| `last_score_update` | DateTime | Date de dernière mise à jour automatique | `2025-10-21T14:30:00Z` |

## 🎯 Avantages

### Pour l'équipe Sales
- ✅ **Filtrer dans HubSpot** : Voir tous les clients avec Health Score < 30
- ✅ **Créer des vues** : Liste des "At Risk" à contacter en priorité
- ✅ **Rapports natifs** : Utiliser les segments dans les dashboards HubSpot

### Pour les Workflows
- ✅ **Alertes automatiques** : Email si Health Score passe sous 25
- ✅ **Task auto-création** : Tâche Account Manager si segment = "At Risk"
- ✅ **Scoring leads** : Prioriser les prospects basés sur sentiment

### Pour la visibilité
- ✅ **Toute l'équipe** voit les mêmes scores (pas que le dashboard)
- ✅ **Historique** des scores dans HubSpot
- ✅ **Mobile** : Scores visibles dans l'app HubSpot mobile

## 🚀 Fonctionnement

### Workflow Automatique (toutes les 2 heures)

```
1. Fetch HubSpot Data
   ↓
2. Calcul des scores (health, segment, trend, sentiment)
   ↓
3. Push scores → HubSpot via API
   ↓
4. Génération dashboard
   ↓
5. Déploiement GitHub Pages
```

### Scripts

#### 1. `create-custom-properties.js`
- Exécuté **UNE FOIS** au premier lancement
- Crée les 5 custom properties dans HubSpot
- `continue-on-error: true` → skip si déjà créées

#### 2. `push-scores-to-hubspot.js`
- Exécuté **à chaque workflow** (toutes les 2h)
- Lit `data.json` généré par `fetch-hubspot.js`
- Agrège les données par company
- Calcule les scores
- Push via API PATCH `/crm/v3/objects/companies/{id}`
- Traitement en batch de 10 pour éviter rate limiting

## 📋 Prérequis API

Les permissions HubSpot suivantes sont **requises** :

### Read (déjà configurées)
- ✅ `crm.objects.deals.read`
- ✅ `crm.objects.companies.read`
- ✅ `crm.objects.contacts.read`
- ✅ `crm.objects.notes.read`
- ✅ `crm.associations.*.read`

### Write (nouvelles)
- ✅ `crm.objects.companies.write` ← **Pour modifier les companies**
- ✅ `crm.schemas.companies.write` ← **Pour créer les custom properties**

## 🧪 Test Manuel

### Créer les custom properties (une seule fois)
```bash
cd /Users/ilies/Documents/Tech/hubspot-dashboard-vercel
HUBSPOT_ACCESS_TOKEN=pat-eu1-xxx node .github/scripts/create-custom-properties.js
```

### Pusher les scores
```bash
# Fetch les données d'abord
HUBSPOT_ACCESS_TOKEN=pat-eu1-xxx node .github/scripts/fetch-hubspot.js

# Puis push les scores
HUBSPOT_ACCESS_TOKEN=pat-eu1-xxx node .github/scripts/push-scores-to-hubspot.js
```

## 📊 Logs de monitoring

### Création des properties
```
📝 Création de la propriété: health_score...
   ✅ Health Score créée avec succès
📝 Création de la propriété: client_segment...
   ⚠️  Client Segment existe déjà (skip)
...
✅ Configuration des custom properties terminée !
```

### Push des scores
```
📤 Mise à jour de 47 companies...
   ✅ Safran
   ✅ Airbus
   ✅ Thales
   ❌ ABC Corp: HTTP 404: Company not found
...
📊 Résumé:
   ✅ Succès: 45
   ❌ Échecs: 2
```

## 🔍 Vérification dans HubSpot

1. Va dans **Contacts → Companies**
2. Clique sur une company (ex: Safran)
3. Dans la sidebar, tu devrais voir :
   - **Health Score** : 85
   - **Client Segment** : Strategic
   - **Revenue Trend (%)** : +15.3
   - **Relationship Sentiment** : Excellent
   - **Last Score Update** : Il y a 5 minutes

4. Créer une vue filtrée :
   - **Vue 1** : Health Score < 30 (At Risk clients)
   - **Vue 2** : Client Segment = "Strategic" (VIP)
   - **Vue 3** : Revenue Trend < -10 (Declining clients)

## ⚙️ Calcul des Scores

### Health Score (0-100)
```javascript
Base: 0
+ Revenue impact (max 35pts) : CA total
+ Engagement (max 30pts) : Nombre de notes, meetings, emails
+ Recency (max 20pts) : Activité récente
+ Sentiment (max 15pts) : Analyse des notes

Pénalités:
- Aucune note : -25pts
- Sentiment négatif : -20pts
- Inactif >90j : -10pts
```

### Client Segment
- **Strategic** : CA >200k + Health >70
- **Key Account** : CA >100k + Health >50
- **Growth** : CA >50k + Tendance positive
- **At Risk** : Health <30 OU tendance <-20%
- **Dormant** : Aucune activité récente

### Revenue Trend
```javascript
trend = ((CA année N) - (CA année N-1)) / (CA année N-1) * 100
```

### Relationship Sentiment
Basé sur keywords dans les notes :
- **Positifs** : "excellent", "satisfait", "ravi", "top", "parfait"
- **Négatifs** : "problème", "mécontent", "insatisfait", "déçu", "retard"

Score net = (positifs - négatifs) + facteur engagement

## 🛠️ Troubleshooting

### Erreur "Permissions insufficient"
→ Vérifier que le token a bien `crm.objects.companies.write` et `crm.schemas.companies.write`

### Erreur "Property does not exist"
→ Lancer manuellement `create-custom-properties.js`

### Scores non mis à jour dans HubSpot
→ Vérifier les logs GitHub Actions
→ Regarder si le workflow s'est bien exécuté

### Trop d'erreurs (>50%)
→ Le script exit(1) et stoppe le déploiement
→ Vérifier les permissions et les logs

## 🎉 Résultat

Maintenant tu as **le meilleur des deux mondes** :
- 📊 **Dashboard riche** avec analyses visuelles
- 🔧 **HubSpot sync** pour workflows et équipe
- 🤖 **Automatisation** complète toutes les 2h
- 📱 **Mobile ready** via app HubSpot

---

**Dernière mise à jour** : 2025-10-21
**Version** : 1.0
