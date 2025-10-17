# ⚡ QuickStart - Par Où Commencer ?

Ton projet est **100% prêt** ! Voici exactement ce qu'il faut faire maintenant.

---

## 📂 Ce Qui a Été Créé

Voici tous les fichiers de ton projet :

```
hubspot-dashboard-vercel/
├── 📄 README.md              # Documentation du projet
├── 📄 DEPLOYMENT.md          # 👉 GUIDE ÉTAPE PAR ÉTAPE POUR DÉPLOYER
├── 📄 GIT-CHEATSHEET.md      # Aide-mémoire Git pour débutants
├── 📄 QUICKSTART.md          # Ce fichier (par où commencer)
├── 📄 package.json           # Configuration Node.js
├── 📄 vercel.json            # Configuration Vercel
├── 📄 .env.example           # Template pour tes variables d'environnement
├── 📄 .gitignore             # Fichiers à ignorer par Git
│
├── api/
│   └── 📄 deals.js           # Fonction serverless pour récupérer les deals HubSpot
│
└── public/
    └── 📄 index.html         # Dashboard complet (HTML + CSS + JS)
```

---

## ✅ Ce Qui Est Déjà Fait

- ✅ **Code complet** : Dashboard + API HubSpot
- ✅ **Repository Git initialisé** : Commits créés
- ✅ **Documentation** : README, guides de déploiement
- ✅ **Prêt pour GitHub** : `.gitignore` configuré

---

## 🎯 Prochaines Étapes (Dans l'Ordre)

### 1️⃣ Ouvre le Guide de Déploiement

```bash
# Ouvre le fichier DEPLOYMENT.md avec ton éditeur de texte
open DEPLOYMENT.md
```

**Ou simplement ouvre-le dans Finder/VS Code**

Ce guide te montre **EXACTEMENT** comment :
- Créer un repository GitHub
- Pousser ton code
- Déployer sur Vercel
- Configurer le token HubSpot

### 2️⃣ Suis le Guide Étape par Étape

Le guide est **super détaillé** avec :
- 📸 Ce qu'il faut cliquer
- 💻 Les commandes exactes à exécuter
- ⚠️ Les erreurs courantes et comment les résoudre

**Temps estimé : 10-15 minutes** ⏱️

### 3️⃣ Si Tu Es Nouveau sur Git/GitHub

```bash
# Ouvre l'aide-mémoire Git
open GIT-CHEATSHEET.md
```

Ce fichier explique :
- Git vs GitHub vs Vercel
- Les 3 commandes essentielles
- Comment faire des commits
- Erreurs fréquentes

---

## 🚀 Commandes Rapides pour Démarrer

Si tu veux voir le projet **en local** tout de suite :

```bash
# 1. Va dans le dossier
cd /Users/ilies/Documents/Tech/hubspot-dashboard-vercel

# 2. Installe les dépendances
npm install

# 3. Crée ton fichier de config avec ton token HubSpot
echo "HUBSPOT_ACCESS_TOKEN=ton-token-ici" > .env.local
# ⚠️ Remplace "ton-token-ici" par ton vrai token !

# 4. Lance le serveur de développement
npm run dev
```

Puis ouvre http://localhost:3000

---

## 🎓 Ordre de Lecture Recommandé

1. **QUICKSTART.md** ← Tu es ici 👋
2. **DEPLOYMENT.md** ← Guide de déploiement complet
3. **GIT-CHEATSHEET.md** ← Si c'est ta première fois avec Git
4. **README.md** ← Documentation technique détaillée

---

## 💡 Résumé Ultra-Rapide

```
Étape 1: Créer repository sur GitHub
   ↓
Étape 2: Pousser le code (git push)
   ↓
Étape 3: Connecter GitHub à Vercel
   ↓
Étape 4: Ajouter ton token HubSpot dans Vercel
   ↓
Étape 5: Déployer !
   ↓
🎉 Ton dashboard est en ligne !
```

---

## ❓ Questions ?

- **Comment je push sur GitHub ?** → Voir DEPLOYMENT.md Étape 2
- **Où je trouve mon token HubSpot ?** → Voir DEPLOYMENT.md Étape 5.1
- **Comment je modifie le code ?** → Modifie les fichiers, puis `git add . && git commit -m "message" && git push`
- **Ça coûte combien ?** → **Gratuit** (Vercel gratuit + HubSpot gratuit)

---

## 🔥 Commande Unique pour Tout Faire

Si tu es pressé (après avoir créé le repo GitHub) :

```bash
cd /Users/ilies/Documents/Tech/hubspot-dashboard-vercel && \
git remote add origin https://github.com/TON-USERNAME/hubspot-dashboard.git && \
git push -u origin main
```

⚠️ **Remplace `TON-USERNAME` par ton vrai nom d'utilisateur GitHub !**

Ensuite, va sur https://vercel.com pour connecter GitHub et déployer.

---

## 📞 Support

Si tu rencontres un problème :
1. Vérifie la section "Problèmes Fréquents" dans DEPLOYMENT.md
2. Vérifie les erreurs dans la console de ton navigateur (F12)
3. Vérifie les logs de déploiement dans Vercel

---

## 🎉 C'est Parti !

Ouvre maintenant **DEPLOYMENT.md** et suis le guide !

```bash
open DEPLOYMENT.md
```

🚀 Let's go !
