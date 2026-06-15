/* ============================================================
   🗂️ state.js — Single source of truth for all app state
   ============================================================ */

function safeJsonParse(key, defaultJsonStr) {
    try {
        const val = localStorage.getItem(key);
        if (val) return JSON.parse(val);
    } catch (e) {
        console.warn(`[state.js] Failed to parse localStorage key "${key}":`, e);
    }
    return JSON.parse(defaultJsonStr);
}

export const state = {
    lat: null,
    lng: null,
    city: 'Unknown',
    country: '',
    method:       parseInt(localStorage.getItem('pt_method')  || '2'),
    school:       parseInt(localStorage.getItem('pt_school')  || '0'),
    use24h:       localStorage.getItem('pt_24h') === 'true',
    todayTimings: null,

    // Calendar
    calMode:      'english',
    calMonth:     new Date().getMonth(),
    calYear:      new Date().getFullYear(),
    hijriMonth:   1,
    hijriYear:    1447,
    hijriCalData: null,

    // Countdown
    countdownInterval: null,

    // Qibla
    qiblaAngle:     0,
    isCompassActive: false,

    // Notifications
    notifyPrefs: safeJsonParse(
        'pt_notify_prefs',
        '{"imsak":false,"fajr":true,"sunrise":false,"ishraq":false,"zawal":false,"dhuhr":true,"asr":true,"maghrib":true,"isha":true,"tahajjud":false}'
    ),
    notifySound:      localStorage.getItem('pt_notify_sound') || 'system',
    notifiedPrayers: {},

    // Jamaat Times
    jamaatTimes: safeJsonParse(
        'pt_jamaat_times',
        '{"imsak":"","fajr":"","sunrise":"","ishraq":"","zawal":"","dhuhr":"","asr":"","maghrib":"","isha":"","tahajjud":""}'
    ),

    // UI / Preferences
    themeMode:  localStorage.getItem('pt_theme') || 'auto',
    appLang:    localStorage.getItem('pt_lang')  || 'en',
    savedLocations: safeJsonParse('pt_locations', '[]'),
    longPressTimer:  null,
    hijriOffset:     parseInt(localStorage.getItem('pt_hijri_adj')       || '0'),
    ishraqOffset:    parseInt(localStorage.getItem('pt_ishraq_offset')   || '15'),
    makroohOffset:   parseInt(localStorage.getItem('pt_makrooh_offset')  || '10'),

    // Runtime cache (set during updatePrayerCards)
    _nextPrayer:   null,
    _parsedTimes:  null
};
