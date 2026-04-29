# Skincare Ritual — Setup Guide

## What's in this project

```
skincare-app/
├── api/
│   └── proxy.js          ← Vercel serverless function (keeps your API key safe)
├── src/
│   ├── main.jsx          ← React entry point
│   ├── SkincareApp.jsx   ← Main app component
│   ├── api.js            ← Routes all Claude calls through your proxy
│   └── storage.js        ← Works with localStorage (browser) or Capacitor (iOS)
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── capacitor.config.ts
```

---

## Part 1 — Run it locally

### 1. Install dependencies
```bash
cd skincare-app
npm install
```

### 2. Create a local environment file
Create a file called `.env.local` in the project root:
```
ANTHROPIC_API_KEY=sk-ant-your-key-here
```
Get your key at https://console.anthropic.com

### 3. Install Vercel CLI and run locally
```bash
npm install -g vercel
vercel dev
```
This runs both your React app AND the `/api/proxy` backend together on http://localhost:3000

---

## Part 2 — Deploy the backend to Vercel

### 1. Push your code to GitHub
Create a new repo at github.com, then:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/skincare-app.git
git push -u origin main
```

### 2. Deploy to Vercel
- Go to https://vercel.com and sign in with GitHub
- Click "Add New Project" → import your repo
- Under "Environment Variables", add:
  - Key: `ANTHROPIC_API_KEY`
  - Value: `sk-ant-your-key-here`
- Click Deploy

Vercel gives you a URL like `https://skincare-app-xyz.vercel.app`

### 3. Set your production API URL
Create a `.env.production` file:
```
VITE_API_URL=https://skincare-app-xyz.vercel.app
```
Replace with your actual Vercel URL.

---

## Part 3 — Set up Capacitor for iOS

### 1. Build your React app
```bash
npm run build
```

### 2. Add the iOS platform
```bash
npx cap add ios
npx cap sync
```

### 3. Open in Xcode
```bash
npx cap open ios
```

### 4. Inside Xcode, update these settings:
- **Bundle Identifier**: Change `com.yourname.skincareapp` to something unique
  (e.g. `com.sarah.skincareapp`) — must be unique on the App Store
- **Display Name**: "Skincare Ritual"
- **Team**: Select your Apple Developer account
- **Deployment Target**: iOS 16.0 or higher
- **App Icon**: Add a 1024×1024px PNG to Assets.xcassets > AppIcon
  (no transparency, no rounded corners — Apple adds those)

### 5. Test on your iPhone
- Connect your iPhone with a USB cable
- Select your device from the device dropdown in Xcode
- Press the Run button (▶)
- On your iPhone: Settings → General → VPN & Device Management → trust your developer cert

---

## Part 4 — Submit to the App Store

### 1. Create your App Store listing
- Go to https://appstoreconnect.apple.com
- Click "My Apps" → "+" → "New App"
- Platform: iOS
- Bundle ID: match what you set in Xcode
- Fill in: name, primary language, SKU (any unique string, e.g. "skincare-ritual-001")

### 2. Prepare required assets
- **Screenshots**: Minimum one set for 6.9" iPhone display (1320×2868px)
  and one for 6.5" (1242×2688px). You can screenshot from the iOS Simulator in Xcode.
- **App Description**: Write 1–3 paragraphs describing what the app does
- **Keywords**: skincare, routine, beauty, skin, serum, moisturizer (comma separated)
- **Privacy Policy URL**: Required. Use https://www.privacypolicygenerator.info to create
  a free one and host it anywhere (even a GitHub Gist)
- **Support URL**: A link to your email or a simple webpage

### 3. Archive and upload from Xcode
- Product → Scheme → Edit Scheme → set to Release
- Product → Archive
- When complete: "Distribute App" → "App Store Connect" → follow prompts
- Xcode uploads the build to App Store Connect

### 4. Submit for review
- In App Store Connect, select your uploaded build
- Fill in the version information and pricing (free)
- Click "Submit for Review"
- Typical review time: 1–3 business days

---

## After each code change

Whenever you update the app, run:
```bash
npm run build
npx cap sync
```
Then re-archive from Xcode to submit a new version.

---

## Common issues

**"API key not configured" error** — make sure ANTHROPIC_API_KEY is set in Vercel's
environment variables and you've redeployed after adding it.

**App rejected for "minimal functionality"** — App Store wants apps to feel native.
Make sure the experience is polished, all features work, and you're not just displaying a website.

**Capacitor storage not working** — make sure you ran `npx cap sync` after installing
@capacitor/preferences. On first run the app falls back to localStorage automatically.
