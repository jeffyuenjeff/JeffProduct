#!/usr/bin/env node
/**
 * pull-cloud.js
 * Downloads the latest data from JSONBin.io bins back to local data files.
 * Bin IDs are hardcoded below (same as CLOUD config in app.js).
 *
 * Usage:
 *   npm run cloud:pull            ← reads key from .env file automatically
 *   npm run cloud:pull -- --all   ← pull all 3 bins (default)
 *   npm run cloud:pull -- --plan  ← pull plan only
 */

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const ROOT     = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'public', 'data');
const ENV_FILE = path.join(ROOT, '.env');

// ── Hardcoded bin IDs (same as CLOUD.bins in app.js) ──
const BINS = {
  plan:      { id: '69cd2d2d856a682189ed43b2', file: 'plan.json',      label: 'Plan' },
  reminders: { id: '69cd2d2e36566621a86cd18e', file: 'reminders.json', label: 'Reminders' },
  locpins:   { id: '69cd2d2e36566621a86cd197', file: 'locpins.json',   label: 'LocPins' }
};

// ── Read .env file for JSONBIN_KEY ──
function loadEnv() {
  if (!fs.existsSync(ENV_FILE)) return;
  const lines = fs.readFileSync(ENV_FILE, 'utf8').split('\n');
  for (const line of lines) {
    const m = line.match(/^\s*([\w]+)\s*=\s*(.*?)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

function httpsGet(url, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = https.request({ hostname: u.hostname, path: u.pathname + u.search, method: 'GET', headers }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function pullBin(accessKey, binId, localFile) {
  const result = await httpsGet(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
    'X-Access-Key': accessKey
  });
  if (result.status === 200 && result.body.record) {
    const json = JSON.stringify(result.body.record, null, 2);
    const dest = path.join(DATA_DIR, localFile);
    fs.writeFileSync(dest, json, 'utf8');
    return json.length;
  }
  throw new Error(`Failed to pull ${localFile}: HTTP ${result.status} – ${JSON.stringify(result.body).slice(0, 200)}`);
}

async function main() {
  loadEnv();

  const accessKey = process.env.JSONBIN_KEY;
  if (!accessKey) {
    console.error('❌ No JSONBin access key found.');
    console.error('   Fix: create a .env file in the project root with:');
    console.error('   JSONBIN_KEY=your_access_key_here\n');
    process.exit(1);
  }

  // Parse which bins to pull (default: all)
  const args = process.argv.slice(2).map(a => a.replace(/^-+/, '').toLowerCase());
  const pullAll = args.length === 0 || args.includes('all');
  const targets = pullAll
    ? Object.values(BINS)
    : Object.entries(BINS)
        .filter(([k]) => args.includes(k))
        .map(([, v]) => v);

  if (targets.length === 0) {
    console.error('❌ No valid targets. Use: --all, --plan, --reminders, --locpins');
    process.exit(1);
  }

  console.log('📥 Pulling cloud data to local files...\n');

  for (const { id, file, label } of targets) {
    process.stdout.write(`   ${label} (${id})...`);
    const bytes = await pullBin(accessKey, id, file);
    console.log(` ✅  ${file} (${(bytes / 1024).toFixed(1)} KB)`);
  }

  console.log('\n✅ All files updated in public/data/');
  console.log('🏗  Now rebuild: npm run build:static\n');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
