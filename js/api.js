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
    if (!window.DeviceOrientationEvent) {
        showToast('❌ Compass not supported on this device'); return;
    }
    const activate = () => {
        window.addEventListener('deviceorientation', handleOrientation);
        state.isCompassActive = true;
        const btn = $('enableCompassBtn');
        if (btn) btn.style.display = 'none';
        showToast('🧭 Compass active');
    };
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(p => p === 'granted' ? activate() : showToast('❌ Permission denied for compass'))
            .catch(console.error);
    } else {
        activate();
    }
}

function handleOrientation(e) {
    let alpha = e.webkitCompassHeading || (360 - (e.alpha || 0));
    if (alpha === null) return;
    const rotation = state.qiblaAngle - alpha;
    if (dom.compassNeedle) dom.compassNeedle.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    const ring = document.querySelector('.compass-ring');
    if (ring) ring.style.transform = `rotate(${-alpha}deg)`;
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
