"use client";

import React, { useEffect, useState } from "react";

type WeatherData = {
  temperature?: number | null;
  windspeed?: number | null;
  winddirection?: number | null;
  weathercode?: number | null;
  time?: string | null;
};

export default function WeatherWidget() {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchWeather() {
    setLoading(true);
    try {
      const res = await fetch("/api/weather", { cache: "no-store" });
      if (!res.ok) return;
      const json = await res.json();
      setData({
        temperature: json.temperature ?? null,
        windspeed: json.windspeed ?? null,
        winddirection: json.winddirection ?? null,
        weathercode: json.weathercode ?? null,
        time: json.time ?? null,
      });
    } catch (e) {
      // ignore errors for now
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchWeather();
    // Optional: refresh periodically (e.g., every 60s)
    const id = setInterval(fetchWeather, 60_000);
    return () => clearInterval(id);
  }, []);

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
      <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 6 }}>Amsterdam — Weer</div>

      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: 28, fontWeight: 750 }}>
          {data?.temperature != null ? `${data.temperature.toFixed(1)}°C` : loading ? "…" : "-"}
        </div>
        <div style={{ fontSize: 13, color: "#374151" }}>
          {data?.windspeed != null ? `${data.windspeed} km/h` : ""}
        </div>
      </div>

      <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
        {data?.time ? `Laatste update: ${new Date(data.time).toLocaleTimeString()}` : "Laatste update: -"}
      </div>
    </div>
  );
}
