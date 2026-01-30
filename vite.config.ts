import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  define: {
    'process.env': {
      FIREBASE_API_KEY: JSON.stringify(process.env.VITE_FIREBASE_API_KEY || 'demo-key'),
      FIREBASE_AUTH_DOMAIN: JSON.stringify(process.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com'),
      FIREBASE_DATABASE_URL: JSON.stringify(process.env.VITE_FIREBASE_DATABASE_URL || 'https://demo-project-default-rtdb.firebaseio.com'),
      FIREBASE_PROJECT_ID: JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID || 'demo-project'),
      FIREBASE_STORAGE_BUCKET: JSON.stringify(process.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com'),
      FIREBASE_MESSAGING_SENDER_ID: JSON.stringify(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789'),
      FIREBASE_APP_ID: JSON.stringify(process.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef123456'),
      GEMINI_API_KEY: JSON.stringify(process.env.VITE_GEMINI_API_KEY || 'demo-gemini-key'),
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  }
});
