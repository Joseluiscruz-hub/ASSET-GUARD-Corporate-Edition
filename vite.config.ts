import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  define: {
    'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(process.env.VITE_FIREBASE_API_KEY || 'demo-key'),
    'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(process.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com'),
    'import.meta.env.VITE_FIREBASE_DATABASE_URL': JSON.stringify(process.env.VITE_FIREBASE_DATABASE_URL || 'https://demo-project-default-rtdb.firebaseio.com'),
    'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(process.env.VITE_FIREBASE_PROJECT_ID || 'demo-project'),
    'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(process.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com'),
    'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789'),
    'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(process.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef123456'),
    'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(process.env.VITE_GEMINI_API_KEY || 'demo-gemini-key'),
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  }
});
