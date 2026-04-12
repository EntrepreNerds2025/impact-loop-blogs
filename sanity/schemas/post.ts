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
