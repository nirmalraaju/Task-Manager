const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Determine path to the credentials json
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH 
  ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH)
  : null;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin SDK successfully initialized via JSON environment string.");
  } catch (error) {
    console.error("Critical: Failed to initialize Firebase Admin SDK via JSON string:", error);
  }
} else if (!serviceAccountPath) {
  console.warn("Warning: FIREBASE_SERVICE_ACCOUNT_KEY_PATH or FIREBASE_SERVICE_ACCOUNT_JSON is missing from environment.");
  console.warn("The server will not start successfully without credentials.");
} else {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(require(serviceAccountPath))
    });
    console.log("Firebase Admin SDK successfully initialized via local file path.");
  } catch (error) {
    console.error("Critical: Failed to initialize Firebase Admin SDK with key path:", serviceAccountPath, error);
  }
}

const db = admin.apps.length > 0 ? admin.firestore() : null;
const auth = admin.apps.length > 0 ? admin.auth() : null;

module.exports = { admin, db, auth };
