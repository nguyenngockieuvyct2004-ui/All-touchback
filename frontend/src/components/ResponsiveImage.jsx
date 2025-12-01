import React, { useState, useEffect, useRef } from 'react';
import { previewUrl, makeSrcSet, defaultSizes, thumbUrl } from '../lib/images.js';

/*
  ResponsiveImage
  ----------------
  Goals:
  - Handle both portrait and landscape product artwork gracefully inside a fixed card slot.
  - Preserve aspect ratio of source while offering consistent outer aspect for grid (e.g. 16:9 on cards).
  - Avoid cropping important edges for extremely tall images (use object-contain + subtle letterbox background).
  - Provide a blurred / low‑quality preview while loading (LQIP) fallback.

  Props:
    src: original image URL (required)
    alt: alt text
  ratio: desired outer aspect ratio tailwind class (default 'aspect-video')
  autoRatio: if true, adjust wrapper ratio based on source AR buckets
    sizes: override sizes attr; defaults to defaultSizes('90vw')
    className: additional wrapper classes
    objectFit: 'cover' | 'contain' (auto picks 'cover' unless portrait image with aspect < 0.75)
  framed: draw subtle decorative border/vignette
  hoverZoom: apply tiny zoom on hover when covering

  Implementation notes:
    We read naturalWidth/Height after load to classify orientation. Portraits get contain fit with centered letterbox; landscapes cover.
*/

export default function ResponsiveImage({
  src,
  alt = '',
  ratio = 'aspect-video',
  autoRatio = true,
  sizes = defaultSizes('90vw'),
  className = '',
  objectFit,
  framed = true,
  hoverZoom = true,
}) {
  const [loaded, setLoaded] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [ar, setAr] = useState(null); // aspect ratio (w/h)
  const imgRef = useRef(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el || !el.complete) return;
    if (el.naturalWidth && el.naturalHeight) {
      const portrait = el.naturalHeight > el.naturalWidth;
      setIsPortrait(portrait);
      setAr(el.naturalWidth / el.naturalHeight);
    }
  }, [src]);

  function handleLoad(e) {
    const el = e.target;
    if (el.naturalWidth && el.naturalHeight) {
      const portrait = el.naturalHeight > el.naturalWidth;
      setIsPortrait(portrait);
      setAr(el.naturalWidth / el.naturalHeight);
    }
    setLoaded(true);
  }

  // Decide fit
  const fit = objectFit || (isPortrait ? 'contain' : 'cover');

  // Choose wrapper aspect class based on buckets when autoRatio is enabled
  function ratioClass() {
    if (!autoRatio || !ar) return ratio;
    if (ar < 0.75) return 'aspect-[2/3]';         // rất dọc
    if (ar < 1.0) return 'aspect-[3/4]';          // dọc
    if (ar < 1.35) return 'aspect-[4/3]';         // hơi ngang
    if (ar < 1.7) return 'aspect-[3/2]';          // ngang vừa
    return 'aspect-video';                         // 16:9 hoặc rộng hơn
  }

  return (
    <div className={`${ratioClass()} w-full overflow-hidden rounded-xl relative bg-neutral-100 dark:bg-neutral-900 shadow-soft ${className}`}>
      {/* Blurred low-res backdrop while loading */}
      <img
        src={thumbUrl(src)}
        alt=""
        aria-hidden
        className={`absolute inset-0 w-full h-full object-cover blur-xl scale-110 transition-opacity duration-300 ${loaded ? 'opacity-0' : 'opacity-60'}`}
      />
      {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
      <img
        ref={imgRef}
        src={previewUrl(src)}
        srcSet={makeSrcSet(src)}
        sizes={sizes}
        alt={alt}
        onLoad={handleLoad}
        className={`w-full h-full transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} object-${fit} ${fit==='cover' && hoverZoom ? 'transition-transform duration-300 ease-out group-hover:scale-[1.02] will-change-transform' : ''}`}
        loading="lazy"
      />
      {/* Letterbox background for contain to avoid raw empty space */}
      {fit === 'contain' && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_100%_at_50%_50%,rgba(0,0,0,0),rgba(0,0,0,0.15))] mix-blend-multiply" />
      )}
      {/* Decorative frame & vignette */}
      {framed && (
        <>
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-black/10 dark:ring-white/10" />
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] dark:shadow-[inset_0_0_0_1px_rgba(0,0,0,0.4)]" />
        </>
      )}
    </div>
  );
}
