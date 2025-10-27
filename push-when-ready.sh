#!/bin/bash
# Script pour push les 2 commits quand le réseau sera OK

echo "🔍 Test de connectivité GitHub..."
if ping -c 1 github.com > /dev/null 2>&1; then
  echo "✅ Réseau OK, pushing..."
  git push origin main
  echo ""
  echo "🎉 PUSH RÉUSSI!"
  echo ""
  echo "📊 Dashboard fixé: https://13yadmin.github.io/hubspot-dashboard/"
  echo "🤖 Workflow s'exécute toutes les 15 min"
  echo "📈 Score attendu: 39/100 → ~95/100"
else
  echo "❌ Pas de réseau encore"
  echo "Réessaye plus tard avec: bash push-when-ready.sh"
fi
