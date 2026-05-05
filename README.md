# Impact Loop Blogs Monorepo

A single Next.js 14 + Tailwind + MDX codebase that powers four separate blog deployments — one per brand — selected at build time via the `BRAND` env var.

| Brand | Domain | Vibe |
|---|---|---|
| Impact Loop | blog.impactloop.ca | Editorial agency, white-space heavy |
| Rovonn Russell | blog.rovonnrussell.com | Editorial magazine, warm cream |
| Dream Streams | blog.dreamstreams.ca | Earthy / Etsy, copper + cream |
| IL Foundation | blog.ilfoundation.ca | Stub — finalized at Phase 4 launch |

## Quick start

```bash
npm install
npm run dev:impact-loop      # or rovonn-russell, dream-streams, il-foundation
```

## How brand switching works

1. `BRAND` env var is read at build time by `config/brand.ts`.
2. The `data-brand="..."` attribute is set on `<html>` in `app/layout.tsx`.
3. `app/globals.css` defines brand palettes scoped to `[data-brand="..."]` selectors as CSS custom properties.
4. Tailwind colors (in `tailwind.config.ts`) reference those custom properties via `hsl(var(--brand-*))`, so `bg-brand-primary` resolves correctly per brand.
5. Each brand's `nav`, `cta`, `footer`, `fonts`, and `domain` come from `config/brands/<brand>.ts`.

One config. Four brands. Zero duplicated code.

## Content

Posts live in `content/<brand>/*.mdx`. Frontmatter schema is in `types/post.ts`. Set `published: true` to make a post visible. Reading time is auto-calculated.

## AI Auto Blog API

This repo now includes a secure endpoint at `POST /api/ai/blog` that can:

1. Research a topic.
2. Draft SEO content.
3. Run a second SEO/tone QA pass.
4. Save as a Sanity draft by default.
5. Publish on demand.

For autonomous coworker-AI execution:

1. Agent instructions: [AGENTS.md](./AGENTS.md)
2. Human operator guide: [docs/AI_AUTOBLOG_WORKFLOW.md](./docs/AI_AUTOBLOG_WORKFLOW.md)
3. Strategy and keyword map: [docs/CONTENT_STRATEGY_AND_KEYWORD_MAP.md](./docs/CONTENT_STRATEGY_AND_KEYWORD_MAP.md)

### Required environment variables

Set these in `.env.local` (see `.env.example`):

```bash
SANITY_API_TOKEN=...
AI_AUTOBLOG_SECRET=...
AI_PROVIDER=openai   # or anthropic or local
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4.1
OPENAI_ENABLE_WEB_SEARCH=true
AI_AUTOBLOG_MIN_SEO_SCORE=85
AI_AUTOBLOG_MIN_TONE_SCORE=85
AI_AUTOBLOG_ALLOW_LOCAL_FALLBACK=true
SANITY_STUDIO_BASE_URL=http://localhost:3333
```

If you want Anthropic instead of OpenAI:

```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=...
ANTHROPIC_MODEL=claude-3-7-sonnet-latest
ANTHROPIC_MODEL_FALLBACKS=claude-3-5-sonnet-latest,claude-3-5-haiku-latest
```

If you want zero provider credits and still run end-to-end draft generation:

```bash
AI_PROVIDER=local
AI_AUTOBLOG_ALLOW_LOCAL_FALLBACK=true
```

### Generate a draft

```bash
curl -X POST http://localhost:3000/api/ai/blog \
  -H "Content-Type: application/json" \
  -H "x-ai-secret: YOUR_SECRET" \
  -d '{
    "action": "generate",
    "brand": "impact-loop",
    "topic": "How nonprofit storytelling affects donor retention",
    "targetKeyword": "nonprofit donor retention storytelling",
    "category": "Storytelling",
    "tone": "Direct, practical, authority voice",
    "minSeoScore": 85,
    "minToneScore": 85,
    "dryRun": false,
    "publish": false
  }'
```

### Publish an existing draft

```bash
curl -X POST http://localhost:3000/api/ai/blog \
  -H "Content-Type: application/json" \
  -H "x-ai-secret: YOUR_SECRET" \
  -d '{
    "action": "publish",
    "draftId": "drafts.post-your-slug-123456",
    "minSeoScore": 85,
    "minToneScore": 85
  }'
```

### Response extras for your AI agent

Both `generate` and `publish` responses include:

1. `qualityGate` with pass/fail and reasons.
2. `rankingEstimate` with score, tier, confidence, risks, and recommendations.
3. `links` with `expectedLiveUrl`, `localViewUrl`, and `studioEditUrl` (if `SANITY_STUDIO_BASE_URL` is set).
4. `publishBlockedByQualityGate` when publish is requested but thresholds are not met.

### Important behavior

1. Drafts are default (`publish: false`).
2. Publish is blocked when quality thresholds are not met.
3. The pipeline enforces anti-AI style guardrails, including removing em dashes.
4. Sidebar widgets are generated automatically to fit the two-column sticky layout.
5. After create/publish, routes are revalidated (`/`, post, category, author, feed, sitemap, llms).

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full Vercel + DNS + Search Console click list.
