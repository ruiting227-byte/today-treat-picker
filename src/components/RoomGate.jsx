import React, { useState } from "react";
import { normalizeRoomCode, randomRoomCode, CATEGORIES, DEFAULT_OPTIONS } from "../lib/room.js";
import { ThemePicker } from "./ThemePicker.jsx";
import { ConnectionBadge } from "./ConnectionBadge.jsx";
import { Users, Door, Spark } from "./Icons.jsx";

export function RoomGate({ onJoin, theme, themeId, onThemeChange }) {
  const [input, setInput] = useState("");
  const [created, setCreated] = useState("");

  const join = (code) => {
    const n = normalizeRoomCode(code);
    if (!n) return;
    onJoin(n);
  };
  const create = () => {
    const c = randomRoomCode();
    setCreated(c);
    setInput(c);
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-8"
          style={{ background: theme.bg, color: theme.dark ? "#f8fafc" : "#0f172a" }}>
      <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] backdrop-blur lg:grid-cols-[0.95fr_1.05fr]"
             style={{
               background: theme.dark ? "rgba(15,23,42,.65)" : "rgba(255,255,255,.85)",
               boxShadow: `0 30px 90px -30px ${theme.shadow}`,
               border: `1px solid ${theme.stroke}`
             }}>
          {/* Left */}
          <div className="relative overflow-hidden p-8 sm:p-12" style={{ background: theme.panelTint }}>
            <div className="grain pointer-events-none absolute inset-0 opacity-40" />
            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-xs font-bold"
                   style={{ color: theme.accentDeep }}>
                <Users size={14} /> 共享房间 · 实时同步
              </div>
              <h1 className="text-[44px] sm:text-6xl font-black leading-[1.02] tracking-tight"
                  style={{ color: theme.dark ? "#fefce8" : "#0f172a" }}>
                今天<br />请吃<span style={{ color: theme.accent }}>什么</span>？
              </h1>
              <p className="mt-5 max-w-sm text-[15px] leading-7"
                 style={{ color: theme.dark ? "rgba(248,250,252,.7)" : "rgba(15,23,42,.65)" }}>
                输入同一个房间码，和朋友一起维护一份"想吃清单"。<br />
                抽到什么，今天就请什么 ——<span className="font-bold"> 命运比纠结快多了</span>。
              </p>

              <div className="mt-10 grid max-w-sm grid-cols-2 gap-3">
                {CATEGORIES.map((c) => (
                  <div key={c.id}
                       className="flex items-center gap-3 rounded-2xl bg-white/55 px-3 py-2.5 backdrop-blur">
                    <span className="text-2xl">{c.glyph}</span>
                    <div>
                      <p className="text-sm font-bold" style={{ color: theme.dark ? "#fefce8" : "#0f172a" }}>{c.label}</p>
                      <p className="text-[11px]" style={{ color: theme.dark ? "rgba(248,250,252,.55)" : "rgba(15,23,42,.5)" }}>
                        {DEFAULT_OPTIONS[c.id].length} 个常驻
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="p-8 sm:p-12">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
                  STEP 01 · ENTER
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight"
                    style={{ color: theme.dark ? "#fefce8" : "#0f172a" }}>
                  输入或创建房间码
                </h2>
              </div>
              <ConnectionBadge compact theme={theme} />
            </div>
            <p className="mt-3 text-sm leading-6"
               style={{ color: theme.dark ? "rgba(248,250,252,.6)" : "rgba(15,23,42,.55)" }}>
              同一个房间码 = 同一份清单 ૮ ・ﻌ・ა ✿
            </p>

            <div className="mt-7 rounded-3xl border p-5"
                 style={{ borderColor: theme.stroke, background: theme.dark ? "rgba(255,255,255,.04)" : "#fafafa" }}>
              <label className="mb-2 block px-1 text-xs font-bold uppercase tracking-wider"
                     style={{ color: theme.dark ? "rgba(248,250,252,.55)" : "rgba(15,23,42,.5)" }}>
                房间码
              </label>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && join(input)}
                placeholder="例如：EAT-520"
                className="font-mono-dm w-full rounded-2xl border bg-white px-4 py-4 text-lg font-bold uppercase tracking-[0.15em] outline-none transition"
                style={{ borderColor: theme.stroke, color: "#0f172a" }}
                onFocus={(e) => (e.target.style.boxShadow = `0 0 0 4px ${theme.ring}`)}
                onBlur={(e) => (e.target.style.boxShadow = "none")}
              />
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                <button
                  onClick={() => join(input)}
                  disabled={!normalizeRoomCode(input)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-bold transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ background: theme.dark ? theme.accent : "#0f172a", color: theme.dark ? "#0f172a" : "#fff" }}>
                  <Door size={18} /> 进入房间
                </button>
                <button
                  onClick={create}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 font-bold text-white transition hover:-translate-y-0.5"
                  style={{ background: theme.accent, boxShadow: `0 10px 24px -10px ${theme.shadow}` }}>
                  <Spark size={18} /> 随机创建
                </button>
              </div>
            </div>

            {created && (
              <div className="mt-5 rounded-3xl border p-5"
                   style={{ borderColor: theme.stroke, background: theme.accentSoft }}>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.accentDeep }}>已生成房间码</p>
                <p className="font-mono-dm mt-1 text-3xl font-black tracking-[0.2em]" style={{ color: theme.accentDeep }}>{created}</p>
                <p className="mt-2 text-sm" style={{ color: theme.accentDeep, opacity: 0.7 }}>
                  把这个码发给朋友，对方输入后就在同一个房间里。
                </p>
              </div>
            )}

            <p className="mt-6 text-xs leading-5"
               style={{ color: theme.dark ? "rgba(248,250,252,.4)" : "rgba(15,23,42,.4)" }}>
              提示：房间码即口令，知道码的人都可进入。<br />码就是钥匙 —— 发给想一起开饭的人就好，可别手滑甩进 500 人大群 🤭
            </p>

            {/* Personal skin picker */}
            <div className="mt-7 border-t pt-6" style={{ borderColor: theme.stroke }}>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: theme.accent }}>YOUR SKIN</p>
                  <p className="mt-1 text-sm font-bold" style={{ color: theme.dark ? "#fefce8" : "#0f172a" }}>挑一个喜欢的色调</p>
                </div>
                <span className="text-[10px]" style={{ color: theme.dark ? "rgba(248,250,252,.45)" : "rgba(15,23,42,.45)" }}>仅你自己可见</span>
              </div>
              <ThemePicker themeId={themeId} onChange={onThemeChange} theme={theme} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
