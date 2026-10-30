<template>
  <div class="app">
    <!-- ─── Sidebar ─────────────────────────────────────── -->
    <aside class="sidebar">
      <SidebarHeader view="illustrations" />

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

      <!-- Mode selector -->
      <div class="mode-section">
        <span class="nav-section-label">Style</span>
        <div class="mode-btns">
          <button
            v-for="mode in MODES"
            :key="mode"
            :class="['mode-btn', { 'mode-btn--active': selectedMode === mode }]"
            @click="selectedMode = mode"
          >
            {{ mode }}
          </button>
        </div>
      </div>

      <!-- Tag nav -->
      <div class="sidebar-section">
        <span class="nav-section-label">Tendances</span>
        <nav class="nav-list">
          <button
            v-for="tag in popularTags"
            :key="tag.name"
            :class="[
              'nav-item',
              { 'nav-item--active': activeTags.includes(tag.name) },
            ]"
            @click="toggleTag(tag.name)"
          >
            <span class="nav-item-hash">#</span>
            <span class="nav-item-label">{{ tag.name }}</span>
            <span class="nav-item-count">{{ tag.count }}</span>
          </button>
        </nav>
      </div>

      <!-- Footer stats -->
      <div class="sidebar-footer">
        <span>{{ catalog.length }} illustrations</span>
        <span>{{ totalTags }} tags</span>
      </div>
    </aside>

    <!-- ─── Main ──────────────────────────────────────────── -->
    <div class="main">
      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar-left">
          <p class="topbar-title">
            {{ filteredImages.length }}
            <span class="topbar-count">illustrations</span>
          </p>

          <Transition name="slide">
            <div v-if="activeTags.length" class="active-filters">
              <button
                v-for="tag in activeTags"
                :key="tag"
                class="filter-chip"
                @click="toggleTag(tag)"
              >
                #{{ tag }}&thinsp;×
              </button>
              <button class="clear-btn" @click="clearFilters">
                Tout effacer
              </button>
            </div>
          </Transition>
        </div>

        <!-- Zoom control -->
        <div class="zoom-control">
          <button
            class="zoom-btn"
            @click="zoomOut"
            :disabled="zoom <= 1"
            aria-label="Réduire"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <line x1="3" y1="8" x2="13" y2="8" />
            </svg>
          </button>
          <input
            type="range"
            class="zoom-slider"
            v-model.number="zoom"
            min="1"
            max="5"
            step="1"
            aria-label="Zoom de la grille"
          />
          <button
            class="zoom-btn"
            @click="zoomIn"
            :disabled="zoom >= 5"
            aria-label="Agrandir"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <line x1="8" y1="3" x2="8" y2="13" />
              <line x1="3" y1="8" x2="13" y2="8" />
            </svg>
          </button>
        </div>

        <ThemeToggle />
      </header>

      <!-- Gallery -->
      <div class="gallery-scroll">
        <main
          class="gallery"
          :style="{ '--card-min': cardMinSize + 'px' }"
          :data-zoom="zoom"
        >
          <article
            v-for="image in displayedImages"
            :key="image.filename"
            class="card"
            @click="selectedImage = image"
          >
            <div class="card-img">
              <img
                :src="imgUrl(image.filename)"
                :alt="image.name"
                loading="lazy"
                @error="onImgError(image.filename)"
              />
            </div>
            <div class="card-body">
              <p class="card-name" :title="image.name">{{ image.name }}</p>
              <div class="card-tags">
                <span
                  v-for="tag in image.tags.slice(0, 3)"
                  :key="tag"
                  class="chip"
                  >{{ tag }}</span
                >
              </div>
            </div>
          </article>

          <p v-if="filteredImages.length === 0" class="empty-state">
            Aucune illustration trouvée
          </p>
        </main>

        <AppFooter>
          Vous cherchez des icônes ?
          <a href="#/icons" class="app-footer-link"
            >Parcourir la bibliothèque d’icônes →</a
          >
        </AppFooter>
      </div>
    </div>

    <!-- ─── Modal ────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="selectedImage"
          class="modal-backdrop"
          @click.self="selectedImage = null"
        >
          <div class="modal" @click.stop>
            <button
              class="modal-close"
              @click="selectedImage = null"
              aria-label="Fermer"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            <div class="modal-img">
              <img
                :src="imgUrl(selectedImage.filename)"
                :alt="selectedImage.name"
              />
            </div>

            <div class="modal-body">
              <h3 class="modal-name">{{ selectedImage.name }}</h3>
              <div class="modal-actions">
                <button
                  class="action-btn"
                  @click="downloadImage(selectedImage)"
                  title="Télécharger l'image"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Télécharger
                </button>
                <button
                  class="action-btn"
                  @click="copyImage(selectedImage)"
                  title="Copier l'image"
                >
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
                  {{ copyFeedback || "Copier" }}
                </button>
              </div>
              <div class="modal-tags">
                <button
                  v-for="tag in selectedImage.tags"
                  :key="tag"
                  :class="[
                    'tag-btn',
                    { 'tag-btn--active': activeTags.includes(tag) },
                  ]"
                  @click="
                    toggleTag(tag);
                    selectedImage = null;
                  "
                >
                  #{{ tag }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import catalog from "./catalog.json";
