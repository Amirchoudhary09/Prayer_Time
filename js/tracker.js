/* ============================================================
   ✅ tracker.js — Prayer Tracker (daily namaz log)
   ============================================================ */

import { showToast } from './ui.js';
import { PRAYER_NAMES } from './constants.js';
import { state } from './state.js';

// Returns today's key: "2026-05-26"
function todayKey() {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth()+1).padStart(2,'0')}-${String(t.getDate()).padStart(2,'0')}`;
}

// Load today's tracking state
function loadToday() {
    const saved = JSON.parse(localStorage.getItem('pt_tracker') || '{}');
    const key = todayKey();
    if (!saved[key]) saved[key] = {};
    return { saved, key };
}

export function isPrayerDone(prayerKey) {
    const { saved, key } = loadToday();
    return !!saved[key][prayerKey];
}

export function togglePrayer(prayerKey) {
    const { saved, key } = loadToday();
    saved[key][prayerKey] = !saved[key][prayerKey];

    // Prune old entries (keep last 30 days)
    const keys = Object.keys(saved).sort();
    while (keys.length > 30) {
        delete saved[keys.shift()];
    }
    localStorage.setItem('pt_tracker', JSON.stringify(saved));
    updateTrackerUI();
    return saved[key][prayerKey];
}

export function initTracker() {
    // Add tracker buttons to existing prayer cards
    const mainPrayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    mainPrayers.forEach(key => {
        const card = document.getElementById(`card-${key}`);
        if (!card) return;

        // Check if already added
        if (card.querySelector('.tracker-btn')) return;

        // Create tracker button
        const btn = document.createElement('button');
        btn.className = 'tracker-btn';
        btn.id = `tracker-${key}`;
        btn.title = 'Mark as prayed';
        btn.setAttribute('aria-label', `Mark ${key} as prayed`);
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Don't open edit modal
            const done = togglePrayer(key);
            const lang = state.appLang || 'en';
            const pName = (PRAYER_NAMES[key] || {})[lang] || key;
            showToast(done ? `✅ ${pName} — Prayed!` : `◻ ${pName} — Unmarked`);
            if (done && navigator.vibrate) navigator.vibrate(60);
        });

        card.style.position = 'relative';
        card.appendChild(btn);
    });

    updateTrackerUI();

    // Summary bar
    const summaryEl = document.getElementById('trackerSummary');
    if (summaryEl) updateTrackerSummary();
}

export function updateTrackerUI() {
    const mainPrayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    mainPrayers.forEach(key => {
        const btn  = document.getElementById(`tracker-${key}`);
        const card = document.getElementById(`card-${key}`);
        if (!btn || !card) return;
        const done = isPrayerDone(key);
        btn.classList.toggle('done', done);
        card.classList.toggle('tracker-done', done);
    });
    updateTrackerSummary();
}

function updateTrackerSummary() {
    const summaryEl  = document.getElementById('trackerSummary');
    const summaryNum = document.getElementById('trackerCount');
    const summaryBar = document.getElementById('trackerBar');
    if (!summaryEl) return;

    const mainPrayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const count = mainPrayers.filter(k => isPrayerDone(k)).length;
    const pct   = (count / 5) * 100;

    if (summaryNum) summaryNum.textContent = `${count}/5`;
    if (summaryBar) summaryBar.style.width  = `${pct}%`;

    // Update summary color
    if (summaryEl) {
        summaryEl.className = 'tracker-summary';
        if (count === 5) summaryEl.classList.add('complete');
        else if (count >= 3) summaryEl.classList.add('partial');
        else if (count > 0)  summaryEl.classList.add('started');
    }
}

// Streak calculation
export function getPrayerStreak() {
    const saved = JSON.parse(localStorage.getItem('pt_tracker') || '{}');
    const mainPrayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
    let streak = 0;
    const today = new Date();

    for (let i = 0; i <= 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        if (!saved[key]) break;
        const dayCount = mainPrayers.filter(p => saved[key][p]).length;
        if (dayCount === 5) streak++;
        else if (i === 0) continue; // today not complete yet, don't break
        else break;
    }
    return streak;
}
