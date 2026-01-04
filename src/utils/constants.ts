// Site Metadata
export const SITE = {
  name: 'Siquijor.xyz',
  title: 'Siquijor Travel Guide',
  description: 'Your complete Siquijor travel guide. Discover beaches, waterfalls, adventure activities, and authentic local experiences on the Island of Fire, Philippines.',
  url: 'https://siquijor.xyz',
  author: 'Siquijor.xyz Editorial Team',
  locale: 'en_US',
  twitter: '@siquijorxyz',
  ogImage: '/images/og-default.jpg',
} as const;

// Navigation Links
export const NAV_LINKS = [
  { label: 'Travel Guide', href: '/travel-guide' },
  { label: 'Experiences', href: '/experiences' },
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
    seoTitle: 'Cliff Jumping, Diving & Waterfalls',
    seoDescription: 'Discover adventure activities in Siquijor including cliff jumping at Salagdoong, cave spelunking, night diving, waterfall adventures, and hiking trails. Complete guides with tips and safety information.',
    color: 'amber',
    icon: 'mountain',
  },
  photography: {
    name: 'Photography',
    slug: 'photography',
    description: 'Capture stunning moments and locations',
    seoTitle: 'Best Photo Spots & Location Guide',
    seoDescription: 'Find the best photography spots in Siquijor. Sunrise and sunset locations, waterfall photography tips, Instagram-worthy spots, and underwater photography guides for the Island of Fire.',
    color: 'reef',
    icon: 'camera',
  },
  seasonal: {
    name: 'Seasonal',
    slug: 'seasonal',
    description: 'Time-based guides and events',
    seoTitle: 'Weather, Festivals & Best Time to Visit',
    seoDescription: 'Plan your Siquijor trip with our seasonal guides. Learn about the best time to visit, weather patterns, local festivals, Holy Week events, and full moon experiences on the island.',
    color: 'jungle',
    icon: 'calendar',
  },
  'local-life': {
    name: 'Local Life',
    slug: 'local-life',
    description: 'Authentic cultural experiences',
    seoTitle: 'Culture, Healers & Local Traditions',
    seoDescription: 'Experience authentic Siquijor culture. Meet traditional healers (mananambal), explore historic churches, discover local cuisine, visit artisan workshops, and connect with island life.',
    color: 'amber',
    icon: 'users',
  },
  planning: {
    name: 'Planning',
    slug: 'planning',
    description: 'Practical travel information',
    seoTitle: 'Itineraries, Budget & Travel Tips',
    seoDescription: 'Plan your perfect Siquijor trip with our practical guides. Sample itineraries, where to stay, how to get around, safety tips, and budget planning for the Island of Fire.',
    color: 'reef',
    icon: 'map',
  },
  niche: {
    name: 'Special Interest',
    slug: 'niche',
    description: 'Tailored experiences for specific travelers',
    seoTitle: 'Solo, Couples & Digital Nomad Guides',
    seoDescription: 'Specialized Siquijor guides for solo travelers, couples on honeymoon, digital nomads, and wellness seekers. Find tailored recommendations for your travel style.',
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
