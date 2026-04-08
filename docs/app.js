/* ==========================================
   大阪旅遊規劃 2026 - Main App
   ========================================== */

'use strict';

// ─────────────────── STATE ───────────────────
let map, routeLayerGroup, markersLayerGroup, locationMarker, locationCircle;
let currentDay = 'day1';
let currentQaTab = 'attractions';
let drawRoute = true;
let plan = {};
let allDayMarkers = {};  // { dayKey: [L.Marker] }
let sidebarCollapsed = false;

// Hotel tab state
let hotelMap = null;
let hotelMarkersGroup = null;
let hotelMapInitialized = false;
let hotelCurrentFilter = 'all';
let hotelCurrentSort  = 'rating';
let hotelSearchQuery  = '';
let pendingCustomHotelCoords = null;
let addToDayTarget = null;       // hotel object being added to day
const CUSTOM_HOTELS = [];        // user-added hotels

// Theme state
let currentTheme = 'cute';  // 'standard' or 'cute' - cute is default

const DAY_COLORS = {
  day1: '#e85d04', day2: '#f72585', day3: '#3a86ff',
  day4: '#2cb67d', day5: '#ffb703', day6: '#a78bfa'
};

const DAY_ICONS = {
  day1: '✈️', day2: '🏯', day3: '🏙️',
  day4: '⛩️', day5: '🍓', day6: '🚢'
};

const ITEM_ICONS = {
  attraction: '<i class="fa fa-torii-gate"></i>',
  food:       '<i class="fa fa-bowl-rice"></i>',
  shopping:   '<i class="fa fa-bag-shopping"></i>',
  transport:  '<i class="fa fa-train-subway"></i>',
  tour:       '<i class="fa fa-map-location-dot"></i>',
  custom:     '<i class="fa fa-location-pin"></i>'
};

// ─────────────────── CLOUD SYNC (JSONBin.io) ───────────────────
// Free JSON storage for static pages. Multiple users see the same data.
// Setup: 1) Create free account at jsonbin.io  2) Create 3 bins  3) Fill IDs below
// Admin: visit your page with ?key=YOUR_JSONBIN_ACCESS_KEY to enable editing.
// Others: can read all data without any key.
const CLOUD = {
  enabled: true,
  bins: {
    plan:      '69cd2d2d856a682189ed43b2',
    reminders: '69cd2d2e36566621a86cd18e',
    locpins:   '69cd2d2e36566621a86cd197'
  },
  get accessKey() { return localStorage.getItem('osaka_cloud_key') || ''; },
  set accessKey(v) { v ? localStorage.setItem('osaka_cloud_key', v) : localStorage.removeItem('osaka_cloud_key'); },
  get canWrite() { return this.enabled && !!this.accessKey; },
  _cache: {}, _cacheTime: {}
};

async function cloudGet(type) {
  if (!CLOUD.enabled || !CLOUD.bins[type]) return null;
  // Cache for 20s to avoid repeated calls
  if (CLOUD._cache[type] && Date.now() - (CLOUD._cacheTime[type] || 0) < 20000) return CLOUD._cache[type];
  try {
    const hdrs = { 'Content-Type': 'application/json' };
    if (CLOUD.accessKey) hdrs['X-Access-Key'] = CLOUD.accessKey;
    else hdrs['X-Bin-Meta'] = 'false'; // Public read — skip metadata
    const res = await fetch(`https://api.jsonbin.io/v3/b/${CLOUD.bins[type]}/latest`, { headers: hdrs });
    if (res.ok) {
      const json = await res.json();
      const data = CLOUD.accessKey ? json.record : json; // With key: { record, metadata }, without: raw record
      CLOUD._cache[type] = data;
      CLOUD._cacheTime[type] = Date.now();
      return data;
    }
  } catch (e) { console.warn('[Cloud] Load failed:', type, e.message); }
  return null;
}

