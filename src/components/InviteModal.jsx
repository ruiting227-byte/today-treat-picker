import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Copy, Check, Logout } from "./Icons.jsx";

// 生成带房间码的深链接：扫码 / 打开后 App 会自动进入该房间
export function buildInviteUrl(roomCode) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/?room=${encodeURIComponent(roomCode)}`;
}

export function InviteModal({ roomCode, theme, onClose }) {
  const inviteUrl = buildInviteUrl(roomCode);
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState("");

  // 生成二维码（深色 on 白底，保证任何主题下都好扫）
  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(inviteUrl, {
      margin: 1,
      width: 480,
      errorCorrectionLevel: "M",
      color: { dark: "#0f172a", light: "#ffffff" }
    })
      .then((url) => { if (alive) setQr(url); })
      .catch(() => {});
    return () => { alive = false; };
  }, [inviteUrl]);

  // Esc 关闭
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function copy(text, tag) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(tag);
      setTimeout(() => setCopied(""), 1500);
    } catch {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: "rgba(15,23,42,.55)", backdropFilter: "blur(4px)" }}
         onClick={onClose}>
      <div className="w-full max-w-sm rounded-[28px] border p-7 text-center"
           onClick={(e) => e.stopPropagation()}
           style={{
             background: theme.dark ? "#0b1220" : "#ffffff",
             borderColor: theme.stroke,
             color: theme.dark ? "#f8fafc" : "#0f172a",
             boxShadow: `0 40px 90px -30px ${theme.shadow}`
           }}>
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{ color: theme.accent }}>
            SCAN · 扫码进房间
          </p>
          <button onClick={onClose}
                  className="rounded-xl p-2 transition hover:bg-black/5"
                  aria-label="关闭">
            <Logout size={16} />
          </button>
        </div>

        <h3 className="mt-2 text-2xl font-black tracking-tight">手机一扫，直接进同一个房间</h3>

        {/* QR 卡片 */}
        <div className="mx-auto mt-5 w-fit rounded-3xl bg-white p-4"
             style={{ boxShadow: `0 18px 40px -18px ${theme.shadow}` }}>
          {qr ? (
            <img src={qr} alt="房间二维码" width={220} height={220}
                 className="h-[220px] w-[220px] rounded-xl" />
          ) : (
            <div className="flex h-[220px] w-[220px] items-center justify-center text-sm text-slate-400">
              生成中…
            </div>
          )}
        </div>

        {/* 房间码 */}
        <div className="mt-5">
          <p className="text-[10px] font-bold uppercase tracking-wider"
             style={{ color: theme.dark ? "rgba(248,250,252,.5)" : "rgba(15,23,42,.45)" }}>
            房间码
          </p>
          <p className="font-mono-dm text-2xl font-black tracking-[0.2em]" style={{ color: theme.accent }}>
            {roomCode}
          </p>
        </div>

        {/* 复制按钮 */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button onClick={() => copy(inviteUrl, "link")}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl px-4 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5"
                  style={{ background: theme.accent }}>
            {copied === "link" ? <Check size={16} /> : <Copy size={16} />}
            {copied === "link" ? "已复制" : "复制链接"}
          </button>
          <button onClick={() => copy(roomCode, "code")}
                  className="inline-flex items-center justify-center gap-1.5 rounded-2xl border px-4 py-3 text-sm font-bold transition hover:-translate-y-0.5"
                  style={{ borderColor: theme.stroke, color: theme.dark ? "#f8fafc" : "#0f172a" }}>
            {copied === "code" ? <Check size={16} /> : <Copy size={16} />}
            {copied === "code" ? "已复制" : "复制房间码"}
          </button>
        </div>

        <p className="mt-4 text-[11px] leading-5"
           style={{ color: theme.dark ? "rgba(248,250,252,.45)" : "rgba(15,23,42,.45)" }}>
          也可以直接把链接发微信 / 群里，对方点开即进房 ✿
        </p>
      </div>
    </div>
  );
}
