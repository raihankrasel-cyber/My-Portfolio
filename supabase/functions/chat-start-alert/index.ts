const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin"
});

const lastAlertByIp = new Map<string, number>();
let recentAlertTimes: number[] = [];

Deno.serve(async (request: Request) => {
  const origin = request.headers.get("origin") ?? "";
  const portfolioOrigins = [
    "https://raihan-my-portfolio.vercel.app",
    "https://my-portfolio-seven-beta-76.vercel.app",
    "https://my-portfolio-raihan-5212.vercel.app",
    "https://my-portfolio-git-main-raihan-5212.vercel.app",
  ];
  const allowedOrigins = [...new Set([
    ...portfolioOrigins,
    ...(Deno.env.get("ALLOWED_ORIGINS") ?? "").split(","),
  ].map((value) => value.trim()).filter(Boolean))];
  const headers = corsHeaders(allowedOrigins.includes(origin) ? origin : "null");

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: allowedOrigins.includes(origin) ? 204 : 403,
      headers
    });
  }
  if (!allowedOrigins.includes(origin)) {
    return Response.json({ error: "Origin is not allowed." }, { status: 403 });
  }
  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed." }, { status: 405, headers });
  }

  const telegramToken = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? Deno.env.get("@raihanmiranda_bot");
  const telegramChatId = Deno.env.get("TELEGRAM_CHAT_ID");
  if (!telegramToken || !telegramChatId) {
    return Response.json({ error: "Telegram alerts are not configured." }, { status: 503, headers });
  }

  let payload: { event?: string };
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400, headers });
  }
  if (payload?.event !== "chat_start") {
    return Response.json({ error: "Unsupported event." }, { status: 400, headers });
  }

  // Best-effort throttling. The IP is used only in memory and is never stored or logged.
  const forwardedIp = request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
  const now = Date.now();
  const previousAlert = lastAlertByIp.get(forwardedIp);
  if (previousAlert && now - previousAlert < 60_000) {
    return Response.json({ ok: true, throttled: true }, { status: 200, headers });
  }
  recentAlertTimes = recentAlertTimes.filter((time) => now - time < 60_000);
  if (recentAlertTimes.length >= 10) {
    return Response.json({ ok: true, throttled: true }, { status: 200, headers });
  }
  if (lastAlertByIp.size > 5000) lastAlertByIp.clear();
  lastAlertByIp.set(forwardedIp, now);
  recentAlertTimes.push(now);

  let telegramResponse: Response;
  try {
    telegramResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: telegramChatId,
        text: "Someone just opened the chat assistant on your portfolio."
      }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    console.error("Telegram alert request failed before a response was received.");
    return Response.json({ error: "Telegram could not send the alert." }, { status: 502, headers });
  }

  if (!telegramResponse.ok) {
    const details = await telegramResponse.json().catch(() => ({}));
    const description = typeof details.description === "string" ? details.description.slice(0, 160) : "No error description.";
    console.error("Telegram alert rejected", JSON.stringify({ status: telegramResponse.status, description }));
    return Response.json({ error: "Telegram could not send the alert." }, { status: 502, headers });
  }
  return Response.json({ ok: true }, { status: 200, headers });
});