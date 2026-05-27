import React from "react";

export function DialDisplay({ finalText, isDrawing, theme, currentCategory, options, rotation }) {
  const n = Math.max(options.length, 1);
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="relative aspect-square w-full">
        <div className="absolute inset-0 rounded-full"
             style={{
               background: theme.dark ? "rgba(255,255,255,.03)" : "#fff",
               boxShadow: `inset 0 0 0 1px ${theme.stroke}, 0 30px 60px -30px ${theme.shadow}`
             }} />
        <div className="absolute inset-3 overflow-hidden rounded-full"
             style={{
               transform: `rotate(${rotation}deg)`,
               transition: isDrawing ? "transform 3.2s cubic-bezier(.17,.67,.16,1)" : "none",
               background: `conic-gradient(${options.map((_, i) => {
                 const c = i % 2 === 0 ? theme.accent : theme.accentSoft;
                 const start = (i / n) * 360;
                 const end = ((i + 1) / n) * 360;
                 return `${c} ${start}deg ${end}deg`;
               }).join(",")})`
             }}>
          {options.map((opt, i) => {
            const angle = ((i + 0.5) / n) * 360;
            return (
              <div key={i}
                   className="absolute left-1/2 top-1/2 origin-left whitespace-nowrap text-[11px] font-bold"
                   style={{
                     transform: `rotate(${angle}deg) translate(36%, -50%)`,
                     color: i % 2 === 0 ? "#fff" : theme.accentDeep
                   }}>
                {opt.length > 6 ? opt.slice(0, 6) + "…" : opt}
              </div>
            );
          })}
        </div>
        <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full text-center"
             style={{ background: theme.dark ? "#13182e" : "#fff", boxShadow: `0 6px 20px ${theme.shadow}` }}>
          <span className="text-2xl">{currentCategory.glyph}</span>
          <p className="mt-1 max-w-[88px] truncate text-xs font-black"
             style={{ color: theme.dark ? "#fefce8" : "#0f172a" }}>
            {isDrawing ? "…" : (finalText || "等待抽签")}
          </p>
        </div>
        <div className="absolute -top-1 left-1/2 -translate-x-1/2">
          <div className="h-0 w-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent"
               style={{ borderTopColor: theme.accentDeep }} />
        </div>
      </div>
    </div>
  );
}
