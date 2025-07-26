import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthenticatedUser } from '../types';

// ===================================================================================
// IMPORTANT: The Google Client ID must be provided as an environment variable
// named VITE_GOOGLE_CLIENT_ID in your Vercel project settings.
// ===================================================================================
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Debug: 環境変数の値を確認
console.log('=== 環境変数デバッグ ===');
console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
console.log('VITE_GOOGLE_CLIENT_ID type:', typeof import.meta.env.VITE_GOOGLE_CLIENT_ID);
console.log('VITE_GOOGLE_CLIENT_ID length:', import.meta.env.VITE_GOOGLE_CLIENT_ID?.length);
console.log('All env vars:', import.meta.env);
console.log('=== デバッグ終了 ===');

// Types for Google Identity Services to fix TypeScript errors
interface CredentialResponse {
  credential: string;
}

interface Google {
  accounts: {
    id: {
      initialize: (config: {
        client_id: string;
        callback: (response: CredentialResponse) => void;
        auto_select?: boolean;
      }) => void;
      renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
      prompt: (notification?: (notification: any) => void) => void;
      disableAutoSelect: () => void;
    };
  };
}

declare global {
  interface Window {
    google?: Google;
  }
}

interface AuthContextType {
  user: AuthenticatedUser | null;
  logout: () => void;
  isGoogleSignInConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const isGoogleSignInConfigured = !!GOOGLE_CLIENT_ID;

  const handleCredentialResponse = useCallback((response: CredentialResponse) => {
    try {
      const decoded: { name: string; email: string; picture: string; } = jwtDecode(response.credential);
      const newUser: AuthenticatedUser = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      };
      setUser(newUser);
      window.localStorage.setItem('realize-user', JSON.stringify(newUser));
    } catch (error) {
      console.error("Error decoding JWT:", error);
    }
  }, []);

  useEffect(() => {
    try {
      const savedUser = window.localStorage.getItem('realize-user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
       console.error("Could not parse user from localStorage", error);
       window.localStorage.removeItem('realize-user');
    }

    if (!isGoogleSignInConfigured) {
      console.warn('Google Sign-In is not configured. Please set the `VITE_GOOGLE_CLIENT_ID` environment variable to enable login functionality.');
      return;
    }
    
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID!,
        callback: handleCredentialResponse,
        auto_select: true,
      });
    }
  }, [handleCredentialResponse, isGoogleSignInConfigured]);

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem('realize-user');
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  return (
    <AuthContext.Provider value={{ user, logout, isGoogleSignInConfigured }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useGoogleSignIn = (ref: React.RefObject<HTMLDivElement>) => {
  useEffect(() => {
      console.log('useGoogleSignIn: GOOGLE_CLIENT_ID =', GOOGLE_CLIENT_ID);
      console.log('useGoogleSignIn: window.google =', window.google);
      console.log('useGoogleSignIn: ref.current =', ref.current);
      
      if (!GOOGLE_CLIENT_ID) {
          console.log('useGoogleSignIn: No GOOGLE_CLIENT_ID, returning');
          return;
      }

      if (ref.current && window.google?.accounts?.id) {
          console.log('useGoogleSignIn: Rendering button...');
          try {
              window.google.accounts.id.renderButton(
                  ref.current,
                  { theme: "outline", size: "large", type: "standard", text: "signin_with", shape: "pill" }
              );
              // Also show the One Tap prompt
              window.google.accounts.id.prompt(); 
              console.log('useGoogleSignIn: Button rendered successfully');
          } catch (error) {
              console.error('useGoogleSignIn: Error rendering button:', error);
          }
      } else {
          console.log('useGoogleSignIn: Missing ref.current or window.google.accounts.id');
      }
  }, [ref]);
};
