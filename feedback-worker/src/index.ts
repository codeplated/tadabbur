/**
 * Tadabbur feedback Worker. Receives the site's feedback form —
 * POST { message, email, page, website } from quartz/static/feedback.js —
 * and forwards it to a Telegram chat through a bot. Nothing is stored.
 *
 * Secrets (wrangler secret put): TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID.
 * Vars (wrangler.toml): ALLOWED_ORIGINS, comma-separated.
 */

interface Env {
  TELEGRAM_BOT_TOKEN: string
  TELEGRAM_CHAT_ID: string
  ALLOWED_ORIGINS: string
}

// A Telegram message holds 4,096 characters; this leaves room for the
// page, email and country lines under it.
const MAX_MESSAGE = 3500
const MAX_EMAIL = 254
const MAX_PAGE = 500
const MAX_BODY = 10_000

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function corsHeaders(origin: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  }
}

function reply(status: number, origin: string | null): Response {
  return new Response(null, { status, headers: origin ? corsHeaders(origin) : {} })
}

function field(body: Record<string, unknown>, key: string): string {
  const value = body[key]
  return typeof value === "string" ? value.trim() : ""
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const allowed = env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    const requestOrigin = request.headers.get("Origin")
    // Only the site itself may post. Without a matching origin the browser
    // gets no CORS headers and refuses the response.
    const origin = requestOrigin && allowed.includes(requestOrigin) ? requestOrigin : null

    if (request.method === "OPTIONS") return reply(origin ? 204 : 403, origin)
    if (request.method !== "POST") return reply(405, origin)
    if (!origin) return reply(403, null)

    const raw = await request.text()
    if (raw.length > MAX_BODY) return reply(413, origin)

    let body: Record<string, unknown>
    try {
      const parsed: unknown = JSON.parse(raw)
      if (typeof parsed !== "object" || parsed === null) return reply(400, origin)
      body = parsed as Record<string, unknown>
    } catch {
      return reply(400, origin)
    }

    // Honeypot: a field no person can see. A bot that fills it is told it
    // worked, so it has no reason to try again, and nothing is sent.
    if (field(body, "website")) return reply(204, origin)

    const message = field(body, "message")
    const email = field(body, "email")
    const page = field(body, "page")

    if (!message || message.length > MAX_MESSAGE) return reply(400, origin)
    if (email && (email.length > MAX_EMAIL || !EMAIL_SHAPE.test(email))) return reply(400, origin)
    if (page.length > MAX_PAGE) return reply(400, origin)

    const country = (request as Request & { cf?: { country?: string } }).cf?.country ?? "?"
    // Plain text, no parse_mode: whatever the reader typed arrives as-is,
    // with nothing to escape.
    const text = [
      "📬 Tadabbur feedback",
      "",
      message,
      "",
      `Page: ${origin}${page || "/"}`,
      `Email: ${email || "(none)"}`,
      `Country: ${country}`,
    ].join("\n")

    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: env.TELEGRAM_CHAT_ID,
        text,
        link_preview_options: { is_disabled: true },
      }),
    })

    if (!res.ok) {
      // Shows in `wrangler tail`; the reader just sees "please try again".
      console.error("Telegram sendMessage failed", res.status, await res.text())
      return reply(502, origin)
    }
    return reply(204, origin)
  },
}
