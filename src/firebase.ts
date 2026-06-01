import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Configuration for Firebase Database
export const firebaseConfig = {
  apiKey: "AIzaSyDgzY8u-OH-hPN_XNPAL2t12HKUMA_pJkw",
  authDomain: "messenger-8d1fa.firebaseapp.com",
  databaseURL: "https://messenger-8d1fa-default-rtdb.firebaseio.com",
  projectId: "messenger-8d1fa",
  storageBucket: "messenger-8d1fa.firebasestorage.app",
  messagingSenderId: "149032821763",
  appId: "1:149032821763:web:d8b56bd926b54dc943da36",
  measurementId: "G-134HZ49RT6"
};

let app;
let database: any = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  database = getDatabase(app);
} catch (error) {
  console.warn("Firebase initialization failed. Falling back to offline client mode:", error);
}

export { app, database };
