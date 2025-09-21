// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp} from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// import { getAnalytics } from "firebase/analytics";
// import { get } from "http";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

// In SSR we've little extra step here: instead of just saying const app is equal to initializeApp(firebaseConfig)
// we first check if any apps have already been initialized (which they will have been on the client)
// If no apps have been initialized, we initialize one, otherwise we just get the already initialized app
// This is to prevent "The default app already exists" error
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// after that, we can go ahead and initialize auth
export const auth = getAuth(app);

export const db = getFirestore(app);