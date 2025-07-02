import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// TEMPORARY: Hardcoded Firebase config while debugging environment variables
// TODO: Fix environment variable loading and switch back to .env file

console.log('🔧 Using hardcoded Firebase configuration for testing');

const firebaseConfig = {
  apiKey: "AIzaSyC72irUmSlxMMP7m3Zk1uhhgXkP4qdIT10",
  authDomain: "fleet-4f7c0.firebaseapp.com",
  projectId: "fleet-4f7c0",
  storageBucket: "fleet-4f7c0.firebasestorage.app",
  messagingSenderId: "832253051339",
  appId: "1:832253051339:web:7c7fd4c4e678ad4bfe364e",
  measurementId: "G-DVVB6DGP57"
};

// Set hasEnvVars to true for hardcoded config
const hasEnvVars = true;

console.log('🔥 Firebase initialized with hardcoded configuration:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey.substring(0, 10) + '...'
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (only in browser environment and with real config)
export const analytics = typeof window !== 'undefined' && hasEnvVars ? getAnalytics(app) : null;

export default app; 