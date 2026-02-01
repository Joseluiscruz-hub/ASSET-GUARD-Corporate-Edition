// Este es un archivo de ejemplo. Copia este archivo a environment.ts y environment.prod.ts
// y reemplaza los valores con tus credenciales reales.
// NO subas environment.ts ni environment.prod.ts a git (ya están en .gitignore)

export const environment = {
  production: false, // cambiar a true para environment.prod.ts
  firebase: {
    apiKey: "TU_FIREBASE_API_KEY",
    authDomain: "tu-proyecto.firebaseapp.com",
    databaseURL: "https://tu-proyecto-default-rtdb.firebaseio.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.firebasestorage.app",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
  },
  geminiApiKey: "TU_GEMINI_API_KEY"
};