async function cloudPut(type, data) {
  if (!CLOUD.canWrite || !CLOUD.bins[type]) return false;
  try {
    const res = await fetch(`https://api.jsonbin.io/v3/b/${CLOUD.bins[type]}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Access-Key': CLOUD.accessKey
      },
      body: JSON.stringify(data)
    });
    if (res.ok) { CLOUD._cache[type] = null; return true; }
  } catch (e) { console.warn('[Cloud] Save failed:', type, e.message); }
  return false;
}

function initCloudSetup() {
  const params = new URLSearchParams(location.search);
  const key = params.get('key');
  if (key) {
    CLOUD.accessKey = key;
    // Clean URL
    const url = new URL(location.href);
    url.searchParams.delete('key');
    history.replaceState({}, '', url.toString());
    showToast('🔑 Access key saved — cloud editing enabled!', 'success');
  }
}

function updateCloudIndicator() {
  const el = document.getElementById('cloudStatus');
  if (!el) return;
  if (!CLOUD.enabled) { el.style.display = 'none'; return; }
  el.style.display = 'flex';
  if (CLOUD.canWrite) {
    el.innerHTML = '<i class="fa fa-cloud"></i> 雲端已連接';
    el.className = 'cloud-status cloud-write';
  } else {
    el.innerHTML = '<i class="fa fa-cloud"></i> 唯讀';
    el.className = 'cloud-status cloud-read';
  }
}

// ─────────────────── COORDINATE PARSER ───────────────────
// Detects "lat, lng" / "lat lng" patterns in user input and returns {lat, lng} or null
function parseCoordinates(input) {
  if (!input) return null;
  // Match patterns like: 34.667, 135.500 | 34.667,135.500 | 34.667 135.500
  const m = input.match(/^\s*(-?\d+\.?\d*)\s*[,\s]\s*(-?\d+\.?\d*)\s*$/);
  if (!m) return null;
  const a = parseFloat(m[1]), b = parseFloat(m[2]);
  // Validate reasonable lat/lng ranges (lat: -90~90, lng: -180~180)
  if (Math.abs(a) <= 90 && Math.abs(b) <= 180) return { lat: a, lng: b };
  if (Math.abs(b) <= 90 && Math.abs(a) <= 180) return { lat: b, lng: a };
  return null;
}

// ─────────────────── INIT ───────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize cloud setup (checks for ?setup=1 URL param)
  initCloudSetup();
  // Initialize theme (cute is default)
  initTheme();
  // Fast-load from localStorage first (instant), then cloud-refresh in background
  loadPlanFast();
  updateCloudIndicator();
  initTabs();
  initMap();
  renderDayTabs();
  renderDayContent(currentDay);
  renderAttractions(ATTRACTIONS);
  renderFood(FOOD);
  renderTransport();
  renderShopping();
  renderTour();
  renderHotels();
  updateMapLegend();
  updatePlanToggleUI();
  loadRemindersFast();
  // Re-render ticker duplicate for seamless loop
  const track = document.querySelector('.ticker-track');
  if (track) track.innerHTML += track.innerHTML;
  
  // Cute theme: render cute-specific views after data is loaded
  if (currentTheme === 'cute') {
    renderCuteDayTabs();
    renderCuteSummaryGrid();
    setupCuteLayout();
  }

  // Background cloud refresh — fetches latest data and re-renders if updated
  cloudRefreshAll();
});

// ─────────────────── THEME SWITCHING ───────────────────
function initTheme() {
  // Load saved theme preference, default to 'cute'
  const savedTheme = localStorage.getItem('osaka_theme_2026') || 'cute';
  currentTheme = savedTheme;
  applyTheme(currentTheme);
}

function applyTheme(theme) {
  const body = document.body;
  const toggleBtn = document.getElementById('btnStyleToggle');
  
  if (theme === 'cute') {
    body.classList.add('cute-theme');
    if (toggleBtn) {
      toggleBtn.innerHTML = '<i class="fa fa-palette"></i>';
      toggleBtn.title = '切換至標準風格';
    }
    // Move map into slideout panel body
    setupCuteLayout();
  } else {
    body.classList.remove('cute-theme');
    if (toggleBtn) {
      toggleBtn.innerHTML = '<i class="fa fa-star"></i>';
      toggleBtn.title = '切換至可愛風格';
    }
    // Move map back to original container
    teardownCuteLayout();
  }
  
  // Resize maps after theme change (header height changes)
  setTimeout(() => {
    if (map) map.invalidateSize();
    if (hotelMap) hotelMap.invalidateSize();
    if (typeof locMap !== 'undefined' && locMap) locMap.invalidateSize();
  }, 200);
}

function toggleThemeStyle() {
  currentTheme = currentTheme === 'cute' ? 'standard' : 'cute';
  localStorage.setItem('osaka_theme_2026', currentTheme);
  applyTheme(currentTheme);
  
  // Re-render current day for the new layout
  if (currentTheme === 'cute') {
    renderCuteTimeline(currentDay);
    renderCuteSummaryGrid();
  }
  
  const themeName = currentTheme === 'cute' ? '可愛風格 🌸' : '標準風格 📋';
  showToast(`已切換至 ${themeName}`, 'success');
}

// ─────────────────── CUTE LAYOUT MANAGEMENT ───────────────────
let cuteCurrentView = 'summary'; // 'summary' or dayKey
let cuteMapOpen = false;

function setupCuteLayout() {
  const mapEl = document.getElementById('mainMap');
  const cuteBody = document.getElementById('cuteMapBody');
  const mapControls = document.querySelector('.map-container .map-controls');
  const mapLegend = document.getElementById('mapLegend');
  
  if (mapEl && cuteBody && !cuteBody.contains(mapEl)) {
    cuteBody.appendChild(mapEl);
    if (mapControls) cuteBody.appendChild(mapControls);
    if (mapLegend) cuteBody.appendChild(mapLegend);
  }
}

function teardownCuteLayout() {
  const mapEl = document.getElementById('mainMap');
  const origContainer = document.querySelector('.map-container');
  const mapControls = document.querySelector('.map-controls');
  const mapLegend = document.getElementById('mapLegend');
  
  if (mapEl && origContainer && !origContainer.contains(mapEl)) {
    origContainer.insertBefore(mapEl, origContainer.firstChild);
    if (mapControls) origContainer.appendChild(mapControls);
    if (mapLegend) origContainer.appendChild(mapLegend);
  }
  
  // Close the slide-out if open
  closeCuteMap();
}

function openCuteMap() {
  const slideout = document.getElementById('cuteMapSlideout');
  const backdrop = document.getElementById('cuteMapBackdrop');
  if (!slideout) return;
  
  slideout.classList.add('open');
  if (backdrop) backdrop.classList.add('visible');
  cuteMapOpen = true;
  
  setTimeout(() => {
    if (map) map.invalidateSize();
    renderDayMarkersOnMap(currentDay);
  }, 450);
}

function closeCuteMap() {
  const slideout = document.getElementById('cuteMapSlideout');
  const backdrop = document.getElementById('cuteMapBackdrop');
  if (!slideout) return;
  
  slideout.classList.remove('open');
  if (backdrop) backdrop.classList.remove('visible');
  cuteMapOpen = false;
}

// Called when a location pin is clicked on a timeline card
function openCuteMapForItem(item) {
  openCuteMap();
  const coords = getItemCoords(item);
  if (coords && map) {
    setTimeout(() => {
      map.setView([coords.lat, coords.lng], 16, { animate: true });
    }, 500);
  }
}

// ── Render cute day tabs (vertical sidebar) ──
function renderCuteDayTabs() {
  const container = document.getElementById('dayTabs');
  if (!container || currentTheme !== 'cute') return;
  
  container.innerHTML = '';
  
  // Summary tab (first)
  const sumBtn = document.createElement('button');
  sumBtn.className = `day-tab cute-summary-tab ${cuteCurrentView === 'summary' ? 'active' : ''}`;
  sumBtn.innerHTML = `
    <div class="dt-num">🗺</div>
    <div class="dt-label">總覽</div>`;
  sumBtn.onclick = () => switchCuteView('summary');
  container.appendChild(sumBtn);
  
  // Day tabs
  const days = ['day1','day2','day3','day4','day5','day6'];
  const dayDates = ['4/29','4/30','5/1','5/2','5/3','5/4'];
  days.forEach((k, i) => {
    const btn = document.createElement('button');
    btn.className = `day-tab ${cuteCurrentView === k ? 'active' : ''}`;
    btn.style.setProperty('--day-color', DAY_COLORS[k]);
    btn.innerHTML = `
      <div class="dt-num" style="color:${DAY_COLORS[k]}">${i+1}</div>
      <div class="dt-label">${DAY_ICONS[k]}</div>
      <div class="dt-date">${dayDates[i]}</div>`;
    btn.onclick = () => switchCuteView(k);
    container.appendChild(btn);
  });
}

function toggleCuteGrid() {
  const grid = document.getElementById('cuteSummaryGrid');
  const icon = document.getElementById('cuteGridToggleIcon');
  if (!grid) return;
  
  if (grid.classList.contains('hidden-left')) {
    grid.classList.remove('hidden-left');
    if (icon) icon.className = 'fa fa-chevron-left';
  } else {
    grid.classList.add('hidden-left');
    if (icon) icon.className = 'fa fa-chevron-right';
  }
}

function switchCuteView(viewKey) {
  cuteCurrentView = viewKey;
  
  const summaryView = document.getElementById('cuteSummaryView');
  const timelineView = document.getElementById('cuteTimelineView');
  
  if (viewKey === 'summary') {
    if (summaryView) summaryView.classList.add('active');
    if (timelineView) timelineView.classList.remove('active');
  } else {
    if (summaryView) summaryView.classList.remove('active');
    if (timelineView) timelineView.classList.add('active');
    currentDay = viewKey;
    renderCuteTimeline(viewKey);
    renderDayMarkersOnMap(viewKey);
    updateMapLegend();
  }
  
  // Update tab active states
  document.querySelectorAll('.day-tab').forEach(t => t.classList.remove('active'));
  const tabs = document.querySelectorAll('.day-tab');
  tabs.forEach(t => {
    if (viewKey === 'summary' && t.classList.contains('cute-summary-tab')) {
      t.classList.add('active');
    } else {
      // Match day tabs by checking the onclick
      const dayNum = t.querySelector('.dt-date');
      const dayDates = { 'day1':'4/29','day2':'4/30','day3':'5/1','day4':'5/2','day5':'5/3','day6':'5/4' };
      if (dayNum && dayDates[viewKey] === dayNum.textContent) {
        t.classList.add('active');
      }
    }
  });
}

// ── Render cute summary grid (day overview cards) ──
function renderCuteSummaryGrid() {
  const grid = document.getElementById('cuteSummaryGrid');
  if (!grid) return;
  
  const days = ['day1','day2','day3','day4','day5','day6'];
  const dayDates = ['4/29 (三)','4/30 (四)','5/1 (五)','5/2 (六)','5/3 (日)','5/4 (一)'];
  
  grid.innerHTML = days.map((k, i) => {
    const d = plan.days?.[k] || {};
    const itemCount = (d.items || []).length;
    const color = DAY_COLORS[k];
    return `
      <div class="cute-summary-card" onclick="switchCuteView('${k}')">
        <div class="cute-summary-card-icon" style="background:${color}">
          ${DAY_ICONS[k]}
        </div>
        <div class="cute-summary-card-text">
          <div class="cute-summary-card-label">第${i+1}天 · ${dayDates[i]}</div>
          <div class="cute-summary-card-value">${d.title || '待規劃'}</div>
          <div style="font-size:10px;color:var(--text3);font-weight:600;margin-top:2px">${itemCount} 個行程項目</div>
        </div>
      </div>`;
  }).join('');
}

// ── Render cute timeline for a specific day ──
function renderCuteTimeline(dayKey) {
  const container = document.getElementById('cuteTimelineView');
  if (!container) return;
  
  const dayData = plan.days?.[dayKey] || {};
  const items = dayData.items || [];
  const dayNum = dayKey.replace('day', '');
  const color = DAY_COLORS[dayKey];
  const dayDates = { day1:'2026-04-29', day2:'2026-04-30', day3:'2026-05-01', day4:'2026-05-02', day5:'2026-05-03', day6:'2026-05-04' };
  
  container.innerHTML = `
    <div class="cute-tl-header">
      <div class="cute-tl-header-left">
        <div class="cute-tl-day-badge" style="background:${color}">${DAY_ICONS[dayKey]}</div>
        <div>
          <div class="cute-tl-title-row">
            <div class="cute-tl-title">${dayData.title || '第' + dayNum + '天'}</div>
            <div class="cute-tl-date">${dayData.date || dayDates[dayKey] || ''} · ${getDayOfWeek(dayData.date || dayDates[dayKey])}</div>
          </div>
          <div class="cute-tl-note" onclick="editDayNote('${dayKey}')">${dayData.note || '點擊添加備注...'}</div>
        </div>
      </div>
      <div class="cute-tl-actions">
        <div class="cute-tl-plan-toggle">
          <button class="cute-tl-plan-btn ${plan.activePlan === 'core' ? 'active' : ''}" onclick="switchPlan('core')"><i class="fa fa-sun"></i> 正選</button>
          <button class="cute-tl-plan-btn ${plan.activePlan === 'backup' ? 'active' : ''}" onclick="switchPlan('backup')"><i class="fa fa-cloud-rain"></i> 備用</button>
        </div>
        <button class="btn-sm btn-primary" onclick="savePlan()" title="儲存" style="margin-left:8px">
          <i class="fa fa-save"></i>
        </button>
      </div>
    </div>
    <div class="cute-tl-items">
      ${items.map((item, idx) => renderCuteTimelineItem(item, dayKey, idx)).join('')}
      <button class="cute-tl-add" onclick="openQuickAdd('${dayKey}')">
        <i class="fa fa-plus"></i> 添加行程項目
      </button>
    </div>`;
}

function renderCuteTimelineItem(item, dayKey, idx) {
  const typeIcon = ITEM_ICONS[item.type] || '<i class="fa fa-circle"></i>';
  const hasCoords = !!getItemCoords(item);
  
  return `
    <div class="cute-tl-item" draggable="true"
         ondragstart="dragStart(event,'${dayKey}',${idx})"
         ondragover="dragOver(event)" ondrop="drop(event,'${dayKey}',${idx})"
         ondragend="dragEnd(event)">
      <div class="cute-tl-dot ${item.type}">${typeIcon}</div>
      <div class="cute-tl-card">
        <div class="cute-tl-card-actions">
          <button onclick="editPlanItem('${dayKey}',${idx})" title="編輯"><i class="fa fa-pen"></i></button>
          <button class="del" onclick="removeCuteItem('${dayKey}',${idx})" title="刪除"><i class="fa fa-trash"></i></button>
        </div>
        <div class="cute-tl-card-top-row">
          ${item.time ? `<div class="cute-tl-card-time">⏰ ${item.time}</div>` : ''}
          ${hasCoords ? `<div class="cute-tl-card-loc" onclick="openCuteMapForItem(${JSON.stringify(item).replace(/"/g, '&quot;')})"><i class="fa fa-location-dot"></i> 查看位置</div>` : ''}
        </div>
        <div class="cute-tl-card-name" onclick="showPlanItemDetail('${dayKey}',${idx})">${item.name}</div>
        ${item.note ? `<div class="cute-tl-card-note">${item.note}</div>` : ''}
      </div>
    </div>`;
}

function removeCuteItem(dayKey, idx) {
  if (!plan.days?.[dayKey]?.items) return;
  plan.days[dayKey].items.splice(idx, 1);
  renderCuteTimeline(dayKey);
  renderDayMarkersOnMap(dayKey);
  renderCuteSummaryGrid();
  showToast('🗑 已從行程移除', '');
}

// ─────────────────── PLAN LOAD/SAVE ───────────────────
async function loadPlan() {
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
  }
  // Migrate old format (plan.days) to new plans structure
  if (!plan.plans) {
    plan.plans = {
      core:   { name: '正選行程',     desc: '天晴時的最佳行程', days: plan.days || {} },
      backup: { name: '備用行程（雨天）', desc: '下雨時的備用行程', days: {} }
    };
    plan.activePlan = 'core';
  }
  if (!plan.activePlan) plan.activePlan = 'core';
  plan.days = plan.plans[plan.activePlan].days || {};
}

function migratePlan() {
  if (!plan.plans) {
    plan.plans = {
      core:   { name: '正選行程',     desc: '天晴時的最佳行程', days: plan.days || {} },
      backup: { name: '備用行程（雨天）', desc: '下雨時的備用行程', days: {} }
    };
    plan.activePlan = 'core';
  }
  if (!plan.activePlan) plan.activePlan = 'core';
  plan.days = plan.plans[plan.activePlan].days || {};
}

// ── Fast load: instant from localStorage/static, no network wait ──
function loadPlanFast() {
  const saved = localStorage.getItem('osaka_plan_2026');
  if (saved) {
    try { plan = JSON.parse(saved); } catch { plan = { days: {} }; }
  }
  migratePlan();
}

function loadRemindersFast() {
  const saved = localStorage.getItem('osaka_reminders_2026');
  if (saved) {
    try { reminders = JSON.parse(saved); } catch { reminders = []; }
  }
  renderReminders(reminders);
}

// ── Background cloud refresh: fetch latest, re-render if data changed ──
async function cloudRefreshAll() {
  if (!CLOUD.enabled) return;
  try {
    const [cloudPlan, cloudReminders] = await Promise.all([
      cloudGet('plan'),
      cloudGet('reminders')
    ]);
    let updated = false;
    if (cloudPlan) {
      const cloudStr = JSON.stringify(cloudPlan);
      if (cloudStr !== JSON.stringify(plan)) {
        plan = cloudPlan;
        migratePlan();
        localStorage.setItem('osaka_plan_2026', cloudStr);
        renderDayTabs();
        renderDayContent(currentDay);
        renderDayMarkersOnMap(currentDay);
        updateMapLegend();
        updatePlanToggleUI();
        if (currentTheme === 'cute') {
          renderCuteDayTabs();
          renderCuteTimeline(currentDay);
          renderCuteSummaryGrid();
        }
        updated = true;
      }
    }
    if (cloudReminders) {
      const cloudStr = JSON.stringify(cloudReminders);
      if (cloudStr !== JSON.stringify(reminders)) {
        reminders = cloudReminders;
        localStorage.setItem('osaka_reminders_2026', cloudStr);
        renderReminders(reminders);
        updated = true;
      }
    }
    if (updated) updateCloudIndicator();
  } catch (e) {
    console.warn('[Cloud Refresh]', e.message);
  }
}

async function savePlan() {
  // Sync active plan days back into plans structure before saving
  if (plan.plans && plan.activePlan) {
    plan.plans[plan.activePlan].days = plan.days;
  }
  plan.lastSaved = new Date().toISOString();
  const cloudOk = await cloudPut('plan', plan);
  localStorage.setItem('osaka_plan_2026', JSON.stringify(plan));
  showToast(cloudOk ? '✅ 行程已儲存（雲端同步）！' : '✅ 行程已儲存！', 'success');
}

// ─────────────────── TABS ───────────────────
function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`panel-${tab}`).classList.add('active');
      if (tab === 'planner') { setTimeout(() => map && map.invalidateSize(), 50); }
      if (tab === 'hotels')  { setTimeout(() => initHotelMapIfNeeded(), 80); }
      if (tab === 'locmeasure') { setTimeout(() => initLocMapIfNeeded(), 80); }
    });
  });
}

// ─────────────────── MAP ───────────────────
function initMap() {
  map = L.map('mainMap', {
    center: [34.6937, 135.5022], zoom: 13,
    zoomControl: true, preferCanvas: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors', maxZoom: 19
  }).addTo(map);

  markersLayerGroup = L.layerGroup().addTo(map);
  routeLayerGroup  = L.layerGroup().addTo(map);

  renderDayMarkersOnMap(currentDay);
  updateMapLegend();
}

function renderDayMarkersOnMap(dayKey) {
  markersLayerGroup.clearLayers();
  routeLayerGroup.clearLayers();

  const dayData = plan.days?.[dayKey];
  if (!dayData || !dayData.items || dayData.items.length === 0) return;

  const coords = [];

  dayData.items.forEach((item, idx) => {
    const pos = getItemCoords(item);
    if (!pos) return;

    const color = DAY_COLORS[dayKey] || '#e85d04';
    const icon = createNumberedIcon(idx + 1, color);

    const marker = L.marker([pos.lat, pos.lng], { icon })
      .addTo(markersLayerGroup)
      .bindPopup(createPopupContent(item, dayKey), { maxWidth: 220 });

    coords.push([pos.lat, pos.lng]);
  });

  if (drawRoute && coords.length >= 2) {
    const poly = L.polyline(coords, { color: DAY_COLORS[dayKey], weight: 3, opacity: 0.7, dashArray: '8 6' })
      .addTo(routeLayerGroup);

    // Arrowheads if decorator available
    if (typeof L.polylineDecorator === 'function') {
      L.polylineDecorator(poly, {
        patterns: [{
          offset: '50%', repeat: 0,
          symbol: L.Symbol.arrowHead({ pixelSize: 12, pathOptions: { color: DAY_COLORS[dayKey], fillOpacity: 1, weight: 0 } })
        }]
      }).addTo(routeLayerGroup);
    }
  }

  if (coords.length > 0) {
    try { map.fitBounds(L.latLngBounds(coords).pad(0.2)); } catch {}
  }
}

function getItemCoords(item) {
  // Item-level override always wins (user-edited location)
  if (item.lat && item.lng) {
    return { lat: parseFloat(item.lat), lng: parseFloat(item.lng) };
  }
  if (item.type === 'attraction') {
    const a = ATTRACTIONS.find(x => x.id === item.id);
    if (a) return { lat: a.lat, lng: a.lng };
  }
  if (item.type === 'food') {
    const f = FOOD.find(x => x.id === item.id);
    if (f) return { lat: f.lat, lng: f.lng };
  }
  if (item.type === 'transport') {
    if (item.id === 'airport-namba' || item.id === 'namba-airport')
      return { lat: 34.667158505175045, lng: 135.50034473595477 };
  }
  return null;
}

function createNumberedIcon(n, color) {
  const uid = `g${n}_${color.replace('#','')}_${Math.random().toString(36).slice(2,6)}`;
  const darker = shadeColor(color, -40);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 30 38">
      <defs>
        <linearGradient id="${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color}"/>
          <stop offset="100%" style="stop-color:${darker}"/>
        </linearGradient>
      </defs>
      <path d="M15 0 C6.7 0 0 6.7 0 15 C0 24 15 38 15 38 C15 38 30 24 30 15 C30 6.7 23.3 0 15 0Z"
            fill="url(#${uid})" stroke="rgba(0,0,0,0.35)" stroke-width="1.5"/>
      <text x="15" y="20" text-anchor="middle" font-family="Inter,sans-serif" font-size="11"
            font-weight="bold" fill="white" stroke="rgba(0,0,0,0.5)" stroke-width="0.5">${n}</text>
    </svg>`;
  return L.divIcon({
    html: svg, className: '', iconSize: [30, 38], iconAnchor: [15, 38], popupAnchor: [0, -38]
  });
}

function shadeColor(col, amt) {
  const num = parseInt(col.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function createPopupContent(item, dayKey) {
  const name = item.name || '未命名';
  const time = item.time ? `⏰ ${item.time}` : '';
  const note = item.note || '';
  return `<div class="popup-title">${name}</div>
          <div class="popup-sub">${time} ${note}</div>
          <button class="popup-add-btn" onclick="removeItemPrompt('${dayKey}','${item.id}','${item.type}')">
            <i class="fa fa-trash"></i> 從行程移除
          </button>`;
}

function fitAllMarkers() {
  if (!markersLayerGroup) return;
  const bounds = [];
  markersLayerGroup.eachLayer(l => { if (l.getLatLng) bounds.push(l.getLatLng()); });
  if (bounds.length > 0) { try { map.fitBounds(L.latLngBounds(bounds).pad(0.2)); } catch {} }
  else map.setView([34.6937, 135.5022], 13);
}

function toggleRoute() {
  drawRoute = !drawRoute;
  const btn = document.getElementById('btnDrawRoute');
  if (drawRoute) { btn.style.color = ''; btn.style.borderColor = ''; }
  else { btn.style.color = '#555'; btn.style.borderColor = '#333'; }
  renderDayMarkersOnMap(currentDay);
}

function toggleSidebar() {
  const sb = document.getElementById('plannerSidebar');
  sidebarCollapsed = !sidebarCollapsed;
  sb.classList.toggle('collapsed', sidebarCollapsed);
  setTimeout(() => map && map.invalidateSize(), 350);
}

function locateMe() {
  if (!navigator.geolocation) { showToast('❌ 您的瀏覽器不支持定位', 'error'); return; }
  showToast('🔍 正在定位...', '');
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude: lat, longitude: lng, accuracy } = pos.coords;
    if (locationMarker) { map.removeLayer(locationMarker); map.removeLayer(locationCircle); }
    locationMarker = L.circleMarker([lat, lng], { radius: 8, color: '#3a86ff', fillColor: '#3a86ff', fillOpacity: 1, weight: 2 }).addTo(map);
    locationCircle = L.circle([lat, lng], { radius: accuracy, color: '#3a86ff', fillColor: '#3a86ff', fillOpacity: 0.1, weight: 1 }).addTo(map);
    map.setView([lat, lng], 15);
    showToast('📍 已定位您的位置', 'success');
  }, () => {
    showToast('❌ 無法獲取位置，請確認已授予位置權限', 'error');
  });
}

function updateMapLegend() {
  const legend = document.getElementById('mapLegend');
  if (!legend) return;
  const dayData = plan.days?.[currentDay];
  const title = dayData?.title || '';
  legend.innerHTML = `
    <div class="legend-title">${DAY_ICONS[currentDay] || ''} 第${currentDay.replace('day','')}天 行程</div>
    ${title ? `<div style="font-size:11px;color:var(--text3);margin-bottom:8px;">${title}</div>` : ''}
    ${Object.entries(DAY_COLORS).map(([k, c]) => {
      const d = plan.days?.[k];
      if (!d) return '';
      return `<div class="legend-item" style="cursor:pointer" onclick="switchDay('${k}')">
                <div class="legend-dot" style="background:${c};${currentDay===k?'box-shadow:0 0 6px '+c:''}"></div>
                <span style="${currentDay===k?'color:'+c+';font-weight:600':''}">${d.dayLabel || k} · ${d.title||''}</span>
              </div>`;
    }).join('')}`;
}

// ─────────────────── DAY PLANNER ───────────────────
function renderDayTabs() {
  // In cute mode, use the vertical cute tabs
  if (currentTheme === 'cute') {
    renderCuteDayTabs();
    return;
  }
  const container = document.getElementById('dayTabs');
  if (!container) return;
  container.innerHTML = '';
  const days = ['day1','day2','day3','day4','day5','day6'];
  const dayDates = ['4/29','4/30','5/1','5/2','5/3','5/4'];
  days.forEach((k, i) => {
    const btn = document.createElement('button');
    btn.className = `day-tab ${k === currentDay ? 'active' : ''}`;
    btn.style.setProperty('--day-color', DAY_COLORS[k]);
    btn.innerHTML = `
      <div class="dt-num" style="color:${DAY_COLORS[k]}">${i+1}</div>
      <div class="dt-label">${DAY_ICONS[k]} 第${i+1}天</div>
      <div class="dt-date">${dayDates[i]}</div>`;
    btn.onclick = () => switchDay(k);
    container.appendChild(btn);
  });
}

function switchDay(dayKey) {
  currentDay = dayKey;
  if (currentTheme === 'cute') {
    switchCuteView(dayKey);
    return;
  }
  document.querySelectorAll('.day-tab').forEach((t, i) => {
    t.classList.toggle('active', `day${i+1}` === dayKey);
  });
  renderDayContent(dayKey);
  renderDayMarkersOnMap(dayKey);
  updateMapLegend();
}

function renderDayContent(dayKey) {
  const container = document.getElementById('dayContent');
  if (!container) return;
  const dayData = plan.days?.[dayKey] || {};
  const items = dayData.items || [];

  container.innerHTML = `
    <div class="day-header" onclick="editDayNote('${dayKey}')">
      <div class="day-hdr-top">
        <div class="day-hdr-title">${DAY_ICONS[dayKey]} ${dayData.title || `第${dayKey.replace('day','')}天`}</div>
        <button class="edit-note-btn" onclick="editDayNote('${dayKey}'); event.stopPropagation()">
          <i class="fa fa-pen"></i> 編輯
        </button>
      </div>
      <div class="day-hdr-date">${dayData.date || ''} · ${getDayOfWeek(dayData.date)}</div>
      <div class="day-hdr-note">${dayData.note || '點擊添加備注...'}</div>
    </div>
    <div class="plan-items" id="planItems-${dayKey}">
      ${items.map((item, idx) => renderPlanItem(item, dayKey, idx)).join('')}
    </div>
    <button class="add-item-btn" onclick="openQuickAdd('${dayKey}')">
      <i class="fa fa-plus"></i> 添加行程項目
    </button>`;
}

function getDayOfWeek(dateStr) {
  if (!dateStr) return '';
  const days = ['日','一','二','三','四','五','六'];
  const d = new Date(dateStr);
  return isNaN(d) ? '' : `星期${days[d.getDay()]}`;
}

function renderPlanItem(item, dayKey, idx) {
  const typeIcon = ITEM_ICONS[item.type] || '<i class="fa fa-circle"></i>';
  return `
    <div class="plan-item" draggable="true"
         ondragstart="dragStart(event,'${dayKey}',${idx})"
         ondragover="dragOver(event)" ondrop="drop(event,'${dayKey}',${idx})"
         ondragend="dragEnd(event)">
      <div class="pi-icon ${item.type}">${typeIcon}</div>
      <div class="pi-body" onclick="showPlanItemDetail('${dayKey}',${idx})">
        <div class="pi-name">${item.name}</div>
        <div class="pi-time">${item.time || ''}</div>
        <div class="pi-note">${item.note || ''}</div>
      </div>
      <div class="pi-actions">
        <button class="pi-btn edit" onclick="editPlanItem('${dayKey}',${idx})" title="編輯">
          <i class="fa fa-pen"></i>
        </button>
        <button class="pi-btn" onclick="removeItem('${dayKey}',${idx})" title="刪除">
          <i class="fa fa-trash"></i>
        </button>
      </div>
    </div>`;
}

function editDayNote(dayKey) {
  const dayData = plan.days?.[dayKey];
  if (!dayData) return;
  const title = prompt('編輯天標題:', dayData.title || '');
  if (title === null) return;
  const note = prompt('編輯備注:', dayData.note || '');
  if (note === null) return;
  plan.days[dayKey].title = title;
  plan.days[dayKey].note = note;
  renderDayContent(dayKey);
  updateMapLegend();
}

function removeItem(dayKey, idx) {
  if (!plan.days?.[dayKey]?.items) return;
  plan.days[dayKey].items.splice(idx, 1);
  renderDayContent(dayKey);
  renderDayMarkersOnMap(dayKey);
}

function removeItemPrompt(dayKey, itemId, type) {
  if (!plan.days?.[dayKey]?.items) return;
  const items = plan.days[dayKey].items;
  const idx = items.findIndex(x => String(x.id) === String(itemId) && x.type === type);
  if (idx !== -1) {
    items.splice(idx, 1);
    renderDayContent(dayKey);
    renderDayMarkersOnMap(dayKey);
    showToast('🗑 已從行程移除', '');
  }
}

function editPlanItem(dayKey, idx) {
  const item = plan.days?.[dayKey]?.items?.[idx];
  if (!item) return;
  
  // Create edit modal
  const modal = document.createElement('div');
  modal.className = 'edit-item-modal';
  modal.id = 'editItemModal';
  modal.innerHTML = `
    <div class="edit-item-panel">
      <div class="edit-item-header">
        <span>編輯行程項目</span>
        <button onclick="closeEditItemModal()"><i class="fa fa-xmark"></i></button>
      </div>
      <div class="edit-item-body">
        <div class="edit-item-field">
          <label>名稱</label>
          <input type="text" id="editItemName" value="${item.name || ''}" />
        </div>
        <div class="edit-item-field">
          <label>時間</label>
          <div style="display:flex;gap:4px;align-items:center;flex-wrap:wrap;">
            <input type="text" id="editItemTime" value="${item.time || ''}" placeholder="點選或輸入" style="width:70px;text-align:center;flex-shrink:0;" />
            ${['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'].map(t =>
              `<button onclick="document.getElementById('editItemTime').value='${t}'" style="padding:3px 7px;border-radius:6px;border:1px solid var(--border);background:${item.time===t?'var(--primary)':'var(--surface)'};color:${item.time===t?'white':'var(--text2)'};font-size:11px;font-weight:600;cursor:pointer;">${t}</button>`
            ).join('')}
          </div>
        </div>
        <div class="edit-item-field">
          <label>備註</label>
          <textarea id="editItemNote" rows="3" placeholder="輸入備註信息...">${item.note || ''}</textarea>
        </div>
        <details class="edit-item-loc-section" ${(item.type === 'custom' || item.type === 'tour') ? 'open' : ''}>
          <summary style="cursor:pointer;font-size:12px;font-weight:600;color:var(--text2);margin-bottom:8px;display:flex;align-items:center;gap:5px">
            <i class="fa fa-location-dot" style="color:var(--info)"></i> 編輯位置座標
            ${(() => { const c = getItemCoords(item); return c ? `<span style="font-weight:400;color:var(--text3);font-size:11px;margin-left:auto">${c.lat.toFixed(4)}, ${c.lng.toFixed(4)}</span>` : '<span style="font-weight:400;color:var(--danger);font-size:11px;margin-left:auto">尚無座標</span>'; })()}
          </summary>
          <div class="edit-item-row">
            <div class="edit-item-field">
              <label>緯度 (lat)</label>
              <input type="text" id="editItemLat" value="${item.lat || (() => { const c = getItemCoords(item); return c ? c.lat : ''; })()}" />
            </div>
            <div class="edit-item-field">
              <label>經度 (lng)</label>
              <input type="text" id="editItemLng" value="${item.lng || (() => { const c = getItemCoords(item); return c ? c.lng : ''; })()}" />
            </div>
          </div>
          <div class="edit-item-field">
            <label>🔍 重新定位（輸入地址或地點名）</label>
            <div style="display:flex;gap:6px">
              <input type="text" id="editItemGeoSearch" placeholder="例: 蟹道樂 道頓堀 大阪" style="flex:1" />
              <button onclick="geocodeEditItem()" style="padding:7px 14px;border-radius:8px;background:var(--info);border:none;color:white;font-size:12px;cursor:pointer">搜尋</button>
            </div>
            <div id="editItemGeoResult" style="font-size:11px;color:var(--text3);margin-top:4px"></div>
          </div>
        </details>
        <div class="edit-item-actions">
          <button class="edit-item-cancel" onclick="closeEditItemModal()">取消</button>
          <button class="edit-item-save" onclick="saveEditItem('${dayKey}', ${idx})">
            <i class="fa fa-save"></i> 儲存
          </button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

// ─────────────────── SMART TIME PICKER ───────────────────
// One-tap time selection with common travel time slots + optional note
function showTimePicker(callback, defaultTime) {
  const existing = document.getElementById('timePickerModal');
  if (existing) existing.remove();

  const slots = [
    { label: '早餐', icon: '🌅', times: ['07:00','07:30','08:00','08:30','09:00'] },
    { label: '上午', icon: '☀️', times: ['09:30','10:00','10:30','11:00','11:30'] },
    { label: '午餐', icon: '🍱', times: ['12:00','12:30','13:00','13:30'] },
    { label: '下午', icon: '🏯', times: ['14:00','14:30','15:00','15:30','16:00','16:30'] },
    { label: '傍晚', icon: '🌇', times: ['17:00','17:30','18:00','18:30'] },
    { label: '晚餐', icon: '🍜', times: ['19:00','19:30','20:00','20:30'] },
    { label: '夜間', icon: '🌙', times: ['21:00','21:30','22:00','22:30','23:00'] },
  ];

  const modal = document.createElement('div');
  modal.id = 'timePickerModal';
  modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.45);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:12px;';
  modal.innerHTML = `
    <div style="background:var(--surface2,#fff);border-radius:20px;border:3px solid var(--text,#333);box-shadow:6px 6px 0 rgba(74,63,53,0.2);width:100%;max-width:400px;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;">
      <div style="padding:12px 16px;border-bottom:2px dashed var(--border,#ddd);display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:15px;font-weight:800;color:var(--text,#333);">⏰ 選擇時間</span>
        <button id="tpClose" style="width:30px;height:30px;border-radius:8px;border:2px solid var(--border,#ddd);background:var(--surface,#fff);color:var(--text3,#999);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;"><i class="fa fa-xmark"></i></button>
      </div>
      <div style="flex:1;overflow-y:auto;padding:10px 14px;">
        ${slots.map(s => `
          <div style="margin-bottom:10px;">
            <div style="font-size:11px;font-weight:700;color:var(--text2,#666);margin-bottom:5px;">${s.icon} ${s.label}</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;">
              ${s.times.map(t => `<button class="tp-slot" data-time="${t}" style="padding:6px 12px;border-radius:10px;border:2px solid var(--border,#ddd);background:var(--surface,#fff);color:var(--text,#333);font-size:13px;font-weight:700;cursor:pointer;transition:all 0.15s;flex-shrink:0;">${t}</button>`).join('')}
            </div>
          </div>
        `).join('')}
        <div style="margin-top:8px;">
          <label style="font-size:11px;font-weight:700;color:var(--text2,#666);display:block;margin-bottom:4px;">📝 備註（可選）</label>
          <input type="text" id="tpNote" placeholder="例: 需預約 / 排隊約30分鐘" style="width:100%;padding:8px 12px;border-radius:10px;border:2px solid var(--border,#ddd);background:var(--surface,#fff);color:var(--text,#333);font-size:12px;outline:none;box-sizing:border-box;" />
        </div>
      </div>
      <div style="padding:10px 14px;border-top:2px dashed var(--border,#ddd);display:flex;gap:8px;">
        <button id="tpSkip" style="flex:1;padding:10px;border-radius:10px;border:2px solid var(--border,#ddd);background:var(--surface,#fff);color:var(--text2,#666);font-size:13px;font-weight:700;cursor:pointer;">跳過（不設時間）</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Highlight on hover
  modal.querySelectorAll('.tp-slot').forEach(btn => {
    btn.onmouseenter = () => { btn.style.borderColor = 'var(--primary,#e85d04)'; btn.style.background = 'rgba(232,93,4,0.08)'; };
    btn.onmouseleave = () => { btn.style.borderColor = 'var(--border,#ddd)'; btn.style.background = 'var(--surface,#fff)'; };
    btn.onclick = () => {
      const note = document.getElementById('tpNote')?.value?.trim() || '';
      modal.remove();
      callback(btn.dataset.time, note);
    };
  });

  // Skip (no time)
  document.getElementById('tpSkip').onclick = () => {
    const note = document.getElementById('tpNote')?.value?.trim() || '';
    modal.remove();
    callback('', note);
  };

  // Close
  document.getElementById('tpClose').onclick = () => modal.remove();
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

function closeEditItemModal() {
  const modal = document.getElementById('editItemModal');
  if (modal) modal.remove();
}

async function geocodeEditItem() {
  const query = document.getElementById('editItemGeoSearch')?.value?.trim();
  const resultEl = document.getElementById('editItemGeoResult');
  if (!query) { resultEl.textContent = '請輸入地址'; return; }
  // Check for direct coordinate input
  const coords = parseCoordinates(query);
  if (coords) {
    document.getElementById('editItemLat').value = coords.lat;
    document.getElementById('editItemLng').value = coords.lng;
    resultEl.innerHTML = `<span style="color:var(--success)">✅ 座標定位: 緯度 ${coords.lat.toFixed(6)}, 經度 ${coords.lng.toFixed(6)}</span>`;
    return;
  }
  resultEl.textContent = '搜尋中...';
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' 大阪 日本')}&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'zh-TW,ja,en' } });
    const data = await res.json();
    if (data && data.length > 0) {
      document.getElementById('editItemLat').value = parseFloat(data[0].lat).toFixed(5);
      document.getElementById('editItemLng').value = parseFloat(data[0].lon).toFixed(5);
      resultEl.innerHTML = `<span style="color:var(--success)">✅ 已定位: ${data[0].display_name.substring(0, 60)}...</span>`;
    } else {
      resultEl.innerHTML = `<span style="color:var(--danger)">❌ 找不到位置</span>`;
    }
  } catch { resultEl.textContent = '搜尋失敗'; }
}

