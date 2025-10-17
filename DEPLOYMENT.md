# 🚀 Guide de Déploiement Complet

Ce guide te montre comment déployer ton dashboard HubSpot sur GitHub et Vercel, **étape par étape**.

---

## 📋 Prérequis

- ✅ Compte GitHub créé (c'est fait !)
- ✅ Code prêt (c'est fait aussi !)
- 🔜 Compte Vercel à créer (gratuit)
- 🔜 Token HubSpot à générer

---

## Étape 1️⃣ : Créer le Repository sur GitHub

1. Va sur https://github.com et connecte-toi
2. Clique sur le bouton **"+" en haut à droite** → "New repository"
3. Remplis les champs :
   - **Repository name** : `hubspot-dashboard`
   - **Description** : `Dashboard Account Manager pour HubSpot avec API`
   - **Visibility** : Choisis "Private" (recommandé) ou "Public"
   - ⚠️ **NE COCHE PAS** "Initialize with README" (on a déjà un README !)
4. Clique sur **"Create repository"**

GitHub va te montrer une page avec des instructions. **Copie l'URL qui ressemble à** :
```
https://github.com/ton-username/hubspot-dashboard.git
```

---

## Étape 2️⃣ : Pousser ton Code sur GitHub

Ouvre ton terminal et exécute ces commandes **une par une** :

```bash
# Va dans le dossier du projet
cd /Users/ilies/Documents/Tech/hubspot-dashboard-vercel

# Ajoute le repository GitHub comme "remote"
git remote add origin https://github.com/TON-USERNAME/hubspot-dashboard.git
# ⚠️ Remplace TON-USERNAME par ton vrai nom d'utilisateur GitHub !

# Configure ton nom et email (une seule fois)
git config --global user.name "Ton Nom"
git config --global user.email "ton-email@example.com"

# Pousse ton code sur GitHub
git push -u origin main
```

🎉 **Ton code est maintenant sur GitHub !** Rafraîchis la page GitHub pour le voir.

---

## Étape 3️⃣ : Créer un Compte Vercel et Connecter GitHub

1. Va sur https://vercel.com
2. Clique sur **"Sign Up"** (S'inscrire)
3. **Choisis "Continue with GitHub"** (se connecter avec GitHub)
   - Cela va automatiquement lier ton compte GitHub à Vercel
4. Autorise Vercel à accéder à tes repositories GitHub

---

## Étape 4️⃣ : Déployer ton Projet sur Vercel

1. Une fois connecté à Vercel, clique sur **"Add New..."** → **"Project"**
2. Tu vas voir la liste de tes repositories GitHub
3. Trouve **"hubspot-dashboard"** et clique sur **"Import"**
4. Sur la page de configuration :
   - **Framework Preset** : Sélectionne "Other"
   - **Root Directory** : Laisse `.` (par défaut)
   - **Build Command** : Laisse vide
   - **Output Directory** : `public`
5. ⚠️ **IMPORTANT : Ajoute la variable d'environnement** (voir Étape 5)

---

## Étape 5️⃣ : Configurer le Token HubSpot

### 5.1 - Créer un Private App dans HubSpot

1. Va dans **HubSpot** → **Settings** (⚙️ en haut à droite)
2. Dans le menu de gauche : **Integrations** → **Private Apps**
3. Clique sur **"Create a private app"**
4. Donne-lui un nom : `Dashboard Account Manager`
5. Va dans l'onglet **"Scopes"** et coche :
   - ✅ `crm.objects.deals.read`
   - ✅ `crm.objects.companies.read`
6. Clique sur **"Create app"**
7. **COPIE LE TOKEN** qui s'affiche (il commence par `pat-...`)

⚠️ **Note** : Ce token est secret ! Ne le partage jamais publiquement.

### 5.2 - Ajouter le Token à Vercel

Retourne sur la page de configuration Vercel (Étape 4) :

1. Dans la section **"Environment Variables"**, clique sur "Add"
2. Remplis :
   - **Name** : `HUBSPOT_ACCESS_TOKEN`
   - **Value** : Colle ton token HubSpot (celui que tu viens de copier)
3. Clique sur **"Deploy"**

🎉 **Vercel va déployer ton application !** Cela prend environ 30-60 secondes.

---

## Étape 6️⃣ : Tester ton Dashboard

Une fois le déploiement terminé :

1. Vercel va te donner une **URL de production** comme :
   ```
   https://hubspot-dashboard-abc123.vercel.app
   ```
2. Clique sur cette URL ou copie-la dans ton navigateur
3. Sur la page du dashboard, clique sur le bouton **"🚀 Charger les Deals HubSpot"**
4. Si tout fonctionne, tu verras :
   - "✅ X deals chargés avec succès !"
   - Le dashboard s'affiche avec toutes tes métriques

---

## 🔧 Tester en Local (Optionnel)

Si tu veux tester sur ton ordinateur avant de déployer :

```bash
# Installe Vercel CLI
npm install

# Crée un fichier .env.local avec ton token
echo "HUBSPOT_ACCESS_TOKEN=ton-token-ici" > .env.local

# Lance le serveur de développement
npm run dev
```

Puis ouvre http://localhost:3000

---

## 🔄 Mettre à Jour ton Dashboard

Chaque fois que tu modifies ton code et que tu veux le déployer :

```bash
# Stage les changements
git add .

# Crée un commit avec un message
git commit -m "Description de tes modifications"

# Pousse sur GitHub
git push
```

**Vercel va automatiquement déployer les changements** dès que tu push sur GitHub ! 🚀

---

## ❓ Problèmes Fréquents

### Erreur : "HUBSPOT_ACCESS_TOKEN non configuré"
→ Vérifie que tu as bien ajouté la variable d'environnement dans Vercel

### Erreur : "HubSpot API error: 401"
→ Ton token est invalide ou expiré. Génère-en un nouveau dans HubSpot

### Erreur : "HubSpot API error: 403"
→ Ton Private App n'a pas les bonnes permissions (scopes). Vérifie les scopes dans HubSpot

### Le bouton "Charger les Deals" ne fait rien
→ Ouvre la Console du navigateur (F12) pour voir les erreurs détaillées

---

## 📊 Limites du Plan Gratuit Vercel

Rappel des limites (largement suffisantes pour ton usage) :

| Ressource | Limite Gratuite | Ton Usage Estimé |
|-----------|----------------|------------------|
| Exécutions | 100k/mois | ~5k-10k/mois (1-2%) |
| Bande passante | 100 GB | ~1-2 GB (1-2%) |
| Temps d'exécution | 10 secondes max | ~2-5s par appel |

Tu es **très loin** des limites ! 💪

---

## 🎉 C'est Terminé !

Tu as maintenant :
- ✅ Un dashboard HubSpot professionnel
- ✅ Connexion API automatique
- ✅ Hébergement gratuit sur Vercel
- ✅ Déploiement automatique via GitHub
- ✅ Code versionné sur GitHub

**URL de ton dashboard** : https://hubspot-dashboard-XXXXX.vercel.app

Enjoy ! 🚀
