<template>
  <div class="app">
    <!-- ─── Sidebar ─────────────────────────────────────── -->
    <aside class="sidebar">
      <SidebarHeader view="icons" />

      <!-- Search -->
      <div class="sidebar-search">
        <label class="search-field">
          <svg class="search-icon" viewBox="0 0 20 20" fill="none">
            <circle
              cx="9"
              cy="9"
              r="6"
              stroke="currentColor"
              stroke-width="1.8"
            />
            <path
              d="M13.5 13.5L17 17"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
          <input v-model="query" placeholder="Rechercher…" autocomplete="off" />
          <span
            v-if="fuzzyActive"
            class="fuzzy-badge"
            title="Résultats approximatifs"
            >≈</span
          >
        </label>
      </div>

      <!-- Style -->
      <div class="mode-section">
        <span class="nav-section-label">Style</span>
        <div class="mode-btns">
          <button
            v-for="s in STYLES"
            :key="s.id"
            :class="['mode-btn', { 'mode-btn--active': iconStyle === s.id }]"
            @click="iconStyle = s.id"
          >
            {{ s.label }}
          </button>
        </div>
      </div>

      <!-- Couleur -->
      <div class="mode-section">
        <span class="nav-section-label">Couleur</span>
        <div class="swatches">
          <button
            v-for="c in COLORS"
            :key="c.hex"
            :class="['swatch', { 'swatch--active': color === c.hex }]"
            :style="{ '--swatch': c.hex }"
            :title="`${c.label} (${c.hex})`"
            :aria-label="c.label"
            @click="color = c.hex"
          />
        </div>
      </div>

      <!-- Trait + taille d'export -->
      <div class="mode-section">
        <span class="nav-section-label">
          Trait <span class="nav-section-value">{{ stroke }}</span>
        </span>
        <div class="sidebar-range">
          <input
            type="range"
            class="zoom-slider"
            v-model.number="stroke"
            min="1"
            max="2.5"
            step="0.25"
            :disabled="iconStyle === 'filled'"
            aria-label="Épaisseur du trait"
          />
        </div>
      </div>

      <div class="mode-section">
        <span class="nav-section-label">Taille d’export</span>
        <div class="mode-btns">
          <button
            v-for="size in EXPORT_SIZES"
            :key="size"
            :class="['mode-btn', { 'mode-btn--active': exportSize === size }]"
            @click="exportSize = size"
          >
            {{ size }} px
          </button>
        </div>
      </div>

      <!-- Catégories -->
      <div class="sidebar-section">
        <span class="nav-section-label">Catégories</span>
        <nav class="nav-list">
          <button
            v-for="cat in categories"
            :key="cat.name"
            :class="[
              'nav-item',
              { 'nav-item--active': activeCategory === cat.name },
            ]"
            @click="toggleCategory(cat.name)"
          >
            <span class="nav-item-hash">#</span>
            <span class="nav-item-label">{{ cat.name }}</span>
            <span class="nav-item-count">{{ cat.count }}</span>
          </button>
        </nav>
      </div>

      <!-- Footer stats -->
      <div class="sidebar-footer">
        <span :title="version ? `Tabler v${version}` : ''"
          >{{ icons.length }} icônes</span
        >
        <span title="Outline + filled">{{ variantCount }} variantes</span>
      </div>
    </aside>

    <!-- ─── Main ──────────────────────────────────────────── -->
    <div class="main">
      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar-left">
          <p class="topbar-title">
            {{ filteredIcons.length }}
            <span class="topbar-count">icônes</span>
          </p>

          <Transition name="slide">
            <div v-if="activeCategory" class="active-filters">
              <button class="filter-chip" @click="toggleCategory(activeCategory)">
                #{{ activeCategory }}&thinsp;×
              </button>
              <button class="clear-btn" @click="clearFilters">
                Tout effacer
              </button>
            </div>
          </Transition>
        </div>

        <ThemeToggle />
      </header>

      <!-- Gallery -->
      <div class="gallery-scroll" ref="scrollEl">
        <div v-if="iconStyle === 'brand'" class="icons-notice">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <p>
            Les icônes <span class="brand-badge">Marque</span> sont des logos
            tiers (YouTube, GitHub, Facebook…) soumis aux conditions
            d’utilisation de leur propriétaire. À n’utiliser que pour
            représenter explicitement cette marque.
          </p>
        </div>

        <main class="icons-grid">
          <article
            v-for="icon in displayedIcons"
            :key="icon.name"
            class="icon-card"
          >
            <span v-if="icon.brand" class="brand-badge icon-card-badge"
              >Marque</span
            >

            <div class="icon-card-menu">
              <button
                class="icon-card-more"
                aria-label="Plus d'actions"
                @click.stop="menuFor = menuFor === icon.name ? null : icon.name"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </button>
              <div v-if="menuFor === icon.name" class="icon-menu" @click.stop>
                <button @click="copySvg(icon)">Copier SVG</button>
                <button @click="downloadSvg(icon)">Télécharger SVG</button>
                <button @click="downloadPng(icon)">
                  Télécharger PNG ({{ exportSize }} px)
                </button>
              </div>
            </div>

            <div
              :class="['icon-tile', { 'icon-tile--inverse': inverseTile }]"
              :style="{ color }"
              v-html="previewSvg(icon)"
            />
            <span class="icon-card-name" :title="icon.name">{{ icon.name }}</span>
            <button class="icon-copy-btn" @click="copyPng(icon)">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path
                  d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
                />
              </svg>
              {{ feedback.name === icon.name ? feedback.label : "Copier PNG" }}
            </button>
          </article>

          <p v-if="loadError" class="empty-state">
            Impossible de charger les icônes ({{ loadError }})
          </p>
          <p v-else-if="loaded && filteredIcons.length === 0" class="empty-state">
            Aucune icône trouvée
          </p>
        </main>

        <div ref="sentinel" class="scroll-sentinel" />

        <AppFooter>
          Icônes
          <a
            href="https://tabler.io/icons"
            target="_blank"
            rel="noopener noreferrer"
            class="app-footer-link"
            >Tabler Icons</a
          >
          <template v-if="version">v{{ version }}</template> (licence MIT)
        </AppFooter>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { scoreImage, hasFuzzyHits } from "./fuzzy.js";
