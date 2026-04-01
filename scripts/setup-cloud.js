#!/usr/bin/env node
/**
 * setup-cloud.js
 * Creates 3 JSONBin.io bins (plan, reminders, locpins) from your local data,
 * then outputs the bin IDs to configure in app.js.
 *
 * Usage:
 *   node scripts/setup-cloud.js <JSONBIN_ACCESS_KEY>
 *
 * Get your free access key at: https://jsonbin.io/ (sign up → Settings → API Keys)
 */

const fs    = require('fs');
const path  = require('path');
const https = require('https');

const DATA_DIR = path.resolve(__dirname, '..', 'public', 'data');

function readJSON(file) {
  const p = path.join(DATA_DIR, file);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '{}';
}

function httpsRequest(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function createBin(accessKey, name, content) {
  const result = await httpsRequest({
    hostname: 'api.jsonbin.io',
    path: '/v3/b',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Access-Key': accessKey,
      'X-Bin-Name': `osaka-2026-${name}`,
      'X-Bin-Private': 'false'
    }
  }, content);

  if (result.status === 200) {
    return result.body.metadata.id;
  }
  throw new Error(`Failed to create bin "${name}": ${result.status} ${JSON.stringify(result.body)}`);
}

async function main() {
  const accessKey = process.argv[2];
  if (!accessKey) {
    console.error('❌ Usage: node scripts/setup-cloud.js <JSONBIN_ACCESS_KEY>');
    console.error('   Get your key at: https://jsonbin.io/ → Sign up → Settings → API Keys');
    process.exit(1);
  }

  console.log('📦 Reading local data files...');
  const files = {
    plan:      readJSON('plan.json'),
    reminders: readJSON('reminders.json'),
    locpins:   readJSON('locpins.json')
  };

  console.log('☁️  Creating JSONBin.io bins...\n');
  const bins = {};
  for (const [name, content] of Object.entries(files)) {
    process.stdout.write(`   Creating ${name}...`);
    bins[name] = await createBin(accessKey, name, content);
    console.log(` ✅  ${bins[name]}`);
  }

  console.log('\n✅ All bins created!\n');
  console.log('📝 Update the CLOUD config in public/app.js:\n');
  console.log('   const CLOUD = {');
  console.log('     enabled: true,');
  console.log('     bins: {');
  console.log(`       plan:      '${bins.plan}',`);
  console.log(`       reminders: '${bins.reminders}',`);
  console.log(`       locpins:   '${bins.locpins}'`);
  console.log('     },');
  console.log('     ...');
  console.log('   };\n');
  console.log('🔑 To enable editing, open your page with your access key in the URL:');
  console.log(`   https://yourname.github.io/repo/?key=${accessKey}\n`);
  console.log('   The key is saved in localStorage — you only need to do this once per browser.\n');
  console.log('📥 To pull cloud data back to local JSON files:');
  console.log(`   curl -s "https://api.jsonbin.io/v3/b/${bins.plan}/latest" -H "X-Access-Key: ${accessKey}" | node -e "process.stdin.on('data',d=>{const j=JSON.parse(d);process.stdout.write(JSON.stringify(j.record,null,2))})" > public/data/plan.json`);
  console.log('');
  console.log('🏗  Then rebuild: npm run build:static\n');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
