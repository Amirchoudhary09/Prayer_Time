/* ============================================================
   💰 zakat.js — Zakat Calculator Logic
   ============================================================ */

import { $ } from './dom.js';

export function initZakat() {
    const btn = $('profileZakatBtn');
    const modal = $('zakatModal');
    const closeBtn = $('closeZakatBtn');
    const calcBtn = $('calculateZakatBtn');

    if (btn) btn.addEventListener('click', () => {
        if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
    });
    
    if (closeBtn) closeBtn.addEventListener('click', () => {
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
    });

    if (calcBtn) calcBtn.addEventListener('click', calculateZakat);

    const inputs = ['zakatGold', 'zakatCash', 'zakatSavings', 'zakatBusiness', 'zakatDebts'];
    inputs.forEach(id => {
        const el = $(id);
        if (el) el.addEventListener('input', calculateZakat);
    });
}

function calculateZakat() {
    const gold = parseFloat($('zakatGold')?.value || 0);
    const cash = parseFloat($('zakatCash')?.value || 0);
    const savings = parseFloat($('zakatSavings')?.value || 0);
    const business = parseFloat($('zakatBusiness')?.value || 0);
    const debts = parseFloat($('zakatDebts')?.value || 0);

    const totalWealth = (gold + cash + savings + business) - debts;
    const finalWealth = Math.max(0, totalWealth);
    const zakatAmount = finalWealth * 0.025;

    if ($('zakatTotalWealth')) $('zakatTotalWealth').textContent = finalWealth.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if ($('zakatAmount')) $('zakatAmount').textContent = zakatAmount.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
