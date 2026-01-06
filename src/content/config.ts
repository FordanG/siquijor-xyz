import { z, defineCollection } from 'astro:content';

// Category enum
const categoryEnum = z.enum([
  'adventure',
  'photography',
  'seasonal',
  'local-life',
  'planning',
  'niche',
]);

// Difficulty enum
const difficultyEnum = z.enum(['easy', 'moderate', 'challenging', 'expert']);

// Schema type enum
const schemaTypeEnum = z.enum([
  'Article',
  'HowTo',
  'FAQPage',
  'TouristAttraction',
  'Place',
  'Review',
]);

// Municipality enum
const municipalityEnum = z.enum([
  'siquijor',
  'san-juan',
  'lazi',
  'maria',
  'enrique-villanueva',
  'larena',
  'island-wide',
  'regional',
]);

// GPS coordinates schema
const coordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

// Location schema
const locationSchema = z.object({
  name: z.string(),
  municipality: municipalityEnum,
  coordinates: coordinatesSchema.optional(),
  googleMapsUrl: z.string().url().optional(),
});

// Image schema
const imageSchema = z.object({
  src: z.string(),
  alt: z.string(),
  caption: z.string().optional(),
  credit: z.string().optional(),
});

// FAQ schema
const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

// Price range schema
const priceRangeSchema = z.object({
  min: z.number(),
  max: z.number(),
  currency: z.string().default('PHP'),
});

// Author schema
const authorSchema = z.object({
  name: z.string(),
  avatar: z.string().optional(),
  bio: z.string().optional(),
});

// Articles collection
const articlesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // === SEO & Meta ===
    title: z.string().max(80),
    description: z.string().max(200),
    keywords: z.array(z.string()).min(3).max(15),

    // === Open Graph ===
    ogTitle: z.string().max(70).optional(),
    ogDescription: z.string().max(200).optional(),
    ogImage: z.string(),

    // === Schema.org ===
    schemaType: schemaTypeEnum.default('Article'),

    // === Classification ===
    category: categoryEnum,
    tags: z.array(z.string()).min(1).max(10),

    // === Dates ===
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),

    // === Author ===
    author: authorSchema.default({
      name: 'Siquijor.xyz Editorial Team',
    }),

    // === Images ===
    heroImage: imageSchema,
    gallery: z.array(imageSchema).optional(),

    // === Location ===
    location: locationSchema.optional(),

    // === Activity Metadata ===
    difficulty: difficultyEnum.optional(),
    duration: z.string().optional(),
    bestTime: z.string().optional(),
    priceRange: priceRangeSchema.optional(),

    // === Requirements ===
    requirements: z.array(z.string()).optional(),
    gearList: z.array(z.string()).optional(),

    // === FAQ ===
    faqs: z.array(faqSchema).optional(),

    // === Related Content ===
    relatedArticles: z.array(z.string()).optional(),

    // === Status ===
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  articles: articlesCollection,
};

// Export types for use in components
export type ArticleCategory = z.infer<typeof categoryEnum>;
export type Difficulty = z.infer<typeof difficultyEnum>;
export type SchemaType = z.infer<typeof schemaTypeEnum>;
export type Municipality = z.infer<typeof municipalityEnum>;
