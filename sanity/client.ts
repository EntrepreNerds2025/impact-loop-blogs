import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

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

export function urlFor(source: unknown) {
  return builder.image(source as any);
}
