#!/usr/bin/env node

/**
 * MDX → Sanity Migration Script
 * Migrates existing MDX blog posts + author into Sanity documents.
 *
 * Usage: SANITY_API_TOKEN=xxx node sanity/migrate.mjs
 */

import { createClient } from '@sanity/client';

// Accept token from env or command line arg
const token = process.argv[2] || process.env.SANITY_API_TOKEN;
if (!token) {
  console.error('Usage: node sanity/migrate.mjs <SANITY_TOKEN>');
  process.exit(1);
}
console.log(`Token starts with: ${token.substring(0, 8)}... (length: ${token.length})`);

const client = createClient({
  projectId: 'ngkvlovw',
  dataset: 'production',
  apiVersion: '2026-04-12',
  token: token,
  useCdn: false,
});

// ─── Author Document ──────────────────────────────────────────────
const author = {
  _id: 'author-rovonn-russell',
  _type: 'author',
  name: 'Rovonn Russell',
  slug: { _type: 'slug', current: 'rovonn-russell' },
  title: 'Impact Story Architect, Founder of Impact Loop',
  bio: 'Rovonn Russell helps mission-driven organizations turn their work into stories the world can see, trust, and act on. Founder of Impact Loop, a Toronto-based storytelling and systems company.',
  links: [
    { _key: 'lk1', label: 'LinkedIn', url: 'https://www.linkedin.com/in/rovonnrussell' },
    { _key: 'lk2', label: 'Impact Loop', url: 'https://impactloop.ca' },
    { _key: 'lk3', label: 'Personal Site', url: 'https://rovonnrussell.com' },
  ],
};

// ─── Helper: Convert MDX body text to Portable Text blocks ────────
function mdxToPortableText(content) {
  // Split into paragraphs and convert to basic Portable Text blocks
  const blocks = [];
  const lines = content.split('\n');
  let currentBlock = [];
  let blockIndex = 0;

  for (const line of lines) {
    // Handle headings
    if (line.startsWith('## ')) {
      if (currentBlock.length > 0) {
        blocks.push(makeTextBlock(currentBlock.join('\n'), 'normal', `blk${blockIndex++}`));
        currentBlock = [];
      }
      blocks.push(makeTextBlock(line.replace('## ', ''), 'h2', `blk${blockIndex++}`));
      continue;
    }
    if (line.startsWith('### ')) {
      if (currentBlock.length > 0) {
        blocks.push(makeTextBlock(currentBlock.join('\n'), 'normal', `blk${blockIndex++}`));
        currentBlock = [];
      }
      blocks.push(makeTextBlock(line.replace('### ', ''), 'h3', `blk${blockIndex++}`));
      continue;
    }

    // Handle CTA blocks — convert to ctaBlock custom type
    if (line.startsWith('<CTABlock')) {
      if (currentBlock.length > 0) {
        blocks.push(makeTextBlock(currentBlock.join('\n'), 'normal', `blk${blockIndex++}`));
        currentBlock = [];
      }
      const heading = line.match(/heading="([^"]+)"/)?.[1] || '';
      const body = line.match(/body="([^"]+)"/)?.[1] || '';
      blocks.push({
        _key: `blk${blockIndex++}`,
        _type: 'ctaBlock',
        heading,
        text: body,
        buttonLabel: 'Learn More',
        variant: 'primary',
      });
      continue;
    }

    // Handle PricingCallout — convert to a text block noting the content
    if (line.startsWith('<PricingCallout')) {
      if (currentBlock.length > 0) {
        blocks.push(makeTextBlock(currentBlock.join('\n'), 'normal', `blk${blockIndex++}`));
        currentBlock = [];
      }
      const tier = line.match(/tier="([^"]+)"/)?.[1] || '';
      const price = line.match(/price="([^"]+)"/)?.[1] || '';
      const includes = line.match(/includes="([^"]+)"/)?.[1] || '';
      const text = `${tier} — ${price}: ${includes.replace(/\s*\|\s*/g, ', ')}`;
      blocks.push(makeTextBlock(text, 'normal', `blk${blockIndex++}`));
      continue;
    }

    // Skip empty lines between paragraphs
    if (line.trim() === '') {
      if (currentBlock.length > 0) {
        blocks.push(makeTextBlock(currentBlock.join('\n'), 'normal', `blk${blockIndex++}`));
        currentBlock = [];
      }
      continue;
    }

    currentBlock.push(line);
  }

  // Flush remaining
  if (currentBlock.length > 0) {
    blocks.push(makeTextBlock(currentBlock.join('\n'), 'normal', `blk${blockIndex++}`));
  }

  return blocks;
}

