<template>
  <div class="app">
    <!-- ─── Header ─────────────────────────────────────── -->
    <header class="header">
      <div class="header-top">
        <div class="brand">
          <span class="brand-dot" />
          <h1>Bibliothèque</h1>
        </div>

        <label class="search-wrap">
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
          <input
            v-model="query"
            placeholder="Rechercher une illustration…"
            class="search-input"
            autocomplete="off"
          />
          <span v-if="fuzzyActive" class="fuzzy-badge" title="Résultats approximatifs">≈</span>
          <span class="count-badge">{{ filteredImages.length }}</span>
        </label>
      </div>

      <!-- Tag cloud -->
      <div class="tag-cloud">
        <button
          v-for="tag in popularTags"
          :key="tag.name"
          :class="['tag', { 'tag--active': activeTags.includes(tag.name) }]"
          @click="toggleTag(tag.name)"
        >
          {{ tag.name }}<sup>{{ tag.count }}</sup>
        </button>
      </div>

      <!-- Active filters bar -->
      <Transition name="slide">
        <div v-if="activeTags.length" class="active-filters">
          <span class="filters-label">Filtres actifs :</span>
          <button
            v-for="tag in activeTags"
            :key="tag"
            class="filter-chip"
            @click="toggleTag(tag)"
          >
            {{ tag }}&thinsp;×
          </button>
          <button class="clear-all" @click="clearFilters">Tout effacer</button>
        </div>
      </Transition>
    </header>

    <!-- ─── Gallery grid ──────────────────────────────── -->
    <main class="gallery">
      <article
        v-for="image in filteredImages"
        :key="image.filename"
        class="card"
        @click="selectedImage = image"
      >
        <div class="card-img">
          <img :src="imgUrl(image.filename)" :alt="image.name" loading="lazy" />
        </div>
        <div class="card-body">
          <p class="card-title" :title="image.name">{{ image.name }}</p>
          <div class="card-tags">
            <span
              v-for="tag in image.tags.slice(0, 4)"
              :key="tag"
              class="mini-tag"
            >
              {{ tag }}
            </span>
          </div>
        </div>
      </article>

      <p v-if="filteredImages.length === 0" class="empty-state">
        Aucune illustration trouvée
      </p>
    </main>

    <!-- ─── Modal ─────────────────────────────────────── -->
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
              ×
            </button>

            <div class="modal-img">
              <img
                :src="imgUrl(selectedImage.filename)"
                :alt="selectedImage.name"
              />
            </div>

            <div class="modal-footer">
              <h2 class="modal-title">{{ selectedImage.name }}</h2>
              <div class="modal-tags">
                <button
                  v-for="tag in selectedImage.tags"
                  :key="tag"
                  :class="['tag', { 'tag--active': activeTags.includes(tag) }]"
                  @click="
                    toggleTag(tag);
                    selectedImage = null;
                  "
                >
                  {{ tag }}
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
import { ref, computed } from "vue";
import catalog from "./catalog.json";
import { scoreImage, hasFuzzyHits } from "./fuzzy.js";

const query = ref("");
const activeTags = ref([]);
const selectedImage = ref(null);

function imgUrl(filename) {
  return import.meta.env.BASE_URL + filename.replace(/ /g, "%20");
}

// Build tag frequency map, sorted by count desc
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

// Scored & sorted results (query can be fuzzy / approximate)
const scoredImages = computed(() => {
  const tokens = query.value
    .toLowerCase()
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const tags = activeTags.value;

  const results = catalog
    .map((img) => ({ img, score: scoreImage(img, tokens) }))
    .filter(({ score, img }) => {
      if (score === 0) return false;
      if (tags.length && !tags.every((t) => img.tags.includes(t))) return false;
      return true;
    });

  // Sort by relevance when a query is typed
  if (tokens.length) results.sort((a, b) => b.score - a.score);

  return results;
});

const filteredImages = computed(() => scoredImages.value.map((r) => r.img));

// True when the top result was found via fuzzy distance (not exact/prefix/substring)
const fuzzyActive = computed(() =>
  hasFuzzyHits(scoredImages.value.map((r) => r.score)),
);

function toggleTag(tag) {
  const idx = activeTags.value.indexOf(tag);
  if (idx === -1) activeTags.value.push(tag);
  else activeTags.value.splice(idx, 1);
}

function clearFilters() {
  query.value = "";
  activeTags.value = [];
}
</script>
