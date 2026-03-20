# Bibliothèque d'illustrations

Interface de navigation et de recherche pour une collection d'illustrations PNG.

---

## Lancer le projet

```bash
npm install
npm run dev
```

---

## Structure des dossiers

```
public/
  illustrations/
    Purple/          ← style par défaut (référence du catalogue)
    Bicolor/
    Dark Purple/
    Dark Yellow/
    Light Purple/
    Light Yellow/
src/
  catalog.json       ← généré automatiquement
  modes.json         ← généré automatiquement
scripts/
  generate-catalog.js
```

---

## Ajouter de nouvelles illustrations

### 1. Nommer les fichiers correctement

Chaque illustration doit suivre ce format :

```
Illustration Plateforme_Nom-De-L-Illustration.png
```

Le nom affiché dans l'interface est extrait automatiquement de la partie après le dernier `_`.  
Exemples :
- `Illustration Plateforme_Shopping-Cart.png` → **Shopping Cart**
- `Illustration Plateforme_AI-Assistant.png` → **AI Assistant**

### 2. Déposer les fichiers dans le dossier `Purple/`

`Purple` est le dossier de référence. C'est lui qui définit la liste complète du catalogue.

```
public/illustrations/Purple/
  Illustration Plateforme_MaNouvelleIllo.png
```

> ⚠️ Toutes les nouvelles illustrations **doivent** être ajoutées dans `Purple/` pour apparaître dans le catalogue.

### 3. Régénérer le catalogue

```bash
npm run catalog
```

Le script scanne `Purple/`, génère les tags (EN + FR), et met à jour `src/catalog.json`.  
La nouvelle illustration apparaît immédiatement dans l'interface au prochain rechargement.

---

## Ajouter un nouveau style (variante)

Un style est simplement un dossier dans `public/illustrations/` contenant les mêmes fichiers PNG que `Purple/`.

### Étapes

**1. Créer le dossier**

```
public/illustrations/MonNouveauStyle/
```

**2. Y déposer les PNG**

Les fichiers doivent porter **exactement le même nom** que dans `Purple/`.  
Il n'est pas obligatoire de fournir toutes les illustrations — les images manquantes sont masquées automatiquement dans ce style.

**3. Régénérer le catalogue**

```bash
npm run catalog
```

Le nouveau style est détecté automatiquement et son bouton apparaît dans la sidebar.  
`Purple` reste toujours le premier bouton (style par défaut).

> Il n'y a rien d'autre à modifier dans le code.

---

## Supprimer un style

Supprimer le dossier correspondant dans `public/illustrations/`, puis relancer :

```bash
npm run catalog
```

---

## Supprimer une illustration

Supprimer le fichier PNG dans `Purple/` (et dans les autres styles si besoin), puis relancer :

```bash
npm run catalog
```

---

## Build pour la production

```bash
npm run build
```

Les fichiers sont générés dans `dist/`.
