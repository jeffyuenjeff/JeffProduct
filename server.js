const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// When bundled with pkg, __dirname is inside the read-only snapshot.
// Writable data (JSON saves) must live next to the executable instead.
const isPkg = typeof process.pkg !== 'undefined';
const DATA_DIR = isPkg
  ? path.join(path.dirname(process.execPath), 'data')
  : path.join(__dirname, 'public', 'data');

// On first run as a standalone binary, seed missing data files from snapshot defaults
if (isPkg) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const defaults = {
    'plan.json':      path.join(__dirname, 'public', 'data', 'plan.json'),
    'reminders.json': path.join(__dirname, 'public', 'data', 'reminders.json'),
    'locpins.json':   path.join(__dirname, 'public', 'data', 'locpins.json'),
  };
  for (const [name, src] of Object.entries(defaults)) {
    const dest = path.join(DATA_DIR, name);
    if (!fs.existsSync(dest)) {
      try { fs.writeFileSync(dest, fs.readFileSync(src, 'utf8'), 'utf8'); } catch (_) {}
    }
  }
}

const PLAN_FILE      = path.join(DATA_DIR, 'plan.json');
const REMINDERS_FILE = path.join(DATA_DIR, 'reminders.json');
const LOCPINS_FILE   = path.join(DATA_DIR, 'locpins.json');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '10mb' }));

// GET current plan
app.get('/api/plan', (req, res) => {
  try {
    if (!fs.existsSync(PLAN_FILE)) {
      return res.json({ days: {} });
    }
    const data = fs.readFileSync(PLAN_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(500).json({ error: 'Failed to read plan' });
  }
});

// POST save plan
app.post('/api/plan', (req, res) => {
  try {
    fs.writeFileSync(PLAN_FILE, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save plan' });
  }
});

// GET reminders
app.get('/api/reminders', (req, res) => {
  try {
    if (!fs.existsSync(REMINDERS_FILE)) {
      return res.json([]);
    }
    const data = fs.readFileSync(REMINDERS_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(500).json({ error: 'Failed to read reminders' });
  }
});

// POST save reminders
app.post('/api/reminders', (req, res) => {
  try {
    fs.writeFileSync(REMINDERS_FILE, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save reminders' });
  }
});

// GET location pins
app.get('/api/locpins', (req, res) => {
  try {
    if (!fs.existsSync(LOCPINS_FILE)) {
      return res.json({ pins: [], catVisibility: {}, dayOverlayState: {}, trainOverlayState: {} });
    }
    const data = fs.readFileSync(LOCPINS_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(500).json({ error: 'Failed to read location pins' });
  }
});

// POST save location pins
app.post('/api/locpins', (req, res) => {
  try {
    fs.writeFileSync(LOCPINS_FILE, JSON.stringify(req.body, null, 2), 'utf8');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save location pins' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🎌 大阪旅遊規劃 2026 已啟動!`);
  console.log(`👉 開啟瀏覽器: http://localhost:${PORT}`);
  console.log(`💾 資料目錄  : ${DATA_DIR}\n`);
});
