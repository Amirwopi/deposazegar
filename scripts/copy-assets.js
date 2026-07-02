const fs = require('fs');
const path = require('path');
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

  console.log('Copied hosting assets, robots.txt and .htaccess to public_html_ready/.');
}

copyAssets().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
