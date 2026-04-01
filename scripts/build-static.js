#!/usr/bin/env node
/**
 * build-static.js
 * Copies public/ → docs/ and patches app.js to remove Express /api/* calls,
 * keeping cloud sync (GitHub Gist) + localStorage + static JSON fallbacks.
 * Makes the app fully static and GitHub Pages ready.
 */

const fs   = require('fs');
const path = require('path');

const SRC  = path.resolve(__dirname, '..', 'public');
const DEST = path.resolve(__dirname, '..', 'docs');

// ── helpers ────────────────────────────────────────────────────
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function replace(content, oldStr, newStr) {
  if (!content.includes(oldStr)) {
    console.warn(`  ⚠️  WARN: patch target not found:\n     ${oldStr.slice(0, 80).replace(/\n/g, '↵')}...`);
    return content;
  }
  return content.split(oldStr).join(newStr);
}

// ── 1. fresh copy ──────────────────────────────────────────────
console.log('🗂  Copying public/ → docs/');
if (fs.existsSync(DEST)) fs.rmSync(DEST, { recursive: true, force: true });
copyDir(SRC, DEST);

// GitHub Pages: prevent Jekyll processing
fs.writeFileSync(path.join(DEST, '.nojekyll'), '');

// ── 2. patch docs/app.js ───────────────────────────────────────
console.log('🔧  Patching docs/app.js (API → cloud + localStorage)');
const appJsPath = path.join(DEST, 'app.js');
let js = fs.readFileSync(appJsPath, 'utf8');

// ── loadPlan: remove Express try, keep cloud → localStorage → static file ──
js = replace(js,
`async function loadPlan() {
  try {
    const res = await fetch('/api/plan');
    if (res.ok) { plan = await res.json(); }
    else throw new Error();
  } catch {
    // Cloud → localStorage → static file
    const cloudData = await cloudGet('plan');
    if (cloudData) { plan = cloudData; }
    else {
      const saved = localStorage.getItem('osaka_plan_2026');
      if (saved) { try { plan = JSON.parse(saved); } catch { plan = { days: {} }; } }
      else {
        try {
          const res = await fetch('/data/plan.json');
          if (res.ok) plan = await res.json();
        } catch { plan = { days: {} }; }
      }
    }
  }`,
`async function loadPlan() {
  // Cloud → localStorage → static file
  const cloudData = await cloudGet('plan');
  if (cloudData) { plan = cloudData; }
  else {
    const saved = localStorage.getItem('osaka_plan_2026');
    if (saved) { try { plan = JSON.parse(saved); } catch { plan = { days: {} }; } }
    else {
      try {
        const res = await fetch('data/plan.json');
        if (res.ok) plan = await res.json();
        else plan = { days: {} };
      } catch { plan = { days: {} }; }
    }
  }`);

// ── savePlan: remove Express try, keep cloud + localStorage ──
js = replace(js,
`  try {
    const res = await fetch('/api/plan', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan)
    });
    if (res.ok) { showToast('✅ 行程已儲存！', 'success'); }
    else throw new Error();
  } catch {
    const cloudOk = await cloudPut('plan', plan);
    localStorage.setItem('osaka_plan_2026', JSON.stringify(plan));
    showToast(cloudOk ? '✅ 行程已儲存（雲端同步）！' : '✅ 行程已儲存（本機）', 'success');
  }
}`,
`  const cloudOk = await cloudPut('plan', plan);
  localStorage.setItem('osaka_plan_2026', JSON.stringify(plan));
  showToast(cloudOk ? '✅ 行程已儲存（雲端同步）！' : '✅ 行程已儲存！', 'success');
}`);

// ── loadReminders: remove Express try, keep cloud + localStorage ──
js = replace(js,
`async function loadReminders() {
  try {
    const res = await fetch('/api/reminders');
    if (res.ok) { reminders = await res.json(); }
    else throw new Error();
  } catch {
    const cloudData = await cloudGet('reminders');
    if (cloudData) { reminders = cloudData; }
    else {
      const saved = localStorage.getItem('osaka_reminders_2026');
      reminders = saved ? JSON.parse(saved) : [];
    }
  }
  renderReminders(reminders);
}`,
`async function loadReminders() {
  const cloudData = await cloudGet('reminders');
  if (cloudData) { reminders = cloudData; }
  else {
    const saved = localStorage.getItem('osaka_reminders_2026');
    reminders = saved ? JSON.parse(saved) : [];
  }
  renderReminders(reminders);
}`);

// ── saveReminders: remove Express try, keep cloud + localStorage ──
js = replace(js,
`async function saveReminders() {
  try {
    const res = await fetch('/api/reminders', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reminders)
    });
    if (res.ok) { showToast('✅ 注忘事項已儲存！', 'success'); }
    else throw new Error();
  } catch {
    const cloudOk = await cloudPut('reminders', reminders);
    localStorage.setItem('osaka_reminders_2026', JSON.stringify(reminders));
    showToast(cloudOk ? '✅ 注忘事項已儲存（雲端）！' : '✅ 已儲存（本機）', 'success');
  }
}`,
`async function saveReminders() {
  const cloudOk = await cloudPut('reminders', reminders);
  localStorage.setItem('osaka_reminders_2026', JSON.stringify(reminders));
  showToast(cloudOk ? '✅ 注忘事項已儲存（雲端）！' : '✅ 注忘事項已儲存！', 'success');
}`);

// ── saveLocPins: remove Express try, keep cloud + localStorage ──
js = replace(js,
`  try {
    const res = await fetch('/api/locpins', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(saveData)
    });
    if (res.ok) { showToast('✅ 位置標記已儲存！', 'success'); }
    else throw new Error();
  } catch {
    const cloudOk = await cloudPut('locpins', saveData);
    localStorage.setItem('osaka_locpins_2026', JSON.stringify(saveData));
    showToast(cloudOk ? '✅ 位置標記已儲存（雲端）！' : '✅ 已儲存（本機）', 'success');
  }
}`,
`  const cloudOk = await cloudPut('locpins', saveData);
  localStorage.setItem('osaka_locpins_2026', JSON.stringify(saveData));
  showToast(cloudOk ? '✅ 位置標記已儲存（雲端）！' : '✅ 位置標記已儲存！', 'success');
}`);

// ── loadLocPins: remove Express try, keep cloud + localStorage ──
js = replace(js,
`async function loadLocPins() {
  let saveData = null;
  try {
    const res = await fetch('/api/locpins');
    if (res.ok) { saveData = await res.json(); }
    else throw new Error();
  } catch {
    saveData = await cloudGet('locpins');
    if (!saveData) {
      const saved = localStorage.getItem('osaka_locpins_2026');
      if (saved) saveData = JSON.parse(saved);
    }
  }`,
`async function loadLocPins() {
  let saveData = null;
  saveData = await cloudGet('locpins');
  if (!saveData) {
    const saved = localStorage.getItem('osaka_locpins_2026');
    if (saved) saveData = JSON.parse(saved);
  }`);

fs.writeFileSync(appJsPath, js, 'utf8');

// ── 3. report ─────────────────────────────────────────────────
const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else files.push(full);
  }
})(DEST);

const totalKB = files.reduce((s, f) => s + fs.statSync(f).size, 0);
console.log(`\n✅  Static build complete!`);
console.log(`   Output : docs/  (${files.length} files, ${(totalKB / 1024).toFixed(0)} KB total)`);
console.log(`   Deploy : push to GitHub → Settings → Pages → Source: "docs/" branch main\n`);
