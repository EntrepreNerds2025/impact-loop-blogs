import { randomUUID, timingSafeEqual } from 'crypto';
import { createClient, type SanityClient } from '@sanity/client';
import { getBrand } from '@/config/brand';
import { sanityConfig } from '@/sanity/client';
import type { BrandKey, PortableTextNode } from '@/types/post';

type JsonRecord = Record<string, unknown>;
type AIProvider = 'openai' | 'anthropic';

export interface GenerateAutoBlogRequest {
  brand: BrandKey;
  topic: string;
  targetKeyword?: string;
  category?: string;
  notes?: string;
  tone?: string;
  authorSlug?: string;
  publish?: boolean;
  dryRun?: boolean;
  targetWordCount?: number;
  minSeoScore?: number;
  minToneScore?: number;
}

export interface PublishAutoBlogRequest {
  draftId?: string;
  slug?: string;
  brand?: BrandKey;
  minSeoScore?: number;
  minToneScore?: number;
  enforceQualityGate?: boolean;
}

export interface QualityReport {
  seoScore: number;
  toneScore: number;
  issues: string[];
}

export interface QualityGateResult {
  minSeoScore: number;
  minToneScore: number;
  passed: boolean;
  reasons: string[];
}

export interface RankingEstimate {
  score: number;
  tier: 'low' | 'medium' | 'high';
  confidence: 'low' | 'medium' | 'high';
  expectedWindow: string;
  factors: string[];
  risks: string[];
  recommendations: string[];
}

export interface AutoBlogLinks {
  expectedLiveUrl: string;
  localViewUrl: string;
  studioEditUrl?: string;
}

export interface GenerateAutoBlogResult {
  title: string;
  slug: string;
  category: string;
  draftId?: string;
  publishedId?: string;
  published: boolean;
  quality: QualityReport;
  qualityGate: QualityGateResult;
  rankingEstimate: RankingEstimate;
  links: AutoBlogLinks;
  publishBlockedByQualityGate?: boolean;
  research: {
    primaryKeyword: string;
    semanticKeywords: string[];
    sourceCount: number;
    sources: Array<{ source: string; url: string; publishedDate?: string }>;
  };
}

export interface PublishAutoBlogResult {
  published: boolean;
  draftId: string;
  publishedId?: string;
  slug: string;
  category: string;
  authorSlug: string;
  quality: QualityReport;
  qualityGate: QualityGateResult;
  rankingEstimate: RankingEstimate;
  links: AutoBlogLinks;
  publishBlockedByQualityGate?: boolean;
}

interface ResearchBrief {
  primaryKeyword: string;
  semanticKeywords: string[];
  questionsPeopleAsk: string[];
  stats: Array<{ claim: string; source: string; url: string; publishedDate?: string }>;
  suggestedCategory: string;
}

type DraftSection =
  | { type: 'paragraph' | 'h2' | 'h3' | 'h4' | 'quote'; text: string }
  | { type: 'bulletList' | 'numberList'; items: string[] };

interface DraftPayload {
  title: string;
  slug: string;
  category: string;
  tags: string[];
  excerpt: string;
  seoTitle: string;
  metaDescription: string;
  faq: Array<{ question: string; answer: string }>;
  sections: DraftSection[];
  cta?: {
    heading: string;
    text?: string;
    buttonLabel: string;
    buttonHref?: string;
    variant?: 'primary' | 'secondary' | 'subtle';
    utmCampaign?: string;
  };
  sidebar?: {
    title?: string;
    imageCta?: { heading?: string; body?: string; buttonLabel?: string; buttonHref?: string };
    promo?: {
      eyebrow?: string;
      heading?: string;
      body?: string;
      buttonLabel?: string;
      buttonHref?: string;
      theme?: 'light' | 'dark';
    };
    newsletter?: { title?: string; body?: string; buttonLabel?: string };
    trendingTitle?: string;
  };
}

const OPENAI_RESPONSES_URL = 'https://api.openai.com/v1/responses';
const ANTHROPIC_MESSAGES_URL = 'https://api.anthropic.com/v1/messages';
const AI_BANNED_STYLE_PHRASES = [
  'in conclusion',
  'in today',
  'delve into',
  'ever-evolving',
  'game-changer',
  'unlock the',
  'seamless',
];

const key = (prefix: string) => `${prefix}-${randomUUID().replace(/-/g, '').slice(0, 10)}`;
const asString = (value: unknown) => (typeof value === 'string' ? value.trim() : '');
const asStringArray = (value: unknown) => (Array.isArray(value) ? value.map(asString).filter(Boolean) : []);

function getAiProvider(): AIProvider {
  const raw = asString(process.env.AI_PROVIDER).toLowerCase();
  if (raw === 'anthropic') return 'anthropic';
  return 'openai';
}

function getAiApiKey(provider: AIProvider): string {
  if (provider === 'anthropic') {
    const keyValue = process.env.ANTHROPIC_API_KEY;
    if (!keyValue) throw new Error('Missing ANTHROPIC_API_KEY.');
    return keyValue;
  }
  const keyValue = process.env.OPENAI_API_KEY;
  if (!keyValue) throw new Error('Missing OPENAI_API_KEY.');
  return keyValue;
}

