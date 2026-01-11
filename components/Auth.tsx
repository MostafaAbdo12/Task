
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { Icons } from '../constants';
import { storageService } from '../services/storageService';

interface AuthProps {
  onLogin: (user: User) => void;
}

interface CountryConfig {
  code: string;
  flag: string;
  name: string;
  short: string;
  placeholder: string;
  pattern: RegExp;
  maxLength: number;
  errorMessage: string;
}

const COUNTRY_CODES: CountryConfig[] = [
  { 
    code: '+966', flag: '🇸🇦', name: 'المملكة العربية السعودية', short: 'SA', 
    placeholder: '5xxxxxxxx', pattern: /^5\d*$/, maxLength: 9,
    errorMessage: 'رقم الجوال السعودي يجب أن يبدأ بـ 5 ويتكون من 9 أرقام.'
  },
  { 
    code: '+20', flag: '🇪🇬', name: 'جمهورية مصر العربية', short: 'EG', 
    placeholder: '1xxxxxxxxx', pattern: /^1\d*$/, maxLength: 10,
    errorMessage: 'رقم الجوال المصري يجب أن يبدأ بـ 1 ويتكون من 10 أرقام.'
  },
  { 
    code: '+971', flag: '🇦🇪', name: 'الإمارات العربية المتحدة', short: 'AE', 
    placeholder: '5xxxxxxxx', pattern: /^5\d*$/, maxLength: 9,
    errorMessage: 'رقم الجوال الإماراتي يجب أن يبدأ بـ 5 ويتكون من 9 أرقام.'
  }
];

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCountryListOpen, setIsCountryListOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryListOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePhoneChange = (val: string) => {
    const numericVal = val.replace(/\D/g, '');
    if (numericVal === '' || selectedCountry.pattern.test(numericVal)) {
      if (numericVal.length <= selectedCountry.maxLength) {
        setPhone(numericVal);
        setError('');
      }
    } else {
      setError(selectedCountry.errorMessage);
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim().toLowerCase();
    const fullPhone = selectedCountry.code + phone;

    if (!cleanUsername || cleanUsername.length < 3) {
      setError('اسم المستخدم يجب أن يكون 3 أحرف على الأقل.');
      return;
    }

    if (!isLoginMode) {
      if (!email.includes('@')) {
        setError('يرجى إدخال بريد إلكتروني صالح.');
        return;
      }
      if (phone.length !== selectedCountry.maxLength) {
        setError(selectedCountry.errorMessage);
        return;
      }

      const duplicate = storageService.checkDuplicate(cleanUsername, email, fullPhone);
      if (duplicate.exists) {
        setError(`نعتذر، ${duplicate.field} هذا مسجل مسبقاً في النظام.`);
        return;
      }
    }

    if (!password || password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 خانات على الأقل.');
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
            xp: foundUser.xp || 0,
            level: foundUser.level || 1,
            avatar: foundUser.avatar
          };
          storageService.setSession(session);
          onLogin(session);
        } else {
          setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
          setIsLoading(false);
        }
      } else {
        const newUser = { 
          username: cleanUsername, 
          password, 
          email, 
          phone: fullPhone,
          createdAt: new Date().toISOString()
        };
        
        storageService.registerUser(newUser);
        storageService.initializeNewAccount(cleanUsername);
        
        const session: User = { username: cleanUsername, lastLogin: new Date().toISOString(), xp: 0, level: 1 };
        storageService.setSession(session);
        onLogin(session);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans overflow-hidden relative">
      <style>{`
        @keyframes orbit-slow {
          from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
        }
        .animate-orbit-slow {
          animation: orbit-slow 25s linear infinite;
        }
        .mesh-bg {
          background: #0f172a;
          background-image: 
            radial-gradient(at 0% 0%, hsla(225, 39%, 30%, 1) 0, transparent 50%), 
            radial-gradient(at 50% 0%, hsla(225, 39%, 20%, 1) 0, transparent 50%), 
            radial-gradient(at 100% 0%, hsla(225, 39%, 10%, 1) 0, transparent 50%);
        }
        .input-glow:focus {
          border-color: #2563eb;
          box-shadow: 0 0 20px rgba(37, 99, 235, 0.1);
        }

        /* Kinetic Signature Styles - Re-compacted */
        @keyframes heartbeatCustom {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 1; filter: drop-shadow(0 0 5px #f43f5e); }
        }
        .animate-heart-beat { animation: heartbeatCustom 1.5s ease-in-out infinite; }
        
        @keyframes signatureKineticGlow {
          0%, 100% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.15), 0 0 30px rgba(59, 130, 246, 0.05); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.4), 0 0 50px rgba(59, 130, 246, 0.2); }
        }
        .kinetic-signature-card {
          animation: signatureKineticGlow 4s ease-in-out infinite;
          backdrop-filter: blur(12px);
          background: rgba(15, 23, 42, 0.75);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .neon-text-glow {
          text-shadow: 0 0 8px rgba(59, 130, 246, 0.6), 0 0 15px rgba(59, 130, 246, 0.3);
          background: linear-gradient(to right, #60a5fa, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Re-compacted Signature - BOTTOM RIGHT */}
      <div className="fixed right-6 bottom-6 lg:right-8 lg:bottom-8 z-[100] animate-float pointer-events-auto">
        <div className="kinetic-signature-card px-5 py-3 rounded-[25px] flex flex-col items-center gap-2 transition-transform hover:scale-105 duration-500 group cursor-default">
           <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">
             <span>صنع بكل</span>
             <span className="animate-heart-beat text-rose-500 text-sm">❤️</span>
             <span>من قبل</span>
           </div>
           <div className="h-[1px] w-10 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>
           <div className="neon-text-glow text-[13px] font-black tracking-[0.35em] uppercase select-none">
             MOSTAFA ABDO
           </div>
        </div>
      </div>

      {/* Left Side: Illustration Area (mesh-bg) */}
      <div className="hidden lg:flex w-[45%] mesh-bg relative items-center justify-center p-16 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[150px] animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500 rounded-full blur-[120px] animate-pulse delay-1000"></div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="w-[400px] h-[400px] border border-white/5 rounded-full absolute animate-orbit-slow"></div>
           <div className="w-[600px] h-[600px] border border-white/10 rounded-full absolute animate-orbit-slow" style={{ animationDirection: 'reverse', animationDuration: '40s' }}></div>
        </div>

        <div className="relative z-10 text-right space-y-10">
          <div className="inline-flex items-center gap-4 bg-white/5 backdrop-blur-xl px-8 py-4 rounded-[32px] border border-white/10 shadow-2xl">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40">
              <Icons.Sparkles className="w-7 h-7 text-white" />
            </div>
            <div>
              <span className="text-white text-sm font-black tracking-widest uppercase block">نظام مهامي 3.0</span>
              <span className="text-blue-400 text-[9px] font-bold uppercase tracking-[0.3em]">الإنتاجية الفائقة</span>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-7xl font-black text-white leading-[1.1] tracking-tighter">
              بوابة <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-400 to-indigo-300">الإنجاز الذكي</span>
            </h1>
            <p className="text-xl font-bold text-slate-400 max-w-sm leading-relaxed">
              انضم إلى آلاف المحترفين الذين يديرون حياتهم الرقمية بذكاء وأمان فائق.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-8 bg-white/5 backdrop-blur-md rounded-[40px] border border-white/10">
                <Icons.Shield className="w-10 h-10 text-blue-400 mb-4" />
                <h4 className="text-white font-black text-lg">أمان عسكري</h4>
                <p className="text-slate-500 text-xs font-bold mt-2">تشفير كلي للبيانات الشخصية</p>
             </div>
             <div className="p-8 bg-white/5 backdrop-blur-md rounded-[40px] border border-white/10">
                <Icons.LayoutDashboard className="w-10 h-10 text-indigo-400 mb-4" />
                <h4 className="text-white font-black text-lg">تزامن فوري</h4>
                <p className="text-slate-500 text-xs font-bold mt-2">الوصول لبياناتك من أي مكان</p>
             </div>
          </div>
        </div>
      </div>

      {/* Right Side: Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white relative">
        <div className="w-full max-w-[480px] space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          
          <header className="text-center space-y-4">
             <div className="lg:hidden flex justify-center mb-8">
                <div className="w-20 h-20 bg-blue-600 rounded-[30px] flex items-center justify-center text-white shadow-2xl">
                   <Icons.Sparkles className="w-12 h-12" />
                </div>
             </div>
             <h2 className="text-5xl font-black text-slate-900 tracking-tighter">
               {isLoginMode ? 'أهلاً بك' : 'ابدأ رحلتك'}
             </h2>
             <p className="text-slate-500 font-bold text-lg">
               {isLoginMode ? 'سجل دخولك للوصول إلى مركز العمليات' : 'أنشئ حساباً جديداً في بضع ثوانٍ'}
             </p>
          </header>

          <form onSubmit={handleAuth} className="space-y-8">
            <div className="space-y-3 group">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-4">اسم المستخدم</label>
              <div className="relative">
                <Icons.User className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  required 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] py-6 pr-16 pl-8 text-slate-900 font-black outline-none input-glow transition-all" 
                  placeholder="ID المستخدم" 
                />
              </div>
            </div>

            {!isLoginMode && (
              <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
                <div className="space-y-3 group">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-4">البريد الإلكتروني</label>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] py-6 px-8 text-slate-900 font-black outline-none input-glow transition-all" 
                    placeholder="example@corp.com" 
                  />
                </div>
                
                <div className="space-y-3 group">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-4">رقم الجوال</label>
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setIsCountryListOpen(!isCountryListOpen)}
                      className="bg-slate-50 border-2 border-slate-100 rounded-[28px] px-6 flex items-center gap-3 font-black text-slate-800 hover:bg-slate-100 transition-all"
                    >
                      <span className="text-xl">{selectedCountry.flag}</span>
                      <span className="text-sm">{selectedCountry.code}</span>
                    </button>
                    <input 
                      type="tel" 
                      required 
                      value={phone} 
                      onChange={e => handlePhoneChange(e.target.value)} 
                      className="flex-1 bg-slate-50 border-2 border-slate-100 rounded-[28px] py-6 px-8 text-slate-900 font-black outline-none input-glow transition-all text-left" 
                      placeholder={selectedCountry.placeholder} 
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3 group">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest mr-4">كلمة المرور</label>
              <div className="relative">
                <Icons.Shield className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[28px] py-6 pr-16 pl-8 text-slate-900 font-black outline-none input-glow transition-all" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            {error && (
              <div className="p-6 bg-rose-50 border border-rose-100 rounded-[24px] text-rose-600 text-[13px] font-black flex items-center gap-4 animate-in zoom-in-95 duration-300">
                <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">!</div>
                <span>{error}</span>
              </div>
            )}

            <button 
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-black text-white py-7 rounded-[30px] text-xl font-black transition-all shadow-[0_25px_50px_-15px_rgba(0,0,0,0.3)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              {isLoading ? (
                <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin relative z-10"></div>
              ) : (
                <>
                  <span className="relative z-10">{isLoginMode ? 'دخول النظام' : 'تفعيل الحساب'}</span>
                  <Icons.Chevron className="w-6 h-6 -rotate-90 group-hover:translate-x-[-4px] transition-transform relative z-10" />
                </>
              )}
            </button>
          </form>

          <footer className="text-center pt-8">
            <button 
              onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }} 
              className="group flex flex-col items-center gap-3 mx-auto"
            >
              <span className="text-sm font-bold text-slate-400">{isLoginMode ? 'لا تملك تصريحاً؟' : 'تملك حساباً بالفعل؟'}</span>
              <span className="text-blue-600 font-black text-xl border-b-2 border-transparent group-hover:border-blue-600 transition-all pb-1">
                {isLoginMode ? 'أنشئ هويتك الرقمية الآن' : 'سجل دخولك هنا'}
              </span>
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Auth;
