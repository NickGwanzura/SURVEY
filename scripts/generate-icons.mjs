// Generate PWA icons from an inline SVG using sharp.
// Run: node scripts/generate-icons.mjs

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname;
const ICONS_DIR = join(ROOT, "public", "icons");
const FAVICON_ICO = join(ROOT, "public", "favicon.ico");
const APPLE_TOUCH_ICON = join(ROOT, "public", "apple-touch-icon.png");

const BRAND = "#0d4f3c"; // brand-600
const FOREGROUND = "#ffffff";
const ACCENT = "#10b981"; // brand-500

function brandSvg({ size, padded = false }) {
  // padded=true → maskable-safe (10% safe-zone padding)
  const inset = padded ? size * 0.1 : 0;
  const inner = size - inset * 2;
  const fontSize = inner * 0.32;
  const subSize = inner * 0.11;
  const cx = size / 2;
  const cy = size / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BRAND}" />
  <circle cx="${cx}" cy="${cy - inner * 0.05}" r="${inner * 0.42}" fill="${ACCENT}" opacity="0.18" />
  <text x="${cx}" y="${cy + fontSize * 0.18}"
        font-family="Helvetica, Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="700"
        fill="${FOREGROUND}"
        text-anchor="middle"
        letter-spacing="-2">RAC</text>
  <text x="${cx}" y="${cy + fontSize * 0.18 + subSize * 1.6}"
        font-family="Helvetica, Arial, sans-serif"
        font-size="${subSize}"
        font-weight="500"
        fill="${FOREGROUND}"
        opacity="0.85"
        text-anchor="middle"
        letter-spacing="2">ZIMBABWE</text>
</svg>`;
}

async function renderPng(svg, size, outPath) {
  const buf = Buffer.from(svg);
  await sharp(buf)
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  console.log(`  wrote ${outPath} (${size}x${size})`);
}

async function main() {
  await mkdir(ICONS_DIR, { recursive: true });

  // Standard
  await renderPng(brandSvg({ size: 192 }), 192, join(ICONS_DIR, "icon-192.png"));
  await renderPng(brandSvg({ size: 512 }), 512, join(ICONS_DIR, "icon-512.png"));

  // Maskable (10% safe-zone padding)
  await renderPng(
    brandSvg({ size: 192, padded: true }),
    192,
    join(ICONS_DIR, "icon-maskable-192.png"),
  );
  await renderPng(
    brandSvg({ size: 512, padded: true }),
    512,
    join(ICONS_DIR, "icon-maskable-512.png"),
  );

  // Apple touch icon (180x180, no padding — Apple applies its own mask)
  await renderPng(brandSvg({ size: 180 }), 180, APPLE_TOUCH_ICON);

  // Favicon (32x32 PNG written into a multi-size .ico via sharp's PNG fallback;
  // most browsers accept a PNG with an .ico extension. Write 32 + replace.)
  await renderPng(brandSvg({ size: 32 }), 32, FAVICON_ICO);

  // Save the source SVG too for future regeneration / customisation
  await writeFile(join(ICONS_DIR, "icon-source.svg"), brandSvg({ size: 512 }));
  console.log("  wrote source SVG");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
