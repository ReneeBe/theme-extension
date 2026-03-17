import sharp from "sharp";
import { writeFileSync, mkdirSync } from "fs";

// SVG icon: sparkle wand with pink→purple gradient
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f72585"/>
      <stop offset="100%" stop-color="#7209b7"/>
    </linearGradient>
    <linearGradient id="spark" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="1"/>
      <stop offset="100%" stop-color="#e0aaff" stop-opacity="0.9"/>
    </linearGradient>
  </defs>

  <!-- Background rounded square -->
  <rect width="128" height="128" rx="28" fill="url(#bg)"/>

  <!-- Large sparkle (center) -->
  <g transform="translate(64,56)" fill="url(#spark)">
    <polygon points="0,-22 4,-4 22,0 4,4 0,22 -4,4 -22,0 -4,-4" opacity="1"/>
  </g>

  <!-- Small sparkle (top-right) -->
  <g transform="translate(94,26)" fill="white" opacity="0.85">
    <polygon points="0,-10 2,-2 10,0 2,2 0,10 -2,2 -10,0 -2,-2"/>
  </g>

  <!-- Tiny sparkle (bottom-left) -->
  <g transform="translate(36,92)" fill="white" opacity="0.6">
    <polygon points="0,-7 1.5,-1.5 7,0 1.5,1.5 0,7 -1.5,1.5 -7,0 -1.5,-1.5"/>
  </g>
</svg>`;

mkdirSync("public/icons", { recursive: true });

const sizes = [16, 48, 128];

for (const size of sizes) {
  const buf = Buffer.from(svg);
  await sharp(buf, { density: 192 })
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon${size}.png`);
  console.log(`✓ icon${size}.png`);
}
