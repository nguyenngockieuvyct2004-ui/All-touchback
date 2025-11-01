// Utilities to normalize URLs stored in DB so they work behind proxies/Ngrok
// Strategy: if a value contains "/uploads/", convert it to a relative path starting at that segment.

export function toUploadRelative(u) {
  if (!u || typeof u !== "string") return u;
  if (u.startsWith("/uploads/")) return u;
  const i = u.indexOf("/uploads/");
  return i >= 0 ? u.slice(i) : u;
}

export function mapMediaToRelative(media) {
  if (!Array.isArray(media)) return media;
  return media.map((m) => ({ ...m, url: toUploadRelative(m?.url) }));
}

export function toRelativeIfUpload(u) {
  return toUploadRelative(u);
}
