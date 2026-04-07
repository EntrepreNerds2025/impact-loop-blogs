import type { BrandKey } from '@/types/post';
import type { BrandConfig } from './brand.types';
import { impactLoopBrand } from './brands/impact-loop';
import { rovonnRussellBrand } from './brands/rovonn-russell';
import { dreamStreamsBrand } from './brands/dream-streams';
import { ilFoundationBrand } from './brands/il-foundation';

const REGISTRY: Record<BrandKey, BrandConfig> = {
  'impact-loop': impactLoopBrand,
  'rovonn-russell': rovonnRussellBrand,
  'dream-streams': dreamStreamsBrand,
  'il-foundation': ilFoundationBrand,
};

/**
 * Resolve the active brand from the BRAND env var (or NEXT_PUBLIC_BRAND on the client).
 * Defaults to impact-loop if unset, so `npm run dev` always works.
 */
export function getActiveBrandKey(): BrandKey {
  const fromEnv =
    (process.env.BRAND as BrandKey | undefined) ||
    (process.env.NEXT_PUBLIC_BRAND as BrandKey | undefined);
  if (fromEnv && fromEnv in REGISTRY) return fromEnv;
  return 'impact-loop';
}

export function getBrand(key?: BrandKey): BrandConfig {
  return REGISTRY[key ?? getActiveBrandKey()];
}

export function getAllBrands(): BrandConfig[] {
  return Object.values(REGISTRY);
}

export const BRAND = getBrand();
