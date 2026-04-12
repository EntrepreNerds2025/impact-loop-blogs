import { defineType, defineField, defineArrayMember } from 'sanity';

/**
 * Portable Text schema — the rich text editor for post bodies.
 * Maps to the MDX components used in the existing blog:
 *   - CTABlock → ctaBlock custom block
 *   - ImageOptimized → image with alt/caption
 *   - Code blocks → code custom block
 *   - Headings, lists, links, bold, italic → standard block marks
 */
export default defineType({
  name: 'portableText',
  title: 'Rich Text',
  type: 'array',
  of: [
    // ─── Standard Block (paragraphs, headings, lists) ──────────
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'strong' },
          { title: 'Italic', value: 'em' },
          { title: 'Code', value: 'code' },
          { title: 'Strikethrough', value: 'strike-through' },
        ],
        annotations: [
          {
            name: 'link',
            type: 'object',
            title: 'Link',
            fields: [
              defineField({
                name: 'href',
                title: 'URL',
                type: 'url',
                validation: (rule) =>
                  rule.uri({
                    allowRelative: true,
                    scheme: ['http', 'https', 'mailto', 'tel'],
                  }),
              }),
              defineField({
                name: 'openInNewTab',
                title: 'Open in new tab?',
                type: 'boolean',
                initialValue: false,
              }),
            ],
          },
        ],
      },
    }),

    // ─── Image Block ───────────────────────────────────────────
    defineArrayMember({
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt Text',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'caption',
          title: 'Caption',
          type: 'string',
        }),
      ],
    }),

    // ─── CTA Block ─────────────────────────────────────────────
    // Replaces the <CTABlock /> MDX component
    defineArrayMember({
      name: 'ctaBlock',
      title: 'Call to Action',
      type: 'object',
      fields: [
        defineField({
          name: 'heading',
          title: 'Heading',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'text',
          title: 'Body Text',
          type: 'text',
          rows: 2,
        }),
        defineField({
          name: 'buttonLabel',
          title: 'Button Label',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'buttonHref',
          title: 'Button URL',
          type: 'url',
          validation: (rule) =>
            rule.uri({ allowRelative: true, scheme: ['http', 'https'] }),
        }),
        defineField({
          name: 'variant',
          title: 'Style Variant',
          type: 'string',
          options: {
            list: [
              { title: 'Primary', value: 'primary' },
              { title: 'Secondary', value: 'secondary' },
              { title: 'Subtle', value: 'subtle' },
            ],
          },
          initialValue: 'primary',
        }),
        defineField({
          name: 'utmCampaign',
          title: 'UTM Campaign',
          type: 'string',
          description: 'Optional override for utm_campaign parameter',
        }),
      ],
      preview: {
        select: { title: 'heading', subtitle: 'buttonLabel' },
        prepare({ title, subtitle }) {
          return { title: `CTA: ${title}`, subtitle };
        },
      },
    }),

    // ─── Code Block ────────────────────────────────────────────
    defineArrayMember({
      name: 'codeBlock',
      title: 'Code Block',
      type: 'object',
      fields: [
        defineField({
          name: 'code',
          title: 'Code',
          type: 'text',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'language',
          title: 'Language',
          type: 'string',
          options: {
            list: [
              { title: 'JavaScript', value: 'javascript' },
              { title: 'TypeScript', value: 'typescript' },
              { title: 'Python', value: 'python' },
              { title: 'HTML', value: 'html' },
              { title: 'CSS', value: 'css' },
              { title: 'Bash', value: 'bash' },
              { title: 'JSON', value: 'json' },
              { title: 'YAML', value: 'yaml' },
              { title: 'Markdown', value: 'markdown' },
            ],
          },
        }),
        defineField({
          name: 'filename',
          title: 'Filename',
          type: 'string',
          description: 'Optional filename shown above the code block',
        }),
      ],
      preview: {
        select: { language: 'language', filename: 'filename' },
        prepare({ language, filename }) {
          return {
            title: filename || 'Code Block',
            subtitle: language || 'plain text',
          };
        },
      },
    }),

    // ─── Embed Block ───────────────────────────────────────────
    defineArrayMember({
      name: 'embedBlock',
      title: 'Embed (YouTube / Video)',
      type: 'object',
      fields: [
        defineField({
          name: 'url',
          title: 'URL',
          type: 'url',
          description: 'YouTube, Vimeo, or other embeddable URL',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'caption',
          title: 'Caption',
          type: 'string',
        }),
      ],
      preview: {
        select: { title: 'url', subtitle: 'caption' },
        prepare({ title, subtitle }) {
          return { title: `Embed: ${title}`, subtitle };
        },
      },
    }),
  ],
});
