const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// Determine path to the credentials json
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH 
  ? path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_KEY_PATH)
  : null;

if (!serviceAccountPath) {
  console.warn("Warning: FIREBASE_SERVICE_ACCOUNT_KEY_PATH is missing from environment variables.");
  console.warn("The server will not start successfully without credentials provided in .env.");
} else {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(require(serviceAccountPath))
    });
    console.log("Firebase Admin SDK successfully initialized.");
  } catch (error) {
    console.error("Critical: Failed to initialize Firebase Admin SDK with key path:", serviceAccountPath, error);
  }
}

const db = admin.apps.length > 0 ? admin.firestore() : null;
const auth = admin.apps.length > 0 ? admin.auth() : null;

module.exports = { admin, db, auth };
