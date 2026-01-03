import type {
  Article,
  TouristAttraction,
  HowTo,
  FAQPage,
  BreadcrumbList,
  Organization,
  WebSite,
  WithContext
} from 'schema-dts';
import { SITE } from './constants';

/**
 * Generate Organization schema
 */
export function generateOrganizationSchema(): WithContext<Organization> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/images/logo.png`,
    description: SITE.description,
    sameAs: [
      'https://instagram.com/siquijorxyz',
      'https://facebook.com/siquijorxyz',
      'https://tiktok.com/@siquijorxyz',
    ],
  };
}

/**
 * Generate WebSite schema with search action
 */
export function generateWebSiteSchema(): WithContext<WebSite> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE.url}/search?q={search_term_string}`,
      },
      // @ts-ignore - schema-dts doesn't have query-input
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Article schema
 */
export function generateArticleSchema(data: {
  title: string;
  description: string;
  url: string;
  image: string;
  publishDate: Date;
  modifiedDate?: Date;
  author: string;
  category?: string;
}): WithContext<Article> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    url: data.url,
    image: data.image,
    datePublished: data.publishDate.toISOString(),
    dateModified: (data.modifiedDate ?? data.publishDate).toISOString(),
    author: {
      '@type': 'Person',
      name: data.author,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.url,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE.url}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': data.url,
    },
    ...(data.category && { articleSection: data.category }),
  };
}

/**
 * Generate TouristAttraction schema
 */
export function generateTouristAttractionSchema(data: {
  name: string;
  description: string;
  url: string;
  image: string;
  address: string;
  municipality: string;
  coordinates?: { lat: number; lng: number };
  openingHours?: string;
  priceRange?: string;
}): WithContext<TouristAttraction> {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: data.name,
    description: data.description,
    url: data.url,
    image: data.image,
    address: {
      '@type': 'PostalAddress',
      addressLocality: data.municipality,
      addressRegion: 'Siquijor',
      addressCountry: 'PH',
    },
    ...(data.coordinates && {
      geo: {
        '@type': 'GeoCoordinates',
        latitude: data.coordinates.lat,
        longitude: data.coordinates.lng,
      },
    }),
    ...(data.openingHours && {
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '06:00',
        closes: '18:00',
      },
    }),
    ...(data.priceRange && { priceRange: data.priceRange }),
    isAccessibleForFree: false,
    publicAccess: true,
  };
}

/**
 * Generate HowTo schema
 */
export function generateHowToSchema(data: {
  name: string;
  description: string;
  url: string;
  image: string;
  totalTime?: string;
  estimatedCost?: { min: number; max: number; currency: string };
  steps: { name: string; text: string; image?: string }[];
  tools?: string[];
  supplies?: string[];
}): WithContext<HowTo> {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: data.name,
    description: data.description,
    url: data.url,
    image: data.image,
    ...(data.totalTime && { totalTime: data.totalTime }),
    ...(data.estimatedCost && {
      estimatedCost: {
        '@type': 'MonetaryAmount',
        currency: data.estimatedCost.currency,
        value: `${data.estimatedCost.min}-${data.estimatedCost.max}`,
      },
    }),
    ...(data.tools && {
      tool: data.tools.map((tool) => ({
        '@type': 'HowToTool' as const,
        name: tool,
      })),
    }),
    ...(data.supplies && {
      supply: data.supplies.map((supply) => ({
        '@type': 'HowToSupply' as const,
        name: supply,
      })),
    }),
    step: data.steps.map((step, index) => ({
      '@type': 'HowToStep' as const,
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
    })),
  };
}

/**
 * Generate FAQPage schema
 */
export function generateFAQSchema(data: {
  url: string;
  faqs: { question: string; answer: string }[];
}): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: data.faqs.map((faq) => ({
      '@type': 'Question' as const,
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(data: {
  items: { name: string; url: string }[];
}): WithContext<BreadcrumbList> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: data.items.map((item, index) => ({
      '@type': 'ListItem' as const,
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Serialize schema to JSON-LD script tag content
 */
export function serializeSchema(schema: object): string {
  return JSON.stringify(schema, null, 2);
}
