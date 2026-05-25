/* ============================================
   🕌 PRAYER TIMES APP - Application Logic
   Uses Aladhan API for accurate prayer times
   Supports English (Gregorian) & Urdu (Hijri)
   ============================================ */

(function () {
    'use strict';

    // ─── UI Translater ───
    function applyLanguage() {
        const lang = state.appLang;
        const dict = TRANSLATIONS[lang];
        
        // Translate all data-i18n elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) {
                el.textContent = dict[key];
            }
        });
        
        // Translate prayer names in cards
        PRAYER_ORDER.forEach(key => {
            const card = document.getElementById(`card-${key}`);
            if (card) {
                const nameEl = card.querySelector('.prayer-card-name');
                if (nameEl) nameEl.textContent = lang === 'hi' ? PRAYER_NAMES[key].hi : PRAYER_NAMES[key].en;
            }
        });
        
        // Also update next prayer title if already running
        updatePrayerCards();
    }

    // ─── Constants ───
    const API_BASE = 'https://api.aladhan.com/v1';
    const KAABA_LAT = 21.4225;
    const KAABA_LNG = 39.8262;

    const PRAYER_NAMES = {
        fajr:    { en: 'Fajr',    ar: 'الفجر', hi: 'फ़ज्र', fr: 'Fajr', ur: 'فجر', bn: 'ফজর', id: 'Subuh', tr: 'İmsak' },
        sunrise: { en: 'Sunrise', ar: 'الشروق', hi: 'सूर्योदय', fr: 'Lever du soleil', ur: 'طلوع آفتاب', bn: 'সূর্যোদয়', id: 'Syuruk', tr: 'Güneş' },
        dhuhr:   { en: 'Dhuhr',   ar: 'الظهر', hi: 'ज़ुहर', fr: 'Dhuhr', ur: 'ظہر', bn: 'যোহর', id: 'Zuhur', tr: 'Öğle' },
        asr:     { en: 'Asr',     ar: 'العصر', hi: 'अस्र', fr: 'Asr', ur: 'عصر', bn: 'আসর', id: 'Asar', tr: 'İkindi' },
        maghrib: { en: 'Maghrib', ar: 'المغرب', hi: 'मग़रिब', fr: 'Maghrib', ur: 'مغرب', bn: 'মাগরিব', id: 'Maghrib', tr: 'Akşam' },
        isha:    { en: 'Isha',    ar: 'العشاء', hi: 'ईशा', fr: 'Isha', ur: 'عشاء', bn: 'এশা', id: 'Isya', tr: 'Yatsı' },
        imsak:   { en: 'Imsak',   ar: 'الإمساك', hi: 'इमसाक' },
        ishraq:  { en: 'Ishraq',  ar: 'الإشراق', hi: 'इशराक़' },
        zawal:   { en: 'Zawaal',  ar: 'الزوال', hi: 'ज़वाल' },
        tahajjud:{ en: 'Tahajjud',ar: 'التهجد', hi: 'तहज्जुद' }
    };

    const PRAYER_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

    const MONTH_NAMES_EN = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const WEEKDAYS_UR = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];

    const HIJRI_MONTHS_UR = [
        'محرم', 'صفر', 'ربیع الاول', 'ربیع الثانی',
        'جمادی الاول', 'جمادی الثانی', 'رجب', 'شعبان',
        'رمضان', 'شوال', 'ذوالقعدہ', 'ذوالحجہ'
    ];

    // Urdu numerals
    const URDU_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];

    function toUrduNumber(num) {
        return String(num).split('').map(d => URDU_DIGITS[parseInt(d)] || d).join('');
    }

    const TRANSLATIONS = {
        en: {
            appTitle: "Prayer Times",
            todayPrayers: "Today's Prayer Times",
            nextPrayer: "Next Prayer",
            passed: "PASSED",
            current: "CURRENT",
            next: "NEXT",
            qiblaTitle: "Qibla Direction",
            enableCompass: "Enable Device Compass",
            settingsTitle: "Settings",
            themeTitle: "Theme Mode",
            calcMethodTitle: "Calculation Method",
            schoolTitle: "Juristic School (Asr)",
            schoolShafii: "Shafi'i / Maliki / Hanbali",
            schoolHanafi: "Hanafi",
            manualCityTitle: "Manual City Search",
            searchCityBtn: "Search City",
            notifPrefsTitle: "Notification Preferences",
            enableAllBtn: "Enable All",
            notifSoundTitle: "Notification Sound",
            sysDefault: "System Default",
            shortBeep: "Short Beep",
            adhanMakkah: "Adhan (Makkah)",
            manualOffsetTitle: "Manual Prayer Time Offsets (Jamaat Time)",
            use24hTitle: "Use 24-hour format",
            saveSettingsBtn: "Save Settings",
            calModalTitle: "📅 Prayer Calendar",
            calHintText: "👆 Tap any date to see prayer times",
            hours: "Hours",
            minutes: "Minutes",
            seconds: "Seconds",
            installAppTitle: "Install App",
            installAppDesc: "Install this application on your device for a better, faster, and offline experience.",
            notNowBtn: "Not Now",
            installBtn: "Install"
        },
        hi: {
            appTitle: "नमाज़ का समय", todayPrayers: "आज के नमाज़ का समय", nextPrayer: "अगली नमाज़",
            passed: "हो गई", current: "अभी", next: "अगली", qiblaTitle: "क़िबला की दिशा", enableCompass: "कम्पास चालू करें",
            settingsTitle: "सेटिंग्स", themeTitle: "थीम मोड", calcMethodTitle: "गणना का तरीका", schoolTitle: "न्यायवादी स्कूल (अस्र)",
            schoolShafii: "शफ़ीई / मालिकी / हनबली", schoolHanafi: "हनफ़ी", manualCityTitle: "मैन्युअल शहर खोज", searchCityBtn: "शहर खोजें",
            notifPrefsTitle: "सूचना प्राथमिकताएं", enableAllBtn: "सभी चालू करें", notifSoundTitle: "सूचना की आवाज़", sysDefault: "सिस्टम डिफ़ॉल्ट",
            shortBeep: "छोटी बीप", adhanMakkah: "अज़ान (मक्का)", manualOffsetTitle: "मैन्युअल नमाज़ का समय", use24hTitle: "24 घंटे का प्रारूप",
            saveSettingsBtn: "सहेजें", calModalTitle: "📅 नमाज़ कैलेंडर", calHintText: "तारीख पर टैप करें", hours: "घंटे", minutes: "मिनट", seconds: "सेकंड",
            selectLanguage: "भाषा चुनें", searchLanguage: "भाषा खोजें...",
            installAppTitle: "ऐप इंस्टॉल करें", installAppDesc: "बेहतर और तेज़ अनुभव के लिए इस ऐप को अपने डिवाइस पर इंस्टॉल करें।",
            notNowBtn: "अभी नहीं", installBtn: "इंस्टॉल करें"
        },
        ar: {
            appTitle: "أوقات الصلاة", todayPrayers: "أوقات صلاة اليوم", nextPrayer: "الصلاة القادمة",
            passed: "انقضت", current: "الآن", next: "التالي", qiblaTitle: "اتجاه القبلة", enableCompass: "تفعيل البوصلة",
            settingsTitle: "الإعدادات", themeTitle: "وضع المظهر", calcMethodTitle: "طريقة الحساب", schoolTitle: "المذهب الفقهي (العصر)",
            schoolShafii: "شافعي / مالكي / حنبلي", schoolHanafi: "حنفي", manualCityTitle: "البحث اليدوي عن المدينة", searchCityBtn: "بحث",
            notifPrefsTitle: "إعدادات الإشعارات", enableAllBtn: "تفعيل الكل", notifSoundTitle: "صوت الإشعار", sysDefault: "النظام الافتراضي",
            shortBeep: "صوت قصير", adhanMakkah: "أذان (مكة)", manualOffsetTitle: "إعدادات يدوية", use24hTitle: "نظام 24 ساعة",
            saveSettingsBtn: "حفظ", calModalTitle: "📅 تقويم الصلاة", calHintText: "اضغط على أي تاريخ", hours: "ساعات", minutes: "دقائق", seconds: "ثواني",
            selectLanguage: "اختر اللغة", searchLanguage: "البحث عن لغة...",
            installAppTitle: "تثبيت التطبيق", installAppDesc: "قم بتثبيت هذا التطبيق على جهازك للحصول على تجربة أفضل وأسرع.",
            notNowBtn: "ليس الآن", installBtn: "تثبيت"
        },
        fr: {
            appTitle: "Heures de Prière", todayPrayers: "Heures d'Aujourd'hui", nextPrayer: "Prochaine Prière",
            passed: "PASSÉ", current: "EN COURS", next: "SUIVANT", qiblaTitle: "Direction de la Qibla", enableCompass: "Activer la boussole",
            settingsTitle: "Paramètres", themeTitle: "Mode Thème", calcMethodTitle: "Méthode de calcul", schoolTitle: "École Juridique",
            schoolShafii: "Shafi'i / Maliki / Hanbali", schoolHanafi: "Hanafi", manualCityTitle: "Recherche manuelle", searchCityBtn: "Rechercher",
            notifPrefsTitle: "Préférences de notification", enableAllBtn: "Tout activer", notifSoundTitle: "Son de notification", sysDefault: "Défaut",
            shortBeep: "Bip court", adhanMakkah: "Adhan (Makkah)", manualOffsetTitle: "Décalages manuels", use24hTitle: "Format 24h",
            saveSettingsBtn: "Sauvegarder", calModalTitle: "📅 Calendrier", calHintText: "Appuyez sur une date", hours: "Heures", minutes: "Minutes", seconds: "Secondes",
            selectLanguage: "Choisir la langue", searchLanguage: "Rechercher une langue...",
            installAppTitle: "Installer l'App", installAppDesc: "Installez cette application pour une expérience plus rapide et hors ligne.",
            notNowBtn: "Pas maintenant", installBtn: "Installer"
        },
        ur: {
            appTitle: "نماز کے اوقات", todayPrayers: "آج کے اوقات", nextPrayer: "اگلی نماز",
            passed: "گزر گئی", current: "ابھی", next: "اگلی", qiblaTitle: "قبلہ کی سمت", enableCompass: "قطب نما آن کریں",
            settingsTitle: "ترتیبات", themeTitle: "تھیم", calcMethodTitle: "حساب کا طریقہ", schoolTitle: "فقہی مسلک",
            schoolShafii: "شافعی / مالکی / حنبلی", schoolHanafi: "حنفی", manualCityTitle: "شہر تلاش کریں", searchCityBtn: "تلاش",
            notifPrefsTitle: "اطلاعات", enableAllBtn: "سب آن کریں", notifSoundTitle: "آواز", sysDefault: "سسٹم",
            shortBeep: "چھوٹی بیپ", adhanMakkah: "اذان (مکہ)", manualOffsetTitle: "جماعت کا وقت", use24hTitle: "24 گھنٹے کا وقت",
            saveSettingsBtn: "محفوظ کریں", calModalTitle: "📅 کیلنڈر", calHintText: "تاریخ پر کلک کریں", hours: "گھنٹے", minutes: "منٹ", seconds: "سیکنڈ",
            selectLanguage: "زبان منتخب کریں", searchLanguage: "زبان تلاش کریں...",
            installAppTitle: "ایپ انسٹال کریں", installAppDesc: "بہتر اور تیز تجربے کے لیے اس ایپ کو اپنے ڈیوائس پر انسٹال کریں۔",
            notNowBtn: "ابھی نہیں", installBtn: "انسٹال کریں"
        },
        bn: {
            appTitle: "নামাজের সময়", todayPrayers: "আজকের নামাজের সময়", nextPrayer: "পরবর্তী নামাজ",
            passed: "অতীত", current: "বর্তমান", next: "পরবর্তী", qiblaTitle: "কিবলার দিক", enableCompass: "কম্পাস চালু করুন",
            settingsTitle: "সেটিংস", themeTitle: "থিম", calcMethodTitle: "গণনার পদ্ধতি", schoolTitle: "মাযহাব (আসর)",
            schoolShafii: "শাফিঈ / মালিকি / হাম্বলি", schoolHanafi: "হানাফি", manualCityTitle: "শহর খুঁজুন", searchCityBtn: "খুঁজুন",
            notifPrefsTitle: "বিজ্ঞপ্তি সেটিংস", enableAllBtn: "সব চালু করুন", notifSoundTitle: "বিজ্ঞপ্তির শব্দ", sysDefault: "ডিফল্ট",
            shortBeep: "ছোট বিপ", adhanMakkah: "আজান (মক্কা)", manualOffsetTitle: "ম্যানুয়াল সময়", use24hTitle: "২৪ ঘন্টা বিন্যাস",
            saveSettingsBtn: "সংরক্ষণ করুন", calModalTitle: "📅 ক্যালেন্ডার", calHintText: "তারিখে ট্যাপ করুন", hours: "ঘন্টা", minutes: "মিনিট", seconds: "সেকেন্ড",
            selectLanguage: "ভাষা নির্বাচন করুন", searchLanguage: "ভাষা খুঁজুন...",
            installAppTitle: "অ্যাপ ইনস্টল করুন", installAppDesc: "উন্নত এবং দ্রুত অভিজ্ঞতার জন্য এই অ্যাপটি আপনার ডিভাইসে ইনস্টল করুন।",
            notNowBtn: "এখন না", installBtn: "ইনস্টল করুন"
        },
        id: {
            appTitle: "Waktu Shalat", todayPrayers: "Waktu Shalat Hari Ini", nextPrayer: "Shalat Berikutnya",
            passed: "LEWAT", current: "SEKARANG", next: "SELANJUTNYA", qiblaTitle: "Arah Kiblat", enableCompass: "Aktifkan Kompas",
            settingsTitle: "Pengaturan", themeTitle: "Tema", calcMethodTitle: "Metode Perhitungan", schoolTitle: "Mazhab (Ashar)",
            schoolShafii: "Syafi'i / Maliki / Hambali", schoolHanafi: "Hanafi", manualCityTitle: "Cari Kota", searchCityBtn: "Cari",
            notifPrefsTitle: "Notifikasi", enableAllBtn: "Aktifkan Semua", notifSoundTitle: "Suara Notifikasi", sysDefault: "Default",
            shortBeep: "Bip Pendek", adhanMakkah: "Adzan (Makkah)", manualOffsetTitle: "Waktu Jamaah", use24hTitle: "Format 24 Jam",
            saveSettingsBtn: "Simpan", calModalTitle: "📅 Kalender", calHintText: "Ketuk tanggal", hours: "Jam", minutes: "Menit", seconds: "Detik",
            selectLanguage: "Pilih Bahasa", searchLanguage: "Cari bahasa...",
            installAppTitle: "Instal Aplikasi", installAppDesc: "Instal aplikasi ini di perangkat Anda untuk pengalaman yang lebih baik.",
            notNowBtn: "Nanti saja", installBtn: "Instal"
        },
        tr: {
            appTitle: "Namaz Vakitleri", todayPrayers: "Bugünün Vakitleri", nextPrayer: "Sonraki Vakit",
            passed: "GEÇTİ", current: "ŞU AN", next: "SONRAKİ", qiblaTitle: "Kıble Yönü", enableCompass: "Pusulayı Aç",
            settingsTitle: "Ayarlar", themeTitle: "Tema", calcMethodTitle: "Hesaplama Yöntemi", schoolTitle: "Mezhep (İkindi)",
            schoolShafii: "Şafii / Maliki / Hanbeli", schoolHanafi: "Hanefi", manualCityTitle: "Şehir Ara", searchCityBtn: "Ara",
            notifPrefsTitle: "Bildirimler", enableAllBtn: "Tümünü Aç", notifSoundTitle: "Bildirim Sesi", sysDefault: "Varsayılan",
            shortBeep: "Kısa Bip", adhanMakkah: "Ezan (Mekke)", manualOffsetTitle: "Cemaat Vakti", use24hTitle: "24 Saat Formatı",
            saveSettingsBtn: "Kaydet", calModalTitle: "📅 Takvim", calHintText: "Tarihe dokunun", hours: "Saat", minutes: "Dakika", seconds: "Saniye",
            selectLanguage: "Dil Seç", searchLanguage: "Dil ara...",
            installAppTitle: "Uygulamayı Yükle", installAppDesc: "Daha iyi, hızlı ve çevrimdışı kullanım için bu uygulamayı yükleyin.",
            notNowBtn: "Şimdi Değil", installBtn: "Yükle"
        }
    };

    const SUPPORTED_LANGUAGES = [
        { code: 'en', name: 'English', native: 'English' },
        { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
        { code: 'ar', name: 'Arabic', native: 'العربية' },
        { code: 'fr', name: 'French', native: 'Français' },
        { code: 'ur', name: 'Urdu', native: 'اردو' },
        { code: 'bn', name: 'Bengali', native: 'বাংলা' },
        { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
        { code: 'tr', name: 'Turkish', native: 'Türkçe' }
    ];

    // ─── State ───
    const state = {
        lat: null,
        lng: null,
        city: 'Unknown',
        country: '',
        method: parseInt(localStorage.getItem('pt_method') || '2'),
        school: parseInt(localStorage.getItem('pt_school') || '0'),
        use24h: localStorage.getItem('pt_24h') === 'true',
        todayTimings: null,
        // Calendar
        calMode: 'english', // 'english' or 'urdu'
        calMonth: new Date().getMonth(),     // Gregorian month (0-11)
        calYear: new Date().getFullYear(),   // Gregorian year
        hijriMonth: 1,   // Hijri month (1-12)
        hijriYear: 1447, // Hijri year
        hijriCalData: null,  // cached hijri calendar API response
        // Other
        countdownInterval: null,
        qiblaAngle: 0,
        notifyPrefs: JSON.parse(localStorage.getItem('pt_notify_prefs') || '{"imsak":false,"fajr":true,"sunrise":false,"ishraq":false,"zawal":false,"dhuhr":true,"asr":true,"maghrib":true,"isha":true,"tahajjud":false}'),
        notifySound: localStorage.getItem('pt_notify_sound') || 'system',
        jamaatTimes: JSON.parse(localStorage.getItem('pt_jamaat_times') || '{"imsak":"","fajr":"","sunrise":"","ishraq":"","zawal":"","dhuhr":"","asr":"","maghrib":"","isha":"","tahajjud":""}'),
        notifiedPrayers: {}, // track which prayers we already notified today
        
        // New Features State
        themeMode: localStorage.getItem('pt_theme') || 'auto', // 'auto', 'light', 'dark'
        appLang: localStorage.getItem('pt_lang') || 'en',
        savedLocations: JSON.parse(localStorage.getItem('pt_locations') || '[]'),
        longPressTimer: null,
        hijriOffset: parseInt(localStorage.getItem('pt_hijri_adj') || '0'),
        ishraqOffset: parseInt(localStorage.getItem('pt_ishraq_offset') || '15'),
        makroohOffset: parseInt(localStorage.getItem('pt_makrooh_offset') || '10')
    };

    const DAILY_DUAS = [
        { ar: 'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ', en: '"Our Lord, accept from us. Indeed You are the Hearing, the Knowing."', ref: 'Quran 2:127' },
        { ar: 'رَبِّ إِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي', en: '"My Lord, I have wronged myself, so forgive me."', ref: 'Quran 28:16' },
        { ar: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', en: '"Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire."', ref: 'Quran 2:201' },
        { ar: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', en: '"Sufficient for us is Allah, and [He is] the best Disposer of affairs."', ref: 'Quran 3:173' },
        { ar: 'رَبِّ زِدْنِي عِلْمًا', en: '"My Lord, increase me in knowledge."', ref: 'Quran 20:114' },
        { ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلاً مُتَقَبَّلاً', en: '"O Allah, I ask You for knowledge that is of benefit, a good provision, and deeds that will be accepted."', ref: 'Sunan Ibn Majah 925' },
        { ar: 'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ', en: '"O Changer of the hearts, make my heart firm upon Your religion."', ref: 'Jami` at-Tirmidhi 2140' }
    ];

    // ─── DOM Refs (initialized inside init() after DOM is ready) ───
    const $ = (id) => document.getElementById(id);
    let dom = {};

    // ─── Language Modal Logic ───
    function initLangModal() {
        const langList = $('languageList');
        if (!langList) return;
        
        function renderLanguages(filter = '') {
            langList.innerHTML = '';
            SUPPORTED_LANGUAGES.forEach(lang => {
                if (lang.name.toLowerCase().includes(filter.toLowerCase()) || lang.native.toLowerCase().includes(filter.toLowerCase())) {
                    const el = document.createElement('div');
                    el.className = 'lang-list-item' + (state.appLang === lang.code ? ' active' : '');
                    el.innerHTML = `<span>${lang.native}</span><span style="opacity:0.5; font-size:0.85rem;">${lang.name}</span>`;
                    el.addEventListener('click', () => {
                        state.appLang = lang.code;
                        localStorage.setItem('pt_lang', state.appLang);
                        applyLanguage();
                        renderLanguages(filter);
                        $('langModal').classList.remove('active');
                        showToast(`🌐 Language changed`);
                    });
                    langList.appendChild(el);
                }
            });
        }
        
        renderLanguages();
        
        const searchInput = $('langSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                renderLanguages(e.target.value);
            });
        }
        
        if ($('langToggleBtn')) {
            $('langToggleBtn').addEventListener('click', () => {
                renderLanguages();
                if(searchInput) searchInput.value = '';
                $('langModal').classList.add('active');
            });
        }
        
        if ($('closeLangBtn')) {
            $('closeLangBtn').addEventListener('click', () => {
                $('langModal').classList.remove('active');
            });
        }
    }

    // ─── Initialize ───
    async function init() {
        // Initialize DOM refs here — AFTER DOMContentLoaded, so all elements exist
        dom.bgGradient = $('bgGradient');
        dom.stars = $('stars');
        dom.cityName = $('cityName');
        dom.hijriDate = $('hijriDate');
        dom.gregorianDate = $('gregorianDate');
        dom.currentPrayerLabel = $('currentPrayerLabel');
        dom.prayerArabic = $('prayerArabic');
        dom.prayerEnglish = $('prayerEnglish');
        dom.hoursValue = $('hoursValue');
        dom.minutesValue = $('minutesValue');
        dom.secondsValue = $('secondsValue');
        dom.prayerTimeDisplay = $('prayerTimeDisplay');
        dom.compassNeedle = $('compassNeedle');
        dom.qiblaDegrees = $('qiblaDegrees');
        dom.calendarModal = $('calendarModal');
        dom.calModalTitle = $('calModalTitle');
        dom.calLangToggle = $('calLangToggle');
        dom.calLangText = $('calLangText');
        dom.calMonthName = $('calMonthName');
        dom.calYear = $('calYear');
        dom.calWeekdays = $('calWeekdays');
        dom.calDays = $('calDays');
        dom.calHint = $('calHint');
        dom.datePrayerModal = $('datePrayerModal');
        dom.dateModalTitle = $('dateModalTitle');
        dom.dateModalSubtitle = $('dateModalSubtitle');
        dom.dpHijriValue = $('dpHijriValue');
        dom.settingsModal = $('settingsModal');
        dom.calcMethod = $('calcMethod');
        dom.schoolSelect = $('schoolSelect');
        dom.manualCity = $('manualCity');
        dom.timeFormat24 = $('timeFormat24');
        dom.enableNotifications = $('enableNotifications');
        dom.offsetFajr = $('offsetFajr');
        dom.offsetDhuhr = $('offsetDhuhr');
        dom.offsetAsr = $('offsetAsr');
        dom.offsetMaghrib = $('offsetMaghrib');
        dom.offsetIsha = $('offsetIsha');
        dom.toast = $('toast');
        dom.toastMessage = $('toastMessage');

        createStars();
        bindEvents();
        loadSettings();
        applyLanguage();
        updateGregorianDate();
        updateBackgroundTheme();
        setDailyDua();
        if ($('currentYear')) $('currentYear').textContent = new Date().getFullYear();
        initLangModal();
        await detectLocation();
    }

    // ─── Stars Background ───
    function createStars() {
        const container = dom.stars;
        const count = 80;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = Math.random() * 100 + '%';
            star.style.top = Math.random() * 60 + '%';
            star.style.setProperty('--duration', (2 + Math.random() * 4) + 's');
            star.style.setProperty('--max-opacity', (0.3 + Math.random() * 0.7).toFixed(2));
            star.style.animationDelay = (Math.random() * 5) + 's';
            star.style.width = (1 + Math.random() * 2) + 'px';
            star.style.height = star.style.width;
            fragment.appendChild(star);
        }

        container.appendChild(fragment);
    }

    // ─── Background Theme Based on Time ───
    function updateBackgroundTheme() {
        const bg = dom.bgGradient;
        bg.classList.remove('fajr', 'day', 'maghrib', 'night', 'force-light', 'force-dark');
        
        if (state.themeMode === 'light') {
            bg.classList.add('force-light');
            dom.stars.style.opacity = '0.15';
            return;
        } else if (state.themeMode === 'dark') {
            bg.classList.add('force-dark');
            dom.stars.style.opacity = '1';
            return;
        }

        // Auto mode
        const hour = new Date().getHours();
        if (hour >= 4 && hour < 6) bg.classList.add('fajr');
        else if (hour >= 6 && hour < 17) bg.classList.add('day');
        else if (hour >= 17 && hour < 19) bg.classList.add('maghrib');
        else bg.classList.add('night');

        dom.stars.style.opacity = (hour >= 6 && hour < 18) ? '0.15' : '1';
    }

    function toggleTheme() {
        if (state.themeMode === 'auto') state.themeMode = 'light';
        else if (state.themeMode === 'light') state.themeMode = 'dark';
        else state.themeMode = 'auto';

        localStorage.setItem('pt_theme', state.themeMode);
        updateBackgroundTheme();
        
        let msg = 'Theme set to Auto';
        if (state.themeMode === 'light') msg = 'Theme set to Light';
        if (state.themeMode === 'dark') msg = 'Theme set to Dark';
        showToast(`🌗 ${msg}`);
    }

    // ─── Daily Dua ───
    function setDailyDua() {
        const today = new Date();
        const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const duaIndex = dayOfYear % DAILY_DUAS.length;
        const dua = DAILY_DUAS[duaIndex];
        $('dailyDuaAr').textContent = dua.ar;
        $('dailyDuaEn').textContent = dua.en;
        if ($('dailyDuaRef') && dua.ref) {
            $('dailyDuaRef').textContent = dua.ref;
        }
    }

    // ─── Location Detection ───
    async function detectLocation() {
        // If saved location exists, use it instantly then silently refresh
        if (state.savedLocations.length > 0) {
            const loc = state.savedLocations[0];
            state.lat = loc.lat; state.lng = loc.lng;
            state.city = loc.city; state.country = loc.country;
            dom.cityName.textContent = state.city + (state.country ? ', ' + state.country : '');
            fetchPrayerTimes(); // No await — instant!
            calculateQibla();
            _detectInBackground();
            return;
        }

        // First time: Show Makkah times INSTANTLY, detect real location in background
        state.lat = 21.4225; state.lng = 39.8262;
        state.city = 'Makkah'; state.country = 'Saudi Arabia';
        dom.cityName.textContent = '📍 Detecting location...';
        fetchPrayerTimes(); // No await — show times right away!
        calculateQibla();
        _detectInBackground();
    }

    async function _detectInBackground() {
        // Step 1: Try IP location (fast, no permission needed)
        try {
            const controller = new AbortController();
            const tid = setTimeout(() => controller.abort(), 4000);
            const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
            clearTimeout(tid);
            const d = await res.json();
            if (d && d.latitude) {
                state.lat = d.latitude; state.lng = d.longitude;
                state.city = d.city || 'Unknown'; state.country = d.country_name || '';
                dom.cityName.textContent = state.city + (state.country ? ', ' + state.country : '');
                saveCurrentLocationToHistory();
                fetchPrayerTimes(); calculateQibla();
            }
        } catch { /* IP failed, will try GPS */ }

        // Step 2: Try GPS for precise location
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
            } catch { /* GPS failed — IP or Makkah already showing */ }
        }
    }

    async function fallbackLocation() {
        state.lat = 21.4225; state.lng = 39.8262;
        state.city = 'Makkah'; state.country = 'Saudi Arabia';
        dom.cityName.textContent = 'Makkah, Saudi Arabia (Default)';
        await fetchPrayerTimes(); calculateQibla();
    }

    async function reverseGeocode(lat, lng) {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            state.city = data.address.city || data.address.town || data.address.village || data.address.county || 'Unknown';
            state.country = data.address.country || '';
            dom.cityName.textContent = state.city + (state.country ? ', ' + state.country : '');
        } catch {
            dom.cityName.textContent = `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
        }
    }

    // ─── City Search & History ───
    function saveCurrentLocationToHistory() {
        if (!state.lat || !state.city) return;
        const newLoc = { lat: state.lat, lng: state.lng, city: state.city, country: state.country };
        
        // Remove if exists to move to top
        state.savedLocations = state.savedLocations.filter(l => l.city !== newLoc.city);
        state.savedLocations.unshift(newLoc);
        
        // Keep max 5 locations
        if (state.savedLocations.length > 5) state.savedLocations.pop();
        localStorage.setItem('pt_locations', JSON.stringify(state.savedLocations));
        renderSavedLocations();
    }

    async function searchCity(cityName) {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`);
            const data = await res.json();
            if (data.length > 0) {
                state.lat = parseFloat(data[0].lat);
                state.lng = parseFloat(data[0].lon);
                state.city = data[0].display_name.split(',')[0];
                state.country = data[0].display_name.split(',').pop().trim();
                dom.cityName.textContent = state.city + ', ' + state.country;
                
                saveCurrentLocationToHistory();
                state.hijriCalData = null;
                
                await fetchPrayerTimes();
                calculateQibla();
                showToast(`📍 Showing times for ${state.city}`);
            } else {
                showToast('❌ City not found. Please try again.');
            }
        } catch {
            showToast('❌ Search failed. Check your connection.');
        }
    }

    function renderSavedLocations() {
        const list = $('savedLocationsList');
        if (!list) return;
        list.innerHTML = '';
        
        if (state.savedLocations.length === 0) {
            list.innerHTML = '<span style="color:var(--text-muted); font-size:0.8rem;">No saved locations yet.</span>';
            return;
        }

        state.savedLocations.forEach((loc, idx) => {
            const item = document.createElement('div');
            item.className = 'saved-loc-item' + (idx === 0 ? ' active' : '');
            
            const info = document.createElement('div');
            info.style.flex = '1';
            info.innerHTML = `<strong>${loc.city}</strong><br><span style="font-size:0.75rem; color:var(--text-muted);">${loc.country}</span>`;
            
            info.addEventListener('click', async () => {
                state.lat = loc.lat;
                state.lng = loc.lng;
                state.city = loc.city;
                state.country = loc.country;
                dom.cityName.textContent = state.city + (state.country ? ', ' + state.country : '');
                
                saveCurrentLocationToHistory();
                state.hijriCalData = null;
                closeLocManagerModal();
                await fetchPrayerTimes();
                calculateQibla();
                showToast(`📍 Switched to ${state.city}`);
            });

            const delBtn = document.createElement('button');
            delBtn.className = 'saved-loc-delete';
            delBtn.innerHTML = '✕';
            delBtn.title = 'Remove';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deleteLocation(loc.city);
            });

            item.appendChild(info);
            item.appendChild(delBtn);
            list.appendChild(item);
        });
    }

    function deleteLocation(cityName) {
        state.savedLocations = state.savedLocations.filter(l => l.city !== cityName);
        localStorage.setItem('pt_locations', JSON.stringify(state.savedLocations));
        
        // If we deleted current active location, try to load the previous one
        if (state.city === cityName) {
            state.savedLocations = []; // Force clear history so detectLocation starts fresh or picks next
            localStorage.setItem('pt_locations', JSON.stringify(state.savedLocations));
            detectLocation(); // This will auto-detect
        } else {
            renderSavedLocations();
        }
    }

    // Modal Handlers
    function openLocManagerModal() {
        renderSavedLocations();
        $('locationManagerModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    function closeLocManagerModal() {
        $('locationManagerModal').classList.remove('active');
        document.body.style.overflow = '';
    }

    // ─── Fetch Prayer Times ───
    async function fetchPrayerTimes() {
        if (!state.lat || !state.lng) return;
        try {
            const today = new Date();
            const dd = today.getDate(), mm = today.getMonth() + 1, yyyy = today.getFullYear();
            const url = `${API_BASE}/timings/${dd}-${mm}-${yyyy}?latitude=${state.lat}&longitude=${state.lng}&method=${state.method}&school=${state.school}&adj=${state.hijriOffset}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.code === 200) {
                state.todayTimings = data.data.timings;

                // Save current Hijri date for calendar
                const hijri = data.data.date.hijri;
                state.hijriMonth = parseInt(hijri.month.number);
                state.hijriYear = parseInt(hijri.year);
                dom.hijriDate.textContent = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;

                updatePrayerCards();
                startCountdown();

                document.querySelectorAll('.prayer-card').forEach(card => {
                    card.classList.add('fade-in');
                });
            }
        } catch (err) {
            console.error('Failed to fetch prayer times:', err);
            showToast('❌ Failed to load prayer times');
        }
    }

    // ─── Update Prayer Cards ───
    function updatePrayerCards() {
        if (!state.todayTimings) return;
        const now = new Date();
        let nextPrayer = null, currentPrayer = null;

        const timingsMap = {
            fajr: state.todayTimings.Fajr, sunrise: state.todayTimings.Sunrise,
            dhuhr: state.todayTimings.Dhuhr, asr: state.todayTimings.Asr,
            maghrib: state.todayTimings.Maghrib, isha: state.todayTimings.Isha
        };

        const parsedTimes = {};
        PRAYER_ORDER.forEach(key => {
            let baseTimeStr = timingsMap[key].split(' ')[0];
            let [h, m] = baseTimeStr.split(':').map(Number);
            
            // Use exact jamaat time if provided
            if (state.jamaatTimes[key]) {
                [h, m] = state.jamaatTimes[key].split(':').map(Number);
            }
            
            const d = new Date(now); 
            d.setHours(h, m, 0, 0);
            parsedTimes[key] = d;
        });

        for (let i = PRAYER_ORDER.length - 1; i >= 0; i--) {
            if (now >= parsedTimes[PRAYER_ORDER[i]]) {
                currentPrayer = PRAYER_ORDER[i];
                nextPrayer = i < PRAYER_ORDER.length - 1 ? PRAYER_ORDER[i + 1] : null;
                break;
            }
        }
        if (!currentPrayer) nextPrayer = 'fajr';
        if (currentPrayer === 'isha') nextPrayer = 'fajr';

        PRAYER_ORDER.forEach(key => {
            const card = document.getElementById(`card-${key}`);
            const timeEl = document.getElementById(`time-${key}`);
            const statusEl = document.getElementById(`status-${key}`);
            const isPassed = (currentPrayer && PRAYER_ORDER.indexOf(key) < PRAYER_ORDER.indexOf(currentPrayer));
            const isCurrent = (key === currentPrayer && key !== 'sunrise');
            const isNext = (key === nextPrayer);
            
            let displayTime = timingsMap[key].split(' ')[0];
            if (state.jamaatTimes[key]) {
                displayTime = state.jamaatTimes[key];
            }
            timeEl.textContent = formatTime(displayTime);
            card.classList.remove('active', 'next', 'passed');
            
            let statusText = "";
            if (isPassed) {
                card.classList.add('passed');
                statusText = state.appLang === 'hi' ? TRANSLATIONS.hi.passed : TRANSLATIONS.en.passed;
            } else if (isCurrent) {
                card.classList.add('active');
                statusText = state.appLang === 'hi' ? TRANSLATIONS.hi.current : TRANSLATIONS.en.current;
            } else if (isNext) {
                card.classList.add('next');
                statusText = state.appLang === 'hi' ? TRANSLATIONS.hi.next : TRANSLATIONS.en.next;
            }
            statusEl.textContent = statusText;
        });

        const badge = $('jamaatTimeBadge');
        const jamaatVal = $('jamaatTimeValue');

        if (nextPrayer) {
            const info = PRAYER_NAMES[nextPrayer];
            dom.prayerArabic.textContent = info.ar;
            dom.prayerEnglish.textContent = state.appLang === 'hi' ? info.hi : info.en;
            dom.currentPrayerLabel.textContent = state.appLang === 'hi' ? TRANSLATIONS.hi.nextPrayer : TRANSLATIONS.en.nextPrayer;
            
            let displayTime = timingsMap[nextPrayer].split(' ')[0];
            let rawNextTime = displayTime;
            
            // Always show badge so it is clickable
            badge.style.display = 'flex';
            
            if (state.jamaatTimes[nextPrayer]) {
                displayTime = state.jamaatTimes[nextPrayer];
                jamaatVal.textContent = formatTime(displayTime);
                dom.prayerTimeDisplay.textContent = formatTime(rawNextTime); // Show actual adhan time big
            } else {
                jamaatVal.textContent = "Not Set";
                dom.prayerTimeDisplay.textContent = formatTime(displayTime);
            }
        } else {
            dom.prayerArabic.textContent = PRAYER_NAMES.fajr.ar;
            dom.prayerEnglish.textContent = state.appLang === 'hi' ? PRAYER_NAMES.fajr.hi : PRAYER_NAMES.fajr.en;
            dom.currentPrayerLabel.textContent = state.appLang === 'hi' ? TRANSLATIONS.hi.nextPrayer : TRANSLATIONS.en.nextPrayer;
            badge.style.display = 'none';
        }

        // --- Secondary Times Update ---
        let imsakTime = state.jamaatTimes.imsak || (state.todayTimings.Imsak || state.todayTimings.Fajr).split(' ')[0];
        let tahajjudTime = state.jamaatTimes.tahajjud || (state.todayTimings.Lastthird || "02:00").split(' ')[0];
        if ($('time-imsak')) $('time-imsak').textContent = formatTime(imsakTime);
        if ($('time-tahajjud')) $('time-tahajjud').textContent = formatTime(tahajjudTime);
        
        // Calculate Ishraq (Sunrise + X mins)
        let [sh, sm] = state.todayTimings.Sunrise.split(' ')[0].split(':').map(Number);
        let ishraqDate = new Date();
        ishraqDate.setHours(sh, sm + state.ishraqOffset, 0, 0);
        let ishraqTime = state.jamaatTimes.ishraq;
        if (!ishraqTime) {
            let ishH = String(ishraqDate.getHours()).padStart(2, '0');
            let ishM = String(ishraqDate.getMinutes()).padStart(2, '0');
            ishraqTime = `${ishH}:${ishM}`;
        } else {
            let [h, m] = ishraqTime.split(':').map(Number);
            ishraqDate.setHours(h, m, 0, 0);
        }
        if ($('time-ishraq')) $('time-ishraq').textContent = formatTime(ishraqTime);
        parsedTimes['ishraq'] = ishraqDate; // save for makrooh check
        
        // Zawaal (Dhuhr - X mins)
        let [dh, dm] = state.todayTimings.Dhuhr.split(' ')[0].split(':').map(Number);
        let zawalDate = new Date();
        zawalDate.setHours(dh, dm - state.makroohOffset, 0, 0);
        let zawalTime = state.jamaatTimes.zawal;
        if (!zawalTime) {
            let zh = String(zawalDate.getHours()).padStart(2, '0');
            let zm = String(zawalDate.getMinutes()).padStart(2, '0');
            zawalTime = `${zh}:${zm}`;
        } else {
            let [h, m] = zawalTime.split(':').map(Number);
            zawalDate.setHours(h, m, 0, 0);
        }
        if ($('time-zawal')) $('time-zawal').textContent = formatTime(zawalTime);
        parsedTimes['zawal'] = zawalDate;

        // Also add manual overrides to parsedTimes for notifications (except Sunrise which is already parsed in PRAYER_ORDER loop)
        if (state.jamaatTimes.imsak) {
            let d = new Date(); let [h, m] = state.jamaatTimes.imsak.split(':').map(Number); d.setHours(h, m, 0, 0); parsedTimes['imsak'] = d;
        } else {
            let imsakDefault = state.todayTimings.Imsak || state.todayTimings.Fajr;
            let d = new Date(); let [h, m] = imsakDefault.split(' ')[0].split(':').map(Number); d.setHours(h, m, 0, 0); parsedTimes['imsak'] = d;
        }
        if (state.jamaatTimes.tahajjud) {
            let d = new Date(); let [h, m] = state.jamaatTimes.tahajjud.split(':').map(Number); d.setHours(h, m, 0, 0); parsedTimes['tahajjud'] = d;
        } else {
            let tahajjudDefault = state.todayTimings.Lastthird || "02:00";
            let d = new Date(); let [h, m] = tahajjudDefault.split(' ')[0].split(':').map(Number); d.setHours(h, m, 0, 0); parsedTimes['tahajjud'] = d;
        }

        state._nextPrayer = nextPrayer;
        state._parsedTimes = parsedTimes;
    }

    // ─── Countdown Timer ───
    function startCountdown() {
        if (state.countdownInterval) clearInterval(state.countdownInterval);

        function tick() {
            if (!state._nextPrayer || !state._parsedTimes) return;
            const now = new Date();
            let target = state._parsedTimes[state._nextPrayer];
            if (target <= now) { target = new Date(target); target.setDate(target.getDate() + 1); }
            const diff = target - now;
            
            // Makrooh Time Check
            if ($('makroohWarning')) {
                let isMakrooh = false;
                const pt = state._parsedTimes;
                
                // 1. Sunrise to Ishraq
                if (pt.sunrise && pt.ishraq && now >= pt.sunrise && now < pt.ishraq) isMakrooh = true;
                // 2. Zawaal (10 mins before Dhuhr)
                else if (pt.zawal && pt.dhuhr && now >= pt.zawal && now < pt.dhuhr) isMakrooh = true;
                // 3. X mins before Maghrib
                else if (pt.maghrib) {
                    let maghribMinus = new Date(pt.maghrib);
                    maghribMinus.setMinutes(maghribMinus.getMinutes() - state.makroohOffset);
                    if (now >= maghribMinus && now < pt.maghrib) isMakrooh = true;
                }
                
                $('makroohWarning').style.display = isMakrooh ? 'block' : 'none';
            }

            // Check for notifications
            checkNotification(now);

            if (diff <= 0) { fetchPrayerTimes(); return; }
            const ts = Math.floor(diff / 1000);
            dom.hoursValue.textContent = String(Math.floor(ts / 3600)).padStart(2, '0');
            dom.minutesValue.textContent = String(Math.floor((ts % 3600) / 60)).padStart(2, '0');
            dom.secondsValue.textContent = String(ts % 60).padStart(2, '0');
        }
        tick();
        state.countdownInterval = setInterval(tick, 1000);
        setInterval(updateBackgroundTheme, 60000);
    }

    // ─── Notifications ───
    function checkNotification(now) {
        const ALL_NOTIF_KEYS = [...PRAYER_ORDER, 'imsak', 'ishraq', 'zawal', 'tahajjud'];
        ALL_NOTIF_KEYS.forEach(key => {
            const targetTime = state._parsedTimes[key];
            if (!targetTime) return;
            
            // If it's exactly the minute of the prayer and we haven't notified yet today
            const diffSec = (now - targetTime) / 1000;
            const notifKey = `${key}-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
            
            if (diffSec >= 0 && diffSec < 60 && !state.notifiedPrayers[notifKey]) {
                if (state.notifyPrefs[key]) {
                    state.notifiedPrayers[notifKey] = true;
                    
                    let nameObj = PRAYER_NAMES[key] || { en: key };
                    let title = `It's time for ${nameObj.en}`;
                    if (state.jamaatTimes[key] && !['imsak', 'sunrise', 'ishraq', 'zawal', 'tahajjud'].includes(key)) {
                        title = `It's time for ${nameObj.en} Jamaat`;
                    }
                    
                    if (Notification.permission === 'granted') {
                        new Notification(title, {
                            body: `Prayer time in ${state.city}.`,
                            icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="80">🕌</text></svg>'
                        });
                    }
                    
                    playNotificationSound();
                }
            }
        });
    }

    function playNotificationSound() {
        const audioEl = $('notificationAudio');
        if (!audioEl || state.notifySound === 'system') return;
        
        if (state.notifySound === 'beep') {
            audioEl.src = 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg';
        } else if (state.notifySound === 'adhan') {
            audioEl.src = 'https://upload.wikimedia.org/wikipedia/commons/7/74/Adhan_Egypt.ogg';
        }
        
        audioEl.play().catch(e => console.log('Audio play blocked:', e));
    }

    // ─── Qibla Direction ───
    function calculateQibla() {
        if (!state.lat || !state.lng) return;
        const lat1 = toRad(state.lat), lng1 = toRad(state.lng);
        const lat2 = toRad(KAABA_LAT), lng2 = toRad(KAABA_LNG);
        const dLng = lng2 - lng1;
        let bearing = Math.atan2(Math.sin(dLng), Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLng));
        bearing = (toDeg(bearing) + 360) % 360;
        state.qiblaAngle = bearing;
        dom.qiblaDegrees.textContent = bearing.toFixed(1) + '°';
        
        // Initial set (if device orientation not active)
        if (!state.isCompassActive) {
            dom.compassNeedle.style.transform = `translate(-50%, -50%) rotate(${bearing}deg)`;
        }
    }

    function toRad(deg) { return deg * Math.PI / 180; }
    function toDeg(rad) { return rad * 180 / Math.PI; }
    
    function initDeviceCompass() {
        if (window.DeviceOrientationEvent) {
            if (typeof DeviceOrientationEvent.requestPermission === 'function') {
                DeviceOrientationEvent.requestPermission()
                    .then(permissionState => {
                        if (permissionState === 'granted') {
                            window.addEventListener('deviceorientation', handleOrientation);
                            state.isCompassActive = true;
                            $('enableCompassBtn').style.display = 'none';
                            showToast('🧭 Compass calibrated');
                        } else {
                            showToast('❌ Permission denied for compass');
                        }
                    })
                    .catch(console.error);
            } else {
                window.addEventListener('deviceorientation', handleOrientation);
                state.isCompassActive = true;
                $('enableCompassBtn').style.display = 'none';
                showToast('🧭 Compass active');
            }
        } else {
            showToast('❌ Compass not supported on this device');
        }
    }
    
    function handleOrientation(e) {
        let alpha = e.alpha;
        if (e.webkitCompassHeading) {
            alpha = e.webkitCompassHeading; // iOS
        } else {
            alpha = 360 - alpha; // Android
        }
        if (alpha === null) return;
        
        // Needle points to Qibla relative to North
        let rotation = state.qiblaAngle - alpha;
        dom.compassNeedle.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
        
        // Rotate the N/E/S/W ring
        const ring = document.querySelector('.compass-ring');
        ring.style.transform = `rotate(${-alpha}deg)`;
    }

    // ═══════════════════════════════════════════
    //  📅 CALENDAR MODAL
    // ═══════════════════════════════════════════

    function openCalendarModal() {
        renderCalendar();
        dom.calendarModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCalendarModal() {
        dom.calendarModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ─── Toggle English ↔ Urdu ───
    function toggleCalendarLang() {
        if (state.calMode === 'english') {
            state.calMode = 'urdu';
            dom.calLangText.textContent = 'English';
            dom.calLangToggle.classList.add('urdu-active');
            dom.calModalTitle.textContent = '📅 نماز کیلنڈر';
            document.querySelector('.calendar-modal').classList.add('urdu-mode');
        } else {
            state.calMode = 'english';
            dom.calLangText.textContent = 'اردو';
            dom.calLangToggle.classList.remove('urdu-active');
            dom.calModalTitle.textContent = '📅 Prayer Calendar';
            document.querySelector('.calendar-modal').classList.remove('urdu-mode');
        }
        renderCalendar();
    }

    // ─── Render Calendar ───
    async function renderCalendar() {
        if (state.calMode === 'english') {
            await renderGregorianCalendar();
        } else {
            await renderHijriCalendar();
        }
    }

    // ─── Gregorian Calendar ───
    async function renderGregorianCalendar() {
        const month = state.calMonth;
        const year = state.calYear;

        dom.calMonthName.textContent = MONTH_NAMES_EN[month];
        dom.calYear.textContent = year;

        // Weekdays
        dom.calWeekdays.innerHTML = WEEKDAYS_EN.map(d => `<span>${d}</span>`).join('');
        dom.calHint.textContent = '👆 Tap any date to see prayer times';

        const container = dom.calDays;
        container.innerHTML = '<div class="cal-loading" style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">Loading...</div>';

        let monthData = null;
        try {
            const url = `${API_BASE}/calendarByCity/${year}/${month + 1}?city=${state.city}&country=${state.country}&method=${state.method}&school=${state.school}&adj=${state.hijriOffset}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.code === 200) {
                monthData = data.data;
            }
        } catch (e) {
            console.error('Failed to fetch Gregorian calendar data:', e);
        }

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const today = new Date();
        const todayD = today.getDate(), todayM = today.getMonth(), todayY = today.getFullYear();

        container.innerHTML = '';

        // Previous month trailing days
        for (let i = firstDay - 1; i >= 0; i--) {
            const dayNum = daysInPrevMonth - i;
            const pm = month === 0 ? 11 : month - 1;
            const py = month === 0 ? year - 1 : year;
            const cell = createDayCell(dayNum, true, false, false, `${dayNum}-${pm + 1}-${py}`, 'gregorian');
            container.appendChild(cell);
        }

        // Current month days
        for (let d = 1; d <= daysInMonth; d++) {
            const isToday = (d === todayD && month === todayM && year === todayY);
            const dow = new Date(year, month, d).getDay();
            
            let holidays = [];
            if (monthData && monthData[d - 1] && monthData[d - 1].date.hijri.holidays) {
                holidays = monthData[d - 1].date.hijri.holidays;
            }
            
            const cell = createDayCell(d, false, isToday, dow === 5, `${d}-${month + 1}-${year}`, 'gregorian', holidays);
            container.appendChild(cell);
        }

        // Fill remaining cells
        const totalCells = firstDay + daysInMonth;
        const fill = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
        for (let d = 1; d <= fill; d++) {
            const nm = month === 11 ? 0 : month + 1;
            const ny = month === 11 ? year + 1 : year;
            const cell = createDayCell(d, true, false, false, `${d}-${nm + 1}-${ny}`, 'gregorian');
            container.appendChild(cell);
        }
    }

    // ─── Hijri Calendar ───
    async function renderHijriCalendar() {
        const hMonth = state.hijriMonth;
        const hYear = state.hijriYear;

        dom.calMonthName.textContent = HIJRI_MONTHS_UR[hMonth - 1];
        dom.calYear.textContent = toUrduNumber(hYear);

        // Urdu weekdays
        dom.calWeekdays.innerHTML = WEEKDAYS_UR.map(d => `<span>${d}</span>`).join('');
        dom.calHint.textContent = '👆 تاریخ پر کلک کریں نماز کے اوقات دیکھنے کے لیے';

        const container = dom.calDays;
        container.innerHTML = '<div class="cal-loading" style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">Loading...</div>';

        try {
            const url = `${API_BASE}/hijriCalendarByCity/${hYear}/${hMonth}?city=${state.city}&country=${state.country}&method=${state.method}&school=${state.school}&adj=${state.hijriOffset}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.code !== 200) throw new Error('API error');

            const days = data.data;
            state.hijriCalData = days; // cache for click lookups

            container.innerHTML = '';

            // Figure out the day-of-week of the 1st Hijri day using Gregorian equivalent
            const firstGreg = days[0].date.gregorian;
            const firstGregDate = new Date(
                parseInt(firstGreg.year),
                parseInt(firstGreg.month.number) - 1,
                parseInt(firstGreg.day)
            );
            const firstDow = firstGregDate.getDay(); // 0=Sun

            // Add empty cells for offset
            for (let i = 0; i < firstDow; i++) {
                const empty = document.createElement('div');
                empty.className = 'cal-day other-month';
                empty.textContent = '';
                empty.style.cursor = 'default';
                container.appendChild(empty);
            }

            // Today's Hijri date for highlighting
            const todayGreg = new Date();
            const todayStr = `${todayGreg.getDate()}-${todayGreg.getMonth() + 1}-${todayGreg.getFullYear()}`;

            // Render each Hijri day
            days.forEach((dayData, index) => {
                const hijriDay = parseInt(dayData.date.hijri.day);
                const gregDay = dayData.date.gregorian;
                const gregDateStr = `${parseInt(gregDay.day)}-${parseInt(gregDay.month.number)}-${gregDay.year}`;
                const gregDate = new Date(parseInt(gregDay.year), parseInt(gregDay.month.number) - 1, parseInt(gregDay.day));
                const isFriday = gregDate.getDay() === 5;
                const isToday = gregDateStr === todayStr;

                const cell = document.createElement('div');
                cell.className = 'cal-day';
                cell.textContent = toUrduNumber(hijriDay);
                if (isToday) cell.classList.add('today');
                if (isFriday) cell.classList.add('friday');

                const holidays = dayData.date.hijri.holidays;
                if (holidays && holidays.length > 0) {
                    const hSpan = document.createElement('div');
                    hSpan.className = 'cal-holiday';
                    hSpan.textContent = holidays.join(', ');
                    cell.appendChild(hSpan);
                    cell.style.position = 'relative';
                }

                // Store data for click
                cell.dataset.hijriIndex = index;
                cell.dataset.gregDate = gregDateStr;

                cell.addEventListener('click', () => {
                    document.querySelectorAll('.cal-day.selected').forEach(el => el.classList.remove('selected'));
                    cell.classList.add('selected');

                    // Use timings from the cached calendar data
                    const d = days[index];
                    openDatePrayerModalWithData(d);
                });

                container.appendChild(cell);
            });

        } catch (err) {
            console.error('Failed to fetch Hijri calendar:', err);
            container.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">❌ Failed to load Hijri calendar</div>';
        }
    }

    // ─── Create Day Cell (Gregorian) ───
    function createDayCell(dayNum, isOtherMonth, isToday, isFriday, dateStr, mode, holidays = []) {
        const cell = document.createElement('div');
        cell.className = 'cal-day';
        cell.textContent = dayNum;

        if (isOtherMonth) cell.classList.add('other-month');
        if (isToday) cell.classList.add('today');
        if (isFriday && !isOtherMonth) cell.classList.add('friday');
        
        if (holidays && holidays.length > 0) {
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

    // ═══════════════════════════════════════════
    //  🕌 DATE PRAYER TIMES POPUP
    // ═══════════════════════════════════════════

    // Open modal for Gregorian date (fetch from API)
    async function openDatePrayerModal(dateStr) {
        const [d, m, y] = dateStr.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);
        const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        const monthName = MONTH_NAMES_EN[m - 1];
        dom.dateModalTitle.textContent = `${weekday}, ${monthName} ${d}`;
        dom.dateModalSubtitle.textContent = `${d}/${m}/${y} • ${state.city}`;

        dom.datePrayerModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Loading state
        PRAYER_ORDER.forEach(key => {
            document.getElementById(`dp-time-${key}`).textContent = '...';
            document.getElementById(`dp-${key}`).classList.add('loading');
        });
        dom.dpHijriValue.textContent = 'Loading...';

        try {
            const url = `${API_BASE}/timings/${d}-${m}-${y}?latitude=${state.lat}&longitude=${state.lng}&method=${state.method}&school=${state.school}`;
            const res = await fetch(url);
            const data = await res.json();

            if (data.code === 200) {
                const t = data.data.timings;
                const h = data.data.date.hijri;
                const map = { fajr: t.Fajr, sunrise: t.Sunrise, dhuhr: t.Dhuhr, asr: t.Asr, maghrib: t.Maghrib, isha: t.Isha };

                PRAYER_ORDER.forEach(key => {
                    document.getElementById(`dp-time-${key}`).textContent = formatTime(map[key].split(' ')[0]);
                    document.getElementById(`dp-${key}`).classList.remove('loading');
                });
                dom.dpHijriValue.textContent = `${h.day} ${h.month.en} ${h.year} AH`;
            }
        } catch (err) {
            console.error('Failed to fetch date prayer times:', err);
            PRAYER_ORDER.forEach(key => {
                document.getElementById(`dp-time-${key}`).textContent = 'Error';
                document.getElementById(`dp-${key}`).classList.remove('loading');
            });
            dom.dpHijriValue.textContent = 'Error';
        }
    }

    // Open modal with data already available (from Hijri calendar cache)
    function openDatePrayerModalWithData(dayData) {
        const hijri = dayData.date.hijri;
        const greg = dayData.date.gregorian;
        const t = dayData.timings;

        // Title in Urdu style
        const hijriDay = hijri.day;
        const hijriMonthUr = HIJRI_MONTHS_UR[parseInt(hijri.month.number) - 1];

        dom.dateModalTitle.textContent = `${toUrduNumber(hijriDay)} ${hijriMonthUr} ${toUrduNumber(hijri.year)}`;
        dom.dateModalSubtitle.textContent = `${greg.day} ${greg.month.en} ${greg.year} • ${state.city}`;

        dom.datePrayerModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        const map = { fajr: t.Fajr, sunrise: t.Sunrise, dhuhr: t.Dhuhr, asr: t.Asr, maghrib: t.Maghrib, isha: t.Isha };

        PRAYER_ORDER.forEach(key => {
            document.getElementById(`dp-time-${key}`).textContent = formatTime(map[key].split(' ')[0]);
            document.getElementById(`dp-${key}`).classList.remove('loading');
        });

        dom.dpHijriValue.textContent = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
    }

    function closeDateModal() {
        dom.datePrayerModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ─── Time Formatting ───
    function formatTime(timeStr) {
        if (!timeStr || timeStr === '--:--') return '--:--';
        const [h, m] = timeStr.split(':').map(Number);
        if (state.use24h) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        const period = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${String(m).padStart(2, '0')} ${period}`;
    }

    // ─── Gregorian Date ───
    function updateGregorianDate() {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dom.gregorianDate.textContent = new Date().toLocaleDateString('en-US', options);
    }

    // ─── Settings ───
    function loadSettings() {
        dom.calcMethod.value = state.method;
        dom.schoolSelect.value = state.school;
        dom.timeFormat24.checked = state.use24h;
        if ($('hijriAdjustment')) $('hijriAdjustment').value = state.hijriOffset.toString();
        if ($('ishraqOffset')) $('ishraqOffset').value = state.ishraqOffset.toString();
        if ($('makroohOffset')) $('makroohOffset').value = state.makroohOffset.toString();
        if ($('notifyImsak')) $('notifyImsak').checked = state.notifyPrefs.imsak;
        if ($('notifyFajr')) $('notifyFajr').checked = state.notifyPrefs.fajr;
        if ($('notifySunrise')) $('notifySunrise').checked = state.notifyPrefs.sunrise;
        if ($('notifyIshraq')) $('notifyIshraq').checked = state.notifyPrefs.ishraq;
        if ($('notifyZawal')) $('notifyZawal').checked = state.notifyPrefs.zawal;
        if ($('notifyDhuhr')) $('notifyDhuhr').checked = state.notifyPrefs.dhuhr;
        if ($('notifyAsr')) $('notifyAsr').checked = state.notifyPrefs.asr;
        if ($('notifyMaghrib')) $('notifyMaghrib').checked = state.notifyPrefs.maghrib;
        if ($('notifyIsha')) $('notifyIsha').checked = state.notifyPrefs.isha;
        if ($('notifyTahajjud')) $('notifyTahajjud').checked = state.notifyPrefs.tahajjud;
        if ($('notifySound')) $('notifySound').value = state.notifySound;
        
        if (dom.offsetFajr) dom.offsetFajr.value = state.jamaatTimes.fajr || '';
        if (dom.offsetDhuhr) dom.offsetDhuhr.value = state.jamaatTimes.dhuhr || '';
        if (dom.offsetAsr) dom.offsetAsr.value = state.jamaatTimes.asr || '';
        if (dom.offsetMaghrib) dom.offsetMaghrib.value = state.jamaatTimes.maghrib || '';
        if (dom.offsetIsha) dom.offsetIsha.value = state.jamaatTimes.isha || '';
    }

    function saveSettings() {
        state.method = parseInt(dom.calcMethod.value);
        state.school = parseInt(dom.schoolSelect.value);
        state.use24h = dom.timeFormat24.checked;
        state.notifyPrefs = {
            imsak: $('notifyImsak') ? $('notifyImsak').checked : (state.notifyPrefs.imsak || false),
            fajr: $('notifyFajr') ? $('notifyFajr').checked : (state.notifyPrefs.fajr || false),
            sunrise: $('notifySunrise') ? $('notifySunrise').checked : (state.notifyPrefs.sunrise || false),
            ishraq: $('notifyIshraq') ? $('notifyIshraq').checked : (state.notifyPrefs.ishraq || false),
            zawal: $('notifyZawal') ? $('notifyZawal').checked : (state.notifyPrefs.zawal || false),
            dhuhr: $('notifyDhuhr') ? $('notifyDhuhr').checked : (state.notifyPrefs.dhuhr || false),
            asr: $('notifyAsr') ? $('notifyAsr').checked : (state.notifyPrefs.asr || false),
            maghrib: $('notifyMaghrib') ? $('notifyMaghrib').checked : (state.notifyPrefs.maghrib || false),
            isha: $('notifyIsha') ? $('notifyIsha').checked : (state.notifyPrefs.isha || false),
            tahajjud: $('notifyTahajjud') ? $('notifyTahajjud').checked : (state.notifyPrefs.tahajjud || false)
        };
        if ($('notifySound')) {
            state.notifySound = $('notifySound').value;
        }
        
        const anyNotifyEnabled = Object.values(state.notifyPrefs).some(v => v);
        if (anyNotifyEnabled && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }

        // We use state.jamaatTimes which is managed inline for Imsak/Sunrise/etc.
        // We only overwrite the ones managed in the settings quick modal.
        state.jamaatTimes.fajr = dom.offsetFajr.value || state.jamaatTimes.fajr || "";
        state.jamaatTimes.dhuhr = dom.offsetDhuhr.value || state.jamaatTimes.dhuhr || "";
        state.jamaatTimes.asr = dom.offsetAsr.value || state.jamaatTimes.asr || "";
        state.jamaatTimes.maghrib = dom.offsetMaghrib.value || state.jamaatTimes.maghrib || "";
        state.jamaatTimes.isha = dom.offsetIsha.value || state.jamaatTimes.isha || "";

        localStorage.setItem('pt_method', state.method);
        localStorage.setItem('pt_school', state.school);
        localStorage.setItem('pt_24h', state.use24h);
        localStorage.setItem('pt_notify_prefs', JSON.stringify(state.notifyPrefs));
        localStorage.setItem('pt_notify_sound', state.notifySound);
        localStorage.setItem('pt_jamaat_times', JSON.stringify(state.jamaatTimes));
        
        if ($('hijriAdjustment')) {
            state.hijriOffset = parseInt($('hijriAdjustment').value);
            localStorage.setItem('pt_hijri_adj', state.hijriOffset);
        }
        if ($('ishraqOffset')) {
            state.ishraqOffset = parseInt($('ishraqOffset').value) || 15;
            localStorage.setItem('pt_ishraq_offset', state.ishraqOffset);
        }
        if ($('makroohOffset')) {
            state.makroohOffset = parseInt($('makroohOffset').value) || 10;
            localStorage.setItem('pt_makrooh_offset', state.makroohOffset);
        }
        
        state.hijriCalData = null;
        closeSettingsModal();
        fetchPrayerTimes();
        showToast('✅ Settings saved!');
    }

    function openSettingsModal() {
        dom.settingsModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSettingsModal() {
        dom.settingsModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // ─── Inline Edit Time ───
    let currentEditingPrayer = null;
    function openEditTimeModal(prayerKey) {
        currentEditingPrayer = prayerKey;
        const info = PRAYER_NAMES[prayerKey] || { en: prayerKey, hi: prayerKey };
        let titleName = state.appLang === 'hi' ? info.hi : info.en;
        let isJamaat = !['imsak', 'sunrise', 'ishraq', 'zawal', 'tahajjud'].includes(prayerKey);
        $('editTimeTitle').textContent = isJamaat ? `Set Jamaat: ${titleName}` : `Set Time: ${titleName}`;
        $('editTimeInput').value = state.jamaatTimes[prayerKey] || '';
        $('editTimeModal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeEditTimeModal() {
        $('editTimeModal').classList.remove('active');
        document.body.style.overflow = '';
        currentEditingPrayer = null;
    }

    // ─── Toast ───
    function showToast(message) {
        dom.toastMessage.textContent = message;
        dom.toast.classList.add('show');
        setTimeout(() => { dom.toast.classList.remove('show'); }, 3000);
    }

    // ─── Event Bindings ───
    function bindEvents() {
        // Calendar button → open calendar modal
        $('calendarBtn').addEventListener('click', openCalendarModal);
        $('closeCalendarBtn').addEventListener('click', closeCalendarModal);
        dom.calendarModal.addEventListener('click', (e) => {
            if (e.target === dom.calendarModal) closeCalendarModal();
        });

        // Language toggle
        dom.calLangToggle.addEventListener('click', toggleCalendarLang);

        // Location button
        $('locationBtn').addEventListener('click', () => { detectLocation(); });

        // Settings
        $('settingsBtn').addEventListener('click', openSettingsModal);
        $('closeSettingsBtn').addEventListener('click', closeSettingsModal);
        $('saveSettingsBtn').addEventListener('click', saveSettings);
        dom.settingsModal.addEventListener('click', (e) => {
            if (e.target === dom.settingsModal) closeSettingsModal();
        });

        // Notify Select All logic
        if ($('notifySelectAllBtn')) {
            $('notifySelectAllBtn').addEventListener('click', () => {
                const checkboxes = dom.settingsModal.querySelectorAll('.setting-checkbox');
                let allChecked = Array.from(checkboxes).every(cb => cb.checked);
                checkboxes.forEach(cb => cb.checked = !allChecked);
                $('notifySelectAllBtn').textContent = !allChecked ? 'Disable All' : 'Enable All';
            });
        }

        // Date prayer modal close
        $('closeDateModalBtn').addEventListener('click', closeDateModal);
        dom.datePrayerModal.addEventListener('click', (e) => {
            if (e.target === dom.datePrayerModal) closeDateModal();
        });

        // City search
        $('searchCityBtn').addEventListener('click', () => {
            const city = dom.manualCity.value.trim();
            if (city) { searchCity(city); closeSettingsModal(); }
        });
        dom.manualCity.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const city = dom.manualCity.value.trim();
                if (city) { searchCity(city); closeSettingsModal(); }
            }
        });

        // Month navigation
        $('prevMonthBtn').addEventListener('click', () => {
            if (state.calMode === 'english') {
                state.calMonth--;
                if (state.calMonth < 0) { state.calMonth = 11; state.calYear--; }
            } else {
                state.hijriMonth--;
                if (state.hijriMonth < 1) { state.hijriMonth = 12; state.hijriYear--; }
                state.hijriCalData = null;
            }
            renderCalendar();
        });

        $('nextMonthBtn').addEventListener('click', () => {
            if (state.calMode === 'english') {
                state.calMonth++;
                if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; }
            } else {
                state.hijriMonth++;
                if (state.hijriMonth > 12) { state.hijriMonth = 1; state.hijriYear++; }
                state.hijriCalData = null;
            }
            renderCalendar();
        });
        
        // Inline Edit Time Modal Logic
        document.querySelectorAll('.prayer-card, .sec-time-item').forEach(card => {
            const prayerKey = card.getAttribute('data-prayer') || (card.id === 'card-sunrise' ? 'sunrise' : null) || card.getAttribute('data-sec');
            if (prayerKey) {
                card.style.cursor = 'pointer';
                card.title = 'Click to edit time';
                card.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openEditTimeModal(prayerKey);
                });
            }
        });

        $('closeEditTimeBtn').addEventListener('click', closeEditTimeModal);
        $('editTimeModal').addEventListener('click', (e) => {
            if (e.target === $('editTimeModal')) closeEditTimeModal();
        });

        $('saveTimeBtn').addEventListener('click', () => {
            if (currentEditingPrayer) {
                state.jamaatTimes[currentEditingPrayer] = $('editTimeInput').value;
                localStorage.setItem('pt_jamaat_times', JSON.stringify(state.jamaatTimes));
                updatePrayerCards();
                startCountdown();
                closeEditTimeModal();
                showToast('✅ Jamaat time updated');
            }
        });

        $('resetTimeBtn').addEventListener('click', () => {
            if (currentEditingPrayer) {
                state.jamaatTimes[currentEditingPrayer] = '';
                localStorage.setItem('pt_jamaat_times', JSON.stringify(state.jamaatTimes));
                updatePrayerCards();
                startCountdown();
                closeEditTimeModal();
                showToast('🔄 Reset to default time');
            }
        });

        $('jamaatTimeBadge').addEventListener('click', (e) => {
            e.stopPropagation();
            if (state._nextPrayer) openEditTimeModal(state._nextPrayer);
        });

        // Compass enable
        $('enableCompassBtn').addEventListener('click', initDeviceCompass);
        
        // Next Prayer Hero Card Click
        $('heroCard').addEventListener('click', () => {
            const today = new Date();
            const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
            openDatePrayerModal(dateStr);
        });

        // Theme Toggle
        $('themeToggleBtn').addEventListener('click', toggleTheme);

        // Location Manager Modal
        $('closeLocManagerBtn').addEventListener('click', closeLocManagerModal);
        $('locationManagerModal').addEventListener('click', (e) => {
            if (e.target === $('locationManagerModal')) closeLocManagerModal();
        });
        $('locManagerSearchBtn').addEventListener('click', () => {
            const city = $('locManagerSearchInput').value.trim();
            if (city) {
                searchCity(city);
                closeLocManagerModal();
                $('locManagerSearchInput').value = '';
            }
        });
        $('locManagerSearchInput').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const city = $('locManagerSearchInput').value.trim();
                if (city) {
                    searchCity(city);
                    closeLocManagerModal();
                    $('locManagerSearchInput').value = '';
                }
            }
        });

        // Location Display Long Press & Click
        const locWrapper = $('locationDisplayWrapper');
        const locMenu = $('locationContextMenu');
        
        locWrapper.addEventListener('pointerdown', (e) => {
            if (e.target.closest('.location-context-menu')) return; // ignore clicks inside menu
            state.longPressTimer = setTimeout(() => {
                locMenu.style.display = 'flex';
                state.longPressTimer = null;
            }, 800); // 800ms hold
        });

        locWrapper.addEventListener('pointerup', (e) => {
            if (e.target.closest('.location-context-menu')) return;
            if (state.longPressTimer) {
                // Short click
                clearTimeout(state.longPressTimer);
                openLocManagerModal();
            }
        });

        locWrapper.addEventListener('pointerleave', () => {
            if (state.longPressTimer) clearTimeout(state.longPressTimer);
        });

        // Context Menu Buttons
        $('cancelLocationBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            locMenu.style.display = 'none';
        });

        $('deleteLocationBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            locMenu.style.display = 'none';
            deleteLocation(state.city);
            showToast('🗑️ Location deleted');
        });

        // Hide context menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!locWrapper.contains(e.target)) {
                locMenu.style.display = 'none';
            }
        });

        // Jamaat Quick Edit Modal
        $('jamaatTimeBadge').addEventListener('click', (e) => {
            e.stopPropagation(); // prevent hero card click
            
            // Load current offsets into quick edit modal
            $('quickOffsetFajr').value = state.jamaatTimes.fajr || '';
            $('quickOffsetDhuhr').value = state.jamaatTimes.dhuhr || '';
            $('quickOffsetAsr').value = state.jamaatTimes.asr || '';
            $('quickOffsetMaghrib').value = state.jamaatTimes.maghrib || '';
            $('quickOffsetIsha').value = state.jamaatTimes.isha || '';
            
            $('jamaatEditModal').classList.add('active');
            document.body.style.overflow = 'hidden';
        });

        function closeJamaatModal() {
            $('jamaatEditModal').classList.remove('active');
            document.body.style.overflow = '';
        }

        $('closeJamaatEditBtn').addEventListener('click', closeJamaatModal);
        $('jamaatEditModal').addEventListener('click', (e) => {
            if (e.target === $('jamaatEditModal')) closeJamaatModal();
        });

        $('saveJamaatEditBtn').addEventListener('click', () => {
            state.jamaatTimes = {
                fajr: $('quickOffsetFajr').value || "",
                dhuhr: $('quickOffsetDhuhr').value || "",
                asr: $('quickOffsetAsr').value || "",
                maghrib: $('quickOffsetMaghrib').value || "",
                isha: $('quickOffsetIsha').value || ""
            };
            localStorage.setItem('pt_jamaat_times', JSON.stringify(state.jamaatTimes));
            
            // update main settings modal inputs to keep in sync
            if (dom.offsetFajr) {
                dom.offsetFajr.value = state.jamaatTimes.fajr;
                dom.offsetDhuhr.value = state.jamaatTimes.dhuhr;
                dom.offsetAsr.value = state.jamaatTimes.asr;
                dom.offsetMaghrib.value = state.jamaatTimes.maghrib;
                dom.offsetIsha.value = state.jamaatTimes.isha;
            }

            closeJamaatModal();
            updatePrayerCards();
            showToast('✅ Jamaat offsets saved!');
        });

        // Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeSettingsModal();
                closeDateModal();
                closeCalendarModal();
                closeLocManagerModal();
                closeJamaatModal();
                locMenu.style.display = 'none';
            }
        });
    }

    // ─── Custom PWA Install Prompt ───
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent default browser prompt
        e.preventDefault();
        deferredPrompt = e;
        
        // Show our custom modal if they haven't dismissed it
        const installModal = $('installPromptModal');
        if (installModal && !localStorage.getItem('pt_pwa_dismissed')) {
            setTimeout(() => {
                installModal.classList.add('active');
            }, 2500); // Wait 2.5s before showing popup
        }
    });

    window.addEventListener('appinstalled', () => {
        // Hide the prompt if they install it through other means
        if($('installPromptModal')) $('installPromptModal').classList.remove('active');
        deferredPrompt = null;
    });

    if ($('cancelInstallBtn')) {
        $('cancelInstallBtn').addEventListener('click', () => {
            $('installPromptModal').classList.remove('active');
            localStorage.setItem('pt_pwa_dismissed', 'true'); // don't ask again
        });
    }

    if ($('confirmInstallBtn')) {
        $('confirmInstallBtn').addEventListener('click', async () => {
            $('installPromptModal').classList.remove('active');
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                deferredPrompt = null;
            }
        });
    }

    // ─── Start App ───
    document.addEventListener('DOMContentLoaded', init);

})();