import modesList from "./modes.json";
import { scoreImage, hasFuzzyHits } from "./fuzzy.js";
import SidebarHeader from "./SidebarHeader.vue";
import ThemeToggle from "./ThemeToggle.vue";
import AppFooter from "./AppFooter.vue";

// ── Modes ────────────────────────────────────────────────
const MODES = modesList;

const selectedMode = ref(localStorage.getItem("mode") ?? "Purple");

// ── State ────────────────────────────────────────────────
const query = ref("");
const activeTags = ref([]);
const selectedImage = ref(null);

// ── Zoom ─────────────────────────────────────────────────
const ZOOM_SIZES = [72, 110, 160, 220, 300];
const zoom = ref(parseInt(localStorage.getItem("zoom") ?? "2"));
const cardMinSize = computed(() => ZOOM_SIZES[zoom.value - 1]);

watch(zoom, (v) => localStorage.setItem("zoom", String(v)));

function zoomIn() {
  if (zoom.value < 5) zoom.value++;
}
function zoomOut() {
  if (zoom.value > 1) zoom.value--;
}

watch(
  [query, activeTags, selectedMode],
  () => {
    failedImages.value = new Set();
  },
  { deep: true },
);

watch(selectedMode, (v) => {
  localStorage.setItem("mode", v);
  failedImages.value = new Set();
});

// ── Failed images ───────────────────────────────────────
const failedImages = ref(new Set());

function onImgError(filename) {
  failedImages.value = new Set([...failedImages.value, filename]);
}

// ── Helpers ──────────────────────────────────────────────
function imgUrl(filename) {
  const dir = selectedMode.value.replace(/ /g, "%20");
  return (
    import.meta.env.BASE_URL +
    "illustrations/" +
    dir +
    "/" +
    filename.replace(/ /g, "%20")
  );
}

// ── Computed data ────────────────────────────────────────
const totalTags = computed(
  () => new Set(catalog.flatMap((img) => img.tags)).size,
);

const popularTags = computed(() => {
  const freq = {};
  catalog.forEach((img) =>
    img.tags.forEach((t) => {
      freq[t] = (freq[t] || 0) + 1;
    }),
  );
  return Object.entries(freq)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50);
});

const scoredImages = computed(() => {
  const tokens = query.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const tags = activeTags.value;
  const failed = failedImages.value;
  const results = catalog
    .map((img) => ({ img, score: scoreImage(img, tokens) }))
    .filter(({ score, img }) => {
      if (score === 0) return false;
      if (failed.has(img.filename)) return false;
      if (tags.length && !tags.every((t) => img.tags.includes(t))) return false;
      return true;
    });
  if (tokens.length) results.sort((a, b) => b.score - a.score);
  return results;
});

const fuzzyActive = computed(() =>
  hasFuzzyHits(scoredImages.value.map((r) => r.score)),
);

const filteredImages = computed(() => scoredImages.value.map((r) => r.img));

const displayedImages = computed(() => filteredImages.value);

// ── Image actions ───────────────────────────────────────
const copyFeedback = ref("");

async function downloadImage(image) {
  const url = imgUrl(image.filename);
  const res = await fetch(url);
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = image.filename.split("/").pop();
  a.click();
  URL.revokeObjectURL(blobUrl);
}

async function copyImage(image) {
  try {
    const url = imgUrl(image.filename);
    const res = await fetch(url);
    const blob = await res.blob();
    await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
    copyFeedback.value = "Copié !";
  } catch {
    copyFeedback.value = "Erreur";
  } finally {
    setTimeout(() => {
      copyFeedback.value = "";
    }, 2000);
  }
}

// ── Actions ──────────────────────────────────────────────
function toggleTag(tag) {
  const idx = activeTags.value.indexOf(tag);
  if (idx === -1) activeTags.value.push(tag);
  else activeTags.value.splice(idx, 1);
}

function clearFilters() {
  query.value = "";
  activeTags.value = [];
  nextTick(() => {
    document.querySelector(".gallery-scroll")?.scrollTo({ top: 0 });
  });
}
</script>
