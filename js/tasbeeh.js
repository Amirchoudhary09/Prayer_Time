/* ============================================================
   📿 tasbeeh.js — Digital Tasbeeh Counter (Presets + Custom)
   ============================================================ */

import { showToast } from './ui.js';

const PRESETS = [
    { id: 'subhan',   label: 'سُبْحَانَ اللّٰہ',          trans: 'SubhanAllah',         target: 33,  color: '#4ade80' },
    { id: 'hamd',     label: 'اَلْحَمْدُ لِلّٰہ',         trans: 'Alhamdulillah',        target: 33,  color: '#60a5fa' },
    { id: 'akbar',    label: 'اَللّٰہُ اَکْبَر',           trans: 'Allahu Akbar',         target: 34,  color: '#f59e0b' },
    { id: 'kalima',   label: 'لَا إِلٰهَ إِلَّا اللّٰہ',  trans: 'La ilaha illallah',   target: 100, color: '#c084fc' },
    { id: 'astaghfar',label: 'أَسْتَغْفِرُ اللَّهَ',       trans: 'Astaghfirullah',       target: 100, color: '#fb923c' },
    { id: 'salawat',  label: 'صَلَّى اللهُ عَلَيْهِ وَسَلَّمَ', trans: 'Durood Sharif',  target: 100, color: '#e879f9' },
];

// ─── State ───
let count        = parseInt(localStorage.getItem('pt_tasbeeh_count')   || '0');
let activeMode   = localStorage.getItem('pt_tasbeeh_mode')              || 'preset';   // 'preset' | 'custom'
let activePreset = parseInt(localStorage.getItem('pt_tasbeeh_preset')  || '0');
let customLabel  = localStorage.getItem('pt_tasbeeh_custom_label')      || '';
let customTarget = parseInt(localStorage.getItem('pt_tasbeeh_custom_target') || '33');

let longPressTimer = null;

// ─── Init ───
export function initTasbeeh() {
    const section = document.getElementById('tasbeehSection');
    if (!section) return;

    renderModeTabs();
    renderPresetButtons();
    renderCustomPanel();
    updateDisplay();

    // Main counter tap
    const tapArea = document.getElementById('tasbeehTapArea');
    if (tapArea) {
        tapArea.addEventListener('click', increment);

        // Long press → reset
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
    if (resetBtn) resetBtn.addEventListener('click', e => {
        e.stopPropagation();
        resetCount();
        showToast('🔄 Tasbeeh reset');
    });
}

// ─── Mode Tabs ───
function renderModeTabs() {
    const tabsEl = document.getElementById('tasbeehModeTabs');
    if (!tabsEl) return;
    tabsEl.innerHTML = `
        <button class="tasbeeh-mode-tab ${activeMode === 'preset' ? 'active' : ''}" data-mode="preset">
            📿 Presets
        </button>
        <button class="tasbeeh-mode-tab ${activeMode === 'custom' ? 'active' : ''}" data-mode="custom">
            ✏️ Custom
        </button>
    `;
    tabsEl.querySelectorAll('.tasbeeh-mode-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            activeMode = btn.dataset.mode;
            localStorage.setItem('pt_tasbeeh_mode', activeMode);
            renderModeTabs();
            renderPresetButtons();
            renderCustomPanel();
            updateDisplay();
        });
    });
}

// ─── Preset Buttons ───
function renderPresetButtons() {
    const container = document.getElementById('tasbeehPresets');
    if (!container) return;
    container.style.display = activeMode === 'preset' ? 'grid' : 'none';
    if (activeMode !== 'preset') return;

    container.innerHTML = '';
    PRESETS.forEach((preset, i) => {
        const btn = document.createElement('button');
        btn.className = 'tasbeeh-preset-btn' + (i === activePreset ? ' active' : '');
        btn.innerHTML = `<span class="preset-arabic">${preset.label}</span><span class="preset-trans">${preset.trans} (${preset.target}×)</span>`;
        btn.style.setProperty('--preset-color', preset.color);
        btn.addEventListener('click', () => {
            activePreset = i;
            localStorage.setItem('pt_tasbeeh_preset', i);
            count = 0;
            localStorage.setItem('pt_tasbeeh_count', 0);
            renderPresetButtons();
            updateDisplay();
            showToast(`📿 ${preset.trans} — ${preset.target}×`);
        });
        container.appendChild(btn);
    });
}

