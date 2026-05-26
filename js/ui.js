/* ============================================================
   🎨 ui.js — All DOM rendering & visual updates
   ============================================================ */

import { state } from './state.js';
import { dom, $ } from './dom.js';
import {
    TRANSLATIONS, PRAYER_NAMES, PRAYER_ORDER,
    DAILY_DUAS, MONTH_NAMES_EN
} from './constants.js';

// ─── Toast Notification ───
export function showToast(message) {
    dom.toastMessage.textContent = message;
    dom.toast.classList.add('show');
    setTimeout(() => dom.toast.classList.remove('show'), 3000);
}

// ─── Full Language Switch ───
export function applyLanguage() {
    const lang = state.appLang;
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

    // RTL support
    const rtlLangs = ['ar', 'ur'];
    document.documentElement.dir = rtlLangs.includes(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;

    // data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) el.textContent = dict[key];
    });

    // Prayer card names (all 8 languages)
    PRAYER_ORDER.forEach(key => {
        const card = document.getElementById(`card-${key}`);
        if (card) {
            const nameEl = card.querySelector('.prayer-card-name');
            if (nameEl) { const n = PRAYER_NAMES[key]; nameEl.textContent = n[lang] || n.en; }
        }
    });

    // Secondary time labels
    const secLabels = {
        imsak:    { en:'Imsak (Sehri)', ar:'الإمساك (السحور)', ur:'اِمساک (سحری)', hi:'इमसाक (सहरी)', fr:'Imsak (Sahur)',    bn:'ইমসাক (সেহেরি)', id:'Imsak (Sahur)',  tr:'İmsak (Sahur)' },
        ishraq:   { en:'Ishraq',        ar:'الإشراق',           ur:'اِشراق',         hi:'इशराक़',       fr:'Ishraq',           bn:'ইশরাক',          id:'Isyraq',         tr:'İşrâk'         },
        zawal:    { en:'Zawaal',         ar:'الزوال',            ur:'زوال',            hi:'ज़वाल',         fr:'Zaoual',           bn:'যোহরের পূর্ব',  id:'Zawaal',         tr:'Zevalî'        },
        tahajjud: { en:'Tahajjud',       ar:'التهجد',            ur:'تہجد',            hi:'तहज्जुद',       fr:'Tahajjud',         bn:'তাহাজ্জুদ',     id:'Tahajjud',       tr:'Teheccüd'      }
    };
    Object.entries(secLabels).forEach(([key, labels]) => {
        const el = document.querySelector(`[data-sec="${key}"] .sec-time-label`);
        if (el) el.textContent = labels[lang] || labels.en;
    });

    // Section title
    const todayTitle = { en:"Today's Prayer Times", ar:"أوقات صلاة اليوم", ur:"آج کی نمازوں کے اوقات", hi:"आज के नमाज़ के वक़्त", fr:"Heures d'Aujourd'hui", bn:"আজকের নামাজের সময়", id:"Waktu Shalat Hari Ini", tr:"Bugünün Namaz Vakitleri" };
    const sectionTitle = document.querySelector('.prayer-times-section .section-title span:first-child');
    if (sectionTitle) sectionTitle.textContent = todayTitle[lang] || todayTitle.en;

    // Qibla label
    const qiblaLabel = document.querySelector('.qibla-label');
    const qiblaFrom = { en:'from North', ar:'من الشمال', ur:'شمال سے', hi:'उत्तर से', fr:'du Nord', bn:'উত্তর থেকে', id:'dari Utara', tr:'Kuzeyden' };
    if (qiblaLabel) qiblaLabel.textContent = qiblaFrom[lang] || qiblaFrom.en;

    // Settings heading
    const settingsH2 = document.querySelector('#settingsModal .modal-header h2');
    const settingsTitles = { en:'Settings', ar:'الإعدادات', ur:'ترتیبات', hi:'सेटिंग्स', fr:'Paramètres', bn:'সেটিংস', id:'Pengaturan', tr:'Ayarlar' };
    if (settingsH2) settingsH2.textContent = settingsTitles[lang] || settingsTitles.en;

    // Jamaat badge label
    const jamaatLabel = document.querySelector('.jamaat-label');
    const jamaatWord = { en:'Jamaat:', ar:'جماعة:', ur:'جماعت:', hi:'जमात:', fr:'Jamaat:', bn:'জামাত:', id:'Jamaah:', tr:'Cemaat:' };
    if (jamaatLabel) jamaatLabel.textContent = jamaatWord[lang] || jamaatWord.en;

    if (state.todayTimings) updatePrayerCards();
}

// ─── Gregorian Date ───
export function updateGregorianDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dom.gregorianDate.textContent = new Date().toLocaleDateString('en-US', options);
}

