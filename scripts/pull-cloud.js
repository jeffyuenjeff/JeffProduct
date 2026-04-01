#!/usr/bin/env node
/**
 * pull-cloud.js
 * Downloads the latest data from JSONBin.io bins back to local data files.
 * Use this to pull changes made by others online back into your local project.
 *
 * Usage:
 *   node scripts/pull-cloud.js <JSONBIN_ACCESS_KEY> <PLAN_BIN_ID> <REMINDERS_BIN_ID> <LOCPINS_BIN_ID>
 *
 * Or set them as env vars:
 *   JSONBIN_KEY=xxx PLAN_BIN=xxx REMINDERS_BIN=xxx LOCPINS_BIN=xxx node scripts/pull-cloud.js
 */

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const DATA_DIR = path.resolve(__dirname, '..', 'public', 'data');

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
  throw new Error(`Failed to pull ${localFile}: HTTP ${result.status}`);
}

async function main() {
  const accessKey    = process.argv[2] || process.env.JSONBIN_KEY;
  const planBin      = process.argv[3] || process.env.PLAN_BIN;
  const remindersBin = process.argv[4] || process.env.REMINDERS_BIN;
  const locpinsBin   = process.argv[5] || process.env.LOCPINS_BIN;

  if (!accessKey || !planBin || !remindersBin || !locpinsBin) {
    console.error('❌ Usage: node scripts/pull-cloud.js <KEY> <PLAN_BIN> <REMINDERS_BIN> <LOCPINS_BIN>');
    console.error('   Or set env vars: JSONBIN_KEY, PLAN_BIN, REMINDERS_BIN, LOCPINS_BIN');
    process.exit(1);
  }

  console.log('📥 Pulling cloud data to local files...\n');

  const bins = [
    { id: planBin, file: 'plan.json', label: 'Plan' },
    { id: remindersBin, file: 'reminders.json', label: 'Reminders' },
    { id: locpinsBin, file: 'locpins.json', label: 'LocPins' }
  ];

  for (const { id, file, label } of bins) {
    process.stdout.write(`   ${label} (${id})...`);
    const bytes = await pullBin(accessKey, id, file);
    console.log(` ✅  ${file} (${(bytes/1024).toFixed(1)} KB)`);
  }

  console.log('\n✅ All files updated in public/data/');
  console.log('🏗  Now rebuild: npm run build:static\n');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
