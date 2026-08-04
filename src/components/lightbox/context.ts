import { createContext, useContext } from 'react';
import type { TripImage } from '@/types';

/** Anything the lightbox can display. Bare URLs are accepted so single-image
 *  fields (day hero, stay photo) do not have to build a TripImage first. */
export type LightboxSource = TripImage | string;

export type OpenLightbox = (images: readonly LightboxSource[], index?: number) => void;

/** Default is a no-op so components render fine outside the provider (tests, previews). */
export const LightboxContext = createContext<OpenLightbox>(() => undefined);

export const useLightbox = (): OpenLightbox => useContext(LightboxContext);

export function toTripImage(source: LightboxSource): TripImage {
  if (typeof source === 'string') return { url: source, caption: '', credit: '' };
  return source;
}
