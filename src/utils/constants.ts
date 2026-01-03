// Site Metadata
export const SITE = {
  name: 'Siquijor.xyz',
  title: 'Siquijor Island Guide',
  description: 'Experience-focused travel guide for Siquijor Island, Philippines. Adventure travel, photography spots, and authentic local encounters.',
  url: 'https://siquijor.xyz',
  author: 'Siquijor.xyz Editorial Team',
  locale: 'en_US',
  twitter: '@siquijorxyz',
  ogImage: '/images/og-default.jpg',
} as const;

// Navigation Links
export const NAV_LINKS = [
  { label: 'Experiences', href: '/experiences' },
  { label: 'Photography', href: '/category/photography' },
  { label: 'Adventure', href: '/category/adventure' },
  { label: 'Planning', href: '/category/planning' },
  { label: 'Articles', href: '/articles' },
] as const;

// Footer Navigation
export const FOOTER_LINKS = {
  experiences: [
    { label: 'Cliff Jumping', href: '/articles/adventure/cliff-jumping-salagdoong' },
    { label: 'Night Diving', href: '/articles/adventure/night-diving-siquijor' },
    { label: 'Waterfall Photography', href: '/articles/photography/cambugahay-falls-photography' },
    { label: 'Island Loop', href: '/articles/adventure/motorcycle-routes-island-loop' },
  ],
  planning: [
    { label: 'Best Time to Visit', href: '/articles/seasonal/best-time-to-visit' },
    { label: 'Safety Guide', href: '/articles/planning/safety-guide' },
    { label: 'Solo Travel', href: '/articles/planning/solo-travel-guide' },
    { label: 'Getting There', href: '/getting-there' },
  ],
  about: [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
  social: [
    { label: 'Instagram', href: 'https://instagram.com/siquijorxyz', icon: 'instagram' },
    { label: 'Facebook', href: 'https://facebook.com/siquijorxyz', icon: 'facebook' },
    { label: 'TikTok', href: 'https://tiktok.com/@siquijorxyz', icon: 'tiktok' },
  ],
} as const;

// Article Categories
export const CATEGORIES = {
  adventure: {
    name: 'Adventure',
    slug: 'adventure',
    description: 'Thrilling experiences for adrenaline seekers',
    color: 'amber',
    icon: 'mountain',
  },
  photography: {
    name: 'Photography',
    slug: 'photography',
    description: 'Capture stunning moments and locations',
    color: 'reef',
    icon: 'camera',
  },
  seasonal: {
    name: 'Seasonal',
    slug: 'seasonal',
    description: 'Time-based guides and events',
    color: 'jungle',
    icon: 'calendar',
  },
  'local-life': {
    name: 'Local Life',
    slug: 'local-life',
    description: 'Authentic cultural experiences',
    color: 'amber',
    icon: 'users',
  },
  planning: {
    name: 'Planning',
    slug: 'planning',
    description: 'Practical travel information',
    color: 'reef',
    icon: 'map',
  },
  niche: {
    name: 'Special Interest',
    slug: 'niche',
    description: 'Tailored experiences for specific travelers',
    color: 'jungle',
    icon: 'heart',
  },
} as const;

// Difficulty Levels
export const DIFFICULTY_LEVELS = {
  easy: {
    label: 'Easy',
    description: 'Suitable for all fitness levels',
    color: 'green',
  },
  moderate: {
    label: 'Moderate',
    description: 'Requires basic fitness',
    color: 'amber',
  },
  challenging: {
    label: 'Challenging',
    description: 'Requires good fitness and experience',
    color: 'orange',
  },
  expert: {
    label: 'Expert',
    description: 'For experienced adventurers only',
    color: 'red',
  },
} as const;

// Municipalities
export const MUNICIPALITIES = {
  siquijor: { name: 'Siquijor', lat: 9.2167, lng: 123.5167 },
  'san-juan': { name: 'San Juan', lat: 9.1667, lng: 123.5000 },
  lazi: { name: 'Lazi', lat: 9.1333, lng: 123.5833 },
  maria: { name: 'Maria', lat: 9.1833, lng: 123.6333 },
  'enrique-villanueva': { name: 'Enrique Villanueva', lat: 9.2333, lng: 123.6000 },
  larena: { name: 'Larena', lat: 9.2500, lng: 123.5833 },
} as const;

// Schema Types
export const SCHEMA_TYPES = [
  'Article',
  'HowTo',
  'FAQPage',
  'TouristAttraction',
  'Place',
  'Review',
] as const;

export type Category = keyof typeof CATEGORIES;
export type Difficulty = keyof typeof DIFFICULTY_LEVELS;
export type Municipality = keyof typeof MUNICIPALITIES;
export type SchemaType = typeof SCHEMA_TYPES[number];
