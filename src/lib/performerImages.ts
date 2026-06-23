import type { ImageMetadata } from 'astro';

const imageFiles = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/performers/*.{jpg,jpeg,png,webp,avif,JPG,JPEG,PNG,WEBP,AVIF}',
  { eager: true }
);

const byName = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(imageFiles)) {
  const base = path.split('/').pop()!.replace(/\.[^.]+$/, '').toLowerCase();
  byName.set(base, mod.default);
}

// kangna-khan.md -> [kangna-khan1, kangna-khan2, ...], up to 4, any that exist.
export function getPerformerImages(id: string): ImageMetadata[] {
  const out: ImageMetadata[] = [];
  for (let i = 1; i <= 4; i++) {
    const img = byName.get(`${id}${i}`.toLowerCase());
    if (img) out.push(img);
  }
  return out;
}

// "kangna-khan" -> "Kangna Khan"
export function nameFromId(id: string): string {
  return id
    .replace(/[-_]+/g, ' ')
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}