function saveEditItem(dayKey, idx) {
  const item = plan.days?.[dayKey]?.items?.[idx];
  if (!item) return;
  
  const name = document.getElementById('editItemName')?.value?.trim();
  const time = document.getElementById('editItemTime')?.value?.trim();
  const note = document.getElementById('editItemNote')?.value?.trim();
  
  if (name) item.name = name;
  item.time = time || '';
  item.note = note || '';
  
  // Save lat/lng for all item types (allows location override)
  const lat = document.getElementById('editItemLat')?.value?.trim();
  const lng = document.getElementById('editItemLng')?.value?.trim();
  if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
    item.lat = parseFloat(lat);
    item.lng = parseFloat(lng);
  } else if (!lat && !lng) {
    // Clear override if both fields emptied
    delete item.lat;
    delete item.lng;
  }
  
  closeEditItemModal();
  renderDayContent(currentDay);
  renderDayMarkersOnMap(currentDay);
  if (currentTheme === 'cute') {
    renderCuteTimeline(currentDay);
    renderCuteSummaryGrid();
  }
  showToast('✅ 已儲存變更', 'success');
}

// ─────────────────── QUICK ADD ───────────────────
let qaCurrentDay = 'day1';

function openQuickAdd(dayKey) {
  qaCurrentDay = dayKey;
  const panel = document.getElementById('quickAddPanel');
  if (currentTheme === 'cute') {
    // Move panel to body so it escapes the sidebar overflow:hidden
    if (panel.parentElement !== document.body) {
      panel._cuteOriginalParent = panel.parentElement;
      document.body.appendChild(panel);
    }
    panel.style.display = 'flex';
    panel.style.flexDirection = '';
    panel.onclick = function(e) {
      if (e.target === panel) closeQuickAdd();
    };
  } else {
    panel.style.display = 'flex';
    panel.style.flexDirection = 'column';
    panel.onclick = null;
  }
  setQaTab(currentQaTab);
}

function closeQuickAdd() {
  const panel = document.getElementById('quickAddPanel');
  panel.style.display = 'none';
  // Move panel back to sidebar if it was relocated
  if (panel._cuteOriginalParent && panel.parentElement === document.body) {
    panel._cuteOriginalParent.appendChild(panel);
    delete panel._cuteOriginalParent;
  }
}

function setQaTab(tab) {
  currentQaTab = tab;
  document.querySelectorAll('.qa-tab').forEach(t => t.classList.toggle('active', t.textContent.includes(qaTabLabel(tab))));
  const searchWrapper = document.getElementById('qaSearch')?.closest('.qa-search');
  const coordBar = document.getElementById('qaCoordBar');
  if (tab === 'custom') {
    // Hide text search but keep coord toggle visible
    if (searchWrapper) searchWrapper.style.display = 'none';
    if (coordBar) coordBar.style.display = 'none';
    renderCustomTab();
  } else {
    if (searchWrapper) searchWrapper.style.display = '';
    // Coord bar visibility controlled by toggleCoordSearch
    renderQaList(tab, document.getElementById('qaSearch')?.value || '');
  }
}

function qaTabLabel(tab) {
  return { attractions: '景點', food: '美食', shopping: '購物', custom: '自訂' }[tab] || tab;
}

function filterQuickAdd() {
  const q = document.getElementById('qaSearch')?.value || '';
  // If coord search is active, clear it and revert to text search
  if (document.getElementById('qaCoordBar')?.style.display !== 'none') {
    // keep coord bar open, but do text filter
  }
  renderQaList(currentQaTab, q);
}

/* ─── Coordinate Search ─── */
let coordSearchActive = false;

function toggleCoordSearch() {
  const bar = document.getElementById('qaCoordBar');
  const btn = document.getElementById('qaCoordToggle');
  if (!bar) return;
  coordSearchActive = !coordSearchActive;
  bar.style.display = coordSearchActive ? '' : 'none';
  if (btn) btn.classList.toggle('active', coordSearchActive);
  // If turning off, re-render with text search
  if (!coordSearchActive) {
    filterQuickAdd();
  }
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function searchByCoord() {
  const lat = parseFloat(document.getElementById('qaCoordLat')?.value);
  const lng = parseFloat(document.getElementById('qaCoordLng')?.value);
  const radius = parseFloat(document.getElementById('qaCoordRadius')?.value || '1');
  if (isNaN(lat) || isNaN(lng)) { showToast('⚠️ 請輸入有效座標', 'error'); return; }

  const tab = currentQaTab;
  if (tab === 'custom') { showToast('⚠️ 自訂分頁不支援座標搜尋', ''); return; }
  let items = [];
  if (tab === 'attractions') items = ATTRACTIONS;
  else if (tab === 'food') items = FOOD;
  else if (tab === 'shopping') items = SHOPPING_CENTERS;

  // Calculate distance and filter by radius
  let results = items
    .filter(x => x.lat && x.lng)
    .map(x => ({ ...x, _dist: haversineDistance(lat, lng, x.lat, x.lng) }))
    .filter(x => x._dist <= radius)
    .sort((a, b) => a._dist - b._dist);

  renderCoordResults(tab, results);
}

function renderCoordResults(tab, items) {
  const list = document.getElementById('qaList');
  if (!list) return;
  if (items.length === 0) {
    list.innerHTML = '<div style="padding:20px;text-align:center;color:var(--text3);font-size:12px"><i class="fa fa-map-marker-alt" style="font-size:24px;margin-bottom:8px;display:block;opacity:0.4"></i>此範圍內無結果<br>試擴大搜尋半徑</div>';
    return;
  }
  list.innerHTML = items.map(item => {
    const img = item.img || `https://source.unsplash.com/80x80/?japan,osaka,${encodeURIComponent(item.name||'japan')}`;
    const price = item.priceHKD ? `HK$${item.priceHKD}` : (item.priceHKD || '');
    const sub = item.region || item.area || item.type || '';
    const distLabel = item._dist < 1 ? `${Math.round(item._dist * 1000)}m` : `${item._dist.toFixed(1)}km`;
    return `<div class="qa-item" onclick="addToDay('${JSON.stringify({type:tab==='attractions'?'attraction':tab==='food'?'food':'shopping',id:item.id,name:item.name}).replace(/"/g, '&quot;')}')">
      <img class="qa-item-img" src="${img}" alt="${item.name||''}" onerror="this.src='https://placehold.co/40x40/1a1a2e/777?text=?'"/>
      <div class="qa-item-info">
        <div class="qa-item-name">${item.name||''}</div>
        <div class="qa-item-sub">${sub}</div>
      </div>
      <div class="qa-item-dist"><i class="fa fa-location-dot"></i> ${distLabel}</div>
      <div class="qa-item-price">${price}</div>
      <button class="qa-item-add"><i class="fa fa-plus"></i></button>
    </div>`;
  }).join('');
}

function renderQaList(tab, query) {
  const list = document.getElementById('qaList');
  if (!list) return;
  let items = [];
  if (tab === 'attractions') items = ATTRACTIONS;
  else if (tab === 'food') items = FOOD;
  else if (tab === 'shopping') items = SHOPPING_CENTERS;

  if (query) {
    const q = query.toLowerCase();
    items = items.filter(x => (x.name||'').toLowerCase().includes(q) || (x.area||'').toLowerCase().includes(q) || (x.desc||'').toLowerCase().includes(q));
  }

  list.innerHTML = items.map(item => {
    const img = item.img || `https://source.unsplash.com/80x80/?japan,osaka,${encodeURIComponent(item.name||'japan')}`;
    const price = item.priceHKD ? `HK$${item.priceHKD}` : (item.priceHKD || '');
    const sub = item.region || item.area || item.type || '';
    return `<div class="qa-item" onclick="addToDay('${JSON.stringify({type:tab==='attractions'?'attraction':tab==='food'?'food':'shopping',id:item.id,name:item.name}).replace(/"/g, '&quot;')}')">
      <img class="qa-item-img" src="${img}" alt="${item.name||''}" onerror="this.src='https://placehold.co/40x40/1a1a2e/777?text=?'"/>
      <div class="qa-item-info">
        <div class="qa-item-name">${item.name||''}</div>
        <div class="qa-item-sub">${sub}</div>
      </div>
      <div class="qa-item-price">${price}</div>
      <button class="qa-item-add"><i class="fa fa-plus"></i></button>
    </div>`;
  }).join('');
}

function addToDay(itemJSON) {
  try {
    const item = JSON.parse(itemJSON.replace(/\\'/g, "'"));
    if (!plan.days[qaCurrentDay]) plan.days[qaCurrentDay] = { items: [] };
    if (!plan.days[qaCurrentDay].items) plan.days[qaCurrentDay].items = [];
    // Avoid duplicate
    const exists = plan.days[qaCurrentDay].items.find(x => String(x.id) === String(item.id) && x.type === item.type);
    if (exists) { showToast('⚠️ 此項目已在行程中', ''); return; }

    showTimePicker((time, note) => {
      plan.days[qaCurrentDay].items.push({ ...item, time, note });
      renderDayContent(qaCurrentDay);
      renderDayMarkersOnMap(qaCurrentDay);
      if (currentTheme === 'cute') {
        renderCuteTimeline(qaCurrentDay);
        renderCuteSummaryGrid();
      }
      showToast('✅ 已添加到行程！', 'success');
      closeQuickAdd();
    });
  } catch(e) {
    showToast('❌ 添加失敗', 'error');
  }
}

// ─────────────────── CUSTOM LOCATION ───────────────────
let customLat = null, customLng = null, customPreviewMarker = null;

function renderCustomTab() {
  const list = document.getElementById('qaList');
  if (!list) return;
  customLat = null; customLng = null;
  list.innerHTML = `
    <div style="padding:4px 0">
      <div style="font-size:12px;color:var(--text2);margin-bottom:12px;line-height:1.6">
        輸入任意地點名稱，搜尋其位置後加入行程，地圖即可顯示該位置。
      </div>
      <div style="margin-bottom:10px">
        <label style="font-size:11px;color:var(--text3);font-weight:600;display:block;margin-bottom:4px">📍 地點名稱（顯示名稱）</label>
        <input id="customName" type="text" placeholder="例：La Collina 近江八幡"
          style="width:100%;padding:8px 12px;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);font-size:12px;outline:none;box-sizing:border-box"/>
      </div>
      <div style="margin-bottom:10px">
        <label style="font-size:11px;color:var(--text3);font-weight:600;display:block;margin-bottom:4px">🔍 搜尋位置（地址或日文地名）</label>
        <div style="display:flex;gap:6px">
          <input id="customLocSearch" type="text" placeholder="例：近江八幡 ラコリーナ"
            style="flex:1;padding:8px 12px;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);font-size:12px;outline:none"
            onkeydown="if(event.key==='Enter') geocodeCustomLocation()"/>
          <button onclick="geocodeCustomLocation()"
            style="padding:8px 14px;border-radius:8px;background:var(--info);border:none;color:white;font-size:12px;font-weight:600;cursor:pointer;flex-shrink:0;white-space:nowrap">
            搜尋
          </button>
        </div>
      </div>
      <div id="geocodeResult" style="display:none;padding:10px;border-radius:8px;background:rgba(44,182,125,0.10);border:1px solid rgba(44,182,125,0.25);margin-bottom:10px">
        <div style="font-size:11px;color:var(--success);font-weight:600;margin-bottom:5px">✅ 已找到位置（地圖已預覽）</div>
        <div id="geocodeResultName" style="font-size:12px;color:var(--text);margin-bottom:3px"></div>
        <div id="geocodeResultCoords" style="font-size:10px;color:var(--text3)"></div>
      </div>
      <div id="geocodeNoResult" style="display:none;padding:10px;border-radius:8px;background:rgba(235,87,87,0.08);border:1px solid rgba(235,87,87,0.2);margin-bottom:10px">
        <div style="font-size:11px;color:var(--danger)">❌ 找不到位置，請嘗試更詳細的地址（例如加上縣/市名或日文地名）</div>
      </div>
      <div style="margin-bottom:10px">
        <label style="font-size:11px;color:var(--text3);font-weight:600;display:block;margin-bottom:4px">📐 直接輸入座標 (X, Y)</label>
        <div class="qa-custom-coord-row">
          <div class="qa-custom-coord-field">
            <span class="qa-custom-coord-label">Lat (Y)</span>
            <input id="customDirectLat" type="number" step="0.0001" placeholder="34.6937"
              oninput="syncCustomCoordFromDirect()" />
          </div>
          <div class="qa-custom-coord-field">
            <span class="qa-custom-coord-label">Lng (X)</span>
            <input id="customDirectLng" type="number" step="0.0001" placeholder="135.5023"
              oninput="syncCustomCoordFromDirect()" />
          </div>
          <button class="qa-custom-coord-preview" onclick="previewCustomCoord()" title="在地圖預覽">
            <i class="fa fa-map-location-dot"></i>
          </button>
        </div>
      </div>
      <div style="margin-bottom:10px">
        <label style="font-size:11px;color:var(--text3);font-weight:600;display:block;margin-bottom:4px">⏰ 時間（可留空）</label>
        <input id="customTime" type="text" placeholder="例：09:00"
          style="width:100%;padding:8px 12px;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);font-size:12px;outline:none;box-sizing:border-box"/>
      </div>
      <div style="margin-bottom:14px">
        <label style="font-size:11px;color:var(--text3);font-weight:600;display:block;margin-bottom:4px">📝 備注（可留空）</label>
        <input id="customNote" type="text" placeholder="自由輸入備注..."
          style="width:100%;padding:8px 12px;border-radius:8px;background:var(--surface);border:1px solid var(--border);color:var(--text);font-size:12px;outline:none;box-sizing:border-box"/>
      </div>
      <button onclick="confirmAddCustom()"
        style="width:100%;padding:10px;border-radius:8px;background:linear-gradient(135deg,var(--primary),var(--accent));border:none;color:white;font-size:13px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px">
        <i class="fa fa-plus"></i> 加入行程
      </button>
    </div>`;
}

function syncCustomCoordFromDirect() {
  const lat = parseFloat(document.getElementById('customDirectLat')?.value);
  const lng = parseFloat(document.getElementById('customDirectLng')?.value);
  if (!isNaN(lat) && !isNaN(lng)) {
    customLat = lat;
    customLng = lng;
    // Update the geocode result display
    const result = document.getElementById('geocodeResult');
    const noResult = document.getElementById('geocodeNoResult');
    if (result) {
      result.style.display = 'block';
      document.getElementById('geocodeResultName').textContent = '手動座標輸入';
      document.getElementById('geocodeResultCoords').textContent = `緯度 ${lat.toFixed(6)}，經度 ${lng.toFixed(6)}`;
    }
    if (noResult) noResult.style.display = 'none';
  }
}

function previewCustomCoord() {
  const lat = parseFloat(document.getElementById('customDirectLat')?.value);
  const lng = parseFloat(document.getElementById('customDirectLng')?.value);
  if (isNaN(lat) || isNaN(lng)) {
    showToast('⚠️ 請輸入有效的座標', 'error');
    return;
  }
  customLat = lat;
  customLng = lng;
  // Show in geocode result area
  const result = document.getElementById('geocodeResult');
  const noResult = document.getElementById('geocodeNoResult');
  if (result) {
    result.style.display = 'block';
    document.getElementById('geocodeResultName').textContent = '手動座標輸入';
    document.getElementById('geocodeResultCoords').textContent = `緯度 ${lat.toFixed(6)}，經度 ${lng.toFixed(6)}`;
  }
  if (noResult) noResult.style.display = 'none';
  // Preview on map
  if (typeof map !== 'undefined' && map) {
    if (customPreviewMarker) map.removeLayer(customPreviewMarker);
    const label = document.getElementById('customName')?.value?.trim() || '座標位置';
    customPreviewMarker = L.marker([lat, lng], { icon: createNumberedIcon('?', '#a78bfa') })
      .addTo(map)
      .bindPopup(`<div class="popup-title">📍 預覽位置</div><div class="popup-sub">${label}<br><small>${lat.toFixed(5)}, ${lng.toFixed(5)}</small></div>`)
      .openPopup();
    map.setView([lat, lng], 16);
  }
  // In cute mode, open the map slideout
  if (typeof currentTheme !== 'undefined' && currentTheme === 'cute') {
    if (typeof openCuteMap === 'function') openCuteMap();
  }
  showToast('✅ 座標已定位到地圖！', 'success');
}

async function geocodeCustomLocation() {
  const query = document.getElementById('customLocSearch')?.value?.trim();
  if (!query) { showToast('請輸入搜尋地址', ''); return; }
  // Check for direct coordinate input
  const coords = parseCoordinates(query);
  if (coords) {
    customLat = coords.lat;
    customLng = coords.lng;
    document.getElementById('geocodeResult').style.display = 'block';
    document.getElementById('geocodeNoResult').style.display = 'none';
    document.getElementById('geocodeResultName').textContent = `座標位置`;
    document.getElementById('geocodeResultCoords').textContent = `緯度 ${coords.lat.toFixed(6)}，經度 ${coords.lng.toFixed(6)}`;
    if (map) {
      if (customPreviewMarker) map.removeLayer(customPreviewMarker);
      const label = document.getElementById('customName')?.value?.trim() || '座標位置';
      customPreviewMarker = L.marker([coords.lat, coords.lng], { icon: createNumberedIcon('?', '#a78bfa') })
        .addTo(map)
        .bindPopup(`<div class="popup-title">📍 預覽位置</div><div class="popup-sub">${label}</div>`)
        .openPopup();
      map.setView([coords.lat, coords.lng], 16);
    }
    showToast('✅ 座標定位成功！', 'success');
    return;
  }
  showToast('🔍 搜尋中...', '');
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'zh-TW,ja,en' } });
    const data = await res.json();
    if (data && data.length > 0) {
      customLat = parseFloat(data[0].lat);
      customLng = parseFloat(data[0].lon);
      const displayName = data[0].display_name;
      document.getElementById('geocodeResult').style.display = 'block';
      document.getElementById('geocodeNoResult').style.display = 'none';
      document.getElementById('geocodeResultName').textContent = displayName.length > 80 ? displayName.slice(0, 80) + '…' : displayName;
      document.getElementById('geocodeResultCoords').textContent = `緯度 ${customLat.toFixed(5)}，經度 ${customLng.toFixed(5)}`;
      if (map) {
        if (customPreviewMarker) map.removeLayer(customPreviewMarker);
        const label = document.getElementById('customName')?.value?.trim() || query;
        customPreviewMarker = L.marker([customLat, customLng], { icon: createNumberedIcon('?', '#a78bfa') })
          .addTo(map)
          .bindPopup(`<div class="popup-title">📍 預覽位置</div><div class="popup-sub">${label}</div>`)
          .openPopup();
        map.setView([customLat, customLng], 14);
      }
      showToast('✅ 找到位置！', 'success');
    } else {
      customLat = null; customLng = null;
      document.getElementById('geocodeResult').style.display = 'none';
      document.getElementById('geocodeNoResult').style.display = 'block';
    }
  } catch {
    showToast('❌ 搜尋失敗，請稍後再試', 'error');
  }
}

