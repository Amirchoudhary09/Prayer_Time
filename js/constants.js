/* ============================================================
   📖 constants.js — All fixed data: names, translations, duas
   ============================================================ */

export const API_BASE = 'https://api.aladhan.com/v1';
export const KAABA_LAT = 21.4225;
export const KAABA_LNG = 39.8262;

export const PRAYER_ORDER = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

export const PRAYER_NAMES = {
    fajr:     { en: 'Fajr',    ar: 'الفجر',    hi: 'फ़ज्र',     fr: 'Fajr',             ur: 'فجر',          bn: 'ফজর',     id: 'Subuh',   tr: 'İmsak'   },
    sunrise:  { en: 'Sunrise', ar: 'الشروق',   hi: 'सूर्योदय', fr: 'Lever du soleil',  ur: 'طلوع آفتاب',   bn: 'সূর্যোদয়', id: 'Syuruk', tr: 'Güneş'   },
    dhuhr:    { en: 'Dhuhr',   ar: 'الظهر',    hi: 'ज़ुहर',    fr: 'Dhuhr',            ur: 'ظہر',          bn: 'যোহর',    id: 'Zuhur',   tr: 'Öğle'    },
    asr:      { en: 'Asr',     ar: 'العصر',    hi: 'अस्र',     fr: 'Asr',              ur: 'عصر',          bn: 'আসর',    id: 'Asar',    tr: 'İkindi'  },
    maghrib:  { en: 'Maghrib', ar: 'المغرب',   hi: 'मग़रिब',   fr: 'Maghrib',          ur: 'مغرب',         bn: 'মাগরিব', id: 'Maghrib', tr: 'Akşam'   },
    isha:     { en: 'Isha',    ar: 'العشاء',   hi: 'ईशा',      fr: 'Isha',             ur: 'عشاء',         bn: 'এশা',    id: 'Isya',    tr: 'Yatsı'   },
    imsak:    { en: 'Imsak',   ar: 'الإمساك',  hi: 'इमसाक',   fr: 'Imsak',            ur: 'اِمساک',       bn: 'ইমসাক',  id: 'Imsak',   tr: 'İmsak'   },
    ishraq:   { en: 'Ishraq',  ar: 'الإشراق',  hi: 'इशराक़',  fr: 'Ishraq',           ur: 'اِشراق',       bn: 'ইশরাক', id: 'Isyraq',  tr: 'İşrâk'   },
    zawal:    { en: 'Zawaal',  ar: 'الزوال',   hi: 'ज़वाल',   fr: 'Zaoual',           ur: 'زوال',         bn: 'যোহরের পূর্ব', id: 'Zawaal', tr: 'Zevalî' },
    tahajjud: { en: 'Tahajjud',ar: 'التهجد',  hi: 'तहज्जुद', fr: 'Tahajjud',         ur: 'تہجد',         bn: 'তাহাজ্জুদ', id: 'Tahajjud', tr: 'Teheccüd' }
};

export const MONTH_NAMES_EN = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
];

export const WEEKDAYS_EN = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
export const WEEKDAYS_UR = ['اتوار','پیر','منگل','بدھ','جمعرات','جمعہ','ہفتہ'];

export const HIJRI_MONTHS_UR = [
    'محرم','صفر','ربیع الاول','ربیع الثانی',
    'جمادی الاول','جمادی الثانی','رجب','شعبان',
    'رمضان','شوال','ذوالقعدہ','ذوالحجہ'
];

export const URDU_DIGITS = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];

export function toUrduNumber(num) {
    return String(num).split('').map(d => URDU_DIGITS[parseInt(d)] || d).join('');
}

export const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English',    native: 'English'          },
    { code: 'hi', name: 'Hindi',      native: 'हिन्दी'           },
    { code: 'ar', name: 'Arabic',     native: 'العربية'          },
    { code: 'fr', name: 'French',     native: 'Français'         },
    { code: 'ur', name: 'Urdu',       native: 'اردو'             },
    { code: 'bn', name: 'Bengali',    native: 'বাংলা'            },
    { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia'  },
    { code: 'tr', name: 'Turkish',    native: 'Türkçe'           }
];