function makeTextBlock(text, style, key) {
  // Parse inline bold markers **text** into spans with marks
  const spans = [];
  const markDefs = [];
  let spanIndex = 0;

  // Simple bold parsing
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  for (const part of parts) {
    if (part.startsWith('**') && part.endsWith('**')) {
      spans.push({
        _key: `sp${key}${spanIndex++}`,
        _type: 'span',
        text: part.slice(2, -2),
        marks: ['strong'],
      });
    } else if (part.length > 0) {
      // Handle italic within non-bold parts
      const italicParts = part.split(/(\*[^*]+\*)/g);
      for (const ip of italicParts) {
        if (ip.startsWith('*') && ip.endsWith('*') && !ip.startsWith('**')) {
          spans.push({
            _key: `sp${key}${spanIndex++}`,
            _type: 'span',
            text: ip.slice(1, -1),
            marks: ['em'],
          });
        } else if (ip.length > 0) {
          spans.push({
            _key: `sp${key}${spanIndex++}`,
            _type: 'span',
            text: ip,
            marks: [],
          });
        }
      }
    }
  }

  return {
    _key: key,
    _type: 'block',
    style,
    markDefs,
    children: spans.length > 0 ? spans : [{ _key: `sp${key}0`, _type: 'span', text, marks: [] }],
  };
}

