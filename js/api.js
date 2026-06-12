/* ============================================================
   🌐 api.js — Prayer times API & Qibla calculations
   ============================================================ */

import { state } from './state.js';
import { dom, $ } from './dom.js';
import { API_BASE, KAABA_LAT, KAABA_LNG } from './constants.js';
import { updatePrayerCards, showToast } from './ui.js';

// ─── Fetch Today's Prayer Times ───
export async function fetchPrayerTimes() {
    if (!state.lat || !state.lng) return;
    try {
        const date = new Date();
        const coordinates = new adhan.Coordinates(state.lat, state.lng);
        
        let params;
        switch (parseInt(state.method)) {
            case 1: params = adhan.CalculationMethod.Karachi(); break;
            case 2: params = adhan.CalculationMethod.NorthAmerica(); break;
            case 3: params = adhan.CalculationMethod.MuslimWorldLeague(); break;
            case 4: params = adhan.CalculationMethod.UmmAlQura(); break;
            case 5: params = adhan.CalculationMethod.Egyptian(); break;
            case 7: params = adhan.CalculationMethod.Tehran(); break;
            case 8: params = adhan.CalculationMethod.Dubai(); break;
            case 9: params = adhan.CalculationMethod.Kuwait(); break;
            case 10: params = adhan.CalculationMethod.Qatar(); break;
            case 11: params = adhan.CalculationMethod.Singapore(); break;
            case 12: params = adhan.CalculationMethod.Turkey(); break;
            case 13: params = adhan.CalculationMethod.MoonsightingCommittee(); break;
            default: params = adhan.CalculationMethod.MuslimWorldLeague(); break;
        }

        // Set Fiqh (Asr Method)
        params.madhab = parseInt(state.school) === 1 ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi;

        const prayerTimes = new adhan.PrayerTimes(coordinates, date, params);
        
        // Format times to HH:mm
        const formatTime = (d) => {
            if (!d) return '--:--';
            return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        };

        state.todayTimings = {
            Fajr: formatTime(prayerTimes.fajr),
            Sunrise: formatTime(prayerTimes.sunrise),
            Dhuhr: formatTime(prayerTimes.dhuhr),
            Asr: formatTime(prayerTimes.asr),
            Sunset: formatTime(prayerTimes.maghrib), // Sunset matches Maghrib closely
            Maghrib: formatTime(prayerTimes.maghrib),
            Isha: formatTime(prayerTimes.isha),
            Imsak: formatTime(new Date(prayerTimes.fajr.getTime() - 10 * 60000)), // Usually 10 mins before Fajr
            Lastthird: formatTime(new adhan.SunnahTimes(prayerTimes).lastThirdOfTheNight)
        };

        // Calculate Hijri Date natively
        let hijriStr = "";
        let dateObj = date;
        try {
            const hijriFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
                day: 'numeric', month: 'long', year: 'numeric'
            });
            hijriStr = hijriFormatter.format(dateObj);
            
            // Try parsing month and year for state
            const parts = hijriFormatter.formatToParts(dateObj);
            const mPart = parts.find(p => p.type === 'month');
            const yPart = parts.find(p => p.type === 'year');
            
            state.hijriMonth = 1; // Default fallback
            if (mPart) {
                const mNames = ['Muharram','Safar','Rabiʻ I','Rabiʻ II','Jumada I','Jumada II','Rajab','Shaʻban','Ramadan','Shawwal','Dhuʻl-Qiʻdah','Dhuʻl-Hijjah'];
                state.hijriMonth = Math.max(1, mNames.findIndex(n => mPart.value.includes(n)) + 1);
            }
            state.hijriYear = yPart ? parseInt(yPart.value) : new Date().getFullYear() - 579;
        } catch (e) {
            console.warn('Umalqura calendar not supported, falling back to basic islamic:', e);
            try {
                const fallbackFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic', {
                    day: 'numeric', month: 'long', year: 'numeric'
                });
                hijriStr = fallbackFormatter.format(dateObj);
                state.hijriMonth = 1;
                state.hijriYear = new Date().getFullYear() - 579;
            } catch (e2) {
                hijriStr = "Hijri Date";
            }
        }
        
        // The formatter usually returns something like "Rajab 15, 1447 AH"
        dom.hijriDate.textContent = hijriStr;

        updatePrayerCards();
        document.dispatchEvent(new CustomEvent('prayerTimesLoaded'));
        document.querySelectorAll('.prayer-card').forEach(c => c.classList.add('fade-in'));
        
    } catch (err) {
        console.error('Failed to calculate prayer times:', err);
        showToast('❌ Failed to calculate prayer times');
    }
}

