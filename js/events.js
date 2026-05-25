/* ============================================================
   🎮 events.js — All DOM event bindings (bindEvents)
   ============================================================ */

import { state } from './state.js';
import { dom, $ } from './dom.js';
import { fetchPrayerTimes, calculateQibla, initDeviceCompass } from './api.js';
import { applyLanguage, showToast, updatePrayerCards, toggleTheme } from './ui.js';
import { detectLocation, searchCity, deleteLocation, saveCurrentLocationToHistory, openLocManagerModal, closeLocManagerModal } from './location.js';
import { loadSettings, saveSettings, openSettingsModal, closeSettingsModal, openEditTimeModal, closeEditTimeModal, getCurrentEditingPrayer } from './settings.js';
import { openCalendarModal, closeCalendarModal, toggleCalendarLang, renderCalendar, openDatePrayerModal, closeDateModal } from './calendar.js';
import { startCountdown } from './notifications.js';
import { SUPPORTED_LANGUAGES, TRANSLATIONS } from './constants.js';

// ─── Safe event helper ───
function on(id, event, handler) {
    const el = typeof id === 'string' ? $(id) : id;
    if (el) el.addEventListener(event, handler);
}

// ─── Language Modal ───
export function initLangModal() {
    const langList = $('languageList');
    if (!langList) return;

    function renderLanguages(filter = '') {
        langList.innerHTML = '';
        SUPPORTED_LANGUAGES.forEach(lang => {
            if (lang.name.toLowerCase().includes(filter.toLowerCase()) || lang.native.toLowerCase().includes(filter.toLowerCase())) {
                const el = document.createElement('div');
                el.className = 'lang-list-item' + (state.appLang === lang.code ? ' active' : '');
                el.innerHTML = `<span>${lang.native}</span><span style="opacity:0.5;font-size:0.85rem;">${lang.name}</span>`;
                el.addEventListener('click', () => {
                    state.appLang = lang.code;
                    localStorage.setItem('pt_lang', state.appLang);
                    applyLanguage();
                    renderLanguages(filter);
                    $('langModal')?.classList.remove('active');
                    showToast('🌐 Language changed');
                });
                langList.appendChild(el);
            }
        });
    }

    renderLanguages();
    const searchInput = $('langSearchInput');
    if (searchInput) searchInput.addEventListener('input', e => renderLanguages(e.target.value));
    on('langToggleBtn', 'click', () => { renderLanguages(); if (searchInput) searchInput.value = ''; $('langModal')?.classList.add('active'); });
    on('closeLangBtn',  'click', () => $('langModal')?.classList.remove('active'));
}

