/**
 * Generate sample jewelry images for testing the catalog.
 * Run with: node scripts/create-test-images.js
 */
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const dir = path.join(__dirname, '..', 'images');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const samples = [
  {
    name: 'aurora-pendant.jpg',
    w: 800,
    h: 1000,
    bg: '#1a1a2e',
    fg: '#EFC07B',
    label: 'Aurora Pendant',
  },
  { name: 'celeste-ring.png', w: 900, h: 900, bg: '#16213E', fg: '#f5d89a', label: 'Celeste Ring' },
  {
    name: 'noir-bracelet.jpg',
    w: 1200,
    h: 800,
    bg: '#0F3460',
    fg: '#EFC07B',
    label: 'Noir Bracelet',
  },
  {
    name: 'soleil-earrings.webp',
    w: 800,
    h: 1000,
    bg: '#1A1A2E',
    fg: '#d4a853',
    label: 'Soleil Earrings',
  },
  {
    name: 'lune-necklace.jpg',
    w: 1000,
    h: 1000,
    bg: '#16213E',
    fg: '#EFC07B',
    label: 'Lune Necklace',
  },
  {
    name: 'étoile-brooch.png',
    w: 700,
    h: 900,
    bg: '#0F3460',
    fg: '#f5d89a',
    label: 'Étoile Brooch',
  },
  {
    name: 'riviere-tennis-bracelet.jpg',
    w: 1400,
    h: 900,
    bg: '#1a1a2e',
    fg: '#EFC07B',
    label: 'Rivière Tennis Bracelet',
  },
  {
    name: 'mesmerise-cocktail-ring.png',
    w: 900,
    h: 1200,
    bg: '#16213E',
    fg: '#d4a853',
    label: 'Mesmerise Cocktail Ring',
  },
];

async function create() {
  for (const s of samples) {
    const svg = `<svg width="${s.w}" height="${s.h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${s.bg}"/>
      <circle cx="50%" cy="45%" r="${Math.min(s.w, s.h) * 0.28}" fill="none" stroke="${s.fg}" stroke-width="2" opacity="0.6"/>
      <circle cx="50%" cy="45%" r="${Math.min(s.w, s.h) * 0.18}" fill="none" stroke="${s.fg}" stroke-width="1" opacity="0.3"/>
      <circle cx="50%" cy="45%" r="${Math.min(s.w, s.h) * 0.08}" fill="${s.fg}" opacity="0.15"/>
      <text x="50%" y="82%" text-anchor="middle" font-family="Georgia,serif" font-size="${Math.min(s.w, s.h) * 0.045}" fill="${s.fg}" opacity="0.7" letter-spacing="4">${s.label}</text>
    </svg>`;

    const outPath = path.join(dir, s.name);
    const ext = path.extname(s.name).toLowerCase();

    if (ext === '.jpg' || ext === '.jpeg') {
      await sharp(Buffer.from(svg)).jpeg({ quality: 90 }).toFile(outPath);
    } else if (ext === '.png') {
      await sharp(Buffer.from(svg)).png().toFile(outPath);
    } else if (ext === '.webp') {
      await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(outPath);
    }

    console.log(`  created: ${s.name}  (${s.w}x${s.h})`);
  }
  console.log(`\n  ${samples.length} test images ready in ./images/\n`);
}

create().catch(console.error);
