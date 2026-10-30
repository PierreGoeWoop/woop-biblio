<template>
  <IconsView v-if="view === 'icons'" />
  <IllustrationsView v-else />
</template>

<script setup>
import { ref, watchEffect, onMounted, onUnmounted } from "vue";
import IllustrationsView from "./IllustrationsView.vue";
import IconsView from "./IconsView.vue";

// ── Vue courante, pilotée par le hash (#/icons) ───────────
const readView = () =>
  location.hash.startsWith("#/icons") ? "icons" : "illustrations";

const view = ref(readView());

watchEffect(() => {
  document.title =
    view.value === "icons"
      ? "Bibliothèque — Icônes"
      : "Bibliothèque — Illustrations";
});

function onHashChange() {
  view.value = readView();
}

onMounted(() => window.addEventListener("hashchange", onHashChange));
onUnmounted(() => window.removeEventListener("hashchange", onHashChange));
</script>
