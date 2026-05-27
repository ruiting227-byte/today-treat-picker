import React from "react";
import { CATEGORIES } from "../lib/room.js";
import { Clock } from "./Icons.jsx";

export function History({ history, theme, dens }) {
  return (
    <div className={`${dens.radius} border p-5 backdrop-blur`}
         style={{
           background: theme.dark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.85)",
           borderColor: theme.stroke
         }}>
      <div className="mb-3 flex items-center justify-between">
        <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em]"
           style={{ color: theme.accent }}>
          <Clock size={11} /> 最近抽签
        </p>
        <span className="font-mono-dm text-[10px]"
              style={{ color: theme.dark ? "rgba(248,250,252,.5)" : "rgba(15,23,42,.4)" }}>
          LAST {history.length}
        </span>
      </div>
      {history.length === 0 ? (
        <p className="rounded-2xl border border-dashed py-8 text-center text-sm"
           style={{ borderColor: theme.stroke, color: theme.dark ? "rgba(248,250,252,.45)" : "rgba(15,23,42,.45)" }}>
          还没有人抽过签。<br />做第一个吧。
        </p>
      ) : (
        <ul className="space-y-2">
          {history.slice(0, 5).map((h, i) => {
            const cat = CATEGORIES.find((c) => c.id === h.category);
            return (
              <li key={`${h.at}-${h.result}-${i}`}
                  className="flex items-center gap-3 rounded-xl px-2 py-1.5"
                  style={{ background: i === 0 ? theme.accentSoft : "transparent" }}>
                <span className="text-lg">{cat?.glyph}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold"
                     style={{ color: i === 0 ? theme.accentDeep : (theme.dark ? "#f8fafc" : "#0f172a") }}>
                    {h.result}
                  </p>
                  <p className="text-[11px]"
                     style={{ color: theme.dark ? "rgba(248,250,252,.45)" : "rgba(15,23,42,.45)" }}>
                    {h.who} 抽中 · {cat?.label} · {h.at}
                  </p>
                </div>
                {i === 0 && (
                  <span className="rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wider"
                        style={{ background: theme.accent, color: "#fff" }}>
                    NEW
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
