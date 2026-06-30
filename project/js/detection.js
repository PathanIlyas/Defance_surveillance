'use strict';
/* ============================================================
   DETECTION.JS  –  Person & Threat Detection Engine
   All data is dummy/frontend-only.
   Replace DATASET, DETECTION_LOG, ROBOT_POSITIONS with
   real API calls when backend is ready.
   ============================================================ */

/* ─────────────────────────────────────────────
   DATASET  –  Known Persons Database
   clearance: 1=Civilian, 2=Staff, 3=Officer, 4=Commander
   ───────────────────────────────────────────── */
const DATASET = [
  { id:'KP-001', name:'Col. Marcus Reid',   role:'Supreme Commander',   unit:'HQ Alpha',    clearance:4, color:'#00ff9d', matches:12, lastSeen:'14:33', sector:'Zone-A' },
  { id:'KP-002', name:'Sgt. Diego Reyes',   role:'Field Sergeant',      unit:'Bravo Squad', clearance:3, color:'#38bdf8', matches:8,  lastSeen:'14:28', sector:'Zone-B' },
  { id:'KP-003', name:'Dr. Aisha Noman',    role:'Tech Specialist',     unit:'R&D Div',     clearance:3, color:'#a78bfa', matches:5,  lastSeen:'13:55', sector:'Zone-A' },
  { id:'KP-004', name:'Cpl. James Park',    role:'Robot Operator',      unit:'Echo Squad',  clearance:2, color:'#38bdf8', matches:7,  lastSeen:'14:10', sector:'Zone-D' },
  { id:'KP-005', name:'Lt. Sara Kovacs',    role:'Intelligence Officer', unit:'Intel Unit',  clearance:4, color:'#00ff9d', matches:3,  lastSeen:'14:05', sector:'Zone-C' },
  { id:'KP-006', name:'Pvt. Liam Torres',   role:'Support Personnel',   unit:'Delta Squad', clearance:2, color:'#fbbf24', matches:6,  lastSeen:'13:40', sector:'Zone-E' },
  { id:'KP-007', name:'Maj. Riya Sharma',   role:'Mission Analyst',     unit:'HQ Alpha',    clearance:3, color:'#a78bfa', matches:4,  lastSeen:'12:58', sector:'Zone-A' },
  { id:'KP-008', name:'Tech. Omar Farouk',  role:'Sensor Technician',   unit:'Sensor Div',  clearance:2, color:'#38bdf8', matches:9,  lastSeen:'14:22', sector:'Zone-F' },
  { id:'KP-009', name:'Sgt. Elena Vasquez', role:'Squad Leader',        unit:'Alpha Squad', clearance:3, color:'#00ff9d', matches:11, lastSeen:'14:30', sector:'Zone-B' },
  { id:'KP-010', name:'Dr. Wei Zhang',      role:'AI Systems Lead',     unit:'R&D Div',     clearance:3, color:'#a78bfa', matches:2,  lastSeen:'11:45', sector:'Zone-A' },
  { id:'KP-011', name:'Cpl. Fatima Al-Hassan', role:'Comms Officer',    unit:'Comms Unit',  clearance:2, color:'#38bdf8', matches:5,  lastSeen:'14:15', sector:'Zone-C' },
  { id:'KP-012', name:'Pvt. Samuel Obi',    role:'Guard Personnel',     unit:'Charlie Squad',clearance:1,color:'#fbbf24', matches:3,  lastSeen:'13:20', sector:'Zone-F' },
];

/* ─────────────────────────────────────────────
   ROBOT POSITIONS  –  zone assignments
   ───────────────────────────────────────────── */
const ROBOT_POSITIONS = [
  // [id, zone, svgX%, svgY%, status, battery]
  { id:'R-01', zone:'Zone-A', x:8,  y:18, status:'active',  battery:87 },
  { id:'R-03', zone:'Zone-A', x:18, y:23, status:'active',  battery:62 },
  { id:'R-05', zone:'Zone-B', x:36, y:15, status:'active',  battery:41 },
  { id:'R-07', zone:'Zone-C', x:68, y:20, status:'alert',   battery:73 },
  { id:'R-09', zone:'Zone-C', x:80, y:16, status:'active',  battery:95 },
  { id:'R-12', zone:'Zone-D', x:10, y:52, status:'standby', battery:88 },
  { id:'R-14', zone:'Zone-D', x:22, y:57, status:'standby', battery:18 },
  { id:'R-19', zone:'Zone-E', x:42, y:50, status:'active',  battery:93 },
  { id:'R-22', zone:'Zone-F', x:72, y:52, status:'active',  battery:76 },
  { id:'R-23', zone:'Zone-F', x:84, y:57, status:'active',  battery:88 },
  { id:'R-08', zone:'Zone-B', x:45, y:18, status:'active',  battery:55 },
  { id:'R-11', zone:'Zone-E', x:55, y:55, status:'standby', battery:33 },
];

