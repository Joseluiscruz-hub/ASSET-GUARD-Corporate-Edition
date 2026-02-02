<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1xmkKI_zwsDwh9od6bCatws2LFEmEikNi

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env.local` file by copying `.env.local.example`:
   ```bash
   cp .env.local.example .env.local
   ```
3. Set your API keys in `.env.local`:
   - Get your Gemini API key from: https://ai.google.dev/
   - Get your Firebase configuration from: https://console.firebase.google.com/
4. Run the app:
   `npm run dev`