// ─── All Event Bindings ───
export function bindEvents() {
    // Calendar
    on('calendarBtn',      'click', openCalendarModal);
    on('closeCalendarBtn', 'click', closeCalendarModal);
    if (dom.calendarModal) on(dom.calendarModal, 'click', e => { if (e.target === dom.calendarModal) closeCalendarModal(); });
    if (dom.calLangToggle) on(dom.calLangToggle, 'click', toggleCalendarLang);

    // Location
    on('locationBtn', 'click', () => detectLocation());

    // Settings
    on('settingsBtn',      'click', openSettingsModal);
    on('closeSettingsBtn', 'click', closeSettingsModal);
    on('saveSettingsBtn',  'click', saveSettings);
    if (dom.settingsModal) on(dom.settingsModal, 'click', e => { if (e.target === dom.settingsModal) closeSettingsModal(); });

    // Notify Select All
    on('notifySelectAllBtn', 'click', () => {
        const checkboxes = dom.settingsModal?.querySelectorAll('.setting-checkbox') || [];
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        checkboxes.forEach(cb => cb.checked = !allChecked);
        const btn = $('notifySelectAllBtn');
        if (btn) btn.textContent = !allChecked ? 'Disable All' : 'Enable All';
    });

    // Date Prayer Modal
    on('closeDateModalBtn', 'click', closeDateModal);
    if (dom.datePrayerModal) on(dom.datePrayerModal, 'click', e => { if (e.target === dom.datePrayerModal) closeDateModal(); });

    // City search with live autocomplete
    setupCityAutocomplete();

    // Month navigation
    on('prevMonthBtn', 'click', () => {
        if (state.calMode === 'english') {
            state.calMonth--; if (state.calMonth < 0) { state.calMonth = 11; state.calYear--; }
        } else {
            state.hijriMonth--; if (state.hijriMonth < 1) { state.hijriMonth = 12; state.hijriYear--; }
            state.hijriCalData = null;
        }
        renderCalendar();
    });
    on('nextMonthBtn', 'click', () => {
        if (state.calMode === 'english') {
            state.calMonth++; if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; }
        } else {
            state.hijriMonth++; if (state.hijriMonth > 12) { state.hijriMonth = 1; state.hijriYear++; }
            state.hijriCalData = null;
        }
        renderCalendar();
    });

    // Prayer card click → edit time
    document.querySelectorAll('.prayer-card, .sec-time-item').forEach(card => {
        const prayerKey = card.getAttribute('data-prayer') || card.getAttribute('data-sec');
        if (prayerKey) {
            card.style.cursor = 'pointer';
            card.title = 'Click to set time';
            card.addEventListener('click', e => { e.stopPropagation(); openEditTimeModal(prayerKey); });
        }
    });

    // Edit Time Modal
    on('closeEditTimeBtn', 'click', closeEditTimeModal);
    on('editTimeModal', 'click', e => { if (e.target === $('editTimeModal')) closeEditTimeModal(); });
    on('saveTimeBtn',  'click', () => {
        const key = getCurrentEditingPrayer();
        if (key) {
            state.jamaatTimes[key] = $('editTimeInput')?.value || '';
            localStorage.setItem('pt_jamaat_times', JSON.stringify(state.jamaatTimes));
            updatePrayerCards(); startCountdown(); closeEditTimeModal();
            showToast('✅ Time updated!');
        }
    });
    on('resetTimeBtn', 'click', () => {
        const key = getCurrentEditingPrayer();
        if (key) {
            state.jamaatTimes[key] = '';
            localStorage.setItem('pt_jamaat_times', JSON.stringify(state.jamaatTimes));
            updatePrayerCards(); startCountdown(); closeEditTimeModal();
            showToast('🔄 Reset to default');
        }
    });

    // Compass
    on('enableCompassBtn', 'click', initDeviceCompass);

    // Hero card → today's prayer modal
    on('heroCard', 'click', () => {
        const t = new Date();
        openDatePrayerModal(`${t.getDate()}-${t.getMonth() + 1}-${t.getFullYear()}`);
    });

    // Theme toggle
    on('themeToggleBtn', 'click', toggleTheme);

    // Location Manager
    on('closeLocManagerBtn',    'click', closeLocManagerModal);
    on('locationManagerModal',  'click', e => { if (e.target === $('locationManagerModal')) closeLocManagerModal(); });
    on('locManagerSearchBtn',   'click', () => { const c = $('locManagerSearchInput')?.value.trim(); if (c) { searchCity(c); closeLocManagerModal(); $('locManagerSearchInput').value = ''; } });
    on('locManagerSearchInput', 'keydown', e => { if (e.key === 'Enter') { const c = $('locManagerSearchInput').value.trim(); if (c) { searchCity(c); closeLocManagerModal(); $('locManagerSearchInput').value = ''; } } });

    // Location long press & context menu
    const locWrapper = $('locationDisplayWrapper');
    const locMenu    = $('locationContextMenu');
    if (locWrapper && locMenu) {
        locWrapper.addEventListener('pointerdown', e => {
            if (e.target.closest('.location-context-menu')) return;
            state.longPressTimer = setTimeout(() => { locMenu.style.display = 'flex'; state.longPressTimer = null; }, 800);
        });
        locWrapper.addEventListener('pointerup', e => {
            if (e.target.closest('.location-context-menu')) return;
            if (state.longPressTimer) { clearTimeout(state.longPressTimer); openLocManagerModal(); }
        });
        locWrapper.addEventListener('pointerleave', () => { if (state.longPressTimer) clearTimeout(state.longPressTimer); });
    }
    on('cancelLocationBtn', 'click', e => { e.stopPropagation(); if (locMenu) locMenu.style.display = 'none'; });
    on('deleteLocationBtn', 'click', e => { e.stopPropagation(); if (locMenu) locMenu.style.display = 'none'; deleteLocation(state.city); showToast('🗑️ Location deleted'); });
    document.addEventListener('click', e => { if (locWrapper && !locWrapper.contains(e.target) && locMenu) locMenu.style.display = 'none'; });

    // Jamaat Badge → all 5 prayers edit
    on('jamaatTimeBadge', 'click', e => {
        e.stopPropagation();
        ['Fajr','Dhuhr','Asr','Maghrib','Isha'].forEach(k => {
            const el = $(`quickOffset${k}`);
            if (el) el.value = state.jamaatTimes[k.toLowerCase()] || '';
        });
        const modal = $('jamaatEditModal');
        if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
    });

    function closeJamaatModal() {
        const modal = $('jamaatEditModal');
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    on('closeJamaatEditBtn', 'click', closeJamaatModal);
    on('jamaatEditModal',    'click', e => { if (e.target === $('jamaatEditModal')) closeJamaatModal(); });
    on('saveJamaatEditBtn',  'click', () => {
        ['fajr','dhuhr','asr','maghrib','isha'].forEach(k => {
            const el = $(`quickOffset${k.charAt(0).toUpperCase() + k.slice(1)}`);
            state.jamaatTimes[k] = (el && el.value) || '';
        });
        localStorage.setItem('pt_jamaat_times', JSON.stringify(state.jamaatTimes));
        if (dom.offsetFajr) {
            dom.offsetFajr.value    = state.jamaatTimes.fajr;
            dom.offsetDhuhr.value   = state.jamaatTimes.dhuhr;
            dom.offsetAsr.value     = state.jamaatTimes.asr;
            dom.offsetMaghrib.value = state.jamaatTimes.maghrib;
            dom.offsetIsha.value    = state.jamaatTimes.isha;
        }
        closeJamaatModal(); updatePrayerCards();
        showToast('✅ Jamaat times saved!');
    });

    // Escape closes all
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeSettingsModal(); closeDateModal(); closeCalendarModal();
            closeLocManagerModal(); closeJamaatModal(); closeEditTimeModal();
            if (locMenu) locMenu.style.display = 'none';
        }
    });
}