/* ─────────────────────────────────────────────
   LIVE DETECTIONS  –  current camera feed
   type: known | unknown | threat
   threat: null | 'explosive' | 'weapon' | 'both'
   ───────────────────────────────────────────── */
const DETECTIONS = [
  { detId:'DT-001', camId:'CAM-01', zone:'Zone-A', personName:'Col. Marcus Reid',  dbId:'KP-001', type:'known',   confidence:99, threat:null,        time:'14:33:12', sector:'North Gate'      },
  { detId:'DT-002', camId:'CAM-02', zone:'Zone-B', personName:'Sgt. Diego Reyes',  dbId:'KP-002', type:'known',   confidence:96, threat:null,        time:'14:31:55', sector:'East Perimeter'  },
  { detId:'DT-003', camId:'CAM-03', zone:'Zone-C', personName:'UNKNOWN – ID:U-07', dbId:null,     type:'unknown', confidence:88, threat:'explosive',  time:'14:32:08', sector:'Command Base'    },
  { detId:'DT-004', camId:'CAM-03', zone:'Zone-C', personName:'UNKNOWN – ID:U-11', dbId:null,     type:'unknown', confidence:82, threat:'weapon',     time:'14:28:40', sector:'Command Base'    },
  { detId:'DT-005', camId:'CAM-04', zone:'Zone-D', personName:'Cpl. James Park',   dbId:'KP-004', type:'known',   confidence:94, threat:null,        time:'14:10:20', sector:'South Checkpoint' },
  { detId:'DT-006', camId:'CAM-05', zone:'Zone-E', personName:'UNKNOWN – ID:U-03', dbId:null,     type:'unknown', confidence:79, threat:null,        time:'14:26:05', sector:'Vehicle Bay'      },
  { detId:'DT-007', camId:'CAM-06', zone:'Zone-F', personName:'Pvt. Liam Torres',  dbId:'KP-006', type:'known',   confidence:91, threat:null,        time:'13:58:33', sector:'Outer Perimeter'  },
];

/* ─────────────────────────────────────────────
   ZONE CONFIG
   ───────────────────────────────────────────── */
const ZONES = [
  { id:'Zone-A', name:'North Gate',       robots:2, status:'clear',   icon:'fa-door-open'       },
  { id:'Zone-B', name:'East Perimeter',   robots:2, status:'clear',   icon:'fa-border-all'      },
  { id:'Zone-C', name:'Command Base',     robots:2, status:'threat',  icon:'fa-building-shield' },
  { id:'Zone-D', name:'South Checkpoint', robots:2, status:'standby', icon:'fa-road-barrier'    },
  { id:'Zone-E', name:'Vehicle Bay',      robots:2, status:'clear',   icon:'fa-car-side'        },
  { id:'Zone-F', name:'Outer Perimeter',  robots:2, status:'clear',   icon:'fa-circle-dot'      },
];

/* ─────────────────────────────────────────────
   HELPER  –  initials avatar
   ───────────────────────────────────────────── */
function getInitials(name) {
  return name.split(' ').filter(w => /[A-Z]/.test(w[0])).slice(0,2).map(w=>w[0]).join('') || '??';
}
function avatarColor(id) {
  const cols = ['#00ff9d','#38bdf8','#a78bfa','#fbbf24','#f97316'];
  return cols[(id||'').charCodeAt(id?.length-1||0) % cols.length];
}

/* ─────────────────────────────────────────────
   RENDER – Person Detection Card
   ───────────────────────────────────────────── */
