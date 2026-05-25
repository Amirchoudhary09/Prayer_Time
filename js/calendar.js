/* ============================================================
   📅 calendar.js — Prayer Calendar (Gregorian + Hijri)
   ============================================================ */

import { state } from './state.js';
import { dom, $ } from './dom.js';
import { API_BASE, MONTH_NAMES_EN, WEEKDAYS_EN, WEEKDAYS_UR, HIJRI_MONTHS_UR, PRAYER_ORDER, toUrduNumber } from './constants.js';
import { formatTime } from './ui.js';

// ─── Open / Close ───
export function openCalendarModal() {
    renderCalendar();
    if (dom.calendarModal) { dom.calendarModal.classList.add('active'); document.body.style.overflow = 'hidden'; }
}
export function closeCalendarModal() {
    if (dom.calendarModal) dom.calendarModal.classList.remove('active');
    document.body.style.overflow = '';
}

// ─── Language Toggle ───
export function toggleCalendarLang() {
    if (state.calMode === 'english') {
        state.calMode = 'urdu';
        if (dom.calLangText)  dom.calLangText.textContent = 'English';
        if (dom.calLangToggle) dom.calLangToggle.classList.add('urdu-active');
        if (dom.calModalTitle) dom.calModalTitle.textContent = '📅 نماز کیلنڈر';
        document.querySelector('.calendar-modal')?.classList.add('urdu-mode');
    } else {
        state.calMode = 'english';
        if (dom.calLangText)  dom.calLangText.textContent = 'اردو';
        if (dom.calLangToggle) dom.calLangToggle.classList.remove('urdu-active');
        if (dom.calModalTitle) dom.calModalTitle.textContent = '📅 Prayer Calendar';
        document.querySelector('.calendar-modal')?.classList.remove('urdu-mode');
    }
    renderCalendar();
}

// ─── Render (dispatch) ───
export async function renderCalendar() {
    if (state.calMode === 'english') await renderGregorianCalendar();
    else                             await renderHijriCalendar();
}

// ─── Gregorian Calendar ───
async function renderGregorianCalendar() {
    const month = state.calMonth;
    const year  = state.calYear;
    if (dom.calMonthName) dom.calMonthName.textContent = MONTH_NAMES_EN[month];
    if (dom.calYear)      dom.calYear.textContent      = year;
    if (dom.calWeekdays)  dom.calWeekdays.innerHTML    = WEEKDAYS_EN.map(d => `<span>${d}</span>`).join('');
    if (dom.calHint)      dom.calHint.textContent      = '👆 Tap any date to see prayer times';

    const container = dom.calDays;
    if (!container) return;
    container.innerHTML = '<div class="cal-loading" style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">Loading...</div>';

    let monthData = null;
    try {
        const url = `${API_BASE}/calendarByCity/${year}/${month + 1}?city=${state.city}&country=${state.country}&method=${state.method}&school=${state.school}&adj=${state.hijriOffset}`;
        const res  = await fetch(url);
        const data = await res.json();
        if (data.code === 200) monthData = data.data;
    } catch (e) { console.error('Calendar fetch failed:', e); }

    const firstDay     = new Date(year, month, 1).getDay();
    const daysInMonth  = new Date(year, month + 1, 0).getDate();
    const daysInPrev   = new Date(year, month, 0).getDate();
    const today        = new Date();
    const [tD, tM, tY] = [today.getDate(), today.getMonth(), today.getFullYear()];

    container.innerHTML = '';
    // Prev month trailing
    for (let i = firstDay - 1; i >= 0; i--) {
        const pm = month === 0 ? 11 : month - 1;
        const py = month === 0 ? year - 1 : year;
        container.appendChild(createDayCell(daysInPrev - i, true, false, false, `${daysInPrev - i}-${pm + 1}-${py}`));
    }
    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
        const isToday = (d === tD && month === tM && year === tY);
        const dow = new Date(year, month, d).getDay();
        const holidays = monthData?.[d - 1]?.date?.hijri?.holidays || [];
        container.appendChild(createDayCell(d, false, isToday, dow === 5, `${d}-${month + 1}-${year}`, holidays));
    }
    // Fill remaining
    const totalCells = firstDay + daysInMonth;
    const fill = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let d = 1; d <= fill; d++) {
        const nm = month === 11 ? 0  : month + 1;
        const ny = month === 11 ? year + 1 : year;
        container.appendChild(createDayCell(d, true, false, false, `${d}-${nm + 1}-${ny}`));
    }
}

