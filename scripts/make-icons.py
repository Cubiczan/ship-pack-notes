"""Draw the Ship Pack Notes icon set. Run from the repo root: python3 scripts/make-icons.py"""

from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1] / "assets" / "images"
BG = (16, 20, 18, 255)
PAPER = (243, 237, 224, 255)
INK = (28, 25, 21, 255)
AMBER = (230, 162, 60, 255)
SERIF = "/usr/share/fonts/truetype/noto/NotoSerif-Bold.ttf"
MONO = "/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Medium.ttf"


def punch(image: Image.Image, boxes: list[tuple[int, int, int, int]]) -> None:
    mask = Image.new("L", image.size, 255)
    draw = ImageDraw.Draw(mask)
    for box in boxes:
        draw.ellipse(box, fill=0)
    alpha = ImageChops.multiply(image.getchannel("A"), mask)
    image.putalpha(alpha)


def ticket(size: int, opaque_bg: bool) -> Image.Image:
    image = Image.new("RGBA", (size, size), BG if opaque_bg else (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    margin = int(size * 0.18)
    top = int(size * 0.24)
    bottom = int(size * 0.78)
    radius = int(size * 0.045)
    draw.rounded_rectangle((margin, top, size - margin, bottom), radius=radius, fill=PAPER)

    hole_r = int(size * 0.028)
    cx = margin
    holes = []
    for cy in (int(size * 0.40), int(size * 0.62)):
        holes.append((cx - hole_r, cy - hole_r, cx + hole_r, cy + hole_r))
    if opaque_bg:
        for box in holes:
            draw.ellipse(box, fill=BG)
    else:
        punch(image, holes)
        draw = ImageDraw.Draw(image)

    bar_left = margin + int(size * 0.055)
    bar_right = bar_left + int(size * 0.028)
    draw.rounded_rectangle(
        (bar_left, top + int(size * 0.05), bar_right, bottom - int(size * 0.05)),
        radius=int(size * 0.01),
        fill=AMBER,
    )

    letters = ImageFont.truetype(SERIF, int(size * 0.26))
    text = "SP"
    box = draw.textbbox((0, 0), text, font=letters)
    text_w = box[2] - box[0]
    text_h = box[3] - box[1]
    text_x = bar_right + int(size * 0.04)
    text_y = (top + bottom) / 2 - text_h / 2 - box[1]
    draw.text((text_x, text_y), text, font=letters, fill=INK)

    mono = ImageFont.truetype(MONO, int(size * 0.032))
    label = "NOTES"
    label_box = draw.textbbox((0, 0), label, font=mono)
    label_w = label_box[2] - label_box[0]
    draw.text(
        (size - margin - label_w - int(size * 0.04), bottom - int(size * 0.07)),
        label,
        font=mono,
        fill=(92, 86, 76, 255),
    )
    return image


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    icon = ticket(1024, opaque_bg=True)
    icon.save(ROOT / "icon.png")
    ticket(1024, opaque_bg=False).save(ROOT / "android-icon-foreground.png")
    ticket(1024, opaque_bg=False).save(ROOT / "splash-icon.png")

    mono = ticket(1024, opaque_bg=False)
    white = Image.new("RGBA", mono.size, (0, 0, 0, 0))
    alpha = mono.getchannel("A")
    white.paste((255, 255, 255, 255), mask=alpha)
    white.save(ROOT / "android-icon-monochrome.png")

    icon.resize((192, 192), Image.Resampling.LANCZOS).save(ROOT / "favicon.png")


if __name__ == "__main__":
    main()
