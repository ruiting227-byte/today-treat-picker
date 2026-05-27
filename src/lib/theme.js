export const THEMES = {
  rose: {
    name: "暖玫",
    bg: "linear-gradient(135deg,#fff1f2 0%,#ffffff 35%,#fff7ed 100%)",
    accent: "#f43f5e",
    accentSoft: "#ffe4e6",
    accentDeep: "#9f1239",
    panelTint: "linear-gradient(135deg,#ffe4e6 0%,#fed7aa 100%)",
    chipBg: "#fff1f2",
    ring: "rgba(244,63,94,.22)",
    shadow: "rgba(244,63,94,.30)",
    stroke: "#fecdd3",
    dark: false
  },
  matcha: {
    name: "抹茶",
    bg: "linear-gradient(135deg,#f0fdf4 0%,#ffffff 35%,#ecfeff 100%)",
    accent: "#10b981",
    accentSoft: "#d1fae5",
    accentDeep: "#065f46",
    panelTint: "linear-gradient(135deg,#d1fae5 0%,#a7f3d0 100%)",
    chipBg: "#ecfdf5",
    ring: "rgba(16,185,129,.22)",
    shadow: "rgba(16,185,129,.30)",
    stroke: "#a7f3d0",
    dark: false
  },
  midnight: {
    name: "深夜食堂",
    bg: "linear-gradient(135deg,#0b1020 0%,#13182e 50%,#0f172a 100%)",
    accent: "#fbbf24",
    accentSoft: "rgba(251,191,36,.18)",
    accentDeep: "#fde68a",
    panelTint: "linear-gradient(135deg,#1e293b 0%,#0f172a 100%)",
    chipBg: "rgba(255,255,255,.06)",
    ring: "rgba(251,191,36,.35)",
    shadow: "rgba(251,191,36,.25)",
    stroke: "rgba(255,255,255,.08)",
    dark: true
  }
};

export const THEME_LIST = [
  { id: "rose",     name: "暖玫",     swatches: ["#f43f5e", "#fed7aa", "#ffe4e6"] },
  { id: "matcha",   name: "抹茶",     swatches: ["#10b981", "#a7f3d0", "#ecfdf5"] },
  { id: "midnight", name: "深夜食堂", swatches: ["#fbbf24", "#1e293b", "#0b1020"] }
];

const THEME_KEY = "today-treat-picker-theme";

export function readTheme() {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && THEMES[saved]) return saved;
  } catch {}
  return "rose";
}

export function saveTheme(id) {
  try { localStorage.setItem(THEME_KEY, id); } catch {}
}
