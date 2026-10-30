<template>
  <!-- Header Card -->
  <div class="sidebar-hc">
    <div class="sidebar-hc-logo">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    </div>
    <div class="sidebar-hc-text">
      <span class="sidebar-hc-title">Bibliothèque</span>
      <span class="sidebar-hc-sub">{{
        view === "icons" ? "Icônes" : "Illustrations"
      }}</span>
    </div>
  </div>

  <!-- View switch -->
  <nav class="view-switch" aria-label="Bibliothèque">
    <a
      href="#/"
      :class="['view-switch-btn', { 'view-switch-btn--active': view === 'illustrations' }]"
      >Illustrations</a
    >
    <a
      href="#/icons"
      :class="['view-switch-btn', { 'view-switch-btn--active': view === 'icons' }]"
      >Icônes</a
    >
  </nav>
</template>

<script setup>
defineProps({ view: { type: String, required: true } });
</script>
