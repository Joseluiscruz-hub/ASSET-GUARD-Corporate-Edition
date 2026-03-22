import { initializeApp, getApps, getApp } from 'firebase/app';
import { environment } from './environments/environment';

const firebaseConfig = {
  ...environment.firebase,
  apiKey: (typeof window !== 'undefined' && (window as any)['FIREBASE_API_KEY'])
    ? (window as any)['FIREBASE_API_KEY']
    : environment.firebase.apiKey,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