// ─── Custom Panel ───
function renderCustomPanel() {
    const panel = document.getElementById('tasbeehCustomPanel');
    if (!panel) return;
    panel.style.display = activeMode === 'custom' ? 'flex' : 'none';
    if (activeMode !== 'custom') return;

    panel.innerHTML = `
        <div class="custom-field">
            <label class="custom-label-text">Dhikr / Dua Name</label>
            <input type="text" id="customDhikrInput" class="custom-input"
                placeholder="e.g. Durood Ibrahim, Ayatul Kursi..."
                value="${customLabel}" maxlength="60">
        </div>
        <div class="custom-field">
            <label class="custom-label-text">Target Count (kitni baar)</label>
            <div class="custom-target-row">
                <button class="custom-target-btn" id="customTargetMinus">−</button>
                <input type="number" id="customTargetInput" class="custom-input custom-target-input"
                    value="${customTarget}" min="1" max="9999">
                <button class="custom-target-btn" id="customTargetPlus">+</button>
            </div>
            <div class="custom-quick-targets">
                ${[11,33,41,99,100,313,1000].map(n =>
                    `<button class="custom-quick-btn ${customTarget === n ? 'active' : ''}" data-n="${n}">${n}×</button>`
                ).join('')}
            </div>
        </div>
        <button class="setting-btn custom-start-btn" id="customStartBtn">▶ Start Counting</button>
    `;

    // Listeners
    const dhikrInput  = document.getElementById('customDhikrInput');
    const targetInput = document.getElementById('customTargetInput');

    dhikrInput?.addEventListener('input', () => {
        customLabel = dhikrInput.value;
        localStorage.setItem('pt_tasbeeh_custom_label', customLabel);
    });

    targetInput?.addEventListener('input', () => {
        const v = parseInt(targetInput.value) || 33;
        customTarget = Math.max(1, Math.min(9999, v));
        localStorage.setItem('pt_tasbeeh_custom_target', customTarget);
        updateQuickTargetHighlight();
    });

    document.getElementById('customTargetMinus')?.addEventListener('click', () => {
        customTarget = Math.max(1, customTarget - 1);
        targetInput.value = customTarget;
        localStorage.setItem('pt_tasbeeh_custom_target', customTarget);
        updateQuickTargetHighlight();
    });

    document.getElementById('customTargetPlus')?.addEventListener('click', () => {
        customTarget = Math.min(9999, customTarget + 1);
        targetInput.value = customTarget;
        localStorage.setItem('pt_tasbeeh_custom_target', customTarget);
        updateQuickTargetHighlight();
    });

    panel.querySelectorAll('.custom-quick-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            customTarget = parseInt(btn.dataset.n);
            if (targetInput) targetInput.value = customTarget;
            localStorage.setItem('pt_tasbeeh_custom_target', customTarget);
            updateQuickTargetHighlight();
        });
    });

    document.getElementById('customStartBtn')?.addEventListener('click', () => {
        customLabel  = dhikrInput?.value?.trim() || 'Custom Dhikr';
        customTarget = parseInt(targetInput?.value) || 33;
        localStorage.setItem('pt_tasbeeh_custom_label',  customLabel);
        localStorage.setItem('pt_tasbeeh_custom_target', customTarget);
        count = 0;
        localStorage.setItem('pt_tasbeeh_count', 0);
        updateDisplay();
        showToast(`📿 ${customLabel} — ${customTarget}× — Start!`);
    });
}

function updateQuickTargetHighlight() {
    document.querySelectorAll('.custom-quick-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.n) === customTarget);
    });
    updateDisplay();
}

// ─── Increment ───
function increment() {
    count++;
    localStorage.setItem('pt_tasbeeh_count', count);
    updateDisplay();

    const target = getActiveTarget();
    if (count === target) {
        const label = getActiveLabel();
        showToast(`✅ ${label} — ${target}× complete! Alhamdulillah!`);
        vibrate(200);
    } else if (count > target && count % target === 0) {
        showToast(`✅ ${count}× ${getActiveLabel()}!`);
        vibrate(100);
    }
}

function resetCount() {
    count = 0;
    localStorage.setItem('pt_tasbeeh_count', 0);
    updateDisplay();
}

// ─── Helpers ───
function getActiveTarget() {
    if (activeMode === 'custom') return customTarget;
    return PRESETS[activePreset]?.target || 33;
}

function getActiveLabel() {
    if (activeMode === 'custom') return customLabel || 'Custom Dhikr';
    return PRESETS[activePreset]?.trans || 'SubhanAllah';
}

function getActiveColor() {
    if (activeMode === 'custom') return '#38bdf8';
    return PRESETS[activePreset]?.color || '#4ade80';
}

function getActiveArabic() {
    if (activeMode === 'custom') return customLabel || '— Custom —';
    return PRESETS[activePreset]?.label || '';
}

// ─── Update Display ───
function updateDisplay() {
    const countEl  = document.getElementById('tasbeehCount');
    const targetEl = document.getElementById('tasbeehTarget');
    const labelEl  = document.getElementById('tasbeehLabel');
    const transEl  = document.getElementById('tasbeehTrans');
    const ringEl   = document.getElementById('tasbeehRing');
    const tapArea  = document.getElementById('tasbeehTapArea');

    const target  = getActiveTarget();
    const color   = getActiveColor();
    const arabic  = getActiveArabic();
    const trans   = getActiveLabel();
    const cycle   = count % target;
    const cycleCount = Math.floor(count / target);  // how many full rounds

    if (countEl)  countEl.textContent  = count;
    if (targetEl) targetEl.textContent = `/ ${target}`;
    if (labelEl)  labelEl.textContent  = arabic;
    if (transEl)  transEl.textContent  = cycleCount > 0
        ? `${trans}  •  🔁 Round ${cycleCount + (cycle > 0 ? 1 : 0)}`
        : trans;

    // SVG progress ring
    if (ringEl) {
        const circumference = 2 * Math.PI * 54;
        const pct    = target > 0 ? (cycle / target) : 0;
        const offset = circumference - pct * circumference;
        ringEl.style.strokeDasharray  = `${circumference}`;
        ringEl.style.strokeDashoffset = cycle === 0 && count > 0 ? '0' : offset;
        ringEl.style.stroke = color;
    }

    // Tap area color
    if (tapArea) tapArea.style.setProperty('--tasbeeh-color', color);
}

function vibrate(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
}
