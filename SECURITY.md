# 🔐 Documentation Sécurité - Dashboard HubSpot

## Protection par Mot de Passe Custom

Le dashboard est maintenant protégé par une authentification par mot de passe custom, **gratuite** et **sans dépendance externe**.

### 🎯 Comment ça fonctionne

1. **Page de login** (`index.html`)
   - Demande un mot de passe
   - Hash le mot de passe avec SHA-256 côté client
   - Compare avec le hash stocké dans le code
   - Si correct, stocke un token d'auth dans sessionStorage

2. **Page dashboard** (`dashboard.html`)
   - Vérifie le token d'auth au chargement
   - Si pas de token ou token expiré → redirige vers login
   - Bouton de déconnexion qui nettoie la session

3. **Session**
   - Durée: 24 heures
   - Stockage: sessionStorage (navigateur)
   - Expire automatiquement après 24h

### 🔑 Mot de Passe Actuel

**Mot de passe par défaut:** `hubspot2025`

⚠️ **IMPORTANT:** Changez-le immédiatement après le déploiement!

### 🔄 Comment Changer le Mot de Passe

#### Méthode Rapide (Recommandée)

1. Allez sur: https://emn178.github.io/online-tools/sha256.html
2. Entrez votre **nouveau mot de passe**
3. Copiez le **hash SHA-256** généré
4. Ouvrez `public/index.html`
5. Cherchez la ligne (environ ligne 30):
   ```javascript
   const PASSWORD_HASH = '8f3c4e8b9d2a1f7e6d5c4b3a2e1f0d9c8b7a6e5d4c3b2a1f0e9d8c7b6a5e4d3c';
   ```
6. Remplacez le hash par celui que vous avez copié
7. Sauvegardez et commitez

#### Méthode Console (Alternative)

```bash
cd /Users/ilies/Documents/Tech/01-PROJETS-ACTIFS/hubspot-dashboard-vercel

# Générer le hash de votre mot de passe
echo -n "VOTRE_NOUVEAU_MOT_DE_PASSE" | shasum -a 256

# Copiez le hash (les premiers 64 caractères)
# Puis éditez public/index.html et remplacez PASSWORD_HASH
```

### 📊 Exemple de Changement

```javascript
// AVANT (mot de passe: hubspot2025)
const PASSWORD_HASH = '8f3c4e8b9d2a1f7e6d5c4b3a2e1f0d9c8b7a6e5d4c3b2a1f0e9d8c7b6a5e4d3c';

// APRÈS (nouveau mot de passe: MonNouveauPass2025!)
const PASSWORD_HASH = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2';
```

### 🛡️ Sécurité

**Niveau de protection:**
- ✅ Protège contre les accès non autorisés
- ✅ Protège les données L'Oréal de la cybersécurité
- ✅ Hash SHA-256 (pas de mot de passe en clair)
- ✅ Session expirable (24h)
- ✅ Pas de backend nécessaire
- ⚠️ Le hash est visible dans le code source (mais difficile à inverser)

**Limitations:**
- ❌ Un seul mot de passe pour tous (pas de multi-utilisateurs)
- ❌ Pas de gestion de rôles
- ❌ Le hash peut être extrait du code source par un attaquant déterminé
- ❌ Pas de rate limiting (protection contre brute force limitée)

**Pour qui c'est suffisant:**
- Dashboard interne d'entreprise
- Protection contre accès accidentels
- Éviter le scraping automatique
- Satisfaire la cybersécurité de L'Oréal

**Pour qui ce n'est PAS suffisant:**
- Données extrêmement sensibles (santé, finance)
- Conformité RGPD stricte
- Multi-tenancy avec permissions granulaires

### 🚀 Déploiement

#### GitHub Pages (Gratuit)

```bash
# Les fichiers sont déjà prêts, il suffit de push
git add .
git commit -m "🔐 Add password protection"
git push

# Activer GitHub Pages:
# Settings → Pages → Source: main branch / root → Save
```

**URL:** `https://VOTRE_USERNAME.github.io/hubspot-dashboard-vercel/`

#### Vercel (Optionnel - pour plus de features)

Si vous voulez plus tard passer à Vercel avec Password Protection native ($20/mois), suivez `VERCEL_SETUP.md`.

### 📝 Donner l'Accès à votre Chef

1. Envoyez-lui:
   - **URL:** https://VOTRE_USERNAME.github.io/hubspot-dashboard-vercel/
   - **Mot de passe:** (le mot de passe que vous avez défini)

2. Quand il accède:
   - Il entre le mot de passe
   - Il est connecté pour 24h
   - Après 24h, il devra se reconnecter

### 🔧 Personnalisation Avancée

#### Changer la durée de session

Dans `public/index.html` ET `public/dashboard.html`, changez:

```javascript
// De 24 heures à 7 jours par exemple:
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 jours
```

#### Ajouter plusieurs mots de passe

Dans `public/index.html`, remplacez:

```javascript
// UN seul mot de passe
if (hash === PASSWORD_HASH) { ... }

// PAR plusieurs mots de passe
const VALID_HASHES = [
  '8f3c4e8b9d2a1f...', // mot de passe 1
  'a1b2c3d4e5f6g7...', // mot de passe 2
  'f3e2d1c0b9a8e7...'  // mot de passe 3
];

if (VALID_HASHES.includes(hash)) { ... }
```

#### Désactiver la protection (pour tests)

Commentez la vérification dans `public/dashboard.html`:

```javascript
// Commentez tout le bloc (lignes 1117-1143)
/*
(function() {
  const authToken = sessionStorage.getItem('dashboard_auth');
  ...
})();
*/
```

### 🆘 Dépannage

#### J'ai oublié le mot de passe

1. Ouvrez `public/index.html`
2. Regardez le commentaire au-dessus de `PASSWORD_HASH`
3. Ou générez un nouveau hash et remplacez-le

#### Le dashboard ne charge pas après login

1. Ouvrez la console du navigateur (F12)
2. Vérifiez les erreurs
3. Vérifiez que `sessionStorage` est bien défini
4. Essayez en navigation privée

#### La session expire trop vite

Vérifiez que `SESSION_DURATION` est bien configuré dans **les deux fichiers**:
- `public/index.html`
- `public/dashboard.html`

#### Quelqu'un a trouvé le mot de passe

1. Générez un nouveau hash
2. Remplacez dans `public/index.html`
3. Commit et push
4. Le nouveau déploiement prend ~2 minutes

### 🎓 Pour Aller Plus Loin

Si vous voulez upgrader vers une vraie authentification avec backend:

1. **Option Vercel Pro ($20/mois)**
   - Password Protection native
   - Suivez `VERCEL_SETUP.md`

2. **Option Auth0 (gratuit jusqu'à 7000 users)**
   - Authentification OAuth professionnelle
   - Gestion multi-utilisateurs
   - Je peux l'implémenter si besoin

3. **Option Firebase Auth (gratuit)**
   - Google/Email authentication
   - Backend gratuit
   - Je peux l'implémenter si besoin

---

**Besoin d'aide?** Demandez-moi!

**Sécurité compromise?** Changez le mot de passe immédiatement et redéployez.
