import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const brandingDir = path.resolve(process.cwd(), 'public', 'assets', 'branding');
fs.mkdirSync(brandingDir, { recursive: true });

// 1. Official Full Horizontal Logo SVG (White Background, Navy #123B67, Blue #1685B8, Teal #19B7A5)
const fullLogoSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 140" width="560" height="140">
  <rect width="560" height="140" rx="16" fill="#FFFFFF"/>
  <!-- Outer Shield & Emblem Ring -->
  <g transform="translate(18, 14)">
    <circle cx="56" cy="56" r="52" fill="#EAF5FC" stroke="#123B67" stroke-width="4"/>
    <circle cx="56" cy="56" r="44" fill="#FFFFFF" stroke="#1685B8" stroke-width="2" stroke-dasharray="5 3"/>
    <!-- Medical Shield Base -->
    <path d="M56 18 L86 30 V54 C86 76 72 91 56 98 C40 91 26 76 26 54 V30 Z" fill="#123B67"/>
    <!-- Healing Cross inside Shield -->
    <path d="M56 32 V76 M34 54 H78" stroke="#19B7A5" stroke-width="11" stroke-linecap="round"/>
    <!-- ECG Pulse Line -->
    <path d="M30 54 H44 L49 41 L56 68 L63 46 L67 54 H82" fill="none" stroke="#FFFFFF" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
    <!-- Caring Arc at Bottom -->
    <path d="M32 82 Q56 98 80 82" fill="none" stroke="#19B7A5" stroke-width="3.5" stroke-linecap="round"/>
  </g>
  <!-- Hospital Name & Typography -->
  <text x="144" y="66" font-family="'Plus Jakarta Sans', 'Segoe UI', Arial, sans-serif" font-size="40" font-weight="800" fill="#123B67" letter-spacing="0.5">GOKUL HOSPITAL</text>
  <rect x="144" y="78" width="388" height="3" rx="1.5" fill="#19B7A5"/>
  <text x="144" y="103" font-family="'Public Sans', 'Segoe UI', Arial, sans-serif" font-size="16" font-weight="700" fill="#1685B8" letter-spacing="2.2">MULTI-SPECIALTY HEALTHCARE &amp; DIAGNOSTICS</text>
