
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
    <div className="min-h-screen w-full flex bg-[#0f172a] font-sans overflow-hidden selection:bg-blue-500/30">
      <style>{`
        @keyframes aurora {
          0% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
          50% { transform: translate(-45%, -55%) rotate(180deg) scale(1.2); }
          100% { transform: translate(-50%, -50%) rotate(360deg) scale(1); }
        }
        .aurora-bg {
          position: absolute;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle at 50% 50%, #1e3a8a 0%, #1e293b 40%, #0f172a 100%);
          filter: blur(80px);
          animation: aurora 30s linear infinite;
          opacity: 0.6;
        }
        .input-glow:focus-within {
          box-shadow: 0 0 20px rgba(37, 99, 235, 0.2);
          border-color: #2563eb;
        }
        .shimmer-text {
          background: linear-gradient(90deg, #94a3b8, #fff, #94a3b8);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shine 3s linear infinite;
        }
        @keyframes shine {
          to { background-position: 200% center; }
        }
      `}</style>

      {/* Decorative Aurora Background Layers */}
      <div className="absolute inset-0 z-0">
        <div className="aurora-bg" style={{ top: '20%', left: '30%', background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)', opacity: 0.15 }}></div>
        <div className="aurora-bg" style={{ top: '80%', left: '70%', background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)', opacity: 0.15, animationDirection: 'reverse' }}></div>
      </div>

      <div className="relative z-10 w-full flex flex-col lg:flex-row h-screen">
        
        {/* Left Side: Branding & Experience */}
        <div className="hidden lg:flex w-[40%] flex-col justify-between p-20 bg-black/20 backdrop-blur-3xl border-l border-white/5">
          <div className="space-y-12">
            <div className="inline-flex items-center gap-4 group">
               <div className="w-16 h-16 bg-blue-600 rounded-[28px] flex items-center justify-center shadow-[0_20px_40px_rgba(37,99,235,0.4)] transition-transform duration-700 group-hover:rotate-12">
                  <Icons.Sparkles className="w-10 h-10 text-white" />
               </div>
               <div className="space-y-1">
                 <h2 className="text-3xl font-black text-white tracking-tighter">منصة مهامي</h2>
                 <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">نظام الإدارة الفائق</p>
               </div>
            </div>

            <div className="space-y-6">
              <h1 className="text-6xl font-black text-white leading-tight tracking-tight">
                أعد تعريف <br/>
                <span className="shimmer-text">إنتاجيتك اليوم</span>
              </h1>
              <p className="text-lg font-bold text-slate-400 leading-relaxed max-w-sm">
                انضم إلى آلاف المحترفين الذين يستخدمون نظامنا الذكي لتنظيم أعمالهم وحياتهم الشخصية بكل سهولة.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <p className="text-3xl font-black text-white">99.9%</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">معدل الإنجاز</p>
             </div>
             <div className="space-y-2">
                <p className="text-3xl font-black text-white">256-Bit</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">أمان البيانات</p>
             </div>
          </div>
        </div>

        {/* Right Side: Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
          
          {/* Main Auth Card */}
          <div className="w-full max-w-[500px] space-y-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            
            <header className="text-center space-y-4">
               <div className="lg:hidden w-20 h-20 bg-blue-600 rounded-[30px] flex items-center justify-center text-white mx-auto shadow-2xl mb-8">
                  <Icons.Sparkles className="w-12 h-12" />
               </div>
               <h3 className="text-4xl font-black text-white tracking-tight">
                 {isLoginMode ? 'أهلاً بك مجدداً' : 'إنشاء هوية رقمية'}
               </h3>
               <p className="text-slate-500 font-bold">
                 {isLoginMode ? 'الرجاء إدخال بيانات الدخول المعتمدة' : 'ابدأ رحلتك نحو التنظيم الفائق اليوم'}
               </p>
            </header>

            <form onSubmit={handleAuth} className="space-y-6">
              {/* Username Input */}
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mr-4 block">اسم المستخدم</label>
                <div className="relative group input-glow bg-white/5 border border-white/10 rounded-[28px] transition-all">
                  <Icons.User className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    required 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    className="w-full bg-transparent py-6 pr-14 pl-8 text-white font-bold outline-none placeholder:text-slate-600" 
                    placeholder="UserID الفريد الخاص بك" 
                  />
                </div>
              </div>

              {!isLoginMode && (
                <>
                  {/* Email Input */}
                  <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mr-4 block">البريد الإلكتروني</label>
                    <div className="relative group input-glow bg-white/5 border border-white/10 rounded-[28px] transition-all">
                      <Icons.Plus className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors rotate-45" />
                      <input 
                        type="email" 
                        required 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className="w-full bg-transparent py-6 pr-14 pl-8 text-white font-bold outline-none placeholder:text-slate-600" 
                        placeholder="name@company.com" 
                      />
                    </div>
                  </div>
                  
                  {/* Phone Input with Select */}
                  <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                    <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mr-4 block">رقم الجوال</label>
                    <div className="flex gap-3">
                      <div className="relative" ref={dropdownRef}>
                        <button 
                          type="button"
                          onClick={() => setIsCountryListOpen(!isCountryListOpen)}
                          className="h-full bg-white/5 border border-white/10 rounded-[24px] px-5 flex items-center gap-3 text-white font-black hover:bg-white/10 transition-colors"
                        >
                          <span className="text-xl">{selectedCountry.flag}</span>
                          <span className="text-sm">{selectedCountry.code}</span>
                        </button>
                        
                        {isCountryListOpen && (
                          <div className="absolute top-full right-0 mt-3 w-64 bg-slate-900 border border-white/10 rounded-[24px] shadow-2xl overflow-hidden z-[100] animate-in zoom-in-95">
                             {COUNTRY_CODES.map(c => (
                               <button 
                                 key={c.code}
                                 type="button"
                                 onClick={() => { setSelectedCountry(c); setIsCountryListOpen(false); setPhone(''); }}
                                 className="w-full flex items-center justify-between p-4 hover:bg-blue-600/20 text-right transition-colors"
                               >
                                  <div className="flex items-center gap-3">
                                    <span className="text-xl">{c.flag}</span>
                                    <span className="text-sm font-bold text-white">{c.name}</span>
                                  </div>
                                  <span className="text-xs font-black text-slate-500">{c.code}</span>
                               </button>
                             ))}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 group input-glow bg-white/5 border border-white/10 rounded-[28px] transition-all">
                        <input 
                          type="tel" 
                          required 
                          value={phone} 
                          onChange={e => handlePhoneChange(e.target.value)} 
                          className="w-full bg-transparent py-6 px-8 text-white font-black outline-none placeholder:text-slate-600 tracking-widest text-left" 
                          placeholder={selectedCountry.placeholder} 
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Password Input */}
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mr-4 block">كلمة المرور</label>
                <div className="relative group input-glow bg-white/5 border border-white/10 rounded-[28px] transition-all">
                  <Icons.Shield className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    type="password" 
                    required 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    className="w-full bg-transparent py-6 pr-14 pl-8 text-white font-bold outline-none placeholder:text-slate-600" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              {error && (
                <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-black flex items-center gap-3 animate-in zoom-in-95">
                  <div className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0">!</div>
                  <span>{error}</span>
                </div>
              )}

              <button 
                disabled={isLoading}
                className="group relative w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[28px] text-lg font-black transition-all shadow-[0_20px_50px_rgba(37,99,235,0.3)] active:scale-95 disabled:opacity-50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="relative z-10 flex items-center justify-center gap-4">
                  {isLoading ? (
                    <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>{isLoginMode ? 'دخول النظام' : 'تفعيل العضوية'}</span>
                      <Icons.Chevron className="w-5 h-5 -rotate-90 group-hover:translate-x-[-4px] transition-transform" />
                    </>
                  )}
                </div>
              </button>
            </form>

            <footer className="text-center pt-6">
              <button 
                onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }} 
                className="text-sm font-black text-blue-400 hover:text-blue-300 transition-colors flex flex-col items-center gap-2 mx-auto"
              >
                <span className="opacity-50">{isLoginMode ? 'لا تملك تصريح وصول؟' : 'تملك حساباً بالفعل؟'}</span>
                <span className="text-base border-b-2 border-blue-400/20 pb-1">{isLoginMode ? 'ابدأ كعضو جديد الآن' : 'قم بتسجيل الدخول'}</span>
              </button>
            </footer>
          </div>

          {/* Bottom Branding Tag */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden lg:block">
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.6em]">Premium Infrastructure 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
