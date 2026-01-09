
import React, { useState } from 'react';
import { User } from '../types';
import { Icons } from '../constants';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return setError('مطلوب بيانات الاعتماد للمتابعة');
    setIsLoading(true);
    setTimeout(() => {
      const savedUsers = JSON.parse(localStorage.getItem('maham_users_registry') || '[]');
      if (isLoginMode) {
        const user = savedUsers.find((u: any) => u.username === username && u.password === password);
        if (user) {
          const session = { username, lastLogin: new Date().toISOString(), xp: user.xp || 0, level: user.level || 1 };
          localStorage.setItem('maham_active_session', JSON.stringify(session));
          onLogin(session);
        } else {
          setError('فشل في التحقق من صحة المستخدم');
          setIsLoading(false);
        }
      } else {
        if (savedUsers.some((u: any) => u.username === username)) {
          setError('هذا المعرف مستخدم بالفعل في النظام');
          setIsLoading(false);
        } else {
          const newUser = { username, password, xp: 0, level: 1 };
          localStorage.setItem('maham_users_registry', JSON.stringify([...savedUsers, newUser]));
          const session = { username, lastLogin: new Date().toISOString(), xp: 0, level: 1 };
          localStorage.setItem('maham_active_session', JSON.stringify(session));
          onLogin(session);
        }
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative bg-transparent overflow-hidden">
      
      <div className="w-full max-w-[440px] space-y-10 z-10 animate-in fade-in zoom-in duration-700">
        
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-cmd-accent/10 rounded-2xl border border-cmd-accent/20 mb-4 shadow-[0_0_30px_rgba(0,242,255,0.1)]">
             <Icons.Sparkles className="w-10 h-10 text-cmd-accent animate-pulse" />
          </div>
          <h1 className="text-6xl font-black text-white tracking-tighter uppercase italic drop-shadow-[0_0_10px_rgba(0,242,255,0.3)]">أثير</h1>
          <p className="text-cmd-accent/60 text-[10px] font-mono font-bold uppercase tracking-[0.5em]">نظام إدارة المهام المركزية</p>
        </div>

        <div className="cmd-glass rounded-[2.5rem] p-10 border border-cmd-border relative group overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cmd-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
          
          <div className="flex border-b border-cmd-border mb-10 relative z-10">
            <button 
              onClick={() => { setIsLoginMode(true); setError(''); }}
              className={`flex-1 pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${isLoginMode ? 'text-cmd-accent border-b-2 border-cmd-accent' : 'text-white/20'}`}
            >تسجيل الدخول</button>
            <button 
              onClick={() => { setIsLoginMode(false); setError(''); }}
              className={`flex-1 pb-4 text-[10px] font-black uppercase tracking-widest transition-all ${!isLoginMode ? 'text-cmd-accent border-b-2 border-cmd-accent' : 'text-white/20'}`}
            >إنشاء حساب</button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] text-cmd-text-dim uppercase font-black tracking-widest px-2">معرف المستخدم</label>
              <input 
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-cmd-border rounded-xl px-6 py-4 outline-none focus:border-cmd-accent transition-all text-sm font-mono text-white placeholder:text-white/10"
                placeholder="USER_ID"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] text-cmd-text-dim uppercase font-black tracking-widest px-2">كلمة المرور</label>
              <input 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-cmd-border rounded-xl px-6 py-4 outline-none focus:border-cmd-accent transition-all text-sm font-mono text-white placeholder:text-white/10"
                placeholder="********"
              />
            </div>

            {error && <p className="text-rose-500 text-[10px] font-mono font-bold text-center bg-rose-500/10 py-2 rounded-lg animate-bounce">{error}</p>}

            <button 
              disabled={isLoading}
              className="w-full bg-white text-black font-black py-5 rounded-xl mt-4 hover:bg-cmd-accent transition-all disabled:opacity-50 text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 cmd-button-glow shadow-xl"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLoginMode ? 'بدء الجلسة' : 'إنشاء معرف'}</span>
                  <Icons.Plus className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Custom Glowing Footer Credits */}
        <div className="flex flex-col items-center justify-center space-y-4 pt-4">
          <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-cmd-accent/50 to-transparent"></div>
          <p className="text-sm font-bold text-white/40 tracking-wide flex items-center gap-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
            <span>صنع بكل</span>
            <span className="text-rose-500 animate-pulse drop-shadow-[0_0_10px_rgba(244,63,94,0.6)] text-lg">❤️</span>
            <span>من قبل</span>
            <span className="text-cmd-accent font-black tracking-tighter italic drop-shadow-[0_0_12px_rgba(0,242,255,0.5)]">Mostafa Abdo</span>
          </p>
          <div className="flex items-center gap-4 opacity-20 text-[8px] font-mono font-black uppercase tracking-[0.4em] text-cmd-text-dim">
             <span>VER 3.0.1</span>
             <span className="w-1 h-1 bg-white rounded-full"></span>
             <span>S-CODE: ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
