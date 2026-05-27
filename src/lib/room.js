import { useEffect, useState } from "react";
import { supabase, cloudReady } from "./supabase.js";

export const CATEGORIES = [
  { id: "meal",    label: "正餐", glyph: "🍱", line: "今天的主角，吃饱才有力气" },
  { id: "milkTea", label: "奶茶", glyph: "🧋", line: "下午三点的精神支柱" },
  { id: "dessert", label: "甜点", glyph: "🍰", line: "犒劳自己的小确幸" },
  { id: "snack",   label: "零食", glyph: "🍿", line: "嘴巴的背景音乐" }
];

export const DEFAULT_OPTIONS = {
  meal:    ["寿司", "火锅", "烤肉", "麻辣烫", "牛肉饭", "炸猪排饭", "韩式拌饭", "披萨"],
  milkTea: ["芋泥波波奶茶", "多肉葡萄", "珍珠奶茶", "杨枝甘露", "抹茶拿铁", "椰椰拿铁"],
  dessert: ["提拉米苏", "草莓蛋糕", "泡芙", "可丽饼", "冰淇淋", "巴斯克蛋糕"],
  snack:   ["薯片", "鸡米花", "关东煮", "炸鸡块", "辣条", "海苔卷", "爆米花"]
};

export function normalizeRoomCode(value) {
  let raw = (value || "").trim().toUpperCase();
  let result = "";
  let prevDash = false;
  for (const ch of raw) {
    const isNum = ch >= "0" && ch <= "9";
    const isAlp = ch >= "A" && ch <= "Z";
    if (isNum || isAlp || ch === "-" || ch === "_") {
      result += ch;
      prevDash = ch === "-";
    } else if ((ch === " " || ch === "　") && !prevDash && result) {
      result += "-";
      prevDash = true;
    }
  }
  while (result.endsWith("-")) result = result.slice(0, -1);
  return result;
}

export function randomRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "EAT-";
  for (let i = 0; i < 5; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function emptyOptions() {
  return CATEGORIES.reduce((acc, c) => { acc[c.id] = []; return acc; }, {});
}

function buildOptions(rows) {
  const next = emptyOptions();
  for (const row of rows) {
    if (!next[row.category]) continue;
    if (!next[row.category].includes(row.name)) next[row.category].push(row.name);
  }
  return next;
}

function defaultRows(roomCode) {
  const rows = [];
  for (const [cat, names] of Object.entries(DEFAULT_OPTIONS)) {
    for (const name of names) rows.push({ room_code: roomCode, category: cat, name });
  }
  return rows;
}

// ─── Local-storage fallback ───
const lk = (room) => `today-treat-picker-room-${room}-options`;
const dk = (room) => `today-treat-picker-room-${room}-history`;
function readLs(key, fb) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fb; }
  catch { return fb; }
}
function writeLs(key, v) {
  try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
}

