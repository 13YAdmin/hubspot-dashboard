# 🤖 Détecteur Intelligent de Secteurs d'Activité

## Vue d'ensemble

Le détecteur analyse automatiquement le **nom** et le **domaine** d'une entreprise pour déterminer son secteur d'activité quand les données HubSpot sont manquantes.

## Algorithme

### 1. Vérification Entreprises Connues

Base de données de ~30 grandes entreprises:
- LVMH, Hermès, Kering → Luxe & Joaillerie
- Microsoft, Google, Apple → Tech
- BNP, Société Générale, AXA → Finance
- Renault, Peugeot, Tesla → Automobile

**Match:** Si le nom contient une entreprise connue → retourne directement

### 2. Patterns de Domaine

TLDs et extensions spécifiques:
- `.bank` → Banking
- `.insurance` → Insurance
- `.tech` → Computer Software
- `.consulting` → Management Consulting

**Match:** Si le domaine termine par un pattern → retourne directement

### 3. Analyse par Keywords

**Base de données:** 30+ secteurs avec 300+ mots-clés (EN + FR)

Exemples:
- `'software', 'logiciel', 'tech', 'saas'` → Computer Software
- `'luxury', 'luxe', 'bijoux', 'watches'` → Luxury Goods
- `'bank', 'banque', 'credit'` → Banking
- `'consulting', 'conseil', 'advisory'` → Management Consulting

**Scoring:**
- Match exact d'un mot-clé: **+10 points**
- Contient le mot-clé: **+5 points**
- Match partiel: **+2 points**

### 4. Sélection du Meilleur Score

Critères de validation:
- Score ≥ 8 points: **Confiance élevée**
- Score ≥ 6 ET 2× meilleur que le second: **Clear winner**
- Sinon: **Pas de détection** (évite les faux positifs)

## Normalisation

Avant analyse, le texte est normalisé:
1. Minuscules
2. Suppression des accents (é → e)
3. Suppression ponctuation
4. Normalisation espaces

**Stop words retirés:**
- `sa`, `sas`, `sarl`, `ltd`, `llc`, `inc`, `corp`
- `group`, `groupe`, `company`, `international`

## Secteurs Détectables

### Tech (5 secteurs)
- Computer Software
- IT Services and IT Consulting
- Internet
- Computer & Network Security

### Finance (5 secteurs)
- Financial Services
- Banking
- Insurance
- Venture Capital & Private Equity
- Accounting

### Luxe & Mode (3 secteurs)
- Luxury Goods & Jewelry
- Apparel & Fashion
- Cosmetics

### Santé (4 secteurs)
- Hospital & Health Care
- Medical Devices
- Pharmaceuticals
- Biotechnology

### Manufacturing (4 secteurs)
- Manufacturing
- Automotive
- Machinery
- Aviation & Aerospace

### Retail (3 secteurs)
- Retail
- Consumer Goods
- Food & Beverages

### Services (4 secteurs)
- Management Consulting
- Marketing & Advertising
- Human Resources
- Legal Services

### Real Estate (3 secteurs)
- Real Estate
- Construction
- Architecture & Planning

### Media (3 secteurs)
- Media Production
- Entertainment
- Publishing

### Énergie (3 secteurs)
- Oil & Energy
- Renewables & Environment
- Utilities

### Autres (3 secteurs)
- Education
- Transportation/Trucking/Railroad
- Telecommunications

**Total:** 40+ secteurs détectables

## Exemples

### ✅ Détections Réussies

```javascript
detectIndustry('LVMH', 'lvmh.com')
// → 'Luxury Goods & Jewelry' (entreprise connue)

detectIndustry('CloudTech Platform', 'cloudtech.io')
// → 'Computer Software' (keywords: tech, platform)

detectIndustry('AXA Assurances', 'axa.fr')
// → 'Insurance' (entreprise connue)

detectIndustry('Digital Marketing Agency', 'dma.com')
// → 'Marketing & Advertising' (keywords: digital, marketing, agency)

detectIndustry('Hôpital Saint-Louis', 'hopital-saintlouis.fr')
// → 'Hospital & Health Care' (keyword: hopital)
```

### ⚠️ Pas de Détection

```javascript
detectIndustry('ABC Company', 'abc.com')
// → null (pas assez d'indices)

detectIndustry('Groupe XYZ', 'xyz.fr')
// → null (score trop faible, ambiguïté)
```

## Performance

**Tests:** 19 cas de test
**Succès:** 16/19 (84%)
**Échecs:** 3 cas limites acceptables

## Utilisation

```javascript
const { detectIndustry } = require('./lib/industry-detector');

const industry = detectIndustry('Microsoft France', 'microsoft.com');
// Returns: 'Computer Software'

const unknown = detectIndustry('Unknown Corp', 'unknown.com');
// Returns: null
```

## Logs

Le détecteur log ses décisions:

```
✓ Entreprise connue détectée: LVMH → Luxury Goods & Jewelry
✓ Pattern domaine détecté: company.bank → Banking
✓ Détection par analyse: CloudTech Platform → Computer Software (score: 35)
⚠️ Pas de secteur détecté pour: ABC Company (meilleur score: 4, ambiguïté: 3)
```

## Extensibilité

Pour ajouter un secteur:

1. Ajoute l'entrée dans `INDUSTRY_KEYWORDS`:
```javascript
'Nouveau Secteur': [
  'keyword1', 'keyword2', 'keyword3'
]
```

2. (Optionnel) Ajoute les entreprises connues:
```javascript
KNOWN_COMPANIES = {
  'entreprise célèbre': 'Nouveau Secteur'
}
```

3. (Optionnel) Ajoute un pattern de domaine:
```javascript
DOMAIN_PATTERNS = {
  '.nouveausecteur': 'Nouveau Secteur'
}
```

## Limitations

- Nécessite un nom d'entreprise descriptif
- Peut confondre secteurs proches (ex: "IT Consulting" vs "Management Consulting")
- Pas de détection pour entreprises très génériques
- Dépend de la qualité des données (nom + domaine)

## Améliorations Futures

- [ ] API enrichissement externe (Clearbit, OpenCorporates)
- [ ] Machine Learning pour améliorer précision
- [ ] Support multilingue étendu (DE, ES, IT)
- [ ] Cache des détections pour performances
- [ ] Scoring pondéré par fiabilité de la source