// ─── Daily Dua ───
export function setDailyDua() {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000);
    const dua = DAILY_DUAS[dayOfYear % DAILY_DUAS.length];
    if ($('dailyDuaAr'))  $('dailyDuaAr').textContent  = dua.ar;
    if ($('dailyDuaEn'))  $('dailyDuaEn').textContent  = dua.en;
    if ($('dailyDuaRef')) $('dailyDuaRef').textContent = dua.ref || '';
}

// ─── Stars Background ───
export function createStars() {
    const container = dom.stars;
    if (!container) return;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 80; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top  = Math.random() * 60 + '%';
        star.style.setProperty('--duration',    (2 + Math.random() * 4) + 's');
        star.style.setProperty('--max-opacity', (0.3 + Math.random() * 0.7).toFixed(2));
        star.style.animationDelay = (Math.random() * 5) + 's';
        const size = (1 + Math.random() * 2) + 'px';
        star.style.width  = size;
        star.style.height = size;
        fragment.appendChild(star);
    }
    container.appendChild(fragment);
}

// ─── Background Theme ───
export function updateBackgroundTheme() {
    const bg = dom.bgGradient;
    if (!bg) return;
    bg.classList.remove('fajr', 'day', 'maghrib', 'night', 'force-light', 'force-dark');

    if (state.themeMode === 'light') {
        bg.classList.add('force-light');
        if (dom.stars) dom.stars.style.opacity = '0.15';
        return;
    }
    if (state.themeMode === 'dark') {
        bg.classList.add('force-dark');
        if (dom.stars) dom.stars.style.opacity = '1';
        return;
    }

    const hour = new Date().getHours();
    if      (hour >= 4 && hour < 6)  bg.classList.add('fajr');
    else if (hour >= 6 && hour < 17) bg.classList.add('day');
    else if (hour >= 17 && hour < 19) bg.classList.add('maghrib');
    else                              bg.classList.add('night');

    if (dom.stars) dom.stars.style.opacity = (hour >= 6 && hour < 18) ? '0.15' : '1';
}

export function toggleTheme() {
    if      (state.themeMode === 'auto')  state.themeMode = 'light';
    else if (state.themeMode === 'light') state.themeMode = 'dark';
    else                                  state.themeMode = 'auto';

    localStorage.setItem('pt_theme', state.themeMode);
    updateBackgroundTheme();

    const msgs = { auto: 'Auto', light: 'Light', dark: 'Dark' };
    showToast(`🌗 Theme: ${msgs[state.themeMode]}`);
}

