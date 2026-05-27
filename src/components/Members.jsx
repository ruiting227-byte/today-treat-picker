import React, { useState } from "react";
import { Plus } from "./Icons.jsx";

export function Members({ memberList, me, onRename, onInvite, theme, dens }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(me.name);

  return (
    <div className={`${dens.radius} border p-5 backdrop-blur`}
         style={{
           background: theme.dark ? "rgba(255,255,255,.04)" : "rgba(255,255,255,.85)",
           borderColor: theme.stroke
         }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
          房间成员 · 实时在线
        </p>
        <span className="font-mono-dm inline-flex items-center gap-1.5 text-[10px]"
              style={{ color: theme.dark ? "rgba(248,250,252,.5)" : "rgba(15,23,42,.4)" }}>
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "#10b981" }} />
          {memberList.length} ONLINE
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {memberList.map((m) => (
          <div key={m.id}
               className="flex items-center gap-2 rounded-full border px-2.5 py-1"
               style={{
                 borderColor: m.self ? m.color : theme.stroke,
                 background: theme.dark ? "rgba(255,255,255,.04)" : "#fff"
               }}>
            <span className="inline-block h-2 w-2 rounded-full"
                  style={{ background: m.color, boxShadow: `0 0 0 2px ${m.color}33` }} />
            {m.self && editing ? (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, 8))}
                onBlur={() => {
                  const v = draft.trim() || me.name;
                  onRename(v);
                  setEditing(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") e.currentTarget.blur();
                  if (e.key === "Escape") { setDraft(me.name); setEditing(false); }
                }}
                className="w-16 bg-transparent text-xs font-bold outline-none"
                style={{ color: theme.dark ? "#f8fafc" : "#0f172a" }}
              />
            ) : (
              <button
                onClick={() => m.self && (setDraft(me.name), setEditing(true))}
                className="text-xs font-bold"
                style={{ color: theme.dark ? "#f8fafc" : "#0f172a", cursor: m.self ? "text" : "default" }}>
                {m.name}{m.self && <span className="ml-1 opacity-50">· 你</span>}
              </button>
            )}
          </div>
        ))}

        <button onClick={onInvite}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition hover:-translate-y-0.5"
                style={{ borderColor: theme.stroke, color: theme.dark ? "rgba(248,250,252,.6)" : "rgba(15,23,42,.55)" }}>
          <Plus size={12} /> 邀请
        </button>
      </div>

      {memberList.length === 1 && (
        <p className="mt-3 text-[11px] leading-5"
           style={{ color: theme.dark ? "rgba(248,250,252,.45)" : "rgba(15,23,42,.45)" }}>
          目前只有你一个。复制房间码发给朋友，对方进入后会出现在这里。
        </p>
      )}
    </div>
  );
}
