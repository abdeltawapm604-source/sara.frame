#!/usr/bin/env python3
"""
Process Sara's gallery images:
1. Categorize based on content
2. Convert to optimized WebP
3. Extract real dimensions for masonry layout
4. Output a JSON manifest
"""
import os
import json
from PIL import Image, ImageOps

SRC_DIR = "/mnt/user-data/uploads"
OUT_DIR = "/home/claude/sara-gallery/public/gallery"
MAX_WIDTH = 1600  # cap for web delivery
QUALITY = 78

os.makedirs(OUT_DIR, exist_ok=True)

# Categorization based on visual inspection of each image
# category: "sea" | "streets" | "architecture"
CATALOG = [
    {"src": "IMG_0009.JPG", "slug": "giza-roadside", "category": "architecture", "title": "Giza Roadside", "caption": "Pyramids, Giza"},
    {"src": "IMG_0010.JPG", "slug": "sphinx-pyramid", "category": "architecture", "title": "The Sphinx", "caption": "Giza Plateau"},
    {"src": "IMG_0019.JPG", "slug": "golden-hour-drive", "category": "streets", "title": "Golden Hour", "caption": "Cairo Streets"},
    {"src": "IMG_0021.JPG", "slug": "vintage-mazda", "category": "streets", "title": "Vintage Mazda", "caption": "Cairo Streets"},
    {"src": "IMG_0022.JPG", "slug": "dusk-traffic", "category": "streets", "title": "Dusk Traffic", "caption": "Cairo Streets"},
    {"src": "IMG_0033.JPG", "slug": "night-descent", "category": "streets", "title": "Night Descent", "caption": "Aerial, Night"},
    {"src": "IMG_5411.jpg", "slug": "suleymaniye-storm", "category": "architecture", "title": "Storm Over Süleymaniye", "caption": "Istanbul"},
    {"src": "IMG_5413.jpg", "slug": "rooftop-clouds", "category": "architecture", "title": "Rooftop Clouds", "caption": "Istanbul"},
    {"src": "IMG_5437.jpg", "slug": "vintage-corner", "category": "architecture", "title": "Vintage Corner", "caption": "Istanbul Cafe"},
    {"src": "IMG_5456.jpg", "slug": "dome-and-trees", "category": "architecture", "title": "Dome & Trees", "caption": "Istanbul"},
    {"src": "IMG_9869.JPG", "slug": "snow-cedar", "category": "architecture", "title": "Snow Cedar", "caption": "Istanbul Winter"},
    {"src": "IMG_9892.JPG", "slug": "golden-horn", "category": "sea", "title": "Golden Horn", "caption": "Istanbul"},
    {"src": "IMG_9910.JPG", "slug": "wingview-haze", "category": "sea", "title": "Wingview Haze", "caption": "Above the Nile"},
    {"src": "IMG_9911.JPG", "slug": "wingview-river", "category": "sea", "title": "Wingview River", "caption": "Above the Nile"},
    {"src": "IMG_9934.JPG", "slug": "coastal-glow", "category": "sea", "title": "Coastal Glow", "caption": "North Coast"},
    {"src": "IMG_9945.JPG", "slug": "deep-turquoise", "category": "sea", "title": "Deep Turquoise", "caption": "Mediterranean"},
    {"src": "IMG_9946.JPG", "slug": "turquoise-reef", "category": "sea", "title": "Turquoise Reef", "caption": "Mediterranean"},
    {"src": "IMG_9947.JPG", "slug": "cliffside-blue", "category": "sea", "title": "Cliffside Blue", "caption": "Marsa Matrouh"},
    {"src": "IMG_9949.JPG", "slug": "headland-walkers", "category": "sea", "title": "Headland", "caption": "Marsa Matrouh"},
    {"src": "IMG_9953.JPG", "slug": "carved-cliffs", "category": "sea", "title": "Carved Cliffs", "caption": "Marsa Matrouh"},
    {"src": "IMG_9961.JPG", "slug": "bay-promenade", "category": "sea", "title": "Bay Promenade", "caption": "North Coast"},
    {"src": "IMG_9966.JPG", "slug": "nile-greenery", "category": "sea", "title": "Nile Greenery", "caption": "Nile"},
    {"src": "IMG_9979.JPG", "slug": "cornfield-sky", "category": "streets", "title": "Cornfield Sky", "caption": "Delta, Egypt"},
    {"src": "IMG_9989.JPG", "slug": "alexandria-facade", "category": "architecture", "title": "Old Facade", "caption": "Alexandria"},
]

manifest = []

for item in CATALOG:
    src_path = os.path.join(SRC_DIR, item["src"])
    if not os.path.exists(src_path):
        print(f"MISSING: {src_path}")
        continue

    img = Image.open(src_path)
    img = ImageOps.exif_transpose(img)  # fix rotation
    img = img.convert("RGB")

    w, h = img.size
    if w > MAX_WIDTH:
        new_h = int(h * (MAX_WIDTH / w))
        img = img.resize((MAX_WIDTH, new_h), Image.LANCZOS)
        w, h = img.size

    out_name = f"{item['slug']}.webp"
    out_path = os.path.join(OUT_DIR, out_name)
    img.save(out_path, "WEBP", quality=QUALITY, method=6)

    file_size = os.path.getsize(out_path)
    manifest.append({
        "id": item["slug"],
        "src": f"/gallery/{out_name}",
        "category": item["category"],
        "title": item["title"],
        "caption": item["caption"],
        "width": w,
        "height": h,
        "aspect": round(w / h, 4),
    })
    print(f"{item['slug']:25s} {item['category']:13s} {w}x{h}  {file_size//1024}KB")

with open("/home/claude/sara-gallery/src/data/photos.json", "w") as f:
    json.dump(manifest, f, indent=2)

print(f"\nTotal: {len(manifest)} images processed")