// ─── Post Documents ───────────────────────────────────────────────
const posts = [
  {
    _id: 'post-nonprofit-video-viewers',
    _type: 'post',
    title: 'Why 57% of Nonprofit Video Viewers Donate (And How To Earn That Trust)',
    slug: { _type: 'slug', current: 'why-57-percent-of-nonprofit-video-viewers-donate' },
    date: '2026-04-07T00:00:00Z',
    lastModified: '2026-04-07T00:00:00Z',
    author: { _type: 'reference', _ref: 'author-rovonn-russell' },
    category: 'Storytelling',
    tags: ['nonprofit', 'video', 'fundraising', 'storytelling'],
    excerpt: 'Video moves donors more than any other format on the web. Here is why — and the three structural choices that separate the videos that convert from the ones that get ignored.',
    seoTitle: 'Why 57% of Nonprofit Video Viewers Donate | Impact Loop',
    metaDescription: 'Research shows 57% of people who watch a nonprofit video go on to donate. Here is the structural reason why, and how to build videos that earn that trust.',
    published: true,
    brand: 'impact-loop',
    readingTime: '4 min read',
    pillarPage: false,
    faq: [
      {
        _key: 'faq1',
        question: 'How long should a nonprofit fundraising video be?',
        answer: 'Between 60 and 180 seconds for social, and 3–5 minutes for landing pages. Long enough to land one specific story, short enough that the viewer never asks "how much longer."',
      },
      {
        _key: 'faq2',
        question: 'Do you need a professional crew to make a high-converting nonprofit video?',
        answer: 'No. The single most important variable is the clarity of the central story, not the camera. A phone-shot interview with a real beneficiary will outperform a polished b-roll montage almost every time.',
      },
    ],
    body: null, // will be filled below
  },
  {
    _id: 'post-15-ai-agents',
    _type: 'post',
    title: 'What I Learned Building 15 AI Agents for a Storytelling Company',
    slug: { _type: 'slug', current: 'lessons-from-building-15-ai-agents' },
    date: '2026-04-07T00:00:00Z',
    lastModified: '2026-04-07T00:00:00Z',
    author: { _type: 'reference', _ref: 'author-rovonn-russell' },
    category: 'Systems',
    tags: ['ai', 'agents', 'automation', 'storytelling', 'lessons'],
    excerpt: 'Fifteen agents in, here is what actually held up — and the three architectural mistakes I had to unlearn before any of it became reliable enough to run a business on.',
    seoTitle: 'Lessons From Building 15 AI Agents for Storytelling | Rovonn Russell',
    metaDescription: 'After shipping 15 production AI agents at Impact Loop, here are the architectural decisions that actually held up — and the ones I had to unlearn fast.',
    published: true,
    brand: 'rovonn-russell',
    readingTime: '5 min read',
    pillarPage: false,
    faq: [
      {
        _key: 'faq1',
        question: 'Should you build AI agents with one big prompt or many small steps?',
        answer: 'Many small deterministic steps. A single agent making 5 decisions in a row at 90% accuracy each only succeeds 59% of the time. Pushing decisions out into deterministic scripts is the difference between a demo and a production system.',
      },
      {
        _key: 'faq2',
        question: 'What is the biggest mistake people make when building their first AI agent?',
        answer: 'Trying to make the agent do everything — research, decide, execute, verify, and report — in one long context. The agents that actually work are the ones where the LLM is doing only the parts a script can\'t do, and everything else is hard-coded.',
      },
    ],
    body: null,
  },
  {
    _id: 'post-ontario-wedding-livestreaming',
    _type: 'post',
    title: 'Wedding Livestreaming in Ontario: The Complete 2026 Guide',
    slug: { _type: 'slug', current: 'wedding-livestreaming-ontario-2026-guide' },
    date: '2026-04-07T00:00:00Z',
    lastModified: '2026-04-07T00:00:00Z',
    author: { _type: 'reference', _ref: 'author-rovonn-russell' },
    category: 'Weddings',
    tags: ['wedding', 'livestream', 'ontario', 'ceremony'],
    excerpt: 'Everything Ontario couples need to know about livestreaming their wedding in 2026: what it costs, what venues require, and what actually matters when grandma is watching from across the country.',
    seoTitle: 'Wedding Livestreaming in Ontario (2026 Guide) | Dream Streams',
    metaDescription: 'The complete 2026 guide to livestreaming a wedding in Ontario — costs, venue requirements, audio setup, and how to make remote guests actually feel present.',
    published: true,
    brand: 'dream-streams',
    readingTime: '6 min read',
    pillarPage: false,
    faq: [
      {
        _key: 'faq1',
        question: 'How much does it cost to livestream a wedding in Ontario in 2026?',
        answer: 'Most professional Ontario wedding livestreams in 2026 cost between $850 and $2,400, depending on whether you want a single fixed camera or a multi-camera setup with a switched broadcast feed and dedicated audio.',
      },
      {
        _key: 'faq2',
        question: 'Do Ontario venues allow wedding livestreaming?',
        answer: 'Almost all do, but many require advance notice so they can route a wired ethernet line to your camera position. Always confirm 30+ days in advance and ask whether the venue has any restrictions on cellular bonding equipment.',
      },
    ],
    body: null,
  },
];

// ─── Post body content (MDX body after frontmatter) ───────────────

