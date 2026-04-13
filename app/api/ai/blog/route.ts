import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';
import type { BrandKey } from '@/types/post';
import {
  generateAutoBlog,
  publishAutoBlog,
  validateAiSecret,
  type GenerateAutoBlogRequest,
} from '@/lib/aiAutoblog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_BRANDS: BrandKey[] = ['impact-loop', 'rovonn-russell', 'dream-streams', 'il-foundation'];

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asBool(value: unknown): boolean | undefined {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return undefined;
}

function asNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return undefined;
}

function isBrand(value: string): value is BrandKey {
  return VALID_BRANDS.includes(value as BrandKey);
}

function getProvidedSecret(req: NextRequest): string | null {
  const fromHeader = req.headers.get('x-ai-secret');
  if (fromHeader) return fromHeader;
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7).trim();
  return null;
}

function revalidateGeneratedRoutes(slug: string, category: string, authorSlug?: string) {
  revalidatePath('/');
  revalidatePath(`/blog/${slug}`);
  revalidatePath(`/blog/category/${encodeURIComponent(category)}`);
  revalidatePath(`/blog/author/${authorSlug || 'rovonn-russell'}`);
  revalidatePath('/feed.xml');
  revalidatePath('/sitemap.xml');
  revalidatePath('/llms.txt');
}

export async function POST(req: NextRequest) {
  try {
    const expectedSecret = process.env.AI_AUTOBLOG_SECRET;
    const providedSecret = getProvidedSecret(req);
    if (!validateAiSecret(expectedSecret, providedSecret)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const action = asString(body.action || 'generate') || 'generate';

    if (action === 'publish') {
      const draftId = asString(body.draftId) || undefined;
      const slug = asString(body.slug) || undefined;
      const brandRaw = asString(body.brand);
      const brand = brandRaw && isBrand(brandRaw) ? brandRaw : undefined;
      const minSeoScore = asNumber(body.minSeoScore);
      const minToneScore = asNumber(body.minToneScore);
      const enforceQualityGate = asBool(body.enforceQualityGate);

      const publish = await publishAutoBlog({
        draftId,
        slug,
        brand,
        minSeoScore,
        minToneScore,
        enforceQualityGate,
      });
      if (publish.published) {
        revalidateGeneratedRoutes(publish.slug, publish.category, publish.authorSlug);
      }

      return NextResponse.json({
        ok: true,
        action: 'publish',
        ...publish,
      });
    }

    const brandRaw = asString(body.brand);
    if (!isBrand(brandRaw)) {
      return NextResponse.json(
        { ok: false, error: `Missing or invalid brand. Use one of: ${VALID_BRANDS.join(', ')}` },
        { status: 400 }
      );
    }

    const topic = asString(body.topic);
    if (!topic) {
      return NextResponse.json({ ok: false, error: 'Missing topic.' }, { status: 400 });
    }

    const generateInput: GenerateAutoBlogRequest = {
      brand: brandRaw,
      topic,
      targetKeyword: asString(body.targetKeyword) || undefined,
      category: asString(body.category) || undefined,
      notes: asString(body.notes) || undefined,
      tone: asString(body.tone) || undefined,
      authorSlug: asString(body.authorSlug) || undefined,
      publish: asBool(body.publish),
      dryRun: asBool(body.dryRun),
      targetWordCount: asNumber(body.targetWordCount),
      minSeoScore: asNumber(body.minSeoScore),
      minToneScore: asNumber(body.minToneScore),
    };

    const result = await generateAutoBlog(generateInput);
    if (!generateInput.dryRun) {
      revalidateGeneratedRoutes(result.slug, result.category, generateInput.authorSlug);
    }

    return NextResponse.json({
      ok: true,
      action: 'generate',
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
