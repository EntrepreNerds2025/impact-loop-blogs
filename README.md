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

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full Vercel + DNS + Search Console click list.
