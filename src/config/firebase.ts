import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase Functions configuration
export const FIREBASE_CONFIG = {
  // Firebase project ID
  projectId: 'hoshino-996d0',
  
  // Firebase Functions region
  region: 'us-central1',
  
  // Firebase Functions base URL
  functionsBaseUrl: 'https://us-central1-hoshino-996d0.cloudfunctions.net',
  
  // Individual function endpoints
  functions: {
    generateNFTTransaction: 'https://us-central1-hoshino-996d0.cloudfunctions.net/generateNFTTransaction',
    generateCurrencyPurchaseTransaction: 'https://us-central1-hoshino-996d0.cloudfunctions.net/generateCurrencyPurchaseTransaction',
    processStarDustPurchase: 'https://us-central1-hoshino-996d0.cloudfunctions.net/processStarDustPurchase',
    fetchNFTMetadata: 'https://us-central1-hoshino-996d0.cloudfunctions.net/fetchNFTMetadata',
    chat: 'https://us-central1-hoshino-996d0.cloudfunctions.net/chat',
    getConversation: 'https://us-central1-hoshino-996d0.cloudfunctions.net/getConversation',
    health: 'https://us-central1-hoshino-996d0.cloudfunctions.net/health',
    solanaHealth: 'https://us-central1-hoshino-996d0.cloudfunctions.net/solanaHealth'
  }
};

// Helper function to get function URL
export const getFunctionUrl = (functionName: keyof typeof FIREBASE_CONFIG.functions): string => {
  return FIREBASE_CONFIG.functions[functionName];
};

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app; 