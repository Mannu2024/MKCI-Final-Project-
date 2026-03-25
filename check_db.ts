import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAIFB9T3LTgfAnKaxgnVNUgSg9toM6gVKo",
  authDomain: "mkci-final-project.firebaseapp.com",
  projectId: "mkci-final-project",
  storageBucket: "mkci-final-project.firebasestorage.app",
  messagingSenderId: "262704219195",
  appId: "1:262704219195:web:75de2168835e2ec8ed081e",
  measurementId: "G-YT0WEJ2CX1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const docRef = doc(db, "settings", "websiteContent");
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    console.log(JSON.stringify(docSnap.data().about, null, 2));
  } else {
    console.log("No document!");
  }
  process.exit(0);
}
check();
