#!/usr/bin/env python3
"""
Siquijor Province Website Scraper
Scrapes content and images from https://siquijorprovince.com/
"""

import os
import re
import json
import time
import hashlib
from datetime import datetime
from urllib.parse import urljoin, urlparse
import requests
from bs4 import BeautifulSoup
from PIL import Image
from io import BytesIO

# Configuration
BASE_URL = "https://siquijorprovince.com"
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SCRAPED_DATA_DIR = os.path.join(PROJECT_ROOT, "scripts", "scraped-data")
IMAGES_DIR = os.path.join(PROJECT_ROOT, "public", "images", "scraped")

# Pages to scrape
PAGES = {
    "about": "/siquijor-info/about-siquijor/",
    "churches": "/siquijor-info/churches/",
    "accommodations": "/where-to-stay-dine/accommodations/",
    "restaurants": "/where-to-stay-dine/restaurants/",
    "travel": "/how-to-get-there/",
    "homepage": "/",
}

# Request headers to mimic browser
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

def slugify(text):
    """Convert text to URL-friendly slug"""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text[:50]

def get_image_filename(section, alt_text, url):
    """Generate descriptive image filename"""
    date_str = datetime.now().strftime("%Y%m%d")

    # Use alt text if available, otherwise use URL hash
    if alt_text and alt_text.strip():
        desc = slugify(alt_text)
    else:
        desc = hashlib.md5(url.encode()).hexdigest()[:8]

    # Get extension from URL
    ext = os.path.splitext(urlparse(url).path)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.webp', '.gif']:
        ext = '.jpg'

    return f"{section}-{desc}-{date_str}{ext}"

def download_image(url, section, alt_text=""):
    """Download an image and save it locally"""
    try:
        # Make absolute URL
        if url.startswith('//'):
            url = 'https:' + url
        elif url.startswith('/'):
            url = BASE_URL + url
        elif not url.startswith('http'):
            url = urljoin(BASE_URL, url)

        # Generate filename
        filename = get_image_filename(section, alt_text, url)
        section_dir = os.path.join(IMAGES_DIR, section)
        os.makedirs(section_dir, exist_ok=True)
        filepath = os.path.join(section_dir, filename)

        # Skip if already exists
        if os.path.exists(filepath):
            print(f"  [SKIP] Already exists: {filename}")
            return f"/images/scraped/{section}/{filename}"

        # Download image
        response = requests.get(url, headers=HEADERS, timeout=30)
        response.raise_for_status()

        # Verify it's an image and save
        img = Image.open(BytesIO(response.content))

        # Convert to RGB if necessary (for JPEG)
        if img.mode in ('RGBA', 'P') and filepath.endswith('.jpg'):
            img = img.convert('RGB')

        img.save(filepath, quality=85, optimize=True)
        print(f"  [OK] Downloaded: {filename}")

        return f"/images/scraped/{section}/{filename}"

    except Exception as e:
        print(f"  [ERROR] Failed to download {url}: {e}")
        return None

def scrape_page(url, section):
    """Scrape a single page and return content and images"""
    full_url = BASE_URL + url if url.startswith('/') else url
    print(f"\n{'='*60}")
    print(f"Scraping: {full_url}")
    print(f"{'='*60}")

    try:
        response = requests.get(full_url, headers=HEADERS, timeout=30)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        # Extract main content
        content = {
            "url": full_url,
            "title": "",
            "sections": [],
            "images": [],
            "raw_text": ""
        }

        # Get page title
        title_tag = soup.find('h1') or soup.find('title')
        if title_tag:
            content["title"] = title_tag.get_text(strip=True)

        # Get main content area
        main_content = soup.find('main') or soup.find('article') or soup.find('div', class_=re.compile(r'content|main|entry'))
        if not main_content:
            main_content = soup.find('body')

        if main_content:
            # Extract text by sections
            for heading in main_content.find_all(['h1', 'h2', 'h3', 'h4']):
                section_data = {
                    "heading": heading.get_text(strip=True),
                    "level": int(heading.name[1]),
                    "content": []
                }

                # Get sibling content until next heading
                for sibling in heading.find_next_siblings():
                    if sibling.name in ['h1', 'h2', 'h3', 'h4']:
                        break
                    text = sibling.get_text(strip=True)
                    if text:
                        section_data["content"].append(text)

                if section_data["content"]:
                    content["sections"].append(section_data)

            # Get all text content
            content["raw_text"] = main_content.get_text(separator='\n', strip=True)

            # Extract and download images
            for img in main_content.find_all('img'):
                src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                if src and not src.startswith('data:'):
                    alt = img.get('alt', '')
                    local_path = download_image(src, section, alt)
                    if local_path:
                        content["images"].append({
                            "src": local_path,
                            "alt": alt,
                            "original_url": src
                        })
                    time.sleep(0.5)  # Rate limiting for images

        return content

    except Exception as e:
        print(f"[ERROR] Failed to scrape {full_url}: {e}")
        return None

