import { defineCollection, z } from 'astro:content';

const pagesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    order: z.number().optional(),
    ogImage: z.string().optional(),
    noindex: z.boolean().optional().default(false),
  }),
});

export const collections = {
  pages: pagesCollection,
};