function buildDetectionCard(d) {
  const isUnknown = d.type === 'unknown';
  const hasThreat = d.threat !== null;
  const initials  = isUnknown ? '??' : getInitials(d.personName);
  const dbPerson  = d.dbId ? DATASET.find(p => p.id === d.dbId) : null;

  let threatBadge = '';
  if (d.threat === 'explosive') threatBadge = `<span class="det-threat-badge blink-alert"><i class="fa-solid fa-bomb me-1"></i>EXPLOSIVE</span>`;
  else if (d.threat === 'weapon') threatBadge = `<span class="det-threat-badge weapon"><i class="fa-solid fa-gun me-1"></i>WEAPON</span>`;
  else if (d.threat === 'both')  threatBadge = `<span class="det-threat-badge blink-alert"><i class="fa-solid fa-bomb me-1"></i>EXPLOSIVE + WEAPON</span>`;

  const confColor = d.confidence >= 90 ? '#00ff9d' : d.confidence >= 70 ? '#fbbf24' : '#ff4d4d';
  const cardBorder = hasThreat ? 'border-color:rgba(255,77,77,0.5)' :
                     isUnknown ? 'border-color:rgba(255,77,77,0.25)' :
                                 'border-color:rgba(0,255,157,0.2)';

  const actionBtn = hasThreat
    ? `<button class="btn-mil-filled w-100 mt-2" style="background:#ff4d4d;font-size:0.7rem"
          onclick="triggerThreatPopup('${d.detId}','${d.zone} – ${d.camId}','${d.personName}','${d.threat}')">
         <i class="fa-solid fa-siren me-1"></i>RAISE ALERT
       </button>`
    : isUnknown
    ? `<button class="btn-mil w-100 mt-2" style="font-size:0.7rem"
          onclick="MilToast.show('Unit Dispatched','Robot en route to ${d.zone}','warning')">
         <i class="fa-solid fa-robot me-1"></i>Dispatch Robot
       </button>`
    : `<button class="btn-mil w-100 mt-2" style="font-size:0.7rem"
          onclick="MilToast.show('${d.personName}','Identity verified – clearance confirmed','success')">
         <i class="fa-solid fa-circle-check me-1"></i>Verified
       </button>`;

  return `
  <div class="col-sm-6 col-xl-3 det-card-wrap" data-type="${d.type}" data-threat="${d.threat||'none'}" data-det="${d.detId}">
    <div class="det-card${hasThreat ? ' threat' : isUnknown ? ' unknown' : ' known'}" style="${cardBorder}">
      ${hasThreat ? '<div class="det-threat-strip blink-alert"></div>' : ''}

      <!-- Camera Feed Mockup -->
      <div class="det-feed-wrap">
        <canvas class="det-canvas" id="canvas-${d.detId}" width="300" height="150"></canvas>
        <div class="cam-scan-line" style="animation-delay:${Math.random()*2}s"></div>
        <div class="cam-rec-dot">REC</div>
        <div class="cam-overlay-corner tl" style="${hasThreat?'border-color:#ff4d4d':''}"></div>
        <div class="cam-overlay-corner tr" style="${hasThreat?'border-color:#ff4d4d':''}"></div>
        <div class="cam-overlay-corner bl" style="${hasThreat?'border-color:#ff4d4d':''}"></div>
        <div class="cam-overlay-corner br" style="${hasThreat?'border-color:#ff4d4d':''}"></div>

        <!-- Face bounding box overlay -->
        <div class="det-face-box ${isUnknown ? 'unknown' : 'known'}${hasThreat ? ' explosive' : ''}">
          <div class="det-face-avatar">${initials}</div>
          <div class="det-face-label">${isUnknown ? 'UNKNOWN' : 'MATCHED'}</div>
        </div>

        <!-- Threat icon overlay -->
        ${hasThreat ? `<div class="det-threat-icon blink-alert">
          <i class="fa-solid ${d.threat==='explosive'||d.threat==='both'?'fa-bomb':'fa-gun'}"></i>
        </div>` : ''}

        <div style="position:absolute;top:8px;right:8px;font-size:0.6rem;color:var(--primary);letter-spacing:1px">${d.camId}</div>
        <div style="position:absolute;bottom:8px;left:8px;font-size:0.62rem;color:rgba(255,255,255,0.5)">${d.time}</div>
      </div>

      <!-- Info row -->
      <div class="det-info">
        <div class="d-flex align-items-start justify-content-between gap-2">
          <div>
            <div class="det-name ${isUnknown?'text-danger-custom blink-slow':''}">${d.personName}</div>
            <div class="det-meta">
              <i class="fa-solid fa-location-dot me-1" style="color:var(--primary)"></i>${d.zone} &bull; ${d.sector}
            </div>
          </div>
          <span class="det-conf" style="color:${confColor}">${d.confidence}%</span>
        </div>

        ${threatBadge}

        ${dbPerson ? `
        <div class="det-db-row">
          <i class="fa-solid fa-id-badge me-1" style="color:#a78bfa"></i>
          ${dbPerson.role} &bull; ${dbPerson.unit}
          &bull; <span style="color:var(--primary)">CL-${dbPerson.clearance}</span>
        </div>` : isUnknown ? `
        <div class="det-db-row" style="color:#ff4d4d">
          <i class="fa-solid fa-circle-exclamation me-1"></i>NOT IN DATABASE
        </div>` : ''}

        ${actionBtn}
      </div>
    </div>
  </div>`;
}

