import React, { createContext, useContext, useEffect, useState } from 'react';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured) {
      // Setup mockup session in local sandbox mode
      setCurrentUser({
        uid: "sandbox-developer-1234",
        displayName: "Developer Sandbox",
        email: "sandbox@focusflow.dev",
        photoURL: ""
      });
      setToken("mock-sandbox-token");
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google Auth Popup Failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigured) {
      setCurrentUser(null);
      setToken(null);
      return;
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign Out Failed:", error);
      throw error;
    }
  };

  // Helper function to query backend with dynamic Auth header
  const fetchWithAuth = async (url, options = {}) => {
    const currentToken = isFirebaseConfigured && currentUser 
      ? await currentUser.getIdToken(true) 
      : token; // Uses mock-sandbox-token if local
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    return fetch(url, { ...options, headers });
  };

  useEffect(() => {
    if (!isFirebaseConfigured) {
      // Local fallback execution
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idToken = await user.getIdToken();
        setCurrentUser(user);
        setToken(idToken);
      } else {
        setCurrentUser(null);
        setToken(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    token,
    loginWithGoogle,
    logout,
    fetchWithAuth,
    loading,
    isSandbox: !isFirebaseConfigured
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
