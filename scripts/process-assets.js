const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imagesDir = path.join(__dirname, '..', 'assets', 'images');
const sourceImages = [
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
  'storage-loading-area',
  'container-20-foot-storage'
];

async function processAssets() {
  for (const filename of sourceImages) {
    const input = path.join(imagesDir, `${filename}.jpg`);
    const output = path.join(imagesDir, `${filename}.webp`);
    await sharp(input, { autoOrient: true })
      .webp({ quality: 82, smartSubsample: true, effort: 5 })
      .toFile(output);
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
      <text x="1080" y="275" text-anchor="end" fill="#ffffff" font-family="Tahoma, sans-serif" font-size="78" font-weight="700">دپو سازگار</text>
      <text x="1080" y="375" text-anchor="end" fill="#f59e0b" font-family="Tahoma, sans-serif" font-size="44" font-weight="700">اجاره انبار و دپو لوازم در تهران</text>
    </svg>
  `);

  const ogBase = sharp(path.join(imagesDir, 'container-storage-tehran.jpg'))
    .resize(1200, 630, { fit: 'cover', position: 'centre' })
    .composite([{ input: ogOverlay }]);

  await ogBase.clone().jpeg({ quality: 88, progressive: true }).toFile(path.join(imagesDir, 'og-cover.jpg'));
  await ogBase.clone().webp({ quality: 84, effort: 5 }).toFile(path.join(imagesDir, 'og-cover.webp'));

  await sharp(path.join(imagesDir, 'favicon.svg'), { density: 288 })
    .resize(180, 180)
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(imagesDir, 'apple-touch-icon.png'));

  const results = [];
  for (const filename of sourceImages) {
    const jpg = fs.statSync(path.join(imagesDir, `${filename}.jpg`)).size;
    const webp = fs.statSync(path.join(imagesDir, `${filename}.webp`)).size;
    results.push(`${filename}.webp: ${webp} bytes (${Math.round((1 - webp / jpg) * 100)}% smaller)`);
  }
  console.log(results.join('\n'));
  console.log('Created og-cover.jpg, og-cover.webp and apple-touch-icon.png.');
}

module.exports = processAssets;

if (require.main === module) {
  processAssets().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
