'use client';

import type { DraftImage } from '@/types/itinerary';

interface BlockImagesProps {
  readonly images: readonly DraftImage[];
  readonly alt: string;
}

/** Mirrors src/components/ImageStrip.tsx: 1-2 photos fill the width, 3+ scroll horizontally. */
export default function BlockImages({ images, alt }: BlockImagesProps) {
  if (images.length === 0) return null;

  const fills = images.length <= 2;
  const wrapper = fills ? 'mt-3 flex gap-2' : 'phone-scroll mt-3 flex gap-2 overflow-x-auto';
  const cell = fills ? 'h-[170px] min-w-0 flex-1 rounded-md object-cover' : 'h-[170px] w-[260px] shrink-0 rounded-md object-cover';

  return (
    <div className={wrapper}>
      {images.map((img) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={img.id} src={img.url} alt={img.caption || alt} className={cell} />
      ))}
    </div>
  );
}
