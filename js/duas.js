/* ============================================================
   🤲 duas.js — Masnoon Duas Collection
   ============================================================ */

const DUAS = [
    // ─── Morning (Subah) ───
    { id: 'morning1', cat: 'morning', icon: '🌅',
      arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ...',
      trans:  'Asbahna wa asbahal mulku lillah, wal hamdu lillah...',
      meaning: 'We have entered the morning and the dominion belongs to Allah...',
      ref: 'Abu Dawud 5071'
    },
    { id: 'morning2', cat: 'morning', icon: '🌅',
      arabic: 'اللّٰهُمَّ بِكَ أَصْبَحْنَا وَبِكَ أَمْسَيْنَا وَبِكَ نَحْيَا وَبِكَ نَمُوتُ',
      trans:  'Allahumma bika asbahna wa bika amsayna wa bika nahya wa bika namutu',
      meaning: 'O Allah, by You we enter the morning, by You we enter the evening, by You we live and by You we die.',
      ref: 'Tirmidhi 3391'
    },
    // ─── Evening (Shaam) ───
    { id: 'evening1', cat: 'evening', icon: '🌙',
      arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
      trans:  'Amsayna wa amsal mulku lillah wal hamdu lillah',
      meaning: 'We have entered the evening and the dominion belongs to Allah, and all praise is due to Allah.',
      ref: 'Muslim 2723'
    },
    { id: 'evening2', cat: 'evening', icon: '🌙',
      arabic: 'اللّٰهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ وَأُشْهِدُ حَمَلَةَ عَرْشِكَ',
      trans:  'Allahumma inni amsaytu ush-hiduka wa ush-hidu hamalata arshika',
      meaning: 'O Allah, I have reached the evening calling You to witness, and calling to witness the bearers of Your Throne.',
      ref: 'Abu Dawud 5069'
    },
    // ─── After Prayer ───
    { id: 'afterprayer1', cat: 'afterprayer', icon: '🕌',
      arabic: 'أَسْتَغْفِرُ اللَّهَ (×3)، اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
      trans:  'Astaghfirullah (×3). Allahumma antas-salam wa minkas-salam tabarakta ya zal jalali wal ikram',
      meaning: 'I seek forgiveness from Allah (×3). O Allah, You are Peace and from You is peace; blessed are You, O Possessor of Majesty and Honor.',
      ref: 'Muslim 591'
    },
    { id: 'afterprayer2', cat: 'afterprayer', icon: '🕌',
      arabic: 'سُبْحَانَ اللَّهِ (×33) • اَلْحَمْدُ لِلَّهِ (×33) • اَللَّهُ أَكْبَرُ (×33)',
      trans:  'SubhanAllah (×33) • Alhamdulillah (×33) • Allahu Akbar (×33)',
      meaning: 'Glory be to Allah (×33) • Praise be to Allah (×33) • Allah is the Greatest (×33)',
      ref: 'Muslim 597'
    },
    { id: 'afterprayer3', cat: 'afterprayer', icon: '🕌',
      arabic: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
      trans:  'La ilaha illallahu wahdahu la sharika lahu, lahul mulku wa lahul hamdu wa huwa ala kulli shay\'in qadir',
      meaning: 'There is none worthy of worship except Allah alone, without partner. His is the dominion and all praise, and He is over all things capable.',
      ref: 'Muslim 594'
    },
    // ─── Food (Khana) ───
    { id: 'food1', cat: 'food', icon: '🍽️',
      arabic: 'بِسْمِ اللَّهِ',
      trans:  'Bismillah',
      meaning: 'In the name of Allah.',
      ref: 'Abu Dawud 3767'
    },
    { id: 'food2', cat: 'food', icon: '🍽️',
      arabic: 'اللَّهُمَّ بَارِكْ لَنَا فِيمَا رَزَقْتَنَا وَقِنَا عَذَابَ النَّارِ',
      trans:  'Allahumma barik lana fima razaqtana wa qina azaban nar',
      meaning: 'O Allah, bless us in what You have provided for us and protect us from the punishment of the Fire.',
      ref: 'Ibn as-Sunni 458'
    },
    { id: 'food3', cat: 'food', icon: '🍽️',
      arabic: 'اَلْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
      trans:  'Alhamdulillahil ladhi at\'amana wa saqana wa ja\'alana muslimin',
      meaning: 'All praise is due to Allah Who gave us food and drink and made us Muslims.',
      ref: 'Abu Dawud 3850'
    },
    // ─── Sleep (Sone ka) ───
    { id: 'sleep1', cat: 'sleep', icon: '😴',
      arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
      trans:  'Bismikallahuma amutu wa ahya',
      meaning: 'In Your name, O Allah, I die and I live.',
      ref: 'Bukhari 6324'
    },
    { id: 'sleep2', cat: 'sleep', icon: '😴',
      arabic: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
      trans:  'Allahumma qini adhabaka yawma tab\'athu ibadak',
      meaning: 'O Allah, protect me from Your punishment on the Day You resurrect Your servants.',
      ref: 'Abu Dawud 5045'
    },
    { id: 'sleep3', cat: 'sleep', icon: '😴',
      arabic: 'اللَّهُمَّ بِاسْمِكَ أَحْيَا وَبِاسْمِكَ أَمُوتُ',
      trans:  'Allahumma bismika ahya wa bismika amut',
      meaning: 'O Allah, in Your name I live and in Your name I die.',
      ref: 'Bukhari 6312'
    },
    // ─── Travel (Safar) ───
    { id: 'travel1', cat: 'travel', icon: '✈️',
      arabic: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا',
      trans:  'Allahu Akbar (×3). Subhanal ladhi sakh-khara lana hadha...',
      meaning: 'Allah is Greatest (×3). Glory to He who has subjected this to us...',
      ref: 'Muslim 1342'
    },
    { id: 'travel2', cat: 'travel', icon: '✈️',
      arabic: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى',
      trans:  'Allahumma inna nas\'aluka fi safarina hadhal birra wat taqwa',
      meaning: 'O Allah, we ask You on this journey for goodness and piety.',
      ref: 'Muslim 1342'
    },
    // ─── Protection (Hifazat) ───
    { id: 'protect1', cat: 'protection', icon: '🛡️',
      arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
      trans:  'A\'udhu bi kalimatillahit tammati min sharri ma khalaq',
      meaning: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
      ref: 'Muslim 2708'
    },
    { id: 'protect2', cat: 'protection', icon: '🛡️',
      arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ',
      trans:  'Bismillahil ladhi la yadurru ma\'a ismihi shay\'un fil ardi wa la fis-sama\'',
      meaning: 'In the name of Allah with whose name nothing can harm in the earth or the heavens.',
      ref: 'Abu Dawud 5088'
    },
];