function confirmAddCustom() {
  const name = document.getElementById('customName')?.value?.trim();
  if (!name) { showToast('請輸入地點名稱', ''); return; }
  if (customLat === null || customLng === null) { showToast('請先搜尋並確認位置', ''); return; }
  const time = document.getElementById('customTime')?.value?.trim() || '';
  const note = document.getElementById('customNote')?.value?.trim() || '';
  if (!plan.days[qaCurrentDay]) plan.days[qaCurrentDay] = { items: [] };
  if (!plan.days[qaCurrentDay].items) plan.days[qaCurrentDay].items = [];
  const customId = `custom_${Date.now()}`;
  plan.days[qaCurrentDay].items.push({ type: 'custom', id: customId, name, lat: customLat, lng: customLng, time, note });
  if (customPreviewMarker) { map && map.removeLayer(customPreviewMarker); customPreviewMarker = null; }
  customLat = null; customLng = null;
  renderDayContent(qaCurrentDay);
  renderDayMarkersOnMap(qaCurrentDay);
  if (currentTheme === 'cute') {
    renderCuteTimeline(qaCurrentDay);
    renderCuteSummaryGrid();
  }
  showToast(`✅ ${name} 已加入行程！`, 'success');
  closeQuickAdd();
}

// ─────────────────── DRAG & DROP ───────────────────
let dragIdx = null, dragDayKey = null;

function dragStart(e, dayKey, idx) {
  dragIdx = idx; dragDayKey = dayKey;
  e.currentTarget.classList.add('dragging');
}

function dragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}

function dragEnd(e) { e.currentTarget.classList.remove('dragging'); }

function drop(e, dayKey, idx) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (dragIdx === null || dragIdx === idx || dragDayKey !== dayKey) return;
  const items = plan.days[dayKey].items;
  const [moved] = items.splice(dragIdx, 1);
  items.splice(idx, 0, moved);
  
  if (currentTheme === 'cute') {
    renderCuteTimeline(dayKey);
  } else {
    renderDayContent(dayKey);
  }
  
  renderDayMarkersOnMap(dayKey);
  dragIdx = null;
}

// ─────────────────── ATTRACTIONS ───────────────────
function renderAttractions(list) {
  const grid = document.getElementById('attractionsGrid');
  if (!grid) return;
  grid.innerHTML = list.map(a => `
    <div class="card" onclick="showAttractionDetail(${a.id})">
      <div class="card-img-wrapper">
        <img src="${a.img}" alt="${a.name}" loading="lazy" onerror="this.src='https://placehold.co/400x200/1a1a2e/555?text=No+Image'"/>
        <div class="card-number">${a.id}</div>
        ${a.tag.includes('必去') ? '<div class="card-badge">⭐ 必去</div>' : ''}
      </div>
      <div class="card-body">
        <div class="card-region"><i class="fa fa-location-dot"></i> ${a.region}</div>
        <div class="card-title">${a.name}</div>
        <div class="card-desc">${a.desc}</div>
        <div class="card-meta">
          <div class="card-meta-row"><i class="fa fa-clock"></i> ${a.hours}</div>
          <div class="card-meta-row"><i class="fa fa-train-subway"></i> ${a.access}</div>
        </div>
        <div class="card-footer">
          <div class="card-price">
            <span class="price-hkd">HK$${a.priceHKD}</span>
            <span class="price-jpy">¥${a.priceJPY.toLocaleString()}</span>
          </div>
          <div class="card-tags">${a.tag.slice(0,3).map(t => `<span class="card-tag">${t}</span>`).join('')}</div>
          <button class="card-action-btn" onclick="addAttrToDay(event, ${a.id})">
            <i class="fa fa-plus"></i> 加入
          </button>
        </div>
        <div style="margin-top:10px">
          <a href="${a.url}" target="_blank" rel="noopener" onclick="event.stopPropagation()"
             style="font-size:11px;color:var(--info);text-decoration:none;display:flex;align-items:center;gap:5px">
            <i class="fa fa-external-link"></i> 官方網站
          </a>
        </div>
      </div>
    </div>`).join('');
}

function filterAttractions() {
  const q = document.getElementById('attrSearch')?.value.toLowerCase() || '';
  const filtered = ATTRACTIONS.filter(a =>
    a.name.toLowerCase().includes(q) || a.region.toLowerCase().includes(q) || a.desc.toLowerCase().includes(q)
  );
  renderAttractions(filtered);
}

function filterAttrByRegion(region, btn) {
  document.querySelectorAll('#attrRegionFilter .fc').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = region === 'all' ? ATTRACTIONS : ATTRACTIONS.filter(a => a.region === region || a.region.startsWith(region));
  renderAttractions(filtered);
}

function addAttrToDay(e, id) {
  e.stopPropagation();
  const a = ATTRACTIONS.find(x => x.id === id);
  if (!a) return;
  const day = prompt(`加入哪一天行程？\n${Object.values(plan.days || {}).map((d,i) => `${i+1}: ${d.dayLabel} ${d.title||''}`).join('\n')}\n請輸入天數 (1-6):`, currentDay.replace('day',''));
  if (!day) return;
  const dayKey = `day${parseInt(day)}`;
  qaCurrentDay = dayKey;
  if (!plan.days[dayKey]) plan.days[dayKey] = { items: [] };
  if (!plan.days[dayKey].items) plan.days[dayKey].items = [];
  const exists = plan.days[dayKey].items.find(x => String(x.id) === String(id) && x.type === 'attraction');
  if (exists) { showToast('⚠️ 此景點已在該天行程中', ''); return; }
  showTimePicker((time, note) => {
    plan.days[dayKey].items.push({ type: 'attraction', id, name: a.name, time, note });
    if (dayKey === currentDay) { renderDayContent(dayKey); renderDayMarkersOnMap(dayKey); }
    if (currentTheme === 'cute') { renderCuteTimeline(dayKey); renderCuteSummaryGrid(); }
    showToast(`✅ 已加入第${day}天行程！`, 'success');
  });
}

function showAttractionDetail(id) {
  const a = ATTRACTIONS.find(x => x.id === id);
  if (!a) return;

  // Check if this attraction is in any day plan
  let foundDayKey = null, foundIdx = -1;
  if (plan.days) {
    for (const [dk, dayData] of Object.entries(plan.days)) {
      const idx = (dayData.items || []).findIndex(x => String(x.id) === String(id) && x.type === 'attraction');
      if (idx !== -1) { foundDayKey = dk; foundIdx = idx; break; }
    }
  }

  if (foundDayKey) {
    // Switch to planner tab and highlight the item
    const plannerBtn = document.querySelector('.tab-btn[data-tab="planner"]');
    if (plannerBtn) plannerBtn.click();
    setTimeout(() => {
      switchDay(foundDayKey);
      setTimeout(() => {
        // Highlight the item in the timeline
        const items = document.querySelectorAll('.cute-tl-item, .plan-item');
        if (items[foundIdx]) {
          items[foundIdx].classList.add('highlight-flash');
          items[foundIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => items[foundIdx].classList.remove('highlight-flash'), 2000);
        }
        if (map) {
          map.setView([a.lat, a.lng], 16);
          const marker = L.marker([a.lat, a.lng], { icon: createNumberedIcon('★', '#f72585') })
            .addTo(map).bindPopup(`<div class="popup-title">${a.name}</div>`).openPopup();
          setTimeout(() => map.removeLayer(marker), 8000);
        }
      }, 200);
    }, 100);
    showToast(`📍 已定位到第${foundDayKey.replace('day','')}天行程`, 'success');
  } else {
    // Not in any day plan — show detail popup
    showAttractionPopup(a);
  }
}

function showAttractionPopup(a) {
  const existing = document.getElementById('attrDetailPopup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.className = 'attr-detail-popup';
  popup.id = 'attrDetailPopup';
  popup.onclick = e => { if (e.target === popup) closeAttrDetailPopup(); };
  popup.innerHTML = `
    <div class="attr-detail-panel">
      <button class="attr-detail-close" onclick="closeAttrDetailPopup()"><i class="fa fa-xmark"></i></button>
      <div class="attr-detail-img-wrap">
        <img src="${a.img}" alt="${a.name}" onerror="this.src='https://placehold.co/600x300/1a1a2e/555?text=No+Image'" />
        ${a.tag.includes('必去') ? '<div class="attr-detail-badge">⭐ 必去</div>' : ''}
        <div class="attr-detail-number">#${a.id}</div>
      </div>
      <div class="attr-detail-body">
        <div class="attr-detail-region"><i class="fa fa-location-dot"></i> ${a.region}</div>
        <div class="attr-detail-name">${a.name}</div>
        <div class="attr-detail-desc">${a.desc}</div>
        <div class="attr-detail-info">
          <div class="attr-detail-row"><i class="fa fa-clock"></i> <span>${a.hours}</span></div>
          <div class="attr-detail-row"><i class="fa fa-calendar-xmark"></i> <span>休：${a.holiday}</span></div>
          <div class="attr-detail-row"><i class="fa fa-train-subway"></i> <span>${a.access}</span></div>
        </div>
        <div class="attr-detail-price">
          <span class="price-hkd">HK$${a.priceHKD}</span>
          <span class="price-jpy">¥${a.priceJPY.toLocaleString()}</span>
        </div>
        <div class="attr-detail-tags">${a.tag.map(t => `<span class="card-tag">${t}</span>`).join('')}</div>
        <div class="attr-detail-actions">
          <a href="${a.url}" target="_blank" rel="noopener" class="attr-detail-link">
            <i class="fa fa-external-link"></i> 官方網站
          </a>
          <button class="attr-detail-add" onclick="closeAttrDetailPopup(); addAttrToDay(event, ${a.id})">
            <i class="fa fa-plus"></i> 加入行程
          </button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(popup);
  requestAnimationFrame(() => popup.classList.add('show'));
}

function closeAttrDetailPopup() {
  const popup = document.getElementById('attrDetailPopup');
  if (popup) { popup.classList.remove('show'); setTimeout(() => popup.remove(), 250); }
}

// Show full attraction detail when tapping a plan item in day timeline
function showPlanItemDetail(dayKey, idx) {
  const item = plan.days?.[dayKey]?.items?.[idx];
  if (!item) return;

  // Try to find matching attraction data
  let a = null;
  if (item.type === 'attraction' && item.id) {
    a = ATTRACTIONS.find(x => x.id === Number(item.id) || x.id === item.id);
  }
  // Try to find matching food data
  let f = null;
  if (item.type === 'food' && item.id && typeof FOOD !== 'undefined') {
    f = FOOD.find(x => x.id === item.id);
  }

  if (a) {
    showAttractionPopup(a);
  } else if (f) {
    showFoodPopup(f);
  } else {
    // Generic item — show simple info
    showGenericItemPopup(item);
  }
}

function showFoodPopup(f) {
  const existing = document.getElementById('attrDetailPopup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.className = 'attr-detail-popup';
  popup.id = 'attrDetailPopup';
  popup.onclick = e => { if (e.target === popup) closeAttrDetailPopup(); };
  popup.innerHTML = `
    <div class="attr-detail-panel">
      <button class="attr-detail-close" onclick="closeAttrDetailPopup()"><i class="fa fa-xmark"></i></button>
      <div class="attr-detail-img-wrap">
        <img src="${f.img}" alt="${f.name}" onerror="this.src='https://placehold.co/600x300/1a1a2e/555?text=No+Image'" />
        ${f.tags?.includes('必吃') ? '<div class="attr-detail-badge">🔥 必吃</div>' : ''}
      </div>
      <div class="attr-detail-body">
        <div class="attr-detail-region"><i class="fa fa-location-dot"></i> ${f.area || ''}</div>
        <div class="attr-detail-name">${f.name}</div>
        <div class="attr-detail-desc">${f.desc || ''}</div>
        <div class="attr-detail-info">
          <div class="attr-detail-row"><i class="fa fa-store"></i> <span>${f.shopName || ''}</span></div>
          <div class="attr-detail-row"><i class="fa fa-utensils"></i> <span>${f.type || ''}</span></div>
        </div>
        <div class="attr-detail-price">
          <span class="price-hkd">HK$${f.priceHKD || '?'}</span>
          <span class="price-jpy">¥${f.priceJPY || '?'}</span>
        </div>
        <div class="attr-detail-tags">${(f.tags || []).map(t => `<span class="card-tag">${t}</span>`).join('')}</div>
        <div class="attr-detail-actions">
          <a href="https://www.google.com/maps/search/${encodeURIComponent((f.shopName||'')+ ' ' +(f.area||'')+' 大阪')}" target="_blank" class="attr-detail-link">
            <i class="fa fa-map-location-dot"></i> 在地圖查看
          </a>
        </div>
      </div>
    </div>`;
  document.body.appendChild(popup);
  requestAnimationFrame(() => popup.classList.add('show'));
}

function showGenericItemPopup(item) {
  const existing = document.getElementById('attrDetailPopup');
  if (existing) existing.remove();

  const popup = document.createElement('div');
  popup.className = 'attr-detail-popup';
  popup.id = 'attrDetailPopup';
  popup.onclick = e => { if (e.target === popup) closeAttrDetailPopup(); };
  popup.innerHTML = `
    <div class="attr-detail-panel attr-detail-panel-compact">
      <button class="attr-detail-close" onclick="closeAttrDetailPopup()"><i class="fa fa-xmark"></i></button>
      <div class="attr-detail-body">
        <div class="attr-detail-name">${item.name || '未命名'}</div>
        ${item.time ? `<div class="attr-detail-row"><i class="fa fa-clock"></i> <span>${item.time}</span></div>` : ''}
        ${item.note ? `<div class="attr-detail-desc">${item.note}</div>` : ''}
        <div class="attr-detail-tags"><span class="card-tag">${item.type || '自訂'}</span></div>
      </div>
    </div>`;
  document.body.appendChild(popup);
  requestAnimationFrame(() => popup.classList.add('show'));
}

// ─────────────────── FOOD ───────────────────
function renderFood(list) {
  const grid = document.getElementById('foodGrid');
  if (!grid) return;
  grid.innerHTML = list.map(f => `
    <div class="card">
      <div class="card-img-wrapper">
        <img src="${f.img}" alt="${f.name}" loading="lazy" onerror="this.src='https://placehold.co/400x200/1a1a2e/555?text=No+Image'"/>
        ${f.tags.includes('必吃') ? '<div class="card-badge">🔥 必吃</div>' : ''}
      </div>
      <div class="card-body">
        <div class="card-region"><i class="fa fa-location-dot"></i> ${f.area}</div>
        <div class="card-title">${f.name}</div>
        <div class="card-desc">${f.desc}</div>
        <div class="card-meta">
          <div class="card-meta-row"><i class="fa fa-store"></i> ${f.shopName}</div>
          <div class="card-meta-row"><i class="fa fa-clock"></i> ${f.type}</div>
        </div>
        <div class="rating-stars" style="margin-bottom:10px">
          ${[1,2,3,4,5].map(s => `<span class="star${s > f.rating ? ' empty' : ''}">⭐</span>`).join('')}
        </div>
        <div class="card-footer">
          <div class="card-price">
            <span class="price-hkd">HK$${f.priceHKD}</span>
            <span class="price-jpy">¥${f.priceJPY}</span>
          </div>
          <div class="card-tags">${f.tags.slice(0,2).map(t => `<span class="card-tag">${t}</span>`).join('')}</div>
          <button class="card-action-btn" onclick="addFoodToDay(event,'${f.id}')">
            <i class="fa fa-plus"></i> 加入
          </button>
        </div>
        <div style="margin-top:10px">
          <a href="https://www.google.com/maps/search/${encodeURIComponent(f.shopName+' '+f.area+' 大阪')}"
             target="_blank" style="font-size:11px;color:var(--success);text-decoration:none;display:flex;align-items:center;gap:5px">
            <i class="fa fa-map-location-dot"></i> 在地圖查看
          </a>
        </div>
      </div>
    </div>`).join('');
}

function filterFood() {
  const q = document.getElementById('foodSearch')?.value.toLowerCase() || '';
  const filtered = FOOD.filter(f =>
    f.name.toLowerCase().includes(q) || f.area.toLowerCase().includes(q) ||
    f.type.toLowerCase().includes(q) || f.shopName.toLowerCase().includes(q)
  );
  renderFood(filtered);
}

function filterFoodByTag(tag, btn) {
  document.querySelectorAll('#foodTagFilter .fc').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = tag === 'all' ? FOOD : FOOD.filter(f => f.tags.includes(tag));
  renderFood(filtered);
}

function addFoodToDay(e, id) {
  e.stopPropagation();
  const f = FOOD.find(x => x.id === id);
  if (!f) return;
  const day = prompt(`加入哪一天行程？(1-6):`, currentDay.replace('day',''));
  if (!day) return;
  const dayKey = `day${parseInt(day)}`;
  if (!plan.days[dayKey]) plan.days[dayKey] = { items: [] };
  if (!plan.days[dayKey].items) plan.days[dayKey].items = [];
  showTimePicker((time, note) => {
    plan.days[dayKey].items.push({ type: 'food', id, name: f.name, time, note: note || f.shopName });
    if (dayKey === currentDay) renderDayContent(dayKey);
    if (currentTheme === 'cute') { renderCuteTimeline(dayKey); renderCuteSummaryGrid(); }
    showToast(`✅ ${f.name} 已加入第${day}天！`, 'success');
  });
}

// ─────────────────── TRANSPORT ───────────────────
function renderTransport() {
  const container = document.getElementById('transportContent');
  if (!container || !TRANSPORT_INFO) return;

  const info = TRANSPORT_INFO;

  const optionsHTML = info.airportToNamba.options.map(opt => `
    <div class="transport-card ${opt.recommended ? 'recommended' : ''}">
      <img class="tc-img" src="${opt.img}" alt="${opt.name}" onerror="this.src='https://placehold.co/200x140/1a1a2e/555?text=?'"/>
      <div class="tc-body">
        <div class="tc-header">
          <div class="tc-name">${opt.name}</div>
          ${opt.recommended ? '<span class="tc-badge">⭐ 推薦</span>' : ''}
        </div>
        <div class="tc-stats">
          <div class="tc-stat"><div class="tc-stat-label">行程時間</div><div class="tc-stat-val">${opt.duration}</div></div>
          <div class="tc-stat"><div class="tc-stat-label">參考費用</div><div class="tc-stat-val">HK$${opt.priceHKD}</div></div>
          <div class="tc-stat"><div class="tc-stat-label">日圓價格</div><div class="tc-stat-val">¥${opt.priceJPY}</div></div>
          <div class="tc-stat"><div class="tc-stat-label">班次</div><div class="tc-stat-val">${opt.frequency}</div></div>
        </div>
        <div class="tc-desc">${opt.desc}</div>
        <div class="tc-tips">${opt.tips.map(t => `<div class="tc-tip"><i class="fa fa-check-circle"></i> ${t}</div>`).join('')}</div>
        ${opt.bookUrl ? `<a class="tc-book" href="${opt.bookUrl}" target="_blank" rel="noopener"><i class="fa fa-ticket"></i> 立即購票</a>` : ''}
      </div>
    </div>`).join('');

  const metroLinesHTML = info.osaka_metro.lines.map(l => `
    <div class="metro-line">
      <div class="ml-color" style="background:${l.color}"></div>
      <div class="ml-code" style="background:${l.color}">${l.code}</div>
      <div class="ml-info">
        <div class="ml-name">${l.name}</div>
        <div class="ml-desc">${l.desc}</div>
      </div>
    </div>`).join('');

  const jrRoutesHTML = info.jr_kansai.routes.map(r => `
    <div class="jr-route-item">
      <i class="fa fa-train"></i>
      <div>
        <div class="jr-route-name">${r.name}</div>
        <div class="jr-route-desc">${r.desc}</div>
      </div>
    </div>`).join('');

  container.innerHTML = `
    <div class="transport-section">
      <h3><i class="fa fa-plane-arrival"></i> ${info.airportToNamba.title}</h3>
      <div class="transport-cards">${optionsHTML}</div>
    </div>

    <div class="transport-section">
      <h3><i class="fa fa-map"></i> 大阪周遊卡適用地圖</h3>
      <div class="map-preview">
        <img src="${info.airportToNamba.mapImg}" alt="${info.airportToNamba.mapImgTitle}"
             onerror="this.style.display='none'" loading="lazy"/>
        <div class="map-preview-caption">${info.airportToNamba.mapImgTitle}（資料來源：osaka-amazing-pass.com）</div>
      </div>
    </div>

    <div class="transport-section">
      <h3><i class="fa fa-train-subway"></i> ${info.osaka_metro.title}</h3>
      <p style="font-size:13px;color:var(--text2);margin-bottom:14px;line-height:1.7">${info.osaka_metro.desc}</p>
      <div class="metro-lines">${metroLinesHTML}</div>
      <div class="tip-list">${info.osaka_metro.tips.map(t => `<div class="tip-item">${t}</div>`).join('')}</div>
    </div>

    <div class="transport-section">
      <h3><i class="fa fa-train"></i> ${info.jr_kansai.title}</h3>
      <p style="font-size:13px;color:var(--text2);margin-bottom:14px;line-height:1.7">${info.jr_kansai.desc}</p>
      <div class="jr-route">${jrRoutesHTML}</div>
    </div>`;
}

// ─────────────────── SHOPPING ───────────────────
function renderShopping() {
  renderShoppingMalls(SHOPPING_CENTERS);
  renderMustBuy(MUST_BUY);
}

function renderShoppingMalls(list) {
  const grid = document.getElementById('shoppingMallGrid');
  if (!grid) return;
  grid.innerHTML = list.map((m, i) => `
    <div class="mall-card">
      <img class="mall-img" src="${m.img}" alt="${m.name}" loading="lazy" onerror="this.src='https://placehold.co/280x150/1a1a2e/555?text=No+Image'"/>
      <div class="mall-body">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <div style="width:24px;height:24px;border-radius:7px;background:linear-gradient(135deg,var(--info),#1e5ac4);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:white">${i+1}</div>
          <div class="mall-name">${m.name}</div>
        </div>
        <div class="mall-type">${m.type}</div>
        <div class="mall-desc">${m.desc}</div>
        <div class="mall-info">
          <div class="mall-info-row"><i class="fa fa-clock"></i>${m.hours}</div>
          <div class="mall-info-row"><i class="fa fa-train-subway"></i>${m.access}</div>
        </div>
        <div class="mall-highlights">${m.highlights.map(h => `<span class="mall-hl">${h}</span>`).join('')}</div>
      </div>
    </div>`).join('');
}

function renderMustBuy(list) {
  const grid = document.getElementById('mustBuyGrid');
  if (!grid) return;
  grid.innerHTML = list.map((b, i) => `
    <div class="buy-item">
      <div class="buy-num">${i+1}</div>
      <div class="buy-name">${b.name}</div>
      <div class="buy-cat">${b.category}</div>
      <div class="buy-desc">${b.desc}</div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end">
        <div>
          <div class="buy-price">HK$${b.priceHKD}</div>
          <div class="buy-hint">📍 ${b.shopHint}</div>
        </div>
      </div>
    </div>`).join('');
}

function filterBuyItems(cat, btn) {
  document.querySelectorAll('#buyFilter .fc').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const filtered = cat === 'all' ? MUST_BUY : MUST_BUY.filter(x => x.category === cat);
  renderMustBuy(filtered);
}

// ─────────────────── TOUR ───────────────────
function renderTour() {
  const container = document.getElementById('tourContent');
  if (!container || !TOUR_INFO) return;

  const highlightsHTML = TOUR_INFO.highlights.map(h => `<div class="highlight-item"><i class="fa fa-check-circle"></i>${h}</div>`).join('');
  const scheduleHTML = TOUR_INFO.schedule.map(s => `
    <div class="schedule-item">
      <div class="sched-time">${s.time}</div>
      <div class="sched-dot"></div>
      <div class="sched-text">${s.activity}</div>
    </div>`).join('');

  const photosHTML = TOUR_INFO.photos.map(p => `<img src="${p}" alt="tour" onerror="this.style.display='none'" loading="lazy"/>`).join('');

  const mustBuyHTML = TOUR_INFO.laCollina.mustBuy.map(b => `<div class="highlight-item"><i class="fa fa-star"></i>${b}</div>`).join('');
  const notesHTML = TOUR_INFO.notes.map(n => `<div class="note-item">${n}</div>`).join('');
  const strawberryTips = TOUR_INFO.strawberry.tips.map(t => `<div class="highlight-item"><i class="fa fa-leaf"></i>${t}</div>`).join('');

  container.innerHTML = `
    <div class="tour-hero">
      <img src="${TOUR_INFO.photos[0]}" alt="La Collina Tour" onerror="this.src='https://source.unsplash.com/1200x400/?japan,strawberry,farm'"/>
      <div class="tour-hero-overlay">
        <div class="tour-hero-title">${TOUR_INFO.title}</div>
        <div class="tour-hero-meta">
          <span class="tour-badge duration"><i class="fa fa-clock"></i> ${TOUR_INFO.duration}</span>
          <span class="tour-badge price"><i class="fa fa-yen-sign"></i> ${TOUR_INFO.priceHKD}</span>
          <span class="tour-badge source"><i class="fa fa-globe"></i> ${TOUR_INFO.source}</span>
        </div>
      </div>
    </div>

    <div class="tour-content">
      <div class="tour-card">
        <h4><i class="fa fa-star"></i> 行程亮點</h4>
        <div class="highlight-list">${highlightsHTML}</div>
      </div>

      <div class="tour-card">
        <h4><i class="fa fa-calendar-check"></i> 行程時間表</h4>
        <div class="schedule-list">${scheduleHTML}</div>
      </div>

      <div class="tour-card">
        <h4><i class="fa fa-building"></i> La Collina 近江八幡</h4>
        <div style="margin-bottom:12px">
          <div class="card-meta-row" style="font-size:12px;color:var(--text2);margin-bottom:6px"><i class="fa fa-location-dot" style="color:var(--primary)"></i> ${TOUR_INFO.laCollina.address}</div>
          <div class="card-meta-row" style="font-size:12px;color:var(--text2);margin-bottom:6px"><i class="fa fa-clock" style="color:var(--primary)"></i> ${TOUR_INFO.laCollina.hours}</div>
          <div style="font-size:12px;color:var(--text2);line-height:1.7;margin-bottom:12px">${TOUR_INFO.laCollina.desc}</div>
        </div>
        <h4 style="font-size:13px;margin-bottom:8px"><i class="fa fa-shopping-bag"></i> 必買推薦</h4>
        <div class="highlight-list">${mustBuyHTML}</div>
        <div class="photo-grid" style="margin-top:14px">${photosHTML}</div>
      </div>

      <div class="tour-card">
        <h4><i class="fa fa-seedling"></i> 草莓採摘體驗</h4>
        <div style="margin-bottom:12px">
          <strong style="font-size:12px;color:var(--gold)">季節：</strong>
          <span style="font-size:12px;color:var(--text2)"> ${TOUR_INFO.strawberry.season}</span>
        </div>
        <div style="margin-bottom:12px">
          <strong style="font-size:12px;color:var(--gold)">品種：</strong>
          <span style="font-size:12px;color:var(--text2)"> ${TOUR_INFO.strawberry.varieties.join('、')}</span>
        </div>
        <h4 style="font-size:13px;margin-bottom:8px;font-weight:600;color:var(--text)"><i class="fa fa-lightbulb"></i> 採摘貼士</h4>
        <div class="highlight-list">${strawberryTips}</div>
      </div>

      <div class="tour-card" style="grid-column:1/-1">
        <h4><i class="fa fa-triangle-exclamation"></i> 注意事項</h4>
        <div class="note-list">${notesHTML}</div>
        <a class="book-btn-large" href="${TOUR_INFO.bookUrl}" target="_blank" rel="noopener">
          <i class="fa fa-ticket"></i> 立即在Klook預訂 · 名額有限！
        </a>
      </div>
    </div>`;
}

// ─────────────────── TOAST ───────────────────
let toastTimer;
function showToast(msg, type) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = `toast ${type || ''} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2800);
}

// ─────────────────── PLAN TYPE SWITCH ───────────────────
function switchPlan(planType) {
  if (planType === plan.activePlan) return;
  // Save current days back to the plan structure
  if (plan.plans && plan.activePlan) {
    plan.plans[plan.activePlan].days = plan.days;
  }
  plan.activePlan = planType;
  plan.days = plan.plans?.[planType]?.days || {};
  updatePlanToggleUI();
  renderDayTabs();
  renderDayContent(currentDay);
  renderDayMarkersOnMap(currentDay);
  updateMapLegend();
  if (currentTheme === 'cute') {
    renderCuteTimeline(currentDay);
    renderCuteSummaryGrid();
  }
  const planName = plan.plans?.[planType]?.name || planType;
  showToast(`🔄 已切換至：${planName}`, 'success');
}

function updatePlanToggleUI() {
  const active = plan.activePlan || 'core';
  document.querySelectorAll('.ptb').forEach(b => b.classList.remove('active'));
  const btn = document.getElementById(active === 'core' ? 'ptbCore' : 'ptbBackup');
  if (btn) btn.classList.add('active');
}

// ─────────────────── ALL DAYS MAP ───────────────────
let allDaysMapInstance = null;

function openAllDaysMap() {
  document.getElementById('allDaysMapOverlay').style.display = 'flex';
  setTimeout(() => {
    if (!allDaysMapInstance) {
      allDaysMapInstance = L.map('allDaysMap', {
        center: [34.6937, 135.5022], zoom: 11, zoomControl: true, preferCanvas: true
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 19
      }).addTo(allDaysMapInstance);
    }
    allDaysMapInstance.invalidateSize();
    renderAllDaysMap();
  }, 120);
}

function closeAllDaysMap() {
  document.getElementById('allDaysMapOverlay').style.display = 'none';
}

function renderAllDaysMap() {
  if (!allDaysMapInstance) return;
  allDaysMapInstance.eachLayer(l => {
    if (!(l instanceof L.TileLayer)) allDaysMapInstance.removeLayer(l);
  });
  const allBounds = [];
  ['day1','day2','day3','day4','day5','day6'].forEach(dayKey => {
    const dayData = plan.days?.[dayKey];
    if (!dayData?.items) return;
    const color = DAY_COLORS[dayKey];
    const coords = [];
    let itemNum = 0;
    dayData.items.forEach(item => {
      const pos = getItemCoords(item);
      if (!pos) return;
      itemNum++;
      const icon = createNumberedIcon(`${dayKey.replace('day','')}·${itemNum}`, color);
      L.marker([pos.lat, pos.lng], { icon })
        .addTo(allDaysMapInstance)
        .bindPopup(`<div class="popup-title" style="color:${color}">${DAY_ICONS[dayKey]} 第${dayKey.replace('day','')}天</div><div class="popup-sub" style="font-weight:600;color:var(--text)">${item.name}</div><div class="popup-sub">${item.time || ''} ${item.note ? '· ' + item.note : ''}</div>`);
      coords.push([pos.lat, pos.lng]);
      allBounds.push([pos.lat, pos.lng]);
    });
    if (coords.length >= 2) {
      L.polyline(coords, { color, weight: 2.5, opacity: 0.65, dashArray: '7 5' }).addTo(allDaysMapInstance);
    }
  });
  if (allBounds.length > 0) {
    try { allDaysMapInstance.fitBounds(L.latLngBounds(allBounds).pad(0.15)); } catch {}
  }
  renderAllDaysLegend();
}

function renderAllDaysLegend() {
  const legend = document.getElementById('allDaysLegend');
  if (!legend) return;
  legend.innerHTML = ['day1','day2','day3','day4','day5','day6'].map(k => {
    const d = plan.days?.[k];
    if (!d) return '';
    const itemCount = (d.items || []).filter(i => getItemCoords(i)).length;
    return `<div class="adl-item" onclick="jumpAllDaysMap('${k}')">
      <div class="adl-dot" style="background:${DAY_COLORS[k]}"></div>
      <span>${DAY_ICONS[k]} 第${k.replace('day','')}天<span style="font-weight:600;color:${DAY_COLORS[k]}"> · ${d.title || ''}</span> <span style="font-size:10px;color:var(--text3)">(${itemCount}個地點)</span></span>
    </div>`;
  }).join('');
}

function jumpAllDaysMap(dayKey) {
  if (!allDaysMapInstance) return;
  const dayData = plan.days?.[dayKey];
  if (!dayData?.items) return;
  const coords = dayData.items.map(i => getItemCoords(i)).filter(Boolean).map(p => [p.lat, p.lng]);
  if (coords.length > 0) { try { allDaysMapInstance.fitBounds(L.latLngBounds(coords).pad(0.3)); } catch {} }
  else allDaysMapInstance.setView([34.6937, 135.5022], 11);
}

// ─────────────────── REMINDERS ───────────────────
let reminders = [];
let reminderFilter = 'all';

async function loadReminders() {
  const cloudData = await cloudGet('reminders');
  if (cloudData) { reminders = cloudData; }
  else {
    const saved = localStorage.getItem('osaka_reminders_2026');
    reminders = saved ? JSON.parse(saved) : [];
  }
  renderReminders(reminders);
}

async function saveReminders() {
  const cloudOk = await cloudPut('reminders', reminders);
  localStorage.setItem('osaka_reminders_2026', JSON.stringify(reminders));
  showToast(cloudOk ? '✅ 注忘事項已儲存（雲端）！' : '✅ 注忘事項已儲存！', 'success');
}

function renderReminders(list) {
  const container = document.getElementById('remindersList');
  if (!container) return;
  const filtered = reminderFilter === 'all' ? list : list.filter(r => r.category === reminderFilter);
  // Group by category
  const groups = {};
  filtered.forEach(r => {
    const cat = r.category || '其他';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(r);
  });
  const priorityColor = { high: '#eb5757', medium: '#e85d04', low: '#2cb67d' };
  const priorityLabel = { high: '重要', medium: '提示', low: '備注' };
  if (Object.keys(groups).length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:48px 24px;color:var(--text3)"><i class="fa fa-bell-slash" style="font-size:36px;margin-bottom:14px;display:block"></i>沒有${reminderFilter === 'all' ? '' : '「'+reminderFilter+'」類別的'}提醒<br><button onclick="addReminder()" style="margin-top:16px;padding:8px 20px;border-radius:8px;background:var(--primary);color:white;border:none;cursor:pointer;font-size:13px">+ 新增第一條提醒</button></div>`;
    return;
  }
  container.innerHTML = Object.entries(groups).map(([cat, items]) => `
    <div class="reminder-group">
      <div class="reminder-group-title"><i class="fa fa-tag"></i> ${cat}</div>
      ${items.map(r => `
        <div class="reminder-item ${r.done ? 'done' : ''}" id="ri-${r.id}">
          <button class="ri-check" onclick="toggleReminderDone('${r.id}')" title="${r.done ? '標記未完成':'標記完成'}">
            <i class="fa ${r.done ? 'fa-circle-check' : 'fa-circle'}"></i>
          </button>
          <div class="ri-body">
            <div class="ri-header">
              <span class="ri-priority" style="background:${priorityColor[r.priority]||'#999'}">${priorityLabel[r.priority]||r.priority}</span>
              <div class="ri-title" onclick="editReminderTitle('${r.id}')" title="點擊編輯標題">${r.title}</div>
            </div>
            <div class="ri-content" onclick="editReminderContent('${r.id}')" title="點擊編輯內容">${r.content || '<span style="color:var(--text3);font-style:italic">點擊添加詳細說明...</span>'}</div>
          </div>
          <button class="ri-del-btn" onclick="deleteReminder('${r.id}')" title="刪除"><i class="fa fa-trash"></i></button>
        </div>`).join('')}
    </div>`).join('');
}

function filterReminders(cat, btn) {
  reminderFilter = cat;
  document.querySelectorAll('#reminderCatFilter .fc').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderReminders(reminders);
}

function addReminder() {
  const id = `r${Date.now()}`;
  const cat = reminderFilter === 'all' ? '自訂' : reminderFilter;
  reminders.push({ id, category: cat, priority: 'medium', title: '新提醒（點擊標題編輯）', content: '', done: false });
  renderReminders(reminders);
  setTimeout(() => editReminderTitle(id), 80);
}