</svg>`;

// 2. Official Emblem-Only Icon SVG
const emblemSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <rect width="128" height="128" rx="24" fill="#FFFFFF"/>
  <circle cx="64" cy="64" r="56" fill="#EAF5FC" stroke="#123B67" stroke-width="5"/>
  <path d="M64 20 L100 34 V62 C100 88 83 106 64 114 C45 106 28 88 28 62 V34 Z" fill="#123B67"/>
  <path d="M64 36 V88 M38 62 H90" stroke="#19B7A5" stroke-width="13" stroke-linecap="round"/>
  <path d="M34 62 H50 L56 46 L64 78 L72 52 L77 62 H94" fill="none" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

fs.writeFileSync(path.join(brandingDir, 'gokul-hospital-logo.svg'), fullLogoSvg, 'utf8');
fs.writeFileSync(path.join(brandingDir, 'gokul-hospital-icon.svg'), emblemSvg, 'utf8');

// Pure Node PNG generator (creates valid RGBA PNGs with the exact Gokul Hospital Navy/Teal/White emblem & bar)
function crc32(buf: Buffer): number {
  let c = -1;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ crcTable[(c ^ buf[i]) & 0xff];
  }
  return (c ^ -1) >>> 0;
}
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function makeChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createHospitalEmblemPng(width: number, height: number, isFullBanner = false): Buffer {
  const raw = Buffer.alloc(height * (1 + width * 4));
  const cx = isFullBanner ? Math.floor(height * 0.5) : Math.floor(width * 0.5);
  const cy = Math.floor(height * 0.5);
  const outerR = Math.floor(Math.min(cx, cy) * 0.82);
  const innerR = Math.floor(outerR * 0.78);
  const crossArm = Math.floor(innerR * 0.58);
  const crossThick = Math.max(2, Math.floor(innerR * 0.24));

  for (let y = 0; y < height; y++) {
    const rowStart = y * (1 + width * 4);
    raw[rowStart] = 0; // filter type 0
    for (let x = 0; x < width; x++) {
      const idx = rowStart + 1 + x * 4;
      // Default White Background (#FFFFFF)
      let r = 255, g = 255, b = 255, a = 255;

      // Subtle border
      if (x < 2 || x >= width - 2 || y < 2 || y >= height - 2) {
        r = 234; g = 245; b = 252; // #EAF5FC
      }

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= outerR && dist >= innerR) {
        // Navy Blue Ring (#123B67)
        r = 18; g = 59; b = 103;
      } else if (dist < innerR) {
        // Navy Blue Shield core (#123B67)
        r = 18; g = 59; b = 103;
        // Teal Medical Cross (#19B7A5)
        if (
          (Math.abs(dx) <= crossThick && Math.abs(dy) <= crossArm) ||
          (Math.abs(dy) <= crossThick && Math.abs(dx) <= crossArm)
        ) {
          r = 25; g = 183; b = 165;
        }
        // White center pulse line
        if (Math.abs(dy) <= Math.max(1, Math.floor(crossThick * 0.28)) && Math.abs(dx) <= crossArm * 0.85) {
          r = 255; g = 255; b = 255;
        }
      }

      // If full banner logo, draw structured Navy & Teal brand bars on the right side
      if (isFullBanner && x > height + 12 && x < width - 20) {
        if (y >= Math.floor(height * 0.26) && y <= Math.floor(height * 0.48)) {
          // Navy Blue Title Block (#123B67)
          r = 18; g = 59; b = 103;
        } else if (y >= Math.floor(height * 0.55) && y <= Math.floor(height * 0.60)) {
          // Healthcare Teal Accent Rule (#19B7A5)
          r = 25; g = 183; b = 165;
        } else if (y >= Math.floor(height * 0.67) && y <= Math.floor(height * 0.76) && x < width - 60) {
          // Medical Blue Subtitle Bar (#1685B8)
          r = 22; g = 133; b = 184;
        }
      }

      raw[idx] = r;
      raw[idx + 1] = g;
      raw[idx + 2] = b;
      raw[idx + 3] = a;
    }
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const idat = zlib.deflateSync(raw);
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

// Write all required PNG sizes and backup
const fullPng = createHospitalEmblemPng(420, 110, true);
fs.writeFileSync(path.join(brandingDir, 'gokul-hospital-logo.png'), fullPng);
fs.writeFileSync(path.join(brandingDir, 'gokul-hospital-logo-backup.png'), fullPng);

const icon64 = createHospitalEmblemPng(64, 64, false);
fs.writeFileSync(path.join(brandingDir, 'gokul-hospital-icon.png'), icon64);
fs.writeFileSync(path.resolve(process.cwd(), 'public', 'favicon.ico'), createHospitalEmblemPng(32, 32, false));
fs.writeFileSync(path.resolve(process.cwd(), 'public', 'favicon.png'), createHospitalEmblemPng(32, 32, false));
fs.writeFileSync(path.join(brandingDir, 'favicon-32x32.png'), createHospitalEmblemPng(32, 32, false));
fs.writeFileSync(path.join(brandingDir, 'favicon-48x48.png'), createHospitalEmblemPng(48, 48, false));
fs.writeFileSync(path.join(brandingDir, 'apple-touch-icon.png'), createHospitalEmblemPng(180, 180, false));
fs.writeFileSync(path.join(brandingDir, 'icon-192x192.png'), createHospitalEmblemPng(192, 192, false));
fs.writeFileSync(path.join(brandingDir, 'icon-512x512.png'), createHospitalEmblemPng(512, 512, false));

const manifest = {
  name: 'GOKUL HOSPITAL — Multi-Specialty Hospital & Healthcare Management System',
  short_name: 'GOKUL HOSPITAL',
  description: 'Official Multi-Specialty Hospital Website, Online Appointment Booking & Role-Protected Healthcare Portals for Gokul Hospital.',
  start_url: '/',
  display: 'standalone',
  background_color: '#FFFFFF',
  theme_color: '#123B67',
  icons: [
    {
      src: '/assets/branding/favicon-32x32.png',
      sizes: '32x32',
      type: 'image/png',
    },
    {
      src: '/assets/branding/favicon-48x48.png',
      sizes: '48x48',
      type: 'image/png',
    },
    {
      src: '/assets/branding/apple-touch-icon.png',
      sizes: '180x180',
      type: 'image/png',
    },
    {
      src: '/assets/branding/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable',
    },
    {
      src: '/assets/branding/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable',
    },
  ],
};

fs.writeFileSync(
  path.resolve(process.cwd(), 'public', 'manifest.webmanifest'),
  JSON.stringify(manifest, null, 2),
  'utf8'
);

console.log('✓ Official Gokul Hospital branding assets, favicons, and webmanifest generated.');
