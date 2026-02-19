"use client";

import React, { useEffect, useRef, useState } from "react";

type AexData = {
  symbol?: string;
  price?: number | null;
  change?: number | null;
  changePercent?: number | null;
  time?: number | null;
};

export default function AexWidget() {
  const [data, setData] = useState<AexData | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const mounted = useRef(false);

  async function fetchData() {
    try {
      const res = await fetch("/api/market", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) return;
      const price = typeof json.price === "number" ? json.price : null;
      setData({
        symbol: json.symbol,
        price,
        change: json.change,
        changePercent: json.changePercent,
        time: json.time,
      });

      if (typeof price === "number") {
        setHistory((h) => {
          const next = [...h, price].slice(-30);
          return next;
        });
      }
    } catch (e) {
      // ignore; keep last known data
    }
  }

  useEffect(() => {
    mounted.current = true;
    fetchData();
    const id = setInterval(fetchData, 5000);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, []);

  const latest = history[history.length - 1];
  const prev = history[history.length - 2];
  const up = typeof latest === "number" && typeof prev === "number" ? latest >= prev : true;

  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 18,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 6 }}>AEX Index</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <div style={{ fontSize: 32, fontWeight: 750, letterSpacing: -0.5 }}>
          {data?.price != null ? data.price.toFixed(2) : "-"}
        </div>
        <div
          style={{
            color: up ? "#036A07" : "#991B1B",
            fontWeight: 700,
            fontSize: 14,
            opacity: 0.9,
          }}
        >
          {data?.change != null ? `${data.change >= 0 ? "+" : ""}${data.change.toFixed(2)}` : ""}
          {data?.changePercent != null ? ` (${data.changePercent >= 0 ? "+" : ""}${data.changePercent.toFixed(2)}%)` : ""}
        </div>
      </div>

      {history.length > 1 ? (
        <div style={{ marginTop: 10 }}>
          <svg width="100%" height="40" viewBox={`0 0 ${history.length} 40`} preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke={up ? "#16a34a" : "#ef4444"}
              strokeWidth={0.6}
              points={history.map((v, i) => `${i},${40 - ((v - Math.min(...history)) / (Math.max(...history) - Math.min(...history) || 1)) * 36}`).join(" ")}
            />
          </svg>
        </div>
      ) : null}

      <div style={{ marginTop: 10, fontSize: 12, color: "#374151" }}>
        {data?.time ? new Date(data.time * 1000).toLocaleTimeString() : "Laatste update: -"}
      </div>
    </div>
  );
}