/* ─────────────────────────────────────────────
   RENDER – Threat Card (explosive/weapon)
   ───────────────────────────────────────────── */
function buildThreatCard(d) {
  const icons = { explosive:'fa-bomb', weapon:'fa-gun', both:'fa-radiation' };
  const labels = { explosive:'EXPLOSIVE DEVICE', weapon:'ARMED INDIVIDUAL', both:'ARMED + EXPLOSIVE' };
  const icon  = icons[d.threat]  || 'fa-triangle-exclamation';
  const label = labels[d.threat] || 'UNKNOWN THREAT';

  return `
  <div class="col-sm-6 col-lg-4">
    <div class="threat-card glow-red">
      <div class="threat-card-header">
        <i class="fa-solid ${icon} fa-lg blink-alert"></i>
        <span>${label}</span>
        <span class="mil-badge red ms-auto blink-alert">ACTIVE</span>
      </div>
      <div class="threat-card-body">
        <div class="threat-row">
          <span class="threat-lbl">Person</span>
          <span class="threat-val text-danger-custom">${d.personName}</span>
        </div>
        <div class="threat-row">
          <span class="threat-lbl">Camera</span>
          <span class="threat-val">${d.camId}</span>
        </div>
        <div class="threat-row">
          <span class="threat-lbl">Zone</span>
          <span class="threat-val">${d.zone} – ${d.sector}</span>
        </div>
        <div class="threat-row">
          <span class="threat-lbl">AI Confidence</span>
          <span class="threat-val" style="color:#ff4d4d">${d.confidence}%</span>
        </div>
        <div class="threat-row">
          <span class="threat-lbl">Detected At</span>
          <span class="threat-val text-muted-custom">${d.time}</span>
        </div>
        <!-- Confidence bar -->
        <div class="mil-progress mt-2 mb-3">
          <div class="mil-progress-bar danger" data-progress="${d.confidence}" style="width:0%"></div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn-mil-filled flex-fill" style="background:#ff4d4d;font-size:0.72rem"
            onclick="triggerThreatPopup('${d.detId}','${d.zone} – ${d.camId}','${d.personName}','${d.threat}')">
            <i class="fa-solid fa-siren me-1"></i>RAISE ALERT
          </button>
          <button class="btn-mil" style="font-size:0.72rem;padding:6px 12px"
            onclick="MilToast.show('Robot Dispatched','R-07 en route to ${d.zone}','danger')">
            <i class="fa-solid fa-robot"></i>
          </button>
        </div>
      </div>
    </div>
  </div>`;
}

/* ─────────────────────────────────────────────
   RENDER – Robot Zone Map dots (SVG)
   ───────────────────────────────────────────── */
function renderRobotMap() {
  const g = document.getElementById('robot-dots');
  if (!g) return;
  const mapWrap = document.getElementById('zone-map-wrap');
  const W = mapWrap?.offsetWidth || 600;
  const H = 360;

  const statusColor = { active:'#00ff9d', standby:'#fbbf24', alert:'#ff4d4d' };

  g.innerHTML = ROBOT_POSITIONS.map(r => {
    const cx = (r.x / 100) * W;
    const cy = (r.y / 100) * H;
    const col = statusColor[r.status] || '#94a3b8';
    return `
      <g class="robot-map-dot" style="cursor:pointer"
         onclick="MilToast.show('${r.id}','Zone: ${r.zone} | Battery: ${r.battery}% | Status: ${r.status}','info')">
        <!-- Ping ring -->
        <circle cx="${cx}" cy="${cy}" r="12" fill="none" stroke="${col}" stroke-width="1" opacity="0.4">
          <animate attributeName="r" values="8;18;8" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite"/>
        </circle>
        <!-- Core dot -->
        <circle cx="${cx}" cy="${cy}" r="6" fill="${col}" stroke="#0f172a" stroke-width="2"/>
        <!-- Robot icon label -->
        <text x="${cx}" y="${cy - 12}" fill="${col}" font-size="7" font-family="monospace"
          font-weight="700" text-anchor="middle" letter-spacing="1">${r.id}</text>
      </g>
    `;
  }).join('');

  /* Render person markers for detections */
  const pg = document.getElementById('person-markers');
  if (!pg) return;
  const personPositions = [
    { name:'Col. Marcus', x:12, y:12, known:true },
    { name:'UNKNOWN U-07', x:65, y:10, known:false, threat:true },
    { name:'UNKNOWN U-11', x:75, y:22, known:false, threat:true },
    { name:'Sgt. Reyes',   x:38, y:12, known:true },
    { name:'UNKNOWN U-03', x:46, y:46, known:false, threat:false },
  ];
  pg.innerHTML = personPositions.map(p => {
    const cx = (p.x / 100) * W;
    const cy = (p.y / 100) * H;
    const col = p.threat ? '#ff4d4d' : p.known ? '#00c97a' : '#fbbf24';
    const symbol = p.known ? '✓' : '?';
    return `
      <g style="cursor:pointer"
         onclick="MilToast.show('Person Detected','${p.name} at this position','${p.threat?'danger':p.known?'success':'warning'}')">
        <rect x="${cx-8}" y="${cy-8}" width="16" height="16" rx="3"
          fill="${col}22" stroke="${col}" stroke-width="1.5"
          ${p.threat ? `>
            <animate attributeName="stroke-opacity" values="1;0.2;1" dur="0.8s" repeatCount="indefinite"/>
          </rect>` : '/>'}
        <text x="${cx}" y="${cy+4}" fill="${col}" font-size="9" font-family="monospace"
          font-weight="900" text-anchor="middle">${symbol}</text>
        <text x="${cx}" y="${cy-12}" fill="${col}" font-size="6" font-family="monospace"
          text-anchor="middle" opacity="0.8">${p.known ? p.name.split(' ').pop() : 'UNKNOWN'}</text>
      </g>`;
  }).join('');
}

