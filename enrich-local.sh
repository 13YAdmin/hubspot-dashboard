#!/bin/bash

# Script local pour enrichir les filiales
# Usage: ./enrich-local.sh

echo "🔍 ENRICHISSEMENT LOCAL DES FILIALES"
echo "═══════════════════════════════════════════════════"
echo ""

# Vérifier que les tokens sont définis
if [ -z "$HUBSPOT_ACCESS_TOKEN" ]; then
    echo "❌ HUBSPOT_ACCESS_TOKEN non défini"
    echo ""
    echo "Définissez-le avec:"
    echo "  export HUBSPOT_ACCESS_TOKEN='votre_token'"
    echo ""
    exit 1
fi

if [ -z "$PAPPERS_API_TOKEN" ]; then
    echo "❌ PAPPERS_API_TOKEN non défini"
    echo ""
    echo "Définissez-le avec:"
    echo "  export PAPPERS_API_TOKEN='votre_token'"
    echo ""
    exit 1
fi

echo "✅ Tokens configurés"
echo ""

# Exécuter le script
cd "$(dirname "$0")"
node .github/scripts/enrich-subsidiaries.js

# Vérifier le résultat
if [ $? -eq 0 ]; then
    echo ""
    echo "═══════════════════════════════════════════════════"
    echo "✅ ENRICHISSEMENT TERMINÉ !"
    echo "═══════════════════════════════════════════════════"
    echo ""
    echo "📄 CSV généré dans: public/subsidiaries_*.csv"
    echo ""

    # Lister les CSV générés
    if ls public/subsidiaries_*.csv 1> /dev/null 2>&1; then
        echo "Fichiers disponibles:"
        ls -lh public/subsidiaries_*.csv
        echo ""
        echo "💡 Ouvrez le CSV avec Excel ou Google Sheets pour valider"
    fi
else
    echo ""
    echo "❌ Erreur lors de l'enrichissement"
    exit 1
fi
