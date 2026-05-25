# Prayer Time Web App 🕌

A beautifully designed, modern, and highly customizable Prayer Times application built with HTML, CSS, and Vanilla JavaScript. 

## ✨ Features

- **Accurate Prayer Times**: Fetches real-time, location-based prayer times using the Aladhan API.
- **Auto & Manual Location**: Automatically detects your city via IP, or allows you to search and set a manual location.
- **Dynamic 2x3 Grid Layout**: A sleek, fully responsive prayer card UI that adapts perfectly to both mobile and desktop screens.
- **Jamaat Time Adjustments**: Set exact custom times for your local Masjid's Jamaat.
- **Qibla Compass**: A built-in compass that uses device orientation sensors to point toward the Kaaba.
- **Dual Calendar**: Switch seamlessly between the Gregorian and Hijri (Urdu) calendars, complete with Islamic festival indicators.
- **Advanced Notifications**: Per-prayer notification toggles with custom sound options (System Default, Short Beep, or Adhan).
- **Themes & Customization**: Features dynamic backgrounds depending on the time of day, and manual Juristic school/calculation method settings.

## 🚀 Deployment

The fastest way to deploy this app is using **Vercel** since it is a pure static frontend app.

1. Create an account on [Vercel](https://vercel.com).
2. Click **Add New Project**.
3. Import this repository (`Amirchoudhary09/Prayer_Time`).
4. Click **Deploy**. Vercel will automatically host your app globally for free!

## 💻 Local Development

To run this app locally, you don't need any complex build tools. Just open the `index.html` file in your browser, or use a local development server:

```bash
# Example using Node.js http-server
npx http-server .
```

## 🛠 Built With

- **HTML5 & CSS3** (Glassmorphism, CSS Grid & Flexbox)
- **Vanilla JavaScript** (No heavy frameworks)
- **Aladhan API** (For timings, Hijri conversions, and holidays)
- **IPAPI** (For automatic location detection)
