// Firebase Admin SDK — verifies Google Sign-In ID tokens.
// Configure via env (see .env.example). If not configured, Google
// sign-in is disabled and /api/auth/google returns a clear 503.
let admin = null;
let initError = null;

function getAdmin() {
  if (admin || initError) return admin;
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
    privateKey = privateKey.replace(/\\n/g, '\n');
    const adminLib = require('firebase-admin');
    if (adminLib.apps.length === 0) {
      adminLib.initializeApp({
        credential: adminLib.credential.cert({ projectId, clientEmail, privateKey }),
      });
    }
    admin = adminLib;
  } catch (e) {
    initError = e;
    return null;
  }
  return admin;
}

function isFirebaseConfigured() {
  return !!getAdmin();
}

async function verifyIdToken(idToken) {
  const sdk = getAdmin();
  if (!sdk) throw initError || new Error('Firebase Admin not configured');
  return sdk.auth().verifyIdToken(idToken);
}

module.exports = { getAdmin, isFirebaseConfigured, verifyIdToken };
