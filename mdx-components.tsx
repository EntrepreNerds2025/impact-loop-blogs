import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import ImageOptimized from '@/components/ImageOptimized';
import CTABlock from '@/components/CTABlock';
import PricingCallout from '@/components/brands/dream-streams/PricingCallout';

export const mdxComponents: MDXComponents = {
  a: ({ href, children, ...rest }) => {
    const isInternal = href?.startsWith('/');
    if (isInternal) {
      return (
        <Link href={href!} {...(rest as any)}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  },
  img: (props: any) => <ImageOptimized {...props} width={1200} height={700} />,
  CTABlock,
  PricingCallout,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...mdxComponents, ...components };
}
