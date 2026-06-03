/* ============================================================
   📖 quran.js — Panch Surah (Selected Surahs)
   ============================================================ */

import { $, dom } from './dom.js';
import { QURAN_DATA } from './quran-data.js';

export function initQuran() {
    const btn = $('btnQuran');
    const modal = $('quranModal');
    const closeBtn = $('closeQuranBtn');
    
    if (btn) btn.addEventListener('click', () => {
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            renderQuranTabs();
        }
    });
    
    if (closeBtn) closeBtn.addEventListener('click', () => {
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
    });
}

function renderQuranTabs() {
    const tabsContainer = $('surahTabs');
    if (!tabsContainer || tabsContainer.innerHTML.trim() !== '') return; // already rendered

    const surahs = [
        { id: '36', name: 'Ya-Seen', arabic: 'يس' },
        { id: '56', name: 'Al-Waqi\'ah', arabic: 'الواقعة' },
        { id: '67', name: 'Al-Mulk', arabic: 'الملك' },
        { id: '18', name: 'Al-Kahf', arabic: 'الكهف' }
    ];

    let tabsHtml = '';
    surahs.forEach((s, idx) => {
        tabsHtml += `
            <button class="surah-tab-btn" data-id="${s.id}" style="padding: 10px 20px; border: none; background: ${idx===0 ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}; color: white; border-radius: 20px; cursor: pointer; white-space: nowrap; flex-shrink: 0; font-family: 'Amiri', serif; font-size: 1.2rem;">
                ${s.name} (${s.arabic})
            </button>
        `;
    });
    tabsContainer.innerHTML = tabsHtml;

    const btns = tabsContainer.querySelectorAll('.surah-tab-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            btns.forEach(b => b.style.background = 'rgba(255,255,255,0.05)');
            e.currentTarget.style.background = 'var(--primary)';
            renderSurah(e.currentTarget.dataset.id);
        });
    });

    // Default render first
    if (surahs.length > 0) renderSurah(surahs[0].id);
}

function renderSurah(surahId) {
    const content = $('surahContent');
    if (!content) return;

    const surah = QURAN_DATA[surahId];
    if (!surah) {
        content.innerHTML = '<div style="text-align:center; color:red;">Surah data not found</div>';
        return;
    }

    let html = `<div style="text-align:center; font-size: 2rem; margin-bottom: 20px; color: var(--primary-glow);">${surah.name}</div>`;
    
    // Bismillah
    if (surahId !== '9') {
        html += `<div style="text-align:center; font-size: 1.8rem; margin-bottom: 30px;">بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>`;
    }

    let ayahsHtml = '';
    surah.ayahs.forEach(ayah => {
        // Strip Bismillah from the first ayah if it's there (except Fatiha, but we don't have Fatiha here)
        let text = ayah.text;
        if (ayah.numberInSurah === 1 && text.startsWith('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ')) {
            text = text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ ', '');
        }
        
        ayahsHtml += `
            <span class="ayah-text" style="display:inline;">${text}</span>
            <span class="ayah-number" style="display:inline-flex; justify-content:center; align-items:center; width: 30px; height: 30px; background-image: url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><path d=%22M50 0 L90 25 L90 75 L50 100 L10 75 L10 25 Z%22 fill=%22none%22 stroke=%22gold%22 stroke-width=%225%22/></svg>'); background-size: cover; font-size: 0.9rem; font-family: 'Inter', sans-serif; color: var(--primary); margin: 0 10px; position: relative; top: -5px;">${ayah.numberInSurah}</span>
        `;
    });

    html += `<div style="text-align: justify; direction: rtl;">${ayahsHtml}</div>`;
    content.innerHTML = html;
}
