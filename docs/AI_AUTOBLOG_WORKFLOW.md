# AI Autoblog Workflow (Coworker Ready)

Use this when instructing any AI coworker to create blogs in this repo.

## Strategy First

Before generating a post, use:

- [CONTENT_STRATEGY_AND_KEYWORD_MAP.md](./CONTENT_STRATEGY_AND_KEYWORD_MAP.md)

That file defines the priority nonprofit and corporate responsibility topic clusters, keyword map, first 20 posts, required blog structure, CTA strategy, sidebar defaults, and quality gate.

## One-Time Setup

1. Ensure `.env.local` is configured.
2. Start the app:

```powershell
cd "C:\Users\Rovonn\OneDrive\Desktop\Claude Work\impact-loop-blogs"
nvm use 20
npm run dev
```

## No-credit mode (Local generation)

If you want full draft workflow without Anthropic/OpenAI credits:

```env
AI_PROVIDER=local
AI_AUTOBLOG_ALLOW_LOCAL_FALLBACK=true
```

This still runs `generate -> quality gate -> draft in Sanity -> publish` end-to-end.

## AI Task Prompt (Copy/Paste)

Use this prompt with your coworker AI:

```text
Use the repo's AGENTS.md workflow for /api/ai/blog.
Read docs/CONTENT_STRATEGY_AND_KEYWORD_MAP.md first and map this request to the closest topic cluster, keyword, audience, intent, CTA, and sidebar angle.
Create a dry-run first, then create a real draft when quality gate passes.
Return: title, slug, quality, qualityGate, rankingEstimate, and links.
Do not publish until I explicitly say publish.
Brand: impact-loop
Topic: <YOUR TOPIC>
Target keyword: <YOUR KEYWORD>
Tone: direct, practical, non-hype authority
```

If you give the coworker AI a casual request instead of full inputs, it should auto-fill missing values using `AGENTS.md` defaults and ask only one follow-up if `brand` or `topic` is unclear.

## API Contract

### Generate Draft

```json
{
  "action": "generate",
  "brand": "impact-loop",
  "topic": "Your topic",
  "targetKeyword": "your keyword",
  "category": "Storytelling",
  "tone": "Direct, practical, non-hype authority",
  "minSeoScore": 85,
  "minToneScore": 85,
  "dryRun": false,
  "publish": false
}
```

### Publish Existing Draft

```json
{
  "action": "publish",
  "draftId": "drafts.post-your-slug-123456",
  "minSeoScore": 85,
  "minToneScore": 85,
  "enforceQualityGate": true
}
```

## What You Should Receive Back

1. `quality`
2. `qualityGate`
3. `rankingEstimate`
4. `links.expectedLiveUrl`
5. `links.localViewUrl`
6. `links.studioEditUrl` (if configured)

## Troubleshooting

1. `Unauthorized`:
   - Wrong `x-ai-secret` header or `AI_AUTOBLOG_SECRET` mismatch.
2. `Missing ... API key`:
   - Provider key not set in `.env.local`.
   - If you want no provider key, use `AI_PROVIDER=local`.
3. Anthropic model not found:
   - Set `ANTHROPIC_MODEL` to a valid model for your account.
   - Use `ANTHROPIC_MODEL_FALLBACKS` with known valid IDs.
4. `publishBlockedByQualityGate: true`:
   - Regenerate draft with tighter notes and retry.
