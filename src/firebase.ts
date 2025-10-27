import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; 
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDuacfev7LM7gfF8UUq2WuGSQ87bwxSYkY",
  authDomain: "chingchongtodos.firebaseapp.com",
  projectId: "chingchongtodos",
  storageBucket: "chingchongtodos.firebasestorage.app",
  messagingSenderId: "912920827794",
  appId: "1:912920827794:web:d6fb0ff618acedcaead34b"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);