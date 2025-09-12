// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDNv7WgGQ1bHkGMNLnqEZ2nRSDbz6_HwPM",
  authDomain: "carpool-441f2.firebaseapp.com",
  projectId: "carpool-441f2",
  storageBucket: "carpool-441f2.firebasestorage.app",
  messagingSenderId: "534022652457",
  appId: "1:534022652457:web:45e73223092c6553015238",
  measurementId: "G-1FS21YNEQK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);