import type { Metadata } from 'next';
import type { Post } from '@/types/post';
import { getBrand } from '@/config/brand';

const ROVONN = {
  name: 'Rovonn Russell',
  url: 'https://rovonnrussell.com',
  jobTitle: 'Impact Story Architect',
  worksFor: 'Impact Loop',
  sameAs: ['https://www.linkedin.com/in/rovonnrussell'],
};

export function buildPostMetadata(post: Post): Metadata {
  const brand = getBrand(post.brand);
  const url = `https://${brand.domain}/blog/${post.frontmatter.slug}`;
  const title = post.frontmatter.seoTitle ?? post.frontmatter.title;
  const description = post.frontmatter.metaDescription ?? post.frontmatter.excerpt;
  const image = post.frontmatter.featuredImage
    ? post.frontmatter.featuredImage.startsWith('http')
      ? post.frontmatter.featuredImage
      : `https://${brand.domain}${post.frontmatter.featuredImage}`
    : undefined;
  return {
    title: `${title} | ${brand.name}`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: brand.name,
      type: 'article',
      locale: brand.locale,
      images: image ? [{ url: image }] : undefined,
      publishedTime: post.frontmatter.date,
      modifiedTime: post.frontmatter.lastModified ?? post.frontmatter.date,
      authors: [ROVONN.url],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export function articleJsonLd(post: Post) {
  const brand = getBrand(post.brand);
  const url = `https://${brand.domain}/blog/${post.frontmatter.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.frontmatter.title,
    description: post.frontmatter.metaDescription,
    image: post.frontmatter.featuredImage,
    datePublished: post.frontmatter.date,
    dateModified: post.frontmatter.lastModified ?? post.frontmatter.date,
    author: {
      '@type': 'Person',
      name: ROVONN.name,
      url: ROVONN.url,
      jobTitle: ROVONN.jobTitle,
      worksFor: { '@type': 'Organization', name: ROVONN.worksFor },
      sameAs: ROVONN.sameAs,
    },
    publisher: {
      '@type': 'Organization',
      name: brand.organization.name,
      url: brand.organization.url,
      logo: { '@type': 'ImageObject', url: `https://${brand.domain}${brand.organization.logo}` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
}

export function faqJsonLd(faq: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  };
}

export function organizationJsonLd(brandKey?: Post['brand']) {
  const brand = getBrand(brandKey);
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brand.organization.name,
    url: brand.organization.url,
    logo: `https://${brand.domain}${brand.organization.logo}`,
    sameAs: Object.values(brand.social).filter(Boolean),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
