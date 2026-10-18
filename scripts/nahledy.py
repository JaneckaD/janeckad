# Vytvoří malé náhledy (240 px, webp) pro galerii: public/portfolio/*.jpg -> public/portfolio/nahled/*.webp
# Spuštění: python scripts/nahledy.py  (potřebuje Pillow: pip install pillow)
from pathlib import Path
from PIL import Image

src = Path(__file__).resolve().parent.parent / 'public' / 'portfolio'
out = src / 'nahled'
out.mkdir(exist_ok=True)
for f in src.glob('*.jpg'):
    im = Image.open(f).convert('RGB')
    im.thumbnail((240, 240))
    im.save(out / (f.stem + '.webp'), quality=78, method=6)
