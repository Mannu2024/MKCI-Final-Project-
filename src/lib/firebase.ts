import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAl_iVSaiTdjUmhkyQVkpAexqRq0FIP5PA",
  authDomain: "mkci-new.firebaseapp.com",
  projectId: "mkci-new",
  storageBucket: "mkci-new.firebasestorage.app",
  messagingSenderId: "340464170099",
  appId: "1:340464170099:web:34f3eb47931c2a8e122606",
  measurementId: "G-JZR54PGPTV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection successful!");
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Firebase connection failed: Please check your Firebase configuration. The client is offline.");
    } else {
      console.log("Firebase connected, but test document read failed (likely due to security rules, which is expected):", error);
    }
  }
}

testConnection();
