# AI-First Personal Finance Tracker (PWA)

A private, offline-first personal finance tracker built as a React PWA. This app follows a **"Bring Your Own (BYO) Keys"** architecture—all your financial data and secrets (S3, Gemini) stay strictly in your browser's IndexedDB.

## 🚀 Key Features
- **Offline-First**: Track expenses anywhere, even without internet.
- **AI-Powered (Optional)**: Natural language expense entry using Google Gemini.
- **Direct Cloud Sync (Optional)**: Daily backups to your own AWS S3 bucket.
- **Zero Backend**: No central server, maximum privacy.
- **Mobile-First**: Optimized for a premium PWA experience on iOS and Android.

## 🛠 Tech Stack
- **Frontend**: React (TypeScript), Vite, Tailwind-like CSS, Lucide Icons.
- **Storage**: IndexedDB (via Dexie.js) for persistent local storage.
- **State**: Zustand for reactive UI state.
- **Cloud**: AWS SDK for direct S3 interaction.
- **AI**: Google Generative AI SDK for Gemini integration.

## ⚙️ Setup & Configuration

### 1. Installation
```bash
npm install
npm run dev
```

### 2. AWS S3 Configuration (Critical)
To enable cloud backups, you must enable **CORS** on your S3 bucket to allow the PWA's domain to upload files directly.

**Minimal CORS Template (AWS Console):**
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "POST", "GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposedHeaders": ["ETag"]
    }
]
```
> [!TIP]
> For better security, replace `"*"` in `AllowedOrigins` with your actual PWA deployment URL.

### 3. Google Gemini
Obtain an API key from the [Google AI Studio](https://aistudio.google.com/) and enter it in the app's **Settings** tab.

## 🔒 Security & Privacy
- **Local Secret Management (LSM)**: Secrets are stored in IndexedDB, which is generally safer than LocalStorage against script injection but still requires device-level security (passcodes).
- **Encryption**: Data is stored unencrypted locally. It is recommended to use this app on a device with full-disk encryption enabled (Standard on modern iOS/Android/macOS).
