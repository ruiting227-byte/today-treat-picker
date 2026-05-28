import React, { useEffect, useMemo, useState } from "react";

import { THEMES, readTheme, saveTheme } from "./lib/theme.js";
import { getOrCreateMe, saveMe } from "./lib/identity.js";
import { usePresence } from "./lib/presence.js";
import { useRoom, normalizeRoomCode, CATEGORIES } from "./lib/room.js";

import { RoomGate } from "./components/RoomGate.jsx";
import { ThemePicker } from "./components/ThemePicker.jsx";
import { SlotDisplay } from "./components/SlotDisplay.jsx";
import { DialDisplay } from "./components/DialDisplay.jsx";
import { Members } from "./components/Members.jsx";
import { History } from "./components/History.jsx";
import { ConnectionBadge } from "./components/ConnectionBadge.jsx";
import { InviteModal } from "./components/InviteModal.jsx";
import {
  Copy, Logout, Plus, Trash, Reset, Dice, Bolt, Check, Alert, QrCode
} from "./components/Icons.jsx";

const ROOM_KEY = "today-treat-picker-active-room";
const DRAW_STYLE_KEY = "today-treat-picker-draw-style";

function readRoom() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("room");
    if (fromUrl) return normalizeRoomCode(fromUrl);
    return localStorage.getItem(ROOM_KEY) || "";
  } catch { return ""; }
}
function writeRoom(v) { try { v ? localStorage.setItem(ROOM_KEY, v) : localStorage.removeItem(ROOM_KEY); } catch {} }
function readDrawStyle() { try { return localStorage.getItem(DRAW_STYLE_KEY) || "slot"; } catch { return "slot"; } }
function writeDrawStyle(v) { try { localStorage.setItem(DRAW_STYLE_KEY, v); } catch {} }

