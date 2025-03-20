
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD2ZmZ8y399YYyvUHWaKOux3tgAV4T6OLg",
  authDomain: "cv-generator-447314.firebaseapp.com",
  databaseURL: "https://cv-generator-447314-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cv-generator-447314",
  storageBucket: "cv-generator-447314.appspot.com",
  messagingSenderId: "177360827241",
  appId: "1:177360827241:web:2eccbab9c11777f27203f8",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
