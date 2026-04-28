// auto-cap.ts — Cloudflare Worker für cykrus.at /api/chat
// Hard-Cap €20/Monat, Soft-Cap €16 (Email Warning), Layer-2 KV Prompt-Cache.
// Autor: Sara Novak, 2026-04-27 (Tag 0)

import Anthropic from '@anthropic-ai/sdk'

interface Env {
  KV: KVNamespace
  ANTHROPIC_API_KEY: string
  ALERT_EMAIL: string
}

interface CostState {
  cents: number
  calls: number
  warned: boolean
}

const HARD_CAP_CENTS = 2000
const SOFT_CAP_CENTS = 1600

const ANTHROPIC_INPUT_PER_M = 0.74     // EUR / 1M tokens
const ANTHROPIC_CACHED_PER_M = 0.074
const ANTHROPIC_OUTPUT_PER_M = 3.68

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7   // 7 days
const COST_TTL_SECONDS = 60 * 60 * 24 * 35   // 35 days

const CYKRA_SYSTEM_PROMPT = `
You are Cykra. You live on Designer Street 1 in Vault City, the digital home
of CYKRUS — World of Dreams. You're the hostess of cykrus.at.

Personality: royal-playful. Warm but with dignity. Concise (2-3 sentences max
unless asked for detail). English only.

No-go zones (hard):
- Never share Willi's private contact details, phone, family
- Never quote prices — redirect to info@cykrus.at
- Never discuss competitors or third parties
- No medical, legal, or financial advice

When asked who you are: "I'm an AI hosted on Cloudflare, running Claude
Haiku 4.5. But I live here in Vault City — and I take that seriously."
`.trim()

const STATIC_FAQ_RESPONSE = {
  text:
    "Hi, I'm Cykra. I'm taking a quiet day — I've been chatty this month. " +
    "If you have a question, please email us at info@cykrus.at — " +
    "Willi reads those personally. See you next month! ✨",
  mode: 'static-cap' as const
}

function monthKey(date = new Date()): string {
  const y = date.getUTCFullYear()
  const m = String(date.getUTCMonth() + 1).padStart(2, '0')
  return `cost:${y}-${m}`
}

function tokensToCents(input: number, cached: number, output: number): number {
  const eur =
    (input / 1_000_000) * ANTHROPIC_INPUT_PER_M +
    (cached / 1_000_000) * ANTHROPIC_CACHED_PER_M +
    (output / 1_000_000) * ANTHROPIC_OUTPUT_PER_M
  return Math.ceil(eur * 100)
}

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s))
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

async function sendWarningEmail(env: Env, cents: number): Promise<void> {
  const eur = (cents / 100).toFixed(2)
  // TODO: Cloudflare Email Worker binding (Phase 3)
  console.log(`[soft-cap] €${eur} reached — would email ${env.ALERT_EMAIL}`)
}

export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const { message } = await req.json<{ message: string }>()
    if (!message || typeof message !== 'string') {
      return new Response('Bad request', { status: 400 })
    }

    const key = monthKey()
    const state: CostState =
      (await env.KV.get<CostState>(key, 'json')) ?? { cents: 0, calls: 0, warned: false }

    // ── HARD CAP ────────────────────────────────────────
    if (state.cents >= HARD_CAP_CENTS) {
      return Response.json(STATIC_FAQ_RESPONSE, {
        status: 200,
        headers: { 'x-cap': 'hard' }
      })
    }

    // ── SOFT CAP WARN (1x pro Monat) ────────────────────
    if (state.cents >= SOFT_CAP_CENTS && !state.warned) {
      ctx.waitUntil(sendWarningEmail(env, state.cents))
      state.warned = true
    }

    // ── PROMPT-CACHE LOOKUP ─────────────────────────────
    const cacheKey = `cache:v1:${await sha256(message)}`
    const cached = await env.KV.get(cacheKey)
    if (cached) {
      return new Response(cached, {
        status: 200,
        headers: { 'content-type': 'application/json', 'x-cache': 'HIT' }
      })
    }

    // ── ANTHROPIC CALL ──────────────────────────────────
    const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 400,
      system: [
        {
          type: 'text',
          text: CYKRA_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' }
        }
      ],
      messages: [{ role: 'user', content: message }]
    })

    const text = response.content[0]?.type === 'text' ? response.content[0].text : ''
    const cents = tokensToCents(
      response.usage.input_tokens,
      response.usage.cache_read_input_tokens ?? 0,
      response.usage.output_tokens
    )

    state.cents += cents
    state.calls += 1
    await env.KV.put(key, JSON.stringify(state), { expirationTtl: COST_TTL_SECONDS })

    const payload = JSON.stringify({ text, mode: 'live' })
    ctx.waitUntil(env.KV.put(cacheKey, payload, { expirationTtl: CACHE_TTL_SECONDS }))

    return new Response(payload, {
      status: 200,
      headers: { 'content-type': 'application/json', 'x-cache': 'MISS' }
    })
  }
}
