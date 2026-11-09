import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const pages = defineCollection({
  loader: glob({
    base: './topics',
    pattern: '**/*.md',
    generateId: ({ entry }) => entry.replace(/\.md$/, ''),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number().default(0),
    demo: z
      .string()
      .regex(/^[a-z0-9-]+$/)
      .optional(),
  }),
});

export const collections = { pages };
