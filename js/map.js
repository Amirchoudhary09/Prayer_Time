/* ============================================================
   🗺️ map.js — Leaflet Qibla Map Fallback
   ============================================================ */

import { $, dom } from './dom.js';
import { KAABA_LAT, KAABA_LNG } from './constants.js';
import { state } from './state.js';

let qiblaMap = null;
let qiblaLayer = null;

export function initMap() {
    const btn = $('toggleMapBtn');
    const container = $('qiblaMapContainer');

    if (btn && container) {
        btn.addEventListener('click', () => {
            if (container.style.display === 'none') {
                container.style.display = 'block';
                btn.textContent = '🗺️ Hide Map';
                if (!qiblaMap) {
                    renderMap();
                } else {
                    qiblaMap.invalidateSize();
                }
            } else {
                container.style.display = 'none';
                btn.textContent = '🗺️ Show Qibla on Map';
            }
        });
    }
}

function renderMap() {
    if (!state.lat || !state.lng) return;
    
    // Fallback if Leaflet failed to load
    if (typeof L === 'undefined') {
        const container = $('qiblaMapContainer');
        if (container) container.innerHTML = '<p style="color:red; text-align:center;">Failed to load map library (Leaflet).</p>';
        return;
    }

    const userLat = state.lat;
    const userLng = state.lng;

    // Initialize Map
    qiblaMap = L.map('qiblaMap', { zoomControl: false }).setView([userLat, userLng], 3);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© OpenStreetMap'
    }).addTo(qiblaMap);

    // Kaaba Marker
    const kaabaIcon = L.divIcon({
        html: '<div style="font-size:24px;">🕋</div>',
        className: 'kaaba-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
    L.marker([KAABA_LAT, KAABA_LNG], { icon: kaabaIcon }).addTo(qiblaMap).bindPopup('Kaaba, Makkah');

    // User Marker
    const userIcon = L.divIcon({
        html: '<div style="font-size:20px;">📍</div>',
        className: 'user-icon',
        iconSize: [20, 20],
        iconAnchor: [10, 20]
    });
    L.marker([userLat, userLng], { icon: userIcon }).addTo(qiblaMap).bindPopup('You are here');

    // Draw Line (Geodesic / great circle isn't built into basic Leaflet, but a polyline works visually at zoom)
    const latlngs = [
        [userLat, userLng],
        [KAABA_LAT, KAABA_LNG]
    ];
    
    qiblaLayer = L.polyline(latlngs, { color: 'red', weight: 3, dashArray: '5, 10' }).addTo(qiblaMap);

    // Fit bounds to show both
    qiblaMap.fitBounds(qiblaLayer.getBounds(), { padding: [30, 30] });
}
