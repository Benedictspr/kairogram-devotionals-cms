# Kairogram Devotionals Cloud Studio & Live API

A lightweight, standalone Content Management System (CMS) & Serverless REST API designed for publishing daily devotionals (**RCCG Open Heavens**, **RCCG Sunday School**, **Deeper Life Daily Manna**, **MFM Mountain Top Life**, **Christ Embassy Rhapsody of Realities**, **Our Daily Manna**, **Winners Chapel**, **Dunamis Seeds of Destiny**) directly to the **Kairogram Mobile App**.

---

## Features
* **Multi-Day Batch Ingestion**: Paste a week or month of devotionals at once; smart parser extracts Date, Topic, Memory Verse, Reading, Message, and Prayers automatically.
* **Single Day Editor**: Manual form for granular adjustments to any day or manual.
* **1-Click Auto-Fetcher**: Instantly pulls and populates upcoming days.
* **Direct Kairogram Sync**: App pulls new days automatically via live HTTPS endpoint without requiring an APK rebuild or release!
* **Vercel Serverless Ready**: Zero setup configuration with `vercel.json` and CORS enabled.

---

## Deploy to Vercel (Choose Either Option)

### Option 1: Deploy with Vercel CLI (Fastest, 60 seconds)
1. Open terminal inside this directory (`C:\Users\hp\.gemini\antigravity-ide\scratch\kairogram-devotionals-cms`):
   ```bash
   npx vercel
   ```
2. Follow the 3 prompts (Hit Enter to accept defaults).
3. Vercel provides your live URL (e.g., `https://kairogram-devotionals.vercel.app`).

### Option 2: Deploy via GitHub
1. Create a new GitHub repository (e.g. `kairogram-devotionals-cms`).
2. Push this folder to your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Kairogram Devotionals Cloud Studio"
   git remote add origin https://github.com/<your-username>/kairogram-devotionals-cms.git
   git branch -M main
   git push -u origin main
   ```
3. Go to [vercel.com](https://vercel.com) -> **Add New Project** -> Import your GitHub repo -> Click **Deploy**.

---

## Linking to Kairogram Mobile App
1. Copy your Vercel API URL: `https://<your-project>.vercel.app/api/devotionals/latest`
2. Open **Kairogram** on your phone or emulator.
3. Tap **Settings** -> **Devotionals Cloud Sync**.
4. Paste your Vercel URL and tap **Save & Sync**.
5. All newly posted days and manuals immediately load in Kairogram!

---

## Running Locally for Testing
```bash
npm start
# Opens at http://localhost:3000
```