function createDayCell(dayNum, isOtherMonth, isToday, isFriday, dateStr, holidays = []) {
    const cell = document.createElement('div');
    cell.className = 'cal-day';
    cell.textContent = dayNum;
    if (isOtherMonth)              cell.classList.add('other-month');
    if (isToday)                   cell.classList.add('today');
    if (isFriday && !isOtherMonth) cell.classList.add('friday');
    if (holidays.length > 0) {
        const hSpan = document.createElement('div');
        hSpan.className = 'cal-holiday';
        hSpan.textContent = holidays.join(', ');
        cell.appendChild(hSpan);
        cell.style.position = 'relative';
    }
    cell.addEventListener('click', () => {
        document.querySelectorAll('.cal-day.selected').forEach(el => el.classList.remove('selected'));
        cell.classList.add('selected');
        openDatePrayerModal(dateStr);
    });
    return cell;
}

// ─── Hijri Calendar ───
async function renderHijriCalendar() {
    const { hijriMonth: hMonth, hijriYear: hYear } = state;
    if (dom.calMonthName) dom.calMonthName.textContent = HIJRI_MONTHS_UR[hMonth - 1];
    if (dom.calYear)      dom.calYear.textContent      = toUrduNumber(hYear);
    if (dom.calWeekdays)  dom.calWeekdays.innerHTML    = WEEKDAYS_UR.map(d => `<span>${d}</span>`).join('');
    if (dom.calHint)      dom.calHint.textContent      = '👆 تاریخ پر کلک کریں نماز کے اوقات دیکھنے کے لیے';

    const container = dom.calDays;
    if (!container) return;
    container.innerHTML = '<div class="cal-loading" style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">Loading...</div>';

    try {
        const url  = `${API_BASE}/hijriCalendarByCity/${hYear}/${hMonth}?city=${state.city}&country=${state.country}&method=${state.method}&school=${state.school}&adj=${state.hijriOffset}`;
        const res  = await fetch(url);
        const data = await res.json();
        if (data.code !== 200) throw new Error('API error');
        const days = data.data;
        state.hijriCalData = days;
        container.innerHTML = '';

        const firstGreg = days[0].date.gregorian;
        const firstGregDate = new Date(parseInt(firstGreg.year), parseInt(firstGreg.month.number) - 1, parseInt(firstGreg.day));
        const firstDow = firstGregDate.getDay();
        for (let i = 0; i < firstDow; i++) {
            const empty = document.createElement('div');
            empty.className = 'cal-day other-month';
            empty.style.cursor = 'default';
            container.appendChild(empty);
        }

        const todayStr = (() => { const t = new Date(); return `${t.getDate()}-${t.getMonth()+1}-${t.getFullYear()}`; })();

        days.forEach((dayData, index) => {
            const hijriDay  = parseInt(dayData.date.hijri.day);
            const gregDay   = dayData.date.gregorian;
            const gregDateStr = `${parseInt(gregDay.day)}-${parseInt(gregDay.month.number)}-${gregDay.year}`;
            const gregDate  = new Date(parseInt(gregDay.year), parseInt(gregDay.month.number) - 1, parseInt(gregDay.day));
            const cell = document.createElement('div');
            cell.className = 'cal-day';
            cell.textContent = toUrduNumber(hijriDay);
            if (gregDateStr === todayStr) cell.classList.add('today');
            if (gregDate.getDay() === 5)  cell.classList.add('friday');
            const holidays = dayData.date.hijri.holidays;
            if (holidays?.length) {
                const hSpan = document.createElement('div');
                hSpan.className = 'cal-holiday';
                hSpan.textContent = holidays.join(', ');
                cell.appendChild(hSpan);
                cell.style.position = 'relative';
            }
            cell.dataset.hijriIndex = index;
            cell.dataset.gregDate   = gregDateStr;
            cell.addEventListener('click', () => {
                document.querySelectorAll('.cal-day.selected').forEach(el => el.classList.remove('selected'));
                cell.classList.add('selected');
                openDatePrayerModalWithData(days[index]);
            });
            container.appendChild(cell);
        });
    } catch (err) {
        console.error('Hijri calendar failed:', err);
        if (container) container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">❌ Failed to load Hijri calendar</div>';
    }
}

