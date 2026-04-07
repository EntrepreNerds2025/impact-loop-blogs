import Image, { type ImageProps } from 'next/image';

export default function ImageOptimized(props: ImageProps & { caption?: string }) {
  const { caption, alt, ...rest } = props;
  return (
    <figure className="my-8">
      <Image
        {...rest}
        alt={alt}
        className={`rounded-lg w-full h-auto ${rest.className ?? ''}`}
      />
      {caption && (
        <figcaption className="mt-2 text-sm text-brand-text-muted text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
