// usePresence — real cross-device presence via Supabase Realtime channels.
// Falls back to BroadcastChannel when Supabase is not configured (preview mode).

import { useEffect, useState, useRef } from "react";
import { supabase, cloudReady } from "./supabase.js";

export function usePresence(roomCode, me) {
  const [peers, setPeers] = useState({});
  const channelRef = useRef(null);

  useEffect(() => {
    if (!roomCode || !me) {
      setPeers({});
      return;
    }

    // ─── Supabase Realtime path ───
    if (cloudReady && supabase) {
      const channel = supabase.channel(`presence::${roomCode}`, {
        config: { presence: { key: me.id } }
      });

      channel
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const next = {};
          for (const id of Object.keys(state)) {
            const latest = state[id][0];
            if (latest) next[id] = latest;
          }
          setPeers(next);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({ id: me.id, name: me.name, color: me.color });
          }
        });

      channelRef.current = channel;
      return () => {
        channel.untrack().catch(() => {});
        supabase.removeChannel(channel);
      };
    }

    // ─── BroadcastChannel fallback (same-browser only) ───
    let bc;
    try { bc = new BroadcastChannel(`presence::${roomCode}`); } catch { return; }

    const seen = {};
    const flush = () => {
      const now = Date.now();
      const fresh = {};
      for (const [id, p] of Object.entries(seen)) {
        if (now - p.at < 5000) fresh[id] = p;
      }
      setPeers(fresh);
    };

    const announce = (type) => bc.postMessage({ type, me, at: Date.now() });

    bc.onmessage = (e) => {
      const m = e.data;
      if (!m || !m.me) return;
      if (m.type === "leave") {
        delete seen[m.me.id];
        flush();
        return;
      }
      seen[m.me.id] = { ...m.me, at: m.at };
      if (m.type === "hello" && m.me.id !== me.id) announce("here");
      flush();
    };

    announce("hello");
    const beat = setInterval(() => announce("here"), 2000);
    const sweep = setInterval(flush, 1500);
    const onUnload = () => announce("leave");
    window.addEventListener("beforeunload", onUnload);

    return () => {
      announce("leave");
      clearInterval(beat);
      clearInterval(sweep);
      window.removeEventListener("beforeunload", onUnload);
      bc.close();
    };
  }, [roomCode, me?.id, me?.name, me?.color]);

  return peers;
}
