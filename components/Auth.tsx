
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Icons } from '../constants';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemReady, setSystemReady] = useState(false);

  useEffect(() => {
    // محاكاة تحميل النظام عند الفتح
    const timer = setTimeout(() => setSystemReady(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('تحذير: الحقول مطلوبة للتحقق الرقمي');
      return;
    }

    setIsLoading(true);
    setError('');

    // محاكاة عملية التحقق الأمنية
    setTimeout(() => {
      const users = JSON.parse(localStorage.getItem('maham_users') || '[]');
      
      if (isLogin) {
        const user = users.find((u: any) => u.username === username && u.password === password);
        if (user) {
          onLogin({ username, lastLogin: new Date().toISOString() });
        } else {
          setError('فشل المصادقة: البيانات غير متطابقة مع قاعدة البيانات');
          setIsLoading(false);
        }
      } else {
        if (users.find((u: any) => u.username === username)) {
          setError('تنبيه: اسم المستخدم موجود بالفعل في الشبكة');
          setIsLoading(false);
        } else {
          const newUser = { username, password };
          localStorage.setItem('maham_users', JSON.stringify([...users, newUser]));
          onLogin({ username, lastLogin: new Date().toISOString() });
        }
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-cyber-black font-cairo">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyber-blue/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-cyber-purple/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-grid opacity-20"></div>
      </div>

      <div className={`w-full max-w-md relative transition-all duration-1000 transform ${systemReady ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Top Header Section */}
        <div className="text-center mb-8">
          <div className="relative inline-block group">
            <div className="absolute -inset-1 bg-gradient-to-r from-cyber-blue to-cyber-purple rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
            <div className="relative px-6 py-6 bg-cyber-dark rounded-3xl border border-white/10 flex items-center justify-center">
               <div className="text-cyber-blue scale-150 animate-orbit">
                 <Icons.Sparkles />
               </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <h1 className="text-5xl font-black neon-text uppercase tracking-tighter tracking-widest text-white">نظـام مهـام</h1>
            <div className="flex items-center justify-center gap-2">
              <span className="w-12 h-[1px] bg-gradient-to-r from-transparent to-cyber-blue"></span>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Secure Access Protocol</p>
              <span className="w-12 h-[1px] bg-gradient-to-l from-transparent to-cyber-blue"></span>
            </div>
          </div>
        </div>

        {/* Main Glass Card */}
        <div className="cyber-card rounded-[3rem] border border-white/10 p-1 bg-white/[0.02] shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
          <div className="relative bg-cyber-dark/40 backdrop-blur-3xl rounded-[2.9rem] p-10 lg:p-14 overflow-hidden">
            
            {/* Animated Scanning Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-cyber-blue/40 shadow-[0_0_15px_#00d2ff] animate-scan z-20"></div>
            
            <form onSubmit={handleAuth} className="space-y-8 relative z-10">
              
              <div className="space-y-4">
                <div className="relative group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 mb-2 block flex justify-between">
                    <span>إسم المستخدم</span>
                    <span className="text-cyber-blue/40 font-mono">USERNAME</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pr-12 pl-6 outline-none focus:border-cyber-blue focus:bg-white/10 transition-all font-bold text-white placeholder:text-slate-700 text-right"
                      placeholder="أدخل اسم المستخدم"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyber-blue transition-colors">
                      <Icons.Folder />
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 mb-2 block flex justify-between">
                    <span>كلمة المرور</span>
                    <span className="text-cyber-purple/40 font-mono">PASSWORD</span>
                  </label>
                  <div className="relative">
                    <input 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pr-12 pl-6 outline-none focus:border-cyber-purple focus:bg-white/10 transition-all font-bold text-white placeholder:text-slate-700 text-right"
                      placeholder="••••••••"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-cyber-purple transition-colors">
                      <Icons.Pin />
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-[11px] font-black text-cyber-rose uppercase text-center p-3 rounded-xl bg-cyber-rose/5 border border-cyber-rose/20 animate-glitch">
                  {error}
                </div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className={`w-full group relative overflow-hidden bg-cyber-blue text-black font-black py-5 rounded-2xl transition-all duration-500 transform active:scale-95 shadow-[0_10px_40px_rgba(0,210,255,0.3)] hover:shadow-[0_20px_60px_rgba(0,210,255,0.5)] ${isLoading ? 'opacity-70 grayscale' : ''}`}
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <div className="relative flex items-center justify-center gap-3">
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="text-lg uppercase tracking-widest">{isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}</span>
                      <Icons.Chevron />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-10 text-center relative z-10">
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-[11px] font-black text-slate-500 hover:text-cyber-blue transition-all duration-300 uppercase tracking-[0.2em] relative inline-block group"
              >
                {isLogin ? 'ليس لديك حساب؟ أنشئ حساباً جديداً' : 'لديك حساب؟ قم بتسجيل الدخول'}
                <span className="absolute bottom-[-4px] right-0 w-0 h-[1px] bg-cyber-blue group-hover:w-full transition-all duration-300"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer System Status Bar */}
        <div className="mt-12 flex flex-col items-center gap-4">
           <div className="flex items-center gap-6 text-[9px] font-black text-slate-600 uppercase tracking-widest">
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyber-lime animate-pulse"></span> ONLINE</span>
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyber-blue/40"></span> V4.0.2</span>
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-cyber-purple/40"></span> AES-256</span>
           </div>
           
           <div className="text-center">
             <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.3em] mb-1">
               بروتوكول أمان نشط &copy; {new Date().getFullYear()} MAHAM OS
             </p>
             <p className="text-[11px] font-bold text-slate-500 transition-colors duration-500">
               صنع بكل <span className="text-cyber-rose animate-pulse inline-block">❤️</span> من قبل <span className="text-white">Mostafa Abdo</span>
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
