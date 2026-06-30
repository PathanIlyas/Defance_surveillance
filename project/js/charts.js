/* ============================================
   CHARTS.JS - Chart.js Configurations
   ============================================ */

'use strict';

/* ---- Shared Defaults ---- */
const COLORS = {
  primary:  '#00ff9d',
  danger:   '#ff4d4d',
  warning:  '#fbbf24',
  info:     '#38bdf8',
  purple:   '#a78bfa',
  gridLine: 'rgba(255,255,255,0.06)',
  tickColor:'#94a3b8',
};

const baseFont = { family: "'Segoe UI', system-ui, sans-serif", size: 11 };

Chart.defaults.color = COLORS.tickColor;
Chart.defaults.borderColor = COLORS.gridLine;
Chart.defaults.font = baseFont;

function axisConfig(display = true) {
  return {
    display,
    grid: { color: COLORS.gridLine, drawBorder: false },
    ticks: { color: COLORS.tickColor, font: baseFont }
  };
}

function legendConfig() {
  return {
    display: true,
    labels: { color: '#fff', font: baseFont, boxWidth: 10, padding: 14 }
  };
}

/* ---- Threat Analytics ---- */
function initThreatChart() {
  const ctx = document.getElementById('threatChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Threats Detected',
          data: [12, 19, 8, 25, 14, 9, 17],
          borderColor: COLORS.danger,
          backgroundColor: 'rgba(255,77,77,0.12)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.45,
          pointBackgroundColor: COLORS.danger,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
        {
          label: 'Neutralized',
          data: [9, 15, 7, 20, 12, 8, 14],
          borderColor: COLORS.primary,
          backgroundColor: 'rgba(0,255,157,0.08)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.45,
          pointBackgroundColor: COLORS.primary,
          pointRadius: 4,
          pointHoverRadius: 6,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: legendConfig(), tooltip: { backgroundColor: '#1e293b', titleColor:'#fff', bodyColor: COLORS.tickColor } },
      scales: { x: axisConfig(), y: axisConfig() }
    }
  });
}

/* ---- Robot Analytics ---- */
function initRobotChart() {
  const ctx = document.getElementById('robotChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Active', 'Standby', 'Offline', 'Maintenance'],
      datasets: [{
        data: [18, 7, 4, 3],
        backgroundColor: [COLORS.primary, COLORS.warning, COLORS.danger, COLORS.info],
        borderColor: '#1e293b',
        borderWidth: 3,
        hoverBorderWidth: 4,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      cutout: '68%',
      plugins: {
        legend: { ...legendConfig(), position: 'right' },
        tooltip: { backgroundColor: '#1e293b', titleColor:'#fff', bodyColor: COLORS.tickColor }
      }
    }
  });
}

/* ---- Battery Analytics ---- */
function initBatteryChart() {
  const ctx = document.getElementById('batteryChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['R-01','R-02','R-03','R-04','R-05','R-06','R-07','R-08'],
      datasets: [{
        label: 'Battery %',
        data: [87, 54, 92, 23, 76, 41, 88, 65],
        backgroundColor: (ctx) => {
          const v = ctx.raw;
          if (v >= 70) return 'rgba(0,255,157,0.75)';
          if (v >= 40) return 'rgba(251,191,36,0.75)';
          return 'rgba(255,77,77,0.75)';
        },
        borderRadius: 4,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b', bodyColor: COLORS.tickColor } },
      scales: {
        x: axisConfig(),
        y: { ...axisConfig(), min: 0, max: 100, ticks: { ...axisConfig().ticks, callback: v => v + '%' } }
      }
    }
  });
}

/* ---- Mission Analytics ---- */
function initMissionChart() {
  const ctx = document.getElementById('missionChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'radar',
    data: {
      labels: ['Recon', 'Strike', 'Patrol', 'Rescue', 'Surveillance', 'Support'],
      datasets: [
        {
          label: 'Completed',
          data: [85, 60, 90, 70, 88, 75],
          backgroundColor: 'rgba(0,255,157,0.15)',
          borderColor: COLORS.primary,
          borderWidth: 2,
          pointBackgroundColor: COLORS.primary,
        },
        {
          label: 'Planned',
          data: [100, 80, 100, 85, 100, 90],
          backgroundColor: 'rgba(56,189,248,0.08)',
          borderColor: COLORS.info,
          borderWidth: 2,
          pointBackgroundColor: COLORS.info,
        }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: legendConfig(), tooltip: { backgroundColor: '#1e293b', bodyColor: COLORS.tickColor } },
      scales: {
        r: {
          backgroundColor: 'transparent',
          grid: { color: COLORS.gridLine },
          angleLines: { color: COLORS.gridLine },
          ticks: { color: COLORS.tickColor, backdropColor: 'transparent', font: baseFont },
          pointLabels: { color: '#fff', font: baseFont }
        }
      }
    }
  });
}

/* ---- Activity Sparkline ---- */
function initActivityChart() {
  const ctx = document.getElementById('activityChart');
  if (!ctx) return;
  const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
  const data   = labels.map(() => Math.floor(Math.random() * 80) + 10);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: 'rgba(0,255,157,0.4)',
        borderColor: COLORS.primary,
        borderWidth: 1,
        borderRadius: 3,
        borderSkipped: false,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1e293b' } },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    }
  });
}

/* ---- Init all charts on DOM ready ---- */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof Chart === 'undefined') {
    console.warn('[Charts] Chart.js not loaded.');
    return;
  }
  initThreatChart();
  initRobotChart();
  initBatteryChart();
  initMissionChart();
  initActivityChart();
});
