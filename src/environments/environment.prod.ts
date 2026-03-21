// Production environment - API keys should be injected at build time
export const environment = {
  production: true,
  firebase: {
    apiKey: typeof window !== 'undefined' ? (window as any)['FIREBASE_API_KEY'] : undefined,
    authDomain: 'asset-guard-demo.firebaseapp.com',
    databaseURL: 'https://asset-guard-demo-default-rtdb.firebaseio.com',
    projectId: 'asset-guard-demo',
    storageBucket: 'asset-guard-demo.firebasestorage.app',
    messagingSenderId: '730419123254',
    appId: '1:730419123254:web:74de062f3e9e0851087497'
  },
  geminiApiKey: typeof window !== 'undefined' ? (window as any)['GEMINI_API_KEY'] : undefined
};
