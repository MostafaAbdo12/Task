
import React, { useState, useEffect, useRef } from 'react';
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
  
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanUsername = username.trim().toLowerCase();
    
    if (!cleanUsername || cleanUsername.length < 3) {
      setError('معرف الهوية يجب أن يكون 3 أحرف على الأقل');
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
          setError('البيانات غير متطابقة مع سجلاتنا الرقمية');
          setIsLoading(false);
        }
      } else {
        if (savedUsers.some((u: any) => u.username === cleanUsername)) {
          setError('هذا المعرف محجوز بالفعل في قاعدة البيانات');
          setIsLoading(false);
          return;
        }
        const newUser = { 
          username: cleanUsername, 
          password, 
          email, 
          createdAt: new Date().toISOString() 
        };
        await storageService.registerUser(newUser);
        await storageService.initializeNewAccount(cleanUsername);
        const session: User = { username: cleanUsername, lastLogin: new Date().toISOString() };
        storageService.setSession(session);
        onLogin(session);
      }
    } catch (err) {
      setError("حدث خطأ في مزامنة البروتوكول السحابي");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center overflow-hidden relative selection:bg-blue-500/30">
      <style>{`
        .auth-glass-container {
          background: rgba(15, 23, 42, 0.3);
          backdrop-filter: blur(40px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);
        }
        .auth-glass-container::before {
          content: "";
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
            rgba(37, 99, 235, 0.1) 0%,
            transparent 60%
          );
          pointer-events: none;
          z-index: 0;
        }
        .input-futuristic {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .input-futuristic:focus {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(37, 99, 235, 0.5);
          box-shadow: 0 0 20px rgba(37, 99, 235, 0.1), inset 0 0 10px rgba(37, 99, 235, 0.05);
          transform: translateY(-2px);
        }
        .btn-magnetic {
          background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
          box-shadow: 0 20px 40px -10px rgba(37, 99, 235, 0.5);
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .btn-magnetic:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(37, 99, 235, 0.6);
        }
      `}</style>

      {/* Signature Credits */}
      <div className="fixed bottom-10 left-1/2 -translate-x-1/2 lg:left-auto lg:right-10 lg:translate-x-0 z-50">
        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-3xl border border-white/10 px-8 py-4 rounded-[30px] shadow-2xl transition-all hover:bg-white/10 group cursor-default">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">تم التطوير بواسطة</span>
           <div className="w-[1px] h-4 bg-white/20"></div>
           <span className="text-[14px] font-black text-blue-400 tracking-[0.2em] group-hover:text-cyan-400 transition-colors uppercase">MOSTAFA ABDO</span>
        </div>
      </div>

      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className={`w-full max-w-[540px] p-6 z-10 transition-all duration-1000 cubic-bezier(0.23, 1, 0.32, 1) ${mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95'}`}
      >
        <div className="auth-glass-container rounded-[50px] p-10 md:p-16 relative overflow-hidden group">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

          <header className="mb-14 text-center relative z-10">
             <div className="w-24 h-24 rounded-[30px] bg-blue-600 flex items-center justify-center mx-auto mb-10 transition-all duration-700 group-hover:rotate-[15deg] group-hover:scale-110 shadow-2xl">
               <Icons.Sparkles className="w-12 h-12 text-white animate-pulse" />
             </div>
             <h2 className="text-5xl lg:text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-lg">مهامي</h2>
             <div className="inline-flex items-center gap-3 bg-blue-500/10 px-6 py-2.5 rounded-full border border-blue-500/20">
               <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
               </span>
               <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em]">بوابة الإنتاجية الذكية</p>
             </div>
          </header>

          <form onSubmit={handleAuth} className="space-y-8 relative z-10">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-6 block">معرف الهوية</label>
              <div className="relative">
                <input 
                  required 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  className="w-full input-futuristic rounded-[25px] py-6 px-10 text-white font-bold outline-none placeholder:text-white/10 text-right pr-16"
                  placeholder="اسم المستخدم"
                />
                <Icons.User className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
              </div>
            </div>

            {!isLoginMode && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-6 block">البريد الإلكتروني</label>
                <div className="relative">
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full input-futuristic rounded-[25px] py-6 px-10 text-white font-bold outline-none placeholder:text-white/10 text-right pr-16"
                    placeholder="name@example.com"
                  />
                  <Icons.Mail className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-6 block">شفرة المرور</label>
              <div className="relative">
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full input-futuristic rounded-[25px] py-6 px-10 text-white font-bold outline-none placeholder:text-white/10 text-right pr-16"
                  placeholder="••••••••"
                />
                <Icons.Shield className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
              </div>
            </div>

            {error && (
              <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-[20px] text-rose-400 text-[12px] font-black text-center flex items-center justify-center gap-3 animate-in shake duration-500">
                <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                {error}
              </div>
            )}

            <button 
              disabled={isLoading}
              className="w-full py-7 btn-magnetic text-white rounded-[30px] text-lg font-black active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-700"></div>
              {isLoading ? (
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="flex items-center gap-4 relative z-10">
                  {isLoginMode ? 'دخول آمن للمنصة' : 'بدء رحلة الإنجاز'}
                  <Icons.Chevron className="w-5 h-5 -rotate-90 group-hover/btn:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          <footer className="mt-12 text-center relative z-10">
            <button 
              onClick={() => {
                setError('');
                setIsLoginMode(!isLoginMode);
              }} 
              className="text-slate-500 text-[11px] font-black uppercase tracking-[0.2em] hover:text-white transition-all py-2 border-b border-transparent hover:border-blue-500/50"
            >
              {isLoginMode ? 'لا تملك حساباً؟ انضم إلى الكفاءات' : 'لديك حساب؟ عد لمنصة الدخول'}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Auth;
