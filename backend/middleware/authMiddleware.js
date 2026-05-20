const { auth } = require('../config/firebase-admin');

const verifyToken = async (req, res, next) => {
  // If Firebase Admin has not been initialized (e.g. env config is missing), bypass or return error
  if (!auth) {
    return res.status(500).json({ 
      error: 'Server Misconfiguration: Firebase Admin SDK is not initialized. Please configure FIREBASE_SERVICE_ACCOUNT_KEY_PATH in .env.' 
    });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or malformed authentication token' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || decodedToken.email
    };
    next();
  } catch (error) {
    console.error('Token Verification Error:', error);
    return res.status(403).json({ error: 'Forbidden: Invalid, expired, or revoked token' });
  }
};

module.exports = verifyToken;
