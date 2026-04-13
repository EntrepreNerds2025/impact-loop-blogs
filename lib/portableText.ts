import type { PortableTextBlock, PortableTextNode } from '@/types/post';

export interface PortableHeading {
  level: 'h2' | 'h3' | 'h4';
  text: string;
  id: string;
}

export function slugifyHeading(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function portableBlockText(block: PortableTextBlock): string {
  return (block.children ?? []).map((child) => child.text ?? '').join('').trim();
}

export function extractPortableTextHeadings(nodes: PortableTextNode[] | undefined): PortableHeading[] {
  if (!nodes || nodes.length === 0) return [];

  const headings: PortableHeading[] = [];
  for (const node of nodes) {
    if (node._type !== 'block') continue;
    if (node.style !== 'h2' && node.style !== 'h3' && node.style !== 'h4') continue;

    const text = portableBlockText(node);
    if (!text) continue;
    headings.push({
      level: node.style,
      text,
      id: slugifyHeading(text),
    });
  }

  return headings;
}

export function portableTextToPlainText(nodes: PortableTextNode[] | undefined): string {
  if (!nodes || nodes.length === 0) return '';
  const parts: string[] = [];

  for (const node of nodes) {
    if (node._type === 'block') {
      const text = portableBlockText(node);
      if (text) parts.push(text);
      continue;
    }

    if (node._type === 'ctaBlock') {
      if (node.heading) parts.push(node.heading);
      if (node.text) parts.push(node.text);
      continue;
    }

    if (node._type === 'codeBlock' && node.code) {
      parts.push(node.code);
      continue;
    }

    if (node._type === 'embedBlock' && node.caption) {
      parts.push(node.caption);
      continue;
    }
  }

  return parts.join('\n\n');
}

