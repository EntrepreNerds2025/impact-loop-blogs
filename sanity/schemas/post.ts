import { defineType, defineField, defineArrayMember } from 'sanity';
import { brandList } from './brand';

export default defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'seo', title: 'SEO' },
    { name: 'settings', title: 'Settings' },
  ],
  fields: [
    // ─── Content Group ─────────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'content',
      validation: (rule) => rule.required().max(100),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'content',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      group: 'content',
      rows: 3,
      description: 'Short summary for post cards and social sharing (max 160 chars)',
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'portableText',
      group: 'content',
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      group: 'content',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          description: 'Describe the image for accessibility and SEO',
          validation: (rule) => rule.required(),
        }),
      ],
    }),

    // ─── Settings Group ────────────────────────────────────────
    defineField({
      name: 'brand',
      title: 'Brand',
      type: 'string',
      group: 'settings',
      options: {
        list: [...brandList],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
      description: 'Which blog this post belongs to',
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      group: 'settings',
      to: [{ type: 'author' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      group: 'settings',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      group: 'settings',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'date',
      title: 'Publish Date',
      type: 'datetime',
      group: 'settings',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'lastModified',
      title: 'Last Modified',
      type: 'datetime',
      group: 'settings',
    }),
    defineField({
      name: 'published',
      title: 'Published',
      type: 'boolean',
      group: 'settings',
      initialValue: false,
      description: 'Toggle to make this post live on the blog',
    }),
    defineField({
      name: 'readingTime',
      title: 'Reading Time',
      type: 'string',
      group: 'settings',
      description: 'Auto-calculated, e.g. "5 min read". Override if needed.',
    }),
    defineField({
      name: 'sidebarTitle',
      title: 'Sidebar Title',
      type: 'string',
      group: 'settings',
      description: 'Optional label for the post sidebar area.',
    }),
    defineField({
      name: 'sidebarModules',
      title: 'Sidebar Widgets',
      type: 'array',
      group: 'settings',
      description: 'Drag to reorder. These widgets render in the sticky right sidebar.',
      initialValue: [
        {
          _type: 'sidebarPromo',
          eyebrow: 'Start Here',
          heading: 'Want a faster path?',
          body: 'Use this area for your best lead magnet, free guide, or booking CTA.',
          buttonLabel: 'Learn More',
          theme: 'light',
        },
        {
          _type: 'sidebarToc',
          title: 'On This Page',
        },
        {
          _type: 'sidebarRecentPosts',
          title: 'Recent Posts',
          limit: 5,
        },
        {
          _type: 'sidebarCategories',
          title: 'Browse by Category',
        },
      ],
      of: [
        defineArrayMember({
          name: 'sidebarImageCta',
          title: 'Image + CTA Card',
          type: 'object',
          fields: [
            defineField({
              name: 'image',
              title: 'Image',
              type: 'image',
              options: { hotspot: true },
              fields: [
                defineField({
                  name: 'alt',
                  title: 'Alt Text',
                  type: 'string',
                }),
              ],
            }),
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'buttonLabel',
              title: 'Button Label',
              type: 'string',
            }),
            defineField({
              name: 'buttonHref',
              title: 'Button URL',
              type: 'url',
              validation: (rule) =>
                rule.uri({ allowRelative: true, scheme: ['http', 'https'] }),
            }),
          ],
          preview: {
            select: { title: 'heading' },
            prepare({ title }) {
              return { title: title || 'Image + CTA Card' };
            },
          },
        }),
        defineArrayMember({
          name: 'sidebarPromo',
          title: 'Promo Card',
          type: 'object',
          fields: [
            defineField({
              name: 'eyebrow',
              title: 'Eyebrow',
              type: 'string',
            }),
            defineField({
              name: 'heading',
              title: 'Heading',
              type: 'string',
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'buttonLabel',
              title: 'Button Label',
              type: 'string',
            }),
            defineField({
              name: 'buttonHref',
              title: 'Button URL',
              type: 'url',
              validation: (rule) =>
                rule.uri({ allowRelative: true, scheme: ['http', 'https'] }),
            }),
            defineField({
              name: 'theme',
              title: 'Theme',
              type: 'string',
              options: {
                list: [
                  { title: 'Light', value: 'light' },
                  { title: 'Dark', value: 'dark' },
                ],
                layout: 'radio',
              },
              initialValue: 'light',
            }),
          ],
          preview: {
            select: { title: 'heading', subtitle: 'eyebrow' },
            prepare({ title, subtitle }) {
              return { title: title || 'Promo Card', subtitle };
            },
          },
        }),
        defineArrayMember({
          name: 'sidebarTrending',
          title: 'Trending Links',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              initialValue: 'Trending Topics',
            }),
            defineField({
              name: 'items',
              title: 'Items',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'title',
                      title: 'Link Label',
                      type: 'string',
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: 'href',
                      title: 'URL',
                      type: 'url',
                      validation: (rule) =>
                        rule.required().uri({
                          allowRelative: true,
                          scheme: ['http', 'https'],
                        }),
                    }),
                  ],
                  preview: {
                    select: { title: 'title', subtitle: 'href' },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) {
              return { title: title || 'Trending Links' };
            },
          },
        }),
        defineArrayMember({
          name: 'sidebarNewsletter',
          title: 'Newsletter Form',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              initialValue: 'Stay in the Loop',
            }),
            defineField({
              name: 'body',
              title: 'Body',
              type: 'text',
              rows: 2,
            }),
            defineField({
              name: 'buttonLabel',
              title: 'Button Label',
              type: 'string',
              initialValue: 'Send It to Me',
            }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) {
              return { title: title || 'Newsletter Form' };
            },
          },
        }),
        defineArrayMember({
          name: 'sidebarCategories',
          title: 'Categories List',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              initialValue: 'Browse by Category',
            }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) {
              return { title: title || 'Categories List' };
            },
          },
        }),
        defineArrayMember({
          name: 'sidebarRecentPosts',
          title: 'Recent Posts List',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              initialValue: 'Recent Posts',
            }),
            defineField({
              name: 'limit',
              title: 'Number of Posts',
              type: 'number',
              initialValue: 5,
              validation: (rule) => rule.min(1).max(10),
            }),
          ],
          preview: {
            select: { title: 'title', limit: 'limit' },
            prepare({ title, limit }) {
              return {
                title: title || 'Recent Posts',
                subtitle: `${limit ?? 5} items`,
              };
            },
          },
        }),
        defineArrayMember({
          name: 'sidebarToc',
          title: 'Table of Contents',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              initialValue: 'On This Page',
            }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) {
              return { title: title || 'Table of Contents' };
            },
          },
        }),
      ],
    }),

    // ─── Pillar/Cluster Settings ───────────────────────────────
    defineField({
      name: 'pillarPage',
      title: 'Is Pillar Page?',
      type: 'boolean',
      group: 'settings',
      initialValue: false,
      description: 'Mark as a top-level pillar/category page',
    }),
    defineField({
      name: 'pillarSlug',
      title: 'Parent Pillar Slug',
      type: 'string',
      group: 'settings',
      description: 'If this is a cluster post, link it to its pillar page slug',
      hidden: ({ document }) => document?.pillarPage === true,
    }),

    // ─── SEO Group ─────────────────────────────────────────────
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      group: 'seo',
      description: 'Override the default title tag (max 60 chars)',
      validation: (rule) => rule.max(70),
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      group: 'seo',
      rows: 2,
      description: 'For search engine snippets (max 160 chars)',
      validation: (rule) => rule.required().max(160),
    }),
    defineField({
      name: 'faq',
      title: 'FAQ (Schema.org)',
      type: 'array',
      group: 'seo',
      description: 'Question/Answer pairs rendered as FAQPage JSON-LD',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Answer',
              type: 'text',
              rows: 3,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'question' },
          },
        }),
      ],
    }),
  ],

  // ─── Preview ───────────────────────────────────────────────────
  preview: {
    select: {
      title: 'title',
      brand: 'brand',
      date: 'date',
      published: 'published',
      media: 'featuredImage',
    },
    prepare({ title, brand, date, published, media }) {
      const brandLabel = brandList.find((b) => b.value === brand)?.title ?? brand;
      const status = published ? '✅' : '📝';
      const formattedDate = date
        ? new Date(date).toLocaleDateString('en-CA', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : 'No date';
      return {
        title: `${status} ${title}`,
        subtitle: `${brandLabel} · ${formattedDate}`,
        media,
      };
    },
  },

  // ─── Orderings ─────────────────────────────────────────────────
  orderings: [
    {
      title: 'Publish Date (Newest)',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
    {
      title: 'Publish Date (Oldest)',
      name: 'dateAsc',
      by: [{ field: 'date', direction: 'asc' }],
    },
    {
      title: 'Brand',
      name: 'brandAsc',
      by: [{ field: 'brand', direction: 'asc' }],
    },
  ],
});
