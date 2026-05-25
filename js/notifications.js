/* ============================================================
   🔔 notifications.js — Countdown timer & prayer notifications
   ============================================================ */

import { state } from './state.js';
import { dom, $ } from './dom.js';
import { PRAYER_ORDER, PRAYER_NAMES } from './constants.js';
import { fetchPrayerTimes } from './api.js';
import { updateBackgroundTheme } from './ui.js';

// ─── Countdown Timer ───
export function startCountdown() {
    if (state.countdownInterval) clearInterval(state.countdownInterval);

    function tick() {
        if (!state._nextPrayer || !state._parsedTimes) return;
        const now    = new Date();
        let   target = state._parsedTimes[state._nextPrayer];
        if (target <= now) { target = new Date(target); target.setDate(target.getDate() + 1); }

        const diff = target - now;

        // Makrooh check
        const mw = $('makroohWarning');
        if (mw) {
            const pt = state._parsedTimes;
            let isMakrooh = false;
            if (pt.sunrise && pt.ishraq && now >= pt.sunrise && now < pt.ishraq)          isMakrooh = true;
            else if (pt.zawal && pt.dhuhr && now >= pt.zawal && now < pt.dhuhr)           isMakrooh = true;
            else if (pt.maghrib) {
                const maghribMinus = new Date(pt.maghrib);
                maghribMinus.setMinutes(maghribMinus.getMinutes() - state.makroohOffset);
                if (now >= maghribMinus && now < pt.maghrib) isMakrooh = true;
            }
            mw.style.display = isMakrooh ? 'block' : 'none';
        }

        checkNotification(now);

        if (diff <= 0) { fetchPrayerTimes(); return; }
        const ts = Math.floor(diff / 1000);
        if (dom.hoursValue)   dom.hoursValue.textContent   = String(Math.floor(ts / 3600)).padStart(2, '0');
        if (dom.minutesValue) dom.minutesValue.textContent = String(Math.floor((ts % 3600) / 60)).padStart(2, '0');
        if (dom.secondsValue) dom.secondsValue.textContent = String(ts % 60).padStart(2, '0');
    }

    tick();
    state.countdownInterval = setInterval(tick, 1000);
    setInterval(updateBackgroundTheme, 60000);
}

// ─── Notification Check ───
function checkNotification(now) {
    const ALL_NOTIF_KEYS = [...PRAYER_ORDER, 'imsak', 'ishraq', 'zawal', 'tahajjud'];
    ALL_NOTIF_KEYS.forEach(key => {
        const targetTime = state._parsedTimes?.[key];
        if (!targetTime) return;

        const diffSec  = (now - targetTime) / 1000;
        const notifKey = `${key}-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

        if (diffSec >= 0 && diffSec < 60 && !state.notifiedPrayers[notifKey]) {
            if (state.notifyPrefs[key]) {
                state.notifiedPrayers[notifKey] = true;
                const nameObj = PRAYER_NAMES[key] || { en: key };
                const isJamaat = !['imsak','sunrise','ishraq','zawal','tahajjud'].includes(key);
                const title = isJamaat && state.jamaatTimes[key]
                    ? `It's time for ${nameObj.en} Jamaat`
                    : `It's time for ${nameObj.en}`;

                if (Notification.permission === 'granted') {
                    new Notification(title, {
                        body: `Prayer time in ${state.city}.`,
                        icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="80">🕌</text></svg>'
                    });
                }
                playNotificationSound();
            }
        }
    });
}

function playNotificationSound() {
    const audioEl = $('notificationAudio');
    if (!audioEl || state.notifySound === 'system') return;
    if (state.notifySound === 'beep')  audioEl.src = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';
    if (state.notifySound === 'adhan') audioEl.src = 'https://upload.wikimedia.org/wikipedia/commons/7/74/Adhan_Egypt.ogg';
    audioEl.play().catch(() => {});
}