// ─── Hook ───
export function useRoom(roomCode) {
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  const [history, setHistory] = useState([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load + subscribe
  useEffect(() => {
    if (!roomCode) return;

    let cancelled = false;
    let optionsCh, drawCh;

    async function loadCloud() {
      try {
        setLoading(true);
        setError("");

        // Ensure room exists, seed defaults if empty
        const { error: roomErr } = await supabase
          .from("rooms").upsert({ code: roomCode }, { onConflict: "code" });
        if (roomErr) throw roomErr;

        const { count, error: countErr } = await supabase
          .from("treat_options")
          .select("id", { count: "exact", head: true })
          .eq("room_code", roomCode);
        if (countErr) throw countErr;

        if (count === 0) {
          const { error: seedErr } = await supabase.from("treat_options").insert(defaultRows(roomCode));
          if (seedErr) throw seedErr;
        }

        await refreshOptions();
        await refreshHistory();
      } catch (e) {
        if (!cancelled) setError(e.message || "进入房间失败");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function refreshOptions() {
      const { data, error } = await supabase
        .from("treat_options")
        .select("category, name, created_at")
        .eq("room_code", roomCode)
        .order("created_at", { ascending: true });
      if (error) throw error;
      if (!cancelled) setOptions(data?.length ? buildOptions(data) : emptyOptions());
    }

    async function refreshHistory() {
      const { data, error } = await supabase
        .from("draw_results")
        .select("category, result, drawer_name, drawer_color, created_at")
        .eq("room_code", roomCode)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      if (!cancelled) {
        setHistory((data || []).map((r) => ({
          who: r.drawer_name || "匿名",
          color: r.drawer_color,
          category: r.category,
          result: r.result,
          at: formatTime(r.created_at)
        })));
      }
    }

    if (cloudReady && supabase) {
      loadCloud();

      optionsCh = supabase
        .channel(`treat-options::${roomCode}`)
        .on("postgres_changes",
          { event: "*", schema: "public", table: "treat_options", filter: `room_code=eq.${roomCode}` },
          () => refreshOptions().catch(() => {}))
        .subscribe();

      drawCh = supabase
        .channel(`treat-draws::${roomCode}`)
        .on("postgres_changes",
          { event: "INSERT", schema: "public", table: "draw_results", filter: `room_code=eq.${roomCode}` },
          () => refreshHistory().catch(() => {}))
        .subscribe();
    } else {
      // local fallback
      setOptions(readLs(lk(roomCode), DEFAULT_OPTIONS));
      setHistory(readLs(dk(roomCode), []));
    }

    return () => {
      cancelled = true;
      if (optionsCh) supabase.removeChannel(optionsCh);
      if (drawCh) supabase.removeChannel(drawCh);
    };
  }, [roomCode]);

  // Persist local state when offline
  useEffect(() => { if (roomCode && !cloudReady) writeLs(lk(roomCode), options); }, [options, roomCode]);
  useEffect(() => { if (roomCode && !cloudReady) writeLs(dk(roomCode), history); }, [history, roomCode]);

  // ─── Mutations ───
  async function addOption(category, name) {
    setError("");
    const trimmed = (name || "").trim();
    if (!trimmed) return;
    if ((options[category] || []).includes(trimmed)) return;

    if (!cloudReady) {
      setOptions((p) => ({ ...p, [category]: [...(p[category] || []), trimmed] }));
      return;
    }
    const { error } = await supabase.from("treat_options")
      .insert({ room_code: roomCode, category, name: trimmed });
    if (error && !/duplicate/i.test(error.message)) setError(error.message);
  }

  async function removeOption(category, name) {
    setError("");
    if (!cloudReady) {
      setOptions((p) => ({ ...p, [category]: (p[category] || []).filter((x) => x !== name) }));
      return;
    }
    const { error } = await supabase.from("treat_options")
      .delete().eq("room_code", roomCode).eq("category", category).eq("name", name);
    if (error) setError(error.message);
  }

  async function resetLibrary() {
    setError("");
    if (!cloudReady) {
      setOptions(DEFAULT_OPTIONS);
      setHistory([]);
      return;
    }
    try {
      const { error: delErr } = await supabase.from("treat_options").delete().eq("room_code", roomCode);
      if (delErr) throw delErr;
      const { error: insErr } = await supabase.from("treat_options").insert(defaultRows(roomCode));
      if (insErr) throw insErr;
    } catch (e) {
      setError(e.message);
    }
  }

  async function recordDraw(category, result, drawer) {
    setError("");
    const entry = {
      who: drawer?.name || "你",
      color: drawer?.color,
      category, result, at: "刚刚"
    };
    if (!cloudReady) {
      setHistory((h) => [entry, ...h].slice(0, 10));
      return;
    }
    const { error } = await supabase.from("draw_results").insert({
      room_code: roomCode, category, result,
      drawer_name: drawer?.name, drawer_color: drawer?.color
    });
    if (error) setError(error.message);
  }

  return { options, history, isLoading, error, addOption, removeOption, resetLibrary, recordDraw };
}

function formatTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yest = new Date(now); yest.setDate(yest.getDate() - 1);
  const sameYest = d.toDateString() === yest.toDateString();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  if (sameDay) return `今天 ${hh}:${mm}`;
  if (sameYest) return `昨天 ${hh}:${mm}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${hh}:${mm}`;
}
