# 📚 Git - Aide-Mémoire Rapide

Guide ultra-simple pour comprendre Git et GitHub.

---

## 🤔 C'est Quoi Git et GitHub ?

**Git** = Un outil qui garde l'historique de tous les changements dans ton code
**GitHub** = Un site web qui héberge ton code Git (comme Google Drive pour le code)

**Vercel** = Un site qui héberge ton application web en ligne (comme ton serveur web)

```
Ton Ordinateur (Git) → GitHub (stockage) → Vercel (site web en ligne)
```

---

## 🎯 Les 3 Commandes Essentielles

### 1. Sauvegarder tes changements localement

```bash
# Voir ce qui a changé
git status

# Préparer tous les fichiers modifiés
git add .

# Sauvegarder avec un message
git commit -m "Description de ce que tu as fait"
```

### 2. Envoyer sur GitHub

```bash
# Envoyer tes commits vers GitHub
git push
```

### 3. Récupérer depuis GitHub

```bash
# Télécharger les derniers changements depuis GitHub
git pull
```

---

## 📝 Workflow Typique

Chaque fois que tu modifies quelque chose :

```bash
# 1. Voir ce qui a changé
git status

# 2. Préparer les fichiers
git add .

# 3. Créer un "point de sauvegarde" avec un message
git commit -m "Fix bug dans le calcul des tendances"

# 4. Envoyer vers GitHub
git push
```

🎉 **Vercel détecte automatiquement le push et redéploie !**

---

## 🔍 Commandes Utiles pour Débuter

```bash
# Voir l'historique des commits
git log --oneline

# Voir les différences dans les fichiers modifiés
git diff

# Voir les fichiers modifiés
git status

# Annuler les modifications d'un fichier (ATTENTION: perte définitive!)
git checkout -- nom-du-fichier.js

# Créer une nouvelle branche pour tester quelque chose
git checkout -b ma-nouvelle-feature

# Revenir à la branche principale
git checkout main
```

---

## 🌳 Comprendre les Branches

Les branches = des "versions parallèles" de ton code pour tester des trucs sans casser la version principale.

```
main (production) ────●────●────●────●
                       \        /
ma-feature             ●───●───●
                    (test)  (merge)
```

```bash
# Créer et aller sur une nouvelle branche
git checkout -b test-nouvelle-feature

# ... faire des modifications ...
git add .
git commit -m "Test de la nouvelle feature"

# Revenir sur main
git checkout main

# Fusionner ta branche de test dans main
git merge test-nouvelle-feature

# Supprimer la branche de test
git branch -d test-nouvelle-feature
```

---

## ⚠️ Erreurs Fréquentes et Solutions

### "fatal: not a git repository"
→ Tu n'es pas dans le bon dossier. Utilise `cd` pour aller dans ton projet.

### "Your branch is ahead of 'origin/main'"
→ Tu as des commits locaux pas encore envoyés sur GitHub. Utilise `git push`.

### "Updates were rejected because the remote contains work"
→ Quelqu'un d'autre a poussé du code. Récupère d'abord avec `git pull`, puis `git push`.

### "fatal: refusing to merge unrelated histories"
→ Utilise : `git pull origin main --allow-unrelated-histories`

### J'ai fait une erreur dans mon dernier commit
```bash
# Modifier le dernier commit (avant de push)
git commit --amend -m "Nouveau message corrigé"

# Annuler le dernier commit (garde les modifications)
git reset HEAD~1
```

---

## 🎨 Configurer Git (Une Seule Fois)

```bash
# Ton nom (sera visible dans les commits)
git config --global user.name "Ton Nom"

# Ton email (même email que GitHub)
git config --global user.email "ton-email@example.com"

# Vérifier la config
git config --list
```

---

## 📦 Fichiers Spéciaux

### `.gitignore`
Liste des fichiers que Git doit IGNORER (ne pas versionner).
Exemple : mots de passe, fichiers temporaires, `node_modules/`

### `.env` et `.env.local`
Fichiers de configuration avec tes **secrets** (tokens, mots de passe).
⚠️ **Toujours dans `.gitignore`** pour ne JAMAIS les push sur GitHub !

### `README.md`
Description de ton projet (première chose qu'on voit sur GitHub).

---

## 🚀 Workflow avec Vercel

```
1. Tu modifies du code sur ton ordinateur
   ↓
2. git add . && git commit -m "message"
   ↓
3. git push
   ↓
4. GitHub reçoit le code
   ↓
5. Vercel détecte le changement et redéploie automatiquement
   ↓
6. Ton site est à jour ! (30-60 secondes)
```

---

## 💡 Bonnes Pratiques

✅ **Commit souvent** : Mieux vaut plein de petits commits qu'un gros
✅ **Messages clairs** : "Fix bug" ❌ → "Fix calcul des tendances pour 2025" ✅
✅ **Push régulièrement** : Au moins une fois par jour de travail
✅ **Teste avant de push** : Vérifie que ça marche en local d'abord
✅ **Ne push JAMAIS de secrets** : Tokens, mots de passe → toujours dans `.env.local`

---

## 🎓 Pour Aller Plus Loin

Quand tu seras à l'aise :
- [Guide Git officiel](https://git-scm.com/book/fr/v2)
- [GitHub Guides](https://guides.github.com/)
- [Learn Git Branching (interactif)](https://learngitbranching.js.org/?locale=fr_FR)

---

## 🆘 Aide Rapide

```bash
# Tu es perdu ? Voir l'état actuel
git status

# Tu veux tout annuler ? (ATTENTION: perte définitive!)
git reset --hard HEAD

# Tu as tout cassé ? Retour au dernier commit
git checkout .

# Besoin d'aide sur une commande ?
git help <commande>
# Exemple: git help commit
```

---

**Rappel** : Git = sauvegarde locale | GitHub = sauvegarde en ligne | Vercel = site web en ligne

🎉 Have fun coding !
