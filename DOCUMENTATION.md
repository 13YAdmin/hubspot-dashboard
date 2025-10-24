# 📚 DOCUMENTATION - SYSTÈME AUTONOME IA

**Dernière mise à jour**: 24/10/2025 14:59:26

---

## 🎯 QU'EST-CE QUE C'EST?

Une **entreprise autonome composée d'agents IA** qui améliore continuellement le dashboard HubSpot.

### Objectif

Avoir un dashboard HubSpot:
- ✅ Sans bugs
- ✅ Qui s'améliore automatiquement
- ✅ Avec de nouvelles features régulières
- ✅ Sans intervention humaine (sauf escalations)

---

## 🔄 COMMENT ÇA MARCHE?

### La Boucle (toutes les heures)

1. **🏭 Producteur AI** analyse le dashboard → Détecte bugs/problèmes
2. **🚀 Visionnaire AI** propose des features innovantes
3. **👔 RH AI** vérifie si assez d'agents → Recrute si besoin
4. **👨‍💼 Chef AI** lit tout → Décide avec IA → Crée tasks
5. **🔧 Dev** implémente les tasks sur `public/index.html`
6. **✅ QA** teste le dashboard → Score /100
7. **🐛 Debugger** fixe les tests qui échouent
8. **🚦 Aiguilleur AI** surveille que workflows tournent bien
9. **📰 Publishing AI** (moi!) génère rapports
10. **Commit automatique** → Push GitHub
11. **REPEAT**

### Fréquence

- **Automatique**: Toutes les heures (24x/jour)
- **Manuel**: Via workflow_dispatch sur GitHub

---

## 📊 RAPPORTS DISPONIBLES

### Quotidiens

- `RAPPORT-QUOTIDIEN.md` - Synthèse IA de la journée

### Par Agent

- `RAPPORT-AGENT-PRODUCTEUR-AI.md` - Problèmes détectés
- `RAPPORT-AGENT-VISIONNAIRE-AI.md` - Features proposées
- `RAPPORT-AGENT-RH-AI.md` - Besoins recrutement
- `RAPPORT-AGENT-CHEF-AI.md` - Décisions prises
- `RAPPORT-AGENT-DEV.md` - Code modifié
- `RAPPORT-AGENT-QA.md` - Tests & score
- `RAPPORT-AGENT-DEBUGGER.md` - Bugs fixés
- `RAPPORT-AGENT-AIGUILLEUR-AI.md` - Santé workflows

### Documentation

- `ORGANIGRAMME.md` - Structure de l'entreprise
- `DOCUMENTATION.md` - Ce fichier

---

## 🎛️ CONFIGURATION

### Activer l'IA réelle

L'IA utilise Claude (Anthropic). Pour l'activer:

1. Obtenir API key: https://console.anthropic.com/settings/keys
2. Ajouter dans GitHub Secrets: `ANTHROPIC_API_KEY`
3. Les agents passeront automatiquement en mode IA

**Coût**: ~$0.10/jour avec claude-3-haiku

### Sans IA

Les agents fonctionnent en **mode fallback** (règles simples) sans coût.

---

## 📈 MÉTRIQUES

Voir `RAPPORT-QUOTIDIEN.md` pour:
- Score QA actuel
- Tâches créées/complétées
- Bugs fixés
- Recommandations actives

---

## 🆘 ESCALATIONS

Les agents peuvent t'escalader si:
- API key requise
- Permission requise
- Décision business critique
- Budget dépassé

Voir: `.github/agents-communication/user-escalations.json`

---

**🤖 Généré automatiquement par Agent Publishing AI**
