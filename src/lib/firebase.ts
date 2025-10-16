import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCCmifGzT7w0Rk2hHCMbfvCrctK_gVG1N4",
  authDomain: "stayconnect-ab7b2.firebaseapp.com",
  projectId: "stayconnect-ab7b2",
  storageBucket: "stayconnect-ab7b2.appspot.com",
  messagingSenderId: "233883026869",
  appId: "1:233883026869:web:8875d44603d2f6920e45fc",
  measurementId: "G-9YVP9P2BG7",
  databaseURL: "https://stayconnect-ab7b2-default-rtdb.firebaseio.com",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getDatabase(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };
