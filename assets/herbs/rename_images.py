import re
from pathlib import Path

BASE_DIR = Path(r"c:\Users\Antonio\Documents\GitHub\Apothecary Recipes\images\manual images")

pattern = re.compile(r"^recipe-(\d+)-img-(\d+)-.+\.(\w+)$")

for path in BASE_DIR.iterdir():
    if not path.is_file():
        continue
    match = pattern.match(path.name)
    if not match:
        continue
    recipe_number = int(match.group(1))
    image_number = int(match.group(2))
    ext = match.group(3)

    if image_number == 1:
        new_name = f"{recipe_number}.{ext}"
    else:
        new_name = f"{recipe_number}-{image_number}.{ext}"

    new_path = path.with_name(new_name)
    if new_path.exists():
        print(f"Skipping (exists): {new_name}")
        continue

    print(f"Renaming: {path.name} -> {new_name}")
    path.rename(new_path)
