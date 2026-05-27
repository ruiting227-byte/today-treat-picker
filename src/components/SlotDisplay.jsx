import React from "react";

export function SlotDisplay({ rolling, finalText, isDrawing, theme, currentCategory }) {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="relative overflow-hidden rounded-[28px] border px-6 py-10 text-center"
           style={{
             background: theme.dark ? "rgba(255,255,255,.04)" : "#fff",
             borderColor: theme.stroke,
             boxShadow: `inset 0 1px 0 rgba(255,255,255,.6), 0 20px 50px -20px ${theme.shadow}`
           }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-12"
             style={{ background: `linear-gradient(180deg, ${theme.dark ? "#0f172a" : "#fff"} 0%, transparent 100%)` }} />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12"
             style={{ background: `linear-gradient(0deg, ${theme.dark ? "#0f172a" : "#fff"} 0%, transparent 100%)` }} />

        <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
          {currentCategory.glyph}  {currentCategory.label}
        </p>
        <div className="mt-4 flex min-h-[80px] items-center justify-center">
          <div key={rolling}
               className={`text-[44px] sm:text-[56px] font-black leading-[1.05] tracking-tight ${isDrawing ? "shimmer-text" : ""}`}
               style={{ color: theme.dark ? "#fefce8" : "#0f172a" }}>
            {rolling}
          </div>
        </div>
        <p className="mt-3 text-xs" style={{ color: theme.dark ? "rgba(248,250,252,.4)" : "rgba(15,23,42,.4)" }}>
          {isDrawing ? "命运正在洗牌…" : finalText ? "本回合命运的答复" : "按下按钮，决定今晚"}
        </p>
      </div>
    </div>
  );
}
