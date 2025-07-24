import React, { useRef } from 'react';
import { useAuth, useGoogleSignIn } from '../contexts/AuthContext';
import AlertTriangleIcon from './icons/AlertTriangleIcon';

const LoginScreen: React.FC = () => {
    const googleButtonRef = useRef<HTMLDivElement>(null);
    const { isGoogleSignInConfigured } = useAuth();
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
                <div className="flex justify-center items-center min-h-[56px]">
                    {isGoogleSignInConfigured ? (
                        <div ref={googleButtonRef}></div>
                    ) : (
                        <div className="bg-red-900/60 border border-red-700/80 text-red-300 px-4 py-3 rounded-xl text-sm w-full flex items-start gap-3">
                           <AlertTriangleIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-400" />
                           <div>
                             <h3 className="font-bold text-red-200">ログイン機能が設定されていません</h3>
                             <p className="text-xs text-red-400 mt-1">
                                管理者は `VITE_GOOGLE_CLIENT_ID` 環境変数を設定する必要があります。
                             </p>
                           </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default LoginScreen;