export const TRANSLATIONS = {
    en: {
        appTitle:'Prayer Times', todayPrayers:"Today's Prayer Times", nextPrayer:'Next Prayer',
        passed:'PASSED', current:'CURRENT', next:'NEXT', qiblaTitle:'Qibla Direction',
        enableCompass:'Enable Device Compass', settingsTitle:'Settings', themeTitle:'Theme Mode',
        calcMethodTitle:'Calculation Method', schoolTitle:'Juristic School (Asr)',
        schoolShafii:"Shafi'i / Maliki / Hanbali", schoolHanafi:'Hanafi',
        manualCityTitle:'Manual City Search', searchCityBtn:'Search City',
        notifPrefsTitle:'Notification Preferences', enableAllBtn:'Enable All',
        notifSoundTitle:'Notification Sound', sysDefault:'System Default',
        shortBeep:'Short Beep', adhanMakkah:'Adhan (Makkah)',
        manualOffsetTitle:'Manual Prayer Time Offsets (Jamaat Time)', use24hTitle:'Use 24-hour format',
        saveSettingsBtn:'Save Settings', calModalTitle:'📅 Prayer Calendar',
        calHintText:'👆 Tap any date to see prayer times',
        hours:'Hours', minutes:'Minutes', seconds:'Seconds',
        installAppTitle:'Install App', installAppDesc:'Install this application on your device for a better, faster, and offline experience.',
        notNowBtn:'Not Now', installBtn:'Install',
        imsakTime:'Imsak (Sehri)', ishraqTime:'Ishraq', zawalTime:'Zawaal', tahajjudTime:'Tahajjud',
        ishraqOffsetTitle:'Ishraq Offset (mins after Sunrise)',
        zawalOffsetTitle:'Makrooh Window (mins before Dhuhr/Maghrib)',
        hijriAdjTitle:'Hijri Date Adjustment', makroohWarningText:'Makrooh (Prohibited) Time for Prayer',
        selectLanguage:'Select Language', searchLanguage:'Search language...'
    },
    hi: {
        appTitle:'नमाज़ का समय', todayPrayers:'आज के नमाज़ का समय', nextPrayer:'अगली नमाज़',
        passed:'हो गई', current:'अभी', next:'अगली', qiblaTitle:'क़िबला की दिशा',
        enableCompass:'कम्पास चालू करें', settingsTitle:'सेटिंग्स', themeTitle:'थीम मोड',
        calcMethodTitle:'गणना का तरीका', schoolTitle:'न्यायवादी स्कूल (अस्र)',
        schoolShafii:'शफ़ीई / मालिकी / हनबली', schoolHanafi:'हनफ़ी',
        manualCityTitle:'मैन्युअल शहर खोज', searchCityBtn:'शहर खोजें',
        notifPrefsTitle:'सूचना प्राथमिकताएं', enableAllBtn:'सभी चालू करें',
        notifSoundTitle:'सूचना की आवाज़', sysDefault:'सिस्टम डिफ़ॉल्ट',
        shortBeep:'छोटी बीप', adhanMakkah:'अज़ान (मक्का)',
        manualOffsetTitle:'मैन्युअल नमाज़ का समय', use24hTitle:'24 घंटे का प्रारूप',
        saveSettingsBtn:'सहेजें', calModalTitle:'📅 नमाज़ कैलेंडर',
        calHintText:'तारीख पर टैप करें', hours:'घंटे', minutes:'मिनट', seconds:'सेकंड',
        installAppTitle:'ऐप इंस्टॉल करें', installAppDesc:'बेहतर और तेज़ अनुभव के लिए ऐप इंस्टॉल करें।',
        notNowBtn:'अभी नहीं', installBtn:'इंस्टॉल करें',
        imsakTime:'इमसाक (सहरी)', ishraqTime:'इशराक़', zawalTime:'ज़वाल', tahajjudTime:'तहज्जुद',
        ishraqOffsetTitle:'इशराक़ ऑफ़सेट (सूर्योदय के बाद मिनट)',
        zawalOffsetTitle:'मकरूह विंडो (ज़ुहर/मग़रिब से पहले मिनट)',
        hijriAdjTitle:'हिजरी तारीख समायोजन', makroohWarningText:'मकरूह (निषिद्ध) नमाज़ का समय',
        selectLanguage:'भाषा चुनें', searchLanguage:'भाषा खोजें...'
    },
    ar: {
        appTitle:'أوقات الصلاة', todayPrayers:'أوقات صلاة اليوم', nextPrayer:'الصلاة القادمة',
        passed:'انقضت', current:'الآن', next:'التالي', qiblaTitle:'اتجاه القبلة',
        enableCompass:'تفعيل البوصلة', settingsTitle:'الإعدادات', themeTitle:'وضع المظهر',
        calcMethodTitle:'طريقة الحساب', schoolTitle:'المذهب الفقهي (العصر)',
        schoolShafii:'شافعي / مالكي / حنبلي', schoolHanafi:'حنفي',
        manualCityTitle:'البحث اليدوي عن المدينة', searchCityBtn:'بحث',
        notifPrefsTitle:'إعدادات الإشعارات', enableAllBtn:'تفعيل الكل',
        notifSoundTitle:'صوت الإشعار', sysDefault:'النظام الافتراضي',
        shortBeep:'صوت قصير', adhanMakkah:'أذان (مكة)',
        manualOffsetTitle:'إعدادات يدوية', use24hTitle:'نظام 24 ساعة',
        saveSettingsBtn:'حفظ', calModalTitle:'📅 تقويم الصلاة',
        calHintText:'اضغط على أي تاريخ', hours:'ساعات', minutes:'دقائق', seconds:'ثواني',
        installAppTitle:'تثبيت التطبيق', installAppDesc:'قم بتثبيت هذا التطبيق على جهازك.',
        notNowBtn:'ليس الآن', installBtn:'تثبيت',
        imsakTime:'الإمساك (السحور)', ishraqTime:'الإشراق', zawalTime:'الزوال', tahajjudTime:'التهجد',
        ishraqOffsetTitle:'دقائق الإشراق بعد الشروق', zawalOffsetTitle:'دقائق المكروه قبل الظهر',
        hijriAdjTitle:'تعديل التاريخ الهجري', makroohWarningText:'وقت مكروه للصلاة',
        selectLanguage:'اختر اللغة', searchLanguage:'البحث عن لغة...'
    },
    fr: {
        appTitle:'Heures de Prière', todayPrayers:"Heures d'Aujourd'hui", nextPrayer:'Prochaine Prière',
        passed:'PASSÉ', current:'EN COURS', next:'SUIVANT', qiblaTitle:'Direction de la Qibla',
        enableCompass:'Activer la boussole', settingsTitle:'Paramètres', themeTitle:'Mode Thème',
        calcMethodTitle:'Méthode de calcul', schoolTitle:'École Juridique',
        schoolShafii:"Shafi'i / Maliki / Hanbali", schoolHanafi:'Hanafi',
        manualCityTitle:'Recherche manuelle', searchCityBtn:'Rechercher',
        notifPrefsTitle:'Préférences de notification', enableAllBtn:'Tout activer',
        notifSoundTitle:'Son de notification', sysDefault:'Défaut',
        shortBeep:'Bip court', adhanMakkah:'Adhan (Makkah)',
        manualOffsetTitle:'Décalages manuels', use24hTitle:'Format 24h',
        saveSettingsBtn:'Sauvegarder', calModalTitle:'📅 Calendrier',
        calHintText:'Appuyez sur une date', hours:'Heures', minutes:'Minutes', seconds:'Secondes',
        installAppTitle:"Installer l'App", installAppDesc:'Installez cette application pour une expérience plus rapide.',
        notNowBtn:'Pas maintenant', installBtn:'Installer',
        imsakTime:'Imsak (Sahur)', ishraqTime:'Ishraq', zawalTime:'Zaoual', tahajjudTime:'Tahajjud',
        ishraqOffsetTitle:'Décalage Ishraq (min après Lever)', zawalOffsetTitle:'Fenêtre Makrooh (min avant Dhuhr)',
        hijriAdjTitle:'Ajustement de la date hijri', makroohWarningText:'Temps makrooh (interdit) pour la prière',
        selectLanguage:'Choisir la langue', searchLanguage:'Rechercher une langue...'
    },
    ur: {
        appTitle:'نماز کے اوقات', todayPrayers:'آج کے اوقات', nextPrayer:'اگلی نماز',
        passed:'گزر گئی', current:'ابھی', next:'اگلی', qiblaTitle:'قبلہ کی سمت',
        enableCompass:'قطب نما آن کریں', settingsTitle:'ترتیبات', themeTitle:'تھیم',
        calcMethodTitle:'حساب کا طریقہ', schoolTitle:'فقہی مسلک',
        schoolShafii:'شافعی / مالکی / حنبلی', schoolHanafi:'حنفی',
        manualCityTitle:'شہر تلاش کریں', searchCityBtn:'تلاش',
        notifPrefsTitle:'اطلاعات', enableAllBtn:'سب آن کریں',
        notifSoundTitle:'آواز', sysDefault:'سسٹم',
        shortBeep:'چھوٹی بیپ', adhanMakkah:'اذان (مکہ)',
        manualOffsetTitle:'جماعت کا وقت', use24hTitle:'24 گھنٹے کا وقت',
        saveSettingsBtn:'محفوظ کریں', calModalTitle:'📅 کیلنڈر',
        calHintText:'تاریخ پر کلک کریں', hours:'گھنٹے', minutes:'منٹ', seconds:'سیکنڈ',
        installAppTitle:'ایپ انسٹال کریں', installAppDesc:'بہتر اور تیز تجربے کے لیے ایپ انسٹال کریں۔',
        notNowBtn:'ابھی نہیں', installBtn:'انسٹال کریں',
        imsakTime:'اِمساک (سحری)', ishraqTime:'اِشراق', zawalTime:'زوال', tahajjudTime:'تہجد',
        ishraqOffsetTitle:'اِشراق آفسیٹ (طلوع کے بعد منٹ)', zawalOffsetTitle:'مکروہ وقت (ظہر/مغرب سے پہلے)',
        hijriAdjTitle:'ہجری تاریخ ایڈجسٹمنٹ', makroohWarningText:'مکروہ وقت برائے نماز',
        selectLanguage:'زبان منتخب کریں', searchLanguage:'زبان تلاش کریں...'
    },
    bn: {
        appTitle:'নামাজের সময়', todayPrayers:'আজকের নামাজের সময়', nextPrayer:'পরবর্তী নামাজ',
        passed:'অতীত', current:'বর্তমান', next:'পরবর্তী', qiblaTitle:'কিবলার দিক',
        enableCompass:'কম্পাস চালু করুন', settingsTitle:'সেটিংস', themeTitle:'থিম',
        calcMethodTitle:'গণনার পদ্ধতি', schoolTitle:'মাযহাব (আসর)',
        schoolShafii:'শাফিঈ / মালিকি / হাম্বলি', schoolHanafi:'হানাফি',
        manualCityTitle:'শহর খুঁজুন', searchCityBtn:'খুঁজুন',
        notifPrefsTitle:'বিজ্ঞপ্তি সেটিংস', enableAllBtn:'সব চালু করুন',
        notifSoundTitle:'বিজ্ঞপ্তির শব্দ', sysDefault:'ডিফল্ট',
        shortBeep:'ছোট বিপ', adhanMakkah:'আজান (মক্কা)',
        manualOffsetTitle:'ম্যানুয়াল সময়', use24hTitle:'২৪ ঘন্টা বিন্যাস',
        saveSettingsBtn:'সংরক্ষণ করুন', calModalTitle:'📅 ক্যালেন্ডার',
        calHintText:'তারিখে ট্যাপ করুন', hours:'ঘন্টা', minutes:'মিনিট', seconds:'সেকেন্ড',
        installAppTitle:'অ্যাপ ইনস্টল করুন', installAppDesc:'উন্নত অভিজ্ঞতার জন্য অ্যাপ ইনস্টল করুন।',
        notNowBtn:'এখন না', installBtn:'ইনস্টল করুন',
        imsakTime:'ইমসাক (সেহেরি)', ishraqTime:'ইশরাক', zawalTime:'যোহরের পূর্ব', tahajjudTime:'তাহাজ্জুদ',
        ishraqOffsetTitle:'ইশরাক অফসেট (সূর্যোদয়ের পর মিনিট)', zawalOffsetTitle:'মাকরুহ উইন্ডো (মিনিট)',
        hijriAdjTitle:'হিজরি তারিখ সামঞ্জস্য', makroohWarningText:'মাকরুহ সময় নামাজের জন্য',
        selectLanguage:'ভাষা নির্বাচন করুন', searchLanguage:'ভাষা খুঁজুন...'
    },
    id: {
        appTitle:'Waktu Shalat', todayPrayers:'Waktu Shalat Hari Ini', nextPrayer:'Shalat Berikutnya',
        passed:'LEWAT', current:'SEKARANG', next:'SELANJUTNYA', qiblaTitle:'Arah Kiblat',
        enableCompass:'Aktifkan Kompas', settingsTitle:'Pengaturan', themeTitle:'Tema',
        calcMethodTitle:'Metode Perhitungan', schoolTitle:'Mazhab (Ashar)',
        schoolShafii:"Syafi'i / Maliki / Hambali", schoolHanafi:'Hanafi',
        manualCityTitle:'Cari Kota', searchCityBtn:'Cari',
        notifPrefsTitle:'Notifikasi', enableAllBtn:'Aktifkan Semua',
        notifSoundTitle:'Suara Notifikasi', sysDefault:'Default',
        shortBeep:'Bip Pendek', adhanMakkah:'Adzan (Makkah)',
        manualOffsetTitle:'Waktu Jamaah', use24hTitle:'Format 24 Jam',
        saveSettingsBtn:'Simpan', calModalTitle:'📅 Kalender',
        calHintText:'Ketuk tanggal', hours:'Jam', minutes:'Menit', seconds:'Detik',
        installAppTitle:'Instal Aplikasi', installAppDesc:'Instal aplikasi ini untuk pengalaman yang lebih baik.',
        notNowBtn:'Nanti saja', installBtn:'Instal',
        imsakTime:'Imsak (Sahur)', ishraqTime:'Isyraq', zawalTime:'Zawaal', tahajjudTime:'Tahajjud',
        ishraqOffsetTitle:'Offset Isyraq (menit setelah Syuruk)', zawalOffsetTitle:'Jendela Makruh (menit)',
        hijriAdjTitle:'Penyesuaian Tanggal Hijri', makroohWarningText:'Waktu Makruh untuk Shalat',
        selectLanguage:'Pilih Bahasa', searchLanguage:'Cari bahasa...'
    },
    tr: {
        appTitle:'Namaz Vakitleri', todayPrayers:'Bugünün Vakitleri', nextPrayer:'Sonraki Vakit',
        passed:'GEÇTİ', current:'ŞU AN', next:'SONRAKİ', qiblaTitle:'Kıble Yönü',
        enableCompass:'Pusulayı Aç', settingsTitle:'Ayarlar', themeTitle:'Tema',
        calcMethodTitle:'Hesaplama Yöntemi', schoolTitle:'Mezhep (İkindi)',
        schoolShafii:'Şafii / Maliki / Hanbeli', schoolHanafi:'Hanefi',
        manualCityTitle:'Şehir Ara', searchCityBtn:'Ara',
        notifPrefsTitle:'Bildirimler', enableAllBtn:'Tümünü Aç',
        notifSoundTitle:'Bildirim Sesi', sysDefault:'Varsayılan',
        shortBeep:'Kısa Bip', adhanMakkah:'Ezan (Mekke)',
        manualOffsetTitle:'Cemaat Vakti', use24hTitle:'24 Saat Formatı',
        saveSettingsBtn:'Kaydet', calModalTitle:'📅 Takvim',
        calHintText:'Tarihe dokunun', hours:'Saat', minutes:'Dakika', seconds:'Saniye',
        installAppTitle:'Uygulamayı Yükle', installAppDesc:'Daha iyi ve çevrimdışı kullanım için uygulamayı yükleyin.',
        notNowBtn:'Şimdi Değil', installBtn:'Yükle',
        imsakTime:'İmsak (Sahur)', ishraqTime:'İşrâk', zawalTime:'Zevalî', tahajjudTime:'Teheccüd',
        ishraqOffsetTitle:'İşrâk Offseti (Güneş doğumundan dakika sonra)', zawalOffsetTitle:'Mekruh Penceresi (dakika)',
        hijriAdjTitle:'Hicri Tarih Ayarı', makroohWarningText:'Namaz İçin Mekruh Vakit',
        selectLanguage:'Dil Seç', searchLanguage:'Dil ara...'
    }
};

export const DAILY_DUAS = [
    { ar:'رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ', en:'"Our Lord, accept from us. Indeed You are the Hearing, the Knowing."', ref:'Quran 2:127' },
    { ar:'رَبِّ إِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي', en:'"My Lord, I have wronged myself, so forgive me."', ref:'Quran 28:16' },
    { ar:'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', en:'"Our Lord, give us good in this world and good in the Hereafter and protect us from the Fire."', ref:'Quran 2:201' },
    { ar:'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ', en:'"Sufficient for us is Allah, and He is the best Disposer of affairs."', ref:'Quran 3:173' },
    { ar:'رَبِّ زِدْنِي عِلْمًا', en:'"My Lord, increase me in knowledge."', ref:'Quran 20:114' },
    { ar:'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلاً مُتَقَبَّلاً', en:'"O Allah, I ask You for beneficial knowledge, good provision, and accepted deeds."', ref:'Sunan Ibn Majah 925' },
    { ar:'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ', en:'"O Changer of the hearts, make my heart firm upon Your religion."', ref:'Jami at-Tirmidhi 2140' }
];