def scrape_accommodations(soup, section):
    """Special handler for accommodations page with structured data"""
    accommodations = []

    # Look for accommodation entries
    for entry in soup.find_all(['div', 'article'], class_=re.compile(r'post|entry|item|accommodation')):
        acc = {
            "name": "",
            "location": "",
            "contact": "",
            "email": "",
            "website": "",
            "category": "",
            "images": []
        }

        # Extract name from heading
        name_tag = entry.find(['h2', 'h3', 'h4', 'strong'])
        if name_tag:
            acc["name"] = name_tag.get_text(strip=True)

        # Extract text content
        text = entry.get_text('\n', strip=True)

        # Parse contact info
        if 'Location:' in text or 'Address:' in text:
            match = re.search(r'(?:Location|Address)[:\s]+(.+?)(?:\n|$)', text, re.I)
            if match:
                acc["location"] = match.group(1).strip()

        if '@' in text:
            emails = re.findall(r'[\w\.-]+@[\w\.-]+\.\w+', text)
            if emails:
                acc["email"] = emails[0]

        phone_match = re.findall(r'(?:0\d{10}|09\d{9}|\+63\d{10}|\(\d{2,3}\)\s*\d{3}[- ]?\d{4})', text)
        if phone_match:
            acc["contact"] = phone_match[0]

        if acc["name"]:
            accommodations.append(acc)

    return accommodations

def scrape_churches(soup, section):
    """Special handler for churches page"""
    churches = []

    for entry in soup.find_all(['div', 'article'], class_=re.compile(r'post|entry|item|church')):
        church = {
            "name": "",
            "location": "",
            "municipality": "",
            "images": []
        }

        name_tag = entry.find(['h2', 'h3', 'h4', 'strong'])
        if name_tag:
            church["name"] = name_tag.get_text(strip=True)

        text = entry.get_text('\n', strip=True)

        # Extract location
        loc_match = re.search(r'(?:Location|Address)[:\s]+(.+?)(?:\n|$)', text, re.I)
        if loc_match:
            church["location"] = loc_match.group(1).strip()

        # Extract images
        for img in entry.find_all('img'):
            src = img.get('src') or img.get('data-src')
            if src and not src.startswith('data:'):
                local_path = download_image(src, section, church["name"])
                if local_path:
                    church["images"].append(local_path)
                time.sleep(0.5)

        if church["name"]:
            churches.append(church)

    return churches

def main():
    """Main scraper function"""
    print("="*60)
    print("Siquijor Province Website Scraper")
    print("="*60)
    print(f"Data directory: {SCRAPED_DATA_DIR}")
    print(f"Images directory: {IMAGES_DIR}")

    # Ensure directories exist
    os.makedirs(SCRAPED_DATA_DIR, exist_ok=True)
    os.makedirs(IMAGES_DIR, exist_ok=True)

    all_data = {}

    for section, url in PAGES.items():
        content = scrape_page(url, section)
        if content:
            all_data[section] = content

            # Save individual JSON file
            json_path = os.path.join(SCRAPED_DATA_DIR, f"{section}.json")
            with open(json_path, 'w', encoding='utf-8') as f:
                json.dump(content, f, indent=2, ensure_ascii=False)
            print(f"[SAVED] {json_path}")

        # Rate limiting between pages
        time.sleep(2)

    # Save combined data
    combined_path = os.path.join(SCRAPED_DATA_DIR, "all_data.json")
    with open(combined_path, 'w', encoding='utf-8') as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)
    print(f"\n[SAVED] Combined data: {combined_path}")

    # Print summary
    print("\n" + "="*60)
    print("SCRAPING COMPLETE")
    print("="*60)

    total_images = 0
    for section, data in all_data.items():
        img_count = len(data.get('images', []))
        total_images += img_count
        print(f"  {section}: {img_count} images")

    print(f"\nTotal images downloaded: {total_images}")
    print(f"Data saved to: {SCRAPED_DATA_DIR}")
    print(f"Images saved to: {IMAGES_DIR}")

if __name__ == "__main__":
    main()