const postBodies = {
  'post-nonprofit-video-viewers': `**Direct answer:** 57% of people who watch a nonprofit video go on to donate to that organization, according to Google for Nonprofits data. The reason isn't the production value — it's that video is the only format that lets a donor *see and hear a real human being telling the truth about their life*. That single move shortens the trust gap from weeks to seconds.

Most nonprofit videos fail not because the editing is bad, but because they bury the human under context. The viewer has to wait 90 seconds to meet the person whose life is changing, and by then they've scrolled away.

## The three structural choices that change everything

The videos that earn the 57% conversion share three specific traits.

**1. The first 5 seconds belong to a human face, not your logo.** Open on the person whose story you're about to tell. No title card. No founder voiceover. No mission statement. Just a face and a sentence. The viewer's attention is committed before the music swells.

**2. There is exactly one story per video.** Not three beneficiaries. Not a montage of programs. One person, one arc, one specific moment of change. Pluralizing the story is the single most common mistake — and it cuts donation intent roughly in half because viewers can't form a parasocial bond with a category.

**3. The ask is anchored to the story, not pasted on.** The donation prompt should reference the specific person you just met. "Help us reach 200 more families like Asha's" beats "Donate to our annual fund" by a wide margin in every test I've ever run.

## Why this structure works (it's not magic)

Trust on the internet collapses to a question of *evidence*. Donors can read your impact report, but a written number is an assertion. A video of a real human, in their real environment, telling you what changed in their actual life — that's not an assertion, that's testimony. And the donor's brain processes those two things completely differently.

This is also why deeply produced "brand films" tend to underperform raw interviews on a $/donor basis. Production polish reads as marketing. Marketing puts the viewer back into evaluation mode. Evaluation mode is where donations die.

## The build pattern we use at Impact Loop

When we produce these for clients, the rough cost structure is one shoot day, one beneficiary, three deliverables: the 90-second hero, a 30-second cutdown for paid social, and a 15-second hook for organic. One subject. Three formats. A whole quarter of fundraising creative.

If you want to see the diagnostic we use to figure out *which* of your beneficiaries has the highest-converting story before you ever roll camera, that's exactly what the Impact Story Diagnostic is built for.

<CTABlock heading="Find the story your nonprofit is sitting on" body="Our 15-minute diagnostic surfaces the single highest-converting story your organization can tell this quarter — before you spend a dollar on production." />`,

  'post-15-ai-agents': `**Direct answer:** After shipping 15 production AI agents at Impact Loop, the single most important lesson is this: **the agent should be the dumbest part of the system, not the smartest.** Push every decision you can into deterministic scripts, and let the LLM only do the parts that genuinely require judgment. That one shift took my agents from "impressive demo, fragile in production" to "boring, reliable, runs every morning at 6 a.m. without me."

This post is the plain version of what I'd tell myself if I could go back to agent #1.

## The math nobody talks about

Here's the math that quietly kills most agent projects: if a single LLM call is right 90% of the time, and your workflow chains five of them together, your end-to-end success rate is 0.9⁵ = **59%**. Two out of five times, your agent fails — and worse, it fails *creatively*, in a different place every time, which makes debugging brutal.

The fix isn't a smarter model. The fix is fewer LLM decisions per workflow.

## The three mistakes I had to unlearn

**Mistake 1: One big mega-prompt that did everything.** My first agent tried to scrape leads, classify them, enrich them, draft an email, and send it — all inside one monster system prompt. It "worked" maybe 40% of the time. I rebuilt it as five tiny scripts where the LLM only made *one* judgment call per script, and the success rate jumped past 95%.

**Mistake 2: Letting the agent format its own output.** Free-text outputs are how you get downstream parsing errors. Every modern agent should be calling tools with structured JSON, not "please respond in this format." The day I stopped trusting prompts to format output correctly was the day my agents started shipping.

**Mistake 3: No self-annealing loop.** When an agent failed, I used to debug it once, fix the script, and move on. The breakthrough was treating every failure as a chance to update the *instructions file* the agent reads, so the next run is permanently smarter. The system gets stronger with use instead of weaker.

## What an actually-reliable agent looks like

The agents that survived contact with real clients all share the same shape. They have a tiny instructions file that tells the LLM *what* to do. They have a scripts/ folder full of deterministic Python that does *how*. The LLM picks which script to run, the scripts do the work, and any decision the scripts can't make gets handed back up to the LLM as a single, narrow question.

That separation is the entire game. Once I started building this way, the work stopped feeling like wrestling and started feeling like wiring up Lego.

## The agents I'd build first if I were starting over

If I were starting over today and could only build three agents, they'd be: an inbox-triager that classifies and routes incoming email, a lead-research agent that turns a name into a one-page brief, and a content-publishing agent that takes a draft and ships it through the full SEO + distribution pipeline. Those three give you back roughly 8–12 hours a week, which is enough leverage to fund building everything else.

## The honest part

Most AI agent demos you see online don't run twice. Mine didn't either, for a long time. The shift from "demos well" to "boots up at 6 a.m. for 90 days straight without me touching it" wasn't a model upgrade — it was a discipline upgrade. Smaller scopes. Deterministic glue. Structured outputs. Self-annealing instructions.

If you're building your first agent and it feels fragile, the answer probably isn't a better prompt. The answer is *less prompt*.

<CTABlock heading="Want help thinking through your AI build?" body="If you're trying to figure out where AI agents actually fit in your business — and where they're going to waste your money — let's talk." />`,

  'post-ontario-wedding-livestreaming': `**Direct answer:** Livestreaming a wedding in Ontario in 2026 typically costs between **$850 and $2,400** for a professional setup, takes about a week of pre-planning, and requires three things to go right: a stable connection at the venue, a clean wired audio feed, and a hidden but unobstructed camera line to the ceremony. Get those three right and remote guests genuinely feel present. Get them wrong and you've recorded a 45-minute video of audio static.

If you're a couple in Toronto, Hamilton, Niagara, Kingston, or anywhere across Southern Ontario reading this — this is the guide we wish someone had handed us before our first stream. Skip to whichever section matters to you.

## What "wedding livestreaming" actually means in 2026

A wedding livestream is a live, real-time broadcast of your ceremony (and optionally reception) sent to a private link your remote guests open from their phone, tablet, or TV. Modern setups use cellular bonding (think four 5G modems combined into one fat pipe) so they don't depend on venue wifi — which is the single most common reason older livestreams failed.

The remote guest experience in 2026 should feel like FaceTime, not like buffering YouTube.

## Ontario venue realities you should plan around

Older Ontario churches, lakefront cottages, and barn venues are gorgeous — and they're often connectivity dead zones. Three things to check before you book:

First, **cell signal at the actual ceremony spot** (not the parking lot). Stand where the officiant will stand, open a speed test, and write down the result. Anything below 25 Mbps upload on a single carrier means you'll want bonded cellular or a wired line.

Second, **whether the venue has a wired ethernet drop near the ceremony space.** Many newer Toronto and GTA venues do. Most rural venues don't. Knowing this in advance is the difference between a $150 add-on and a panicked Saturday afternoon.

Third, **the venue's policy on tripods and small cameras during the ceremony.** Most are fine. A handful of older churches have rules. Always ask in writing.

## The pricing breakdown (2026 Ontario rates)

<PricingCallout tier="Essentials" price="$850" includes="1 fixed camera at the back of the ceremony | Wired audio from officiant lapel mic | Single private viewing link | 90 minutes of ceremony coverage | Recorded copy delivered within 48 hours" />

This is the right tier if you have 5–25 remote guests and you mostly want grandma in Trinidad to see you say "I do" without missing a word. It is the most popular package we book.

<PricingCallout tier="Signature" price="$1,650" includes="2 cameras (wide + close-up) with a live switch | Lapel mic + ambient room mic mix | Branded title cards with your names | Up to 4 hours of coverage including processional, ceremony, and toasts | Same-day highlight clip" />

This tier is the sweet spot for couples who want the remote feed to feel produced, not improvised.

## What actually matters when grandma is watching

Audio. Audio audio audio.

Remote guests will forgive a slightly soft picture. They will not forgive being unable to hear the vows. The single biggest difference between a wedding livestream that gets shared with the family group chat and one that gets quietly closed at the 4-minute mark is whether the officiant is wearing a wired lapel mic that feeds directly into the camera.

Wifi is the second variable. Bonded cellular has solved 90% of the historical "buffering at the kiss" problem, and if your livestream provider is using gear from 2024 or later, you should not be on venue wifi. Period.

## How we do it at Dream Streams

We're an Ontario-based livestreaming team that *only* does weddings, funerals, and ceremonies. We bring bonded cellular, redundant audio, and a small two-person crew that disappears into the background. Most of our couples find us about 6–10 weeks out from their date.

If your date is coming up, the best move is to check availability now — May through October books out faster than couples expect.

<CTABlock heading="Check date availability for your Ontario wedding" body="We only take on a limited number of weddings each weekend so we can give every couple our full attention. Check your date in under a minute." />`,
};

// Fill body fields with Portable Text
for (const post of posts) {
  const bodyMdx = postBodies[post._id];
  if (bodyMdx) {
    post.body = mdxToPortableText(bodyMdx);
  }
}

// ─── Run Migration ────────────────────────────────────────────────
async function migrate() {
  console.log('Starting migration...\n');

  // Create author first
  console.log('Creating author: Rovonn Russell...');
  await client.createOrReplace(author);
  console.log('✓ Author created\n');

  // Create posts
  for (const post of posts) {
    console.log(`Creating post: ${post.title}...`);
    await client.createOrReplace(post);
    console.log(`✓ Post created (brand: ${post.brand})\n`);
  }

  console.log('─────────────────────────────────────────');
  console.log('Migration complete! 1 author + 3 posts created.');
  console.log('Open Sanity Studio to verify: http://localhost:3333');
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
