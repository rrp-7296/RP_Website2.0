# 📱 Mobile App Build Guide — Android APK & iOS IPA

**App ID**: `com.rakes.portfolio`  
**App Name**: Rakeshwar Pandey Portfolio  
**Capacitor**: v8 | **React + Vite**: Already configured  
**Android project**: `ui/android/` | **iOS project**: `ui/ios/`

---

## 🔄 Workflow — Every Time You Update the Web App

Run these two commands before opening Android Studio or Xcode:

```bash
cd c:\Old_Website\Website2.0\ui

# 1. Build the React app (outputs to dist/)
npm run build

# 2. Sync build into the native projects
npx cap sync android    # for Android
npx cap sync ios        # for iOS (Mac only)
```

---

## 🤖 ANDROID APK

### Prerequisites

| Tool | Download | Notes |
|------|----------|-------|
| **Android Studio** | https://developer.android.com/studio | ~1 GB |
| **Java JDK 17+** | Bundled with Android Studio | |
| **Android SDK** | Via Android Studio → SDK Manager | API 34 recommended |

> After installing Android Studio, open it once and complete the SDK setup wizard before proceeding.

---

### Step 1 — Build & Sync

```bash
cd c:\Old_Website\Website2.0\ui
npm run build
npx cap sync android
```

---

### Step 2 — Open Android Studio

```bash
npx cap open android
```

Or manually: Android Studio → **Open Project** → select `ui/android/`

---

### Step 3A — Debug APK (For Testing)

In Android Studio:
1. Wait for Gradle sync to complete (progress bar at bottom)
2. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Click **"locate"** in the success popup

Output path:
```
ui\android\app\build\outputs\apk\debug\app-debug.apk
```

Install on a connected phone via USB:
```bash
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

Or simply share the `.apk` file — receiver must enable **"Install Unknown Apps"** in phone settings.

---

### Step 3B — Release APK (For Distribution / Play Store)

#### Create a Keystore (one-time only)

```bash
keytool -genkey -v -keystore rakeshwar-portfolio.keystore -alias portfolio -keyalg RSA -keysize 2048 -validity 10000
```

> **IMPORTANT**: Never lose the keystore file or password — you cannot update the app on the Play Store without it.

#### Sign the APK

In Android Studio:
1. **Build** → **Generate Signed Bundle / APK**
2. Choose **APK** (direct install) or **Android App Bundle** (Play Store)
3. Select your keystore file, enter passwords
4. Select **Release** build variant → **Finish**

Output:
```
android\app\release\app-release.apk
```

---

### Step 4 — Distribute Android App

| Method | How |
|--------|-----|
| **Direct share** | Send `.apk` via WhatsApp, email, Google Drive |
| **Google Play Store** | Upload `.aab` to https://play.google.com/console ($25 one-time fee) |
| **USB / ADB** | `adb install app-release.apk` |

---

## 🍎 iOS IPA

> **macOS is required.** iOS builds cannot be done on Windows. Apple's Xcode toolchain is Mac-only.
>
> Alternatives if you don't have a Mac:
> - **Codemagic** (https://codemagic.io) — cloud CI/CD with Mac runners
> - **GitHub Actions** with `macos-latest` runner
> - **MacStadium** — rent a cloud Mac

---

### Prerequisites (on Mac)

| Tool | Notes |
|------|-------|
| **Xcode 15+** | Download from Mac App Store |
| **Apple Developer Account** | https://developer.apple.com — Free for device testing, $99/year for App Store |
| **CocoaPods** | `sudo gem install cocoapods` |

---

### Steps (on Mac)

```bash
# 1. Build and sync
npm run build
npx cap sync ios

# 2. Open in Xcode
npx cap open ios
```

In Xcode:
1. Select the project → **Signing & Capabilities**
2. Set **Team** to your Apple Developer account
3. Set **Bundle Identifier** to `com.rakes.portfolio`

**Run on Simulator** (free): Select a simulator → click **▶ Run**

**Run on Real iPhone** (free): Connect iPhone via USB → select device → click **▶ Run**

**Build IPA for App Store**:
- **Product** → **Archive** → **Distribute App** → **App Store Connect**

---

## 🌐 Backend URL Configuration

Your app currently auto-detects the backend URL (`src/config/api.ts`):

| Context | URL Used |
|---------|----------|
| Web browser (dev) | `http://localhost:8000` |
| Android Emulator | `http://10.0.2.2:8000` |
| Real device / Production | Value from `VITE_API_URL` in `.env.production` |

### For Testing on a Real Phone (same WiFi)

Edit `ui/.env.production`:
```env
VITE_API_URL=http://192.168.1.XXX:8000
```

Find your PC's local IP: run `ipconfig` → look for **IPv4 Address** under your WiFi adapter.

### For Production / Deployed Server

```env
VITE_API_URL=https://api.yourdeployeddomain.com
```

Then rebuild and sync:
```bash
npm run build
npx cap sync android
```

---

## 📋 Quick Reference

```
App Package ID : com.rakes.portfolio
App Version    : 1.0 (edit in ui/android/app/build.gradle → versionCode / versionName)
Android project: ui/android/
iOS project    : ui/ios/
Web build dir  : ui/dist/

Build flow:
  npm run build  →  npx cap sync android  →  Android Studio  →  Build APK
```
