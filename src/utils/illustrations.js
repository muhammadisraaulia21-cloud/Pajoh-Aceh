/**
 * Hand-crafted botanical, spice, and Aceh heritage SVG illustrations
 * used for interactive slide-in follow-through effects on the Home stage.
 */

const SVG_GLYPHS = {
  'star-anise': `
    <svg viewBox="0 0 64 64" fill="none" class="h-full w-full" aria-hidden="true">
      <circle cx="32" cy="32" r="24" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3" opacity="0.45"/>
      <g stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M32 10c3 7 3 12 0 18-3-6-3-11 0-18Z" fill="currentColor" fill-opacity="0.14"/>
        <path d="M51 21c-6 5-10 7-16 7 3-6 8-9 16-7Z" fill="currentColor" fill-opacity="0.14"/>
        <path d="M51 43c-8 2-13-1-16-7 6 0 10 2 16 7Z" fill="currentColor" fill-opacity="0.14"/>
        <path d="M32 54c-3-7-3-12 0-18 3 6 3 11 0 18Z" fill="currentColor" fill-opacity="0.14"/>
        <path d="M13 43c6-5 10-7 16-7-3 6-8 9-16 7Z" fill="currentColor" fill-opacity="0.14"/>
        <path d="M13 21c8-2 13 1 16 7-6 0-10-2-16-7Z" fill="currentColor" fill-opacity="0.14"/>
        <circle cx="32" cy="32" r="3.5" fill="#D4AF37" stroke="currentColor"/>
      </g>
    </svg>`,

  'vinegar-drop': `
    <svg viewBox="0 0 64 64" fill="none" class="h-full w-full" aria-hidden="true">
      <path d="M32 11C32 11 18 27 18 38a14 14 0 0 0 28 0C46 27 32 11 32 11Z" fill="currentColor" fill-opacity="0.13" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      <path d="M25 38a7 7 0 0 0 7 7" stroke="#D4AF37" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M14 22c3-4 6-6 9-7M50 22c-3-4-6-6-9-7" stroke="#D4AF37" stroke-width="1.2" stroke-linecap="round" opacity="0.7"/>
    </svg>`,

  'chili-pod': `
    <svg viewBox="0 0 64 64" fill="none" class="h-full w-full" aria-hidden="true">
      <path d="M41 13c2-3 5-4 8-3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
      <path d="M37 16c4 0 7 2 8 6-2 14-12 27-29 31-2 .5-4-1-3-3 7-7 13-17 16-28 1-4 4-6 8-6Z" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      <path d="M31 24c-2 8-5 14-10 19" stroke="#D4AF37" stroke-width="1.5" stroke-linecap="round"/>
      <circle cx="46" cy="41" r="2" fill="#D4AF37"/>
      <circle cx="51" cy="34" r="1.5" fill="currentColor" opacity="0.5"/>
    </svg>`,

  'pinto-aceh': `
    <svg viewBox="0 0 64 64" fill="none" class="h-full w-full" aria-hidden="true">
      <path d="M32 10L48 32 32 54 16 32 32 10Z" stroke="#D4AF37" stroke-width="1.5" fill="currentColor" fill-opacity="0.08"/>
      <path d="M32 18c5 5 8 10 8 14s-3 9-8 14c-5-5-8-10-8-14s3-9 8-14Z" stroke="currentColor" stroke-width="1.6"/>
      <path d="M18 32c5-5 10-8 14-8s9 3 14 8c-5 5-10 8-14 8s-9-3-14-8Z" stroke="currentColor" stroke-width="1.4" opacity="0.7"/>
      <circle cx="32" cy="32" r="3" fill="#D4AF37"/>
    </svg>`,

  'curry-leaf': `
    <svg viewBox="0 0 64 64" fill="none" class="h-full w-full" aria-hidden="true">
      <path d="M16 50C26 36 36 26 50 14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
      <path d="M24 39c-7-2-10-8-6-13 6 1 10 5 9 11" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M34 29c-7-2-10-8-6-13 6 1 10 5 9 11" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M30 34c2 7 8 10 13 6-1-6-5-10-11-9" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      <path d="M40 24c2 7 8 10 13 6-1-6-5-10-11-9" fill="currentColor" fill-opacity="0.15" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
    </svg>`,

  'pandan-ribbon': `
    <svg viewBox="0 0 64 64" fill="none" class="h-full w-full" aria-hidden="true">
      <path d="M12 46C22 30 32 16 52 14c-8 14-18 28-36 36" fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M18 44c12-10 21-19 29-26" stroke="#D4AF37" stroke-width="1.4" stroke-linecap="round"/>
      <path d="M28 49c10-6 18-13 24-22" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.65"/>
    </svg>`,

  'ocean-wave': `
    <svg viewBox="0 0 64 64" fill="none" class="h-full w-full" aria-hidden="true">
      <path d="M10 30c6-7 13-7 19 0s13 7 19 0 6-3 6-3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M10 40c6-7 13-7 19 0s13 7 19 0 6-3 6-3" stroke="#D4AF37" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M20 20c5-4 11-4 16 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.55"/>
    </svg>`,

  'asam-sunti': `
    <svg viewBox="0 0 64 64" fill="none" class="h-full w-full" aria-hidden="true">
      <path d="M32 12l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1 5-11Z" fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
      <circle cx="32" cy="33" r="4" fill="#D4AF37" opacity="0.85"/>
    </svg>`,

  lemongrass: `
    <svg viewBox="0 0 64 64" fill="none" class="h-full w-full" aria-hidden="true">
      <path d="M18 52c4-14 14-28 28-38" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M24 52c6-12 15-24 28-30" stroke="#D4AF37" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M15 44c3-10 9-20 18-28" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" opacity="0.65"/>
      <ellipse cx="22" cy="49" rx="5" ry="2.5" transform="rotate(-35 22 49)" fill="currentColor" fill-opacity="0.2" stroke="currentColor" stroke-width="1.4"/>
    </svg>`,

  'banana-leaf': `
    <svg viewBox="0 0 64 64" fill="none" class="h-full w-full" aria-hidden="true">
      <path d="M14 48C18 26 32 15 50 14c-3 18-14 31-36 34Z" fill="currentColor" fill-opacity="0.14" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
      <path d="M14 48L46 18" stroke="#D4AF37" stroke-width="1.5" stroke-linecap="round"/>
      <path d="M24 38l-2-8M31 31l-2-8M27 36l8 2M34 29l8 2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" opacity="0.65"/>
    </svg>`,
};

