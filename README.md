# Tadabbur — تدبّر

Tadabbur is a structured Quran knowledge base — a fully navigable website of
tadabbur (reflective study) notes covering all 114 surahs, built on
[Quartz 5](https://quartz.jzhao.xyz/).

Every ayah has recitation audio, Arabic text, Urdu and English translation,
and thematic tags that link it to the rest of the Quran. The site also covers
Asma ul Husna and the personalities mentioned in the Quran.

The content is produced by a separate Tadabbur generator repo and synced into
this repo's `content/` folder, which this site then builds and publishes.

Site: [tadabbur.belambo.com](https://tadabbur.belambo.com)

## Stack

- [Quartz 5](https://quartz.jzhao.xyz/) static site generator, with community
  plugins from npm (a few carry small patches in `patches/`)
- Audio recitation served from `cdn.islamic.app`, not hosted in this repo
- Hosted on Cloudflare Pages; every push to `main` deploys
- Feedback form messages are forwarded to Telegram by a small Cloudflare
  Worker in `feedback-worker/`

## Getting started

Requires Node 22+.

```bash
npm install        # installs dependencies and applies patches/
npm run dev        # local dev server at localhost:8080
npm run build      # production build into public/
```

See [`CLAUDE.md`](./CLAUDE.md) for repo structure, generated content rules,
plugin patches and configuration details.

## License

Quartz is MIT licensed — see [`LICENSE.txt`](./LICENSE.txt).