function resolveModel(provider: AIProvider, purpose: 'research' | 'writer' | 'audit'): string {
  if (provider === 'anthropic') {
    if (purpose === 'research') {
      return process.env.ANTHROPIC_RESEARCH_MODEL || process.env.ANTHROPIC_MODEL || 'claude-3-7-sonnet-latest';
    }
    if (purpose === 'writer') {
      return process.env.ANTHROPIC_WRITER_MODEL || process.env.ANTHROPIC_MODEL || 'claude-3-7-sonnet-latest';
    }
    return process.env.ANTHROPIC_AUDIT_MODEL || process.env.ANTHROPIC_MODEL || 'claude-3-7-sonnet-latest';
  }

  if (purpose === 'research') return process.env.OPENAI_RESEARCH_MODEL || process.env.OPENAI_MODEL || 'gpt-4.1';
  if (purpose === 'writer') return process.env.OPENAI_WRITER_MODEL || process.env.OPENAI_MODEL || 'gpt-4.1';
  return process.env.OPENAI_AUDIT_MODEL || process.env.OPENAI_MODEL || 'gpt-4.1';
}

function anthropicModelCandidates(preferred: string): string[] {
  const fromEnv = asString(process.env.ANTHROPIC_MODEL_FALLBACKS)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const defaults = [
    'claude-3-5-sonnet-latest',
    'claude-3-5-haiku-latest',
  ];

  return [preferred, ...fromEnv, ...defaults].filter((item, idx, arr) => item && arr.indexOf(item) === idx);
}

function sanitizeNoEmDash(text: string): string {
  return text.replace(/\u2014/g, ', ').replace(/\u2013/g, '-').replace(/\s{2,}/g, ' ').trim();
}

function slugify(input: string): string {
  const base = sanitizeNoEmDash(input)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
  return base || `post-${Date.now()}`;
}

function extractOutputText(payload: unknown): string {
  if (!payload || typeof payload !== 'object') return '';
  const data = payload as JsonRecord;
  if (typeof data.output_text === 'string' && data.output_text.trim()) return data.output_text;
  if (Array.isArray(data.output)) {
    const parts: string[] = [];
    for (const outputItem of data.output) {
      const content = outputItem && typeof outputItem === 'object' ? (outputItem as JsonRecord).content : null;
      if (!Array.isArray(content)) continue;
      for (const part of content) {
        const text = part && typeof part === 'object' ? (part as JsonRecord).text : null;
        if (typeof text === 'string' && text.trim()) parts.push(text.trim());
      }
    }
    if (parts.length > 0) return parts.join('\n');
  }
  return '';
}

function extractJson(rawText: string): string {
  const trimmed = rawText.trim();
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    return trimmed;
  }
  const first = trimmed.indexOf('{');
  const last = trimmed.lastIndexOf('}');
  if (first >= 0 && last > first) return trimmed.slice(first, last + 1);
  throw new Error('AI response did not contain JSON.');
}

async function callOpenAiJson<T>({
  apiKey,
  model,
  systemPrompt,
  userPrompt,
  useWebSearch,
}: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  useWebSearch?: boolean;
}): Promise<T> {
  const payload: JsonRecord = {
    model,
    input: [
      { role: 'system', content: [{ type: 'input_text', text: systemPrompt }] },
      { role: 'user', content: [{ type: 'input_text', text: userPrompt }] },
    ],
  };
  if (useWebSearch) payload.tools = [{ type: 'web_search_preview' }];

  const res = await fetch(OPENAI_RESPONSES_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  });
  const json = (await res.json().catch(() => null)) as unknown;
  if (!res.ok) {
    if (useWebSearch) {
      return callOpenAiJson<T>({ apiKey, model, systemPrompt, userPrompt, useWebSearch: false });
    }
    throw new Error(`OpenAI request failed: ${JSON.stringify(json)}`);
  }

  const text = extractOutputText(json);
  const parsed = extractJson(text);
  return JSON.parse(parsed) as T;
}

async function callAnthropicJson<T>({
  apiKey,
  model,
  systemPrompt,
  userPrompt,
}: {
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
}): Promise<T> {
  const candidates = anthropicModelCandidates(model);
  let lastError: string | null = null;

  for (const candidate of candidates) {
    const payload: JsonRecord = {
      model: candidate,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    };

    const res = await fetch(ANTHROPIC_MESSAGES_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });
    const json = (await res.json().catch(() => null)) as unknown;

    if (!res.ok) {
      const data = json && typeof json === 'object' ? (json as JsonRecord) : {};
      const errorObj = data.error && typeof data.error === 'object' ? (data.error as JsonRecord) : undefined;
      const errorType = asString(errorObj?.type);
      const message = asString(errorObj?.message);
      lastError = `model=${candidate} type=${errorType || 'unknown'} message=${message || JSON.stringify(json)}`;

      const shouldTryNext = errorType === 'not_found_error' || message.toLowerCase().includes('model');
      if (shouldTryNext) continue;

      throw new Error(`Anthropic request failed: ${JSON.stringify(json)}`);
    }

    const data = (json && typeof json === 'object' ? (json as JsonRecord) : {}) as JsonRecord;
    let text = '';
    const content = data.content;
    if (Array.isArray(content)) {
      text = content
        .map((item) => (item && typeof item === 'object' ? asString((item as JsonRecord).text) : ''))
        .filter(Boolean)
        .join('\n');
    }
    if (!text) {
      text = extractOutputText(data);
    }
    const parsed = extractJson(text);
    return JSON.parse(parsed) as T;
  }

  throw new Error(`Anthropic request failed for all model candidates. Last error: ${lastError ?? 'unknown'}`);
}

async function callAiJson<T>({
  provider,
  apiKey,
  model,
  systemPrompt,
  userPrompt,
  useWebSearch,
}: {
  provider: AIProvider;
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  useWebSearch?: boolean;
}): Promise<T> {
  if (provider === 'anthropic') {
    return callAnthropicJson<T>({ apiKey, model, systemPrompt, userPrompt });
  }
  return callOpenAiJson<T>({ apiKey, model, systemPrompt, userPrompt, useWebSearch });
}

