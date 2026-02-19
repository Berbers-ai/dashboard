import { NextResponse } from "next/server";

const LAT = 52.3676; // Amsterdam
const LON = 4.9041;

export async function GET() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current_weather=true&timezone=Europe%2FAmsterdam`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ error: `Kon weerdata niet laden (${res.status})` }, { status: 502 });
    }

    const json = await res.json();
    const cw = json?.current_weather;
    if (!cw) return NextResponse.json({ error: "Geen huidige weerdata beschikbaar" }, { status: 502 });

    return NextResponse.json({
      source: "open-meteo",
      temperature: cw.temperature ?? null,
      windspeed: cw.windspeed ?? null,
      winddirection: cw.winddirection ?? null,
      weathercode: cw.weathercode ?? null,
      time: cw.time ?? null,
      raw: json,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error in /api/weather", details: String(err?.message || err) }, { status: 500 });
  }
}
