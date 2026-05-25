/* ============================================================
   ⚙️ settings.js — Load & save app settings + modals
   ============================================================ */

import { state } from './state.js';
import { dom, $ } from './dom.js';
import { fetchPrayerTimes } from './api.js';
import { showToast } from './ui.js';
import { PRAYER_NAMES } from './constants.js';

// ─── Load Settings into DOM ───
export function loadSettings() {
    if (dom.calcMethod)  dom.calcMethod.value  = state.method;
    if (dom.schoolSelect) dom.schoolSelect.value = state.school;
    if (dom.timeFormat24) dom.timeFormat24.checked = state.use24h;
    if ($('hijriAdjustment')) $('hijriAdjustment').value = state.hijriOffset.toString();
    if ($('ishraqOffset'))    $('ishraqOffset').value    = state.ishraqOffset.toString();
    if ($('makroohOffset'))   $('makroohOffset').value   = state.makroohOffset.toString();

    const notifKeys = ['Imsak','Fajr','Sunrise','Ishraq','Zawal','Dhuhr','Asr','Maghrib','Isha','Tahajjud'];
    notifKeys.forEach(k => {
        const el = $(`notify${k}`);
        if (el) el.checked = state.notifyPrefs[k.toLowerCase()] || false;
    });
    if ($('notifySound')) $('notifySound').value = state.notifySound;

    if (dom.offsetFajr)    dom.offsetFajr.value    = state.jamaatTimes.fajr    || '';
    if (dom.offsetDhuhr)   dom.offsetDhuhr.value   = state.jamaatTimes.dhuhr   || '';
    if (dom.offsetAsr)     dom.offsetAsr.value     = state.jamaatTimes.asr     || '';
    if (dom.offsetMaghrib) dom.offsetMaghrib.value = state.jamaatTimes.maghrib || '';
    if (dom.offsetIsha)    dom.offsetIsha.value    = state.jamaatTimes.isha    || '';
}

// ─── Save Settings from DOM ───
export function saveSettings() {
    if (dom.calcMethod)  state.method = parseInt(dom.calcMethod.value);
    if (dom.schoolSelect) state.school = parseInt(dom.schoolSelect.value);
    if (dom.timeFormat24) state.use24h = dom.timeFormat24.checked;

    state.notifyPrefs = {
        imsak:    !!($('notifyImsak')    && $('notifyImsak').checked),
        fajr:     !!($('notifyFajr')     && $('notifyFajr').checked),
        sunrise:  !!($('notifySunrise')  && $('notifySunrise').checked),
        ishraq:   !!($('notifyIshraq')   && $('notifyIshraq').checked),
        zawal:    !!($('notifyZawal')    && $('notifyZawal').checked),
        dhuhr:    !!($('notifyDhuhr')    && $('notifyDhuhr').checked),
        asr:      !!($('notifyAsr')      && $('notifyAsr').checked),
        maghrib:  !!($('notifyMaghrib')  && $('notifyMaghrib').checked),
        isha:     !!($('notifyIsha')     && $('notifyIsha').checked),
        tahajjud: !!($('notifyTahajjud') && $('notifyTahajjud').checked)
    };
    if ($('notifySound')) state.notifySound = $('notifySound').value;

    const anyNotify = Object.values(state.notifyPrefs).some(v => v);
    if (anyNotify && Notification.permission !== 'granted') Notification.requestPermission();

    state.jamaatTimes.fajr    = (dom.offsetFajr    && dom.offsetFajr.value)    || state.jamaatTimes.fajr    || '';
    state.jamaatTimes.dhuhr   = (dom.offsetDhuhr   && dom.offsetDhuhr.value)   || state.jamaatTimes.dhuhr   || '';
    state.jamaatTimes.asr     = (dom.offsetAsr     && dom.offsetAsr.value)     || state.jamaatTimes.asr     || '';
    state.jamaatTimes.maghrib = (dom.offsetMaghrib && dom.offsetMaghrib.value) || state.jamaatTimes.maghrib || '';
    state.jamaatTimes.isha    = (dom.offsetIsha    && dom.offsetIsha.value)    || state.jamaatTimes.isha    || '';

    localStorage.setItem('pt_method',       state.method);
    localStorage.setItem('pt_school',       state.school);
    localStorage.setItem('pt_24h',          state.use24h);
    localStorage.setItem('pt_notify_prefs', JSON.stringify(state.notifyPrefs));
    localStorage.setItem('pt_notify_sound', state.notifySound);
    localStorage.setItem('pt_jamaat_times', JSON.stringify(state.jamaatTimes));

    if ($('hijriAdjustment')) {
        state.hijriOffset = parseInt($('hijriAdjustment').value);
        localStorage.setItem('pt_hijri_adj', state.hijriOffset);
    }
    if ($('ishraqOffset')) {
        state.ishraqOffset = parseInt($('ishraqOffset').value) || 15;
        localStorage.setItem('pt_ishraq_offset', state.ishraqOffset);
    }
    if ($('makroohOffset')) {
        state.makroohOffset = parseInt($('makroohOffset').value) || 10;
        localStorage.setItem('pt_makrooh_offset', state.makroohOffset);
    }

    state.hijriCalData = null;
    closeSettingsModal();
    fetchPrayerTimes();
    showToast('✅ Settings saved!');
}

// ─── Settings Modal ───
export function openSettingsModal() {
    if (dom.settingsModal) { dom.settingsModal.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
export function closeSettingsModal() {
    if (dom.settingsModal) dom.settingsModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ─── Edit Time Modal (per prayer) ───
let currentEditingPrayer = null;

export function openEditTimeModal(prayerKey) {
    currentEditingPrayer = prayerKey;
    const info = PRAYER_NAMES[prayerKey] || { en: prayerKey };
    const isJamaat = !['imsak','sunrise','ishraq','zawal','tahajjud'].includes(prayerKey);
    const titleName = info[state.appLang] || info.en;
    if ($('editTimeTitle')) $('editTimeTitle').textContent = isJamaat ? `Set Jamaat: ${titleName}` : `Set Time: ${titleName}`;
    if ($('editTimeInput')) $('editTimeInput').value = state.jamaatTimes[prayerKey] || '';
    const modal = $('editTimeModal');
    if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
export function closeEditTimeModal() {
    const modal = $('editTimeModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
    currentEditingPrayer = null;
}
export function getCurrentEditingPrayer() { return currentEditingPrayer; }
