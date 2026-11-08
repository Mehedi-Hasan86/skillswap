import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Web config from Firebase Console → Project settings → General → Your apps.
// Fill VITE_FIREBASE_* in client/.env (see .env.example).
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId
);

let auth = null;
if (isFirebaseConfigured) {
  if (getApps().length === 0) initializeApp(firebaseConfig);
  auth = getAuth();
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export async function signInWithGooglePopup() {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Google sign-in is not configured (missing VITE_FIREBASE_* keys). Email/password still works.'
    );
  }
  const cred = await signInWithPopup(auth, googleProvider);
  return cred.user.getIdToken();
}
