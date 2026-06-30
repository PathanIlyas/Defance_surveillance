/* ============================================
   APP.JS - Core Application Bootstrap
   ============================================ */

'use strict';

/* ---- Loading Overlay ---- */
window.addEventListener('load', () => {
  const overlay = document.getElementById('loading-overlay');
  if (!overlay) return;
  setTimeout(() => {
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    setTimeout(() => overlay.remove(), 500);
  }, 1800);
});

/* ---- AOS Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      offset: 40
    });
  }
});

/* ---- Sidebar Toggle ---- */
document.addEventListener('DOMContentLoaded', () => {
  const sidebar   = document.getElementById('sidebar');
  const backdrop  = document.getElementById('sidebar-backdrop');
  const menuBtn   = document.getElementById('menu-toggle');

  function openSidebar() {
    sidebar?.classList.add('open');
    backdrop?.classList.add('d-block');
    backdrop && (backdrop.style.display = 'block');
  }
  function closeSidebar() {
    sidebar?.classList.remove('open');
    backdrop && (backdrop.style.display = 'none');
  }

  menuBtn?.addEventListener('click', () => {
    sidebar?.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  backdrop?.addEventListener('click', closeSidebar);

  /* Close on nav-item click (mobile) */
  document.querySelectorAll('.nav-item-mil').forEach(el => {
    el.addEventListener('click', () => {
      if (window.innerWidth < 992) closeSidebar();
    });
  });
});

/* ---- Dark/Light Mode Toggle (dark-first) ---- */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('darkmode-btn');
  const icon = btn?.querySelector('i');
  let isDark = true;

  btn?.addEventListener('click', () => {
    isDark = !isDark;
    if (isDark) {
      document.documentElement.style.setProperty('--bg-main',    '#0f172a');
      document.documentElement.style.setProperty('--bg-sidebar', '#111827');
      document.documentElement.style.setProperty('--bg-card',    '#1e293b');
      if (icon) { icon.className = 'fa-solid fa-moon'; }
    } else {
      document.documentElement.style.setProperty('--bg-main',    '#e8edf5');
      document.documentElement.style.setProperty('--bg-sidebar', '#1e293b');
      document.documentElement.style.setProperty('--bg-card',    '#f0f4fa');
      document.documentElement.style.setProperty('--text',       '#0f172a');
      document.documentElement.style.setProperty('--text-secondary', '#475569');
      if (icon) { icon.className = 'fa-solid fa-sun'; }
    }
  });
});

/* ---- Real-time Clock ---- */
function updateClock() {
  const el = document.getElementById('realtime-clock');
  if (!el) return;
  const now   = new Date();
  const hh    = String(now.getHours()).padStart(2,'0');
  const mm    = String(now.getMinutes()).padStart(2,'0');
  const ss    = String(now.getSeconds()).padStart(2,'0');
  const date  = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  el.textContent = `${date}  ${hh}:${mm}:${ss} UTC`;
}
document.addEventListener('DOMContentLoaded', () => {
  updateClock();
  setInterval(updateClock, 1000);
});

/* ---- Emergency Modal ---- */
document.addEventListener('DOMContentLoaded', () => {
  const triggerBtns = document.querySelectorAll('[data-emergency]');
  const overlay     = document.getElementById('emergency-overlay');
  const closeBtn    = document.getElementById('emergency-close');

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      overlay?.classList.add('active');
    });
  });
  closeBtn?.addEventListener('click', () => {
    overlay?.classList.remove('active');
  });
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.classList.remove('active');
  });
});

/* ---- Toast Notifications ---- */
window.MilToast = {
  show(title, msg, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { info: 'fa-circle-info', danger: 'fa-triangle-exclamation', success: 'fa-circle-check', warning: 'fa-bell' };
    const colors = { info: 'var(--info)', danger: 'var(--danger)', success: 'var(--primary)', warning: 'var(--warning)' };

    const el = document.createElement('div');
    el.className = `toast-item alert-toast ${type}`;
    el.innerHTML = `
      <i class="fa-solid ${icons[type] || 'fa-circle-info'}" style="color:${colors[type]||'var(--primary)'};margin-top:2px;font-size:1rem;flex-shrink:0"></i>
      <div>
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${msg}</div>
      </div>
    `;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('dismiss');
      setTimeout(() => el.remove(), 400);
    }, 4000);
  }
};

/* ---- Notification Bell ---- */
document.addEventListener('DOMContentLoaded', () => {
  const bell = document.getElementById('notif-btn');
  bell?.addEventListener('click', () => {
    MilToast.show('3 New Alerts', 'Threat detected at Sector-7 Alpha', 'danger');
  });
});

/* ---- Active Nav Highlight ---- */
document.addEventListener('DOMContentLoaded', () => {
  const items = document.querySelectorAll('.nav-item-mil');
  items.forEach(item => {
    item.addEventListener('click', function () {
      items.forEach(i => i.classList.remove('active'));
      this.classList.add('active');
    });
  });
});

/* ---- Counter Animation ---- */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1400;
  const step = target / (duration / 16);
  let current = 0;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current).toLocaleString();
  }, 16);
}

document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('[data-counter]').forEach(el => observer.observe(el));
});

/* ---- Simulate live data refresh (demo) ---- */
document.addEventListener('DOMContentLoaded', () => {
  setInterval(() => {
    /* Randomly fire a toast to simulate live system events */
    const events = [
      { t: 'GPS Lock Acquired', m: 'Unit R-09 position confirmed', type: 'success' },
      { t: 'Battery Warning',   m: 'Unit R-14 battery at 18%',     type: 'warning' },
      { t: 'Perimeter Breach',  m: 'Motion detected – Grid E4',     type: 'danger'  },
      { t: 'Signal Restored',   m: 'Comms re-established – Base-2', type: 'info'    },
    ];
    const e = events[Math.floor(Math.random() * events.length)];
    MilToast.show(e.t, e.m, e.type);
  }, 15000);
});
