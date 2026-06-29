import type { CollectionEntry } from 'astro:content';

const STOP = new Set(['this','that','with','from','your','have','will','they','them',
  'what','when','very','just','into','also','more','than','then','here','there','about']);

export function getDescription(entry: CollectionEntry<'performers'>): string {
  // Old files: frontmatter description. New files: the pasted body.
  return (entry.data.description ?? entry.body ?? '').trim();
}

export function getTags(entry: CollectionEntry<'performers'>): string[] {
  if (entry.data.tags?.length) return entry.data.tags; // old files: untouched
  return autoTags(getDescription(entry));              // new files: from the text
}

export function autoTags(text: string, max = 6): string[] {
  const freq = new Map<string, number>();
  for (const w of (text.toLowerCase().match(/[a-z\u00c0-\u024f]+/gi) ?? [])) {
    if (w.length < 4 || STOP.has(w)) continue;
    freq.set(w, (freq.get(w) ?? 0) + 1);
  }
  return [...freq.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, max).map(([w]) => w);
}