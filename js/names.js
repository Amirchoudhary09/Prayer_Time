/* ============================================================
   📿 names.js — Asma-ul-Husna (99 Names of Allah)
   ============================================================ */

import { $ } from './dom.js';
import { NAMES_DATA } from './names-data.js';

export function initNames() {
    const btn = $('btn99Names');
    const modal = $('namesModal');
    const closeBtn = $('closeNamesBtn');
    
    if (btn) btn.addEventListener('click', () => {
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            renderNames();
        }
    });
    
    if (closeBtn) closeBtn.addEventListener('click', () => {
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
    });
}

function renderNames() {
    const grid = $('namesGrid');
    if (!grid || grid.innerHTML.trim() !== '') return; // Already rendered

    let html = '';
    NAMES_DATA.forEach(item => {
        html += `
            <div class="name-card" style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; justify-content: center;">
                <div style="font-family: 'Amiri', serif; font-size: 2rem; color: var(--primary-glow); margin-bottom: 5px;">${item.name}</div>
                <div style="font-weight: 600; margin-bottom: 2px;">${item.transliteration}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">${item.en.meaning}</div>
                <div style="font-size: 0.7rem; color: rgba(255,255,255,0.2); margin-top: 8px;">#${item.number}</div>
            </div>
        `;
    });
    grid.innerHTML = html;
}
