# 🚀 Configuration Vercel avec Password Protection

Guide complet pour déployer votre dashboard HubSpot sur Vercel avec protection par mot de passe.

## 📋 Prérequis

- Compte GitHub avec le repo `hubspot-dashboard-vercel`
- Navigateur web

## ⚙️ Configuration Étape par Étape

### Étape 1: Créer un compte Vercel

1. Allez sur https://vercel.com/signup
2. Cliquez sur "Continue with GitHub"
3. Autorisez Vercel à accéder à votre GitHub

### Étape 2: Créer un nouveau projet Vercel

1. Une fois connecté, cliquez sur "Add New..." → "Project"
2. Importez votre repo GitHub `hubspot-dashboard-vercel`
3. **Configuration du projet:**
   - **Framework Preset:** Other (ou None)
   - **Root Directory:** `./`
   - **Build Command:** Laisser vide
   - **Output Directory:** `public`
   - **Install Command:** `npm install`

4. Cliquez sur "Deploy"
5. ⏳ Attendez que le déploiement se termine (environ 1-2 minutes)

### Étape 3: Récupérer les IDs Vercel

#### 3.1 Récupérer VERCEL_ORG_ID

1. Dans Vercel, cliquez sur votre avatar (en haut à droite)
2. Allez dans "Settings"
3. Dans l'onglet "General", copiez votre **Team ID** (c'est votre ORG_ID)

#### 3.2 Récupérer VERCEL_PROJECT_ID

1. Allez sur votre projet `hubspot-dashboard-vercel`
2. Cliquez sur "Settings"
3. Dans l'onglet "General", sous "Project ID", copiez l'ID

#### 3.3 Créer un VERCEL_TOKEN

1. Allez dans Settings (avatar → Settings)
2. Cliquez sur "Tokens" dans le menu de gauche
3. Cliquez sur "Create Token"
4. **Nom du token:** `GitHub Actions Deploy`
5. **Scope:** Full Account
6. **Expiration:** No Expiration (ou à votre convenance)
7. Cliquez sur "Create"
8. ⚠️ **IMPORTANT:** Copiez immédiatement le token, il ne sera plus affiché!

### Étape 4: Configurer les Secrets GitHub

1. Allez sur votre repo GitHub: https://github.com/VOTRE_USERNAME/hubspot-dashboard-vercel
2. Cliquez sur "Settings" (dans le menu du repo)
3. Dans le menu de gauche: "Secrets and variables" → "Actions"
4. Cliquez sur "New repository secret"

Ajoutez les 3 secrets suivants:

#### Secret 1: VERCEL_TOKEN
- **Name:** `VERCEL_TOKEN`
- **Value:** Le token que vous avez copié à l'étape 3.3
- Cliquez sur "Add secret"

#### Secret 2: VERCEL_ORG_ID
- **Name:** `VERCEL_ORG_ID`
- **Value:** Votre Team ID (étape 3.1)
- Cliquez sur "Add secret"

#### Secret 3: VERCEL_PROJECT_ID
- **Name:** `VERCEL_PROJECT_ID`
- **Value:** Votre Project ID (étape 3.2)
- Cliquez sur "Add secret"

### Étape 5: Activer la Password Protection

1. Retournez sur Vercel (https://vercel.com)
2. Ouvrez votre projet `hubspot-dashboard-vercel`
3. Cliquez sur "Settings"
4. Dans le menu de gauche, cliquez sur "Deployment Protection"
5. Activez **"Vercel Authentication"** ou **"Password Protection"**

#### Option A: Vercel Authentication (Recommandé - Gratuit)
- Activez "Vercel Authentication"
- Ajoutez les emails autorisés (votre chef, vous, etc.)
- Les utilisateurs devront se connecter avec leur compte Vercel/GitHub

#### Option B: Password Protection (Plus simple - Payant Pro)
⚠️ **Nécessite le plan Vercel Pro ($20/mois)**
- Activez "Password Protection"
- Définissez un mot de passe
- Donnez ce mot de passe à votre chef

#### Option C: Custom Protection (Gratuit - DIY)
Si vous ne voulez pas payer, je peux implémenter une protection par mot de passe custom dans le code HTML. Ça prend 10 minutes.

### Étape 6: Tester le Déploiement Automatique

1. Allez dans "Actions" sur votre repo GitHub
2. Vous devriez voir deux workflows:
   - `Fetch HubSpot Data` (récupère les données)
   - `Deploy to Vercel` (déploie sur Vercel)

3. Cliquez sur "Fetch HubSpot Data"
4. Cliquez sur "Run workflow" → "Run workflow"
5. Attendez que ça se termine (~2-3 minutes)
6. Le workflow "Deploy to Vercel" devrait se déclencher automatiquement après

### Étape 7: Accéder à votre Dashboard

1. Une fois déployé, allez sur: `https://hubspot-dashboard-vercel.vercel.app`
2. Si vous avez activé la protection, entrez le mot de passe
3. Votre dashboard devrait s'afficher! 🎉

## 🔧 Modifications Futures

Désormais, chaque fois que:
1. Le workflow `Fetch HubSpot Data` se termine avec succès
2. Le workflow `Deploy to Vercel` redéploie automatiquement

Vos données restent privées grâce à la protection par mot de passe.

## 🆘 Dépannage

### Le déploiement échoue avec "Missing VERCEL_TOKEN"
→ Vérifiez que vous avez bien ajouté les 3 secrets dans GitHub (étape 4)

### Le site ne charge pas
→ Vérifiez dans Vercel que le "Output Directory" est bien `public`

### Pas de protection par mot de passe visible
→ Vérifiez dans Vercel Settings → Deployment Protection que c'est activé

### L'Oréal peut toujours voir les données
→ Vérifiez que la protection est bien activée ET que le déploiement sur GitHub Pages est désactivé

## 📝 Notes

- **GitHub Pages:** Vous pouvez désactiver GitHub Pages maintenant pour éviter toute fuite
- **URL:** Donnez l'URL Vercel à votre chef: `https://hubspot-dashboard-vercel.vercel.app`
- **Coût:** Gratuit sur le plan Hobby (avec Vercel Authentication), $20/mois pour Password Protection

---

**Besoin d'aide?** Demandez-moi et je peux vous guider étape par étape!
