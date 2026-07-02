const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const outputDir = path.resolve(projectRoot, 'public_html_ready');

if (path.dirname(outputDir) !== projectRoot) {
  throw new Error(`Refusing to clean unexpected path: ${outputDir}`);
}

fs.rmSync(outputDir, { recursive: true, force: true });

for (const directory of [
  outputDir,
  path.join(outputDir, 'assets', 'css'),
  path.join(outputDir, 'assets', 'js'),
  path.join(outputDir, 'assets', 'images'),
  path.join(outputDir, 'assets', 'fonts')
]) {
  fs.mkdirSync(directory, { recursive: true });
}

console.log('Cleaned and prepared public_html_ready/.');
