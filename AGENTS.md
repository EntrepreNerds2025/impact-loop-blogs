# AI Agent Runbook

This file defines how any AI agent should operate blog generation for this repo.

## Goal

Create high-quality blog drafts in Sanity, return a quality/ranking report, and publish only when quality gates pass.

## Strategy Source of Truth

Before choosing or generating a topic, read:

- `docs/CONTENT_STRATEGY_AND_KEYWORD_MAP.md`

Use that document to select:

1. Audience: nonprofit, corporate responsibility, or both.
2. Primary keyword.
3. Semantic keywords.
4. Category.
5. Search intent.
6. CTA and sidebar angle.

If the user gives a topic that is not in the strategy map, still proceed, but map it to the closest cluster and use the same quality gate.

## Required Setup

The repo expects these values in `.env.local`:

- `AI_PROVIDER`
- `AI_AUTOBLOG_SECRET`
- `SANITY_API_TOKEN`
- `AI_AUTOBLOG_MIN_SEO_SCORE`
- `AI_AUTOBLOG_MIN_TONE_SCORE`
- `AI_AUTOBLOG_ALLOW_LOCAL_FALLBACK` (recommended: `true`)
- `SANITY_STUDIO_BASE_URL` (optional but recommended)
- Provider key:
  - OpenAI: `OPENAI_API_KEY`
  - Anthropic: `ANTHROPIC_API_KEY`
  - Local/offline mode: set `AI_PROVIDER=local` (no external AI key required)

## Security Rules

1. Never print secret values from `.env.local`.
2. Never commit `.env.local`.
3. In responses to users, mask keys and tokens.

## Endpoint

- `POST /api/ai/blog`
- Auth header: `x-ai-secret: <AI_AUTOBLOG_SECRET>`

## Standard Workflow

1. Read `docs/CONTENT_STRATEGY_AND_KEYWORD_MAP.md`.
2. Map the request to a cluster, keyword, audience, and CTA.
3. Run a dry run first:
   - `action: "generate"`
   - `dryRun: true`
   - `publish: false`
4. Check `qualityGate.passed`.
5. If `qualityGate.passed` is false:
   - Regenerate with tighter notes/tone/keyword focus.
   - Repeat until gate passes.
6. Create the real draft:
   - `action: "generate"`
   - `dryRun: false`
   - `publish: false`
7. Return to user:
   - `title`, `slug`
   - `quality`, `qualityGate`
   - `rankingEstimate`
   - `links.expectedLiveUrl`, `links.localViewUrl`, `links.studioEditUrl` (if present)
8. Only publish when explicitly requested:
   - `action: "publish"`
   - `draftId: "..."`
9. If publish returns `publishBlockedByQualityGate: true`, revise and retry.

## Natural Language Intake

When a user gives a plain-language request, map it into the generation payload automatically.

Required:

1. `brand`
2. `topic`

Defaults when missing:

1. `targetKeyword`: use `topic`
2. `category`: infer from `docs/CONTENT_STRATEGY_AND_KEYWORD_MAP.md`; fallback to `Insights`
3. `tone`: `Direct, practical, non-hype authority`
4. `notes`: empty
5. `minSeoScore`: `85`
6. `minToneScore`: `85`

Brand alias mapping:

1. "impact loop" -> `impact-loop`
2. "rovonn" or "rovonn russell" -> `rovonn-russell`
3. "dream streams" -> `dream-streams`
4. "foundation" or "il foundation" -> `il-foundation`

If required fields are unclear:

1. Ask one concise follow-up question.
2. Do not ask multi-question checklists.
3. After answer, proceed immediately with dry run -> draft flow.

## Co-Worker Prompt Usage

If the user says "use coworker prompt" or equivalent:

1. Read `CO_WORKER_PROMPT.txt`.
2. Fill placeholders from user message/context.
3. Execute it without asking for re-confirmation unless required fields are missing.

## Generation Payload Template

```json
{
  "action": "generate",
  "brand": "impact-loop",
  "topic": "How nonprofit storytelling improves donor retention",
  "targetKeyword": "nonprofit donor retention storytelling",
  "category": "Storytelling",
  "tone": "Direct, practical, non-hype authority",
  "notes": "Prioritize practical steps and cite current sources",
  "minSeoScore": 85,
  "minToneScore": 85,
  "dryRun": false,
  "publish": false
}
```

## Publish Payload Template

```json
{
  "action": "publish",
  "draftId": "drafts.post-your-slug-123456",
  "minSeoScore": 85,
  "minToneScore": 85,
  "enforceQualityGate": true
}
```

## Brand Values

- `impact-loop`
- `rovonn-russell`
- `dream-streams`
- `il-foundation`

## Output Quality Expectations

1. No em dashes.
2. No generic AI phrasing.
3. SEO title and meta description present.
4. Sidebar modules are present and useful.
5. Include FAQ entries when relevant.
6. Follow the required structure in `docs/CONTENT_STRATEGY_AND_KEYWORD_MAP.md`.
7. Include current sources for recent claims, benchmarks, legal/regulatory topics, platform changes, and trend claims.
8. Prefer topics from the "First 20 Posts to Create" list until those are complete.
