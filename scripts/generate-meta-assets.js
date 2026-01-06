#!/usr/bin/env node
/**
 * Generate Meta Assets (Favicon & OG Image) for Siquijor.xyz
 * Uses sharp.js for image processing
 *
 * Usage:
 *   npm install sharp
 *   node scripts/generate-meta-assets.js
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(BASE_DIR, 'public');
const IMAGES_DIR = path.join(PUBLIC_DIR, 'images');
const SCRAPED_DIR = path.join(IMAGES_DIR, 'scraped');

// Brand colors matching tailwind.config.mjs
const JUNGLE_700 = '#1A4D2E';  // Primary deep jungle green
const JUNGLE_600 = '#2d6d5a';
const AMBER_400 = '#F2A922';   // Accent golden amber
const CREAM = '#FDFCF8';       // Background cream
const VOLCANIC_900 = '#18181b'; // Dark mode background

/**
 * Create favicon from scratch using SVG
 */
async function createFavicon() {
  console.log('Creating favicons...');

  // Create SVG for favicon - jungle green with amber accent leaf icon
  const svgFavicon = `
    <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <!-- Background circle with jungle green -->
      <circle cx="256" cy="256" r="240" fill="${JUNGLE_700}"/>
      <!-- Inner circle slightly lighter -->
      <circle cx="256" cy="256" r="210" fill="${JUNGLE_600}"/>
      <!-- Stylized leaf/palm icon -->
      <g transform="translate(256, 256) scale(3.5)" fill="none" stroke="${CREAM}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M13 8c0-2.76-2.46-5-5.5-5S2 5.24 2 8h2l1-1 1 1h4"/>
        <path d="M13 7.14A5.82 5.82 0 0 1 16.5 6c3.04 0 5.5 2.24 5.5 5h-3l-1-1-1 1h-3"/>
        <path d="M5.89 9.71c-2.15 2.15-2.3 5.47-.35 7.43l4.24-4.25.7-.7.71-.71 2.12-2.12c-1.95-1.96-5.27-1.8-7.42.35"/>
        <path d="M11 15.5c.5 2.5-.17 4.5-1 6.5h4c2-5.5-.5-12-1-14"/>
      </g>
      <!-- Amber accent dot -->
      <circle cx="380" cy="140" r="35" fill="${AMBER_400}"/>
    </svg>
  `;

  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 },
  ];

  // Create base image from SVG
  const baseBuffer = Buffer.from(svgFavicon);

  for (const { name, size } of sizes) {
    await sharp(baseBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(PUBLIC_DIR, name));
    console.log(`  ✓ Created ${name}`);
  }

  // Create ICO file (just use the 32x32 PNG as favicon.ico)
  await sharp(baseBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'favicon.ico'));
  console.log('  ✓ Created favicon.ico');
}

/**
 * Find the best landscape image for OG from scraped images
 */
async function findBestOGImage() {
  // Skip these problematic images (promotional/ebook images, not scenic photos)
  const skipPatterns = [
    '77016f18a7c8',  // Ebook promotional image
    'aquamare',
    'bag-collection',
    'roch-cuisine',
  ];

  const searchDirs = ['paliton-beach', 'cambugahay-falls', 'siquijor-general'];
  const candidates = [];

  for (const dir of searchDirs) {
    const dirPath = path.join(SCRAPED_DIR, dir);
    if (!fs.existsSync(dirPath)) continue;

    const files = fs.readdirSync(dirPath).filter(f =>
      /\.(jpg|jpeg|png|webp)$/i.test(f)
    );

    for (const file of files) {
      // Skip promotional/non-scenic images
      if (skipPatterns.some(pattern => file.includes(pattern))) {
        continue;
      }

      const filePath = path.join(dirPath, file);
      try {
        const metadata = await sharp(filePath).metadata();
        const ratio = metadata.width / metadata.height;

        // Prefer landscape images close to 1200x630 ratio (1.9)
        if (ratio >= 1.5 && ratio <= 2.1 && metadata.width >= 800) {
          candidates.push({
            path: filePath,
            width: metadata.width,
            height: metadata.height,
            ratioDiff: Math.abs(ratio - 1.9),
          });
        }
      } catch (e) {
        // Skip files that can't be processed
      }
    }
  }

  if (candidates.length === 0) return null;

  // Sort by closest to ideal ratio
  candidates.sort((a, b) => a.ratioDiff - b.ratioDiff);
  return candidates[0].path;
}