import { isDark } from "./theme.js";
import SidebarHeader from "./SidebarHeader.vue";
import ThemeToggle from "./ThemeToggle.vue";
import AppFooter from "./AppFooter.vue";

// ── Options ──────────────────────────────────────────────
const STYLES = [
  { id: "outline", label: "Outline" },
  { id: "filled", label: "Filled" },
  { id: "brand", label: "Marque" },
];

// Palette Woop (design-tokens.css). `light` / `dark` : contraste faible
// avec la carte en mode clair / sombre → fond de tuile inversé.
const COLORS = [
  { label: "Encre", hex: "#1D1B25", dark: true },
  { label: "Gris", hex: "#6B6D8A" },
  { label: "Violet", hex: "#4F32AF", dark: true },
  { label: "Violet clair", hex: "#7053CD" },
  { label: "Lavande", hex: "#B7A9E3", light: true },
  { label: "Jaune", hex: "#F59E0B" },
  { label: "Blanc", hex: "#FFFFFF", light: true },
];

const EXPORT_SIZES = [24, 48, 128, 256, 512];
const PAGE_SIZE = 200;

// ── State ────────────────────────────────────────────────
const query = ref("");
const activeCategory = ref(null);
const iconStyle = ref(localStorage.getItem("iconStyle") ?? "outline");
const color = ref(localStorage.getItem("iconColor") ?? COLORS[0].hex);
const stroke = ref(parseFloat(localStorage.getItem("iconStroke") ?? "1.5"));
const exportSize = ref(parseInt(localStorage.getItem("iconSize") ?? "256"));
const visibleCount = ref(PAGE_SIZE);
const menuFor = ref(null);

watch(iconStyle, (v) => localStorage.setItem("iconStyle", v));
watch(color, (v) => localStorage.setItem("iconColor", v));
watch(stroke, (v) => localStorage.setItem("iconStroke", String(v)));
watch(exportSize, (v) => localStorage.setItem("iconSize", String(v)));

const inverseTile = computed(() => {
  const preset = COLORS.find((c) => c.hex === color.value);
  return Boolean(isDark.value ? preset?.dark : preset?.light);
});

// ── Data (public/icons, généré par `npm run icons`) ────────
const icons = ref([]);
const version = ref("");
const nodes = ref({ outline: {}, filled: {} });
const loaded = ref(false);
const loadError = ref("");

async function fetchJson(file) {
  const res = await fetch(import.meta.env.BASE_URL + "icons/" + file);
  if (!res.ok) throw new Error(`${file} : HTTP ${res.status}`);
  return res.json();
}

onMounted(async () => {
  try {
    const [index, outline, filled] = await Promise.all([
      fetchJson("index.json"),
      fetchJson("nodes-outline.json"),
      fetchJson("nodes-filled.json"),
    ]);
    // `scoreImage` attend { name, tags } avec des mots séparés par des espaces
    icons.value = index.icons.map((icon) => ({
      ...icon,
      words: { name: icon.name.replace(/-/g, " "), tags: icon.tags },
    }));
    version.value = index.version;
    nodes.value = { outline, filled };
    loaded.value = true;
  } catch (err) {
    loadError.value = err.message;
  }
});

const variantCount = computed(() =>
  icons.value.reduce((n, icon) => n + icon.styles.length, 0),
);

// ── Filtres ──────────────────────────────────────────────
// Filled inclut les marques qui ont une version pleine (badge « Marque »)
function matchesStyle(icon) {
  if (iconStyle.value === "brand") return icon.brand;
  if (iconStyle.value === "filled") return icon.styles.includes("filled");
  return !icon.brand && icon.styles.includes("outline");
}

const categories = computed(() => {
  const freq = {};
  icons.value.filter(matchesStyle).forEach((icon) => {
    if (icon.category) freq[icon.category] = (freq[icon.category] || 0) + 1;
  });
  return Object.entries(freq)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name));
});

