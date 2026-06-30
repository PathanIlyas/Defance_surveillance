/* ============================================
   DASHBOARD.JS - Dashboard-specific Interactions
   ============================================ */

'use strict';

/* ---- Animate Progress Bars ---- */
function animateProgressBars() {
  document.querySelectorAll('[data-progress]').forEach(bar => {
    const target = parseInt(bar.dataset.progress, 10);
    bar.style.width = '0%';
    setTimeout(() => { bar.style.width = target + '%'; }, 200);
  });
}

/* ---- Battery Circle SVG ---- */
function renderBatteryCircle(canvasId, pct, color) {
  const wrap = document.getElementById(canvasId);
  if (!wrap) return;
  const r = 34;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const col = pct >= 60 ? '#00ff9d' : pct >= 30 ? '#fbbf24' : '#ff4d4d';

  wrap.innerHTML = `
    <svg width="80" height="80" viewBox="0 0 80 80">
      <circle cx="40" cy="40" r="${r}" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="7"/>
      <circle cx="40" cy="40" r="${r}" fill="none"
        stroke="${col}" stroke-width="7"
        stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
        stroke-linecap="round"
        style="transition:stroke-dashoffset 1.2s ease;"
      />
    </svg>
    <div class="pct-text">${pct}<small>%</small></div>
  `;
}

/* ---- Sensor Gauge mini bars ---- */
function renderSensorBar(elId, value, max, colorClass) {
  const el = document.getElementById(elId);
  if (!el) return;
  const pct = Math.min((value / max) * 100, 100);
  const cls = colorClass || (pct > 80 ? 'danger' : pct > 60 ? 'warning' : '');
  el.innerHTML = `
    <div class="mil-progress mt-2">
      <div class="mil-progress-bar ${cls}" data-progress="${pct}" style="width:0%"></div>
    </div>
  `;
  setTimeout(() => {
    const bar = el.querySelector('[data-progress]');
    if (bar) bar.style.width = pct + '%';
  }, 300);
}

/* ---- Live Map Ping Simulation ---- */
function simulateMapPings() {
  const mapArea = document.querySelector('.map-area .map-pings');
  if (!mapArea) return;

  const units = [
    { id: 'R-01', x: '28%', y: '38%', cls: 'green' },
    { id: 'R-07', x: '55%', y: '52%', cls: 'green' },
    { id: 'R-12', x: '72%', y: '30%', cls: 'yellow' },
    { id: 'R-05', x: '42%', y: '68%', cls: 'red'    },
    { id: 'R-19', x: '18%', y: '60%', cls: 'green'  },
    { id: 'R-23', x: '85%', y: '55%', cls: 'yellow' },
  ];

  units.forEach(u => {
    const dot = document.createElement('div');
    dot.className = `map-ping ${u.cls}`;
    dot.style.left = u.x;
    dot.style.top  = u.y;
    dot.title = u.id;

    const lbl = document.createElement('span');
    lbl.style.cssText = `
      position:absolute; bottom:-18px; left:50%; transform:translateX(-50%);
      font-size:9px; font-weight:700; letter-spacing:1px;
      color:var(--text-secondary); white-space:nowrap;
    `;
    lbl.textContent = u.id;
    dot.appendChild(lbl);
    mapArea.appendChild(dot);
  });
}

/* ---- Mission Status Live Update ---- */
function tickMissionProgress() {
  document.querySelectorAll('[data-live-progress]').forEach(el => {
    let v = parseInt(el.dataset.liveProgress, 10);
    const max = parseInt(el.dataset.max || '100', 10);
    v = Math.min(v + Math.floor(Math.random() * 2), max);
    el.dataset.liveProgress = v;
    const bar = el.querySelector('.mil-progress-bar');
    if (bar) bar.style.width = v + '%';
    const pctEl = el.querySelector('.pct-val');
    if (pctEl) pctEl.textContent = v + '%';
  });
}

