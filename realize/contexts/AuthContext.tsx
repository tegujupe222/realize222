import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthenticatedUser } from '../types';

// ===================================================================================
// IMPORTANT: The Google Client ID must be provided as an environment variable
// named GOOGLE_CLIENT_ID.
// You can get a client ID from the Google Cloud Console:
// https://console.cloud.google.com/apis/credentials
// ===================================================================================
const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '356321850941-jn72or97g9a1upv1rgfq26l1qdr4jv4e.apps.googleusercontent.com';

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
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const isGoogleSignInConfigured = true; // 常にtrueにしてGoogleログインボタンを表示

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
      console.warn('Google Sign-In is not configured. Please set the `GOOGLE_CLIENT_ID` environment variable to enable login functionality.');
      return;
    }
    
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
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
    <AuthContext.Provider value={{ user, logout }}>
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
      if (!GOOGLE_CLIENT_ID) return;

      if (ref.current && window.google?.accounts?.id) {
          window.google.accounts.id.renderButton(
              ref.current,
              { theme: "outline", size: "large", type: "standard", text: "signin_with", shape: "pill" }
          );
          // Also show the One Tap prompt
          window.google.accounts.id.prompt(); 
      }
  }, [ref]);
};

// カスタムログイン機能を追加
export const useCustomGoogleLogin = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCustomLogin = useCallback(() => {
    if (!window.google?.accounts?.id) {
      console.error('Google Identity Services not available');
      return;
    }

    setIsLoading(true);
    try {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('One Tap prompt not displayed or skipped');
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('Error triggering Google login:', error);
      setIsLoading(false);
    }
  }, []);

  return { handleCustomLogin, isLoading };
};