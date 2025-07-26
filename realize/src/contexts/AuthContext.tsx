import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { AuthenticatedUser } from '../types';

// ===================================================================================
// IMPORTANT: The Google Client ID must be provided as an environment variable
// named VITE_GOOGLE_CLIENT_ID in your Vercel project settings.
// ===================================================================================
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Debug: 環境変数の値を確認（開発時のみ）
if (import.meta.env.DEV) {
  console.log('VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
}

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
      return;
    }
    
    if (window.google?.accounts?.id) {
      if (import.meta.env.DEV) {
          console.log('AuthProvider: Initializing Google Sign-In...');
      }
      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID!,
          callback: handleCredentialResponse,
          auto_select: true,
        });
        if (import.meta.env.DEV) {
            console.log('AuthProvider: Google Sign-In initialized successfully');
        }
      } catch (error) {
        console.error('AuthProvider: Error initializing Google Sign-In:', error);
      }
    } else {
      if (import.meta.env.DEV) {
          console.log('AuthProvider: window.google.accounts.id not available yet');
      }
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
      if (import.meta.env.DEV) {
          console.log('useGoogleSignIn: GOOGLE_CLIENT_ID =', GOOGLE_CLIENT_ID);
          console.log('useGoogleSignIn: window.google =', window.google);
          console.log('useGoogleSignIn: ref.current =', ref.current);
      }
      
      if (!GOOGLE_CLIENT_ID) {
          if (import.meta.env.DEV) {
              console.log('useGoogleSignIn: No GOOGLE_CLIENT_ID, returning');
          }
          return;
      }

      let timeoutId: number;
      let retryCount = 0;
      const maxRetries = 50; // 最大5秒間試行
      let isRendered = false; // ボタンが既にレンダリングされているかチェック

      // initializeが完了するまで待つ
      const checkInitialized = () => {
          if (ref.current && window.google?.accounts?.id && !isRendered) {
              if (import.meta.env.DEV) {
                  console.log('useGoogleSignIn: Rendering button...');
              }
              try {
                  // 既存のボタンをクリア
                  if (ref.current) {
                      ref.current.innerHTML = '';
                  }
                  
                  window.google.accounts.id.renderButton(
                      ref.current,
                      { theme: "outline", size: "large", type: "standard", text: "signin_with", shape: "pill" }
                  );
                  isRendered = true;
                  if (import.meta.env.DEV) {
                      console.log('useGoogleSignIn: Button rendered successfully');
                  }
                  
                  // One Tap promptは少し遅延させて表示
                  setTimeout(() => {
                      try {
                          if (window.google?.accounts?.id) {
                              window.google.accounts.id.prompt();
                          }
                      } catch (error) {
                          if (import.meta.env.DEV) {
                              console.log('useGoogleSignIn: One Tap prompt error (non-critical):', error);
                          }
                      }
                  }, 1000);
              } catch (error) {
                  console.error('useGoogleSignIn: Error rendering button:', error);
              }
          } else if (retryCount < maxRetries && !isRendered) {
              if (import.meta.env.DEV) {
                  console.log('useGoogleSignIn: Waiting for initialization...', retryCount);
              }
              retryCount++;
              timeoutId = setTimeout(checkInitialized, 100);
          } else if (retryCount >= maxRetries) {
              console.error('useGoogleSignIn: Max retries reached, initialization failed');
          }
      };

      // 少し遅延させてから初期化チェックを開始
      timeoutId = setTimeout(checkInitialized, 500);

      // クリーンアップ関数
      return () => {
          if (timeoutId) {
              clearTimeout(timeoutId);
          }
          // コンポーネントのアンマウント時にボタンをクリア
          if (ref.current) {
              try {
                  ref.current.innerHTML = '';
              } catch (error) {
                  if (import.meta.env.DEV) {
                      console.log('useGoogleSignIn: Cleanup error (non-critical):', error);
                  }
              }
          }
      };
  }, [ref]);
};
