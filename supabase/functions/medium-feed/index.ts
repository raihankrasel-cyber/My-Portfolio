const feedUrl = "https://medium.com/feed/@raihan.k.rasel";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
};

function decodeEntities(value: string): string {
  const named: Record<string, string> = {
    amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
    rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", mdash: "—",
    ndash: "–", hellip: "…", copy: "©", trade: "™",
  };
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] === "#") {
      const hex = entity[1]?.toLowerCase() === "x";
      const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
      try { return Number.isFinite(code) ? String.fromCodePoint(code) : match; } catch { return match; }
    }
    return named[entity] ?? match;
  });
}
function readTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp("<" + tag + "(?:\\s[^>]*)?>([\\s\\S]*?)</" + tag + ">", "i"));
  if (!match) return "";
  const cdata = match[1].match(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/);
  return decodeEntities((cdata ? cdata[1] : match[1]).trim());
}
function plainText(html: string): string {
  return decodeEntities(html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " "))
    .trim();
}
function safeMediumUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "medium.com" || url.hostname.endsWith(".medium.com"))
      ? url.href
      : null;
  } catch {
    return null;
  }
}
function parseItem(item: string) {
  const link = safeMediumUrl(readTag(item, "link"));
  const title = plainText(readTag(item, "title"));
  if (!link || !title) return null;
  const description = readTag(item, "description");
  const content = readTag(item, "content:encoded");
  const imageMatch = (content || description).match(/<img\b[^>]*?\bsrc=["']([^"']+)["']/i);
  let image: string | null = null;
  if (imageMatch) {
    try {
      const candidate = new URL(decodeEntities(imageMatch[1]));
      if (candidate.protocol === "https:" &&
          (candidate.hostname === "medium.com" || candidate.hostname.endsWith(".medium.com"))) image = candidate.href;
    } catch {}
  }
  const parsedDate = new Date(readTag(item, "pubDate"));
  return {
    title: title.slice(0, 180),
    url: link,
    excerpt: plainText(description || content).slice(0, 300),
    image,
    publishedAt: Number.isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString(),
    author: plainText(readTag(item, "dc:creator")) || "Raihan K Rasel",
  };
}

Deno.serve(async (request: Request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "GET") {
    return Response.json({ error: "Method not allowed." }, { status: 405, headers: corsHeaders });
  }

  try {
    const response = await fetch(feedUrl, {
      headers: { "Accept": "application/rss+xml, application/xml, text/xml" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error("Medium feed returned " + response.status);
    const xml = await response.text();
    const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)]
      .map((match) => parseItem(match[1]))
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .slice(0, 12);
    return Response.json({ items, source: "Medium" }, { headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" } });
  } catch (error) {
    console.error("Medium feed unavailable", error);
    return Response.json({ error: "Medium feed is temporarily unavailable." }, { status: 502, headers: corsHeaders });
  }
});