const scoredIcons = computed(() => {
  const tokens = query.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const results = icons.value
    .filter(
      (icon) =>
        matchesStyle(icon) &&
        (!activeCategory.value || icon.category === activeCategory.value),
    )
    .map((icon) => ({ icon, score: scoreImage(icon.words, tokens) }))
    .filter(({ score }) => score > 0);
  if (tokens.length) results.sort((a, b) => b.score - a.score);
  return results;
});

const fuzzyActive = computed(() =>
  hasFuzzyHits(scoredIcons.value.map((r) => r.score)),
);

const filteredIcons = computed(() => scoredIcons.value.map((r) => r.icon));

const displayedIcons = computed(() =>
  filteredIcons.value.slice(0, visibleCount.value),
);

// Retour en haut et rendu progressif réinitialisé à chaque changement de filtre
watch([query, activeCategory, iconStyle], () => {
  visibleCount.value = PAGE_SIZE;
  scrollEl.value?.scrollTo({ top: 0 });
});

// La catégorie active peut ne pas exister dans le nouveau style
watch(iconStyle, () => {
  if (!categories.value.some((c) => c.name === activeCategory.value)) {
    activeCategory.value = null;
  }
});

function toggleCategory(name) {
  activeCategory.value = activeCategory.value === name ? null : name;
}

function clearFilters() {
  query.value = "";
  activeCategory.value = null;
  nextTick(() => scrollEl.value?.scrollTo({ top: 0 }));
}

// ── Rendu progressif (IntersectionObserver) ───────────────
const scrollEl = ref(null);
const sentinel = ref(null);
let observer;

onMounted(() => {
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && visibleCount.value < filteredIcons.value.length) {
        visibleCount.value += PAGE_SIZE;
      }
    },
    { root: scrollEl.value, rootMargin: "600px" },
  );
  observer.observe(sentinel.value);
  document.addEventListener("click", closeMenu);
});

onUnmounted(() => {
  observer?.disconnect();
  document.removeEventListener("click", closeMenu);
});

function closeMenu() {
  menuFor.value = null;
}

// ── SVG ──────────────────────────────────────────────────
const escapeAttr = (v) => String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function nodeStyle(icon) {
  // Les marques sont rendues en outline (le filled n'existe pas pour toutes)
  if (iconStyle.value === "filled" && icon.styles.includes("filled")) return "filled";
  return "outline";
}

function buildSvg(icon, paint, size) {
  const style = nodeStyle(icon);
  const children = (nodes.value[style][icon.name] || [])
    .map(
      ([tag, attrs]) =>
        `<${tag} ${Object.entries(attrs)
          .map(([k, v]) => `${k}="${escapeAttr(v)}"`)
          .join(" ")}/>`,
    )
    .join("");
  const paintAttrs =
    style === "filled"
      ? `fill="${paint}" stroke="none"`
      : `fill="none" stroke="${paint}" stroke-width="${stroke.value}" stroke-linecap="round" stroke-linejoin="round"`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" ${paintAttrs}>${children}</svg>`;
}

// Aperçu : `currentColor`, la couleur vient du style de la tuile
function previewSvg(icon) {
  return buildSvg(icon, "currentColor", 48);
}

// Export : couleur réelle, taille d'export
function exportSvg(icon) {
  return buildSvg(icon, color.value, exportSize.value);
}

function renderPng(icon) {
  return new Promise((resolve, reject) => {
    const size = exportSize.value;
    const url = URL.createObjectURL(
      new Blob([exportSvg(icon)], { type: "image/svg+xml" }),
    );
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      canvas.getContext("2d").drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) =>
        blob ? resolve(blob) : reject(new Error("PNG vide")),
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("SVG illisible"));
    };
    img.src = url;
  });
}

function fileName(icon, ext) {
  return `${icon.name}-${nodeStyle(icon)}-${exportSize.value}.${ext}`;
}

function download(blob, name) {
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = name;
  a.click();
  URL.revokeObjectURL(blobUrl);
}

// ── Actions ──────────────────────────────────────────────
const feedback = ref({ name: "", label: "" });
let feedbackTimer;

function flash(icon, label) {
  feedback.value = { name: icon.name, label };
  clearTimeout(feedbackTimer);
  feedbackTimer = setTimeout(() => {
    feedback.value = { name: "", label: "" };
  }, 2000);
}

async function copyPng(icon) {
  try {
    // Promesse passée directement à ClipboardItem (exigé par Safari)
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": renderPng(icon) }),
    ]);
    flash(icon, "Copié !");
  } catch {
    flash(icon, "Erreur");
  }
}

async function copySvg(icon) {
  menuFor.value = null;
  try {
    await navigator.clipboard.writeText(exportSvg(icon));
    flash(icon, "SVG copié !");
  } catch {
    flash(icon, "Erreur");
  }
}

function downloadSvg(icon) {
  menuFor.value = null;
  download(
    new Blob([exportSvg(icon)], { type: "image/svg+xml" }),
    fileName(icon, "svg"),
  );
}

async function downloadPng(icon) {
  menuFor.value = null;
  try {
    download(await renderPng(icon), fileName(icon, "png"));
  } catch {
    flash(icon, "Erreur");
  }
}
</script>