const CATEGORIES = [
    { id: 'all',         icon: '📖', label: 'All Duas' },
    { id: 'morning',     icon: '🌅', label: 'Morning' },
    { id: 'evening',     icon: '🌙', label: 'Evening' },
    { id: 'afterprayer', icon: '🕌', label: 'After Salah' },
    { id: 'food',        icon: '🍽️', label: 'Food' },
    { id: 'sleep',       icon: '😴', label: 'Sleep' },
    { id: 'travel',      icon: '✈️', label: 'Travel' },
    { id: 'protection',  icon: '🛡️', label: 'Protection' },
];

let activeCat = 'all';

export function initDuas() {
    const openBtn  = document.getElementById('duasOpenBtn');
    const closeBtn = document.getElementById('duasCloseBtn');
    const modal    = document.getElementById('duasModal');

    if (openBtn) openBtn.addEventListener('click', openDuasModal);
    if (closeBtn) closeBtn.addEventListener('click', closeDuasModal);
    if (modal) modal.addEventListener('click', e => { if (e.target === modal) closeDuasModal(); });
}

function openDuasModal() {
    const modal = document.getElementById('duasModal');
    if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
    renderCategoryTabs();
    renderDuas('all');
}

function closeDuasModal() {
    const modal = document.getElementById('duasModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
}

function renderCategoryTabs() {
    const tabs = document.getElementById('duasCategoryTabs');
    if (!tabs) return;
    tabs.innerHTML = '';
    CATEGORIES.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'dua-cat-btn' + (cat.id === activeCat ? ' active' : '');
        btn.innerHTML = `${cat.icon} ${cat.label}`;
        btn.addEventListener('click', () => {
            activeCat = cat.id;
            renderCategoryTabs();
            renderDuas(cat.id);
        });
        tabs.appendChild(btn);
    });
}

function renderDuas(catId) {
    const list = document.getElementById('duasList');
    if (!list) return;

    const filtered = catId === 'all' ? DUAS : DUAS.filter(d => d.cat === catId);
    list.innerHTML = '';

    filtered.forEach(dua => {
        const card = document.createElement('div');
        card.className = 'dua-card glass-card';
        card.innerHTML = `
            <div class="dua-header">
                <span class="dua-icon">${dua.icon}</span>
                <span class="dua-ref">${dua.ref}</span>
            </div>
            <div class="dua-arabic">${dua.arabic}</div>
            <div class="dua-trans">${dua.trans}</div>
            <div class="dua-meaning">${dua.meaning}</div>
        `;
        list.appendChild(card);
    });
}
