import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from '../sanity/schemas';

// Custom desk structure with brand-filtered views
const deskStructure = (S: any) =>
  S.list()
    .title('Content')
    .items([
      // ─── All Posts (unfiltered) ────────────────────────────
      S.listItem()
        .title('All Posts')
        .child(
          S.documentTypeList('post')
            .title('All Posts')
            .defaultOrdering([{ field: 'date', direction: 'desc' }])
        ),

      S.divider(),

      // ─── Brand-Filtered Views ──────────────────────────────
      S.listItem()
        .title('Impact Loop')
        .child(
          S.documentList()
            .title('Impact Loop Posts')
            .filter('_type == "post" && brand == "impact-loop"')
            .defaultOrdering([{ field: 'date', direction: 'desc' }])
        ),

      S.listItem()
        .title('Rovonn Russell')
        .child(
          S.documentList()
            .title('Rovonn Russell Posts')
            .filter('_type == "post" && brand == "rovonn-russell"')
            .defaultOrdering([{ field: 'date', direction: 'desc' }])
        ),

      S.listItem()
        .title('Dream Streams')
        .child(
          S.documentList()
            .title('Dream Streams Posts')
            .filter('_type == "post" && brand == "dream-streams"')
            .defaultOrdering([{ field: 'date', direction: 'desc' }])
        ),

      S.listItem()
        .title('IL Foundation')
        .child(
          S.documentList()
            .title('IL Foundation Posts')
            .filter('_type == "post" && brand == "il-foundation"')
            .defaultOrdering([{ field: 'date', direction: 'desc' }])
        ),

      S.divider(),

      // ─── Other Document Types ──────────────────────────────
      S.listItem()
        .title('Authors')
        .child(S.documentTypeList('author').title('Authors')),

      S.listItem()
        .title('Categories')
        .child(S.documentTypeList('category').title('Categories')),
    ]);

export default defineConfig({
  name: 'impact-loop-blogs',
  title: 'Impact Loop Blogs',
  projectId: 'ngkvlovw',
  dataset: 'production',

  plugins: [
    structureTool({ structure: deskStructure }),
    visionTool(), // GROQ query playground
  ],

  schema: {
    types: schemaTypes,
  },
});
