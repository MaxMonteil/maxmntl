import { glob } from 'astro/loaders'
import { defineCollection } from 'astro:content'
import { z } from 'astro/zod'

export const collections = {
  blog: defineCollection({
    loader: glob({ base: './src/blog', pattern: '**/[^_]*.md' }),
    schema: z.object({
      title: z.string(),
      pubDate: z.date(),
      description: z.string(),
    }),
  }),
}
