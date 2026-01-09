
import React, { useState } from 'react';
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

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('يرجى ملء جميع الحقول المشفرة');
      return;
    }

    const users = JSON.parse(localStorage.getItem('maham_users') || '[]');
    
    if (isLogin) {
      const user = users.find((u: any) => u.username === username && u.password === password);
      if (user) {
        onLogin({ username, lastLogin: new Date().toISOString() });
      } else {
        setError('خطأ في بروتوكول الدخول: البيانات غير متطابقة');
      }
    } else {
      if (users.find((u: any) => u.username === username)) {
        setError('اسم المستخدم محجوز مسبقاً في قاعدة البيانات');
      } else {
        const newUser = { username, password };
        localStorage.setItem('maham_users', JSON.stringify([...users, newUser]));
        onLogin({ username, lastLogin: new Date().toISOString() });
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-cyber-black relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyber-blue/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyber-purple/10 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md relative animate-fade-up">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-3xl bg-cyber-blue/10 border border-cyber-blue/20 mb-6 animate-pulse-neon">
            <Icons.Sparkles />
          </div>
          <h1 className="text-4xl font-black neon-text uppercase tracking-tighter mb-2">نظام مهام</h1>
          <p className="text-slate-500 text-sm font-bold tracking-widest uppercase">الوصول إلى قاعدة البيانات المركزية</p>
        </div>

        <div className="cyber-card rounded-[2.5rem] border border-white/5 p-8 lg:p-12 shadow-2xl relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-cyber-blue animate-scan opacity-20"></div>
          
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">معرف المستخدم (Username)</label>
              <input 
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-cyber-blue transition-all font-bold"
                placeholder="أدخل المعرف..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest px-2">مفتاح التشفير (Password)</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-cyber-purple transition-all font-bold"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="text-[10px] font-black text-cyber-rose uppercase text-center animate-glitch">
                {error}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-cyber-blue text-black font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(0,210,255,0.3)]"
            >
              {isLogin ? 'بدء الجلسة' : 'تسجيل حساب جديد'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="text-[11px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
            >
              {isLogin ? 'لا تملك تصريحاً؟ أنشئ حساباً جديداً' : 'لديك حساب؟ قم بتسجيل الدخول'}
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-[9px] font-bold text-slate-700 uppercase tracking-[0.3em]">
          بروتوكول أمان نشط &copy; {new Date().getFullYear()} MAHAM OS
        </p>
      </div>
    </div>
  );
};

export default Auth;
