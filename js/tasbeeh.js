/* ============================================================
   📿 tasbeeh.js — Digital Tasbeeh Counter
   ============================================================ */

import { showToast } from './ui.js';

const PRESETS = [
    { label: 'سُبْحَانَ اللّٰہ',  trans: 'SubhanAllah',   target: 33, color: '#4ade80' },
    { label: 'اَلْحَمْدُ لِلّٰہ', trans: 'Alhamdulillah', target: 33, color: '#60a5fa' },
    { label: 'اَللّٰہُ اَکْبَر',  trans: 'Allahu Akbar',  target: 34, color: '#f59e0b' },
    { label: 'لَا إِلٰهَ إِلَّا اللّٰہ', trans: 'La ilaha illallah', target: 100, color: '#c084fc' },
];

let count       = parseInt(localStorage.getItem('pt_tasbeeh_count') || '0');
let activePreset = parseInt(localStorage.getItem('pt_tasbeeh_preset') || '0');
let longPressTimer = null;

export function initTasbeeh() {
    const section = document.getElementById('tasbeehSection');
    if (!section) return;

    renderPresetButtons();
    updateDisplay();

    // Main counter tap
    const tapArea = document.getElementById('tasbeehTapArea');
    if (tapArea) {
        tapArea.addEventListener('click', increment);

        // Long press = reset
        tapArea.addEventListener('pointerdown', () => {
            longPressTimer = setTimeout(() => {
                resetCount();
                showToast('🔄 Tasbeeh reset');
                tapArea.classList.add('shake');
                setTimeout(() => tapArea.classList.remove('shake'), 500);
            }, 800);
        });
        tapArea.addEventListener('pointerup',    () => clearTimeout(longPressTimer));
        tapArea.addEventListener('pointerleave', () => clearTimeout(longPressTimer));
    }

    // Reset button
    const resetBtn = document.getElementById('tasbeehResetBtn');
    if (resetBtn) resetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetCount();
        showToast('🔄 Tasbeeh reset');
    });
}

function increment() {
    count++;
    localStorage.setItem('pt_tasbeeh_count', count);
    updateDisplay();

    const preset = PRESETS[activePreset];
    if (count === preset.target) {
        showToast(`✅ ${preset.trans} — ${preset.target}x complete!`);
        vibrate(200);
    } else if (count > 0 && count % preset.target === 0) {
        showToast(`✅ ${count}x ${preset.trans}!`);
        vibrate(100);
    }
}

function resetCount() {
    count = 0;
    localStorage.setItem('pt_tasbeeh_count', 0);
    updateDisplay();
}

function setPreset(index) {
    activePreset = index;
    localStorage.setItem('pt_tasbeeh_preset', index);
    // Don't reset count — let user decide
    updateDisplay();
    renderPresetButtons();
}

function updateDisplay() {
    const countEl   = document.getElementById('tasbeehCount');
    const targetEl  = document.getElementById('tasbeehTarget');
    const labelEl   = document.getElementById('tasbeehLabel');
    const transEl   = document.getElementById('tasbeehTrans');
    const ringEl    = document.getElementById('tasbeehRing');

    const preset = PRESETS[activePreset];
    const progress = Math.min((count % preset.target || (count > 0 && count % preset.target === 0 ? preset.target : 0)) / preset.target, 1);

    if (countEl)  countEl.textContent  = count;
    if (targetEl) targetEl.textContent = `/ ${preset.target}`;
    if (labelEl)  labelEl.textContent  = preset.label;
    if (transEl)  transEl.textContent  = preset.trans;

    // SVG ring progress
    if (ringEl) {
        const circumference = 2 * Math.PI * 54; // r=54
        const pct = (count % preset.target) / preset.target;
        const offset = circumference - pct * circumference;
        ringEl.style.strokeDasharray  = `${circumference}`;
        ringEl.style.strokeDashoffset = offset;
        ringEl.style.stroke = preset.color;
    }

    // Update tap area color
    const tapArea = document.getElementById('tasbeehTapArea');
    if (tapArea) tapArea.style.setProperty('--tasbeeh-color', preset.color);
}

function renderPresetButtons() {
    const container = document.getElementById('tasbeehPresets');
    if (!container) return;
    container.innerHTML = '';
    PRESETS.forEach((preset, i) => {
        const btn = document.createElement('button');
        btn.className = 'tasbeeh-preset-btn' + (i === activePreset ? ' active' : '');
        btn.innerHTML = `<span class="preset-arabic">${preset.label}</span><span class="preset-trans">${preset.trans}</span>`;
        btn.style.setProperty('--preset-color', preset.color);
        btn.addEventListener('click', () => setPreset(i));
        container.appendChild(btn);
    });
}

function vibrate(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
}
