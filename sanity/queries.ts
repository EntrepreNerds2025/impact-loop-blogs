const groq = (strings: TemplateStringsArray, ...values: Array<string | number>) =>
  strings.reduce((acc, chunk, index) => acc + chunk + (values[index] ?? ''), '');

const authorProjection = `
  "author": author->{
    name,
    "slug": slug.current,
    title,
    bio,
    "image": image.asset->url,
    "links": links[]{
      "label": label,
      "href": url
    }
  }
`;

const sidebarProjection = `
  "sidebarModules": sidebarModules[]{
    ...,
    _type == "sidebarImageCta" => {
      ...,
      "imageUrl": image.asset->url,
      "imageAlt": image.alt
    }
  },
  sidebarTitle
`;

const bodyProjection = `
  "body": body[]{
    ...,
    _type == "image" => {
      ...,
      "url": asset->url
    }
  }
`;

const postCoreProjection = `
  _id,
  title,
  "slug": slug.current,
  date,
  lastModified,
  category,
  tags,
  excerpt,
  "featuredImage": featuredImage.asset->url,
  "featuredImageAlt": coalesce(featuredImage.alt, title),
  seoTitle,
  metaDescription,
  published,
  pillarPage,
  pillarSlug,
  readingTime,
  brand
`;

export const allPostsQuery = groq`
  *[_type == "post" && brand == $brand && published == true] | order(date desc) {
    ${postCoreProjection},
    ${authorProjection}
  }
`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug && brand == $brand][0] {
    ${postCoreProjection},
    ${authorProjection},
    faq,
    ${bodyProjection},
    ${sidebarProjection}
  }
`;

export const allSlugsQuery = groq`
  *[_type == "post" && brand == $brand && published == true] {
    "slug": slug.current
  }
`;

export const categoriesQuery = groq`
  array::unique(*[_type == "post" && brand == $brand && published == true].category)
`;

export const postsByCategoryQuery = groq`
  *[_type == "post" && brand == $brand && lower(category) == lower($category) && published == true] | order(date desc) {
    ${postCoreProjection},
    ${authorProjection}
  }
`;

export const relatedPostsQuery = groq`
  *[
    _type == "post" &&
    brand == $brand &&
    published == true &&
    slug.current != $currentSlug &&
    (category == $category || count((tags[])[@ in $tags]) > 0)
  ] | order(date desc) [0...$limit] {
    ${postCoreProjection},
    ${authorProjection}
  }
`;

export const postsByAuthorQuery = groq`
  *[
    _type == "post" &&
    brand == $brand &&
    published == true &&
    author->slug.current == $authorSlug
  ] | order(date desc) {
    ${postCoreProjection},
    ${authorProjection}
  }
`;

export const authorBySlugQuery = groq`
  *[_type == "author" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    title,
    bio,
    "image": image.asset->url,
    "links": links[]{
      "label": label,
      "href": url
    }
  }
`;

export const allAuthorsQuery = groq`
  *[_type == "author"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    title,
    bio,
    "image": image.asset->url
  }
`;