// ─── City Autocomplete ───
function setupCityAutocomplete() {
    if (!dom.manualCity) return;
    const acDropdown = $('cityAutocomplete');
    let timer = null;

    function showSuggestions(results) {
        if (!acDropdown) return;
        acDropdown.innerHTML = '';
        if (!results || results.length === 0) { acDropdown.style.display = 'none'; return; }
        acDropdown.style.display = 'block';
        results.forEach(r => {
            const item = document.createElement('div');
            item.style.cssText = 'padding:10px 14px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.07); font-size:0.9rem; color:var(--text-primary,#fff); transition:background 0.15s;';
            const addr = r.address || {};
            const parts = [];
            if (addr.city || addr.town || addr.village || addr.county) parts.push(addr.city || addr.town || addr.village || addr.county);
            if (addr.state)   parts.push(addr.state);
            if (addr.country) parts.push(addr.country);
            item.textContent = parts.length ? parts.join(', ') : r.display_name.split(',').slice(0, 3).join(',');
            item.addEventListener('mouseenter', () => item.style.background = 'rgba(255,255,255,0.1)');
            item.addEventListener('mouseleave', () => item.style.background = '');
            item.addEventListener('click', () => {
                const cityName    = addr.city || addr.town || addr.village || addr.county || r.display_name.split(',')[0];
                const countryName = addr.country || '';
                state.lat = parseFloat(r.lat); state.lng = parseFloat(r.lon);
                state.city = cityName; state.country = countryName;
                if (dom.cityName) dom.cityName.textContent = cityName + (countryName ? ', ' + countryName : '');
                saveCurrentLocationToHistory();
                fetchPrayerTimes(); calculateQibla();
                acDropdown.style.display = 'none';
                dom.manualCity.value = '';
                closeSettingsModal();
                showToast(`📍 Switched to ${cityName}`);
            });
            acDropdown.appendChild(item);
        });
    }

    async function fetchSuggestions(query) {
        if (!query || query.length < 2) { if (acDropdown) acDropdown.style.display = 'none'; return; }
        try {
            const ctrl = new AbortController();
            setTimeout(() => ctrl.abort(), 3000);
            const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`, { signal: ctrl.signal, headers: { 'Accept-Language': state.appLang || 'en' } });
            showSuggestions(await res.json());
        } catch { if (acDropdown) acDropdown.style.display = 'none'; }
    }

    dom.manualCity.addEventListener('input',   e => { clearTimeout(timer); timer = setTimeout(() => fetchSuggestions(e.target.value.trim()), 300); });
    dom.manualCity.addEventListener('keydown', e => {
        if (e.key === 'Enter')  { const c = dom.manualCity.value.trim(); if (c) { searchCity(c); closeSettingsModal(); if (acDropdown) acDropdown.style.display = 'none'; } }
        if (e.key === 'Escape') { if (acDropdown) acDropdown.style.display = 'none'; }
    });
    document.addEventListener('click', e => {
        if (acDropdown && !dom.manualCity.contains(e.target) && !acDropdown.contains(e.target)) acDropdown.style.display = 'none';
    });

    on('searchCityBtn', 'click', () => {
        const c = dom.manualCity?.value.trim();
        if (c) { searchCity(c); closeSettingsModal(); if (acDropdown) acDropdown.style.display = 'none'; }
    });
}

// ─── PWA Install Prompt ───
export function initPWA() {
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault(); deferredPrompt = e;
        const modal = $('installPromptModal');
        if (modal && !localStorage.getItem('pt_pwa_dismissed')) {
            setTimeout(() => modal.classList.add('active'), 2500);
        }
    });
    window.addEventListener('appinstalled', () => {
        $('installPromptModal')?.classList.remove('active');
        deferredPrompt = null;
    });
    on('cancelInstallBtn', 'click', () => {
        $('installPromptModal')?.classList.remove('active');
        localStorage.setItem('pt_pwa_dismissed', 'true');
    });
    on('confirmInstallBtn', 'click', async () => {
        $('installPromptModal')?.classList.remove('active');
        if (deferredPrompt) { deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; }
    });
}