/**
 * Create OpenGraph image with overlay branding
 */
async function createOGImage() {
  console.log('\nCreating OG image...');

  const OG_WIDTH = 1200;
  const OG_HEIGHT = 630;

  const baseImagePath = await findBestOGImage();

  let baseImage;

  if (baseImagePath) {
    console.log(`  Using base image: ${path.basename(baseImagePath)}`);

    // Load and resize base image to cover OG dimensions
    baseImage = await sharp(baseImagePath)
      .resize(OG_WIDTH, OG_HEIGHT, {
        fit: 'cover',
        position: 'center',
      })
      .toBuffer();
  } else {
    console.log('  No suitable image found, creating gradient background');

    // Create a jungle green gradient background
    baseImage = await sharp({
      create: {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        channels: 3,
        background: { r: 26, g: 77, b: 46 }, // jungle-700
      },
    })
      .jpeg()
      .toBuffer();
  }

  // Create gradient overlay SVG using brand colors (jungle green gradient like hero-gradient)
  const overlaySvg = `
    <svg width="${OG_WIDTH}" height="${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${JUNGLE_700};stop-opacity:0.15" />
          <stop offset="50%" style="stop-color:${JUNGLE_700};stop-opacity:0.6" />
          <stop offset="75%" style="stop-color:${JUNGLE_700};stop-opacity:0.85" />
          <stop offset="100%" style="stop-color:${JUNGLE_700};stop-opacity:0.95" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>
  `;

  // Create text overlay SVG with brand typography
  const textSvg = `
    <svg width="${OG_WIDTH}" height="${OG_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&amp;family=Inter:wght@400&amp;display=swap');
        </style>
      </defs>
      <!-- Amber accent bar -->
      <rect x="60" y="510" width="80" height="4" fill="${AMBER_400}" rx="2"/>
      <!-- Title with shadow -->
      <text x="62" y="562" font-family="Montserrat, Arial, sans-serif" font-size="56" font-weight="700" fill="rgba(0,0,0,0.3)">Siquijor.xyz</text>
      <text x="60" y="560" font-family="Montserrat, Arial, sans-serif" font-size="56" font-weight="700" fill="${CREAM}">Siquijor.xyz</text>
      <!-- Subtitle -->
      <text x="60" y="600" font-family="Inter, Arial, sans-serif" font-size="24" fill="rgba(253,252,248,0.85)">Your Guide to the Mystical Island of the Philippines</text>
    </svg>
  `;

  // Composite everything together
  const overlayBuffer = Buffer.from(overlaySvg);
  const textBuffer = Buffer.from(textSvg);

  await sharp(baseImage)
    .composite([
      { input: overlayBuffer, blend: 'over' },
      { input: textBuffer, blend: 'over' },
    ])
    .jpeg({ quality: 90 })
    .toFile(path.join(PUBLIC_DIR, 'og-image.jpg'));

  console.log('  ✓ Created og-image.jpg');

  // Also save to images directory
  await sharp(baseImage)
    .composite([
      { input: overlayBuffer, blend: 'over' },
      { input: textBuffer, blend: 'over' },
    ])
    .jpeg({ quality: 90 })
    .toFile(path.join(IMAGES_DIR, 'og-default.jpg'));

  console.log('  ✓ Created images/og-default.jpg');
}

/**
 * Create web manifest
 */
function createWebManifest() {
  console.log('\nCreating web manifest...');

  const manifest = {
    name: 'Siquijor.xyz',
    short_name: 'Siquijor',
    icons: [
      {
        src: '/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    theme_color: JUNGLE_700,
    background_color: CREAM,
    display: 'standalone',
  };

  fs.writeFileSync(
    path.join(PUBLIC_DIR, 'site.webmanifest'),
    JSON.stringify(manifest, null, 2)
  );

  console.log('  ✓ Created site.webmanifest');
}

/**
 * Main execution
 */
async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('  GENERATING META ASSETS (Sharp.js)');
  console.log('='.repeat(60));

  try {
    await createFavicon();
    await createOGImage();
    createWebManifest();

    console.log('\n' + '='.repeat(60));
    console.log('  META ASSETS GENERATED SUCCESSFULLY');
    console.log('='.repeat(60) + '\n');
  } catch (error) {
    console.error('Error generating meta assets:', error);
    process.exit(1);
  }
}

main();
