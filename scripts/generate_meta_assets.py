#!/usr/bin/env python3
"""
Generate Meta Assets (Favicon & OG Image) for Siquijor.xyz
==========================================================

Creates favicon and OpenGraph image from scraped Siquijor images.

Usage:
    python scripts/generate_meta_assets.py

Requirements:
    pip install Pillow
"""

import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

# Paths
BASE_DIR = Path(__file__).parent.parent
PUBLIC_DIR = BASE_DIR / "public"
IMAGES_DIR = PUBLIC_DIR / "images"
SCRAPED_DIR = IMAGES_DIR / "scraped"

# Colors - Siquijor theme (teal/turquoise waters)
SIQUIJOR_TEAL = (0, 169, 157)  # #00A99D
SIQUIJOR_DARK = (26, 60, 64)   # #1A3C40
WHITE = (255, 255, 255)


def create_favicon():
    """Create a simple favicon with Siquijor's initial 'S'."""
    sizes = [16, 32, 48, 64, 128, 180, 192, 512]

    # Create the largest size first
    size = 512
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw circular background with gradient effect
    # Main circle
    padding = size // 10
    draw.ellipse([padding, padding, size - padding, size - padding],
                 fill=SIQUIJOR_TEAL)

    # Add a subtle inner glow
    inner_pad = padding + size // 20
    draw.ellipse([inner_pad, inner_pad, size - inner_pad, size - inner_pad],
                 fill=(0, 189, 177))  # Slightly lighter teal

    # Draw the 'S' letter
    try:
        # Try to use a system font
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size // 2)
    except (OSError, IOError):
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size // 2)
        except (OSError, IOError):
            font = ImageFont.load_default()

    text = "S"
    # Get text bounding box
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]

    # Center the text
    x = (size - text_width) // 2
    y = (size - text_height) // 2 - size // 15

    draw.text((x, y), text, fill=WHITE, font=font)

    # Save different sizes
    for s in sizes:
        resized = img.resize((s, s), Image.Resampling.LANCZOS)

        if s == 16:
            resized.save(PUBLIC_DIR / "favicon-16x16.png")
        elif s == 32:
            resized.save(PUBLIC_DIR / "favicon-32x32.png")
        elif s == 180:
            resized.save(PUBLIC_DIR / "apple-touch-icon.png")
        elif s == 192:
            resized.save(PUBLIC_DIR / "android-chrome-192x192.png")
        elif s == 512:
            resized.save(PUBLIC_DIR / "android-chrome-512x512.png")

    # Create ICO file
    ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
    ico_images = [img.resize(s, Image.Resampling.LANCZOS) for s in ico_sizes]
    ico_images[0].save(PUBLIC_DIR / "favicon.ico", format='ICO', sizes=ico_sizes)

    print(f"✓ Created favicons in {PUBLIC_DIR}")


def find_best_og_image():
    """Find the best landscape image for OG meta."""
    candidates = []

    # Look for beach or general images (usually best for OG)
    search_dirs = [
        SCRAPED_DIR / "paliton-beach",
        SCRAPED_DIR / "siquijor-general",
        SCRAPED_DIR / "cambugahay-falls"
    ]

    for search_dir in search_dirs:
        if search_dir.exists():
            for ext in ['*.jpg', '*.jpeg', '*.png', '*.webp']:
                for img_path in search_dir.glob(ext):
                    try:
                        with Image.open(img_path) as img:
                            w, h = img.size
                            # Prefer landscape images close to 1200x630 ratio
                            ratio = w / h
                            if 1.5 <= ratio <= 2.1 and w >= 800:
                                candidates.append((img_path, w, h, abs(ratio - 1.9)))
                    except Exception:
                        continue

    # Sort by ratio closeness to 1.9 (OG ideal)
    if candidates:
        candidates.sort(key=lambda x: x[3])
        return candidates[0][0]

    return None


def create_og_image():
    """Create OpenGraph image with overlay branding."""
    og_width, og_height = 1200, 630

    # Find a good base image
    base_path = find_best_og_image()

    if base_path:
        print(f"Using base image: {base_path.name}")
        img = Image.open(base_path)

        # Resize to cover OG dimensions
        img_ratio = img.width / img.height
        og_ratio = og_width / og_height

        if img_ratio > og_ratio:
            # Image is wider - scale to height
            new_height = og_height
            new_width = int(new_height * img_ratio)
        else:
            # Image is taller - scale to width
            new_width = og_width
            new_height = int(new_width / img_ratio)

        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

        # Center crop
        left = (new_width - og_width) // 2
        top = (new_height - og_height) // 2
        img = img.crop((left, top, left + og_width, top + og_height))

        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
    else:
        # Create a gradient background if no image found
        print("No suitable image found, creating gradient background")
        img = Image.new('RGB', (og_width, og_height), SIQUIJOR_TEAL)

    # Add semi-transparent overlay at bottom
    overlay = Image.new('RGBA', (og_width, og_height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Gradient overlay at bottom for text
    for y in range(og_height // 2, og_height):
        alpha = int(180 * (y - og_height // 2) / (og_height // 2))
        draw.line([(0, y), (og_width, y)], fill=(26, 60, 64, alpha))

    # Composite overlay
    img = Image.alpha_composite(img.convert('RGBA'), overlay)

    draw = ImageDraw.Draw(img)

    # Add text
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 64)
        subtitle_font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 28)
    except (OSError, IOError):
        try:
            title_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 64)
            subtitle_font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 28)
        except (OSError, IOError):
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()

    # Title
    title = "Siquijor.xyz"
    title_bbox = draw.textbbox((0, 0), title, font=title_font)
    title_x = 60
    title_y = og_height - 160

    # Shadow
    draw.text((title_x + 2, title_y + 2), title, fill=(0, 0, 0, 150), font=title_font)
    draw.text((title_x, title_y), title, fill=WHITE, font=title_font)

    # Subtitle
    subtitle = "Your Guide to the Mystical Island"
    draw.text((60, og_height - 85), subtitle, fill=(255, 255, 255, 230), font=subtitle_font)

    # Convert back to RGB and save
    img = img.convert('RGB')
    img.save(PUBLIC_DIR / "og-image.jpg", quality=90, optimize=True)
    img.save(IMAGES_DIR / "og-default.jpg", quality=90, optimize=True)

    print(f"✓ Created OG image: {PUBLIC_DIR / 'og-image.jpg'}")


def create_site_webmanifest():
    """Create web manifest for PWA support."""
    manifest = """{
  "name": "Siquijor.xyz",
  "short_name": "Siquijor",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "theme_color": "#00A99D",
  "background_color": "#ffffff",
  "display": "standalone"
}"""

    with open(PUBLIC_DIR / "site.webmanifest", "w") as f:
        f.write(manifest)

    print(f"✓ Created web manifest")


def main():
    print("\n" + "=" * 60)
    print("  GENERATING META ASSETS")
    print("=" * 60 + "\n")

    # Create directories if needed
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    create_favicon()
    create_og_image()
    create_site_webmanifest()

    print("\n" + "=" * 60)
    print("  META ASSETS GENERATED SUCCESSFULLY")
    print("=" * 60 + "\n")


if __name__ == "__main__":
    main()