export function renderBotanicalGlyph(iconKey) {
  return SVG_GLYPHS[iconKey] || SVG_GLYPHS['pinto-aceh'];
}

/**
 * Curved aromatic trail & Aceh geometry SVG arc drawn behind the platter
 * so illustrations visibly trail the food platter slide-in.
 */
export function renderSlideTrailSvg(direction = 'next') {
  const flip = direction === 'prev' ? 'scale(-1, 1)' : 'scale(1, 1)';
  return `
  <svg class="hero-trail-svg pointer-events-none absolute -inset-8 h-[calc(100%+4rem)] w-[calc(100%+4rem)]" viewBox="0 0 420 420" fill="none" aria-hidden="true" style="transform:${flip}">
    <path class="trail-arc-a" d="M36 284 C 74 374, 214 410, 326 346 C 392 308, 408 214, 376 132" stroke="#D4AF37" stroke-width="1.5" stroke-dasharray="6 7" stroke-linecap="round" opacity="0.58"/>
    <path class="trail-arc-b" d="M56 122 C 118 32, 260 18, 344 92" stroke="#064E3B" stroke-width="1.1" stroke-dasharray="4 6" stroke-linecap="round" opacity="0.28"/>
    <circle cx="56" cy="122" r="3.5" fill="#D4AF37" opacity="0.7"/>
    <circle cx="376" cy="132" r="4" fill="#064E3B" opacity="0.35"/>
  </svg>`;
}
