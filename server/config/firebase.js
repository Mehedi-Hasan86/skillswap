// Firebase Admin SDK — verifies Google Sign-In ID tokens.
// Configure via env (see .env.example). If not configured, Google
// sign-in is disabled and /api/auth/google returns a clear 503.
let admin = null;
let initError = null;

function getAdmin() {
  if (admin) return admin;
  if (initError) return null;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    initError = new Error(
      'Firebase Admin not configured (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY)'
    );
    return null;
  }

  try {
    // Render/compose envs often escape newlines as \n — restore them.
    privateKey = privateKey.replace(/\\n/g, '\n').trim();

    // Use the modular `firebase-admin/app` entry point — it works on both
    // v13 and v14. Pinning v13 avoids jwks-rsa's ESM-only `jose` dependency,
    // which breaks token verification on Vercel's Node runtime.
    const { getApps, initializeApp, cert } = require('firebase-admin/app');

    if (getApps().length === 0) {
      initializeApp({
        credential: cert({ projectId, clientEmail, privateKey }),
      });
    }

    admin = require('firebase-admin');
    return admin;
  } catch (e) {
    // Keep the reason available to /api/auth/google instead of surfacing a
    // cryptic "network"/TypeError to the client during Google sign-in.
    initError = new Error(`Firebase Admin initialization failed: ${e.message}`);
    return null;
  }
}

function isFirebaseConfigured() {
  return !!getAdmin();
}

async function verifyIdToken(idToken) {
  const sdk = getAdmin();
  if (!sdk) throw initError || new Error('Firebase Admin not configured');
  // firebase-admin v14 exposes Auth via the dedicated `firebase-admin/auth`
  // entry point (admin.auth() was removed).
  const auth = require('firebase-admin/auth').getAuth();
  return auth.verifyIdToken(idToken);
}

module.exports = { getAdmin, isFirebaseConfigured, verifyIdToken };
