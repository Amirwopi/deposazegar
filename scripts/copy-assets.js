const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const processAssets = require('./process-assets');

const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.join(projectRoot, 'public_html_ready');

const copyFile = (source, destination) => {
  if (!fs.existsSync(source)) {
    throw new Error(`Required build asset is missing: ${source}`);
  }
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
};

const copyDirectory = (source, destination) => {
  if (!fs.existsSync(source)) {
    throw new Error(`Required asset directory is missing: ${source}`);
  }
  fs.cpSync(source, destination, { recursive: true });
};

async function copyAssets() {
  await processAssets();

  copyFile(
    path.join(projectRoot, 'assets', 'js', 'main.js'),
    path.join(outputDir, 'assets', 'js', 'main.js')
  );
  copyDirectory(
    path.join(projectRoot, 'assets', 'images'),
    path.join(outputDir, 'assets', 'images')
  );
  copyDirectory(
    path.join(projectRoot, 'assets', 'fonts'),
    path.join(outputDir, 'assets', 'fonts')
  );
  copyFile(
    path.join(projectRoot, 'robots.txt'),
    path.join(outputDir, 'robots.txt')
  );
  copyFile(
    path.join(projectRoot, '.htaccess'),
    path.join(outputDir, '.htaccess')
  );
  for (const favicon of ['favicon.ico', 'favicon-96.png', 'apple-touch-icon.png']) {
    copyFile(
      path.join(projectRoot, 'assets', 'images', favicon),
      path.join(outputDir, favicon)
    );
  }
  copyDirectory(
    path.join(projectRoot, 'server', 'api'),
    path.join(outputDir, 'api')
  );
  copyDirectory(
    path.join(projectRoot, 'server', 'admin'),
    path.join(outputDir, 'admin')
  );
  copyDirectory(
    path.join(projectRoot, 'server', 'storage'),
    path.join(outputDir, 'storage')
  );
  fs.writeFileSync(
    path.join(outputDir, 'storage', '.admin-setup-token'),
    crypto.randomBytes(24).toString('hex'),
    { encoding: 'utf8', mode: 0o600 }
  );

  console.log('Copied hosting assets, comment API/admin, protected setup token, robots.txt and .htaccess.');
}

copyAssets().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
