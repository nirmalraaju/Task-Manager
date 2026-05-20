import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const { loginWithGoogle, isSandbox } = useAuth();
  const [error, setError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);

  const handleSignIn = async () => {
    try {
      setError('');
      setAuthenticating(true);
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || 'Unable to authenticate with Google. Please try again.');
    } finally {
      setAuthenticating(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="brand-header">
          <div className="brand-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h1>FocusFlow</h1>
          <p>Organize, Track, and Achieve Effortlessly.</p>
          
          {isSandbox && (
            <div style={{
              marginTop: '16px',
              padding: '6px 12px',
              background: 'rgba(245, 158, 11, 0.1)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '20px',
              color: '#f59e0b',
              fontSize: '12px',
              fontWeight: 600,
              display: 'inline-block'
            }}>
              ⚠️ Running in Local Sandbox Mode
            </div>
          )}
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button 
          className={`auth-btn ${authenticating ? 'loading' : ''}`} 
          onClick={handleSignIn}
          disabled={authenticating}
        >
          {authenticating ? (
            <span className="spinner"></span>
          ) : (
            <>
              {isSandbox ? (
                <span>Launch Sandbox workspace</span>
              ) : (
                <>
                  <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </>
              )}
            </>
          )}
        </button>

        <div className="auth-footer">
          {isSandbox 
            ? "To connect to real Firebase servers, rename and edit frontend/.env.local"
            : "Secure authentication via separate secure backend services."}
        </div>
      </div>
    </div>
  );
}
