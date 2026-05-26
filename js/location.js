/* ============================================================
   📍 location.js — GPS detection, city search & history
   ============================================================ */

import { state } from './state.js';
import { dom, $ } from './dom.js';
import { fetchPrayerTimes, calculateQibla, reverseGeocode } from './api.js';
import { showToast } from './ui.js';

// ─── Main Entry: Detect Location ───
export async function detectLocation() {
    if (state.savedLocations.length > 0) {
        const loc = state.savedLocations[0];
        state.lat = loc.lat; state.lng = loc.lng;
        state.city = loc.city; state.country = loc.country;
        if (dom.cityName) dom.cityName.textContent = state.city + (state.country ? ', ' + state.country : '');
        fetchPrayerTimes();
        calculateQibla();
        _detectInBackground();
        return;
    }
    // First launch: show Makkah instantly, detect in background
    state.lat = 21.4225; state.lng = 39.8262;
    state.city = 'Makkah'; state.country = 'Saudi Arabia';
    if (dom.cityName) dom.cityName.textContent = '📍 Detecting location...';
    fetchPrayerTimes();
    calculateQibla();
    _detectInBackground();
}

async function _detectInBackground() {
    // Step 1: IP-based location (fast, no permission)
    try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 4000);
        const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(tid);
        const d = await res.json();
        if (d && d.latitude) {
            state.lat = d.latitude; state.lng = d.longitude;
            state.city = d.city || 'Unknown'; state.country = d.country_name || '';
            if (dom.cityName) dom.cityName.textContent = state.city + (state.country ? ', ' + state.country : '');
            saveCurrentLocationToHistory();
            fetchPrayerTimes(); calculateQibla();
        }
    } catch { /* IP failed */ }

    // Step 2: GPS (precise)
    if ('geolocation' in navigator) {
        try {
            const pos = await new Promise((res, rej) =>
                navigator.geolocation.getCurrentPosition(res, rej, {
                    enableHighAccuracy: false, timeout: 8000, maximumAge: 600000
                })
            );
            state.lat = pos.coords.latitude; state.lng = pos.coords.longitude;
            await reverseGeocode(state.lat, state.lng);
            saveCurrentLocationToHistory();
            fetchPrayerTimes(); calculateQibla();
            showToast('📍 Location updated!');
        } catch { /* GPS denied */ }
    }
}

// ─── Switch to any saved location instantly ───
export async function switchToLocation(loc) {
    state.lat = loc.lat; state.lng = loc.lng;
    state.city = loc.city; state.country = loc.country;
    if (dom.cityName) dom.cityName.textContent = state.city + (state.country ? ', ' + state.country : '');
    saveCurrentLocationToHistory();
    state.hijriCalData = null;
    closeLocManagerModal();
    showToast(`📍 ${state.city} set!`);
    await fetchPrayerTimes();
    calculateQibla();
}

// ─── GPS Re-detect (called from "Use My Current Location" button) ───
export async function switchToGPS() {
    const gpsBtn = $('useGPSBtn');
    if (gpsBtn) { gpsBtn.disabled = true; gpsBtn.querySelector('strong').textContent = 'Detecting...'; }
    if (dom.cityName) dom.cityName.textContent = '🛰️ Detecting GPS...';
    closeLocManagerModal();
    showToast('🛰️ Detecting your location...');

    // Try GPS first
    if ('geolocation' in navigator) {
        try {
            const pos = await new Promise((res, rej) =>
                navigator.geolocation.getCurrentPosition(res, rej, {
                    enableHighAccuracy: true, timeout: 10000, maximumAge: 0
                })
            );
            state.lat = pos.coords.latitude; state.lng = pos.coords.longitude;
            await reverseGeocode(state.lat, state.lng);
            saveCurrentLocationToHistory();
            state.hijriCalData = null;
            await fetchPrayerTimes();
            calculateQibla();
            showToast(`✅ Location set: ${state.city}`);
            if (gpsBtn) { gpsBtn.disabled = false; gpsBtn.querySelector('strong').textContent = 'Use My Current Location'; }
            return;
        } catch { /* GPS failed or denied */ }
    }

    // Fallback: IP-based
    try {
        const res = await fetch('https://ipapi.co/json/');
        const d   = await res.json();
        if (d && d.latitude) {
            state.lat = d.latitude; state.lng = d.longitude;
            state.city = d.city || 'Unknown'; state.country = d.country_name || '';
            if (dom.cityName) dom.cityName.textContent = state.city + (state.country ? ', ' + state.country : '');
            saveCurrentLocationToHistory();
            state.hijriCalData = null;
            await fetchPrayerTimes();
            calculateQibla();
            showToast(`📍 Location via IP: ${state.city}`);
        } else {
            showToast('❌ Could not detect location');
        }
    } catch {
        showToast('❌ Location detection failed');
    }

    if (gpsBtn) { gpsBtn.disabled = false; gpsBtn.querySelector('strong').textContent = 'Use My Current Location'; }
}

