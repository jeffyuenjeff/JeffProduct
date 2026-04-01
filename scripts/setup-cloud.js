#!/usr/bin/env node
/**
 * setup-cloud.js
 * Creates a secret GitHub Gist with the current plan, reminders, and locpins data,
 * then outputs the Gist ID to configure in app.js.
 *
 * Usage:
 *   node scripts/setup-cloud.js <GITHUB_PERSONAL_ACCESS_TOKEN>
 *
 * The token needs only the "gist" scope.
 * Generate one at: https://github.com/settings/tokens/new?scopes=gist
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');

const DATA_DIR = path.resolve(__dirname, '..', 'public', 'data');

function readJSON(file) {
  const p = path.join(DATA_DIR, file);
  if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  return '{}';
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

async function main() {
  const token = process.argv[2];
  if (!token) {
    console.error('❌ Usage: node scripts/setup-cloud.js <GITHUB_TOKEN>');
    console.error('   Generate a token at: https://github.com/settings/tokens/new?scopes=gist');
    process.exit(1);
  }

  console.log('📦 Reading local data files...');
  const planData      = readJSON('plan.json');
  const remindersData = readJSON('reminders.json');
  const locpinsData   = readJSON('locpins.json');

  console.log('☁️  Creating secret GitHub Gist...');
  const gistPayload = JSON.stringify({
    description: '大阪旅遊規劃 2026 - Cloud Data Store',
    public: false,
    files: {
      'plan.json':      { content: planData },
      'reminders.json': { content: remindersData },
      'locpins.json':   { content: locpinsData }
    }
  });

  const result = await httpsRequest({
    hostname: 'api.github.com',
    path: '/gists',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'osaka-trip-2026',
      'Accept': 'application/vnd.github+json'
    }
  }, gistPayload);

  if (result.status !== 201) {
    console.error('❌ Failed to create gist:', result.status, result.body?.message || result.body);
    process.exit(1);
  }

  const gistId = result.body.id;
  const gistUrl = result.body.html_url;

  console.log('\n✅ Gist created successfully!\n');
  console.log(`   Gist ID  : ${gistId}`);
  console.log(`   Gist URL : ${gistUrl}`);
  console.log('\n📝 Now update public/app.js — find the CLOUD config block and set:\n');
  console.log(`   const CLOUD = {`);
  console.log(`     enabled: true,`);
  console.log(`     gistId: '${gistId}',`);
  console.log(`     ...`);
  console.log(`   };\n`);
  console.log('🔑 Then open your deployed page with ?setup=1 to enter your token in the browser.');
  console.log('   Example: https://yourname.github.io/Jsproject/?setup=1');
  console.log('\n🏗  Finally, rebuild: npm run build:static\n');
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
