import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC2nAFCi8HYAb9fgOkib3gl4mLYbZYkNgM",
  authDomain: "mimeflow-e8800.firebaseapp.com",
  projectId: "mimeflow-e8800",
  storageBucket: "mimeflow-e8800.firebasestorage.app",
  messagingSenderId: "583996391763",
  appId: "1:583996391763:web:f0e49f1d2010b32d4fe1a6",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