function toggleReminderDone(id) {
  const r = reminders.find(x => x.id === id);
  if (r) { r.done = !r.done; renderReminders(reminders); }
}

function deleteReminder(id) {
  if (!confirm('確定刪除這條提醒？')) return;
  reminders = reminders.filter(x => x.id !== id);
  renderReminders(reminders);
  showToast('🗑 已刪除', '');
}

function editReminderTitle(id) {
  const r = reminders.find(x => x.id === id);
  if (!r) return;
  const el = document.querySelector(`#ri-${id} .ri-title`);
  if (!el) return;
  el.contentEditable = 'true';
  el.focus();
  try { const range = document.createRange(); range.selectNodeContents(el); window.getSelection().removeAllRanges(); window.getSelection().addRange(range); } catch {}
  el.onblur = () => { r.title = el.textContent.trim() || r.title; el.contentEditable = 'false'; renderReminders(reminders); };
  el.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); el.blur(); } };
}

function editReminderContent(id) {
  const r = reminders.find(x => x.id === id);
  if (!r) return;
  const el = document.querySelector(`#ri-${id} .ri-content`);
  if (!el) return;
  el.contentEditable = 'true';
  el.textContent = r.content;
  el.focus();
  el.onblur = () => { r.content = el.textContent.trim(); el.contentEditable = 'false'; renderReminders(reminders); };
}

// ─────────────────── HOTELS ───────────────────

function initHotelMapIfNeeded() {
  if (hotelMapInitialized) { hotelMap && hotelMap.invalidateSize(); return; }
  hotelMap = L.map('hotelMap', {
    center: [34.686, 135.498], zoom: 13,
    zoomControl: true, preferCanvas: true
  });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap', maxZoom: 19
  }).addTo(hotelMap);
  hotelMarkersGroup = L.layerGroup().addTo(hotelMap);
  hotelMapInitialized = true;
  renderHotelMarkers();
}

function renderHotels() {
  const grid = document.getElementById('hotelGrid');
  if (!grid) return;
  const filtered = getFilteredHotels();
  // Group by area
  const areas = {};
  filtered.forEach(h => {
    if (!areas[h.area]) areas[h.area] = [];
    areas[h.area].push(h);
  });
  grid.innerHTML = '';
  if (filtered.length === 0) {
    grid.innerHTML = '<p style="color:var(--text3);font-size:13px;padding:20px">沒有符合條件的酒店</p>';
    return;
  }
  Object.entries(areas).forEach(([area, hotels]) => {
    const areaWrap = document.createElement('div');
    areaWrap.className = 'hotel-area-group';
    areaWrap.innerHTML = `<div class="hotel-area-title"><i class="fa fa-location-dot"></i> ${area} <span class="hat-count">${hotels.length}</span></div>`;
    hotels.forEach(h => { areaWrap.appendChild(buildHotelCard(h)); });
    grid.appendChild(areaWrap);
  });
}

function getFilteredHotels() {
  let list = [...HOTELS, ...CUSTOM_HOTELS];
  if (hotelCurrentFilter !== 'all') list = list.filter(h => h.area === hotelCurrentFilter);
  if (hotelSearchQuery) {
    const q = hotelSearchQuery.toLowerCase();
    list = list.filter(h =>
      h.name.toLowerCase().includes(q) ||
      (h.nameCht || '').toLowerCase().includes(q) ||
      (h.nameEn  || '').toLowerCase().includes(q) ||
      (h.recommend || '').includes(q) ||
      (h.access  || '').includes(q));
  }
  if (hotelCurrentSort === 'rating') list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  if (hotelCurrentSort === 'price')  list.sort((a, b) => (a.priceHKD || 9999) - (b.priceHKD || 9999));
  if (hotelCurrentSort === 'stars')  list.sort((a, b) => (b.stars || 0) - (a.stars || 0));
  return list;
}

const AREA_COLORS = { '難波・道頓堀': '#e85d04', '梅田・北區': '#3a86ff', '其他地區': '#2cb67d' };

function buildHotelCard(h) {
  const card = document.createElement('div');
  card.className = 'hotel-card' + (h.custom ? ' hotel-card-custom' : '');
  card.id = `hcard-${h.id}`;
  const areaColor = AREA_COLORS[h.area] || '#888';
  const stars = '★'.repeat(h.stars || 0) + '☆'.repeat(Math.max(0, 5 - (h.stars || 0)));
  const ratingBar = h.rating ? `<span class="hotel-rating"><i class="fa fa-star" style="color:#ffb703"></i> ${h.rating}</span><span style="font-size:10px;color:var(--text3)">(${(h.review||0).toLocaleString()}則)</span>` : '';
  const tagsHtml = (h.tags || []).map(t => `<span class="hotel-tag">${t}</span>`).join('');
  const amenitiesHtml = (h.amenities || []).slice(0, 5).map(a => `<span class="hotel-amenity"><i class="fa fa-check" style="color:var(--success)"></i> ${a}</span>`).join('');
  card.innerHTML = `
    <div class="hotel-card-img-wrap">
      <img src="${h.img || ''}" alt="${h.nameCht || h.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'" />
      <div class="hotel-card-area-badge" style="background:${areaColor}">${h.area}</div>
      ${h.stars ? `<div class="hotel-card-stars">${stars}</div>` : ''}
    </div>
    <div class="hotel-card-body">
      <div class="hotel-card-title">${h.nameCht || h.name}</div>
      <div class="hotel-card-name-en">${h.nameEn || h.name}</div>
      <div class="hotel-card-rating">${ratingBar}</div>
      <div class="hotel-card-price">
        <span class="hcp-hkd">HK$${(h.priceHKD || 0).toLocaleString()}</span>
        <span class="hcp-label">/晚起</span>
        ${h.priceJPY ? `<span class="hcp-jpy">¥${h.priceJPY.toLocaleString()}</span>` : ''}
      </div>
      <div class="hotel-card-access"><i class="fa fa-train-subway"></i> ${h.access || ''}</div>
      <div class="hotel-card-tags">${tagsHtml}</div>
      <div class="hotel-card-recommend">${h.recommend || h.desc || ''}</div>
      ${amenitiesHtml ? `<div class="hotel-amenities">${amenitiesHtml}</div>` : ''}
      <div class="hotel-card-actions">
        <button class="hca-btn hca-map" onclick="showHotelOnMap('${h.id}')" title="地圖顯示">
          <i class="fa fa-location-dot"></i> 地圖
        </button>
        <button class="hca-btn hca-add" onclick="openAddToDayModal('${h.id}')">
          <i class="fa fa-calendar-plus"></i> 加入行程
        </button>
        ${h.url ? `<a class="hca-btn hca-web" href="${h.url}" target="_blank" rel="noopener"><i class="fa fa-arrow-up-right-from-square"></i> 官網</a>` : ''}
        ${h.custom ? `<button class="hca-btn hca-del" onclick="removeCustomHotel('${h.id}')" title="移除"><i class="fa fa-trash"></i></button>` : ''}
      </div>
    </div>`;
  return card;
}

function renderHotelMarkers() {
  if (!hotelMarkersGroup) return;
  hotelMarkersGroup.clearLayers();
  const filtered = getFilteredHotels();
  const bounds = [];
  filtered.forEach(h => {
    if (!h.lat || !h.lng) return;
    const areaColor = AREA_COLORS[h.area] || '#888';
    const icon = L.divIcon({
      html: `<div style="background:${areaColor};color:white;border:2px solid white;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.4);">${(h.stars || 3)}</div>`,
      className: '', iconSize: [26, 26], iconAnchor: [13, 13]
    });
    L.marker([h.lat, h.lng], { icon })
      .addTo(hotelMarkersGroup)
      .bindPopup(`
        <div style="min-width:180px">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px">${h.nameCht || h.name}</div>
          <div style="font-size:11px;color:#666;margin-bottom:4px"><i class="fa fa-train-subway" style="color:#e85d04"></i> ${h.access || ''}</div>
          <div style="font-size:14px;font-weight:700;color:#ffb703;margin-bottom:8px">HK$${(h.priceHKD||0).toLocaleString()}/晚起</div>
          <button onclick="openAddToDayModal('${h.id}')" style="width:100%;padding:6px;background:linear-gradient(135deg,#e85d04,#f72585);color:white;border:none;border-radius:7px;font-size:11px;font-weight:600;cursor:pointer">
            <i class="fa fa-calendar-plus"></i> 加入行程
          </button>
        </div>`, { maxWidth: 220 });
    bounds.push([h.lat, h.lng]);
  });
  if (bounds.length > 0) {
    try { hotelMap && hotelMap.fitBounds(L.latLngBounds(bounds).pad(0.2)); } catch {}
  }
}

