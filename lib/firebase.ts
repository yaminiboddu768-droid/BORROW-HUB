import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWIcRu1_8nDZtU7bugr_2DV8YCSFIHvd8",
  authDomain: "borrow-hub-f4cbe.firebaseapp.com",
  projectId: "borrow-hub-f4cbe",
  storageBucket: "borrow-hub-f4cbe.firebasestorage.app",
  messagingSenderId: "611838589390",
  appId: "1:611838589390:web:793335987d30d90204139f",
  measurementId: "G-36DDNK9Z53"
};

// Initialize Firebase (Singleton pattern to prevent re-initialization in Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Analytics is only available in browser environments
let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export { app, auth, db, storage, analytics };
