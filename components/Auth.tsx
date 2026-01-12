
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Icons } from '../constants';
import { storageService } from '../services/storageService';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanUsername = username.trim().toLowerCase();

    if (!cleanUsername || cleanUsername.length < 3) {
      setError('ID المستخدم قصير جداً');
      return;
    }

    setIsLoading(true);

    try {
      const savedUsers = await storageService.getUsers();
      
      if (isLoginMode) {
        const foundUser = savedUsers.find((u: any) => u.username === cleanUsername && u.password === password);
        if (foundUser) {
          const session: User = { 
            username: cleanUsername, 
            lastLogin: new Date().toISOString(),
            avatar: foundUser.avatar
          };
          storageService.setSession(session);
          onLogin(session);
        } else {
          setError('خطأ في بيانات الوصول');
          setIsLoading(false);
        }
      } else {
        if (savedUsers.some((u: any) => u.username === cleanUsername)) {
          setError('اسم المستخدم محجوز');
          setIsLoading(false);
          return;
        }

        const newUser = { username: cleanUsername, password, email, createdAt: new Date().toISOString() };
        await storageService.registerUser(newUser);
        await storageService.initializeNewAccount(cleanUsername);
        
        const session: User = { username: cleanUsername, lastLogin: new Date().toISOString() };
        storageService.setSession(session);
        onLogin(session);
      }
    } catch (err) {
      setError("فشل الاتصال بقاعدة البيانات");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] font-sans overflow-hidden relative">
      <style>{`
        @keyframes aurora {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(10%, 10%) scale(1.2); opacity: 0.5; }
        }
        .aurora-bg {
          filter: blur(100px);
          animation: aurora 15s infinite alternate ease-in-out;
        }
        @keyframes signaturePulse {
          0%, 100% { transform: translateY(0); opacity: 0.8; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
        .signature-glow {
          text-shadow: 0 0 10px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
        }
        @keyframes heartPulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .animate-heart {
          animation: heartPulse 1s infinite;
          display: inline-block;
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-600/20 rounded-full aurora-bg"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full aurora-bg" style={{ animationDelay: '-5s' }}></div>
      </div>

      {/* Signature Credit - Bottom Right Only for Login Page */}
      <div className="fixed bottom-8 right-8 z-20 pointer-events-none animate-[signaturePulse_4s_infinite_ease-in-out]">
         <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl transition-all duration-500 hover:bg-white/10">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">صنع بكل</span>
            <span className="animate-heart text-rose-500 drop-shadow-[0_0_5px_rgba(244,63,94,0.6)]">❤️</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">من قبل</span>
            <div className="w-[1px] h-3 bg-white/20"></div>
            <span className="text-[12px] font-black text-blue-400 uppercase tracking-[0.2em] signature-glow">
              MOSTAFA ABDO
            </span>
         </div>
      </div>

      <div className={`w-full max-w-[460px] p-6 z-10 transition-all duration-1000 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-[50px] p-10 md:p-14 shadow-2xl">
          
          <header className="mb-12 text-center">
             <div className="w-16 h-16 bg-blue-600 border border-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/40">
               <Icons.Sparkles className="w-8 h-8 text-white" />
             </div>
             <h2 className="text-4xl font-black text-white tracking-tighter mb-2">مهامي</h2>
             <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">إدارة مهامك اليومية</p>
          </header>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">معرف المستخدم</label>
              <input 
                required value={username} onChange={e => setUsername(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white font-bold outline-none focus:border-blue-500 transition-all"
                placeholder="ID الخاص بك"
              />
            </div>

            {!isLoginMode && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">البريد الإلكتروني</label>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white font-bold outline-none focus:border-blue-500 transition-all"
                  placeholder="name@cloud.com"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-4">كلمة المرور</label>
              <input 
                type="password" required value={password} onChange={e => setPassword(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 text-white font-bold outline-none focus:border-blue-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-[11px] font-black text-center">
                {error}
              </div>
            )}

            <button 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-6 rounded-[28px] text-lg font-black shadow-2xl shadow-blue-500/30 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-4 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {isLoading ? <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : (isLoginMode ? 'دخول آمن' : 'إنشاء حساب جديد')}
            </button>
          </form>

          <footer className="mt-10 text-center">
            <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-slate-400 text-xs font-black uppercase tracking-widest hover:text-blue-400 transition-colors">
              {isLoginMode ? 'إنشاء هوية جديدة' : 'لديك حساب؟ سجل دخولك'}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Auth;
