#!/usr/bin/env python3
"""
Siquijor Content Scraper
========================
Scrapes images and content from Siquijor travel blogs for the siquijor.xyz website.

Usage:
    python scrape_siquijor_content.py --images    # Scrape images only
    python scrape_siquijor_content.py --content   # Scrape content only
    python scrape_siquijor_content.py --all       # Scrape both

Requirements:
    pip install requests beautifulsoup4 Pillow
"""

import os
import re
import json
import hashlib
import argparse
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse
from datetime import datetime

try:
    import requests
    from bs4 import BeautifulSoup
    from PIL import Image
    from io import BytesIO
except ImportError as e:
    print(f"Missing dependency: {e}")
    print("Install with: pip install requests beautifulsoup4 Pillow")
    exit(1)

# Configuration
BASE_DIR = Path(__file__).parent.parent
IMAGES_DIR = BASE_DIR / "public" / "images" / "scraped"
CONTENT_DIR = BASE_DIR / "scraped_content"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# Siquijor-related keywords for filtering
SIQUIJOR_KEYWORDS = [
    "siquijor", "cambugahay", "salagdoong", "paliton", "lazi", "san juan",
    "balete tree", "enchanted", "healers", "mananambal", "tubod", "apo island",
    "cliff jumping", "waterfall", "beach", "diving", "snorkeling"
]

# Target URLs to scrape
BLOG_URLS = [
    {
        "url": "https://girlonazebra.com/things-to-do-in-siquijor/",
        "name": "girlonazebra",
        "image_selector": "img",
        "content_selector": "article"
    },
    {
        "url": "https://www.jonnymelon.com/siquijor-tourist-spots/",
        "name": "jonnymelon",
        "image_selector": "img",
        "content_selector": "article"
    },
    {
        "url": "https://www.thebrokebackpacker.com/siquijor-philippines-travel-guide/",
        "name": "brokebackpacker",
        "image_selector": "img",
        "content_selector": "article"
    },
    {
        "url": "https://philippineshiddengems.com/siquijor-tourist-spots/",
        "name": "philippineshiddengems",
        "image_selector": "img",
        "content_selector": "article"
    },
    {
        "url": "https://samandkelsadventures.com/things-to-do-siquijor/",
        "name": "samandkels",
        "image_selector": "img",
        "content_selector": "article"
    }
]

# Image categorization by location/attraction
LOCATION_KEYWORDS = {
    "cambugahay-falls": ["cambugahay", "falls", "waterfall", "turquoise", "rope swing"],
    "salagdoong-beach": ["salagdoong", "cliff jump", "cliff diving", "maria"],
    "paliton-beach": ["paliton", "sunset", "palm tree", "beach"],
    "balete-tree": ["balete", "enchanted tree", "old tree", "fish spa"],
    "lazi-church": ["lazi", "church", "convent", "heritage"],
    "apo-island": ["apo island", "turtle", "snorkeling", "diving"],
    "tubod-sanctuary": ["tubod", "marine sanctuary", "coral"],
    "siquijor-general": ["siquijor", "island", "mystical", "coastal road"]
}


def setup_directories():
    """Create necessary directories for scraped content."""
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    CONTENT_DIR.mkdir(parents=True, exist_ok=True)

    # Create subdirectories for each location
    for location in LOCATION_KEYWORDS.keys():
        (IMAGES_DIR / location).mkdir(exist_ok=True)

    print(f"✓ Created directories at {IMAGES_DIR}")


def categorize_image(alt_text: str, src: str) -> str:
    """Categorize an image based on its alt text or URL."""
    combined_text = f"{alt_text} {src}".lower()

    for location, keywords in LOCATION_KEYWORDS.items():
        for keyword in keywords:
            if keyword in combined_text:
                return location

    return "siquijor-general"


def generate_filename(alt_text: str, src: str, category: str) -> str:
    """Generate a descriptive filename for an image."""
    # Clean alt text for filename
    if alt_text:
        # Remove special characters and limit length
        clean_name = re.sub(r'[^a-zA-Z0-9\s-]', '', alt_text.lower())
        clean_name = re.sub(r'\s+', '-', clean_name.strip())[:50]
    else:
        # Use hash of URL if no alt text
        clean_name = hashlib.md5(src.encode()).hexdigest()[:12]

    # Get file extension
    ext = Path(urlparse(src).path).suffix.lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.webp', '.gif']:
        ext = '.jpg'

    timestamp = datetime.now().strftime("%Y%m%d")
    return f"{category}-{clean_name}-{timestamp}{ext}"


def is_valid_image_url(url: str) -> bool:
    """Check if URL points to a valid image."""
    if not url:
        return False

    # Skip common non-content images
    skip_patterns = [
        'logo', 'icon', 'avatar', 'favicon', 'widget', 'ad-', 'advertisement',
        'banner', 'button', 'arrow', 'social', 'share', 'pinterest', 'facebook',
        'twitter', 'instagram', 'youtube', 'email', 'subscribe', 'footer',
        'header-logo', 'sprite', 'placeholder', 'loading', 'lazy', '1x1',
        'pixel', 'tracking', 'analytics', 'gravatar'
    ]

    url_lower = url.lower()
    return not any(pattern in url_lower for pattern in skip_patterns)


def is_siquijor_related(alt_text: str, src: str) -> bool:
    """Check if image is related to Siquijor content."""
    combined = f"{alt_text} {src}".lower()
    return any(keyword in combined for keyword in SIQUIJOR_KEYWORDS)


