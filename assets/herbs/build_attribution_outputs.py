import csv
import json
import re
from collections import defaultdict
from pathlib import Path
from urllib.parse import quote

BASE_DIR = Path(r"c:\Users\Antonio\Documents\GitHub\Apothecary Recipes\apothecary-recipes\assets\herbs")
SOURCE_FILE = BASE_DIR / "image-attributions.md"
OUTPUT_JSON = BASE_DIR / "image-attributions.json"
OUTPUT_COMPACT = BASE_DIR / "image-attributions-compact.md"
OUTPUT_LICENSES = BASE_DIR / "image-attributions-licenses.md"
OUTPUT_MANIFEST = BASE_DIR / "image-download-manifest.csv"

recipe_header_re = re.compile(r"^## Recipe (\d+) \(index (\d+)\) — (.+)$")
image_header_re = re.compile(r"^### Image (\d+)$")
field_re = re.compile(r"^- ([A-Za-z ]+): (.+)$")

recipes = []
current_recipe = None
current_image = None

for line in SOURCE_FILE.read_text(encoding="utf-8").splitlines():
    line = line.strip()
    if not line:
        continue
    recipe_match = recipe_header_re.match(line)
    if recipe_match:
        if current_recipe:
            if current_image:
                current_recipe["images"].append(current_image)
                current_image = None
            recipes.append(current_recipe)
        current_recipe = {
            "recipeNumber": int(recipe_match.group(1)),
            "index": int(recipe_match.group(2)),
            "name": recipe_match.group(3),
            "images": [],
        }
        continue
    image_match = image_header_re.match(line)
    if image_match:
        if current_image:
            current_recipe["images"].append(current_image)
        current_image = {"imageNumber": int(image_match.group(1))}
        continue
    field_match = field_re.match(line)
    if field_match and current_image is not None:
        key = field_match.group(1).strip().lower().replace(" ", "")
        value = field_match.group(2).strip()
        mapping = {
            "title": "title",
            "creator": "creator",
            "source": "source",
            "license": "license",
            "licenseurl": "licenseUrl",
            "changes": "changes",
        }
        if key in mapping:
            current_image[mapping[key]] = value

if current_recipe:
    if current_image:
        current_recipe["images"].append(current_image)
    recipes.append(current_recipe)

OUTPUT_JSON.write_text(json.dumps({"recipes": recipes}, indent=2, ensure_ascii=False), encoding="utf-8")

compact_lines = [
    "# Image attributions (compact)",
    "",
    "Source: image-attributions.md",
    "",
]

license_counts = defaultdict(int)
license_urls = {}

manifest_rows = []

for recipe in recipes:
    for image in recipe["images"]:
        title = image.get("title", "")
        source = image.get("source", "")
        creator = image.get("creator", "")
        license_name = image.get("license", "")
        license_url = image.get("licenseUrl", "")
        changes = image.get("changes", "")
        compact_lines.append(
            f"- Recipe {recipe['recipeNumber']} (index {recipe['index']}) — {recipe['name']}: "
            f"Image {image['imageNumber']} — {title} — {creator} — {license_name} "
            f"({license_url}) — Source: {source} — Changes: {changes}"
        )
        license_counts[(license_name, license_url)] += 1
        if license_name and license_url:
            license_urls[license_name] = license_url

        safe_title = re.sub(r"[^A-Za-z0-9._-]+", "_", title).strip("_")
        filename = f"recipe-{recipe['recipeNumber']:03d}-img-{image['imageNumber']:02d}-{safe_title}" if safe_title else f"recipe-{recipe['recipeNumber']:03d}-img-{image['imageNumber']:02d}"
        download_url = f"https://commons.wikimedia.org/wiki/Special:FilePath/{quote(title)}" if title else ""
        manifest_rows.append(
            {
                "recipe_number": recipe["recipeNumber"],
                "recipe_index": recipe["index"],
                "image_number": image["imageNumber"],
                "title": title,
                "source": source,
                "download_url": download_url,
                "filename": filename,
            }
        )

OUTPUT_COMPACT.write_text("\n".join(compact_lines) + "\n", encoding="utf-8")

license_lines = [
    "# License summary",
    "",
    "Unique licenses referenced in image-attributions.md:",
    "",
]
for (license_name, license_url), count in sorted(license_counts.items(), key=lambda item: item[0][0]):
    license_lines.append(f"- {license_name} — {license_url} (images: {count})")

OUTPUT_LICENSES.write_text("\n".join(license_lines) + "\n", encoding="utf-8")
with OUTPUT_MANIFEST.open("w", newline="", encoding="utf-8") as csvfile:
    writer = csv.DictWriter(
        csvfile,
        fieldnames=[
            "recipe_number",
            "recipe_index",
            "image_number",
            "title",
            "source",
            "download_url",
            "filename",
        ],
        quoting=csv.QUOTE_ALL,
    )
    writer.writeheader()
    writer.writerows(manifest_rows)

print(f"Wrote {OUTPUT_JSON}")
print(f"Wrote {OUTPUT_COMPACT}")
print(f"Wrote {OUTPUT_LICENSES}")
print(f"Wrote {OUTPUT_MANIFEST}")
print(f"Recipes: {len(recipes)}")
print(f"Images: {sum(len(r['images']) for r in recipes)}")
