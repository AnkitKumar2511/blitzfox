// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// ADD THESE THREE LINES to import the functions we need
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import for Cloud Storage

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjqnrIJHrZ85whuGpPquwqIk3WLYZXKP8",
  authDomain: "typing-test-88c30.firebaseapp.com",
  projectId: "typing-test-88c30",
  storageBucket: "typing-test-88c30.appspot.com",
  messagingSenderId: "1067234382379",
  appId: "1:1067234382379:web:a5869cd9641640d71a106e",
  measurementId: "G-R6MVZB01BV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// EXPORT THE SERVICES so your app can use them
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // Export storage
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();
