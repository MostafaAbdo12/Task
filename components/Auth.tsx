
import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { Icons } from '../constants';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const getUsers = (): any[] => {
    const data = localStorage.getItem('maham_users_registry');
    return data ? JSON.parse(data) : [];
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('نظام الأمان يتطلب إدخال كافة البيانات');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const users = getUsers();
      if (isLoginMode) {
        const user = users.find(u => u.username === username && u.password === password);
        if (user) {
          const sessionUser: User = { username: user.username, lastLogin: new Date().toISOString() };
          localStorage.setItem('maham_active_session', JSON.stringify(sessionUser));
          onLogin(sessionUser);
        } else {
          setError('فشل في التحقق: بيانات الاعتماد غير صالحة');
          setIsLoading(false);
        }
      } else {
        const userExists = users.some(u => u.username === username);
        if (userExists) {
          setError('المعرف الرقمي مستخدم بالفعل في الشبكة');
          setIsLoading(false);
        } else {
          const newUser = { username, password };
          users.push(newUser);
          localStorage.setItem('maham_users_registry', JSON.stringify(users));
          const sessionUser: User = { username: newUser.username, lastLogin: new Date().toISOString() };
          localStorage.setItem('maham_active_session', JSON.stringify(sessionUser));
          onLogin(sessionUser);
        }
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#020205] relative overflow-hidden font-sans select-none perspective-1000">
      
      {/* Dynamic Animated Background Core */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Floating Data Nodes */}
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-cyber-blue rounded-full blur-[2px] animate-float-data"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
                animationDelay: Math.random() * 10 + 's',
                animationDuration: Math.random() * 10 + 10 + 's'
              }}
            />
          ))}
        </div>
        
        <div className="absolute top-[-20%] left-[-10%] w-[100vw] h-[100vh] bg-cyber-blue/5 blur-[120px] rounded-full animate-aura-shift"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[100vw] h-[100vh] bg-cyber-purple/5 blur-[120px] rounded-full animate-aura-shift" style={{ animationDirection: 'reverse' }}></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.05] mix-blend-overlay"></div>
      </div>

      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`w-full max-w-[480px] z-10 transition-all duration-1000 ease-out transform ${isMounted ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}
        style={{
          transform: `perspective(1000px) rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`
        }}
      >
        
        {/* Cinematic Header */}
        <div className="text-center mb-10 space-y-4">
          <div className="relative inline-flex group">
            <div className="absolute inset-0 bg-cyber-blue/40 blur-3xl group-hover:bg-cyber-blue/60 transition-all rounded-full animate-pulse"></div>
            <div className="relative w-24 h-24 bg-zinc-950/80 border border-white/10 rounded-[2.5rem] flex items-center justify-center shadow-2xl backdrop-blur-xl group-hover:scale-110 transition-transform duration-700">
               <Icons.Sparkles className="w-12 h-12 text-cyber-blue drop-shadow-[0_0_15px_rgba(0,242,255,0.8)]" />
               <div className="absolute inset-2 border border-white/5 rounded-[2rem] animate-spin-slow opacity-30"></div>
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-6xl font-black text-white italic tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">إنجاز</h1>
            <p className="text-zinc-600 text-[10px] font-black tracking-[0.5em] uppercase animate-pulse">Neural Productivity Interface</p>
          </div>
        </div>

        {/* Main Interaction Hub */}
        <div className="relative">
          {/* Glowing Outer Ring */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-cyber-blue/20 via-white/10 to-cyber-purple/20 rounded-[3rem] blur-[2px]"></div>
          
          <div className="relative bg-zinc-950/60 backdrop-blur-[40px] border border-white/10 rounded-[3rem] p-10 md:p-14 shadow-2xl overflow-hidden group">
            
            {/* Holographic Scan Line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyber-blue/30 to-transparent animate-scan-line opacity-20"></div>

            {/* Segmented Mode Switcher */}
            <div className="flex p-1.5 bg-black/60 border border-white/5 rounded-2xl mb-12 relative overflow-hidden">
              <div 
                className="absolute top-1.5 bottom-1.5 w-[calc(50%-3px)] bg-gradient-to-br from-white to-zinc-300 rounded-xl transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                style={{ 
                  transform: `translateX(${isLoginMode ? '0%' : '-100%'})`,
                  right: '1.5px' 
                }}
              ></div>
              <button 
                type="button"
                onClick={() => { setIsLoginMode(true); setError(''); }}
                className={`flex-1 relative z-10 py-3.5 text-[11px] font-black uppercase tracking-widest transition-colors duration-500 ${isLoginMode ? 'text-black' : 'text-zinc-600 hover:text-white'}`}
              >
                دخول النظام
              </button>
              <button 
                type="button"
                onClick={() => { setIsLoginMode(false); setError(''); }}
                className={`flex-1 relative z-10 py-3.5 text-[11px] font-black uppercase tracking-widest transition-colors duration-500 ${!isLoginMode ? 'text-black' : 'text-zinc-600 hover:text-white'}`}
              >
                تفعيل حساب
              </button>
            </div>

            <form onSubmit={handleAuth} className="space-y-8">
              {/* Identity Matrix Input */}
              <div className="space-y-3 group/field">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-focus-within/field:text-cyber-blue transition-colors">المعرف الرقمي</label>
                  <Icons.User className="w-3.5 h-3.5 text-zinc-700 group-focus-within/field:text-cyber-blue transition-colors" />
                </div>
                <div className="relative">
                  <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl pr-6 pl-6 py-5 outline-none focus:border-cyber-blue/40 focus:bg-white/[0.03] transition-all text-white font-bold placeholder:text-zinc-800 text-base"
                    placeholder="User_ID"
                  />
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-cyber-blue group-focus-within/field:w-[80%] transition-all duration-700"></div>
                </div>
              </div>

              {/* Secure Access Key Input */}
              <div className="space-y-3 group/field">
                <div className="flex justify-between items-center px-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-focus-within/field:text-cyber-purple transition-colors">مفتاح الوصول</label>
                  <Icons.Sun className="w-3.5 h-3.5 text-zinc-700 group-focus-within/field:text-cyber-purple transition-colors" />
                </div>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl pr-6 pl-14 py-5 outline-none focus:border-cyber-purple/40 focus:bg-white/[0.03] transition-all text-white font-bold placeholder:text-zinc-800 text-base"
                    placeholder="Access_Key"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-5 flex items-center text-zinc-700 hover:text-zinc-400 transition-colors"
                  >
                    {showPassword ? <Icons.Eye className="w-5 h-5 text-cyber-purple" /> : <Icons.Eye className="w-5 h-5 opacity-30" />}
                  </button>
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-cyber-purple group-focus-within/field:w-[80%] transition-all duration-700"></div>
                </div>
              </div>

              {/* Diagnostic Message */}
              <div className={`overflow-hidden transition-all duration-500 ${error ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black py-4 px-6 rounded-2xl flex items-center gap-4 animate-shake shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_#ff0055] animate-pulse"></span>
                  <p>{error}</p>
                </div>
              </div>

              {/* Execution Trigger Button */}
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full h-16 group/btn relative overflow-hidden rounded-2xl transition-all duration-700 active:scale-[0.98] mt-6 shadow-2xl shadow-cyber-blue/10"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-blue bg-[length:200%_auto] animate-shimmer opacity-90 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                
                <div className="relative h-full flex items-center justify-center gap-5">
                  {isLoading ? (
                    <div className="flex items-center gap-4">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">مزامنة النواة...</span>
                    </div>
                  ) : (
                    <>
                      <span className="text-[11px] font-black text-white uppercase tracking-[0.6em] group-hover:tracking-[0.8em] transition-all duration-500">
                        {isLoginMode ? 'تأكيد الاتصال' : 'بدء المزامنة'}
                      </span>
                      <Icons.Chevron className="-rotate-90 text-white w-4 h-4 group-hover:translate-x-1 transition-transform duration-500" />
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>
        </div>

        {/* Global Footer Meta */}
        <div className="mt-14 text-center animate-fade-in" style={{ animationDelay: '0.8s' }}>
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-6 group cursor-default">
              <div className="w-12 h-[1px] bg-gradient-to-r from-transparent to-zinc-800"></div>
              <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-600 transition-colors duration-700 group-hover:text-zinc-400">
                صنع بكل <span className="text-cyber-rose animate-pulse inline-block mx-1 drop-shadow-[0_0_5px_#ff0055]">❤️</span> بواسطة 
                <span className="mr-3 text-zinc-500 font-black hover:text-cyber-blue transition-all">Mostafa Abdo</span>
              </p>
              <div className="w-12 h-[1px] bg-gradient-to-l from-transparent to-zinc-800"></div>
            </div>
            
            <div className="flex items-center gap-6 opacity-30">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyber-emerald shadow-[0_0_8px_#00ffaa]"></div>
                  <span className="text-[8px] font-black text-zinc-700 tracking-[0.4em] uppercase">Engine v6.1.0</span>
               </div>
               <span className="text-[8px] font-black text-zinc-800 tracking-[0.2em] uppercase">© 2025 HYPER-ENJAZ CORE</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes floatData {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.1; }
          50% { transform: translateY(-100px) translateX(20px); opacity: 0.5; }
        }
        .animate-float-data {
          animation: floatData infinite ease-in-out;
        }
        @keyframes auraShift {
          0%, 100% { transform: scale(1) translate(0,0); opacity: 0.4; }
          50% { transform: scale(1.2) translate(5%, 5%); opacity: 0.6; }
        }
        .animate-aura-shift {
          animation: auraShift 15s ease-in-out infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        input:-webkit-autofill {
          -webkit-text-fill-color: white !important;
          -webkit-box-shadow: 0 0 0px 1000px #000 inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  );
};

export default Auth;
