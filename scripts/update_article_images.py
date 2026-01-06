#!/usr/bin/env python3
"""
Update Article Images
=====================

Maps scraped images to article hero images based on content category.

Usage:
    python scripts/update_article_images.py
"""

import os
import re
import json
from pathlib import Path

BASE_DIR = Path(__file__).parent.parent
ARTICLES_DIR = BASE_DIR / "src" / "content" / "articles"
SCRAPED_DIR = BASE_DIR / "public" / "images" / "scraped"

# Mapping of article patterns to image categories
ARTICLE_IMAGE_MAP = {
    # Adventure
    "cliff-jumping-salagdoong": "salagdoong-beach",
    "night-diving-siquijor": "apo-island",
    "cantabon-cave-spelunking": "siquijor-general",
    "motorcycle-routes-island-loop": "siquijor-general",
    "stand-up-paddleboarding": "paliton-beach",

    # Photography
    "cambugahay-falls-photography": "cambugahay-falls",
    "sunset-locations-guide": "paliton-beach",
    "sunrise-photography-spots": "paliton-beach",
    "underwater-photography": "apo-island",
    "instagram-spots-siquijor": "siquijor-general",

    # Local Life
    "food-guide-local-cuisine": "paliton-beach",
    "traditional-healers-mananambal": "siquijor-general",
    "artisan-workshops": "siquijor-general",
    "fishermen-experience": "paliton-beach",

    # Seasonal
    "best-time-to-visit": "paliton-beach",
    "rainy-season-guide": "cambugahay-falls",
    "full-moon-experiences": "paliton-beach",
    "holy-week-siquijor": "lazi-church",

    # Planning
    "solo-travel-guide": "paliton-beach",
    "safety-guide": "siquijor-general",
    "siquijor-vs-bohol": "cambugahay-falls",
    "siquijor-vs-apo-island": "apo-island",
    "siquijor-itinerary": "paliton-beach",

    # Niche
    "couples-honeymoon-guide": "paliton-beach",
    "wellness-yoga-retreats": "paliton-beach",
    "digital-nomad-guide": "paliton-beach",
}

def get_best_image(category: str) -> str:
    """Get the best image from a category directory."""
    cat_dir = SCRAPED_DIR / category
    if not cat_dir.exists():
        return None

    images = []
    for ext in ['*.jpg', '*.jpeg', '*.png', '*.webp']:
        images.extend(cat_dir.glob(ext))

    if not images:
        return None

    # Prefer larger images
    best = None
    best_size = 0
    for img in images:
        size = img.stat().st_size
        if size > best_size:
            best_size = size
            best = img

    if best:
        return f"/images/scraped/{category}/{best.name}"
    return None


def update_article_image(article_path: Path, new_image: str):
    """Update the heroImage src in an article."""
    content = article_path.read_text()

    # Find and replace heroImage src
    # Pattern matches heroImage block and captures the src line
    pattern = r'(heroImage:\s*\n\s+src:\s*")[^"]+(")'

    if re.search(pattern, content):
        new_content = re.sub(pattern, f'\\g<1>{new_image}\\2', content)
        article_path.write_text(new_content)
        return True
    return False


def main():
    print("\n" + "=" * 60)
    print("  UPDATING ARTICLE IMAGES")
    print("=" * 60 + "\n")

    updated = 0
    skipped = 0

    for article_slug, category in ARTICLE_IMAGE_MAP.items():
        # Find the article file
        article_files = list(ARTICLES_DIR.rglob(f"{article_slug}.mdx"))

        if not article_files:
            print(f"⚠ Article not found: {article_slug}")
            continue

        article_path = article_files[0]

        # Get best image for category
        new_image = get_best_image(category)

        if not new_image:
            print(f"⚠ No images for category: {category}")
            skipped += 1
            continue

        # Check if article already uses this image
        content = article_path.read_text()
        if new_image in content:
            print(f"⊘ Already updated: {article_slug}")
            skipped += 1
            continue

        # Update the article
        if update_article_image(article_path, new_image):
            print(f"✓ Updated: {article_slug} -> {category}")
            updated += 1
        else:
            print(f"✗ Failed to update: {article_slug}")
            skipped += 1

    print("\n" + "=" * 60)
    print(f"  Updated: {updated} articles")
    print(f"  Skipped: {skipped} articles")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