/* ─────────────────────────────────────────────
   RENDER – Zone Status List
   ───────────────────────────────────────────── */
function renderZoneStatus() {
  const el = document.getElementById('zone-status-list');
  if (!el) return;
  const statusCfg = {
    threat:  { col:'#ff4d4d', label:'THREAT',  icon:'fa-triangle-exclamation' },
    clear:   { col:'#00ff9d', label:'CLEAR',   icon:'fa-circle-check' },
    standby: { col:'#fbbf24', label:'STANDBY', icon:'fa-pause-circle' },
  };
  el.innerHTML = ZONES.map(z => {
    const cfg = statusCfg[z.status];
    const robotsInZone = ROBOT_POSITIONS.filter(r => r.zone === z.id);
    const detInZone    = DETECTIONS.filter(d => d.zone === z.id);
    const unknownInZone= detInZone.filter(d => d.type === 'unknown').length;
    return `
    <div class="zone-row" onclick="MilToast.show('${z.id}','${z.name} | ${robotsInZone.length} Robots | ${detInZone.length} Detections','info')">
      <div class="zone-icon" style="color:${cfg.col}"><i class="fa-solid ${z.icon}"></i></div>
      <div class="flex-grow-1">
        <div class="zone-name">${z.id} <span class="fs-xs text-muted-custom">– ${z.name}</span></div>
        <div class="zone-meta">
          <i class="fa-solid fa-robot me-1" style="color:#38bdf8"></i>${robotsInZone.length} robots
          ${unknownInZone > 0 ? `&nbsp;<i class="fa-solid fa-user-secret me-1 text-danger-custom blink-alert"></i>${unknownInZone} unknown` : ''}
        </div>
      </div>
      <span style="font-size:0.62rem;font-weight:700;color:${cfg.col};letter-spacing:1px">${cfg.label}</span>
    </div>`;
  }).join('');
}

/* ─────────────────────────────────────────────
   RENDER – Database Table
   ───────────────────────────────────────────── */
