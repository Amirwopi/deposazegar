const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, '..', 'assets', 'images');
const imageNewDir = path.join(__dirname, '..', 'assets', 'image-new');
const managedImages = [
  ['home-storage-intro', 'صفحه اصلی معرفی انبار.jpg'],
  ['container-10-foot-storage', 'container-10-foot-storage.jpg'],
  ['container-15-foot-storage', 'container-15-foot-storage.png'],
  ['container-20-foot-storage', 'container-20-foot-storage.jpg'],
  ['container-40-foot-storage', 'container-40-foot-storage.jpg'],
  ['support-team', 'support.jpg'],
  ['packing-service', 'بسته-بندی.jpg'],
  ['packing-service-detail', 'بسته-بندی-2.jpg'],
  ['packing-service-boxes', 'بسته-بندی-3.jpg'],
  ['packing-service-materials', 'بسته-بندی-4.jpg'],
  ['transport-service', 'حمل-نقل.jpg'],
  ['transport-service-detail', 'حمل-نقل-2.jpg'],
  ['transport-service-loading', 'حمل-نقل-3.jpg'],
  ['arrangement-service', 'چیدمان.jpg'],
  ['arrangement-service-detail', 'چیدمان-1.jpg'],
  ['arrangement-service-warehouse', 'چیدمان-2.jpg'],
  ['warehouse-intro', 'معرفی انبار.jpg'],
  ['warehouse-intro-detail', 'معرفی-انبار.jpg'],
  ['warehouse-intro-west', 'معرفی انبار-3.jpg'],
  ['warehouse-intro-south', 'معرفی انبار-4.jpg'],
  ['vip-lock-icon', 'قفل وی ای پی .jpg']
];

const legacyImages = [
  'container-storage-tehran',
  'ejare-anbar-containeri',
  'container-storage-unit-tehran',
  'container-open-storage',
  'warehouse-shelving-storage',
  'depo-lavazem-khaneh',
  'warehouse-storage-tehran',
  'container-office-storage',
  'indoor-warehouse-tehran',
  'commercial-warehouse-storage',
  'storage-loading-area'
];

async function processAssets() {
  for (const [filename, sourceName] of managedImages) {
    const input = path.join(imageNewDir, sourceName);
    if (!fs.existsSync(input)) {
      throw new Error(`Missing image-new asset: ${sourceName}`);
    }
    const base = sharp(input, { autoOrient: true });
    await base.clone()
      .jpeg({ quality: 86, progressive: true, mozjpeg: true })
      .toFile(path.join(imagesDir, `${filename}.jpg`));
    await base.clone()
      .webp({ quality: 82, smartSubsample: true, effort: 5 })
      .toFile(path.join(imagesDir, `${filename}.webp`));
  }

  for (const filename of legacyImages) {
    const input = path.join(imagesDir, `${filename}.jpg`);
    if (!fs.existsSync(input)) continue;
    await sharp(input, { autoOrient: true })
      .webp({ quality: 82, smartSubsample: true, effort: 5 })
      .toFile(path.join(imagesDir, `${filename}.webp`));
  }

  const ogOverlay = Buffer.from(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="shade" x1="0" x2="1">
          <stop offset="0" stop-color="#0f2742" stop-opacity=".96"/>
          <stop offset=".68" stop-color="#0f2742" stop-opacity=".56"/>
          <stop offset="1" stop-color="#0f2742" stop-opacity=".2"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#shade)"/>
      <text x="1080" y="250" text-anchor="end" fill="#ffffff" font-family="Tahoma, sans-serif" font-size="70" font-weight="700">دپو سازگار</text>
      <text x="1080" y="345" text-anchor="end" fill="#f59e0b" font-family="Tahoma, sans-serif" font-size="40" font-weight="700">مجموعه انبارهای کانتینری</text>
      <text x="1080" y="410" text-anchor="end" fill="#ffffff" font-family="Tahoma, sans-serif" font-size="34" font-weight="700">استان تهران و استان البرز</text>
    </svg>
  `);

  const ogBase = sharp(path.join(imagesDir, 'home-storage-intro.jpg'))
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .composite([{ input: ogOverlay }]);

  await ogBase.clone().jpeg({ quality: 88, progressive: true }).toFile(path.join(imagesDir, 'og-cover.jpg'));
  await ogBase.clone().webp({ quality: 84, effort: 5 }).toFile(path.join(imagesDir, 'og-cover.webp'));

  const faviconPng = await sharp(path.join(imagesDir, 'vip-lock-icon.jpg'), { autoOrient: true })
    .resize(96, 96, { fit: 'cover', position: 'centre' })
    .png({ compressionLevel: 9 })
    .toBuffer();
  fs.writeFileSync(path.join(imagesDir, 'favicon-96.png'), faviconPng);

  const faviconSvg = `<svg width="96" height="96" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="20" x2="80" y1="10" y2="86" gradientUnits="userSpaceOnUse"><stop stop-color="#0f2742"/><stop offset="1" stop-color="#1d6fa5"/></linearGradient></defs><rect width="96" height="96" rx="23" fill="url(#g)"/><path d="M28 49V37c0-11.2 8.8-20 20-20s20 8.8 20 20v12" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/><rect x="22" y="44" width="52" height="36" rx="9" fill="#f59e0b"/><path d="M48 54v13" stroke="#0f2742" stroke-width="7" stroke-linecap="round"/><circle cx="48" cy="54" r="5" fill="#0f2742"/><text x="48" y="91" text-anchor="middle" fill="#fff" font-family="Tahoma, sans-serif" font-size="14" font-weight="700">VIP</text></svg>`;
  fs.writeFileSync(path.join(imagesDir, 'favicon.svg'), faviconSvg, 'utf8');

  const svgFaviconPng = await sharp(Buffer.from(faviconSvg), { density: 384 })
    .resize(96, 96)
    .png({ compressionLevel: 9 })
    .toBuffer();

  const icoHeader = Buffer.alloc(22);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(1, 4);
  icoHeader.writeUInt8(96, 6);
  icoHeader.writeUInt8(96, 7);
  icoHeader.writeUInt8(0, 8);
  icoHeader.writeUInt8(0, 9);
  icoHeader.writeUInt16LE(1, 10);
  icoHeader.writeUInt16LE(32, 12);
  icoHeader.writeUInt32LE(svgFaviconPng.length, 14);
  icoHeader.writeUInt32LE(22, 18);
  fs.writeFileSync(path.join(imagesDir, 'favicon.ico'), Buffer.concat([icoHeader, svgFaviconPng]));

  await sharp(path.join(imagesDir, 'vip-lock-icon.jpg'), { autoOrient: true })
    .resize(180, 180, { fit: 'cover', position: 'centre' })
    .resize(180, 180)
    .png({ compressionLevel: 9 })
    .toFile(path.join(imagesDir, 'apple-touch-icon.png'));

  const results = [];
  for (const [filename] of managedImages) {
    const jpg = fs.statSync(path.join(imagesDir, `${filename}.jpg`)).size;
    const webp = fs.statSync(path.join(imagesDir, `${filename}.webp`)).size;
    results.push(`${filename}.webp: ${webp} bytes (${Math.round((1 - webp / jpg) * 100)}% smaller)`);
  }
  console.log(results.join('\n'));
  console.log('Created social images, favicon.ico, favicon-96.png and apple-touch-icon.png.');
}

module.exports = processAssets;

if (require.main === module) {
  processAssets().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
