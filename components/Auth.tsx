
import React, { useState, useRef, useEffect } from 'react';
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
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || window.innerWidth < 1024) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    // Smooth 3D tilt for desktop only
    const rotateX = (y - 50) / 18;
    const rotateY = (x - 50) / -18;
    cardRef.current.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg)`;
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const cleanUsername = username.trim().toLowerCase();

    if (cleanUsername.length < 3) {
      setError('المعرف الشخصي قصير جداً.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const savedUsers = storageService.getUsers();
      if (isLoginMode) {
        const foundUser = savedUsers.find((u: any) => u.username === cleanUsername && u.password === password);
        if (foundUser) {
          const session: User = { 
            username: cleanUsername, 
            lastLogin: new Date().toISOString(),
            avatar: foundUser.avatar
          };
          storageService.setSession(session);
          sessionStorage.setItem('auth_success_msg', `تم تفعيل بروتوكول الوصول.. أهلاً بك يا ${cleanUsername}`);
          onLogin(session);
        } else {
          setError('خطأ في البيانات.. يرجى التحقق من شفرة العبور.');
          setIsLoading(false);
        }
      } else {
        const newUser = { username: cleanUsername, password, email, createdAt: new Date().toISOString() };
        storageService.registerUser(newUser);
        storageService.initializeNewAccount(cleanUsername);
        const session: User = { username: cleanUsername, lastLogin: new Date().toISOString() };
        storageService.setSession(session);
        onLogin(session);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#020617] items-center justify-center p-4 md:p-10 overflow-x-hidden relative selection:bg-blue-500/40 font-sans">
      <style>{`
        @keyframes border-rotate {
          100% { transform: rotate(360deg); }
        }
        
        .nexus-card {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(40px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 40px 100px -20px rgba(0, 0, 0, 0.9);
          position: relative;
          overflow: hidden;
          transition: transform 0.4s cubic-bezier(0.2, 0, 0.2, 1);
        }

        .nexus-card::after {
          content: '';
          position: absolute;
          inset: -1px;
          background: conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 300deg, #3b82f6 360deg);
          animation: border-rotate 4s linear infinite;
          z-index: -1;
          pointer-events: none;
        }

        .input-nexus {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.4s ease;
        }
        .input-nexus:focus-within {
          background: rgba(59, 130, 246, 0.08);
          border-color: rgba(59, 130, 246, 0.4);
          box-shadow: 0 0 40px rgba(59, 130, 246, 0.1);
        }

        @keyframes nebula-float {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.15; }
          50% { transform: translate(5%, 5%) scale(1.1); opacity: 0.25; }
        }
        .nebula {
          animation: nebula-float 15s ease-in-out infinite;
          filter: blur(120px);
        }

        .shimmer-btn {
          background: linear-gradient(90deg, #2563eb, #4f46e5, #2563eb);
          background-size: 200% auto;
          transition: 0.5s;
        }
        .shimmer-btn:hover {
          background-position: right center;
          box-shadow: 0 10px 40px rgba(37, 99, 235, 0.5);
        }

        .glass-medallion {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 15px 35px rgba(0,0,0,0.4);
        }
      `}</style>

      {/* Deep Space Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600 nebula rounded-full"></div>
        <div className="absolute bottom-[-15%] left-[-10%] w-[50%] h-[50%] bg-indigo-700 nebula rounded-full" style={{ animationDelay: '4s' }}></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.05]"></div>
      </div>

      <div className="w-full max-w-[480px] z-10 flex flex-col items-center">
        {/* Main Interface */}
        <div 
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full nexus-card rounded-[56px] p-8 md:p-14 animate-in fade-in zoom-in-95 duration-1000"
        >
          {/* Brand Hub */}
          <div className="text-center mb-12">
            <div className="inline-flex relative mb-8">
              <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-30 animate-pulse"></div>
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-[36px] bg-gradient-to-br from-blue-600 to-indigo-900 flex items-center justify-center relative z-10 border border-white/20 shadow-2xl">
                <Icons.Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white animate-gentle-pulse" />
              </div>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
              {isLoginMode ? 'بوابة العبور' : 'تسجيل هوية'}
            </h2>
            <div className="flex items-center justify-center gap-4">
              <div className="h-[1px] w-10 bg-gradient-to-r from-transparent to-blue-500/50"></div>
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.6em] opacity-80">ENJAZ NEXUS V3</p>
              <div className="h-[1px] w-10 bg-gradient-to-l from-transparent to-blue-500/50"></div>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-6 md:space-y-8">
            {/* Input: ID */}
            <div className="space-y-3 group">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-5 block">المعرف الرقمي</label>
              <div className="relative input-nexus rounded-[26px]">
                <Icons.User className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  required 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  className="w-full bg-transparent py-5 md:py-6 pr-14 pl-8 text-white font-bold outline-none text-sm md:text-base" 
                  placeholder="اسم المستخدم" 
                />
              </div>
            </div>

            {!isLoginMode && (
              <div className="space-y-3 animate-in slide-in-from-top-4 duration-500">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-5 block">البريد المشفر</label>
                <div className="relative input-nexus rounded-[26px]">
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full bg-transparent py-5 md:py-6 px-8 text-white font-bold outline-none text-sm md:text-base" 
                    placeholder="nexus@protocol.com" 
                  />
                </div>
              </div>
            )}

            {/* Input: Access Key */}
            <div className="space-y-3 group">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-5 block">شفرة العبور</label>
              <div className="relative input-nexus rounded-[26px]">
                <Icons.Shield className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full bg-transparent py-5 md:py-6 pr-14 pl-8 text-white font-bold outline-none text-sm md:text-base" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-[22px] text-rose-400 text-[11px] font-black flex items-center gap-4 animate-in shake">
                <div className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">!</div>
                <span>{error}</span>
              </div>
            )}

            {/* Execute Button */}
            <button 
              disabled={isLoading}
              className="w-full shimmer-btn text-white py-5 md:py-7 rounded-[30px] text-base md:text-lg font-black active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 group relative overflow-hidden"
            >
              {isLoading ? (
                <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLoginMode ? 'بدء الجلسة' : 'تفعيل العضوية'}</span>
                  <Icons.Chevron className="w-6 h-6 -rotate-90 group-hover:translate-x-[-4px] transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-12 text-center">
            <button 
              onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }} 
              className="flex flex-col items-center gap-2 mx-auto group"
            >
              <span className="text-slate-500 text-[13px] font-bold transition-colors group-hover:text-slate-400">
                {isLoginMode ? 'لا تمتلك بروتوكول وصول؟' : 'تمتلك هوية نشطة؟'}
              </span>
              <span className="text-blue-400 text-sm font-black border-b border-blue-400/30 pb-0.5 group-hover:border-blue-400 transition-all">
                {isLoginMode ? 'ابدأ بروتوكول التسجيل' : 'العودة لواجهة الدخول'}
              </span>
            </button>
          </div>
        </div>

        {/* Master Signature Medallion */}
        <div className="mt-12 md:mt-16 w-full flex justify-center pb-10 animate-in slide-in-from-bottom-8 duration-1000">
          <div className="glass-medallion px-10 py-5 rounded-[36px] flex flex-col items-center gap-2 group hover:scale-110 transition-all duration-500 cursor-default">
            <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
              <span>صنع بكل</span>
              <span className="text-rose-500 text-xl animate-pulse">❤️</span>
              <span>بواسطة</span>
            </div>
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"></div>
            <div className="text-[16px] md:text-[18px] font-black text-white tracking-[0.5em] uppercase opacity-90 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:text-blue-400 transition-colors">
              MOSTAFA ABDO
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
