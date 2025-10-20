# 📋 PLAN: Tableau avec Groupes Parent/Filiales Déroulants

## 🎯 OBJECTIF

Transformer le tableau pour afficher les groupes d'entreprises avec leurs filiales :
- Cliquer sur LVMH → déroule toutes les filiales (Dior, Louis Vuitton, etc.)
- CA total du groupe = CA parent + CA toutes filiales
- Interface expand/collapse intuitive

## 📊 STRUCTURE DE DONNÉES

### Données actuelles (data.json)
```javascript
{
  data: [
    {
      companyId: "123",
      companyName: "LVMH",
      companyParentIds: [],
      companyChildIds: ["456", "789"],  // IDs des filiales
      totalRevenue: 1000000,
      // ... autres champs
    },
    {
      companyId: "456",
      companyName: "Dior",
      companyParentIds: ["123"],
      companyChildIds: [],
      totalRevenue: 450000,
    }
  ],
  companies: {
    "123": { name: "LVMH", childCompanyIds: [...], ... },
    "456": { name: "Dior", ... }
  }
}
```

### Nouvelle structure traitée (après processing)
```javascript
groupedData = [
  {
    type: 'group',
    groupId: "123",
    groupName: "LVMH",
    isExpanded: false,  // État expand/collapse

    // Données du parent
    parentData: { ...deal LVMH... },
    parentRevenue: 1000000,

    // Données groupées
    totalGroupRevenue: 1450000,  // 1M parent + 450K filiales
    childrenCount: 2,
    childrenRevenue: 450000,

    // Agrégations
    healthScore: 85,  // Moyenne pondérée
    segment: "Stratégique",

    // Filiales
    children: [
      {
        type: 'child',
        companyId: "456",
        companyName: "Dior",
        totalRevenue: 450000,
        healthScore: 80,
        // ... autres champs
      },
      {
        type: 'child',
        companyId: "789",
        companyName: "Louis Vuitton",
        totalRevenue: 800000,
        // ...
      }
    ]
  },
  {
    type: 'standalone',  // Entreprise sans filiales
    companyId: "999",
    companyName: "Autre Client",
    totalRevenue: 50000,
    // ...
  }
]
```

## 🔧 IMPLÉMENTATION

### Étape 1: Processing des données
**Fichier**: `public/index.html` (fonction `processGroupedData`)

```javascript
function processGroupedData(rawData, companies) {
  const grouped = [];
  const processedCompanyIds = new Set();

  rawData.forEach(deal => {
    const companyId = deal.companyId;
    if (processedCompanyIds.has(companyId)) return;

    const company = companies[companyId];
    if (!company) return;

    // Vérifier si c'est un parent (a des filiales)
    if (company.childCompanyIds && company.childCompanyIds.length > 0) {
      // C'est un groupe
      const group = {
        type: 'group',
        groupId: companyId,
        groupName: company.name,
        isExpanded: false,
        parentData: deal,
        children: []
      };

      // Calculer CA total groupe
      let totalGroupRevenue = deal.totalRevenue || 0;

      // Récupérer les deals des filiales
      company.childCompanyIds.forEach(childId => {
        const childDeals = rawData.filter(d => d.companyId === childId);
        childDeals.forEach(childDeal => {
          totalGroupRevenue += childDeal.totalRevenue || 0;
          group.children.push({
            type: 'child',
            ...childDeal
          });
          processedCompanyIds.add(childId);
        });
      });

      group.totalGroupRevenue = totalGroupRevenue;
      group.childrenCount = group.children.length;
      grouped.push(group);
      processedCompanyIds.add(companyId);

    } else if (!company.parentCompanyIds || company.parentCompanyIds.length === 0) {
      // Entreprise standalone (pas parent, pas enfant)
      grouped.push({
        type: 'standalone',
        ...deal
      });
      processedCompanyIds.add(companyId);
    }
    // Les enfants sont déjà traités dans le groupe parent
  });

  return grouped;
}
```

### Étape 2: Affichage tableau avec expand/collapse
**Fichier**: `public/index.html` (fonction `renderTableWithGroups`)

