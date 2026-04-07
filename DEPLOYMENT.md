# Deployment Guide — Impact Loop Blogs Monorepo

> "I prep, you click." This file is the click list.

This monorepo powers 4 separate Vercel deployments from one codebase. The active brand is selected by the `BRAND` environment variable on each Vercel project.

| Brand | BRAND value | Domain |
|---|---|---|
| Impact Loop | `impact-loop` | `blog.impactloop.ca` |
| Rovonn Russell | `rovonn-russell` | `blog.rovonnrussell.com` |
| Dream Streams | `dream-streams` | `blog.dreamstreams.ca` |
| IL Foundation (later) | `il-foundation` | `blog.ilfoundation.ca` |

---

## 1. Push the repo to GitHub (one time)

The monorepo lives at `EntrepreNerds2025/impact-loop-blogs`. Create the empty repo on GitHub first (no README, no .gitignore — empty), then from this folder:

```bash
git init -b main
git add .
git commit -m "Initial monorepo scaffold: 4 brand blogs"
git remote add origin https://github.com/EntrepreNerds2025/impact-loop-blogs.git
git push -u origin main
```

---

## 2. Create the Vercel projects (4 of them, all from the same repo)

For **each** brand, do this in the Vercel dashboard:

1. **Add New → Project** → import `EntrepreNerds2025/impact-loop-blogs`
2. **Project Name**: use the brand key (e.g. `impact-loop-blog`)
3. **Framework Preset**: Next.js (auto-detected)
4. **Root Directory**: leave as `./`
5. **Environment Variables** → add **one** variable:
   - `BRAND` = `impact-loop` *(or `rovonn-russell` / `dream-streams` / `il-foundation`)*
   - Apply to: Production, Preview, Development
6. **Deploy**

Repeat for each brand. Same repo, different `BRAND` env var, different project name.

---

## 3. Connect the subdomains (DNS)

In each Vercel project → **Settings → Domains**, add the subdomain:

| Project | Domain to add |
|---|---|
| `impact-loop-blog` | `blog.impactloop.ca` |
| `rovonn-russell-blog` | `blog.rovonnrussell.com` |
| `dream-streams-blog` | `blog.dreamstreams.ca` |
| `il-foundation-blog` | `blog.ilfoundation.ca` |

Vercel will then ask you to add a **CNAME** record at your DNS provider:

```
Type:   CNAME
Name:   blog
Value:  cname.vercel-dns.com
TTL:    Auto / 3600
```

Add that CNAME at whichever registrar holds each domain (GoDaddy, Namecheap, Cloudflare, etc.). Propagation usually takes 5–30 minutes. Vercel will auto-issue an SSL certificate once it sees the CNAME resolve.

---

## 4. Search Console + Bing Webmaster (per brand)

After each subdomain is live and serving HTTPS:

1. Open [Google Search Console](https://search.google.com/search-console) → **Add Property** → **URL prefix** → paste `https://blog.impactloop.ca` (etc.).
2. Verify via **DNS TXT record** (recommended — easier to keep across redeploys).
3. Submit the sitemap: `https://blog.impactloop.ca/sitemap.xml`
4. Repeat the same three steps in [Bing Webmaster Tools](https://www.bing.com/webmasters).

Do all 4 brands. ~10 minutes per brand.

---

## 5. Local development

```bash
npm install

# Run any single brand locally
npm run dev:impact-loop
npm run dev:rovonn-russell
npm run dev:dream-streams
npm run dev:il-foundation
```

Each command sets `BRAND` for that dev session, so the entire site renders with that brand's palette, fonts, nav, footer, content, and CTAs.

---

## 6. Adding a new post

1. Create `content/<brand>/<slug>.mdx` with frontmatter (see existing posts for the schema).
2. Set `published: true`.
3. Commit and push to `main`.
4. Vercel auto-deploys. ISR revalidates within 60 seconds.

That's it — no rebuild required for new posts on existing brands.

---

## 7. What ships out of the box

- 4 fully themed brands (Impact Loop, Rovonn Russell, Dream Streams, IL Foundation stub)
- MDX posts with custom components (`CTABlock`, `ImpactStat`, `InsightBox`, `PricingCallout`, etc.)
- Article + FAQPage + Organization + BreadcrumbList JSON-LD on every post
- `sitemap.xml`, `robots.txt`, `feed.xml`, `llms.txt` per brand
- Reading progress bar, share buttons, author bio, related posts, category + author archives
- GEO/AI-search optimized: direct answer in first paragraph of every post, FAQ schema, llms.txt manifest
- Tailwind theming via CSS custom properties — one config powers all 4 brands

---

## Quick troubleshooting

- **Wrong brand showing on a deployment?** Check Vercel → Project → Settings → Environment Variables. The `BRAND` value must match one of the 4 keys exactly.
- **CNAME not resolving?** Wait 30 min, then re-check DNS. If still failing, confirm there's no conflicting A or AAAA record on the same `blog` subdomain.
- **Post not appearing?** Confirm `published: true` in the frontmatter and that the file is in `content/<brand>/`.
