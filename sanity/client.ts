import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

export const sanityConfig = {
  projectId: 'ngkvlovw',
  dataset: 'production',
  apiVersion: '2026-04-12',
  useCdn: process.env.NODE_ENV === 'production',
};

export const sanityClient = createClient({
  ...sanityConfig,
  // Use preview token for draft content in Studio preview mode
  token: process.env.SANITY_API_TOKEN,
});

// Public client (no token) for published content
export const publicClient = createClient({
  ...sanityConfig,
  useCdn: true,
});

// Image URL builder
const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
