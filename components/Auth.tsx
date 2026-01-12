
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
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
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
      setError('المعرف قصير جداً');
      return;
    }
    setIsLoading(true);
    try {
      const savedUsers = await storageService.getUsers();
      if (isLoginMode) {
        const foundUser = savedUsers.find((u: any) => u.username === cleanUsername && u.password === password);
        if (foundUser) {
          const session: User = { username: cleanUsername, lastLogin: new Date().toISOString(), avatar: foundUser.avatar };
          storageService.setSession(session);
          onLogin(session);
        } else {
          setError('بيانات الدخول غير صحيحة');
          setIsLoading(false);
        }
      } else {
        if (savedUsers.some((u: any) => u.username === cleanUsername)) {
          setError('هذا المعرف محجوز مسبقاً');
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
      setError("فشل في الاتصال بالنظام");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] font-sans overflow-hidden relative">
      <style>{`
        @keyframes aurora {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(15%, 10%) scale(1.3); opacity: 0.5; }
        }
        .aurora-blur {
          filter: blur(120px);
          animation: aurora 20s infinite alternate ease-in-out;
        }
        @keyframes heartPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
        }
        .animate-heart { animation: heartPulse 1.2s infinite; display: inline-block; }
        .text-neon-blue {
          color: #60a5fa;
          text-shadow: 0 0 10px rgba(96, 165, 250, 0.7), 0 0 20px rgba(96, 165, 250, 0.4);
        }
        .portal-shadow {
          box-shadow: 0 0 80px -10px rgba(37, 99, 235, 0.25);
        }
      `}</style>

      {/* المتحركات الخلفية */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full aurora-blur"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-700/20 rounded-full aurora-blur" style={{ animationDelay: '-7s' }}></div>
      </div>

      {/* التوقيع الخاص - الركن الأيمن السفلي فقط */}
      <div className="fixed bottom-10 right-10 z-50 pointer-events-none group">
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 px-8 py-4 rounded-[30px] flex items-center gap-4 transition-all duration-500 hover:bg-white/10 hover:border-white/20">
           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">صنع بكل</span>
           <span className="animate-heart text-rose-500 text-lg">❤️</span>
           <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">من قبل</span>
           <div className="w-[1px] h-4 bg-white/20"></div>
           <span className="text-[14px] font-black text-neon-blue tracking-[0.2em]">MOSTAFA ABDO</span>
        </div>
      </div>

      <div className={`w-full max-w-[500px] p-6 z-10 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        <div className="bg-slate-900/40 backdrop-blur-[40px] border border-white/10 rounded-[60px] p-12 md:p-16 portal-shadow relative overflow-hidden group">
          
          {/* لمحة ضوئية متحركة */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-2000 pointer-events-none"></div>

          <header className="mb-14 text-center">
             <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-[0_15px_40px_rgba(37,99,235,0.4)] animate-float">
               <Icons.Sparkles className="w-10 h-10 text-white" />
             </div>
             <h2 className="text-5xl font-black text-white tracking-tighter mb-3">مهامي</h2>
             <p className="text-blue-400/80 text-[11px] font-black uppercase tracking-[0.4em] leading-relaxed">إدارة مهامك اليومية</p>
          </header>

          <form onSubmit={handleAuth} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mr-6 block">معرف الوصول</label>
              <input 
                required value={username} onChange={e => setUsername(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-[28px] py-6 px-10 text-white font-bold outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder:text-white/10"
                placeholder="اسم المستخدم الخاص بك"
              />
            </div>

            {!isLoginMode && (
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mr-6 block">البريد السحابي</label>
                <input 
                  type="email" required value={email} onChange={e => setEmail(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 rounded-[28px] py-6 px-10 text-white font-bold outline-none focus:border-blue-500 transition-all placeholder:text-white/10"
                  placeholder="yourname@cloud.com"
                />
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mr-6 block">شفرة المرور</label>
              <input 
                type="password" required value={password} onChange={e => setPassword(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-[28px] py-6 px-10 text-white font-bold outline-none focus:border-blue-500 transition-all placeholder:text-white/10"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl text-rose-400 text-xs font-black text-center animate-in zoom-in-95">
                {error}
              </div>
            )}

            <button 
              disabled={isLoading}
              className="w-full py-7 bg-blue-600 hover:bg-blue-500 text-white rounded-[32px] text-lg font-black shadow-2xl shadow-blue-600/30 active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-4 relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
              {isLoading ? (
                <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="relative z-10">{isLoginMode ? 'دخول آمن للمنصة' : 'بدء رحلة الإنجاز'}</span>
              )}
            </button>
          </form>

          <footer className="mt-12 text-center">
            <button onClick={() => setIsLoginMode(!isLoginMode)} className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] hover:text-blue-400 transition-colors py-2">
              {isLoginMode ? 'لا تملك حساباً؟ أنشئ واحداً الآن' : 'لديك حساب بالفعل؟ سجل الدخول'}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Auth;