// ─── Qibla Direction ───
export function calculateQibla() {
    if (!state.lat || !state.lng) return;
    const lat1 = toRad(state.lat), lng1 = toRad(state.lng);
    const lat2 = toRad(KAABA_LAT), lng2 = toRad(KAABA_LNG);
    const dLng = lng2 - lng1;
    let bearing = Math.atan2(
        Math.sin(dLng),
        Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLng)
    );
    bearing = (toDeg(bearing) + 360) % 360;
    state.qiblaAngle = bearing;
    if (dom.qiblaDegrees) dom.qiblaDegrees.textContent = bearing.toFixed(1) + '°';
    if (!state.isCompassActive && dom.compassNeedle) {
        dom.compassNeedle.style.transform = `translate(-50%, -50%) rotate(${bearing}deg)`;
    }
}

function toRad(deg) { return deg * Math.PI / 180; }
function toDeg(rad) { return rad * 180 / Math.PI; }

// ─── Device Compass ───
export function initDeviceCompass() {
    // Check basic support
    if (!window.DeviceOrientationEvent) {
        showToast('❌ Compass not supported on this device'); return;
    }

    const activate = () => {
        state.isCompassActive = true;

        // ── Android: try 'deviceorientationabsolute' first (Chrome 50+, most accurate) ──
        // This gives absolute heading vs magnetic North directly — no conversion needed
        let usingAbsolute = false;
        if ('ondeviceorientationabsolute' in window) {
            window.addEventListener('deviceorientationabsolute', handleOrientation, { passive: true });
            usingAbsolute = true;
            console.log('[Compass] Using deviceorientationabsolute (Android absolute)');
        }
        // ── Fallback: standard deviceorientation (iOS + older Android) ──
        window.addEventListener('deviceorientation', handleOrientation, { passive: true });
        if (!usingAbsolute) {
            console.log('[Compass] Using deviceorientation (iOS / standard)');
        }

        // UI updates
        const btn = $('enableCompassBtn');
        if (btn) btn.style.display = 'none';
        const headingBlock = $('headingStatBlock');
        if (headingBlock) headingBlock.style.display = 'flex';
        const accBar = $('qiblaAccuracyBar');
        if (accBar) accBar.style.display = 'flex';

        const platform = /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'iOS' : 'Android';
        showToast(`🧭 Compass active (${platform}) — rotate your phone!`);
    };

    // iOS 13+ needs explicit permission request
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(p => p === 'granted' ? activate() : showToast('❌ Permission denied — enable in iOS Settings'))
            .catch(console.error);
    } else {
        activate();
    }
}

// ─── Smooth compass state ───
let _currentNeedleAngle = 0;  // current rendered needle angle
let _currentRingAngle   = 0;  // current rendered ring angle
let _targetNeedleAngle  = 0;
let _targetRingAngle    = 0;
let _rafId              = null;
let _rawHeading         = 0;  // raw device heading (degrees from North, clockwise)

// Short-path interpolation: avoids 350→10 going the long way round
function shortPath(current, target) {
    let diff = target - current;
    while (diff >  180) diff -= 360;
    while (diff < -180) diff += 360;
    return current + diff;
}

// Smooth lerp factor
const LERP = 0.12; // smaller = smoother but slower; 0.12 = good balance

function smoothCompassLoop() {
    // Lerp needle
    _currentNeedleAngle += (_targetNeedleAngle - _currentNeedleAngle) * LERP;
    _currentRingAngle   += (_targetRingAngle   - _currentRingAngle)   * LERP;

    if (dom.compassNeedle) {
        dom.compassNeedle.style.transform = `translate(-50%, -50%) rotate(${_currentNeedleAngle}deg)`;
    }
    const ring = document.querySelector('.compass-ring');
    if (ring) {
        ring.style.transform = `rotate(${_currentRingAngle}deg)`;
    }

    _rafId = requestAnimationFrame(smoothCompassLoop);
}

// Low-pass filter state (smooths noisy sensor readings on Android)
let _lpHeading = null;
const LP_ALPHA  = 0.15; // 0 = no update, 1 = raw (0.15 = smooth)

