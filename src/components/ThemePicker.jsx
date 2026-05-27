import React from "react";
import { THEME_LIST } from "../lib/theme.js";
import { Check } from "./Icons.jsx";

export function ThemePicker({ themeId, onChange, theme, compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 rounded-full border p-1"
           style={{
             borderColor: theme.stroke,
             background: theme.dark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.7)"
           }}>
        {THEME_LIST.map((it) => {
          const active = it.id === themeId;
          return (
            <button key={it.id} onClick={() => onChange(it.id)}
                    aria-label={`切换到 ${it.name}`}
                    title={it.name}
                    className="flex h-7 w-7 items-center justify-center rounded-full transition"
                    style={{
                      background: active ? it.swatches[0] : "transparent",
                      boxShadow: active ? `0 0 0 2px ${theme.dark ? "#0b1020" : "#fff"} inset` : "none"
                    }}>
              <div className="flex h-4 w-4 overflow-hidden rounded-full">
                <span className="h-full w-1/3" style={{ background: it.swatches[0] }} />
                <span className="h-full w-1/3" style={{ background: it.swatches[1] }} />
                <span className="h-full w-1/3" style={{ background: it.swatches[2] }} />
              </div>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {THEME_LIST.map((it) => {
        const active = it.id === themeId;
        return (
          <button key={it.id} onClick={() => onChange(it.id)}
                  className="group relative overflow-hidden rounded-2xl border p-3 text-left transition hover:-translate-y-0.5"
                  style={{
                    borderColor: active ? theme.accent : theme.stroke,
                    background: theme.dark ? "rgba(255,255,255,.04)" : "#fff",
                    boxShadow: active ? `0 12px 24px -12px ${theme.shadow}, 0 0 0 1px ${theme.accent} inset` : "none"
                  }}>
            <div className="flex h-10 overflow-hidden rounded-lg">
              <span className="h-full w-1/2" style={{ background: it.swatches[0] }} />
              <span className="h-full w-1/4" style={{ background: it.swatches[1] }} />
              <span className="h-full w-1/4" style={{ background: it.swatches[2] }} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs font-bold" style={{ color: theme.dark ? "#fefce8" : "#0f172a" }}>{it.name}</p>
              {active && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full"
                      style={{ background: it.swatches[0], color: "#fff" }}>
                  <Check size={10} />
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