export default function App() {
  const [themeId, setThemeId] = useState(readTheme);
  const theme = THEMES[themeId] || THEMES.rose;

  const [me, setMe] = useState(getOrCreateMe);
  const [roomCode, setRoomCode] = useState(readRoom);
  const [drawStyle, setDrawStyle] = useState(readDrawStyle);

  const [selectedCategory, setSelectedCategory] = useState("meal");
  const [newItem, setNewItem] = useState("");
  const [lastDraw, setLastDraw] = useState(null);
  const [rollingText, setRollingText] = useState("准备抽签啦");
  const [isDrawing, setIsDrawing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dialRotation, setDialRotation] = useState(0);
  const [justAdded, setJustAdded] = useState(null);
  const [showInvite, setShowInvite] = useState(false);

  // 读完 ?room= 后把它从地址栏抹掉，房间状态后续由 React state / localStorage 接管
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (url.searchParams.has("room")) {
        url.searchParams.delete("room");
        window.history.replaceState({}, "", url.pathname + url.search + url.hash);
      }
    } catch {}
  }, []);

  const { options, history, error, addOption, removeOption, resetLibrary, recordDraw } = useRoom(roomCode);
  const peers = usePresence(roomCode, me);

  const memberList = useMemo(() => {
    const arr = Object.values(peers).filter((p) => p.id !== me.id);
    return [{ ...me, self: true }, ...arr];
  }, [peers, me]);

  const currentCategory = useMemo(
    () => CATEGORIES.find((c) => c.id === selectedCategory),
    [selectedCategory]
  );
  const currentOptions = options[selectedCategory] || [];
  const currentDrawMatches = lastDraw?.category === selectedCategory;

  // theme + body bg
  useEffect(() => {
    saveTheme(themeId);
    document.body.style.background = theme.bg;
    document.body.style.color = theme.dark ? "#f8fafc" : "#0f172a";
    document.documentElement.style.setProperty("--theme-shadow", theme.shadow);
  }, [theme, themeId]);

  useEffect(() => { writeRoom(roomCode); }, [roomCode]);
  useEffect(() => { writeDrawStyle(drawStyle); }, [drawStyle]);

  const dens = { gap: "gap-6", pad: "p-7 sm:p-10", radius: "rounded-[28px]" };

  function joinRoom(c) {
    const n = normalizeRoomCode(c);
    if (!n) return;
    setRoomCode(n);
    setLastDraw(null);
    setRollingText("准备抽签啦");
  }
  function leaveRoom() {
    setRoomCode("");
    setSelectedCategory("meal");
    setLastDraw(null);
    setRollingText("准备抽签啦");
  }
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }
  function renameMe(name) {
    const next = { ...me, name };
    setMe(next); saveMe(next);
  }

  function drawTreat() {
    if (!currentOptions.length || isDrawing) return;
    setIsDrawing(true);
    setLastDraw(null);

    if (drawStyle === "dial") {
      const fi = Math.floor(Math.random() * currentOptions.length);
      const fr = currentOptions[fi];
      const n = currentOptions.length;
      const sliceCenter = (fi + 0.5) * (360 / n);
      const target = 360 * 5 - sliceCenter - 90;
      setDialRotation((prev) => prev + target);
      setTimeout(() => {
        finishDraw(fr);
      }, 3300);
      return;
    }

    let count = 0;
    const interval = setInterval(() => {
      const ri = Math.floor(Math.random() * currentOptions.length);
      setRollingText(currentOptions[ri]);
      count++;
      if (count >= 18) {
        clearInterval(interval);
        const fi = Math.floor(Math.random() * currentOptions.length);
        const fr = currentOptions[fi];
        setRollingText(fr);
        finishDraw(fr);
      }
    }, 70);
  }

  function finishDraw(result) {
    setLastDraw({ category: selectedCategory, result, at: "刚刚" });
    setIsDrawing(false);
    recordDraw(selectedCategory, result, me);
  }

  function handleAdd() {
    const v = newItem.trim();
    if (!v) return;
    addOption(selectedCategory, v);
    setJustAdded(v);
    setTimeout(() => setJustAdded(null), 600);
    setNewItem("");
  }

  if (!roomCode) {
    return (
      <RoomGate
        onJoin={joinRoom}
        theme={theme}
        themeId={themeId}
        onThemeChange={setThemeId}
      />
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-8 sm:py-10"
          style={{ background: theme.bg, color: theme.dark ? "#f8fafc" : "#0f172a" }}>
      <div className="mx-auto max-w-6xl">
        {/* Top bar */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl"
                 style={{ background: theme.accent, color: "#fff", boxShadow: `0 8px 18px -8px ${theme.shadow}` }}>🥟</div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: theme.accent }}>
                TODAY · TREAT · PICKER
              </p>
              <h1 className="text-xl font-black tracking-tight">今天请吃什么</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ConnectionBadge compact theme={theme} />
            <ThemePicker themeId={themeId} onChange={setThemeId} theme={theme} compact />
            <div className="flex items-center gap-2 rounded-2xl border px-2 py-1.5"
                 style={{ borderColor: theme.stroke, background: theme.dark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.7)" }}>
              <span className="px-2 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: theme.dark ? "rgba(248,250,252,.5)" : "rgba(15,23,42,.5)" }}>
                房间
              </span>
              <span className="font-mono-dm px-2 text-base font-black tracking-[0.15em]">{roomCode}</span>
              <button onClick={copyCode}
                      className="rounded-xl p-2 transition hover:bg-black/5"
                      aria-label="复制房间码"
                      style={{ color: copied ? theme.accent : "inherit" }}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
              <button onClick={() => setShowInvite(true)}
                      className="rounded-xl p-2 transition hover:bg-black/5"
                      aria-label="显示房间二维码">
                <QrCode size={16} />
              </button>
              <button onClick={leaveRoom}
                      className="rounded-xl p-2 transition hover:bg-black/5"
                      aria-label="退出房间">
                <Logout size={16} />
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-2xl border bg-rose-50/80 px-4 py-3 text-sm font-medium text-rose-700"
               style={{ borderColor: "rgba(244,63,94,.2)" }}>
            <Alert size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Grid */}
        <div className={`grid ${dens.gap} lg:grid-cols-[1.1fr_0.9fr]`}>
          {/* LEFT: draw card */}
          <section className={`${dens.radius} relative overflow-hidden border backdrop-blur`}
                   style={{
                     background: theme.dark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.85)",
                     borderColor: theme.stroke,
                     boxShadow: `0 30px 80px -30px ${theme.shadow}`
                   }}>
            <div className="relative overflow-hidden px-7 pb-6 pt-8 sm:px-10" style={{ background: theme.panelTint }}>
              <div className="grain pointer-events-none absolute inset-0 opacity-40" />
              <div className="relative flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: theme.accentDeep }}>
                    STEP 02 · DRAW
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl"
                      style={{ color: theme.dark ? "#fefce8" : "#0f172a" }}>
                    今天，<span style={{ color: theme.accent }}>{currentCategory.label}</span>请什么？
                  </h2>
                  <p className="mt-1 text-sm" style={{ color: theme.dark ? "rgba(248,250,252,.6)" : "rgba(15,23,42,.55)" }}>
                    {currentCategory.line}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setDrawStyle(drawStyle === "slot" ? "dial" : "slot")}
                          className="rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-bold transition hover:bg-white"
                          style={{ color: theme.accentDeep }}>
                    {drawStyle === "slot" ? "切到转盘" : "切到滚动条"}
                  </button>
                  <div className="rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-bold"
                       style={{ color: theme.accentDeep }}>
                    {currentOptions.length} 个备选
                  </div>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-4 gap-2 sm:gap-3">
                {CATEGORIES.map((c) => {
                  const active = selectedCategory === c.id;
                  return (
                    <button key={c.id}
                            onClick={() => {
                              setSelectedCategory(c.id);
                              setRollingText(lastDraw?.category === c.id ? lastDraw.result : "准备抽签啦");
                            }}
                            className="group rounded-2xl border px-3 py-3 text-left transition"
                            style={{
                              borderColor: active ? theme.accent : "transparent",
                              background: active ? "#fff" : "rgba(255,255,255,.45)",
                              boxShadow: active ? `0 12px 24px -12px ${theme.shadow}` : "none"
                            }}>
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{c.glyph}</span>
                        <span className="font-mono-dm text-[10px] font-bold"
                              style={{ color: active ? theme.accent : "rgba(15,23,42,.4)" }}>
                          {String(options[c.id]?.length || 0).padStart(2, "0")}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-bold"
                         style={{ color: active ? theme.accentDeep : "#0f172a" }}>{c.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={dens.pad}>
              {drawStyle === "dial" ? (
                <DialDisplay finalText={lastDraw?.result} isDrawing={isDrawing} theme={theme}
                             currentCategory={currentCategory} options={currentOptions} rotation={dialRotation} />
              ) : (
                <SlotDisplay rolling={rollingText} finalText={lastDraw?.result} isDrawing={isDrawing}
                             theme={theme} currentCategory={currentCategory} />
              )}

              {currentDrawMatches && !isDrawing && (
                <div className="mt-6 flex items-center justify-between rounded-2xl px-5 py-4"
                     style={{ background: theme.accent, color: "#fff", boxShadow: `0 16px 30px -14px ${theme.shadow}` }}>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-80">今日结论</p>
                    <p className="mt-0.5 text-xl font-black">请客内容：{lastDraw.result}</p>
                  </div>
                  <button onClick={drawTreat}
                          className="rounded-full bg-white/20 px-3 py-2 text-xs font-bold backdrop-blur transition hover:bg-white/30">
                    再抽一次
                  </button>
                </div>
              )}

              <button
                onClick={drawTreat}
                disabled={!currentOptions.length || isDrawing}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-5 text-base font-black tracking-wide transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  background: theme.dark ? theme.accent : "#0f172a",
                  color: theme.dark ? "#0f172a" : "#fff",
                  boxShadow: `0 18px 40px -16px ${theme.dark ? theme.shadow : "rgba(15,23,42,.4)"}`
                }}>
                {isDrawing ? <Dice size={20} /> : <Bolt size={18} />}
                {isDrawing ? "命运正在挑选…" : currentOptions.length ? "开始抽签" : "先去右边加几个备选"}
              </button>
            </div>
          </section>

          {/* RIGHT: list + sidebar */}
          <aside className="flex flex-col gap-5">
            <Members
              memberList={memberList}
              me={me}
              onRename={renameMe}
              onInvite={() => setShowInvite(true)}
              theme={theme}
              dens={dens}
            />

            <div className={`${dens.radius} flex flex-1 flex-col border backdrop-blur`}
                 style={{ background: theme.dark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.9)", borderColor: theme.stroke }}>
              <div className="flex items-start justify-between gap-3 border-b px-6 pb-4 pt-5"
                   style={{ borderColor: theme.stroke }}>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
                    STEP 03 · CURATE
                  </p>
                  <h3 className="mt-1 text-lg font-black tracking-tight">想吃清单 · {currentCategory.label}</h3>
                </div>
                <button onClick={resetLibrary}
                        className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition hover:-translate-y-0.5"
                        style={{ borderColor: theme.stroke, color: theme.dark ? "rgba(248,250,252,.6)" : "rgba(15,23,42,.55)" }}>
                  <Reset size={12} /> 重置
                </button>
              </div>

              <div className="px-6 pt-4">
                <div className="flex gap-2 rounded-2xl border p-1.5"
                     style={{ borderColor: theme.stroke, background: theme.dark ? "rgba(0,0,0,.2)" : "#fafafa" }}>
                  <input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder={`+ 加一个想吃的${currentCategory.label}`}
                    className="min-w-0 flex-1 rounded-xl bg-transparent px-3 py-2.5 text-sm outline-none placeholder:opacity-50"
                    style={{ color: theme.dark ? "#f8fafc" : "#0f172a" }}
                  />
                  <button onClick={handleAdd}
                          className="inline-flex items-center justify-center rounded-xl px-3.5 font-bold text-white transition hover:-translate-y-0.5"
                          style={{ background: theme.accent }}
                          aria-label="添加">
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="px-6 pb-5 pt-3">
                {currentOptions.length ? (
                  <ul className="flex flex-wrap gap-2">
                    {currentOptions.map((item, i) => {
                      const isJust = item === justAdded;
                      const isWinner = currentDrawMatches && lastDraw?.result === item;
                      return (
                        <li key={item}
                            className="group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition"
                            style={{
                              borderColor: isWinner ? theme.accent : theme.stroke,
                              background: isWinner ? theme.accent : (isJust ? theme.accentSoft : (theme.dark ? "rgba(255,255,255,.04)" : "#fff")),
                              color: isWinner ? "#fff" : (theme.dark ? "#f8fafc" : "#0f172a"),
                              transform: isJust ? "scale(1.06)" : "none"
                            }}>
                          <span className="font-mono-dm text-[10px] opacity-50">{String(i + 1).padStart(2, "0")}</span>
                          <span className="font-bold">{item}</span>
                          <button onClick={() => removeOption(selectedCategory, item)}
                                  className="-mr-1 ml-0.5 rounded-full p-1 opacity-0 transition group-hover:opacity-100"
                                  aria-label={`删除 ${item}`}
                                  style={{ color: isWinner ? "#fff" : "inherit" }}>
                            <Trash size={12} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <div className="rounded-2xl border border-dashed py-10 text-center text-sm"
                       style={{ borderColor: theme.stroke, color: theme.dark ? "rgba(248,250,252,.45)" : "rgba(15,23,42,.45)" }}>
                    这个分类还空空的。<br />先加几个想吃的吧 👆
                  </div>
                )}
              </div>
            </div>

            <History history={history} theme={theme} dens={dens} />
          </aside>
        </div>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 text-xs"
                style={{ color: theme.dark ? "rgba(248,250,252,.35)" : "rgba(15,23,42,.4)" }}>
          <p>房间码即口令 · 同一码 = 同一份清单</p>
          <p className="font-mono-dm">v1.0 · today-treat-picker</p>
        </footer>
      </div>

      {showInvite && (
        <InviteModal roomCode={roomCode} theme={theme} onClose={() => setShowInvite(false)} />
      )}
    </main>
  );
}
