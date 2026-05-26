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
        const today = new Date();
        const dd = today.getDate(), mm = today.getMonth() + 1, yyyy = today.getFullYear();
        const url = `${API_BASE}/timings/${dd}-${mm}-${yyyy}?latitude=${state.lat}&longitude=${state.lng}&method=${state.method}&school=${state.school}&adj=${state.hijriOffset}`;
        const res  = await fetch(url);
        const data = await res.json();

        if (data.code === 200) {
            state.todayTimings = data.data.timings;
            const hijri = data.data.date.hijri;
            state.hijriMonth = parseInt(hijri.month.number);
            state.hijriYear  = parseInt(hijri.year);
            dom.hijriDate.textContent = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
            updatePrayerCards();
            // Notify main to start countdown (avoid circular import with notifications.js)
            document.dispatchEvent(new CustomEvent('prayerTimesLoaded'));
            document.querySelectorAll('.prayer-card').forEach(c => c.classList.add('fade-in'));
        }
    } catch (err) {
        console.error('Failed to fetch prayer times:', err);
        showToast('❌ Failed to load prayer times');
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

// ─── Reverse Geocode ───
export async function reverseGeocode(lat, lng) {
    try {
        const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
        const data = await res.json();
        state.city    = data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown';
        state.country = data.address.country || '';
        if (dom.cityName) dom.cityName.textContent = state.city + (state.country ? ', ' + state.country : '');
    } catch {
        if (dom.cityName) dom.cityName.textContent = `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
    }
}