function showHotelOnMap(id) {
  initHotelMapIfNeeded();
  const h = [...HOTELS, ...CUSTOM_HOTELS].find(x => x.id === id);
  if (!h || !h.lat || !h.lng) { showToast('此酒店暫無地圖座標', 'error'); return; }
  hotelMap.setView([h.lat, h.lng], 16);
  // Open popup of this marker
  hotelMarkersGroup.eachLayer(layer => {
    if (layer.getLatLng) {
      const ll = layer.getLatLng();
      if (Math.abs(ll.lat - h.lat) < 0.0001 && Math.abs(ll.lng - h.lng) < 0.0001) {
        layer.openPopup();
      }
    }
  });
  // Also scroll card into view
  const card = document.getElementById(`hcard-${id}`);
  if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function fitHotelBounds() {
  renderHotelMarkers();
}

function focusHotelArea(area) {
  filterHotelsByArea(area, null);
  // Update filter chip UI
  document.querySelectorAll('#hotelAreaFilter .fc').forEach(btn => {
    btn.classList.toggle('active', btn.textContent.includes(area.replace('・', '')));
  });
}

function filterHotelsByArea(area, btn) {
  hotelCurrentFilter = area;
  if (btn) {
    document.querySelectorAll('#hotelAreaFilter .fc').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }
  renderHotels();
  renderHotelMarkers();
}

function filterHotels() {
  hotelSearchQuery = (document.getElementById('hotelSearch')?.value || '').trim();
  renderHotels();
  renderHotelMarkers();
}

function sortHotels(key, btn) {
  hotelCurrentSort = key;
  document.querySelectorAll('.hotel-sort-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderHotels();
}

// ── Add-to-Day Modal ──
function openAddToDayModal(hotelId) {
  const h = [...HOTELS, ...CUSTOM_HOTELS].find(x => x.id === hotelId);
  if (!h) return;
  addToDayTarget = h;
  document.getElementById('atdHotelName').textContent = `加入「${h.nameCht || h.name}」到哪天行程？`;
  const dayList = document.getElementById('atdDayList');
  dayList.innerHTML = '';
  const days = plan.days || {};
  const dayKeys = Object.keys(days);
  if (dayKeys.length === 0) { showToast('行程資料未載入，請先到行程規劃tab', 'error'); return; }
  dayKeys.forEach(dk => {
    const d = days[dk];
    const btn = document.createElement('button');
    btn.className = 'atd-day-btn';
    btn.innerHTML = `<span class="atd-day-num">${dk.replace('day', '第') + '天'}</span><span class="atd-day-title">${d.title || dk}</span><span class="atd-day-date" style="font-size:10px;color:var(--text3)">${d.date || ''}</span>`;
    btn.onclick = () => addHotelToDay(dk);
    dayList.appendChild(btn);
  });
  document.getElementById('addToDayModal').style.display = 'flex';
}

function closeAddToDayModal() {
  document.getElementById('addToDayModal').style.display = 'none';
  addToDayTarget = null;
}

function addHotelToDay(dayKey) {
  if (!addToDayTarget) return;
  const h = addToDayTarget;
  const newItem = {
    type: 'custom',
    id: h.id,
    name: `🏨 ${h.nameCht || h.name}`,
    lat: h.lat, lng: h.lng,
    time: '15:00',
    note: `${h.access || ''} | HK$${h.priceHKD || '?'}/晚起`
  };
  if (!plan.days[dayKey]) plan.days[dayKey] = { items: [] };
  if (!plan.days[dayKey].items) plan.days[dayKey].items = [];
  plan.days[dayKey].items.push(newItem);
  closeAddToDayModal();
  showToast(`✅ 已將「${h.nameCht || h.name}」加入第${dayKey.replace('day','')}天行程`, 'success');
  if (currentDay === dayKey) renderDayContent(currentDay);
}

// ── Custom Hotel Geocode + Add ──
async function geocodeCustomHotel() {
  const addressInput = document.getElementById('chfAddress')?.value?.trim();
  if (!addressInput) { showToast('請輸入地址或酒店英文名称', 'error'); return; }
  const status = document.getElementById('geocodeStatus');
  // Check for direct coordinate input
  const coords = parseCoordinates(addressInput);
  if (coords) {
    pendingCustomHotelCoords = { lat: coords.lat, lng: coords.lng };
    status.innerHTML = `<i class="fa fa-check" style="color:var(--success)"></i> 座標定位：緯度 ${coords.lat.toFixed(6)}, 經度 ${coords.lng.toFixed(6)}`;
    initHotelMapIfNeeded();
    hotelMap.setView([coords.lat, coords.lng], 16);
    L.popup({ maxWidth: 200 })
      .setLatLng([coords.lat, coords.lng])
      .setContent(`<b>📍 座標定位</b><br>緯度 ${coords.lat.toFixed(6)}, 經度 ${coords.lng.toFixed(6)}`)
      .openOn(hotelMap);
    return;
  }
  status.textContent = '定位中...';
  try {
    const q = encodeURIComponent(addressInput + ' Osaka Japan');
    const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`, {
      headers: { 'Accept-Language': 'zh-TW,en' }
    });
    const data = await res.json();
    if (data && data.length > 0) {
      pendingCustomHotelCoords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      status.innerHTML = `<i class="fa fa-check" style="color:var(--success)"></i> 已定位：${data[0].display_name.substring(0, 60)}...`;
      // Show on hotel map
      initHotelMapIfNeeded();
      hotelMap.setView([pendingCustomHotelCoords.lat, pendingCustomHotelCoords.lng], 16);
      L.popup({ maxWidth: 200 })
        .setLatLng([pendingCustomHotelCoords.lat, pendingCustomHotelCoords.lng])
        .setContent(`<b>📍 定位結果</b><br>${data[0].display_name.substring(0, 80)}`)
        .openOn(hotelMap);
    } else {
      status.textContent = '找不到位置，請嘗試更精確的地址或英文名稱';
    }
  } catch { status.textContent = '定位失敗，請稍後再試'; }
}

function addCustomHotelToList() {
  const name = document.getElementById('chfName')?.value?.trim();
  if (!name) { showToast('請輸入酒店名稱', 'error'); return; }
  const area = document.getElementById('chfArea')?.value || '其他地區';
  const price = parseInt(document.getElementById('chfPrice')?.value) || 0;
  const note = document.getElementById('chfNote')?.value?.trim() || '';
  const id = 'custom_h_' + Date.now();
  const newHotel = {
    id, custom: true, area,
    name, nameCht: name, nameEn: name,
    stars: 0, priceHKD: price, priceJPY: 0,
    lat: pendingCustomHotelCoords?.lat || null,
    lng: pendingCustomHotelCoords?.lng || null,
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400',
    rating: 0, review: 0, tags: ['自訂'],
    amenities: [], desc: note, recommend: note,
    access: note
  };
  CUSTOM_HOTELS.push(newHotel);
  // Clear form
  ['chfName','chfAddress','chfPrice','chfNote'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  document.getElementById('geocodeStatus').textContent = '';
  pendingCustomHotelCoords = null;
  renderHotels();
  renderHotelMarkers();
  showToast(`✅ 已新增「${name}」到列表`, 'success');
  // Scroll to new card
  setTimeout(() => {
    const card = document.getElementById(`hcard-${id}`);
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function removeCustomHotel(id) {
  const idx = CUSTOM_HOTELS.findIndex(h => h.id === id);
  if (idx !== -1) CUSTOM_HOTELS.splice(idx, 1);
  renderHotels();
  renderHotelMarkers();
  showToast('已移除自訂酒店', 'success');
}

// ─────────────────── LOCATION MEASURE TAB ───────────────────
let locMap = null;
let locMapInitialized = false;
let locPins = [];           // user-placed pins { id, category, name, lat, lng, price, note, link, visible }
let locDayOverlays = {};    // { dayKey: { visible, layerGroup } }
let locTrainOverlays = {};  // { lineIndex: { visible, layerGroup } }
let locPinLayers = {};      // { pinId: L.Marker }
let locCatVisibility = {};  // { category: boolean }
let locMeasureMode = false;
let locMeasurePoints = [];
let locMeasureLayers = [];
let locSatellite = false;
let locTileLayer = null;
let locSatelliteLayer = null;
let locSidebarCollapsed = false;
let locGeocodeLat = null;
let locGeocodeLng = null;
let locAttrOverlays = {};    // { attrId: { visible, marker } }
let locKeyLocOverlays = {};  // { keyId: { visible, marker } }

// Initialize location map when tab is opened
function initLocMapIfNeeded() {
  if (locMapInitialized) { locMap && locMap.invalidateSize(); return; }

  locMap = L.map('locMap', {
    center: [34.6937, 135.5022], zoom: 13,
    zoomControl: true, preferCanvas: true
  });

  locTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors', maxZoom: 19
  }).addTo(locMap);

  locSatelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '© Esri', maxZoom: 19
  });

  locMapInitialized = true;

  // Init category visibility
  LOCATION_CATEGORIES.forEach(c => { locCatVisibility[c.key] = true; });

  // Click handler for measure mode
  locMap.on('click', onLocMapClick);

  // Load saved pins
  loadLocPins();

  // Build UI controls
  renderLocDayToggles();
  renderLocAttrToggles();
  renderLocKeyLocToggles();
  renderLocCatToggles();
  renderLocTrainToggles();
  renderLocPinList();
}

// ── Map Click (measure mode) ──
function onLocMapClick(e) {
  if (!locMeasureMode) return;
  locMeasurePoints.push(e.latlng);

  // Add marker for clicked point
  const m = L.circleMarker(e.latlng, {
    radius: 6, color: '#f72585', fillColor: '#f72585', fillOpacity: 1, weight: 2
  }).addTo(locMap);
  locMeasureLayers.push(m);

  if (locMeasurePoints.length >= 2) {
    // Draw polyline & show distance
    const line = L.polyline(locMeasurePoints, {
      color: '#f72585', weight: 3, dashArray: '6 4', opacity: 0.8
    }).addTo(locMap);
    locMeasureLayers.push(line);

    // Calculate total distance
    let totalDist = 0;
    for (let i = 1; i < locMeasurePoints.length; i++) {
      totalDist += locMeasurePoints[i - 1].distanceTo(locMeasurePoints[i]);
    }

    const resultEl = document.getElementById('locMeasureResult');
    if (resultEl) {
      let distStr = totalDist > 1000 ? `${(totalDist / 1000).toFixed(2)} km` : `${Math.round(totalDist)} m`;
      const walkTime = Math.round(totalDist / 80); // ~80m/min walk speed
      resultEl.style.display = 'block';
      resultEl.innerHTML = `
        <div style="font-weight:700;color:var(--accent);margin-bottom:4px">📏 測量結果</div>
        <div>直線距離: <strong>${distStr}</strong></div>
        <div>估計步行: <strong>約 ${walkTime} 分鐘</strong></div>
        <div style="font-size:10px;color:var(--text3);margin-top:4px">${locMeasurePoints.length} 個測量點</div>`;
    }
  }
}

function toggleMeasureMode() {
  locMeasureMode = !locMeasureMode;
  const btn = document.getElementById('locMeasureBtn');
  const txt = document.getElementById('locMeasureBtnText');
  const layout = document.querySelector('.loc-layout');
  if (locMeasureMode) {
    btn.style.background = '#f72585';
    txt.textContent = '測量中...點擊地圖';
    layout && layout.classList.add('loc-measure-active');
    locMeasurePoints = [];
    clearMeasureLine();
  } else {
    btn.style.background = 'var(--accent)';
    txt.textContent = '啟動測量';
    layout && layout.classList.remove('loc-measure-active');
  }
}

function clearMeasureLine() {
  locMeasureLayers.forEach(l => locMap && locMap.removeLayer(l));
  locMeasureLayers = [];
  locMeasurePoints = [];
  const resultEl = document.getElementById('locMeasureResult');
  if (resultEl) resultEl.style.display = 'none';
}

// ── Section Collapse ──
function toggleLocSection(sectionId) {
  const body = document.getElementById(`body-${sectionId}`);
  const arrow = document.getElementById(`arrow-${sectionId}`);
  if (!body) return;
  body.classList.toggle('hidden');
  if (arrow) arrow.classList.toggle('collapsed', body.classList.contains('hidden'));
}

// ── Day Overlay Toggles ──
function renderLocDayToggles() {
  const container = document.getElementById('locDayToggles');
  if (!container) return;
  const days = ['day1', 'day2', 'day3', 'day4', 'day5', 'day6'];
  container.innerHTML = days.map(dk => {
    const d = plan.days?.[dk];
    if (!d) return '';
    const color = DAY_COLORS[dk];
    const icon = DAY_ICONS[dk];
    const count = (d.items || []).filter(i => getItemCoords(i)).length;
    const isActive = locDayOverlays[dk]?.visible;
    return `<div class="loc-toggle-row ${isActive ? 'active' : ''}" onclick="toggleLocDay('${dk}')">
      <div class="loc-toggle-dot" style="background:${color}"></div>
      <span class="loc-toggle-label">${icon} 第${dk.replace('day', '')}天 · ${d.title || ''}</span>
      <span style="font-size:10px;color:var(--text3)">${count}點</span>
      <div class="loc-toggle-check"><i class="fa fa-check"></i></div>
    </div>`;
  }).join('');
}

function toggleLocDay(dayKey) {
  if (!locDayOverlays[dayKey]) {
    locDayOverlays[dayKey] = { visible: false, layerGroup: L.layerGroup() };
    locDayOverlays[dayKey].layerGroup.addTo(locMap);
  }
  const overlay = locDayOverlays[dayKey];
  overlay.visible = !overlay.visible;

  if (overlay.visible) {
    renderLocDayMarkers(dayKey);
  } else {
    overlay.layerGroup.clearLayers();
  }
  renderLocDayToggles();
}

function renderLocDayMarkers(dayKey) {
  const overlay = locDayOverlays[dayKey];
  if (!overlay) return;
  overlay.layerGroup.clearLayers();

  const dayData = plan.days?.[dayKey];
  if (!dayData?.items) return;

  const color = DAY_COLORS[dayKey];
  const coords = [];

  dayData.items.forEach((item, idx) => {
    const pos = getItemCoords(item);
    if (!pos) return;
    const icon = createNumberedIcon(idx + 1, color);
    L.marker([pos.lat, pos.lng], { icon })
      .addTo(overlay.layerGroup)
      .bindPopup(`
        <div class="popup-title" style="color:${color}">${DAY_ICONS[dayKey]} 第${dayKey.replace('day', '')}天 #${idx + 1}</div>
        <div class="popup-sub" style="font-weight:600">${item.name}</div>
        <div class="popup-sub">${item.time || ''} ${item.note ? '· ' + item.note : ''}</div>
      `);
    coords.push([pos.lat, pos.lng]);
  });

  // Draw route line
  if (coords.length >= 2) {
    const poly = L.polyline(coords, { color, weight: 3, opacity: 0.6, dashArray: '8 6' })
      .addTo(overlay.layerGroup);
    if (typeof L.polylineDecorator === 'function') {
      L.polylineDecorator(poly, {
        patterns: [{
          offset: '50%', repeat: 0,
          symbol: L.Symbol.arrowHead({ pixelSize: 12, pathOptions: { color, fillOpacity: 1, weight: 0 } })
        }]
      }).addTo(overlay.layerGroup);
    }
  }
}

// ── Attractions Overlay ──
function renderLocAttrToggles(filter) {
  const container = document.getElementById('locAttrToggles');
  if (!container || typeof ATTRACTIONS === 'undefined') return;
  const q = (filter || document.getElementById('locAttrSearch')?.value || '').toLowerCase();
  const list = q ? ATTRACTIONS.filter(a => a.name.toLowerCase().includes(q) || a.region.toLowerCase().includes(q)) : ATTRACTIONS;
  container.innerHTML = list.map(a => {
    const isActive = locAttrOverlays[a.id]?.visible;
    return `<div class="loc-toggle-row ${isActive ? 'active' : ''}" onclick="toggleLocAttr(${a.id})" style="padding:5px 8px">
      <div class="loc-toggle-dot" style="background:#2cb67d"></div>
      <span class="loc-toggle-label" style="font-size:11px">${a.name}</span>
      <span style="font-size:9px;color:var(--text3)">${a.region.split('・')[1] || a.region}</span>
      <div class="loc-toggle-check"><i class="fa fa-check"></i></div>
    </div>`;
  }).join('');
}

function filterLocAttrList() {
  renderLocAttrToggles();
}

function toggleLocAttr(id) {
  const a = ATTRACTIONS.find(x => x.id === id);
  if (!a) return;
  if (!locAttrOverlays[id]) locAttrOverlays[id] = { visible: false, marker: null };
  const ov = locAttrOverlays[id];
  ov.visible = !ov.visible;
  if (ov.visible) {
    const icon = L.divIcon({
      html: `<div style="background:#2cb67d;color:white;border:2.5px solid white;border-radius:50% 50% 50% 0;width:30px;height:30px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.5);transform:rotate(-45deg)"><span style="transform:rotate(45deg);font-size:10px;font-weight:800">${a.id}</span></div>`,
      className: '', iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -30]
    });
    ov.marker = L.marker([a.lat, a.lng], { icon })
      .addTo(locMap)
      .bindPopup(`<div style="min-width:180px"><div style="font-weight:700;font-size:13px;margin-bottom:3px">${a.name}</div><div style="font-size:10px;color:#2cb67d;font-weight:600;margin-bottom:4px">${a.region}</div><div style="font-size:11px;color:#666;margin-bottom:4px">${a.desc}</div><div style="font-size:12px;color:#ffb703;font-weight:700">HK$${a.priceHKD} / ¥${a.priceJPY}</div></div>`, { maxWidth: 240 });
    locMap.setView([a.lat, a.lng], 15);
  } else {
    if (ov.marker) { locMap.removeLayer(ov.marker); ov.marker = null; }
  }
  renderLocAttrToggles();
}

function toggleAllLocAttr(show) {
  if (typeof ATTRACTIONS === 'undefined') return;
  ATTRACTIONS.forEach(a => {
    if (!locAttrOverlays[a.id]) locAttrOverlays[a.id] = { visible: false, marker: null };
    const ov = locAttrOverlays[a.id];
    if (show && !ov.visible) {
      ov.visible = true;
      const icon = L.divIcon({
        html: `<div style="background:#2cb67d;color:white;border:2.5px solid white;border-radius:50% 50% 50% 0;width:30px;height:30px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.5);transform:rotate(-45deg)"><span style="transform:rotate(45deg);font-size:10px;font-weight:800">${a.id}</span></div>`,
        className: '', iconSize: [30, 30], iconAnchor: [15, 30], popupAnchor: [0, -30]
      });
      ov.marker = L.marker([a.lat, a.lng], { icon })
        .addTo(locMap)
        .bindPopup(`<div style="min-width:180px"><div style="font-weight:700;font-size:13px;margin-bottom:3px">${a.name}</div><div style="font-size:10px;color:#2cb67d;font-weight:600;margin-bottom:4px">${a.region}</div><div style="font-size:11px;color:#666;margin-bottom:4px">${a.desc}</div><div style="font-size:12px;color:#ffb703;font-weight:700">HK$${a.priceHKD} / ¥${a.priceJPY}</div></div>`, { maxWidth: 240 });
    } else if (!show && ov.visible) {
      ov.visible = false;
      if (ov.marker) { locMap.removeLayer(ov.marker); ov.marker = null; }
    }
  });
  renderLocAttrToggles();
}

// ── Key Locations ──
function renderLocKeyLocToggles() {
  const container = document.getElementById('locKeyLocToggles');
  if (!container || typeof KEY_LOCATIONS === 'undefined') return;
  container.innerHTML = KEY_LOCATIONS.map(kl => {
    const isActive = locKeyLocOverlays[kl.id]?.visible;
    return `<div class="loc-toggle-row ${isActive ? 'active' : ''}" onclick="toggleLocKeyLoc('${kl.id}')">
      <div class="loc-toggle-dot" style="background:${kl.color}"></div>
      <span class="loc-toggle-label">${kl.name}</span>
      <div class="loc-toggle-check"><i class="fa fa-check"></i></div>
    </div>`;
  }).join('');
}

function toggleLocKeyLoc(id) {
  const kl = KEY_LOCATIONS.find(x => x.id === id);
  if (!kl) return;
  if (!locKeyLocOverlays[id]) locKeyLocOverlays[id] = { visible: false, marker: null };
  const ov = locKeyLocOverlays[id];
  ov.visible = !ov.visible;
  if (ov.visible) {
    const icon = L.divIcon({
      html: `<div style="background:${kl.color};color:white;border:3px solid white;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,0.5)"><i class="fa ${kl.icon}" style="font-size:14px"></i></div>`,
      className: '', iconSize: [32, 32], iconAnchor: [16, 16], popupAnchor: [0, -16]
    });
    ov.marker = L.marker([kl.lat, kl.lng], { icon })
      .addTo(locMap)
      .bindPopup(`<div style="min-width:180px"><div style="font-weight:700;font-size:14px;margin-bottom:4px">${kl.name}</div><div style="font-size:11px;color:#666">${kl.desc}</div><div style="font-size:10px;color:#999;margin-top:4px">${kl.lat.toFixed(5)}, ${kl.lng.toFixed(5)}</div></div>`, { maxWidth: 240 });
    locMap.setView([kl.lat, kl.lng], 16);
    ov.marker.openPopup();
  } else {
    if (ov.marker) { locMap.removeLayer(ov.marker); ov.marker = null; }
  }
  renderLocKeyLocToggles();
}

// ── Category Visibility Toggles ──
function renderLocCatToggles() {
  const container = document.getElementById('locCatToggles');
  if (!container) return;
  container.innerHTML = LOCATION_CATEGORIES.map(c => {
    const isActive = locCatVisibility[c.key] !== false;
    const count = locPins.filter(p => p.category === c.key).length;
    return `<div class="loc-toggle-row ${isActive ? 'active' : ''}" onclick="toggleLocCat('${c.key}')">
      <div class="loc-toggle-dot" style="background:${c.color}"></div>
      <span class="loc-toggle-label">${c.label}</span>
      <span style="font-size:10px;color:var(--text3)">${count}</span>
      <div class="loc-toggle-check"><i class="fa fa-check"></i></div>
    </div>`;
  }).join('');
}

function toggleLocCat(catKey) {
  locCatVisibility[catKey] = !locCatVisibility[catKey];
  refreshLocPinVisibility();
  renderLocCatToggles();
}

function refreshLocPinVisibility() {
  locPins.forEach(pin => {
    const marker = locPinLayers[pin.id];
    if (!marker) return;
    const catVisible = locCatVisibility[pin.category] !== false;
    const pinVisible = pin.visible !== false;
    if (catVisible && pinVisible) {
      if (!locMap.hasLayer(marker)) locMap.addLayer(marker);
    } else {
      if (locMap.hasLayer(marker)) locMap.removeLayer(marker);
    }
  });
}

// ── Train Line Toggles ──
function renderLocTrainToggles() {
  const container = document.getElementById('locTrainToggles');
  if (!container || !OSAKA_TRAIN_LINES) return;
  container.innerHTML = OSAKA_TRAIN_LINES.map((line, idx) => {
    const isActive = locTrainOverlays[idx]?.visible;
    return `<div class="loc-toggle-row ${isActive ? 'active' : ''}" onclick="toggleLocTrainLine(${idx})">
      <div class="loc-toggle-dot" style="background:${line.color}"></div>
      <span class="loc-toggle-label">${line.code} ${line.name}</span>
      <span style="font-size:10px;color:var(--text3)">${line.stations.length}站</span>
      <div class="loc-toggle-check"><i class="fa fa-check"></i></div>
    </div>`;
  }).join('');
}

function toggleLocTrainLine(idx) {
  if (!locTrainOverlays[idx]) {
    locTrainOverlays[idx] = { visible: false, layerGroup: L.layerGroup() };
    locTrainOverlays[idx].layerGroup.addTo(locMap);
  }
  const overlay = locTrainOverlays[idx];
  overlay.visible = !overlay.visible;

  if (overlay.visible) {
    renderTrainLine(idx);
  } else {
    overlay.layerGroup.clearLayers();
  }
  renderLocTrainToggles();
}

function renderTrainLine(idx) {
  const line = OSAKA_TRAIN_LINES[idx];
  if (!line) return;
  const overlay = locTrainOverlays[idx];
  if (!overlay) return;
  overlay.layerGroup.clearLayers();

  const coords = line.stations.map(s => [s.lat, s.lng]);

  // Draw line
  L.polyline(coords, { color: line.color, weight: 4, opacity: 0.85 }).addTo(overlay.layerGroup);

  // Draw station markers
  line.stations.forEach(s => {
    const icon = L.divIcon({
      html: `<div style="background:${line.color};color:white;border:2px solid white;border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:700;box-shadow:0 1px 4px rgba(0,0,0,0.4)">${line.code.charAt(0)}</div>`,
      className: '', iconSize: [16, 16], iconAnchor: [8, 8]
    });
    L.marker([s.lat, s.lng], { icon })
      .addTo(overlay.layerGroup)
      .bindTooltip(`${line.code} ${s.name}`, { permanent: false, direction: 'top', offset: [0, -8] });
  });
}

function toggleAllTrainLines(show) {
  OSAKA_TRAIN_LINES.forEach((_, idx) => {
    if (!locTrainOverlays[idx]) {
      locTrainOverlays[idx] = { visible: false, layerGroup: L.layerGroup() };
      locTrainOverlays[idx].layerGroup.addTo(locMap);
    }
    locTrainOverlays[idx].visible = show;
    if (show) {
      renderTrainLine(idx);
    } else {
      locTrainOverlays[idx].layerGroup.clearLayers();
    }
  });
  renderLocTrainToggles();
}

// ── Geocode & Add Pins ──
async function geocodeLocPin() {
  const query = document.getElementById('locPinSearch')?.value?.trim();
  if (!query) { showToast('請輸入搜尋地址', ''); return; }
  // Check for direct coordinate input
  const coords = parseCoordinates(query);
  if (coords) {
    locGeocodeLat = coords.lat;
    locGeocodeLng = coords.lng;
    const resultEl = document.getElementById('locGeocodeResult');
    if (resultEl) {
      resultEl.style.display = 'block';
      resultEl.style.background = '';
      resultEl.style.borderColor = '';
      resultEl.style.color = '';
      resultEl.innerHTML = `✅ 座標定位: 緯度 ${coords.lat.toFixed(6)}, 經度 ${coords.lng.toFixed(6)}`;
    }
    locMap.setView([coords.lat, coords.lng], 16);
    showToast('✅ 座標定位成功', 'success');
    return;
  }
  showToast('🔍 搜尋位置中...', '');
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' 大阪 日本')}&format=json&limit=5`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'zh-TW,ja,en' } });
    const data = await res.json();
    if (data && data.length > 0) {
      locGeocodeLat = parseFloat(data[0].lat);
      locGeocodeLng = parseFloat(data[0].lon);
      const displayName = data[0].display_name;
      const resultEl = document.getElementById('locGeocodeResult');
      if (resultEl) {
        resultEl.style.display = 'block';
        resultEl.style.background = '';
        resultEl.style.borderColor = '';
        resultEl.style.color = '';
        resultEl.innerHTML = `✅ 已定位: ${displayName.length > 80 ? displayName.slice(0, 80) + '…' : displayName}<br><span style="font-size:10px;color:var(--text3)">緯度 ${locGeocodeLat.toFixed(5)}, 經度 ${locGeocodeLng.toFixed(5)}</span>`;
      }
      // Show preview on map
      locMap.setView([locGeocodeLat, locGeocodeLng], 16);
      showToast('✅ 已找到位置', 'success');
    } else {
      locGeocodeLat = null; locGeocodeLng = null;
      const resultEl = document.getElementById('locGeocodeResult');
      if (resultEl) {
        resultEl.style.display = 'block';
        resultEl.innerHTML = '❌ 找不到位置，請嘗試更詳細的地址（如日文或英文全名）';
        resultEl.style.background = 'rgba(235,87,87,0.08)';
        resultEl.style.borderColor = 'rgba(235,87,87,0.2)';
        resultEl.style.color = 'var(--danger)';
      }
    }
  } catch {
    showToast('❌ 搜尋失敗', 'error');
  }
}

function addLocPin() {
  const name = document.getElementById('locPinName')?.value?.trim();
  const category = document.getElementById('locPinCat')?.value || 'other';
  const price = document.getElementById('locPinPrice')?.value?.trim() || '';
  const note = document.getElementById('locPinNote')?.value?.trim() || '';
  const link = document.getElementById('locPinLink')?.value?.trim() || '';

  if (!name) { showToast('請輸入名稱', ''); return; }
  if (locGeocodeLat === null || locGeocodeLng === null) {
    showToast('請先搜尋位置', ''); return;
  }

  const pin = {
    id: 'loc_' + Date.now(),
    category,
    name,
    lat: locGeocodeLat,
    lng: locGeocodeLng,
    price,
    note,
    link,
    visible: true
  };

  locPins.push(pin);
  addPinMarker(pin);
  renderLocPinList();
  renderLocCatToggles();

  // Clear form
  document.getElementById('locPinName').value = '';
  document.getElementById('locPinSearch').value = '';
  document.getElementById('locPinPrice').value = '';
  document.getElementById('locPinNote').value = '';
  document.getElementById('locPinLink').value = '';
  const resultEl = document.getElementById('locGeocodeResult');
  if (resultEl) { resultEl.style.display = 'none'; resultEl.style.background = ''; resultEl.style.borderColor = ''; resultEl.style.color = ''; }
  locGeocodeLat = null;
  locGeocodeLng = null;

  showToast(`✅ ${name} 已加入地圖`, 'success');
}

function addPinMarker(pin) {
  if (!locMap) return;
  const cat = LOCATION_CATEGORIES.find(c => c.key === pin.category) || LOCATION_CATEGORIES[5];
  const icon = L.divIcon({
    html: `<div style="background:${cat.color};color:white;border:2px solid white;border-radius:50% 50% 50% 0;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,0.4);transform:rotate(-45deg)"><i class="fa ${cat.icon}" style="transform:rotate(45deg);font-size:11px"></i></div>`,
    className: '', iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28]
  });

  const linkHTML = pin.link ? `<a href="${pin.link}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:#3a86ff;text-decoration:none;margin-bottom:4px;font-weight:600"><i class="fa fa-external-link"></i> 查看連結</a>` : '';

  const marker = L.marker([pin.lat, pin.lng], { icon })
    .bindPopup(`
      <div style="min-width:180px">
        <div style="font-weight:700;font-size:13px;margin-bottom:3px">${pin.name}</div>
        <div style="font-size:10px;color:${cat.color};font-weight:600;margin-bottom:4px">${cat.label}</div>
        ${pin.price ? `<div style="font-size:12px;color:#ffb703;font-weight:700;margin-bottom:4px">💰 ${pin.price}</div>` : ''}
        ${pin.note ? `<div style="font-size:11px;color:#666;margin-bottom:4px">${pin.note}</div>` : ''}
        ${linkHTML}
        <div style="font-size:10px;color:#999;margin-bottom:4px">${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}</div>
        <div style="display:flex;gap:6px">
          <button onclick="editLocPin('${pin.id}')" style="flex:1;padding:5px;border-radius:6px;background:rgba(58,134,255,0.12);color:#3a86ff;border:1px solid rgba(58,134,255,0.3);font-size:11px;cursor:pointer;font-weight:600">
            <i class="fa fa-pen"></i> 編輯
          </button>
          <button onclick="removeLocPin('${pin.id}')" style="flex:1;padding:5px;border-radius:6px;background:rgba(235,87,87,0.15);color:#eb5757;border:1px solid rgba(235,87,87,0.3);font-size:11px;cursor:pointer;font-weight:600">
            <i class="fa fa-trash"></i> 移除
          </button>
        </div>
      </div>`, { maxWidth: 240 });

  // Only add to map if category + pin is visible
  const catVisible = locCatVisibility[pin.category] !== false;
  const pinVisible = pin.visible !== false;
  if (catVisible && pinVisible) {
    marker.addTo(locMap);
  }

  locPinLayers[pin.id] = marker;
}

