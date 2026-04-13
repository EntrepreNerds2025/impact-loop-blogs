import type { ReactNode } from 'react';
import Link from 'next/link';
import CTABlock from '@/components/CTABlock';
import ImageOptimized from '@/components/ImageOptimized';
import { portableBlockText, slugifyHeading } from '@/lib/portableText';
import type {
  PortableTextBlock,
  PortableTextMarkDef,
  PortableTextNode,
  PortableTextSpan,
} from '@/types/post';

function applyMarks(
  text: ReactNode,
  marks: string[] | undefined,
  markDefsByKey: Map<string, PortableTextMarkDef>,
  keyPrefix: string
): ReactNode {
  if (!marks || marks.length === 0) return text;

  let node: ReactNode = text;
  for (let i = 0; i < marks.length; i += 1) {
    const mark = marks[i];
    const markKey = `${keyPrefix}-${mark}-${i}`;
    if (mark === 'strong') {
      node = <strong key={markKey}>{node}</strong>;
      continue;
    }
    if (mark === 'em') {
      node = <em key={markKey}>{node}</em>;
      continue;
    }
    if (mark === 'code') {
      node = (
        <code
          key={markKey}
          className="rounded bg-brand-muted px-1.5 py-0.5 text-[0.9em]"
        >
          {node}
        </code>
      );
      continue;
    }

    const def = markDefsByKey.get(mark);
    if (def?._type === 'link' && def.href) {
      const isInternal = def.href.startsWith('/');
      if (!isInternal) {
        node = (
          <a
            key={markKey}
            href={def.href}
            target={def.openInNewTab ? '_blank' : undefined}
            rel={def.openInNewTab ? 'noopener noreferrer' : undefined}
          >
            {node}
          </a>
        );
      } else {
        node = (
          <Link key={markKey} href={def.href}>
            {node}
          </Link>
        );
      }
    }
  }

  return node;
}

function renderSpans(spans: PortableTextSpan[] | undefined, markDefs: PortableTextMarkDef[] | undefined) {
  if (!spans || spans.length === 0) return null;
  const markDefsByKey = new Map((markDefs ?? []).map((def) => [def._key, def]));

  return spans.map((span, idx) => {
    const base = <>{span.text}</>;
    const withMarks = applyMarks(base, span.marks, markDefsByKey, `${span._key || idx}`);
    return <span key={span._key || idx}>{withMarks}</span>;
  });
}

function renderBlock(node: PortableTextBlock) {
  const text = portableBlockText(node);
  const id = text ? slugifyHeading(text) : undefined;
  const children = renderSpans(node.children, node.markDefs);

  switch (node.style) {
    case 'h2':
      return (
        <h2 id={id} className="scroll-mt-28">
          {children}
        </h2>
      );
    case 'h3':
      return (
        <h3 id={id} className="scroll-mt-28">
          {children}
        </h3>
      );
    case 'h4':
      return (
        <h4 id={id} className="scroll-mt-28">
          {children}
        </h4>
      );
    case 'blockquote':
      return <blockquote>{children}</blockquote>;
    default:
      return <p>{children}</p>;
  }
}

function renderNode(node: PortableTextNode) {
  if (node._type === 'block') {
    return renderBlock(node);
  }

  if (node._type === 'image') {
    if (!node.url) return null;
    return (
      <ImageOptimized
        src={node.url}
        alt={node.alt ?? 'Post image'}
        width={1200}
        height={700}
        caption={node.caption}
      />
    );
  }

  if (node._type === 'ctaBlock') {
    return (
      <CTABlock
        heading={node.heading}
        body={node.text}
        variant={node.variant === 'secondary' ? 'secondary' : 'primary'}
        utmCampaign={node.utmCampaign}
      />
    );
  }

  if (node._type === 'codeBlock' && node.code) {
    return (
      <figure className="my-8 overflow-hidden rounded-xl border border-brand-border">
        {node.filename && (
          <figcaption className="border-b border-brand-border bg-brand-muted px-4 py-2 text-xs text-brand-text-muted">
            {node.filename}
          </figcaption>
        )}
        <pre className="overflow-x-auto bg-brand-surface p-4 text-sm leading-6">
          <code>{node.code}</code>
        </pre>
      </figure>
    );
  }

  if (node._type === 'embedBlock' && node.url) {
    return (
      <figure className="my-8">
        <div className="overflow-hidden rounded-xl border border-brand-border bg-brand-surface p-4">
          <a href={node.url} target="_blank" rel="noopener noreferrer" className="text-sm break-all">
            {node.url}
          </a>
        </div>
        {node.caption && (
          <figcaption className="mt-2 text-center text-sm italic text-brand-text-muted">
            {node.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  return null;
}

export default function SanityPortableText({ value }: { value: PortableTextNode[] | undefined }) {
  if (!value || value.length === 0) return null;

  const rendered: ReactNode[] = [];

  for (let i = 0; i < value.length; i += 1) {
    const node = value[i];

    if (node._type === 'block' && node.listItem) {
      const listType = node.listItem;
      const items: ReactNode[] = [];

      while (i < value.length) {
        const maybe = value[i];
        if (maybe._type !== 'block' || maybe.listItem !== listType) break;
        items.push(<li key={maybe._key}>{renderSpans(maybe.children, maybe.markDefs)}</li>);
        i += 1;
      }

      i -= 1;
      rendered.push(
        listType === 'number' ? (
          <ol key={`list-${node._key}`} className="list-decimal pl-6">
            {items}
          </ol>
        ) : (
          <ul key={`list-${node._key}`} className="list-disc pl-6">
            {items}
          </ul>
        )
      );
      continue;
    }

    rendered.push(
      <div key={node._key} className={node._type === 'block' ? 'contents' : ''}>
        {renderNode(node)}
      </div>
    );
  }

  return <>{rendered}</>;
}