/* ---- Simulate incoming alert ---- */
function simulateAlert() {
  const timeline = document.getElementById('alert-timeline');
  if (!timeline) return;

  const alerts = [
    { icon: 'fa-triangle-exclamation', cls: 'red',    title: 'Motion Detected',   loc: 'Grid F7 – Sector North', time: 'Just now' },
    { icon: 'fa-wifi',                 cls: 'yellow', title: 'Comm Interference', loc: 'Unit R-11 – Channel 4',   time: 'Just now' },
    { icon: 'fa-battery-quarter',      cls: 'yellow', title: 'Low Battery',       loc: 'Unit R-22 – 15% remain', time: 'Just now' },
    { icon: 'fa-circle-check',         cls: 'green',  title: 'Mission Complete',  loc: 'Alpha Squad – Recon',     time: 'Just now' },
  ];
  const a = alerts[Math.floor(Math.random() * alerts.length)];

  const item = document.createElement('div');
  item.className = 'timeline-item fade-in-up';
  item.innerHTML = `
    <div class="timeline-dot ${a.cls}"><i class="fa-solid ${a.icon}"></i></div>
    <div>
      <div class="timeline-title">${a.title}</div>
      <div class="timeline-meta">${a.loc} &bull; ${a.time}</div>
    </div>
  `;
  timeline.insertBefore(item, timeline.firstChild);

  /* Remove old items beyond 8 */
  while (timeline.children.length > 8) {
    timeline.removeChild(timeline.lastChild);
  }
}

/* ---- Camera static noise canvas ---- */
function renderCamNoise(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas || !canvas.getContext) return;
  const ctx2 = canvas.getContext('2d');
  const W = canvas.width  = canvas.offsetWidth  || 200;
  const H = canvas.height = canvas.offsetHeight || 140;

  function draw() {
    const img = ctx2.createImageData(W, H);
    for (let i = 0; i < img.data.length; i += 4) {
      const g = Math.random() * 40;
      img.data[i]   = g * 0.2;
      img.data[i+1] = g;
      img.data[i+2] = g * 0.4;
      img.data[i+3] = 80;
    }
    ctx2.putImageData(img, 0, 0);
    requestAnimationFrame(draw);
  }
  draw();
}

/* ---- GPS coords ticker ---- */
function tickGPS() {
  const els = document.querySelectorAll('[data-gps]');
  els.forEach(el => {
    const baseLat = parseFloat(el.dataset.lat || '34.0522');
    const baseLng = parseFloat(el.dataset.lng || '-118.2437');
    const lat = (baseLat + (Math.random() - 0.5) * 0.001).toFixed(5);
    const lng = (baseLng + (Math.random() - 0.5) * 0.001).toFixed(5);
    el.textContent = `${lat}°N  ${lng > 0 ? lat : Math.abs(lng)}°W`;
  });
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  /* Progress bars */
  animateProgressBars();

  /* Battery circles */
  renderBatteryCircle('battery-main',  87, '#00ff9d');
  renderBatteryCircle('battery-fleet', 64, '#fbbf24');

  /* Sensor bars */
  renderSensorBar('sensor-temp-bar',    72,  100);
  renderSensorBar('sensor-humid-bar',   45,  100);
  renderSensorBar('sensor-pressure-bar',88,  100);
  renderSensorBar('sensor-signal-bar',  91,  100);

  /* Map pings */
  simulateMapPings();

  /* Camera noise */
  ['cam1', 'cam2', 'cam3', 'cam4'].forEach(id => renderCamNoise(id));

  /* Periodic ticks */
  setInterval(tickMissionProgress, 5000);
  setInterval(simulateAlert, 12000);
  setInterval(tickGPS, 3000);

  /* Tab switching */
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', function () {
      const group = this.closest('[data-tab-group]');
      if (!group) return;
      group.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active', 'btn-mil-filled'));
      this.classList.add('active', 'btn-mil-filled');
      const target = this.dataset.tab;
      group.querySelectorAll('[data-tab-content]').forEach(pane => {
        pane.style.display = pane.dataset.tabContent === target ? 'block' : 'none';
      });
    });
  });
});
