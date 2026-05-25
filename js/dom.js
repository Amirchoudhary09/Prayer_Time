/* ============================================================
   🗺️ dom.js — DOM element references (initialized in main.js)
   ============================================================ */

export const $ = (id) => document.getElementById(id);

// All DOM refs — populated by initDom() in main.js after DOMContentLoaded
export const dom = {};

export function initDom() {
    dom.bgGradient         = $('bgGradient');
    dom.stars              = $('stars');
    dom.cityName           = $('cityName');
    dom.hijriDate          = $('hijriDate');
    dom.gregorianDate      = $('gregorianDate');
    dom.currentPrayerLabel = $('currentPrayerLabel');
    dom.prayerArabic       = $('prayerArabic');
    dom.prayerEnglish      = $('prayerEnglish');
    dom.hoursValue         = $('hoursValue');
    dom.minutesValue       = $('minutesValue');
    dom.secondsValue       = $('secondsValue');
    dom.prayerTimeDisplay  = $('prayerTimeDisplay');
    dom.compassNeedle      = $('compassNeedle');
    dom.qiblaDegrees       = $('qiblaDegrees');
    dom.calendarModal      = $('calendarModal');
    dom.calModalTitle      = $('calModalTitle');
    dom.calLangToggle      = $('calLangToggle');
    dom.calLangText        = $('calLangText');
    dom.calMonthName       = $('calMonthName');
    dom.calYear            = $('calYear');
    dom.calWeekdays        = $('calWeekdays');
    dom.calDays            = $('calDays');
    dom.calHint            = $('calHint');
    dom.datePrayerModal    = $('datePrayerModal');
    dom.dateModalTitle     = $('dateModalTitle');
    dom.dateModalSubtitle  = $('dateModalSubtitle');
    dom.dpHijriValue       = $('dpHijriValue');
    dom.settingsModal      = $('settingsModal');
    dom.calcMethod         = $('calcMethod');
    dom.schoolSelect       = $('schoolSelect');
    dom.manualCity         = $('manualCity');
    dom.timeFormat24       = $('timeFormat24');
    dom.enableNotifications= $('enableNotifications');
    dom.offsetFajr         = $('offsetFajr');
    dom.offsetDhuhr        = $('offsetDhuhr');
    dom.offsetAsr          = $('offsetAsr');
    dom.offsetMaghrib      = $('offsetMaghrib');
    dom.offsetIsha         = $('offsetIsha');
    dom.toast              = $('toast');
    dom.toastMessage       = $('toastMessage');
}
