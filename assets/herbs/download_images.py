import csv
import os
import time
from pathlib import Path
import urllib.request
from urllib.error import HTTPError

BASE_DIR = Path(r"c:\Users\Antonio\Documents\GitHub\Apothecary Recipes\images\manual images")
MANIFEST = BASE_DIR / "image-download-manifest.csv"
OUTPUT_DIR = BASE_DIR

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

opener = urllib.request.build_opener()
opener.addheaders = [("User-Agent", "ApothecaryRecipesAttributionBot/1.0")]

BASE_DELAY_SECONDS = 1.5
MAX_RETRIES = 5

with MANIFEST.open(newline="", encoding="utf-8") as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        title = row.get("title", "")
        url = row.get("download_url", "")
        filename = row.get("filename", "")
        if not url or not filename:
            print(f"Skipping (missing url/filename): {title}")
            continue
        ext = os.path.splitext(title)[1] or ".jpg"
        out_path = OUTPUT_DIR / f"{filename}{ext}"
        if out_path.exists():
            print(f"Exists, skipping: {out_path.name}")
            continue
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                print(f"Downloading: {url} -> {out_path.name} (attempt {attempt})")
                request = urllib.request.Request(url, headers={"User-Agent": "ApothecaryRecipesAttributionBot/1.0"})
                with opener.open(request) as response, out_path.open("wb") as outfile:
                    outfile.write(response.read())
                time.sleep(BASE_DELAY_SECONDS)
                break
            except HTTPError as exc:
                if exc.code in {403, 429}:
                    wait_seconds = BASE_DELAY_SECONDS * (2 ** (attempt - 1))
                    print(f"Rate limited ({exc.code}). Waiting {wait_seconds:.1f}s before retrying...")
                    time.sleep(wait_seconds)
                    continue
                print(f"Failed: {url} ({exc})")
                break
            except Exception as exc:
                print(f"Failed: {url} ({exc})")
                break
