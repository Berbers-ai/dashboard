"use client";

import { useEffect, useMemo, useState } from "react";
import AexWidget from "./app/components/AexWidget";
import WeatherWidget from "./app/components/WeatherWidget";

type NewsItem = { title: string; link: string };
type DataShape = { source: string; headlines: NewsItem[]; error?: string };

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        padding: 22,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 10 }}>{title}</div>
      <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>{value}</div>
    </div>
  );
}

function PillButton({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        border: "1px solid rgba(255,255,255,0.18)",
        background: active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
        color: "white",
        borderRadius: 999,
        padding: "8px 12px",
        fontWeight: 650,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

export default function DashboardClient({ data: initialData }: { data: DataShape }) {
  const sources = useMemo(
    () => [
      { key: "nos", label: "NOS" },
      { key: "nu", label: "NU.nl" },
      { key: "tweakers", label: "Tweakers" },
    ],
    []
  );

  const [sourceKey, setSourceKey] = useState<string>("nos");
  const [data, setData] = useState<DataShape>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadNews(key: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/news?source=${encodeURIComponent(key)}`, {
        cache: "no-store",
      });

      const json = (await res.json()) as DataShape;

      if (!res.ok) {
        setError(json.error || "Kon nieuws niet laden");
        setData({ source: json.source || "Onbekend", headlines: [] });
      } else {
        setData(json);
      }
    } catch (e) {
      setError("Netwerkfout: kon de server niet bereiken");
      setData({ source: "Onbekend", headlines: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Eerste keer: we nemen initialData (komt van server) voor snelheid
    // Daarna: als je een andere bron kiest, laden we opnieuw.
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 28,
        fontFamily:
          'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        background: "#0b1220",
        color: "white",
      }}
    >
      {/* Topbar */}
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 14,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 750, letterSpacing: -0.5 }}>
            Dashboard
          </h1>
          <p style={{ margin: "6px 0 0", opacity: 0.75 }}>Persoonlijk actualiteitendashboard</p>
        </div>

        <div style={{ opacity: 0.8, fontWeight: 600 }}>Tim</div>
      </header>

      {/* Source buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        {sources.map((s) => (
          <PillButton
            key={s.key}
            active={sourceKey === s.key}
            onClick={() => {
              setSourceKey(s.key);
              loadNews(s.key);
            }}
          >
            {s.label}
          </PillButton>
        ))}

        <div style={{ marginLeft: "auto", opacity: 0.75, fontWeight: 650 }}>
          {loading ? "Bezig met laden…" : `Bron: ${data?.source ?? "-"}`}
        </div>
      </div>

      {/* Cards row */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <StatCard title="Bezoekers" value="1.234" />
        <StatCard title="Artikelen" value="56" />
        <StatCard title="Conversie" value="3.8%" />
        <AexWidget />
        <WeatherWidget />
      </section>

      {/* News */}
      <section
        style={{
          background: "white",
          color: "#111827",
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          padding: 22,
          boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Nieuws</h2>
          <div style={{ fontSize: 13, opacity: 0.65 }}>
            {loading ? "Laden…" : "Klik op een bron bovenin"}
          </div>
        </div>

        {error ? (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 12,
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              color: "#991B1B",
              fontWeight: 650,
            }}
          >
            {error}
          </div>
        ) : null}

        <ul style={{ margin: "14px 0 0", paddingLeft: 18 }}>
          {(data?.headlines ?? []).map((item, idx) => (
            <li key={idx} style={{ marginBottom: 10 }}>
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                style={{ color: "#111827", textDecoration: "none" }}
              >
                {item.title}
              </a>
            </li>
          ))}
        </ul>

        {!loading && (data?.headlines?.length ?? 0) === 0 && !error ? (
          <div style={{ marginTop: 14, opacity: 0.7 }}>Geen headlines gevonden.</div>
        ) : null}
      </section>
    </main>
  );
}
