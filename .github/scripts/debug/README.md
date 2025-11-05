# 🐛 Scripts de Debug

Scripts utilitaires pour diagnostiquer et tester le dashboard.

## Scripts Disponibles

### check-permissions.js
Vérifie les permissions de l'API token HubSpot.

```bash
export HUBSPOT_ACCESS_TOKEN="your-token"
node .github/scripts/debug/check-permissions.js
```

### debug-associations.js
Explore TOUTES les associations entre companies pour comprendre les relations parent/child.

**Usage:**
```bash
export HUBSPOT_ACCESS_TOKEN="your-token"
node .github/scripts/debug/debug-associations.js
```

**Créé pour:** Débugger le cas CEVA Logistics → CMA CGM (résolu ✓)

### debug-properties.js
Liste toutes les custom properties HubSpot disponibles.

```bash
export HUBSPOT_ACCESS_TOKEN="your-token"
node .github/scripts/debug/debug-properties.js
```

### test-detector.js
Test le détecteur d'industry avec des noms de companies.

```bash
node .github/scripts/debug/test-detector.js
```

## Notes

Ces scripts **ne sont PAS** exécutés par le workflow automatique.
Ils servent uniquement au debugging manuel.
