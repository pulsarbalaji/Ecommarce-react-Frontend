// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBJI7X36JrZvKNaNJyzuwz_IHd4jKvpI0A",        // <-- check this
  authDomain: "eccomerce-website-37e07.firebaseapp.com",
  projectId: "eccomerce-website-37e07",
  storageBucket: "eccomerce-website-37e07.firebasestorage.app",
  messagingSenderId: "310746686126",
  appId: "1:310746686126:web:95f883f12622efb2d4833f",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
