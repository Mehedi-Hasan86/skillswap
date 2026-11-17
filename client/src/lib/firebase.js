import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
} from 'firebase/auth';

// Web config from Firebase Console → Project settings → General → Your apps.
// Fill VITE_FIREBASE_* in client/.env (see .env.example). Restart the dev
// server after editing .env — Vite only reads these values at startup.
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
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

function isNetworkError(e) {
  return e?.code === 'auth/network-request-failed';
}

function isPopupProblem(e) {
  return (
    e?.code === 'auth/popup-blocked' ||
    e?.code === 'auth/popup-closed-by-user' ||
    e?.code === 'auth/cancelled-popup-request'
  );
}

// Returns { idToken } on success, or { redirecting: true } when the browser
// had to leave the page (popup blocked) and the result arrives on return.
export async function signInWithGoogle() {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Google sign-in is not configured (missing VITE_FIREBASE_* keys). Email/password still works.'
    );
  }

  try {
    const cred = await signInWithPopup(auth, googleProvider);
    return { idToken: await cred.user.getIdToken() };
  } catch (e) {
    // auth/network-request-failed and blocked/closed popups are common with
    // strict browser privacy settings. A full-page redirect uses a different
    // browser channel and usually succeeds where the popup cannot.
    if (isNetworkError(e) || isPopupProblem(e)) {
      try {
        await signInWithRedirect(auth, googleProvider);
        return { redirecting: true };
      } catch {
        throw e; // surface the original popup error if redirect won't start
      }
    }

    throw e;
  }
}

// Call once on app start to finish a sign-in that used the redirect fallback.
export async function resumeGoogleSignIn() {
  if (!isFirebaseConfigured) return null;
  try {
    const result = await getRedirectResult(auth);
    return result ? await result.user.getIdToken() : null;
  } catch {
    return null;
  }
}

// Translate Firebase / Axios errors into messages a student can act on.
export function friendlyAuthError(e) {
  const code = e?.code || '';
  const msg = e?.message || '';

  // Firebase Auth errors always carry an `auth/*` code.
  if (code === 'auth/network-request-failed') {
    return 'Google could not be reached from this browser. Check your connection/VPN, allow popups for this site, and try again. Email/password still works.';
  }
  if (code === 'auth/unauthorized-domain') {
    return "Firebase Unauthorized Domain: add this site's domain in Firebase Console → Authentication → Settings → Authorized domains.";
  }
  if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
    return 'The sign-in popup was blocked or closed. Allow popups for this site and try again.';
  }
  if (code === 'auth/configuration-not-found' || code === 'auth/invalid-api-key' || code === 'auth/argument-error') {
    return 'Firebase is not configured correctly. Check VITE_FIREBASE_* in client/.env and restart the dev server.';
  }

  // Axios failure — Firebase succeeded but our backend could not be reached.
  if (!code && (e?.isAxiosError || /network|failed to fetch|ECONNREFUSED/i.test(msg))) {
    return 'The SkillSwap backend is unreachable. Run "npm run dev" inside /server (port 5000) and try again.';
  }

  return e?.response?.data?.error || msg || 'Google sign-in failed';
}
