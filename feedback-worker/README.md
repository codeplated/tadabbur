# Tadabbur feedback Worker

Receives the site's feedback form and forwards each message to a Telegram chat
through a bot. Nothing is stored. The form is `quartz/components/Feedback.tsx`
and `quartz/static/feedback.{js,css}` in the site repo; it POSTs to the URL in
`WORKER_URL` at the top of `feedback.js`.

This folder is separate from the Quartz build: its own `package.json`, deployed
with wrangler, not by Cloudflare Pages.

## What it accepts

`POST` JSON `{ message, email, page, website }` from an origin listed in
`ALLOWED_ORIGINS` (`wrangler.toml`).

| Check                                                                             | Response                         |
| --------------------------------------------------------------------------------- | -------------------------------- |
| Origin not allowed                                                                | 403, no CORS headers             |
| Body over 10KB                                                                    | 413                              |
| Not JSON, empty message, message over 3,500 chars, bad email, page over 500 chars | 400                              |
| `website` filled in (the honeypot, only bots see it)                              | 204, nothing sent                |
| Sent to Telegram                                                                  | 204                              |
| Telegram refused it                                                               | 502 (logged; see `npm run tail`) |

## Cost

Runs on the Workers **Free** plan: 100,000 requests a day, one per message.
Over the limit, requests fail for the rest of the day; nothing is billed. No
storage or other bindings. Don't upgrade to Workers Paid — nothing here needs it.
The Telegram Bot API is free.

## Setup

1. **Bot.** In Telegram, message [@BotFather](https://t.me/BotFather), send
   `/newbot`, pick a name and a username ending in `bot`. It replies with a
   token like `123456789:AA…`. Keep it private.
2. **Chat ID.** Open your new bot, press Start and send it any message. Then
   open `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser and find
   `"chat":{"id":…}` — that number is the chat ID.
3. **Deploy.**
   ```bash
   cd feedback-worker
   npm install
   npx wrangler login                          # opens the browser once
   npx wrangler secret put TELEGRAM_BOT_TOKEN  # paste the token
   npx wrangler secret put TELEGRAM_CHAT_ID    # paste the chat ID
   npm run deploy
   ```
   Wrangler prints the URL, `https://tadabbur-feedback.<account>.workers.dev`.
   Put it in `WORKER_URL` at the top of `quartz/static/feedback.js`.

The first `wrangler secret put` creates the Worker if it doesn't exist yet.

The token and chat ID are secrets and must never go in `wrangler.toml` or any
file here: the repo is public.

## Checking it

```bash
curl -i -X POST https://tadabbur-feedback.<account>.workers.dev \
  -H 'Origin: https://tadabbur.belambo.com' -H 'Content-Type: application/json' \
  -d '{"message":"test","email":"","page":"/"}'
```

That should return `204` and a message in Telegram. `npm run tail` streams the
Worker's logs live.
