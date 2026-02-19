import { NextResponse } from "next/server";

async function fetchStooq() {
  const symbolsToTry = ["^AEX", "AEX"];

  for (const symbol of symbolsToTry) {
    const url = `https://stooq.com/q/l/?s=${encodeURIComponent(
      symbol
    )}&f=sd2t2ohlcv&h&e=csv`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) continue;
    const text = await res.text();

    if (!text || text.split("\n").length < 2 || text.includes("N/D")) continue;

    const lines = text.trim().split("\n");
    const header = lines[0].split(",");
    const row = lines[1].split(",");

    const data: Record<string, string> = {};
    header.forEach((key, i) => {
      data[key] = row[i] ?? "";
    });

    const close = parseFloat(data.Close || "NaN");
    const open = parseFloat(data.Open || "NaN");
    const timeStr = `${data.Date || ""} ${data.Time || ""}`.trim();
    const timestamp = isNaN(Date.parse(timeStr)) ? null : Math.floor(Date.parse(timeStr) / 1000);

    return {
      source: "Stooq",
      symbol,
      price: isNaN(close) ? null : close,
      change: !isNaN(close) && !isNaN(open) ? close - open : null,
      changePercent:
        !isNaN(close) && !isNaN(open) && close !== 0 ? ((close - open) / close) * 100 : null,
      time: timestamp,
      raw: text,
    };
  }

  return null;
}

const YAHOO_AEX_URL = "https://query1.finance.yahoo.com/v7/finance/quote?symbols=%5EAEX";

async function fetchYahoo() {
  const res = await fetch(YAHOO_AEX_URL, { cache: "no-store" });
  if (!res.ok) return null;
  const json = await res.json();
  const result = (json?.quoteResponse?.result || [])[0];
  if (!result) return null;

  return {
    source: "Yahoo",
    symbol: result.symbol,
    price: result.regularMarketPrice ?? null,
    change: result.regularMarketChange ?? null,
    changePercent: result.regularMarketChangePercent ?? null,
    time: result.regularMarketTime ?? null,
    raw: result,
  };
}

export async function GET() {
  try {
    const stooq = await fetchStooq();
    if (stooq) return NextResponse.json(stooq);

    const yahoo = await fetchYahoo();
    if (yahoo) return NextResponse.json(yahoo);

    return NextResponse.json({ error: "Geen koersdata beschikbaar" }, { status: 502 });
  } catch (err: any) {
    return NextResponse.json({ error: "Server error in /api/market", details: String(err?.message || err) }, { status: 500 });
  }
}
