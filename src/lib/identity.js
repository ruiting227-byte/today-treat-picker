const NICKNAME_POOL = ["小满", "阿黎", "凉粉", "饭团", "豆豆", "麻薯", "椰果", "海苔", "布丁", "可可", "西柚", "桃桃", "栗子", "拿铁", "茉莉", "芋头", "莲子", "椒麻"];
const COLOR_POOL = ["#f43f5e", "#fb923c", "#10b981", "#8b5cf6", "#0ea5e9", "#ec4899", "#84cc16", "#f59e0b", "#06b6d4", "#a855f7"];

const ME_KEY = "today-treat-picker-me";

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getOrCreateMe() {
  try {
    const saved = localStorage.getItem(ME_KEY);
    if (saved) {
      const m = JSON.parse(saved);
      if (m && m.id && m.name && m.color) return m;
    }
  } catch {}
  const me = {
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    name: rand(NICKNAME_POOL),
    color: rand(COLOR_POOL)
  };
  saveMe(me);
  return me;
}

export function saveMe(me) {
  try { localStorage.setItem(ME_KEY, JSON.stringify(me)); } catch {}
}