```javascript
function renderTableWithGroups(groupedData) {
  let html = '';

  groupedData.forEach((item, index) => {
    if (item.type === 'group') {
      // Ligne parent (groupe)
      html += `
        <tr class="group-row" data-group-index="${index}" onclick="toggleGroup(${index})">
          <td>
            <span class="expand-icon">${item.isExpanded ? '▼' : '▶'}</span>
            <strong>${item.groupName}</strong>
            <span class="badge">${item.childrenCount} filiales</span>
          </td>
          <td>${item.segment}</td>
          <td>${item.healthScore}</td>
          <td><strong>${formatCurrency(item.totalGroupRevenue)}</strong></td>
          <!-- autres colonnes -->
        </tr>
      `;

      // Lignes enfants (masquées si non expanded)
      if (item.isExpanded) {
        item.children.forEach(child => {
          html += `
            <tr class="child-row" style="display: table-row;">
              <td style="padding-left: 40px;">
                <span class="child-indicator">└─</span> ${child.companyName}
              </td>
              <td>${child.segment}</td>
              <td>${child.healthScore}</td>
              <td>${formatCurrency(child.totalRevenue)}</td>
              <!-- autres colonnes -->
            </tr>
          `;
        });
      } else {
        // Enfants masqués
        item.children.forEach(child => {
          html += `
            <tr class="child-row hidden" data-parent-group="${index}" style="display: none;">
              <!-- même contenu -->
            </tr>
          `;
        });
      }

    } else {
      // Ligne standalone
      html += `
        <tr>
          <td>${item.companyName}</td>
          <td>${item.segment}</td>
          <td>${item.healthScore}</td>
          <td>${formatCurrency(item.totalRevenue)}</td>
          <!-- autres colonnes -->
        </tr>
      `;
    }
  });

  document.querySelector('#clientsTable tbody').innerHTML = html;
}
```

### Étape 3: Toggle expand/collapse
```javascript
let currentGroupedData = [];

function toggleGroup(groupIndex) {
  const group = currentGroupedData[groupIndex];
  group.isExpanded = !group.isExpanded;

  // Re-render le tableau
  renderTableWithGroups(currentGroupedData);
}
```

### Étape 4: Styles CSS
```css
.group-row {
  background: rgba(99, 102, 241, 0.1);
  font-weight: 700;
  cursor: pointer;
}

.group-row:hover {
  background: rgba(99, 102, 241, 0.2);
}

.child-row {
  background: rgba(30, 41, 59, 0.3);
}

.child-indicator {
  color: #94a3b8;
  margin-right: 8px;
}

.expand-icon {
  display: inline-block;
  width: 16px;
  margin-right: 8px;
  transition: transform 0.2s;
}

.badge {
  background: var(--accent);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  margin-left: 8px;
}
```

## 📈 CALCULS AGRÉGÉS

### CA Total Groupe
```javascript
totalGroupRevenue = parentRevenue + sum(childrenRevenue)
```

### Health Score Groupe (moyenne pondérée par CA)
```javascript
groupHealthScore = (
  (parentHealthScore * parentRevenue) +
  sum(childHealthScore * childRevenue)
) / totalGroupRevenue
```

### Segment Groupe
```javascript
// Prendre le segment le plus élevé en priorité
priority = {
  'Stratégique': 1,
  'Clé': 2,
  'Régulier': 3,
  'À Risque': 4,
  'Dormant': 5,
  'Prospect': 6
}

segment = min(parent.segment, ...children.segments)  // Par priorité
```

## ✅ TESTS À FAIRE

1. ✅ Groupes affichés correctement
2. ✅ Expand/collapse fonctionne
3. ✅ CA total = parent + filiales
4. ✅ Filiales indentées visuellement
5. ✅ Pas de doublons (enfants pas affichés seuls)
6. ✅ Tri fonctionne sur groupes
7. ✅ Filtres fonctionnent
8. ✅ Export inclut structure hiérarchique

## 🚀 DÉPLOIEMENT

1. Tester localement (ouvrir index.html)
2. Commit modifications
3. Push sur main
4. GitHub Pages se met à jour automatiquement
5. Vérifier sur https://13yadmin.github.io/hubspot-dashboard/

---

**NOTE**: La cartographie sera masquée/retirée une fois le système de tableau opérationnel.
