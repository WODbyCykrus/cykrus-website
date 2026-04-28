# cykrus-website

> **cykrus.at** — Vault City's public face. Built by [Vault City](https://github.com/Cykruz/VaultCity) — Lukas Berger (Frontend) & Sara Novak (Full-Stack), under Mayor Willi.

---

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript strict + Tailwind
- **3D Hero:** React-Three-Fiber + Drei + Spline-exported GLB
- **Animation:** Framer Motion + GSAP
- **Edge:** Cloudflare Pages + Workers
- **Chat:** Claude Haiku 4.5 via `@anthropic-ai/sdk` (Worker-side)
- **DNS / CDN / Email:** Cloudflare Free
- **Analytics:** Cloudflare cookieless

## Local Development

```bash
pnpm install
pnpm dev          # → http://localhost:3000
```

## Deploy

GitHub Actions auto-deploy on `push:main`:
- `.github/workflows/deploy-pages.yml` → Cloudflare Pages
- `.github/workflows/deploy-worker.yml` → Cloudflare Workers (`auto-cap`)

Required GitHub Secrets:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Required Worker Secrets (via `wrangler secret put`):
- `ANTHROPIC_API_KEY`

## Status (Tag 1)

| Phase | Status |
|---|---|
| Repo skeleton | ✅ initialized |
| Cloudflare Pages project | ⏳ awaiting CF account |
| Spline 3D model + GLB | ⏳ awaiting CF account (Lukas) |
| AVIF LCP hero render | ⏳ awaiting Spline export |
| Anthropic API for Cykra-Chat | ⏳ awaiting key |
| DNS migration cykrus.at | ⏳ awaiting CF account |

## Documentation

Architecture decisions and city-internal docs live in the [Vault City vault](https://github.com/Cykruz/VaultCity):
- Werkstatt: `05 Werkstatt-Gasse/001-cykrus-relaunch/`
- DNS Playbook: `Konzept/dns-migration-playbook.md`
- Spline Spec: `Konzept/spline-modeling-spec.md`
- DSGVO Draft: `Konzept/dsgvo-erklaerung-neu.md`

## License

UNLICENSED — proprietary, all rights reserved.
