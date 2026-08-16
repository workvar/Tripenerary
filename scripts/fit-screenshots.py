#!/usr/bin/env python3
"""Normalise captured screenshots to the exact sizes Google Play accepts.

    python3 scripts/fit-screenshots.py            # every profile found
    python3 scripts/fit-screenshots.py phone      # one profile

Reads raw captures from store/screenshots/<profile>/ and writes Play-ready
copies to store/screenshots/<profile>/play/.

Each image is scaled to fit the target box and centred on a solid brand-teal
background, so nothing is stretched or cropped and the result is exactly the
declared aspect ratio. Alpha is flattened because Play requires 24-bit PNG.

Device profiles come from scripts/screenshot-profiles.mjs so there is one
source of truth.
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SHOTS_ROOT = ROOT / "store" / "screenshots"
PROFILES_JS = ROOT / "scripts" / "screenshot-profiles.mjs"

BACKGROUND = (14, 79, 76)  # colors.primary #0E4F4C

MIN_SIDE = 320
MAX_SIDE = 3840


def load_profiles() -> dict[str, dict]:
    """Import the shared JS profile table via node so it is never duplicated."""
    script = (
        f"import('{PROFILES_JS.as_uri()}')"
        ".then(m => console.log(JSON.stringify(m.PROFILES)))"
    )
    out = subprocess.run(
        ["node", "--input-type=module", "-e", script],
        capture_output=True,
        text=True,
        check=True,
    )
    return json.loads(out.stdout)


def fit(src: Path, dst: Path, width: int, height: int) -> None:
    img = Image.open(src)
    if img.mode != "RGB":
        img = img.convert("RGBA")
        flat = Image.new("RGBA", img.size, (*BACKGROUND, 255))
        img = Image.alpha_composite(flat, img).convert("RGB")

    scale = min(width / img.width, height / img.height)
    new_size = (max(1, round(img.width * scale)), max(1, round(img.height * scale)))
    img = img.resize(new_size, Image.LANCZOS)

    canvas = Image.new("RGB", (width, height), BACKGROUND)
    canvas.paste(img, ((width - new_size[0]) // 2, (height - new_size[1]) // 2))
    dst.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(dst, "PNG", optimize=True)


def check(width: int, height: int) -> list[str]:
    problems = []
    lo, hi = sorted((width, height))
    if lo < MIN_SIDE:
        problems.append(f"shortest side {lo}px is under Play's {MIN_SIDE}px minimum")
    if hi > MAX_SIDE:
        problems.append(f"longest side {hi}px is over Play's {MAX_SIDE}px maximum")
    if hi > lo * 2:
        problems.append(f"{width}x{height} is more than 2:1; Play rejects it")
    if lo < 1080:
        problems.append(f"shortest side {lo}px is under 1080px, so it will not qualify for Play's recommendation slots")
    return problems


def main() -> int:
    profiles = load_profiles()
    wanted = sys.argv[1:] or list(profiles)

    any_output = False
    for name in wanted:
        profile = profiles.get(name)
        if profile is None:
            print(f"Unknown profile {name!r}. Known: {', '.join(profiles)}")
            return 1

        src_dir = SHOTS_ROOT / name
        if not src_dir.is_dir():
            continue
        sources = sorted(p for p in src_dir.glob("*.png") if p.parent.name == name)
        if not sources:
            continue

        width, height = profile["width"], profile["height"]
        for problem in check(width, height):
            print(f"  ! {name}: {problem}")

        out_dir = src_dir / "play"
        print(f"{name} -> {out_dir.relative_to(ROOT)}  ({width}x{height})")
        for src in sources:
            dst = out_dir / src.name
            fit(src, dst, width, height)
            print(f"  {src.name}")
            any_output = True

        if len(sources) < 4:
            noun = "shot" if len(sources) == 1 else "shots"
            print(f"  ! only {len(sources)} {noun}; Play wants at least 4 for {name}")

    if not any_output:
        print("No captures found. Run scripts/capture-screenshots.mjs first.")
        print(f"Expected raw PNGs under {SHOTS_ROOT.relative_to(ROOT)}/<profile>/")
        return 1

    print("\nUpload the files in each play/ folder to the matching Play Console section.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