// ─── Date Prayer Times Popup ───
export async function openDatePrayerModal(dateStr) {
    const [d, m, y] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    if (dom.dateModalTitle)    dom.dateModalTitle.textContent    = `${weekday}, ${MONTH_NAMES_EN[m - 1]} ${d}`;
    if (dom.dateModalSubtitle) dom.dateModalSubtitle.textContent = `${d}/${m}/${y} • ${state.city}`;
    if (dom.datePrayerModal) { dom.datePrayerModal.classList.add('active'); document.body.style.overflow = 'hidden'; }

    PRAYER_ORDER.forEach(key => {
        const te = document.getElementById(`dp-time-${key}`);
        const pe = document.getElementById(`dp-${key}`);
        if (te) te.textContent = '...';
        if (pe) pe.classList.add('loading');
    });
    if (dom.dpHijriValue) dom.dpHijriValue.textContent = 'Loading...';

    try {
        const url  = `${API_BASE}/timings/${d}-${m}-${y}?latitude=${state.lat}&longitude=${state.lng}&method=${state.method}&school=${state.school}`;
        const res  = await fetch(url);
        const data = await res.json();
        if (data.code === 200) {
            const t = data.data.timings;
            const h = data.data.date.hijri;
            const map = { fajr: t.Fajr, sunrise: t.Sunrise, dhuhr: t.Dhuhr, asr: t.Asr, maghrib: t.Maghrib, isha: t.Isha };
            PRAYER_ORDER.forEach(key => {
                const te = document.getElementById(`dp-time-${key}`);
                const pe = document.getElementById(`dp-${key}`);
                if (te) te.textContent = formatTime(map[key].split(' ')[0]);
                if (pe) pe.classList.remove('loading');
            });
            if (dom.dpHijriValue) dom.dpHijriValue.textContent = `${h.day} ${h.month.en} ${h.year} AH`;
        }
    } catch (err) {
        console.error('Date prayer times failed:', err);
        PRAYER_ORDER.forEach(key => {
            const te = document.getElementById(`dp-time-${key}`);
            const pe = document.getElementById(`dp-${key}`);
            if (te) te.textContent = 'Error';
            if (pe) pe.classList.remove('loading');
        });
        if (dom.dpHijriValue) dom.dpHijriValue.textContent = 'Error';
    }
}

function openDatePrayerModalWithData(dayData) {
    const hijri = dayData.date.hijri;
    const greg  = dayData.date.gregorian;
    const t     = dayData.timings;
    const hijriMonthUr = HIJRI_MONTHS_UR[parseInt(hijri.month.number) - 1];
    if (dom.dateModalTitle)    dom.dateModalTitle.textContent    = `${toUrduNumber(hijri.day)} ${hijriMonthUr} ${toUrduNumber(hijri.year)}`;
    if (dom.dateModalSubtitle) dom.dateModalSubtitle.textContent = `${greg.day} ${greg.month.en} ${greg.year} • ${state.city}`;
    if (dom.datePrayerModal) { dom.datePrayerModal.classList.add('active'); document.body.style.overflow = 'hidden'; }
    const map = { fajr: t.Fajr, sunrise: t.Sunrise, dhuhr: t.Dhuhr, asr: t.Asr, maghrib: t.Maghrib, isha: t.Isha };
    PRAYER_ORDER.forEach(key => {
        const te = document.getElementById(`dp-time-${key}`);
        const pe = document.getElementById(`dp-${key}`);
        if (te) te.textContent = formatTime(map[key].split(' ')[0]);
        if (pe) pe.classList.remove('loading');
    });
    if (dom.dpHijriValue) dom.dpHijriValue.textContent = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
}

export function closeDateModal() {
    if (dom.datePrayerModal) dom.datePrayerModal.classList.remove('active');
    document.body.style.overflow = '';
}
