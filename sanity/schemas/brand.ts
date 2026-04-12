// Brand enum — used as a filter field on posts, categories, etc.
// Matches the BrandKey type in config/brand.types.ts

export const brandList = [
  { title: 'Impact Loop', value: 'impact-loop' },
  { title: 'Rovonn Russell', value: 'rovonn-russell' },
  { title: 'Dream Streams', value: 'dream-streams' },
  { title: 'IL Foundation', value: 'il-foundation' },
] as const;

export type SanityBrandKey = (typeof brandList)[number]['value'];
