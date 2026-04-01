# 🎌 大阪旅遊規劃 2026 — Cheatsheet

## Quick Links

| What | URL |
|------|-----|
| **GitHub Pages (live site)** | <https://jeffyuenjeff.github.io/JeffProduct/> |
| **Live site with edit key** | <https://jeffyuenjeff.github.io/JeffProduct/?key=$2a$10$cVN6z3bCfcDKuqyxbggzGOE.M4HxaYb0XwCDKu9ylLV8/zTMVkFpu> |
| **GitHub Repo** | <https://github.com/jeffyuenjeff/JeffProduct> |
| **GitHub Pages Settings** | <https://github.com/jeffyuenjeff/JeffProduct/settings/pages> |
| **JSONBin Dashboard** | <https://jsonbin.io/app/bins> |

## JSONBin Bin IDs

| Data | Bin ID | Direct Link |
|------|--------|-------------|
| Plan | `69cd2d2d856a682189ed43b2` | <https://api.jsonbin.io/v3/b/69cd2d2d856a682189ed43b2/latest> |
| Reminders | `69cd2d2e36566621a86cd18e` | <https://api.jsonbin.io/v3/b/69cd2d2e36566621a86cd18e/latest> |
| LocPins | `69cd2d2e36566621a86cd197` | <https://api.jsonbin.io/v3/b/69cd2d2e36566621a86cd197/latest> |

## NPM Commands

```bash
# Start local server (http://localhost:3000)
npm start

# Build static site to docs/ for GitHub Pages
npm run build:static

# Pull latest cloud data to local files (reads key from .env)
npm run cloud:pull

# Pull specific data only
npm run cloud:pull -- --plan
npm run cloud:pull -- --reminders
npm run cloud:pull -- --locpins

# Setup new cloud bins (first-time only)
npm run cloud:setup
```

## Git Quick Commands

```bash
# Full deploy cycle: build → commit → push
npm run build:static && git add -A && git commit -m "update" && git push

# Check status
git status

# View recent history
git log --oneline -10
```

## Project Structure

```
Jsproject/               ← git root
├── .env                 ← JSONBin access key (git-ignored)
├── public/              ← source files (edit here)
│   ├── app.js           ← main app logic + cloud sync
│   ├── index.html
│   ├── styles.css       ← standard theme
│   ├── cute-styles.css  ← cute theme
│   └── data/            ← local JSON data files
├── docs/                ← built static site (auto-generated)
├── scripts/
│   ├── build-static.js  ← builds public/ → docs/
│   ├── pull-cloud.js    ← downloads cloud data to local
│   └── setup-cloud.js   ← creates JSONBin bins
└── server.js            ← Express dev server
```

## Notes

- **Edit source in `public/`**, then run `npm run build:static` to update `docs/`
- **GitHub Pages** serves from `docs/` folder on `main` branch
- **Cloud key** is stored in `.env` (never committed to git)
- **Anyone with the `?key=` URL** can edit data; without key = read-only
