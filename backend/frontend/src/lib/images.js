// Utilities to derive lightweight thumbnail/preview/full image URLs and srcSet
// Works best with Unsplash URLs (adds/overrides w and q), but preserves other hosts.

function withQuery(src, params = {}) {
  try {
    const url = new URL(src);
    // Prefer keeping existing params, then override with provided ones
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      url.searchParams.set(k, String(v));
    });
    // Helpful defaults for Unsplash
    if (url.hostname.includes("images.unsplash.com")) {
      if (!url.searchParams.has("auto")) url.searchParams.set("auto", "format");
      if (!url.searchParams.has("fit")) url.searchParams.set("fit", "crop");
    }
    return url.toString();
  } catch {
    // If invalid URL (relative or malformed), just return as-is
    return src;
  }
}

export function thumbUrl(src) {
  // Small, low-quality for thumbnails
  return withQuery(src, { w: 240, q: 50 });
}

export function previewUrl(src) {
  // Medium size for cards and main image on detail at typical viewport widths
  return withQuery(src, { w: 800, q: 70 });
}

export function fullUrl(src) {
  // Larger size for zoomed/hi-dpi displays
  return withQuery(src, { w: 1600, q: 80 });
}

export function makeSrcSet(src, widths = [320, 640, 960, 1280], q = 70) {
  return widths.map((w) => `${withQuery(src, { w, q })} ${w}w`).join(", ");
}

export function defaultSizes(fallback = "100vw") {
  // Reasonable sizes rule for grid cards; override in components if needed
  return "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, " + fallback;
}
