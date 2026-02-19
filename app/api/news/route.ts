import { NextResponse } from "next/server";

const SOURCES: Record<string, { name: string; url: string }> = {
  nos: { name: "NOS", url: "https://feeds.nos.nl/nosnieuwsalgemeen" },
  nu: { name: "NU.nl", url: "https://www.nu.nl/rss/Algemeen" },
  tweakers: { name: "Tweakers", url: "https://feeds.feedburner.com/tweakers/mixed" },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sourceKey = (searchParams.get("source") || "nos").toLowerCase();

  const source = SOURCES[sourceKey] ?? SOURCES.nos;

  try {
    const res = await fetch(source.url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json(
        { error: `Kon feed niet laden (${res.status})`, source: source.name, headlines: [] },
        { status: 500 }
      );
    }

    const xml = await res.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0, 10);

    const headlines = items.map((match) => {
      const itemXml = match[1];

      const titleMatch = itemXml.match(
        /<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/
      );
      const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);

      const title = (titleMatch?.[1] || titleMatch?.[2] || "Geen titel").trim();
      const link = (linkMatch?.[1] || "").trim();

      return { title, link };
    });

    return NextResponse.json({ source: source.name, headlines });
  } catch (e) {
    return NextResponse.json(
      { error: "Er ging iets mis bij het laden van de feed", source: source.name, headlines: [] },
      { status: 500 }
    );
  }
}
