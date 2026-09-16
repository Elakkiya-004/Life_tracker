# LifeTracker Pro - Career, Habits & Budget OS

A modern, holistic productivity, career roadmap, habit tracker, health protocol, and financial budgeting application built with React 19, Vite, Firebase Firestore, and Progressive Web App (PWA) architecture.

---

## 🚀 Key Features

- **PWA (Progressive Web App)**: Installable directly from any browser (Chrome, Edge, Safari, Android, iOS) with offline caching and standalone window display.
- **Firebase Cloud Sync**: Real-time multi-device synchronization with Firestore and Auth.
- **Habit & Streak Tracker**: Daily checklists, streak tracking, and daily history archiving.
- **Career Roadmap**: Technical milestone and skill tracker.
- **Financial OS**: Jar-based budgeting and expense management.
- **Health & Diet Protocol**: Wellness tracking and workout logging.
- **Capacitor Mobile Ready**: Android APK export ready with Capacitor.

---

## 🛠️ Getting Started

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm run deploy
```
> Builds the app and publishes it directly to your Firebase Hosting project (`life-tracker-6e906.web.app`).

---

## 📱 Progressive Web App (PWA) Setup

- **Manifest**: Located at [`public/manifest.json`](./public/manifest.json), configured with icons, shortcuts, and standalone display.
- **Service Worker**: Located at [`public/sw.js`](./public/sw.js), manages offline asset caching while bypassing dynamic Firebase APIs.
- **PWA Context**: Managed via [`src/context/PwaContext.jsx`](./src/context/PwaContext.jsx), providing in-app install triggers, update prompts, and offline state banners.