function handleOrientation(e) {
    let heading = null;

    // ── Priority 1: iOS webkitCompassHeading (most reliable on iOS) ──
    if (e.webkitCompassHeading != null && e.webkitCompassHeading >= 0) {
        heading = e.webkitCompassHeading;

    // ── Priority 2: deviceorientationabsolute (Android Chrome — alpha is absolute) ──
    } else if (e.absolute === true && e.alpha != null) {
        // For absolute events, alpha is directly the compass heading (CW from North)
        // But browser gives it CCW, so invert
        heading = (360 - e.alpha) % 360;

    // ── Priority 3: standard deviceorientation alpha (Android fallback) ──
    } else if (e.alpha != null) {
        heading = (360 - e.alpha) % 360;
    }

    if (heading === null || isNaN(heading)) return;

    // ── Low-pass filter: smooth out jittery sensor noise ──
    if (_lpHeading === null) {
        _lpHeading = heading;
    } else {
        // Handle wrap-around (e.g. 5° and 355° should blend to ~0°)
        let diff = heading - _lpHeading;
        while (diff >  180) diff -= 360;
        while (diff < -180) diff += 360;
        _lpHeading = _lpHeading + LP_ALPHA * diff;
        _lpHeading = ((_lpHeading % 360) + 360) % 360;
    }

    const smoothHeading = _lpHeading;
    _rawHeading = smoothHeading;

    // Update phone heading display
    const headingEl = $('phoneHeading');
    if (headingEl) headingEl.textContent = Math.round(smoothHeading) + '°';

    // Needle points to Qibla relative to North, minus current heading
    const needleTarget = state.qiblaAngle - smoothHeading;
    const ringTarget   = -smoothHeading;

    // Use short-path to set smooth targets
    _targetNeedleAngle = shortPath(_currentNeedleAngle, needleTarget);
    _targetRingAngle   = shortPath(_currentRingAngle,   ringTarget);

    // Update accuracy bar (how close phone is facing Qibla)
    const diff = Math.abs(((needleTarget % 360) + 360) % 360);
    const normalizedDiff = diff > 180 ? 360 - diff : diff; // 0=perfect, 180=opposite
    const accuracy = Math.max(0, 100 - (normalizedDiff / 180 * 100));
    updateAccuracyBar(accuracy, normalizedDiff);

    // Start RAF loop if not running
    if (!_rafId) {
        _currentNeedleAngle = needleTarget;
        _currentRingAngle   = ringTarget;
        _rafId = requestAnimationFrame(smoothCompassLoop);
    }
}

function updateAccuracyBar(accuracy, diffDeg) {
    const fill  = $('qiblaAccuracyFill');
    const label = $('qiblaAccuracyLabel');
    if (!fill || !label) return;

    fill.style.width = `${accuracy}%`;

    if (diffDeg < 5) {
        fill.style.background = '#4ade80';
        label.textContent = '✅ Facing Qibla!';
    } else if (diffDeg < 15) {
        fill.style.background = '#86efac';
        label.textContent = `↻ Almost! ${Math.round(diffDeg)}° off`;
    } else if (diffDeg < 45) {
        fill.style.background = '#fbbf24';
        label.textContent = `↻ Rotate ${Math.round(diffDeg)}° towards Qibla`;
    } else {
        fill.style.background = 'var(--accent)';
        label.textContent = `Point towards Qibla (${Math.round(diffDeg)}° off)`;
    }
}

// ─── Reverse Geocode — Precise locality detection ───
export async function reverseGeocode(lat, lng) {
    try {
        // zoom=14 = neighbourhood level (more precise than city-level zoom=10)
        const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=14&addressdetails=1`
        );
        const data = await res.json();
        const addr = data.address || {};

        // Build precise city name:
        // Priority: suburb > neighbourhood > quarter > town > city > county
        // This gives "Noida" or "Sector 18, Noida" instead of "Gurgaon"
        const locality =
            addr.suburb        ||
            addr.neighbourhood ||
            addr.quarter       ||
            addr.village       ||
            addr.town          ||
            addr.city          ||
            addr.county        ||
            addr.state_district||
            'Unknown';

        // If locality is a sector/area name, append parent city for clarity
        // e.g. "Sector 18" → "Sector 18, Noida"
        const parentCity = addr.city || addr.town || addr.county || '';
        const isGenericCity = locality === parentCity;
        state.city = isGenericCity
            ? locality
            : parentCity && locality !== parentCity
                ? `${locality}, ${parentCity}`
                : locality;

        state.country = addr.country || '';
        if (dom.cityName) dom.cityName.textContent =
            state.city + (state.country ? ', ' + state.country : '');

    } catch {
        // Fallback: show coordinates
        if (dom.cityName) dom.cityName.textContent =
            `${lat.toFixed(3)}°N, ${lng.toFixed(3)}°E`;
    }
}
