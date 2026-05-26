/* ============================================================
   🚀 main.js — App entry point
   Imports all modules and runs init() after DOM is ready
   ============================================================ */

import { initDom } from './dom.js';
import { createStars, applyLanguage, updateGregorianDate, updateBackgroundTheme, setDailyDua } from './ui.js';
import { loadSettings } from './settings.js';
import { detectLocation } from './location.js';
import { bindEvents, initLangModal, initPWA } from './events.js';
import { startCountdown } from './notifications.js';
import { initTasbeeh } from './tasbeeh.js';
import { initTracker, updateTrackerUI } from './tracker.js';
import { initDuas } from './duas.js';
import { state } from './state.js';

async function init() {
    // 1. Initialize all DOM refs (must be first, after DOMContentLoaded)
    initDom();

    // 2. Bind all click/input/keyboard events
    bindEvents();

    // 3. Load saved settings into form
    loadSettings();

    // 4. Apply saved language (translation + RTL)
    applyLanguage();

    // 5. Visual setup
    createStars();
    updateGregorianDate();
    updateBackgroundTheme();
    setDailyDua();

    // 6. Language modal
    initLangModal();

    // 7. PWA install prompt
    initPWA();

    // 8. Set footer year
    const yearEl = document.getElementById('currentYear');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 8b. Offline / Online detection
    const offlineBanner = document.getElementById('offlineBanner');
    function updateNetworkStatus() {
        if (!navigator.onLine) {
            if (offlineBanner) offlineBanner.style.display = 'flex';
            import('./ui.js').then(({ showToast }) =>
                showToast('📵 Offline — showing cached prayer times')
            );
        } else {
            if (offlineBanner) offlineBanner.style.display = 'none';
        }
    }
    window.addEventListener('online',  updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus(); // Check on load

    // 8c. Service Worker: notify when a new version is available
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(reg => {
            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                newWorker?.addEventListener('statechange', () => {
                    if (newWorker.statechange === 'installed' && navigator.serviceWorker.controller) {
                        import('./ui.js').then(({ showToast }) =>
                            showToast('🔄 New version available! Pull to refresh.')
                        );
                    }
                });
            });
        });
    }

    // 9. Wire up countdown — api.js fires this after each prayer times fetch
    document.addEventListener('prayerTimesLoaded', () => {
        startCountdown();
        initRamadanMode();    // Check Ramadan after timings load
    });

    // 10. Detect & load location → triggers prayer times fetch
    await detectLocation();

    // 11. New Islamic features
    initTasbeeh();
    initTracker();
    initDuas();

    // 12. Jumu'ah banner (Friday check)
    initJumuahBanner();
}

/* ─── Jumu'ah Banner ─── */
function initJumuahBanner() {
    const banner = document.getElementById('jumuahBanner');
    if (!banner) return;
    const today = new Date();
    if (today.getDay() === 5) {   // 5 = Friday
        banner.style.display = 'flex';
    }
}

/* ─── Ramadan / Sehri-Iftar Mode ─── */
function initRamadanMode() {
    // Hijri month 9 = Ramadan
    const isRamadan = state.hijriMonth === 9;
    const section   = document.getElementById('ramadanSection');
    if (!section) return;
    section.style.display = isRamadan ? 'block' : 'none';
    if (!isRamadan) return;

    // Fill Sehri (Imsak) and Iftar (Maghrib) times
    const timings = state.todayTimings;
    if (!timings) return;

    const sehriEl = document.getElementById('sehriTime');
    const iftarEl = document.getElementById('iftarTime');
    if (sehriEl) sehriEl.textContent = formatTimeSI(timings.Imsak);
    if (iftarEl) iftarEl.textContent = formatTimeSI(timings.Maghrib);

    // Start countdown
    startRamadanCountdown(timings);
}

function formatTimeSI(t) {
    if (!t) return '--:--';
    const [h, m] = t.replace(' (+ 1D)', '').split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${ampm}`;
}

function startRamadanCountdown(timings) {
    clearInterval(window._ramadanTimer);
    const labelEl     = document.getElementById('ramadanLabel');
    const countdownEl = document.getElementById('ramadanCountdown');
    const metaEl      = document.getElementById('ramadanMeta');

    function parseTime(str) {
        if (!str) return null;
        const [h, m] = str.replace(' (+ 1D)', '').split(':').map(Number);
        const now = new Date();
        const t = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
        return t;
    }

    const sehri = parseTime(timings.Imsak);
    const iftar = parseTime(timings.Maghrib);

    window._ramadanTimer = setInterval(() => {
        const now  = new Date();
        let target, label;

        if (now < sehri) {
            target = sehri; label = 'Sehri Ends In';
        } else if (now < iftar) {
            target = iftar; label = 'Iftar In';
        } else {
            // Past Iftar — show next Sehri (next day, simplified)
            label = 'Rozah Mubarak! 🌙';
            if (countdownEl) countdownEl.textContent = '--:--:--';
            if (labelEl) labelEl.textContent = label;
            const day = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
            if (metaEl) metaEl.textContent = `${day} • Ramadan ${state.hijriMonth === 9 ? '' : ''}`;
            return;
        }

        const diff = Math.max(0, target - now);
        const hh = String(Math.floor(diff / 3600000)).padStart(2,'0');
        const mm = String(Math.floor((diff % 3600000) / 60000)).padStart(2,'0');
        const ss = String(Math.floor((diff % 60000) / 1000)).padStart(2,'0');

        if (countdownEl) countdownEl.textContent = `${hh}:${mm}:${ss}`;
        if (labelEl) labelEl.textContent = label;

        const hijriDay = state.hijriYear ? `${new Date().getDate()} Ramadan ${state.hijriYear} AH` : 'Ramadan Kareem';
        if (metaEl) metaEl.textContent = hijriDay;
    }, 1000);
}

// Start app after DOM is ready
document.addEventListener('DOMContentLoaded', init);
