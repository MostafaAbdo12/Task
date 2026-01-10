
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { Icons } from '../constants';
import { storageService } from '../services/storageService';

interface AuthProps {
  onLogin: (user: User) => void;
}

const COUNTRY_CODES = [
  { code: '+966', flag: '🇸🇦', name: 'المملكة العربية السعودية', short: 'SA', placeholder: 'xxxxxxxxx' },
  { code: '+20', flag: '🇪🇬', name: 'جمهورية مصر العربية', short: 'EG', placeholder: 'xxxxxxxxxx' },
  { code: '+971', flag: '🇦🇪', name: 'الإمارات العربية المتحدة', short: 'AE', placeholder: 'xxxxxxxxx' },
  { code: '+965', flag: '🇰🇼', name: 'دولة الكويت', short: 'KW', placeholder: 'xxxxxxxx' },
  { code: '+974', flag: '🇶🇦', name: 'دولة قطر', short: 'QA', placeholder: 'xxxxxxxxx' },
  { code: '+968', flag: '🇴🇲', name: 'سلطنة عمان', short: 'OM', placeholder: 'xxxxxxxx' },
  { code: '+973', flag: '🇧🇭', name: 'مملكة البحرين', short: 'BH', placeholder: 'xxxxxxxx' },
  { code: '+962', flag: '🇯🇴', name: 'المملكة الأردنية الهاشمية', short: 'JO', placeholder: 'xxxxxxxxx' },
  { code: '+212', flag: '🇲🇦', name: 'المملكة المغربية', short: 'MA', placeholder: 'xxxxxxxxx' },
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryListOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim().toLowerCase();
    
    // التحقق من الحقول الإجبارية
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
      if (!phone || phone.length < 7) {
        setError('يرجى إدخال رقم جوال صحيح لإرسال تنبيهات واتساب.');
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
      {/* الجانب الأيمن (لوحة التصميم المظلمة) */}
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

         {/* التوقيع الذهبي للمصمم */}
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

      {/* الجانب الأيسر (النماذج) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative z-20 shadow-inner">
        <div className="w-full max-w-[440px] space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="text-center">
            <h2 className="text-4xl font-black text-[#0f172a] mb-2">{isLoginMode ? 'تسجيل الدخول' : 'إنشاء حساب'}</h2>
            <p className="text-[#64748b] text-sm font-medium">ابدأ الآن بتنظيم أعمالك باحترافية</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            {/* اسم المستخدم */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[12px] font-bold text-[#64748b]">اسم المستخدم <span className="text-rose-500">*</span></label>
              </div>
              <input 
                required 
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[22px] px-6 py-[16px] text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563eb] transition-all text-sm font-bold shadow-sm" 
                placeholder="أدخل اسمك" 
              />
            </div>

            {!isLoginMode && (
              <>
                {/* البريد الإلكتروني */}
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[12px] font-bold text-[#64748b] block px-1">البريد الإلكتروني <span className="text-rose-500">*</span></label>
                  <input 
                    type="email" 
                    required 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[22px] px-6 py-[16px] text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563eb] transition-all text-sm font-bold shadow-sm" 
                    placeholder="name@domain.com" 
                  />
                </div>

                {/* رقم الجوال المطور (مطابق للصورة) */}
                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-4">
                  <label className="text-[12px] font-bold text-[#64748b] block px-1">رقم الجوال (للتذكير عبر واتساب) <span className="text-rose-500">*</span></label>
                  <div className="flex gap-3 relative h-[58px]">
                    {/* جزء الرقم (على اليمين في RTL) */}
                    <input 
                      type="tel" 
                      required 
                      value={phone} 
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} 
                      className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] rounded-[22px] px-6 text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563eb] transition-all text-sm font-bold shadow-sm" 
                      placeholder={selectedCountry.placeholder} 
                    />
                    
                    {/* جزء اختيار الدولة (على اليسار في RTL) */}
                    <div ref={dropdownRef} className="relative w-[130px] shrink-0">
                      <button 
                        type="button"
                        onClick={() => setIsCountryListOpen(!isCountryListOpen)}
                        className="w-full h-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[22px] px-4 flex items-center justify-between gap-2 hover:bg-white transition-all shadow-sm focus:ring-4 focus:ring-blue-500/10 active:border-blue-500"
                      >
                        <Icons.Chevron className={`w-3 h-3 text-slate-400 transition-transform ${isCountryListOpen ? 'rotate-180' : ''}`} />
                        <span className="text-[13px] font-black text-slate-700">{selectedCountry.code.replace('+', '')}+</span>
                        <span className="text-xs font-black text-slate-500 uppercase">{selectedCountry.short}</span>
                        <span className="text-lg">{selectedCountry.flag}</span>
                      </button>

                      {isCountryListOpen && (
                        <div className="absolute bottom-full mb-3 left-0 w-[260px] bg-white border border-slate-200 rounded-[28px] shadow-2xl py-4 z-[100] max-h-[300px] overflow-y-auto no-scrollbar animate-in zoom-in-95 fade-in">
                          <p className="px-6 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">اختيار الدولة</p>
                          {COUNTRY_CODES.map((c) => (
                            <button 
                              key={c.code}
                              type="button"
                              onClick={() => { setSelectedCountry(c); setIsCountryListOpen(false); setPhone(''); }}
                              className={`w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-right ${selectedCountry.code === c.code ? 'bg-blue-50' : ''}`}
                            >
                              <span className="text-2xl">{c.flag}</span>
                              <div className="flex-1 flex flex-col">
                                <span className="text-xs font-black text-slate-800 leading-none mb-1">{c.name}</span>
                                <span className="text-[10px] font-bold text-blue-500">{c.code}</span>
                              </div>
                              {selectedCountry.code === c.code && <Icons.CheckCircle className="w-4 h-4 text-blue-600" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* كلمة المرور */}
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-[#64748b] block px-1">كلمة المرور <span className="text-rose-500">*</span></label>
              <input 
                required 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[22px] px-6 py-[16px] text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563eb] transition-all text-sm font-bold shadow-sm" 
                placeholder="••••••••" 
              />
            </div>

            {error && <div className="p-4 bg-rose-50 border border-rose-100 rounded-[22px] text-rose-600 text-xs font-bold text-center animate-in slide-in-from-top-2">{error}</div>}

            <button disabled={isLoading} className="w-full bg-[#2563eb] text-white font-black py-[20px] rounded-[26px] text-lg hover:bg-blue-700 shadow-xl transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-50 mt-4">
              {isLoading ? <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <span>{isLoginMode ? 'سجل دخولك الآن' : 'إنشاء حسابك الآن'}</span>}
            </button>
          </form>

          <button onClick={() => { setIsLoginMode(!isLoginMode); setError(''); setUsername(''); setPassword(''); setEmail(''); setPhone(''); }} className="w-full group">
            <div className="inline-flex items-center gap-3 border border-slate-200 rounded-full px-10 py-4 text-[#2563eb] text-sm font-black hover:bg-slate-50 transition-all group-active:scale-95 shadow-sm">
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
