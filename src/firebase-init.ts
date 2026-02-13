import { initializeApp, getApps, getApp } from 'firebase/app';
import { environment } from './environments/environment';

export const firebaseApp = getApps().length ? getApp() : initializeApp(environment.firebase);