// ─── Time Format Helper ───
export function formatTime(timeStr) {
    if (!timeStr || timeStr === '--:--') return '--:--';
    const [h, m] = timeStr.split(':').map(Number);
    if (state.use24h) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const period = h >= 12 ? 'PM' : 'AM';
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${period}`;
}

// ─── Update Prayer Cards ───
export function updatePrayerCards() {
    if (!state.todayTimings) return;
    const now = new Date();
    let nextPrayer = null, currentPrayer = null;
    const lang = state.appLang;

    const timingsMap = {
        fajr: state.todayTimings.Fajr, sunrise: state.todayTimings.Sunrise,
        dhuhr: state.todayTimings.Dhuhr, asr: state.todayTimings.Asr,
        maghrib: state.todayTimings.Maghrib, isha: state.todayTimings.Isha
    };

    const parsedTimes = {};
    PRAYER_ORDER.forEach(key => {
        let baseTimeStr = timingsMap[key].split(' ')[0];
        let [h, m] = baseTimeStr.split(':').map(Number);
        if (state.jamaatTimes[key]) [h, m] = state.jamaatTimes[key].split(':').map(Number);
        const d = new Date(now); d.setHours(h, m, 0, 0);
        parsedTimes[key] = d;
    });

    for (let i = PRAYER_ORDER.length - 1; i >= 0; i--) {
        if (now >= parsedTimes[PRAYER_ORDER[i]]) {
            currentPrayer = PRAYER_ORDER[i];
            nextPrayer = i < PRAYER_ORDER.length - 1 ? PRAYER_ORDER[i + 1] : null;
            break;
        }
    }
    if (!currentPrayer) nextPrayer = 'fajr';
    if (currentPrayer === 'isha') nextPrayer = 'fajr';

    const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;

    PRAYER_ORDER.forEach(key => {
        const card     = document.getElementById(`card-${key}`);
        const timeEl   = document.getElementById(`time-${key}`);
        const statusEl = document.getElementById(`status-${key}`);
        if (!card || !timeEl || !statusEl) return;

        const isPassed  = currentPrayer && PRAYER_ORDER.indexOf(key) < PRAYER_ORDER.indexOf(currentPrayer);
        const isCurrent = key === currentPrayer && key !== 'sunrise';
        const isNext    = key === nextPrayer;

        let displayTime = timingsMap[key].split(' ')[0];
        if (state.jamaatTimes[key]) displayTime = state.jamaatTimes[key];
        timeEl.textContent = formatTime(displayTime);

        card.classList.remove('active', 'next', 'passed');
        let statusText = '';
        if (key === 'sunrise') {
            // Sunrise is NOT a prayer — no status badge
            statusEl.textContent = '';
        } else if (isPassed)       { card.classList.add('passed');  statusText = dict.passed  || 'PASSED';  }
          else if (isCurrent){ card.classList.add('active');  statusText = dict.current || 'CURRENT'; }
          else if (isNext)   { card.classList.add('next');    statusText = dict.next    || 'NEXT';    }
        if (key !== 'sunrise') statusEl.textContent = statusText;
    });

    // Hero card
    const badge     = $('jamaatTimeBadge');
    const jamaatVal = $('jamaatTimeValue');

    if (nextPrayer) {
        const info = PRAYER_NAMES[nextPrayer];
        dom.prayerArabic.textContent  = info.ar;
        dom.prayerEnglish.textContent = info[lang] || info.en;
        dom.currentPrayerLabel.textContent = dict.nextPrayer || 'Next Prayer';

        let displayTime = timingsMap[nextPrayer] ? timingsMap[nextPrayer].split(' ')[0] : '';
        let rawNextTime = displayTime;
        if (badge) badge.style.display = 'flex';
        if (state.jamaatTimes[nextPrayer]) {
            displayTime = state.jamaatTimes[nextPrayer];
            if (jamaatVal) jamaatVal.textContent = formatTime(displayTime);
            dom.prayerTimeDisplay.textContent = formatTime(rawNextTime);
        } else {
            if (jamaatVal) jamaatVal.textContent = 'Not Set';
            dom.prayerTimeDisplay.textContent = formatTime(displayTime);
        }
    } else {
        dom.prayerArabic.textContent  = PRAYER_NAMES.fajr.ar;
        dom.prayerEnglish.textContent = PRAYER_NAMES.fajr[lang] || PRAYER_NAMES.fajr.en;
        dom.currentPrayerLabel.textContent = dict.nextPrayer || 'Next Prayer';
        if (badge) badge.style.display = 'none';
    }

    // Secondary times
    const imsakTime    = state.jamaatTimes.imsak    || (state.todayTimings.Imsak || state.todayTimings.Fajr).split(' ')[0];
    const tahajjudTime = state.jamaatTimes.tahajjud || (state.todayTimings.Lastthird || '02:00').split(' ')[0];
    if ($('time-imsak'))    $('time-imsak').textContent    = formatTime(imsakTime);
    if ($('time-tahajjud')) $('time-tahajjud').textContent = formatTime(tahajjudTime);

    // Ishraq = Sunrise + offset
    let [sh, sm] = state.todayTimings.Sunrise.split(' ')[0].split(':').map(Number);
    let ishraqDate = new Date(); ishraqDate.setHours(sh, sm + state.ishraqOffset, 0, 0);
    let ishraqTime = state.jamaatTimes.ishraq;
    if (!ishraqTime) {
        ishraqTime = `${String(ishraqDate.getHours()).padStart(2,'0')}:${String(ishraqDate.getMinutes()).padStart(2,'0')}`;
    } else {
        let [h, m] = ishraqTime.split(':').map(Number); ishraqDate.setHours(h, m, 0, 0);
    }
    if ($('time-ishraq')) $('time-ishraq').textContent = formatTime(ishraqTime);
    parsedTimes.ishraq = ishraqDate;

    // Zawaal = Dhuhr - offset
    let [dh, dm] = state.todayTimings.Dhuhr.split(' ')[0].split(':').map(Number);
    let zawalDate = new Date(); zawalDate.setHours(dh, dm - state.makroohOffset, 0, 0);
    let zawalTime = state.jamaatTimes.zawal;
    if (!zawalTime) {
        zawalTime = `${String(zawalDate.getHours()).padStart(2,'0')}:${String(zawalDate.getMinutes()).padStart(2,'0')}`;
    } else {
        let [h, m] = zawalTime.split(':').map(Number); zawalDate.setHours(h, m, 0, 0);
    }
    if ($('time-zawal')) $('time-zawal').textContent = formatTime(zawalTime);
    parsedTimes.zawal = zawalDate;

    // Imsak & Tahajjud parsed times for notifications
    const imsakDefault    = state.todayTimings.Imsak || state.todayTimings.Fajr;
    const tahajjudDefault = state.todayTimings.Lastthird || '02:00';
    [['imsak', state.jamaatTimes.imsak || imsakDefault], ['tahajjud', state.jamaatTimes.tahajjud || tahajjudDefault]].forEach(([k, t]) => {
        const d = new Date(); const [h, m] = t.split(' ')[0].split(':').map(Number); d.setHours(h, m, 0, 0);
        parsedTimes[k] = d;
    });

    state._nextPrayer  = nextPrayer;
    state._parsedTimes = parsedTimes;
}
