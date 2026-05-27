import React from "react";
import { cloudReady } from "../lib/supabase.js";
import { Cloud, CloudOff } from "./Icons.jsx";

export function ConnectionBadge({ compact = false, theme }) {
  if (cloudReady) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-600">
        <Cloud size={12} /> {compact ? "同步" : "已云端同步"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-600">
      <CloudOff size={12} /> {compact ? "本地" : "本地预览模式"}
    </span>
  );
}