function normalizeResearch(raw: Partial<ResearchBrief>, fallbackKeyword: string, fallbackCategory: string): ResearchBrief {
  const statsRaw = Array.isArray(raw.stats) ? raw.stats : [];
  const stats = statsRaw
    .map((item) => (item && typeof item === 'object' ? (item as JsonRecord) : null))
    .filter((item): item is JsonRecord => item !== null)
    .map((item) => ({
      claim: sanitizeNoEmDash(asString(item.claim)),
      source: sanitizeNoEmDash(asString(item.source)),
      url: asString(item.url),
      publishedDate: asString(item.publishedDate) || undefined,
    }))
    .filter((item) => item.claim && item.source && item.url);

  return {
    primaryKeyword: sanitizeNoEmDash(asString(raw.primaryKeyword)) || sanitizeNoEmDash(fallbackKeyword),
    semanticKeywords: asStringArray(raw.semanticKeywords).map(sanitizeNoEmDash).slice(0, 12),
    questionsPeopleAsk: asStringArray(raw.questionsPeopleAsk).map(sanitizeNoEmDash).slice(0, 10),
    stats,
    suggestedCategory: sanitizeNoEmDash(asString(raw.suggestedCategory)) || fallbackCategory,
  };
}

function normalizeDraft(raw: Partial<DraftPayload>, fallbackTopic: string, fallbackCategory: string): DraftPayload {
  const title = sanitizeNoEmDash(asString(raw.title)) || sanitizeNoEmDash(fallbackTopic);
  const sectionsRaw = Array.isArray(raw.sections) ? raw.sections : [];
  const sections: DraftSection[] = sectionsRaw
    .map((item) => (item && typeof item === 'object' ? (item as JsonRecord) : null))
    .filter((item): item is JsonRecord => item !== null)
    .map((item) => {
      const type = asString(item.type);
      if (type === 'bulletList' || type === 'numberList') {
        return { type, items: asStringArray(item.items).map(sanitizeNoEmDash) } as DraftSection;
      }
      return { type: (type as DraftSection['type']) || 'paragraph', text: sanitizeNoEmDash(asString(item.text)) } as DraftSection;
    })
    .filter((section) => {
      if ('items' in section) return section.items.length > 0;
      return section.text.length > 0;
    });

  return {
    title,
    slug: slugify(asString(raw.slug) || title),
    category: sanitizeNoEmDash(asString(raw.category)) || sanitizeNoEmDash(fallbackCategory),
    tags: asStringArray(raw.tags).map(sanitizeNoEmDash).slice(0, 8),
    excerpt: sanitizeNoEmDash(asString(raw.excerpt)).slice(0, 280) || title,
    seoTitle: sanitizeNoEmDash(asString(raw.seoTitle)).slice(0, 70) || title.slice(0, 70),
    metaDescription: sanitizeNoEmDash(asString(raw.metaDescription)).slice(0, 160) || title.slice(0, 150),
    faq: (Array.isArray(raw.faq) ? raw.faq : [])
      .map((item) => (item && typeof item === 'object' ? (item as JsonRecord) : null))
      .filter((item): item is JsonRecord => item !== null)
      .map((item) => ({
        question: sanitizeNoEmDash(asString(item.question)),
        answer: sanitizeNoEmDash(asString(item.answer)),
      }))
      .filter((item) => item.question && item.answer)
      .slice(0, 3),
    sections,
    cta: raw.cta && typeof raw.cta === 'object' ? (raw.cta as DraftPayload['cta']) : undefined,
    sidebar: raw.sidebar && typeof raw.sidebar === 'object' ? (raw.sidebar as DraftPayload['sidebar']) : undefined,
  };
}

function evaluateQuality(draft: DraftPayload, keyword: string, minWords: number): QualityReport {
  const issues: string[] = [];
  const body = draft.sections
    .map((section) => {
      if ('items' in section) return section.items.join(' ');
      return section.text;
    })
    .join(' ')
    .trim();
  const words = body.split(/\s+/).filter(Boolean).length;
  const headingCount = draft.sections.filter((section) => section.type === 'h2' || section.type === 'h3').length;
  const first200 = body.split(/\s+/).slice(0, 200).join(' ').toLowerCase();
  const lowered = [draft.title, draft.seoTitle, draft.metaDescription, draft.excerpt, body].join(' ').toLowerCase();

  if (draft.title.length < 45 || draft.title.length > 70) issues.push('Title should be 45-70 characters.');
  if (draft.seoTitle.length < 45 || draft.seoTitle.length > 70) issues.push('SEO title should be 45-70 characters.');
  if (draft.metaDescription.length < 130 || draft.metaDescription.length > 160) issues.push('Meta description should be 130-160 characters.');
  if (words < minWords) issues.push(`Body should be at least ${minWords} words.`);
  if (headingCount < 3) issues.push('Body should include at least three section headings.');
  if (keyword && !draft.title.toLowerCase().includes(keyword.toLowerCase())) issues.push('Primary keyword is missing from title.');
  if (keyword && !first200.includes(keyword.toLowerCase())) issues.push('Primary keyword should appear in the first 200 words.');
  if (/\u2014/.test(lowered)) issues.push('No em dashes allowed.');
  for (const phrase of AI_BANNED_STYLE_PHRASES) if (lowered.includes(phrase)) issues.push(`Avoid AI phrase: "${phrase}".`);

  const seoIssueCount = issues.filter((issue) => issue.includes('Title') || issue.includes('keyword') || issue.includes('Meta') || issue.includes('Body')).length;
  const toneIssueCount = issues.length - seoIssueCount;

  return {
    seoScore: Math.max(0, 100 - seoIssueCount * 12),
    toneScore: Math.max(0, 100 - toneIssueCount * 14),
    issues,
  };
}

