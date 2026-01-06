import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date for display
 */
export function formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return new Intl.DateTimeFormat('en-US', options ?? defaultOptions).format(date);
}

/**
 * Format date for schema.org
 */
export function formatDateISO(date: Date): string {
  return date.toISOString();
}

/**
 * Calculate reading time from content
 */
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Generate slug from string
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length).trim() + '...';
}

/**
 * Format price in PHP
 */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format price range
 */
export function formatPriceRange(min: number, max: number): string {
  if (min === 0 && max === 0) return 'Free';
  if (min === max) return formatPrice(min);
  return `${formatPrice(min)} - ${formatPrice(max)}`;
}

/**
 * Get Google Maps URL from coordinates
 */
export function getGoogleMapsUrl(lat: number, lng: number, label?: string): string {
  const query = label ? encodeURIComponent(label) : `${lat},${lng}`;
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

/**
 * Get embed URL for Google Maps
 */
export function getGoogleMapsEmbedUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sph!4v1`;
}

/**
 * Extract headings from markdown content for TOC
 */
export function extractHeadings(content: string): { level: number; text: string; slug: string }[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings: { level: number; text: string; slug: string }[] = [];

  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].trim(),
      slug: slugify(match[2]),
    });
  }

  return headings;
}

/**
 * Get difficulty color class
 */
export function getDifficultyColor(difficulty: string): string {
  const colors: Record<string, string> = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    challenging: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    expert: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  };
  return colors[difficulty] ?? colors.moderate;
}

/**
 * Get category color classes
 */
export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    adventure: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    photography: 'bg-reef-100 text-reef-800 dark:bg-reef-900/30 dark:text-reef-300',
    seasonal: 'bg-jungle-100 text-jungle-800 dark:bg-jungle-900/30 dark:text-jungle-300',
    'local-life': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    planning: 'bg-reef-100 text-reef-800 dark:bg-reef-900/30 dark:text-reef-300',
    niche: 'bg-jungle-100 text-jungle-800 dark:bg-jungle-900/30 dark:text-jungle-300',
  };
  return colors[category] ?? colors.adventure;
}

/**
 * Check if current season is dry or wet
 */
export function getCurrentSeason(): 'dry' | 'wet' {
  const month = new Date().getMonth() + 1; // 1-12
  // Dry season: November (11) to May (5)
  return month >= 11 || month <= 5 ? 'dry' : 'wet';
}

/**
 * Get season label with months
 */
export function getSeasonLabel(): string {
  const season = getCurrentSeason();
  return season === 'dry' ? 'Dry Season: Nov - May' : 'Wet Season: Jun - Oct';
}
