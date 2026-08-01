import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const databaseUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
const isDemoUrl = !databaseUrl || databaseUrl.includes('demo-project-default-rtdb');

if (isDemoUrl) {
  console.warn('[Firebase] Using demo Realtime Database URL. Set NEXT_PUBLIC_FIREBASE_DATABASE_URL to your real RTDB URL.');
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'demo-project.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '0000000000',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:0000000000:web:demo',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-DEMO',
  databaseURL: databaseUrl || 'https://demo-project-default-rtdb.firebaseio.com',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);
