#!/usr/bin/env node
/**
 * Submit all site URLs to IndexNow API.
 * Must be run AFTER deployment so the key file is accessible at:
 *   https://deposazegar.com/<key>.txt
 *
 * Usage:
 *   node scripts/submit-indexnow.js          # submit all URLs
 *   node scripts/submit-indexnow.js --dry-run # print URLs without submitting
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const INDEXNOW_KEY = '7e011271f48ceca10963307f87c64a7b';
const BASE_URL = 'https://deposazegar.com';
const KEY_LOCATION = `${BASE_URL}/${INDEXNOW_KEY}.txt`;
const DIR = path.join(__dirname, '..', 'public_html_ready');

const dryRun = process.argv.includes('--dry-run');

// Build URL list from built HTML files (recursive for subdirectories)
const { execSync } = require('child_process');
const allFiles = execSync(`find ${DIR} -name '*.html'`, { encoding: 'utf-8' })
  .trim().split('\n').map(f => path.resolve(f));
const urls = allFiles.map(f => {
  const relative = path.relative(DIR, f).replace(/\.html$/, '');
  return relative === 'index' ? `${BASE_URL}/` : `${BASE_URL}/${relative}`;
});

console.log(`IndexNow key: ${INDEXNOW_KEY}`);
console.log(`Key location: ${KEY_LOCATION}`);
console.log(`URLs to submit: ${urls.length}`);

if (dryRun) {
  console.log('\n--- Dry run: URLs ---');
  urls.forEach(u => console.log(u));
  console.log('\nRun without --dry-run to submit.');
  process.exit(0);
}

const body = JSON.stringify({
  host: 'deposazegar.com',
  key: INDEXNOW_KEY,
  keyLocation: KEY_LOCATION,
  urlList: urls
});

const options = {
  hostname: 'api.indexnow.org',
  path: '/IndexNow',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'User-Agent': 'deposazegar/1.0'
  }
};

console.log('\nSubmitting to IndexNow...');

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      console.log('Success: URLs submitted to IndexNow.');
    } else if (res.statusCode === 202) {
      console.log('Accepted: URLs queued for processing.');
    } else if (res.statusCode === 403) {
      console.log('Site verification not completed.');
      console.log('Ensure the key file is live at:', KEY_LOCATION);
      console.log('Response:', data);
    } else {
      console.log('Response:', data || '(empty body)');
    }
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
  process.exit(1);
});

req.write(body);
req.end();