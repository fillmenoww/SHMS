import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ─────────────────────────────────────────────────────────────
// THIS IS YOUR DATA MODEL. Each performer = one .md file in
// src/content/performers/. The fields below are validated at
// build time, so you can't accidentally publish a broken entry.
// ─────────────────────────────────────────────────────────────
const performers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/performers' }),
  schema: ({ image }) =>
    z.object({
      name: z.string().optional(), // optional — falls back to the filename
      city: z.string().optional(),
      role: z.string().optional(), // free text, type anything
      description: z.string().optional(),
      tags: z.array(z.string()).optional().default([]),
      phone: z.string().optional(), // shown only after the reveal button is clicked
      // SEO: comma-free list of search keywords for THIS performer's page.
      // Shown to search engines only — never visible on the page itself.
      keywords: z.array(z.string()).optional().default([]),
      // All socials optional — just delete the lines you don't need
      tiktok: z.string().url().optional(),
      facebook: z.string().url().optional(),
      instagram: z.string().url().optional(),
      x: z.string().url().optional(),
      // Set to true to pin someone to the top of the list
      featured: z.boolean().optional().default(false),
    }),
});

export const collections = { performers };