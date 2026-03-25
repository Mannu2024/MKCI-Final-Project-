import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAIFB9T3LTgfAnKaxgnVNUgSg9toM6gVKo",
  authDomain: "mkci-final-project.firebaseapp.com",
  databaseURL: "https://mkci-final-project-default-rtdb.firebaseio.com",
  projectId: "mkci-final-project",
  storageBucket: "mkci-final-project.firebasestorage.app",
  messagingSenderId: "262704219195",
  appId: "1:262704219195:web:75de2168835e2ec8ed081e",
  measurementId: "G-YT0WEJ2CX1"
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