def download_image(url: str, save_path: Path, min_width: int = 400) -> bool:
    """Download and validate an image."""
    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()

        # Verify it's an image and check dimensions
        img = Image.open(BytesIO(response.content))
        width, height = img.size

        if width < min_width:
            print(f"  ⚠ Skipping (too small: {width}x{height})")
            return False

        # Convert to RGB if necessary (for JPEG)
        if img.mode in ('RGBA', 'P') and save_path.suffix.lower() in ('.jpg', '.jpeg'):
            img = img.convert('RGB')

        # Save with optimization
        img.save(save_path, quality=85, optimize=True)
        print(f"  ✓ Saved: {save_path.name} ({width}x{height})")
        return True

    except Exception as e:
        print(f"  ✗ Failed: {e}")
        return False


def scrape_images_from_url(blog_config: dict) -> list:
    """Scrape images from a single blog URL."""
    url = blog_config["url"]
    name = blog_config["name"]

    print(f"\n{'='*60}")
    print(f"Scraping images from: {name}")
    print(f"URL: {url}")
    print('='*60)

    downloaded = []

    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        images = soup.find_all('img')
        print(f"Found {len(images)} images on page")

        for img in images:
            src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
            if not src:
                continue

            # Make URL absolute
            src = urljoin(url, src)

            # Get alt text
            alt = img.get('alt', '')

            # Filter images
            if not is_valid_image_url(src):
                continue

            if not is_siquijor_related(alt, src):
                continue

            print(f"\nProcessing: {alt[:50]}..." if alt else f"\nProcessing: {src[:50]}...")

            # Categorize and generate filename
            category = categorize_image(alt, src)
            filename = generate_filename(alt, src, category)
            save_path = IMAGES_DIR / category / filename

            # Skip if already exists
            if save_path.exists():
                print(f"  ⊘ Already exists: {filename}")
                continue

            # Download
            if download_image(src, save_path):
                downloaded.append({
                    "source": name,
                    "url": src,
                    "alt": alt,
                    "category": category,
                    "local_path": str(save_path.relative_to(BASE_DIR))
                })

            # Rate limiting
            time.sleep(0.5)

    except Exception as e:
        print(f"Error scraping {url}: {e}")

    return downloaded


def scrape_content_from_url(blog_config: dict) -> dict:
    """Scrape text content from a single blog URL."""
    url = blog_config["url"]
    name = blog_config["name"]

    print(f"\n{'='*60}")
    print(f"Scraping content from: {name}")
    print('='*60)

    try:
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        # Extract title
        title = soup.find('h1')
        title_text = title.get_text().strip() if title else "Unknown"

        # Extract article content
        article = soup.find('article') or soup.find('main') or soup.find('div', class_=re.compile('content|post|entry'))

        if not article:
            print("  ⚠ Could not find main content")
            return {}

        # Extract headings and paragraphs
        content = {
            "source": name,
            "url": url,
            "title": title_text,
            "scraped_at": datetime.now().isoformat(),
            "sections": []
        }

        current_section = {"heading": "Introduction", "paragraphs": []}

        for element in article.find_all(['h2', 'h3', 'p', 'ul', 'ol']):
            if element.name in ['h2', 'h3']:
                if current_section["paragraphs"]:
                    content["sections"].append(current_section)
                current_section = {"heading": element.get_text().strip(), "paragraphs": []}
            elif element.name == 'p':
                text = element.get_text().strip()
                if len(text) > 30:  # Skip short paragraphs
                    current_section["paragraphs"].append(text)
            elif element.name in ['ul', 'ol']:
                items = [li.get_text().strip() for li in element.find_all('li')]
                if items:
                    current_section["paragraphs"].append({"type": "list", "items": items})

        if current_section["paragraphs"]:
            content["sections"].append(current_section)

        print(f"  ✓ Extracted {len(content['sections'])} sections")
        return content

    except Exception as e:
        print(f"Error scraping content from {url}: {e}")
        return {}


def save_content_to_json(all_content: list):
    """Save all scraped content to JSON file."""
    output_path = CONTENT_DIR / f"scraped_content_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(all_content, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Saved content to: {output_path}")


def generate_image_manifest(all_images: list):
    """Generate a manifest of all downloaded images."""
    manifest_path = IMAGES_DIR / "manifest.json"

    # Load existing manifest if it exists
    existing = []
    if manifest_path.exists():
        with open(manifest_path) as f:
            existing = json.load(f)

    # Merge with new images
    existing_paths = {img["local_path"] for img in existing}
    for img in all_images:
        if img["local_path"] not in existing_paths:
            existing.append(img)

    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(existing, f, indent=2)

    print(f"\n✓ Updated manifest with {len(all_images)} new images")
    print(f"  Total images in manifest: {len(existing)}")


def main():
    parser = argparse.ArgumentParser(description="Scrape Siquijor travel content")
    parser.add_argument('--images', action='store_true', help='Scrape images only')
    parser.add_argument('--content', action='store_true', help='Scrape content only')
    parser.add_argument('--all', action='store_true', help='Scrape both images and content')
    args = parser.parse_args()

    # Default to all if no option specified
    if not any([args.images, args.content, args.all]):
        args.all = True

    print("\n" + "="*60)
    print("  SIQUIJOR CONTENT SCRAPER")
    print("="*60)

    setup_directories()

    all_images = []
    all_content = []

    for blog in BLOG_URLS:
        if args.images or args.all:
            images = scrape_images_from_url(blog)
            all_images.extend(images)
            time.sleep(2)  # Rate limiting between sites

        if args.content or args.all:
            content = scrape_content_from_url(blog)
            if content:
                all_content.append(content)
            time.sleep(2)

    # Save results
    if all_images:
        generate_image_manifest(all_images)

    if all_content:
        save_content_to_json(all_content)

    print("\n" + "="*60)
    print("  SCRAPING COMPLETE")
    print("="*60)
    print(f"  Images downloaded: {len(all_images)}")
    print(f"  Content sources scraped: {len(all_content)}")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()
