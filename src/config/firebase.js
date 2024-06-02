import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCcoYPASCdGfI-ooaPUJ0m1aE9_0ex7uL0",
  authDomain: "skhillz-1716810559952.firebaseapp.com",
  projectId: "skhillz-1716810559952",
  storageBucket: "skhillz-1716810559952.appspot.com",
  messagingSenderId: "312051462999",
  appId: "1:312051462999:web:d32818f370877ec6fe4412",
  measurementId: "G-V72KK90G20",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
