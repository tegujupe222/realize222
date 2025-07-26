import React, { useRef } from 'react';
import { useGoogleSignIn, useCustomGoogleLogin } from '../contexts/AuthContext';
import GoogleLoginButton from './GoogleLoginButton';

const LoginScreen: React.FC = () => {
    const googleButtonRef = useRef<HTMLDivElement>(null);
    const { handleCustomLogin, isLoading } = useCustomGoogleLogin();
    useGoogleSignIn(googleButtonRef);

    return (
        <main className="bg-slate-900 min-h-screen flex flex-col items-center justify-center p-6 text-white fade-in">
            <div 
              className="fixed inset-0 -z-10 h-full w-full bg-slate-900 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"
            >
              <div className="absolute left-0 right-0 top-1/4 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-teal-400 opacity-20 blur-[100px]"></div>
            </div>
            <div className="text-center max-w-md">
                <h1 className="text-6xl font-black tracking-tighter text-white">realize</h1>
                <p className="text-xl text-slate-400 mt-2 mb-8">職員室ダッシュボードへようこそ</p>
                <p className="text-slate-300 mb-8">
                    続けるには、Googleアカウントでログインしてください。
                    これにより、アプリケーションの全機能が利用可能になります。
                </p>
                <div className="flex flex-col items-center gap-4 min-h-[56px]">
                    {/* Google公式ボタン */}
                    <div ref={googleButtonRef}></div>
                    
                    {/* カスタムボタン（フォールバック） */}
                    <GoogleLoginButton 
                        onClick={handleCustomLogin}
                        isLoading={isLoading}
                    />
                </div>
            </div>
        </main>
    );
};

export default LoginScreen;
