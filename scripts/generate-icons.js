import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tablerDir = path.join(__dirname, "..", "node_modules", "@tabler", "icons");
const outputDir = path.join(__dirname, "..", "public", "icons");

// ─── Lecture du package @tabler/icons ─────────────────────────────────────────
const readJson = (file) =>
  JSON.parse(fs.readFileSync(path.join(tablerDir, file), "utf-8"));

const { version } = readJson("package.json");
const meta = readJson("icons.json");
const nodes = {
  outline: readJson("tabler-nodes-outline.json"),
  filled: readJson("tabler-nodes-filled.json"),
};

// ─── Index ────────────────────────────────────────────────────────────────────
// Une entrée par icône : nom, catégorie, tags, styles disponibles.
// `brand` signale les logos tiers (soumis aux conditions de leur propriétaire).
const icons = Object.values(meta)
  .map((icon) => ({
    name: icon.name,
    category: icon.category || "",
    tags: [...new Set((icon.tags || []).map((t) => String(t).toLowerCase()))],
    styles: Object.keys(icon.styles || {}).filter((s) => nodes[s]?.[icon.name]),
    brand: icon.name.startsWith("brand-"),
  }))
  .filter((icon) => icon.styles.length)
  .sort((a, b) => a.name.localeCompare(b.name));

// ─── Écriture ─────────────────────────────────────────────────────────────────
fs.rmSync(outputDir, { recursive: true, force: true });

for (const style of Object.keys(nodes)) {
  const dir = path.join(outputDir, style);
  fs.mkdirSync(dir, { recursive: true });
  for (const icon of icons) {
    if (!icon.styles.includes(style)) continue;
    fs.copyFileSync(
      path.join(tablerDir, "icons", style, `${icon.name}.svg`),
      path.join(dir, `${icon.name}.svg`),
    );
  }
  // Nœuds SVG utilisés par l'interface pour le rendu inline (couleur / trait)
  const subset = {};
  for (const icon of icons) {
    if (icon.styles.includes(style)) subset[icon.name] = nodes[style][icon.name];
  }
  fs.writeFileSync(
    path.join(outputDir, `nodes-${style}.json`),
    JSON.stringify(subset),
  );
}

const index = {
  source: "Tabler Icons",
  version,
  license: "MIT",
  url: "https://tabler.io/icons",
  files: "icons/{style}/{name}.svg",
  count: icons.length,
  icons,
};
fs.writeFileSync(path.join(outputDir, "index.json"), JSON.stringify(index));

// Licence MIT de Tabler, à conserver avec les fichiers redistribués
fs.copyFileSync(path.join(tablerDir, "LICENSE"), path.join(outputDir, "LICENSE"));

const count = (style) => icons.filter((i) => i.styles.includes(style)).length;
console.log(
  `✅ ${icons.length} icônes Tabler v${version} générées (${count("outline")} outline, ${count("filled")} filled, ${icons.filter((i) => i.brand).length} marques) → public/icons/`,
);