function renderDatabase(filter = '') {
  const tbody = document.getElementById('db-tbody');
  if (!tbody) return;
  const filtered = filter
    ? DATASET.filter(p => p.name.toLowerCase().includes(filter) ||
                          p.id.toLowerCase().includes(filter)   ||
                          p.unit.toLowerCase().includes(filter)  ||
                          p.sector.toLowerCase().includes(filter))
    : DATASET;

  const badge = document.getElementById('db-count-badge');
  if (badge) badge.textContent = `${filtered.length} Records`;

  const clColors = ['','#94a3b8','#fbbf24','#38bdf8','#00ff9d'];
  const clLabels = ['','CIVILIAN','STAFF','OFFICER','COMMANDER'];

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td class="fw-700 text-primary-custom fs-xs">${p.id}</td>
      <td>
        <div style="width:30px;height:30px;border-radius:50%;background:${p.color}22;
                    border:1.5px solid ${p.color};display:flex;align-items:center;
                    justify-content:center;font-size:0.65rem;font-weight:800;color:${p.color}">
          ${getInitials(p.name)}
        </div>
      </td>
      <td class="fw-600">${p.name}</td>
      <td class="fs-xs text-muted-custom">${p.role}</td>
      <td class="fs-xs">${p.unit}</td>
      <td class="fs-xs text-muted-custom">${p.lastSeen}</td>
      <td><span class="mil-badge green">${p.sector}</span></td>
      <td class="fs-xs" style="color:var(--primary)">${p.matches}×</td>
      <td>
        <span style="font-size:0.62rem;font-weight:700;color:${clColors[p.clearance]};
                     background:${clColors[p.clearance]}22;border:1px solid ${clColors[p.clearance]}44;
                     padding:2px 7px;border-radius:4px;letter-spacing:1px">
          CL-${p.clearance} ${clLabels[p.clearance]}
        </span>
      </td>
      <td>
        <button class="btn-mil fs-xs" style="padding:3px 10px"
          onclick="MilToast.show('${p.name}','Record viewed – Clearance ${p.clearance}','info')">
          View
        </button>
      </td>
    </tr>`).join('');
}

/* ─────────────────────────────────────────────
   RENDER – Detection Log Table + Timeline
   ───────────────────────────────────────────── */
const LOG_ENTRIES = [
  { time:'14:33:12', cam:'CAM-01', name:'Col. Marcus Reid',    match:'KNOWN',   threat:'None',      zone:'Zone-A', status:'clear'   },
  { time:'14:32:08', cam:'CAM-03', name:'UNKNOWN – ID:U-07',   match:'UNKNOWN', threat:'Explosive', zone:'Zone-C', status:'threat'  },
  { time:'14:31:55', cam:'CAM-02', name:'Sgt. Diego Reyes',    match:'KNOWN',   threat:'None',      zone:'Zone-B', status:'clear'   },
  { time:'14:28:40', cam:'CAM-03', name:'UNKNOWN – ID:U-11',   match:'UNKNOWN', threat:'Weapon',    zone:'Zone-C', status:'threat'  },
  { time:'14:26:05', cam:'CAM-05', name:'UNKNOWN – ID:U-03',   match:'UNKNOWN', threat:'None',      zone:'Zone-E', status:'unknown' },
  { time:'14:22:10', cam:'CAM-06', name:'Tech. Omar Farouk',   match:'KNOWN',   threat:'None',      zone:'Zone-F', status:'clear'   },
  { time:'14:10:20', cam:'CAM-04', name:'Cpl. James Park',     match:'KNOWN',   threat:'None',      zone:'Zone-D', status:'clear'   },
  { time:'13:58:33', cam:'CAM-06', name:'Pvt. Liam Torres',    match:'KNOWN',   threat:'None',      zone:'Zone-F', status:'clear'   },
];

function renderLog() {
  const tbody = document.getElementById('log-tbody');
  if (!tbody) return;
  const threatColor = { 'None':'var(--primary)', 'Explosive':'#ff4d4d', 'Weapon':'#fbbf24' };
  tbody.innerHTML = LOG_ENTRIES.map(l => `
    <tr>
      <td class="fs-xs text-muted-custom">${l.time}</td>
      <td class="fs-xs fw-600">${l.cam}</td>
      <td class="fs-xs ${l.match==='UNKNOWN'?'text-danger-custom blink-slow':'fw-600'}">${l.name}</td>
      <td>${l.match==='KNOWN'
            ? `<span class="mil-badge green">KNOWN</span>`
            : `<span class="mil-badge red">UNKNOWN</span>`}</td>
      <td style="color:${threatColor[l.threat]}" class="fs-xs fw-700">
        ${l.threat==='None' ? '<span class="text-muted-custom">—</span>' :
          `<i class="fa-solid ${l.threat==='Explosive'?'fa-bomb':'fa-gun'} blink-alert me-1"></i>${l.threat.toUpperCase()}`}
      </td>
      <td class="fs-xs">${l.zone}</td>
      <td>
        <button class="btn-mil fs-xs" style="padding:3px 9px"
          onclick="MilToast.show('${l.cam}','${l.name} – ${l.zone}','${l.status==='threat'?'danger':l.status==='unknown'?'warning':'info'}')">
          Review
        </button>
      </td>
    </tr>`).join('');
}

function renderTimeline() {
  const tl = document.getElementById('alert-timeline');
  if (!tl) return;
  const cfg = {
    threat:  { cls:'red',    icon:'fa-bomb' },
    unknown: { cls:'yellow', icon:'fa-user-secret' },
    clear:   { cls:'green',  icon:'fa-user-check' },
  };
  tl.innerHTML = LOG_ENTRIES.map(l => {
    const c = cfg[l.status] || cfg.clear;
    return `
    <div class="timeline-item">
      <div class="timeline-dot ${c.cls}"><i class="fa-solid ${c.icon}"></i></div>
      <div>
        <div class="timeline-title ${l.status==='threat'?'text-danger-custom':''}">${l.name}</div>
        <div class="timeline-meta">${l.cam} &bull; ${l.zone}
          ${l.threat!=='None'?` &bull; <span style="color:#ff4d4d">${l.threat}</span>`:''}
          &bull; ${l.time}
        </div>
      </div>
    </div>`;
  }).join('');
}

/* ─────────────────────────────────────────────
   THREAT POPUP TRIGGER
   ───────────────────────────────────────────── */
function triggerThreatPopup(detId, location, personName, threatType) {
  const popup = document.getElementById('threat-popup');
  const loc   = document.getElementById('popup-location');
  const det   = document.getElementById('popup-details');
  if (!popup) return;

  loc.textContent = location;
  const typeLabel = { explosive:'Explosive Device Detected', weapon:'Armed Individual Detected', both:'Explosive + Weapon Detected' };
  det.innerHTML = `
    <strong style="color:#ff4d4d">${typeLabel[threatType] || 'Unknown Threat'}</strong><br>
    Person: <strong>${personName}</strong><br>
    AI Confidence: <strong style="color:#ff4d4d">89%</strong><br>
    Nearest Robot: <strong>R-07 (120m away)</strong><br>
    Recommend: <strong>Immediate Lockdown + Robot Dispatch</strong>
  `;
  popup.style.display = 'flex';
  MilToast.show('THREAT DETECTED', `${typeLabel[threatType]||'Threat'} at ${location}`, 'danger');
  // Update threat count badge
  const badgeEl = document.getElementById('explosive-badge');
  if (badgeEl) badgeEl.textContent = '2 ACTIVE THREATS';
}
window.triggerThreatPopup = triggerThreatPopup;

/* ─────────────────────────────────────────────
   FILTER DETECTION FEED
   ───────────────────────────────────────────── */
function filterDetections(type) {
  document.querySelectorAll('.det-card-wrap').forEach(card => {
    if (type === 'all') { card.style.display = ''; return; }
    if (type === 'unknown') card.style.display = card.dataset.type === 'unknown' ? '' : 'none';
    if (type === 'threat')  card.style.display = card.dataset.threat !== 'none' ? '' : 'none';
  });
  // Update active button
  ['all','unknown','threat'].forEach(k => {
    const btn = document.getElementById('filt-'+k);
    if (btn) btn.classList.toggle('btn-mil-filled', k===type);
  });
}
window.filterDetections = filterDetections;

/* ─────────────────────────────────────────────
   DATABASE SEARCH
   ───────────────────────────────────────────── */
function searchDatabase(val) {
  renderDatabase(val.toLowerCase());
}
window.searchDatabase = searchDatabase;

/* ─────────────────────────────────────────────
   ADD PERSON MODAL (simple inline)
   ───────────────────────────────────────────── */
function addPersonModal() {
  MilToast.show('Add Person', 'Connect backend API to enable registration', 'info');
}
window.addPersonModal = addPersonModal;

/* ─────────────────────────────────────────────
   SIMULATE NEW DETECTION
   ───────────────────────────────────────────── */
const SIM_NAMES = ['UNKNOWN – ID:U-15','UNKNOWN – ID:U-22','UNKNOWN – ID:U-08'];
const SIM_THREATS = [null, 'explosive', 'weapon', null, null];
const SIM_ZONES = ['Zone-A','Zone-B','Zone-C','Zone-D','Zone-E','Zone-F'];
const SIM_CAMS  = ['CAM-01','CAM-02','CAM-03','CAM-04','CAM-05','CAM-06'];

function simulateNewDetection() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US',{hour12:false});
  const threat  = SIM_THREATS[Math.floor(Math.random()*SIM_THREATS.length)];
  const zone    = SIM_ZONES[Math.floor(Math.random()*SIM_ZONES.length)];
  const cam     = SIM_CAMS[Math.floor(Math.random()*SIM_CAMS.length)];
  const name    = SIM_NAMES[Math.floor(Math.random()*SIM_NAMES.length)];
  const conf    = Math.floor(Math.random()*20)+72;

  const newDet = {
    detId: 'DT-SIM-'+Date.now(),
    camId: cam, zone, personName: name,
    dbId: null, type: 'unknown',
    confidence: conf, threat, time: timeStr, sector: zone.replace('-',' ')
  };

  // Prepend to feed grid
  const grid = document.getElementById('detection-feed-grid');
  if (grid) {
    const div = document.createElement('div');
    div.innerHTML = buildDetectionCard(newDet);
    grid.insertBefore(div.firstElementChild, grid.firstChild);
    // Render canvas noise
    setTimeout(() => {
      const c = document.getElementById('canvas-'+newDet.detId);
      if (c) renderCamNoiseOnCanvas(c);
    }, 100);
  }

  // Add to log
  LOG_ENTRIES.unshift({
    time: timeStr, cam, name, match:'UNKNOWN',
    threat: threat ? (threat.charAt(0).toUpperCase()+threat.slice(1)) : 'None',
    zone, status: threat ? 'threat' : 'unknown'
  });
  renderLog();
  renderTimeline();

  // If threat, trigger popup
  if (threat) {
    setTimeout(() => triggerThreatPopup(newDet.detId, zone+' – '+cam, name, threat), 600);
  } else {
    MilToast.show('New Detection', `Unknown person at ${zone} via ${cam}`, 'warning');
  }

  // Update unknown count badge
  const unknownEl = document.getElementById('stat-unknown');
  if (unknownEl) unknownEl.textContent = parseInt(unknownEl.textContent||0)+1;
}
window.simulateNewDetection = simulateNewDetection;

/* ─────────────────────────────────────────────
   CAMERA CANVAS NOISE
   ───────────────────────────────────────────── */
function renderCamNoiseOnCanvas(canvas) {
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');
  function frame() {
    const W = canvas.offsetWidth  || 300;
    const H = canvas.offsetHeight || 150;
    canvas.width = W; canvas.height = H;
    const img = ctx.createImageData(W, H);
    for (let i = 0; i < img.data.length; i += 4) {
      const g = Math.random() * 35;
      img.data[i]   = g * 0.15;
      img.data[i+1] = g;
      img.data[i+2] = g * 0.35;
      img.data[i+3] = 90;
    }
    ctx.putImageData(img, 0, 0);
    requestAnimationFrame(frame);
  }
  frame();
}

/* ─────────────────────────────────────────────
   LIVE MAP TIME ticker
   ───────────────────────────────────────────── */
function tickMapTime() {
  const el = document.getElementById('map-time');
  if (el) el.textContent = new Date().toLocaleTimeString('en-US',{hour12:false});
}

/* ─────────────────────────────────────────────
   DOM READY – Bootstrap all renders
   ───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Detection cards
  const feedGrid = document.getElementById('detection-feed-grid');
  if (feedGrid) {
    feedGrid.innerHTML = DETECTIONS.map(d => buildDetectionCard(d)).join('');
    // Render canvas noise on each detection feed
    DETECTIONS.forEach(d => {
      const c = document.getElementById('canvas-'+d.detId);
      if (c) renderCamNoiseOnCanvas(c);
    });
  }

  // Threat cards
  const threatGrid = document.getElementById('threat-feed-grid');
  if (threatGrid) {
    const threats = DETECTIONS.filter(d => d.threat !== null);
    threatGrid.innerHTML = threats.length
      ? threats.map(d => buildThreatCard(d)).join('')
      : `<div class="col-12 text-center" style="color:var(--primary);padding:24px">
           <i class="fa-solid fa-shield-check fa-2x mb-2 d-block"></i>No Active Threats
         </div>`;
    // Animate progress bars inside threat cards
    setTimeout(() => {
      document.querySelectorAll('#threat-feed-grid [data-progress]').forEach(bar => {
        bar.style.width = bar.dataset.progress + '%';
      });
    }, 300);
  }

  // Robot map
  setTimeout(renderRobotMap, 200);
  window.addEventListener('resize', () => renderRobotMap());

  // Zone status
  renderZoneStatus();

  // Database
  renderDatabase();

  // Log + Timeline
  renderLog();
  renderTimeline();

  // Update sidebar badge counts
  const unknownCount = DETECTIONS.filter(d => d.type === 'unknown').length;
  const threatCount  = DETECTIONS.filter(d => d.threat !== null).length;
  const sbU = document.getElementById('sb-unknown-count');
  const sbT = document.getElementById('sb-threat-count');
  const sbL = document.getElementById('sb-log-count');
  if (sbU) sbU.textContent = unknownCount;
  if (sbT) sbT.textContent = threatCount;
  if (sbL) sbL.textContent = LOG_ENTRIES.length;

  // Map time ticker
  tickMapTime();
  setInterval(tickMapTime, 1000);

  // Auto-simulate detection every 20s
  setInterval(() => {
    if (Math.random() > 0.4) simulateNewDetection();
  }, 20000);
});