// ─── City Search (by name string) ───
export async function searchCity(cityName) {
    try {
        const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`);
        const data = await res.json();
        if (data.length > 0) {
            state.lat     = parseFloat(data[0].lat);
            state.lng     = parseFloat(data[0].lon);
            state.city    = data[0].display_name.split(',')[0];
            state.country = data[0].display_name.split(',').pop().trim();
            if (dom.cityName) dom.cityName.textContent = state.city + ', ' + state.country;
            saveCurrentLocationToHistory();
            state.hijriCalData = null;
            await fetchPrayerTimes();
            calculateQibla();
            showToast(`📍 Showing times for ${state.city}`);
        } else {
            showToast('❌ City not found. Try again.');
        }
    } catch {
        showToast('❌ Search failed. Check connection.');
    }
}

// ─── Location History ───
export function saveCurrentLocationToHistory() {
    if (!state.lat || !state.city) return;
    const newLoc = { lat: state.lat, lng: state.lng, city: state.city, country: state.country };
    state.savedLocations = state.savedLocations.filter(l => l.city !== newLoc.city);
    state.savedLocations.unshift(newLoc);
    if (state.savedLocations.length > 5) state.savedLocations.pop();
    localStorage.setItem('pt_locations', JSON.stringify(state.savedLocations));
    renderSavedLocations();
}

export function deleteLocation(cityName) {
    state.savedLocations = state.savedLocations.filter(l => l.city !== cityName);
    localStorage.setItem('pt_locations', JSON.stringify(state.savedLocations));
    if (state.city === cityName) {
        state.savedLocations = [];
        localStorage.setItem('pt_locations', '[]');
        detectLocation();
    } else {
        renderSavedLocations();
    }
}

export function renderSavedLocations() {
    const list = $('savedLocationsList');
    if (!list) return;
    list.innerHTML = '';

    if (state.savedLocations.length === 0) {
        list.innerHTML = '<span style="color:var(--text-muted);font-size:0.8rem;">No saved locations yet. Search a city or use GPS.</span>';
        return;
    }

    list.style.display = 'flex';
    list.style.flexDirection = 'column';
    list.style.gap = '8px';
    list.style.marginTop = '8px';

    state.savedLocations.forEach((loc) => {
        const isActive = loc.city === state.city;
        const item = document.createElement('div');
        item.className = 'saved-loc-item' + (isActive ? ' active' : '');
        item.title = `Tap to switch to ${loc.city}`;

        item.innerHTML = `
            <div class="saved-loc-info">
                <div class="saved-loc-city">${loc.city}</div>
                <div class="saved-loc-country">${loc.country}</div>
            </div>
            ${isActive ? '<span class="saved-loc-active-badge">● Active</span>' : '<span class="saved-loc-switch-hint">Tap →</span>'}
            <button class="saved-loc-delete" title="Remove" aria-label="Remove ${loc.city}">✕</button>
        `;

        // Tap whole row → switch instantly
        item.addEventListener('click', async (e) => {
            if (e.target.closest('.saved-loc-delete')) return;
            await switchToLocation(loc);
            renderSavedLocations();
        });

        item.querySelector('.saved-loc-delete').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteLocation(loc.city);
        });

        list.appendChild(item);
    });
}

// ─── Location Manager Modal ───
export function openLocManagerModal() {
    renderSavedLocations();
    const modal = $('locationManagerModal');
    if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
export function closeLocManagerModal() {
    const modal = $('locationManagerModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}
