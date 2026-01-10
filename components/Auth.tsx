
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
  },
  { 
    code: '+965', flag: '🇰🇼', name: 'دولة الكويت', short: 'KW', 
    placeholder: 'xxxxxxxx', pattern: /^\d*$/, maxLength: 8,
    errorMessage: 'رقم الجوال الكويتي يتكون من 8 أرقام.'
  },
  { 
    code: '+974', flag: '🇶🇦', name: 'دولة قطر', short: 'QA', 
    placeholder: 'xxxxxxxx', pattern: /^\d*$/, maxLength: 8,
    errorMessage: 'رقم الجوال القطري يتكون من 8 أرقام.'
  },
  { 
    code: '+968', flag: '🇴🇲', name: 'سلطنة عمان', short: 'OM', 
    placeholder: 'xxxxxxxx', pattern: /^\d*$/, maxLength: 8,
    errorMessage: 'رقم الجوال العماني يتكون من 8 أرقام.'
  },
  { 
    code: '+973', flag: '🇧🇭', name: 'مملكة البحرين', short: 'BH', 
    placeholder: 'xxxxxxxx', pattern: /^\d*$/, maxLength: 8,
    errorMessage: 'رقم الجوال البحريني يتكون من 8 أرقام.'
  },
  { 
    code: '+962', flag: '🇯🇴', name: 'المملكة الأردنية الهاشمية', short: 'JO', 
    placeholder: '7xxxxxxxx', pattern: /^7\d*$/, maxLength: 9,
    errorMessage: 'رقم الجوال الأردني يجب أن يبدأ بـ 7 ويتكون من 9 أرقام.'
  },
  { 
    code: '+212', flag: '🇲🇦', name: 'المملكة المغربية', short: 'MA', 
    placeholder: 'xxxxxxxxx', pattern: /^\d*$/, maxLength: 9,
    errorMessage: 'رقم الجوال المغربي يتكون من 9 أرقام.'
  },
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
    
    // منع الكتابة إذا كان الرقم لا يطابق النمط أو تجاوز الطول
    if (numericVal === '' || selectedCountry.pattern.test(numericVal)) {
      if (numericVal.length <= selectedCountry.maxLength) {
        setPhone(numericVal);
        setError('');
      }
    } else {
      setError(selectedCountry.errorMessage);
    }
  };

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim().toLowerCase();
    
    if (!cleanUsername) {
      setError('اسم المستخدم مطلوب لبناء قاعدة بياناتك.');
      return;
    }
    if (cleanUsername.length < 3) {
      setError('اسم المستخدم يجب أن يتكون من 3 أحرف على الأقل.');
      return;
    }

    if (!isLoginMode) {
      if (!validateEmail(email)) {
        setError('يرجى إدخال بريد إلكتروني صالح (مثال: name@domain.com).');
        return;
      }
      
      // التحقق النهائي من رقم الجوال
      if (!phone || phone.length !== selectedCountry.maxLength) {
        setError(selectedCountry.errorMessage);
        return;
      }
    }

    if (!password || password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 خانات على الأقل لضمان الأمان.');
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
            level: foundUser.level || 1
          };
          storageService.setSession(session);
          sessionStorage.setItem('auth_success_msg', `مرحباً بك مجدداً يا ${cleanUsername}`);
          onLogin(session);
        } else {
          setError('خطأ في الدخول: اسم المستخدم أو كلمة المرور غير صحيحة.');
          setIsLoading(false);
        }
      } else {
        if (savedUsers.some((u: any) => u.username === cleanUsername)) {
          setError('نعتذر، اسم المستخدم هذا مستخدم بالفعل. اختر اسماً فريداً.');
          setIsLoading(false);
        } else {
          const newUser = { 
            username: cleanUsername, 
            password, 
            email, 
            phone: selectedCountry.code + phone,
            createdAt: new Date().toISOString()
          };
          
          storageService.registerUser(newUser);
          storageService.initializeNewAccount(cleanUsername);
          
          const session: User = { 
            username: cleanUsername, 
            lastLogin: new Date().toISOString(),
            xp: 0,
            level: 1
          };
          storageService.setSession(session);
          sessionStorage.setItem('auth_success_msg', "تم تفعيل حسابك ونظام التنبيهات بنجاح!");
          onLogin(session);
        }
      }
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex bg-corp-bg font-sans overflow-hidden">
      <div className="hidden lg:flex w-1/2 bg-[#0a0f1d] relative items-center justify-center p-20 overflow-hidden shadow-2xl">
         <div className="absolute inset-0 z-0">
            <div className="stars-container absolute inset-0">
               {[...Array(60)].map((_, i) => (
                  <div key={i} className="absolute rounded-full bg-white animate-pulse" style={{ width: Math.random() * 2.5 + 'px', height: Math.random() * 2.5 + 'px', top: Math.random() * 100 + '%', left: Math.random() * 100 + '%', opacity: Math.random(), animationDelay: Math.random() * 5 + 's', animationDuration: (Math.random() * 3 + 2) + 's' }} />
               ))}
            </div>
            <div className="absolute top-1/4 -right-20 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-bounce" style={{ animationDuration: '20s' }}></div>
         </div>

         <div className="max-w-md text-white z-10 relative text-center lg:text-right">
            <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(37,99,235,0.7)] animate-bounce mx-auto lg:mx-0">
               <Icons.Sparkles className="w-10 h-10" />
            </div>
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight glowing-text leading-[1.2]">منصة مهامي <br/><span className="text-blue-400">نظام إدارة ذكي</span></h1>
              <p className="text-xl font-bold text-slate-300 opacity-90">دقة متناهية، أداء ذكي، وتنبيهات فورية عبر الواتساب.</p>
            </div>
         </div>

         <div className="absolute bottom-12 right-12 z-20 animate-kinetic-glow">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 group hover:scale-105 transition-all duration-500">
              <div className="flex items-center gap-2 text-[11px] font-bold text-slate-300">
                 <span>صنع بكل</span>
                 <span className="heart-beat text-red-500 text-lg drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]">❤️</span>
                 <span>من قبل</span>
              </div>
              <div className="h-4 w-[1px] bg-white/20"></div>
              <div className="text-[13px] font-black tracking-widest text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)] uppercase select-none animate-pulse">
                MOSTAFA ABDO
              </div>
            </div>
         </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative z-20 shadow-inner">
        <div className="w-full max-w-[480px] space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="text-center">
            <h2 className="text-4xl font-black text-[#0f172a] mb-2">{isLoginMode ? 'تسجيل الدخول' : 'إنشاء حساب'}</h2>
            <p className="text-[#64748b] text-sm font-black tracking-wide uppercase">نظام إدارة المهام الفائق</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[14px] font-black text-[#0f172a] px-1 block">اسم المستخدم <span className="text-rose-500">*</span></label>
              <input 
                required 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                className="w-full bg-[#f8fafc] border-[3px] border-[#e2e8f0] rounded-full px-8 py-5 text-slate-900 outline-none focus:ring-12 focus:ring-blue-500/5 focus:border-[#2563eb] transition-all text-base font-black shadow-sm" 
                placeholder="أدخل اسمك البرمجي" 
              />
            </div>

            {!isLoginMode && (
              <>
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[14px] font-black text-[#0f172a] block px-1">البريد الإلكتروني <span className="text-rose-500">*</span></label>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full bg-[#f8fafc] border-[3px] border-[#e2e8f0] rounded-full px-8 py-5 text-slate-900 outline-none focus:ring-12 focus:ring-blue-500/5 focus:border-[#2563eb] transition-all text-base font-black shadow-sm" 
                    placeholder="name@domain.com" 
                  />
                </div>

                <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                  <label className="text-[14px] font-black text-[#0f172a] block px-1">رقم الجوال (للتذكير عبر واتساب) <span className="text-rose-500">*</span></label>
                  <div className="flex gap-4 relative h-[65px]">
                    <div ref={dropdownRef} className="relative w-[140px] shrink-0 h-full">
                      <button 
                        type="button"
                        onClick={() => setIsCountryListOpen(!isCountryListOpen)}
                        className="w-full h-full bg-[#f8fafc] border-[3px] border-[#e2e8f0] rounded-full px-5 flex items-center justify-between gap-2 hover:bg-white transition-all shadow-sm focus:border-blue-500 active:scale-95"
                      >
                        <Icons.Chevron className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isCountryListOpen ? 'rotate-180' : ''}`} />
                        <span className="text-[15px] font-black text-slate-900">{selectedCountry.code.replace('+', '')}+</span>
                        <span className="text-lg">{selectedCountry.flag}</span>
                      </button>

                      {isCountryListOpen && (
                        <div className="absolute bottom-full mb-4 left-0 w-[280px] bg-white border border-slate-200 rounded-[35px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] py-5 z-[100] max-h-[320px] overflow-y-auto no-scrollbar animate-in zoom-in-95 fade-in">
                          <p className="px-6 py-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mb-2">تحديد الدولة</p>
                          {COUNTRY_CODES.map((c) => (
                            <button 
                              key={c.code}
                              type="button"
                              onClick={() => { setSelectedCountry(c); setIsCountryListOpen(false); setPhone(''); setError(''); }}
                              className={`w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-right ${selectedCountry.code === c.code ? 'bg-blue-50/50' : ''}`}
                            >
                              <span className="text-2xl">{c.flag}</span>
                              <div className="flex-1 flex flex-col">
                                <span className="text-[13px] font-black text-slate-800 leading-none mb-1">{c.name}</span>
                                <span className="text-[11px] font-bold text-blue-600">{c.code}</span>
                              </div>
                              {selectedCountry.code === c.code && <Icons.CheckCircle className="w-5 h-5 text-blue-600" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <input 
                      type="tel" 
                      required 
                      value={phone} 
                      onChange={e => handlePhoneChange(e.target.value)} 
                      className="flex-1 bg-[#f8fafc] border-[3px] border-[#e2e8f0] rounded-full px-8 text-slate-900 outline-none focus:ring-12 focus:ring-blue-500/5 focus:border-[#2563eb] transition-all text-base font-black shadow-sm text-left" 
                      placeholder={selectedCountry.placeholder} 
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[14px] font-black text-[#0f172a] block px-1">كلمة المرور <span className="text-rose-500">*</span></label>
              <input 
                required 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full bg-[#f8fafc] border-[3px] border-[#e2e8f0] rounded-full px-8 py-5 text-slate-900 outline-none focus:ring-12 focus:ring-blue-500/5 focus:border-[#2563eb] transition-all text-base font-black shadow-sm" 
                placeholder="••••••••" 
              />
            </div>

            {error && (
              <div className="p-5 bg-rose-50 border-2 border-rose-100 rounded-[28px] text-rose-600 text-[13px] font-black text-center animate-in slide-in-from-top-2 flex items-center justify-center gap-3">
                <Icons.X className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button disabled={isLoading} className="w-full bg-[#2563eb] text-white font-black py-6 rounded-full text-lg hover:bg-blue-700 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50 mt-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              {isLoading ? <div className="w-7 h-7 border-4 border-white/20 border-t-white rounded-full animate-spin"></div> : <span>{isLoginMode ? 'سجل دخولك الآن' : 'تفعيل الحساب والبدء'}</span>}
            </button>
          </form>

          <button onClick={() => { setIsLoginMode(!isLoginMode); setError(''); setUsername(''); setPassword(''); setEmail(''); setPhone(''); }} className="w-full group">
            <div className="inline-flex items-center gap-3 border-2 border-slate-100 rounded-full px-12 py-5 text-[#2563eb] text-sm font-black hover:bg-slate-50 transition-all group-active:scale-95 shadow-sm">
               <span>{isLoginMode ? 'لا تملك حساباً؟ أنشئ واحداً الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}</span>
               <Icons.Chevron className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isLoginMode ? 'rotate-90' : '-rotate-90'}`} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
