// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB118sPMi7vNHYvCgXeDZ66iut5jC4e-YY",
  authDomain: "urag-df43a.firebaseapp.com",
  projectId: "urag-df43a",
  storageBucket: "urag-df43a.firebasestorage.app",
  messagingSenderId: "125671254224",
  appId: "1:125671254224:web:fc591ef0ba3013377456d5",
  measurementId: "G-Y9FMLV60ZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);