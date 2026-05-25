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

    // 9. Wire up countdown — api.js fires this after each prayer times fetch
    document.addEventListener('prayerTimesLoaded', () => startCountdown());

    // 10. Detect & load location → triggers prayer times fetch
    await detectLocation();
}

// Start app after DOM is ready
document.addEventListener('DOMContentLoaded', init);
