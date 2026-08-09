#!/usr/bin/env python3
"""Render the Tripenerary compass mark into every icon asset the app needs.

The mark mirrors src/components/CompassMark.tsx so the launcher icon, the splash
icon and the in-app mark are the same drawing.

    python3 scripts/generate-icons.py

Outputs:
    assets/                      master PNGs consumed by app.json / EAS
    android/app/src/main/res/    mipmaps, adaptive icon layers, splash icon
    store/                       Play listing icon, 1024px master, feature graphic
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
RES = ROOT / "android" / "app" / "src" / "main" / "res"
STORE = ROOT / "store"

TEAL = (14, 79, 76, 255)  # colors.primary  #0E4F4C
ACCENT = (217, 113, 60, 255)  # colors.accent   #D9713C
WHITE = (255, 255, 255, 255)

SS = 4  # supersampling factor

# Ring diameter as a fraction of its canvas.
ICON_SCALE = 0.62  # full-bleed square icon
# Adaptive layers are 108dp with only the middle 72dp guaranteed visible, so the
# mark is scaled down by 72/108 to keep the same optical size once masked.
ADAPTIVE_SCALE = 0.44
# The Android 12+ splash icon canvas is 288dp with a 192dp content circle.
SPLASH_SCALE = 0.60

# Density buckets: name -> launcher icon px (48dp baseline).
MIPMAP_DENSITIES = {
    "mdpi": 48,
    "hdpi": 72,
    "xhdpi": 96,
    "xxhdpi": 144,
    "xxxhdpi": 192,
}

# Adaptive icon layers are 108dp.
ADAPTIVE_DENSITIES = {
    "mdpi": 108,
    "hdpi": 162,
    "xhdpi": 216,
    "xxhdpi": 324,
    "xxxhdpi": 432,
}


def _blend(color: tuple[int, int, int, int], alpha: float) -> tuple[int, int, int, int]:
    return (color[0], color[1], color[2], int(color[3] * alpha))


def draw_mark(size: int, scale: float, tint=WHITE, accent=ACCENT) -> Image.Image:
    """Compass rose on a transparent canvas.

    `scale` is the fraction of `size` the mark's outer ring diameter occupies.
    """
    px = size * SS
    img = Image.new("RGBA", (px, px), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)

    cx = cy = px / 2
    outer = px * scale  # ring diameter
    r = outer / 2

    ring_w = max(1.0, outer * 0.0208)
    d.ellipse(
        [cx - r + ring_w / 2, cy - r + ring_w / 2, cx + r - ring_w / 2, cy + r - ring_w / 2],
        outline=tint,
        width=int(round(ring_w)),
    )

    inner_r = outer * 0.36
    inner_w = max(1.0, outer * 0.0104)
    d.ellipse(
        [cx - inner_r, cy - inner_r, cx + inner_r, cy + inner_r],
        outline=_blend(tint, 0.35),
        width=int(round(inner_w)),
    )

    # Needle: a rhombus split at the hub. North accent, south muted tint. Reads
    # as a compass at 48px in a way a plain bar does not.
    needle_len = outer * 0.44
    needle_w = outer * 0.115
    half = needle_w / 2

    d.polygon([(cx, cy - needle_len), (cx - half, cy), (cx + half, cy)], fill=accent)
    d.polygon(
        [(cx, cy + needle_len), (cx - half, cy), (cx + half, cy)],
        fill=_blend(tint, 0.55),
    )

    hub_r = outer * 0.045
    d.ellipse([cx - hub_r, cy - hub_r, cx + hub_r, cy + hub_r], fill=tint)

    return img.resize((size, size), Image.LANCZOS)


def composite(size: int, scale: float, background=TEAL) -> Image.Image:
    """The mark over a solid square background."""
    base = Image.new("RGBA", (size, size), background)
    base.alpha_composite(draw_mark(size, scale))
    return base


def rounded_square(size: int, scale: float, radius_ratio: float = 0.22) -> Image.Image:
    """Legacy launcher icon: mark on a rounded teal square."""
    px = size * SS
    mask = Image.new("L", (px, px), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, px - 1, px - 1], radius=int(px * radius_ratio), fill=255
    )
    mask = mask.resize((size, size), Image.LANCZOS)

    icon = composite(size, scale)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(icon, (0, 0), mask)
    return out


def circle_icon(size: int, scale: float) -> Image.Image:
    px = size * SS
    mask = Image.new("L", (px, px), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, px - 1, px - 1], fill=255)
    mask = mask.resize((size, size), Image.LANCZOS)

    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(composite(size, scale), (0, 0), mask)
    return out


def feature_graphic(width: int = 1024, height: int = 500) -> Image.Image:
    """Google Play feature graphic: brand mark on a teal field with warm accent.

    Play requires exactly 1024×500. Keep copy out of the art — titles belong in
    the listing text, and baked-in text fails when the Console localises.
    """
    px_w, px_h = width * SS, height * SS
    img = Image.new("RGBA", (px_w, px_h), TEAL)
    d = ImageDraw.Draw(img)

    # Soft warm wash from the lower-right so the field is not a flat slab.
    wash = Image.new("RGBA", (px_w, px_h), (0, 0, 0, 0))
    wd = ImageDraw.Draw(wash)
    for i in range(40):
        t = i / 39
        alpha = int(28 * (1 - t))
        r = int(min(px_w, px_h) * (0.35 + 0.9 * t))
        cx, cy = int(px_w * 0.82), int(px_h * 0.7)
        color = (ACCENT[0], ACCENT[1], ACCENT[2], alpha)
        wd.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color)
    img = Image.alpha_composite(img, wash)

    # Compass mark centred, sized for the short edge.
    mark_size = int(min(width, height) * 0.72)
    mark = draw_mark(mark_size, ICON_SCALE)
    mark = mark.resize((mark_size * SS, mark_size * SS), Image.LANCZOS)
    x = (px_w - mark.width) // 2
    y = (px_h - mark.height) // 2
    img.alpha_composite(mark, (x, y))

    # Thin accent rule under the mark — reads as a horizon, not a sticker.
    rule_y = y + mark.height + int(px_h * 0.04)
    rule_half = int(px_w * 0.08)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle(
        [px_w // 2 - rule_half, rule_y, px_w // 2 + rule_half, rule_y + int(6 * SS)],
        radius=int(3 * SS),
        fill=ACCENT,
    )

    return img.resize((width, height), Image.LANCZOS)


def save(img: Image.Image, path: Path, fmt: str = "PNG") -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    if fmt == "WEBP":
        img.save(path, "WEBP", lossless=True, quality=100, method=6)
    else:
        img.save(path, "PNG")
    print(f"  {path.relative_to(ROOT)}")


def main() -> None:
    print("Masters ->")
    # Full-bleed square icon. iOS and store listings use this.
    save(composite(1024, ICON_SCALE), ASSETS / "icon.png")
    # Adaptive foreground: mark must sit inside the inner 66% safe zone, so the
    # ring occupies ADAPTIVE_SCALE of the 108dp canvas.
    save(draw_mark(1024, ADAPTIVE_SCALE), ASSETS / "adaptive-icon.png")
    # Monochrome (themed icons, Android 13+): single colour, no background.
    save(draw_mark(1024, ADAPTIVE_SCALE, tint=WHITE, accent=WHITE), ASSETS / "monochrome-icon.png")
    # Android 12 splash: the animated icon canvas is 288dp with a 192dp content
    # circle, so the mark occupies two thirds at most.
    save(draw_mark(1024, SPLASH_SCALE), ASSETS / "splash-icon.png")
    save(composite(1024, ICON_SCALE), ASSETS / "favicon.png")

    print("Android mipmaps ->")
    for density, px in MIPMAP_DENSITIES.items():
        save(rounded_square(px, ICON_SCALE), RES / f"mipmap-{density}" / "ic_launcher.webp", "WEBP")
        save(circle_icon(px, ICON_SCALE), RES / f"mipmap-{density}" / "ic_launcher_round.webp", "WEBP")

    print("Adaptive + splash layers ->")
    for density, px in ADAPTIVE_DENSITIES.items():
        save(draw_mark(px, ADAPTIVE_SCALE), RES / f"drawable-{density}" / "ic_launcher_foreground.png")
        save(
            draw_mark(px, ADAPTIVE_SCALE, tint=WHITE, accent=WHITE),
            RES / f"drawable-{density}" / "ic_launcher_monochrome.png",
        )
        # Splash icon canvas is 288dp; scale the adaptive px (108dp) by 288/108.
        splash_px = int(px * 288 / 108)
        save(draw_mark(splash_px, SPLASH_SCALE), RES / f"drawable-{density}" / "splash_icon.png")

    print("Store listing ->")
    save(composite(512, ICON_SCALE), STORE / "icon-512.png")
    save(composite(1024, ICON_SCALE), STORE / "icon-1024.png")
    save(feature_graphic(1024, 500), STORE / "feature-graphic.png")


if __name__ == "__main__":
    main()
    print("\nDone. Rebuild the Android app to pick up the new resources.")
