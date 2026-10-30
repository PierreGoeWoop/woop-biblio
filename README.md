# Bibliothèque d'illustrations et d'icônes

> **© Woop — tous droits réservés. Ce dépôt n'est pas open source.**
> Les illustrations, le code et les contenus sont la propriété de Woop et réservés à un usage interne. Le fait que ce dépôt soit public ne vaut pas licence : toute réutilisation sans autorisation est interdite. Voir [LICENSE](LICENSE).
> Exception : les icônes proviennent de [Tabler Icons](https://tabler.io/icons) (licence MIT).

Interface de navigation et de recherche pour une collection d'illustrations PNG et une bibliothèque d'icônes.

Site : https://pierregoewoop.github.io/woop-biblio/ (icônes : `#/icons`)

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

## Icônes

La page **Icônes** (`#/icons`) reprend l'ancien Icon Finder Figma. Elle permet de chercher parmi les ~5 200 icônes [Tabler](https://tabler.io/icons) (outline, filled, marques), de choisir une couleur de la palette Woop, l'épaisseur du trait et la taille d'export, puis de copier ou télécharger en PNG / SVG.

Les fichiers ne sont **pas versionnés** : `npm run icons` (lancé automatiquement par `dev` et `build`) les génère dans `public/icons/` depuis le package `@tabler/icons`.

Pour mettre à jour Tabler :

```bash
npm install -D --save-exact @tabler/icons@<version>
npm run icons
```

Les icônes `brand-*` sont des logos tiers : à n'utiliser que pour représenter la marque concernée.

---

## Accès programmatique (skills, agents, scripts)

Tout est servi en statique par GitHub Pages, sans authentification :

| Ressource | URL |
| --- | --- |
| Index des icônes (nom, catégorie, tags, styles, `brand`) | `https://pierregoewoop.github.io/woop-biblio/icons/index.json` |
| Icône SVG | `https://pierregoewoop.github.io/woop-biblio/icons/{outline\|filled}/{nom}.svg` |
| Illustration PNG | `https://pierregoewoop.github.io/woop-biblio/illustrations/{Style}/{fichier}` |
| Catalogue des illustrations | [`src/catalog.json`](src/catalog.json) dans ce dépôt |

Les SVG Tabler utilisent `stroke="currentColor"` et `stroke-width="2"` : remplacer ces valeurs pour appliquer la charte (`#1D1B25`, trait `1.5`).

---

## Build pour la production

```bash
npm run build
```

Les fichiers sont générés dans `dist/`.