// ── Pin List ──
function renderLocPinList() {
  const container = document.getElementById('locPinList');
  const countEl = document.getElementById('locPinCount');
  if (!container) return;
  if (countEl) countEl.textContent = locPins.length;

  if (locPins.length === 0) {
    container.innerHTML = '<p style="font-size:11px;color:var(--text3);padding:8px 0">尚無標記地點，使用上方「新增地點標記」開始添加。</p>';
    return;
  }

  // Group by category
  const groups = {};
  locPins.forEach(p => {
    if (!groups[p.category]) groups[p.category] = [];
    groups[p.category].push(p);
  });

  container.innerHTML = Object.entries(groups).map(([catKey, pins]) => {
    const cat = LOCATION_CATEGORIES.find(c => c.key === catKey) || LOCATION_CATEGORIES[5];
    return `<div style="margin-bottom:6px">
      <div style="font-size:10px;font-weight:700;color:${cat.color};margin-bottom:4px;display:flex;align-items:center;gap:4px">
        <i class="fa ${cat.icon}" style="width:12px;text-align:center"></i> ${cat.label} (${pins.length})
      </div>
      ${pins.map(p => `
        <div class="loc-pin-item">
          <div class="loc-pin-cat-dot" style="background:${cat.color}"></div>
          <div class="loc-pin-info">
            <div class="loc-pin-name">${p.name}${p.link ? ' <a href="' + p.link + '" target="_blank" rel="noopener" style="color:#3a86ff;font-size:10px" title="打開連結"><i class="fa fa-external-link"></i></a>' : ''}</div>
            <div class="loc-pin-sub">${p.price ? '💰 ' + p.price + ' ' : ''}${p.note || ''}</div>
          </div>
          <button class="loc-pin-eye ${p.visible === false ? 'hidden-pin' : ''}" onclick="toggleLocPinVisibility('${p.id}')" title="${p.visible === false ? '顯示' : '隱藏'}">
            <i class="fa ${p.visible === false ? 'fa-eye-slash' : 'fa-eye'}"></i>
          </button>
          <div class="loc-pin-actions">
            <button onclick="editLocPin('${p.id}')" title="編輯"><i class="fa fa-pen"></i></button>
            <button onclick="focusLocPin('${p.id}')" title="定位"><i class="fa fa-crosshairs"></i></button>
            <button class="del" onclick="removeLocPin('${p.id}')" title="刪除"><i class="fa fa-trash"></i></button>
          </div>
        </div>`).join('')}
    </div>`;
  }).join('');
}

function focusLocPin(pinId) {
  const pin = locPins.find(p => p.id === pinId);
  if (!pin) return;
  locMap.setView([pin.lat, pin.lng], 17);
  const marker = locPinLayers[pinId];
  if (marker) marker.openPopup();
}

function toggleLocPinVisibility(pinId) {
  const pin = locPins.find(p => p.id === pinId);
  if (!pin) return;
  pin.visible = pin.visible === false ? true : false;
  refreshLocPinVisibility();
  renderLocPinList();
}

function removeLocPin(pinId) {
  const marker = locPinLayers[pinId];
  if (marker && locMap) locMap.removeLayer(marker);
  delete locPinLayers[pinId];
  locPins = locPins.filter(p => p.id !== pinId);
  renderLocPinList();
  renderLocCatToggles();
  showToast('🗑 已移除標記', '');
}

// ── Edit Location Pin Modal ──
function editLocPin(pinId) {
  const pin = locPins.find(p => p.id === pinId);
  if (!pin) return;
  const cat = LOCATION_CATEGORIES.find(c => c.key === pin.category) || LOCATION_CATEGORIES[5];

  const catOptions = LOCATION_CATEGORIES.map(c =>
    `<option value="${c.key}" ${c.key === pin.category ? 'selected' : ''}>${c.label}</option>`
  ).join('');

  const modal = document.createElement('div');
  modal.className = 'edit-item-modal';
  modal.id = 'editLocPinModal';
  modal.innerHTML = `
    <div class="edit-item-panel" style="max-width:440px">
      <div class="edit-item-header">
        <span><i class="fa fa-pen" style="color:var(--primary);margin-right:6px"></i>編輯地點標記</span>
        <button onclick="closeEditLocPin()"><i class="fa fa-xmark"></i></button>
      </div>
      <div class="edit-item-body">
        <div class="edit-item-field">
          <label>類別</label>
          <select id="editLocCat" style="width:100%;padding:10px 12px;border-radius:8px;border:1px solid var(--border);background:var(--surface);color:var(--text);font-size:13px">${catOptions}</select>
        </div>
        <div class="edit-item-field">
          <label>名稱 *</label>
          <input id="editLocName" value="${pin.name.replace(/"/g, '&quot;')}" />
        </div>
        <div class="edit-item-row">
          <div class="edit-item-field">
            <label>緯度</label>
            <input id="editLocLat" value="${pin.lat}" />
          </div>
          <div class="edit-item-field">
            <label>經度</label>
            <input id="editLocLng" value="${pin.lng}" />
          </div>
        </div>
        <div class="edit-item-field">
          <label>🔍 搜尋位置（重新定位）</label>
          <div style="display:flex;gap:6px">
            <input id="editLocGeoSearch" placeholder="輸入地址或座標 (lat, lng)" style="flex:1" onkeydown="if(event.key==='Enter') geocodeEditLocPin()" />
            <button onclick="geocodeEditLocPin()" style="padding:8px 14px;border-radius:8px;background:var(--primary);color:white;border:none;font-size:12px;font-weight:600;cursor:pointer">搜尋</button>
          </div>
          <div id="editLocGeoResult" style="font-size:11px;color:var(--text3);margin-top:4px;min-height:16px"></div>
        </div>
        <div class="edit-item-field">
          <label>參考價格 (HKD)</label>
          <input id="editLocPrice" value="${(pin.price || '').replace(/"/g, '&quot;')}" placeholder="例：200/人" />
        </div>
        <div class="edit-item-field">
          <label>備註</label>
          <input id="editLocNote" value="${(pin.note || '').replace(/"/g, '&quot;')}" placeholder="例：需預約" />
        </div>
        <div class="edit-item-field">
          <label>🔗 連結</label>
          <input id="editLocLink" value="${(pin.link || '').replace(/"/g, '&quot;')}" placeholder="https://..." />
        </div>
        <div class="edit-item-actions">
          <button class="edit-item-cancel" onclick="closeEditLocPin()">取消</button>
          <button class="edit-item-save" onclick="saveEditLocPin('${pin.id}')"><i class="fa fa-check"></i> 儲存</button>
        </div>
      </div>
    </div>`;
  document.body.appendChild(modal);
}

function closeEditLocPin() {
  const modal = document.getElementById('editLocPinModal');
  if (modal) modal.remove();
}

async function geocodeEditLocPin() {
  const query = document.getElementById('editLocGeoSearch')?.value?.trim();
  const resultEl = document.getElementById('editLocGeoResult');
  if (!query) { resultEl.textContent = '請輸入地址'; return; }
  const coords = parseCoordinates(query);
  if (coords) {
    document.getElementById('editLocLat').value = coords.lat;
    document.getElementById('editLocLng').value = coords.lng;
    resultEl.innerHTML = `<span style="color:var(--success)">✅ 座標定位: 緯度 ${coords.lat.toFixed(6)}, 經度 ${coords.lng.toFixed(6)}</span>`;
    return;
  }
  resultEl.textContent = '搜尋中...';
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + ' 大阪 日本')}&format=json&limit=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'zh-TW,ja,en' } });
    const data = await res.json();
    if (data && data.length > 0) {
      document.getElementById('editLocLat').value = parseFloat(data[0].lat).toFixed(6);
      document.getElementById('editLocLng').value = parseFloat(data[0].lon).toFixed(6);
      resultEl.innerHTML = `<span style="color:var(--success)">✅ 已定位: ${data[0].display_name.substring(0, 60)}...</span>`;
    } else {
      resultEl.innerHTML = `<span style="color:var(--danger)">❌ 找不到位置</span>`;
    }
  } catch { resultEl.textContent = '搜尋失敗'; }
}

function saveEditLocPin(pinId) {
  const pin = locPins.find(p => p.id === pinId);
  if (!pin) return;

  const name = document.getElementById('editLocName')?.value?.trim();
  if (!name) { showToast('名稱不能為空', ''); return; }

  pin.name = name;
  pin.category = document.getElementById('editLocCat')?.value || pin.category;
  pin.price = document.getElementById('editLocPrice')?.value?.trim() || '';
  pin.note = document.getElementById('editLocNote')?.value?.trim() || '';
  pin.link = document.getElementById('editLocLink')?.value?.trim() || '';

  const lat = parseFloat(document.getElementById('editLocLat')?.value);
  const lng = parseFloat(document.getElementById('editLocLng')?.value);
  if (!isNaN(lat) && !isNaN(lng)) {
    pin.lat = lat;
    pin.lng = lng;
  }

  // Remove old marker, re-add with updated data
  const oldMarker = locPinLayers[pin.id];
  if (oldMarker && locMap) locMap.removeLayer(oldMarker);
  delete locPinLayers[pin.id];
  addPinMarker(pin);

  renderLocPinList();
  renderLocCatToggles();
  closeEditLocPin();
  showToast('✅ 已更新標記', 'success');
}

function clearAllLocPins() {
  if (!confirm('確定清除所有標記？此操作無法復原。')) return;
  locPins.forEach(p => {
    const marker = locPinLayers[p.id];
    if (marker && locMap) locMap.removeLayer(marker);
  });
  locPinLayers = {};
  locPins = [];
  renderLocPinList();
  renderLocCatToggles();
  showToast('🗑 已清除所有標記', '');
}

// ── Save / Load pins ──
async function saveLocPins() {
  const saveData = {
    pins: locPins,
    catVisibility: locCatVisibility,
    dayOverlayState: {},
    trainOverlayState: {}
  };
  // Save which day overlays are visible
  Object.entries(locDayOverlays).forEach(([k, v]) => { saveData.dayOverlayState[k] = v.visible; });
  // Save which train lines are visible
  Object.entries(locTrainOverlays).forEach(([k, v]) => { saveData.trainOverlayState[k] = v.visible; });

  const cloudOk = await cloudPut('locpins', saveData);
  localStorage.setItem('osaka_locpins_2026', JSON.stringify(saveData));
  showToast(cloudOk ? '✅ 位置標記已儲存（雲端）！' : '✅ 位置標記已儲存！', 'success');
}

async function loadLocPins() {
  let saveData = null;
  saveData = await cloudGet('locpins');
  if (!saveData) {
    const saved = localStorage.getItem('osaka_locpins_2026');
    if (saved) saveData = JSON.parse(saved);
  }

  if (!saveData) return;

  // Clear existing pins from map
  locPins.forEach(p => {
    const marker = locPinLayers[p.id];
    if (marker && locMap) locMap.removeLayer(marker);
  });
  locPinLayers = {};

  // Restore pins
  locPins = saveData.pins || [];
  locPins.forEach(p => addPinMarker(p));

  // Restore category visibility
  if (saveData.catVisibility) {
    locCatVisibility = saveData.catVisibility;
    refreshLocPinVisibility();
  }

  // Restore day overlay state
  if (saveData.dayOverlayState) {
    Object.entries(saveData.dayOverlayState).forEach(([dk, visible]) => {
      if (visible) {
        if (!locDayOverlays[dk]) {
          locDayOverlays[dk] = { visible: false, layerGroup: L.layerGroup() };
          locDayOverlays[dk].layerGroup.addTo(locMap);
        }
        locDayOverlays[dk].visible = true;
        renderLocDayMarkers(dk);
      }
    });
  }

  // Restore train line state
  if (saveData.trainOverlayState) {
    Object.entries(saveData.trainOverlayState).forEach(([idx, visible]) => {
      if (visible) {
        const i = parseInt(idx);
        if (!locTrainOverlays[i]) {
          locTrainOverlays[i] = { visible: false, layerGroup: L.layerGroup() };
          locTrainOverlays[i].layerGroup.addTo(locMap);
        }
        locTrainOverlays[i].visible = true;
        renderTrainLine(i);
      }
    });
  }

  renderLocDayToggles();
  renderLocCatToggles();
  renderLocTrainToggles();
  renderLocPinList();
}

// ── Map Controls ──
function fitLocBounds() {
  if (!locMap) return;
  const bounds = [];
  // Collect all pin positions
  locPins.forEach(p => { if (p.lat && p.lng) bounds.push([p.lat, p.lng]); });
  // Collect all day overlay positions
  Object.values(locDayOverlays).forEach(o => {
    if (o.visible) {
      o.layerGroup.eachLayer(l => {
        if (l.getLatLng) bounds.push([l.getLatLng().lat, l.getLatLng().lng]);
      });
    }
  });
  if (bounds.length > 0) {
    try { locMap.fitBounds(L.latLngBounds(bounds).pad(0.15)); } catch {}
  } else {
    locMap.setView([34.6937, 135.5022], 13);
  }
}

function locateOnLocMap() {
  if (!navigator.geolocation) { showToast('❌ 不支持定位', 'error'); return; }
  showToast('🔍 正在定位...', '');
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude: lat, longitude: lng } = pos.coords;
    locMap.setView([lat, lng], 15);
    L.circleMarker([lat, lng], { radius: 8, color: '#3a86ff', fillColor: '#3a86ff', fillOpacity: 1, weight: 2 }).addTo(locMap);
    showToast('📍 已定位', 'success');
  }, () => showToast('❌ 無法定位', 'error'));
}

function toggleLocMapSatellite() {
  locSatellite = !locSatellite;
  const btn = document.getElementById('locSatelliteBtn');
  if (locSatellite) {
    locMap.removeLayer(locTileLayer);
    locSatelliteLayer.addTo(locMap);
    if (btn) { btn.style.background = 'var(--primary)'; btn.style.color = 'white'; btn.style.borderColor = 'var(--primary)'; }
  } else {
    locMap.removeLayer(locSatelliteLayer);
    locTileLayer.addTo(locMap);
    if (btn) { btn.style.background = ''; btn.style.color = ''; btn.style.borderColor = ''; }
  }
}

function toggleLocSidebar() {
  const sb = document.getElementById('locSidebar');
  locSidebarCollapsed = !locSidebarCollapsed;
  sb.classList.toggle('collapsed', locSidebarCollapsed);
  setTimeout(() => locMap && locMap.invalidateSize(), 350);
}

// ─────────────────── GLOBAL EXPOSE ───────────────────
window.savePlan = savePlan;
window.locateMe = locateMe;
window.fitAllMarkers = fitAllMarkers;
window.toggleRoute = toggleRoute;
window.toggleSidebar = toggleSidebar;
window.switchDay = switchDay;
window.removeItem = removeItem;
window.removeItemPrompt = removeItemPrompt;
window.editPlanItem = editPlanItem;
window.closeEditItemModal = closeEditItemModal;
window.geocodeEditItem = geocodeEditItem;
window.saveEditItem = saveEditItem;
window.editDayNote = editDayNote;
window.openQuickAdd = openQuickAdd;
window.closeQuickAdd = closeQuickAdd;
window.setQaTab = setQaTab;
window.filterQuickAdd = filterQuickAdd;
window.toggleCoordSearch = toggleCoordSearch;
window.searchByCoord = searchByCoord;
window.addToDay = addToDay;
window.filterAttractions = filterAttractions;
window.filterAttrByRegion = filterAttrByRegion;
window.filterFoodByTag = filterFoodByTag;
window.filterFood = filterFood;
window.filterBuyItems = filterBuyItems;
window.addAttrToDay = addAttrToDay;
window.addFoodToDay = addFoodToDay;
window.showAttractionDetail = showAttractionDetail;
window.closeAttrDetailPopup = closeAttrDetailPopup;
window.showPlanItemDetail = showPlanItemDetail;
window.dragStart = dragStart;
window.dragOver = dragOver;
window.dragEnd = dragEnd;
window.drop = drop;
window.geocodeCustomLocation = geocodeCustomLocation;
window.confirmAddCustom = confirmAddCustom;
window.syncCustomCoordFromDirect = syncCustomCoordFromDirect;
window.previewCustomCoord = previewCustomCoord;
window.switchPlan = switchPlan;
window.openAllDaysMap = openAllDaysMap;
window.closeAllDaysMap = closeAllDaysMap;
window.jumpAllDaysMap = jumpAllDaysMap;
window.loadReminders = loadReminders;
window.saveReminders = saveReminders;
window.addReminder = addReminder;
window.toggleReminderDone = toggleReminderDone;
window.deleteReminder = deleteReminder;
window.editReminderTitle = editReminderTitle;
window.editReminderContent = editReminderContent;
window.filterReminders = filterReminders;
window.filterHotelsByArea = filterHotelsByArea;
window.filterHotels = filterHotels;
window.sortHotels = sortHotels;
window.showHotelOnMap = showHotelOnMap;
window.fitHotelBounds = fitHotelBounds;
window.focusHotelArea = focusHotelArea;
window.openAddToDayModal = openAddToDayModal;
window.closeAddToDayModal = closeAddToDayModal;
window.geocodeCustomHotel = geocodeCustomHotel;
window.addCustomHotelToList = addCustomHotelToList;
window.removeCustomHotel = removeCustomHotel;
// Cute theme exports
window.toggleThemeStyle = toggleThemeStyle;
window.openCuteMap = openCuteMap;
window.closeCuteMap = closeCuteMap;
window.openCuteMapForItem = openCuteMapForItem;
window.switchCuteView = switchCuteView;
window.removeCuteItem = removeCuteItem;
window.toggleCuteGrid = toggleCuteGrid;

// Location Measure exports
window.initLocMapIfNeeded = initLocMapIfNeeded;
window.toggleLocSection = toggleLocSection;
window.toggleLocDay = toggleLocDay;
window.toggleLocCat = toggleLocCat;
window.toggleLocTrainLine = toggleLocTrainLine;
window.toggleAllTrainLines = toggleAllTrainLines;
window.geocodeLocPin = geocodeLocPin;
window.addLocPin = addLocPin;
window.removeLocPin = removeLocPin;
window.editLocPin = editLocPin;
window.closeEditLocPin = closeEditLocPin;
window.geocodeEditLocPin = geocodeEditLocPin;
window.saveEditLocPin = saveEditLocPin;
window.focusLocPin = focusLocPin;
window.toggleLocPinVisibility = toggleLocPinVisibility;
window.clearAllLocPins = clearAllLocPins;
window.saveLocPins = saveLocPins;
window.loadLocPins = loadLocPins;
window.fitLocBounds = fitLocBounds;
window.locateOnLocMap = locateOnLocMap;
window.toggleLocMapSatellite = toggleLocMapSatellite;
window.toggleLocSidebar = toggleLocSidebar;
window.toggleMeasureMode = toggleMeasureMode;
window.clearMeasureLine = clearMeasureLine;
window.renderLocAttrToggles = renderLocAttrToggles;
window.filterLocAttrList = filterLocAttrList;
window.toggleLocAttr = toggleLocAttr;
window.toggleAllLocAttr = toggleAllLocAttr;
window.renderLocKeyLocToggles = renderLocKeyLocToggles;
window.toggleLocKeyLoc = toggleLocKeyLoc;
window.initCloudSetup = initCloudSetup;
window.updateCloudIndicator = updateCloudIndicator;
