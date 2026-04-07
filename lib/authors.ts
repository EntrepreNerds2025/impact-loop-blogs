export interface Author {
  slug: string;
  name: string;
  title: string;
  bio: string;
  image: string;
  links: { label: string; href: string }[];
}

export const AUTHORS: Record<string, Author> = {
  'rovonn-russell': {
    slug: 'rovonn-russell',
    name: 'Rovonn Russell',
    title: 'Impact Story Architect, Founder of Impact Loop',
    bio: 'Rovonn Russell helps mission-driven organizations turn their work into stories the world can see, trust, and act on. Founder of Impact Loop, a Toronto-based storytelling and systems company.',
    image: '/authors/rovonn-russell.jpg',
    links: [
      { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rovonnrussell' },
      { label: 'Impact Loop', href: 'https://impactloop.ca' },
      { label: 'Personal Site', href: 'https://rovonnrussell.com' },
    ],
  },
};

export function getAuthor(slug: string): Author {
  return AUTHORS[slug] ?? AUTHORS['rovonn-russell'];
}