function clampScore(value: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function resolveQualityThresholds(minSeoScore?: number, minToneScore?: number): {
  minSeoScore: number;
  minToneScore: number;
} {
  const envSeo = Number(process.env.AI_AUTOBLOG_MIN_SEO_SCORE);
  const envTone = Number(process.env.AI_AUTOBLOG_MIN_TONE_SCORE);
  const defaultSeo = Number.isFinite(envSeo) ? clampScore(envSeo, 85) : 85;
  const defaultTone = Number.isFinite(envTone) ? clampScore(envTone, 85) : 85;
  return {
    minSeoScore: clampScore(minSeoScore ?? defaultSeo, defaultSeo),
    minToneScore: clampScore(minToneScore ?? defaultTone, defaultTone),
  };
}

function buildQualityGate(
  quality: QualityReport,
  thresholds: { minSeoScore: number; minToneScore: number }
): QualityGateResult {
  const reasons: string[] = [];
  if (quality.seoScore < thresholds.minSeoScore) {
    reasons.push(`SEO score ${quality.seoScore} is below threshold ${thresholds.minSeoScore}.`);
  }
  if (quality.toneScore < thresholds.minToneScore) {
    reasons.push(`Tone score ${quality.toneScore} is below threshold ${thresholds.minToneScore}.`);
  }
  return {
    minSeoScore: thresholds.minSeoScore,
    minToneScore: thresholds.minToneScore,
    passed: reasons.length === 0,
    reasons,
  };
}

function analyzeDraft(draft: DraftPayload): {
  wordCount: number;
  headingCount: number;
  listCount: number;
} {
  let wordCount = 0;
  let headingCount = 0;
  let listCount = 0;

  for (const section of draft.sections) {
    if ('items' in section) {
      listCount += 1;
      for (const item of section.items) {
        wordCount += item.split(/\s+/).filter(Boolean).length;
      }
      continue;
    }

    if (section.type === 'h2' || section.type === 'h3' || section.type === 'h4') headingCount += 1;
    wordCount += section.text.split(/\s+/).filter(Boolean).length;
  }

  return { wordCount, headingCount, listCount };
}

function buildRankingEstimate({
  quality,
  sourceCount,
  wordCount,
  headingCount,
  listCount,
}: {
  quality: QualityReport;
  sourceCount: number;
  wordCount: number;
  headingCount: number;
  listCount: number;
}): RankingEstimate {
  const structureBonus = Math.min(8, headingCount * 2) + Math.min(4, listCount * 2);
  const depthBonus = Math.min(8, Math.floor(wordCount / 250));
  const sourceBonus = Math.min(8, sourceCount * 2);
  const issuePenalty = Math.min(12, quality.issues.length * 2);

  const raw = quality.seoScore * 0.58 + quality.toneScore * 0.32 + structureBonus + depthBonus + sourceBonus - issuePenalty;
  const score = clampScore(raw, 0);
  const tier: RankingEstimate['tier'] = score >= 80 ? 'high' : score >= 62 ? 'medium' : 'low';
  const confidence: RankingEstimate['confidence'] =
    sourceCount >= 4 && wordCount >= 1200 ? 'high' : sourceCount >= 2 ? 'medium' : 'low';

  const expectedWindow =
    tier === 'high'
      ? 'Strong long-tail ranking potential in 4-10 weeks.'
      : tier === 'medium'
      ? 'Moderate ranking potential in 6-12 weeks with internal links.'
      : 'Low ranking probability without revisions and stronger topical authority.';

  const factors = [
    `SEO score: ${quality.seoScore}/100`,
    `Tone score: ${quality.toneScore}/100`,
    `Word count: ${wordCount}`,
    `Source citations captured: ${sourceCount}`,
    `Structured headings: ${headingCount}`,
  ];

  const risks = [
    ...(quality.issues.slice(0, 4)),
    ...(sourceCount < 2 ? ['Low source coverage can weaken trust and E-E-A-T signals.'] : []),
  ];

  const recommendations = [
    'Add internal links from relevant pillar and category pages.',
    'Refresh with new stats every 60-90 days.',
    ...(quality.issues.length > 0 ? ['Fix remaining SEO/tone issues before publish.'] : []),
  ];

  return { score, tier, confidence, expectedWindow, factors, risks, recommendations };
}

function buildLinks({
  brandKey,
  slug,
  docId,
}: {
  brandKey: BrandKey;
  slug: string;
  docId?: string;
}): AutoBlogLinks {
  const brand = getBrand(brandKey);
  const expectedLiveUrl = `https://${brand.domain}/blog/${slug}`;
  const localViewUrl = `http://localhost:3000/blog/${slug}`;

  const studioBase = asString(process.env.SANITY_STUDIO_BASE_URL || process.env.NEXT_PUBLIC_SANITY_STUDIO_URL).replace(/\/$/, '');
  const studioEditUrl = studioBase && docId ? `${studioBase}/structure/allPosts;${encodeURIComponent(docId)}` : undefined;

  return { expectedLiveUrl, localViewUrl, studioEditUrl };
}

function toPortableText(draft: DraftPayload): PortableTextNode[] {
  const blocks: PortableTextNode[] = [];
  for (const section of draft.sections) {
    if ('items' in section) {
      for (const item of section.items) {
        blocks.push({
          _type: 'block',
          _key: key('blk'),
          style: 'normal',
          listItem: section.type === 'bulletList' ? 'bullet' : 'number',
          level: 1,
          markDefs: [],
          children: [{ _type: 'span', _key: key('spn'), text: sanitizeNoEmDash(item), marks: [] }],
        });
      }
      continue;
    }
    const styleMap: Record<string, 'normal' | 'h2' | 'h3' | 'h4' | 'blockquote'> = {
      paragraph: 'normal',
      h2: 'h2',
      h3: 'h3',
      h4: 'h4',
      quote: 'blockquote',
    };
    blocks.push({
      _type: 'block',
      _key: key('blk'),
      style: styleMap[section.type] || 'normal',
      markDefs: [],
      children: [{ _type: 'span', _key: key('spn'), text: sanitizeNoEmDash(section.text), marks: [] }],
    });
  }

  if (draft.cta?.heading && draft.cta?.buttonLabel) {
    blocks.push({
      _type: 'ctaBlock',
      _key: key('cta'),
      heading: sanitizeNoEmDash(draft.cta.heading),
      text: draft.cta.text ? sanitizeNoEmDash(draft.cta.text) : undefined,
      buttonLabel: sanitizeNoEmDash(draft.cta.buttonLabel),
      buttonHref: draft.cta.buttonHref,
      variant: draft.cta.variant || 'primary',
      utmCampaign: draft.cta.utmCampaign,
    });
  }

  return blocks;
}

function makeSidebarModules(
  draft: DraftPayload,
  category: string,
  internalLinks: Array<{ title: string; slug: string }>,
  brandCtaHref: string,
  research: ResearchBrief
) {
  const categoryHref = `/blog/category/${encodeURIComponent(category)}`;
  const trending = internalLinks.slice(0, 4).map((item) => ({ _key: key('tr'), title: item.title, href: `/blog/${item.slug}` }));
  if (trending.length === 0) {
    for (const question of research.questionsPeopleAsk.slice(0, 4)) {
      trending.push({ _key: key('tr'), title: question, href: categoryHref });
    }
  }

  return [
    {
      _key: key('sb'),
      _type: 'sidebarImageCta',
      heading: draft.sidebar?.imageCta?.heading || 'Need help applying this?',
      body: draft.sidebar?.imageCta?.body || 'Book a quick strategy call and get a custom action plan.',
      buttonLabel: draft.sidebar?.imageCta?.buttonLabel || 'Book a Call',
      buttonHref: draft.sidebar?.imageCta?.buttonHref || brandCtaHref,
    },
    {
      _key: key('sb'),
      _type: 'sidebarPromo',
      eyebrow: draft.sidebar?.promo?.eyebrow || 'Start Here',
      heading: draft.sidebar?.promo?.heading || 'Want a faster path?',
      body: draft.sidebar?.promo?.body || 'Use this spot for your highest-converting CTA.',
      buttonLabel: draft.sidebar?.promo?.buttonLabel || 'Get the Guide',
      buttonHref: draft.sidebar?.promo?.buttonHref || brandCtaHref,
      theme: draft.sidebar?.promo?.theme || 'light',
    },
    { _key: key('sb'), _type: 'sidebarTrending', title: draft.sidebar?.trendingTitle || 'Trending Topics', items: trending },
    {
      _key: key('sb'),
      _type: 'sidebarNewsletter',
      title: draft.sidebar?.newsletter?.title || 'Stay in the Loop',
      body: draft.sidebar?.newsletter?.body || 'Get practical insights each week.',
      buttonLabel: draft.sidebar?.newsletter?.buttonLabel || 'Subscribe',
    },
    { _key: key('sb'), _type: 'sidebarCategories', title: 'Browse by Category' },
    { _key: key('sb'), _type: 'sidebarRecentPosts', title: 'Recent Posts', limit: 5 },
    { _key: key('sb'), _type: 'sidebarToc', title: 'On This Page' },
  ];
}

function getWriteClient(): SanityClient {
  const token = process.env.SANITY_API_TOKEN;
  if (!token) throw new Error('Missing SANITY_API_TOKEN.');
  return createClient({ ...sanityConfig, token, useCdn: false });
}

export function validateAiSecret(expectedSecret: string | undefined, providedSecret: string | null): boolean {
  if (!expectedSecret || !providedSecret) return false;
  const expected = Buffer.from(expectedSecret);
  const provided = Buffer.from(providedSecret);
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(expected, provided);
}

async function getAuthorId(client: SanityClient, authorSlug: string): Promise<string> {
  const bySlug = await client.fetch<{ _id?: string } | null>(
    `*[_type == "author" && slug.current == $slug][0]{_id}`,
    { slug: authorSlug }
  );
  if (bySlug?._id) return bySlug._id;
  const fallback = await client.fetch<{ _id?: string } | null>(`*[_type == "author"][0]{_id}`);
  if (!fallback?._id) throw new Error('No author exists in Sanity.');
  return fallback._id;
}

async function getInternalLinks(client: SanityClient, brand: BrandKey) {
  const rows = await client.fetch<Array<{ title?: string; slug?: string }>>(
    `*[_type == "post" && brand == $brand && published == true] | order(date desc)[0...15]{title, "slug": slug.current}`,
    { brand }
  );
  return rows
    .map((row) => ({ title: sanitizeNoEmDash(asString(row.title)), slug: slugify(asString(row.slug)) }))
    .filter((row) => row.title && row.slug);
}

async function resolveDraftIdBySlug(client: SanityClient, brand: BrandKey, slug: string): Promise<string | null> {
  const row = await client.fetch<{ _id?: string } | null>(
    `*[_type == "post" && _id in path("drafts.**") && brand == $brand && slug.current == $slug][0]{_id}`,
    { brand, slug }
  );
  return row?._id || null;
}

async function saveDraftToSanity(
  client: SanityClient,
  draft: DraftPayload,
  brand: BrandKey,
  authorId: string,
  sidebarModules: unknown[],
  sidebarTitle: string,
  automationMeta: {
    targetKeyword: string;
    quality: QualityReport;
    rankingEstimate: RankingEstimate;
  }
): Promise<string> {
  const existingDraft = await resolveDraftIdBySlug(client, brand, draft.slug || '');
  const existingPublished = await client.fetch<{ _id?: string } | null>(
    `*[_type == "post" && !(_id in path("drafts.**")) && brand == $brand && slug.current == $slug][0]{_id}`,
    { brand, slug: draft.slug }
  );
  const draftId =
    existingDraft ||
    (existingPublished?._id ? `drafts.${existingPublished._id}` : `drafts.post-${draft.slug}-${Date.now()}`);

  const now = new Date().toISOString();
  await client.createOrReplace({
    _id: draftId,
    _type: 'post',
    title: draft.title,
    slug: { _type: 'slug', current: draft.slug },
    excerpt: draft.excerpt,
    body: toPortableText(draft),
    brand,
    author: { _type: 'reference', _ref: authorId },
    category: draft.category,
    tags: draft.tags,
    date: now,
    lastModified: now,
    published: false,
    seoTitle: draft.seoTitle,
    metaDescription: draft.metaDescription,
    faq: draft.faq.map((item) => ({ _key: key('faq'), question: item.question, answer: item.answer })),
    sidebarTitle,
    sidebarModules,
    automationMeta: {
      generatedAt: now,
      targetKeyword: automationMeta.targetKeyword,
      quality: automationMeta.quality,
      rankingEstimate: automationMeta.rankingEstimate,
    },
  });

  return draftId;
}

function normalizeBrandKey(value: string): BrandKey {
  if (value === 'impact-loop' || value === 'rovonn-russell' || value === 'dream-streams' || value === 'il-foundation') {
    return value;
  }
  return 'impact-loop';
}

function qualityFromMeta(meta: JsonRecord | undefined): QualityReport | null {
  if (!meta) return null;
  const qualityRaw = meta.quality;
  if (!qualityRaw || typeof qualityRaw !== 'object') return null;
  const q = qualityRaw as JsonRecord;
  const seoScore = Number(q.seoScore);
  const toneScore = Number(q.toneScore);
  const issues = Array.isArray(q.issues) ? q.issues.map(asString).filter(Boolean) : [];
  if (!Number.isFinite(seoScore) || !Number.isFinite(toneScore)) return null;
  return { seoScore: clampScore(seoScore, 0), toneScore: clampScore(toneScore, 0), issues };
}

function rankingFromMeta(meta: JsonRecord | undefined): RankingEstimate | null {
  if (!meta) return null;
  const rankingRaw = meta.rankingEstimate;
  if (!rankingRaw || typeof rankingRaw !== 'object') return null;
  const r = rankingRaw as JsonRecord;
  const score = Number(r.score);
  const tier = asString(r.tier);
  const confidence = asString(r.confidence);
  const expectedWindow = asString(r.expectedWindow);
  if (!Number.isFinite(score) || !expectedWindow) return null;
  if (!(tier === 'low' || tier === 'medium' || tier === 'high')) return null;
  if (!(confidence === 'low' || confidence === 'medium' || confidence === 'high')) return null;
  return {
    score: clampScore(score, 0),
    tier,
    confidence,
    expectedWindow,
    factors: Array.isArray(r.factors) ? r.factors.map(asString).filter(Boolean) : [],
    risks: Array.isArray(r.risks) ? r.risks.map(asString).filter(Boolean) : [],
    recommendations: Array.isArray(r.recommendations) ? r.recommendations.map(asString).filter(Boolean) : [],
  };
}

function draftFromDocument(doc: JsonRecord): DraftPayload {
  const body = Array.isArray(doc.body) ? doc.body : [];
  const sections: DraftSection[] = [];

  for (const item of body) {
    if (!item || typeof item !== 'object') continue;
    const row = item as JsonRecord;
    if (asString(row._type) !== 'block') continue;

    const style = asString(row.style) || 'normal';
    const listItem = asString(row.listItem);
    const children = Array.isArray(row.children) ? row.children : [];
    const text = children
      .map((child) => (child && typeof child === 'object' ? asString((child as JsonRecord).text) : ''))
      .join('')
      .trim();
    if (!text) continue;

    if (listItem === 'bullet' || listItem === 'number') {
      sections.push({
        type: listItem === 'bullet' ? 'bulletList' : 'numberList',
        items: [sanitizeNoEmDash(text)],
      });
      continue;
    }

    if (style === 'h2' || style === 'h3' || style === 'h4' || style === 'blockquote') {
      sections.push({ type: style === 'blockquote' ? 'quote' : style, text: sanitizeNoEmDash(text) });
    } else {
      sections.push({ type: 'paragraph', text: sanitizeNoEmDash(text) });
    }
  }

  return {
    title: sanitizeNoEmDash(asString(doc.title)),
    slug: slugify(asString((doc.slug as JsonRecord | undefined)?.current || asString(doc.slug))),
    category: sanitizeNoEmDash(asString(doc.category)),
    tags: asStringArray(doc.tags).map(sanitizeNoEmDash),
    excerpt: sanitizeNoEmDash(asString(doc.excerpt)),
    seoTitle: sanitizeNoEmDash(asString(doc.seoTitle)),
    metaDescription: sanitizeNoEmDash(asString(doc.metaDescription)),
    faq: (Array.isArray(doc.faq) ? doc.faq : [])
      .map((item) => (item && typeof item === 'object' ? (item as JsonRecord) : null))
      .filter((item): item is JsonRecord => item !== null)
      .map((item) => ({ question: sanitizeNoEmDash(asString(item.question)), answer: sanitizeNoEmDash(asString(item.answer)) }))
      .filter((item) => item.question && item.answer),
    sections,
  };
}

export async function publishPostFromDraft({
  client,
  draftId,
  minSeoScore,
  minToneScore,
  enforceQualityGate = true,
}: {
  client: SanityClient;
  draftId: string;
  minSeoScore?: number;
  minToneScore?: number;
  enforceQualityGate?: boolean;
}): Promise<PublishAutoBlogResult> {
  const resolvedDraftId = draftId.startsWith('drafts.') ? draftId : `drafts.${draftId}`;
  const draftDoc = await client.getDocument(resolvedDraftId);
  if (!draftDoc) throw new Error(`Draft not found: ${resolvedDraftId}`);

  const doc = draftDoc as JsonRecord;
  const brandKey = normalizeBrandKey(asString(doc.brand));
  const draft = draftFromDocument(doc);
  const keywordFromMeta = asString((doc.automationMeta as JsonRecord | undefined)?.targetKeyword) || draft.slug.replace(/-/g, ' ');

  const meta = doc.automationMeta && typeof doc.automationMeta === 'object' ? (doc.automationMeta as JsonRecord) : undefined;
  const quality = qualityFromMeta(meta) || evaluateQuality(draft, keywordFromMeta, 900);
  const analysis = analyzeDraft(draft);
  const rankingEstimate =
    rankingFromMeta(meta) ||
    buildRankingEstimate({
      quality,
      sourceCount: 0,
      wordCount: analysis.wordCount,
      headingCount: analysis.headingCount,
      listCount: analysis.listCount,
    });

  const thresholds = resolveQualityThresholds(minSeoScore, minToneScore);
  const qualityGate = buildQualityGate(quality, thresholds);
  const links = buildLinks({ brandKey, slug: draft.slug || slugify(draft.title), docId: resolvedDraftId });

  const authorRef = doc.author && typeof doc.author === 'object' ? (doc.author as JsonRecord)._ref : '';
  const authorRow =
    typeof authorRef === 'string' && authorRef
      ? await client.fetch<{ slug?: string } | null>(`*[_type == "author" && _id == $id][0]{"slug": slug.current}`, {
          id: authorRef,
        })
      : null;

  if (enforceQualityGate && !qualityGate.passed) {
    return {
      published: false,
      draftId: resolvedDraftId,
      slug: draft.slug,
      category: draft.category,
      authorSlug: asString(authorRow?.slug) || 'rovonn-russell',
      quality,
      qualityGate,
      rankingEstimate,
      links,
      publishBlockedByQualityGate: true,
    };
  }

  const publishedId = resolvedDraftId.replace(/^drafts\./, '');
  const publishedDoc: JsonRecord = { ...doc, _id: publishedId, published: true, lastModified: new Date().toISOString() };
  delete publishedDoc._rev;
  await client.transaction().createOrReplace(publishedDoc as any).delete(resolvedDraftId).commit();

  return {
    published: true,
    draftId: resolvedDraftId,
    publishedId,
    slug: draft.slug,
    category: draft.category,
    authorSlug: asString(authorRow?.slug) || 'rovonn-russell',
    quality,
    qualityGate,
    rankingEstimate,
    links: buildLinks({ brandKey, slug: draft.slug, docId: publishedId }),
  };
}

export async function publishAutoBlog(input: PublishAutoBlogRequest): Promise<PublishAutoBlogResult> {
  const client = getWriteClient();
  let draftId = asString(input.draftId);
  if (!draftId) {
    const slug = asString(input.slug);
    if (!slug || !input.brand) throw new Error('Publish requires draftId, or slug + brand.');
    const found = await resolveDraftIdBySlug(client, input.brand, slugify(slug));
    if (!found) throw new Error(`No draft found for slug "${slug}" in "${input.brand}".`);
    draftId = found;
  }
  return publishPostFromDraft({
    client,
    draftId,
    minSeoScore: input.minSeoScore,
    minToneScore: input.minToneScore,
    enforceQualityGate: input.enforceQualityGate ?? true,
  });
}

export async function generateAutoBlog(input: GenerateAutoBlogRequest): Promise<GenerateAutoBlogResult> {
  if (!input.topic?.trim()) throw new Error('Missing topic.');
  const provider = getAiProvider();
  const apiKey = getAiApiKey(provider);
  const researchModel = resolveModel(provider, 'research');
  const writerModel = resolveModel(provider, 'writer');
  const auditModel = resolveModel(provider, 'audit');

  const brand = getBrand(input.brand);
  const client = getWriteClient();
  const keyword = sanitizeNoEmDash(input.targetKeyword || input.topic);
  const requestedCategory = sanitizeNoEmDash(input.category || 'Insights');
  const thresholds = resolveQualityThresholds(input.minSeoScore, input.minToneScore);
  const internalLinks = await getInternalLinks(client, input.brand);

  const research = normalizeResearch(
    await callAiJson<Partial<ResearchBrief>>({
      provider,
      apiKey,
      model: researchModel,
      systemPrompt:
        'You are a senior SEO researcher. Return strict JSON only: {primaryKeyword,semanticKeywords,questionsPeopleAsk,stats:[{claim,source,url,publishedDate}],suggestedCategory}. No markdown.',
      userPrompt: [
        `Brand: ${brand.name}`,
        `Topic: ${input.topic}`,
        `Keyword: ${keyword}`,
        `Suggested category: ${requestedCategory}`,
        input.notes ? `Notes: ${input.notes}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
      useWebSearch: process.env.OPENAI_ENABLE_WEB_SEARCH !== 'false',
    }),
    keyword,
    requestedCategory
  );

  const firstDraft = normalizeDraft(
    await callAiJson<Partial<DraftPayload>>({
      provider,
      apiKey,
      model: writerModel,
      systemPrompt: [
        'You are a senior human editorial writer and SEO operator.',
        'Return strict JSON only in this shape:',
        '{title,slug,category,tags,excerpt,seoTitle,metaDescription,faq:[{question,answer}],sections:[{type,text}|{type,items}],cta,sidebar}.',
        'Hard rules: no em dashes and no generic AI phrases.',
      ].join('\n'),
      userPrompt: [
        `Brand: ${brand.name}`,
        `Tone: ${input.tone || brand.tagline}`,
        `Topic: ${input.topic}`,
        `Keyword: ${keyword}`,
        `Target category: ${input.category || research.suggestedCategory}`,
        `Target words: ${Math.max(900, Math.min(2600, input.targetWordCount ?? 1300))}`,
        `Primary CTA URL: ${brand.cta.primary.href}`,
        `Secondary CTA URL: ${brand.cta.secondary.href}`,
        `Internal links: ${internalLinks.map((row) => `/blog/${row.slug}`).join(', ') || 'none'}`,
        `Research: ${JSON.stringify(research)}`,
        input.notes ? `Extra notes: ${input.notes}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    }),
    input.topic,
    input.category || research.suggestedCategory
  );

  const firstQuality = evaluateQuality(firstDraft, keyword, Math.max(900, Math.min(2600, input.targetWordCount ?? 1300)));
  const auditedDraft = normalizeDraft(
    await callAiJson<Partial<DraftPayload>>({
      provider,
      apiKey,
      model: auditModel,
      systemPrompt:
        'You are an SEO and editorial QA lead. Fix issues and return the same JSON shape. Keep no em dashes and no AI-sounding phrasing.',
      userPrompt: `Draft JSON:\n${JSON.stringify(firstDraft)}\nIssues:\n${firstQuality.issues.join('\n') || 'none'}`,
    }),
    firstDraft.title,
    firstDraft.category
  );

  const finalDraft = {
    ...auditedDraft,
    title: sanitizeNoEmDash(auditedDraft.title),
    slug: slugify(auditedDraft.slug || auditedDraft.title),
    category: sanitizeNoEmDash(auditedDraft.category),
    excerpt: sanitizeNoEmDash(auditedDraft.excerpt),
    seoTitle: sanitizeNoEmDash(auditedDraft.seoTitle),
    metaDescription: sanitizeNoEmDash(auditedDraft.metaDescription),
  };
  const finalQuality = evaluateQuality(finalDraft, keyword, Math.max(900, Math.min(2600, input.targetWordCount ?? 1300)));
  const finalAnalysis = analyzeDraft(finalDraft);
  const rankingEstimate = buildRankingEstimate({
    quality: finalQuality,
    sourceCount: research.stats.length,
    wordCount: finalAnalysis.wordCount,
    headingCount: finalAnalysis.headingCount,
    listCount: finalAnalysis.listCount,
  });
  const qualityGate = buildQualityGate(finalQuality, thresholds);

  if (input.dryRun) {
    return {
      title: finalDraft.title,
      slug: finalDraft.slug || slugify(finalDraft.title),
      category: finalDraft.category,
      published: false,
      quality: finalQuality,
      qualityGate,
      rankingEstimate,
      links: buildLinks({ brandKey: input.brand, slug: finalDraft.slug || slugify(finalDraft.title) }),
      research: {
        primaryKeyword: research.primaryKeyword,
        semanticKeywords: research.semanticKeywords,
        sourceCount: research.stats.length,
        sources: research.stats.map((row) => ({ source: row.source, url: row.url, publishedDate: row.publishedDate })),
      },
    };
  }

  const authorId = await getAuthorId(client, input.authorSlug || brand.defaultAuthor);
  const sidebarModules = makeSidebarModules(
    finalDraft,
    finalDraft.category,
    internalLinks,
    brand.cta.primary.href,
    research
  );
  const draftId = await saveDraftToSanity(
    client,
    finalDraft,
    input.brand,
    authorId,
    sidebarModules,
    finalDraft.sidebar?.title || 'Resources',
    {
      targetKeyword: keyword,
      quality: finalQuality,
      rankingEstimate,
    }
  );

  let publishedId: string | undefined;
  let published = false;
  let publishBlockedByQualityGate = false;
  let links: AutoBlogLinks = buildLinks({
    brandKey: input.brand,
    slug: finalDraft.slug || slugify(finalDraft.title),
    docId: draftId,
  });
  if (input.publish) {
    if (!qualityGate.passed) {
      publishBlockedByQualityGate = true;
    } else {
      const result = await publishPostFromDraft({
        client,
        draftId,
        minSeoScore: qualityGate.minSeoScore,
        minToneScore: qualityGate.minToneScore,
        enforceQualityGate: true,
      });
      publishedId = result.publishedId;
      published = result.published;
      publishBlockedByQualityGate = Boolean(result.publishBlockedByQualityGate);
      links = result.links;
    }
  }

  return {
    title: finalDraft.title,
    slug: finalDraft.slug || slugify(finalDraft.title),
    category: finalDraft.category,
    draftId,
    publishedId,
    published,
    quality: finalQuality,
    qualityGate,
    rankingEstimate,
    links,
    publishBlockedByQualityGate: publishBlockedByQualityGate || undefined,
    research: {
      primaryKeyword: research.primaryKeyword,
      semanticKeywords: research.semanticKeywords,
      sourceCount: research.stats.length,
      sources: research.stats.map((row) => ({ source: row.source, url: row.url, publishedDate: row.publishedDate })),
    },
  };
}
