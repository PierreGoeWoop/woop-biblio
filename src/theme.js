import { ref } from "vue";

// ── Dark mode (état partagé entre les vues) ────────────────
const saved = localStorage.getItem("theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

export const isDark = ref(saved ? saved === "dark" : prefersDark);

function applyTheme(dark) {
  document.documentElement.classList.toggle("dark", dark);
  localStorage.setItem("theme", dark ? "dark" : "light");
}

export function toggleDark() {
  isDark.value = !isDark.value;
  applyTheme(isDark.value);
}

applyTheme(isDark.value);
