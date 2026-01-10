
import React, { useState } from 'react';
import { User } from '../types';
import { Icons } from '../constants';

interface AuthProps {
  onLogin: (user: User) => void;
}

const COUNTRY_CODES = [
  { code: '+966', flag: '🇸🇦', name: 'السعودية', short: 'SA' },
  { code: '+971', flag: '🇦🇪', name: 'الإمارات', short: 'AE' },
  { code: '+965', flag: '🇰🇼', name: 'الكويت', short: 'KW' },
  { code: '+974', flag: '🇶🇦', name: 'قطر', short: 'QA' },
  { code: '+968', flag: '🇴🇲', name: 'عمان', short: 'OM' },
  { code: '+973', flag: '🇧🇭', name: 'البحرين', short: 'BH' },
  { code: '+20', flag: '🇪🇬', name: 'مصر', short: 'EG' },
  { code: '+962', flag: '🇯🇴', name: 'الأردن', short: 'JO' },
  { code: '+961', flag: '🇱🇧', name: 'لبنان', short: 'LB' },
  { code: '+964', flag: '🇮🇶', name: 'العراق', short: 'IQ' },
  { code: '+212', flag: '🇲🇦', name: 'المغرب', short: 'MA' },
  { code: '+213', flag: '🇩🇿', name: 'الجزائر', short: 'DZ' },
  { code: '+216', flag: '🇹🇳', name: 'تونس', short: 'TN' },
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
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const validatePassword = (pass: string) => {
    // التحقق من وجود حروف، أرقام، ورموز
    const hasLetter = /[a-zA-Z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return hasLetter && hasNumber && hasSymbol;
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError('اسم المستخدم حقل إلزامي.');
      return;
    }

    if (!password.trim()) {
      setError('كلمة المرور حقل إلزامي.');
      return;
    }

    if (!isLoginMode) {
      if (!email.trim()) {
        setError('البريد الإلكتروني إلزامي لتلقي إشعارات الحساب.');
        return;
      }
      if (!phone.trim()) {
        setError('رقم الجوال إلزامي لتفعيل تنبيهات الواتساب.');
        return;
      }
      if (!validatePassword(password)) {
        setError('يجب أن تحتوي كلمة المرور على حروف وأرقام ورموز لضمان أمان حسابك.');
        return;
      }
    }
    
    setIsLoading(true);

    setTimeout(() => {
      const savedUsers = JSON.parse(localStorage.getItem('maham_users_registry') || '[]');
      if (isLoginMode) {
        const user = savedUsers.find((u: any) => u.username === username && u.password === password);
        if (user) {
          const session = { 
            username, 
            lastLogin: new Date().toISOString(), 
            xp: user.xp || 0, 
            level: user.level || 1 
          };
          localStorage.setItem('maham_active_session', JSON.stringify(session));
          sessionStorage.setItem('auth_success_msg', "تم تسجيل دخولك بنجاح");
          onLogin(session);
        } else {
          setError('بيانات الدخول غير صحيحة، يرجى المحاولة مرة أخرى.');
          setIsLoading(false);
        }
      } else {
        if (savedUsers.some((u: any) => u.username === username)) {
          setError('اسم المستخدم هذا مستخدم بالفعل.');
          setIsLoading(false);
        } else {
          const newUser = { 
            username, 
            password, 
            email, 
            phone: selectedCountry.code + phone, 
            xp: 0, 
            level: 1 
          };
          localStorage.setItem('maham_users_registry', JSON.stringify([...savedUsers, newUser]));
          const session = { username, lastLogin: new Date().toISOString(), xp: 0, level: 1 };
          localStorage.setItem('maham_active_session', JSON.stringify(session));
          sessionStorage.setItem('auth_success_msg', "تم إنشاء حسابك بنجاح ونظام الإشعارات مفعل");
          onLogin(session);
        }
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex bg-corp-bg font-sans overflow-hidden">
      {/* Visual Section - Side Branding with Space Animated Background */}
      <div className="hidden lg:flex w-1/2 bg-[#0a0f1d] relative items-center justify-center p-20 overflow-hidden shadow-2xl">
         
         {/* Fantasy/Space Animated Background Elements */}
         <div className="absolute inset-0 z-0">
            {/* Stars Layer */}
            <div className="stars-container absolute inset-0">
               {[...Array(60)].map((_, i) => (
                  <div 
                    key={i} 
                    className="absolute rounded-full bg-white animate-pulse"
                    style={{
                      width: Math.random() * 2.5 + 'px',
                      height: Math.random() * 2.5 + 'px',
                      top: Math.random() * 100 + '%',
                      left: Math.random() * 100 + '%',
                      opacity: Math.random(),
                      animationDelay: Math.random() * 5 + 's',
                      animationDuration: (Math.random() * 3 + 2) + 's'
                    }}
                  />
               ))}
            </div>

            {/* Moving Nebulas/Glows */}
            <div className="absolute top-1/4 -left-20 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
            <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-bounce" style={{ animationDuration: '20s' }}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_#0a0f1d_100%)] opacity-80"></div>
         </div>

         {/* Content - Above the background */}
         <div className="max-w-md text-white z-10 relative text-center lg:text-right">
            <div className="w-16 h-16 bg-blue-600 rounded-[24px] flex items-center justify-center mb-10 shadow-[0_0_40px_rgba(37,99,235,0.7)] animate-bounce mx-auto lg:mx-0" style={{ animationDuration: '4s' }}>
               <Icons.Sparkles className="w-10 h-10" />
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl lg:text-5xl font-black tracking-tight glowing-text leading-[1.2] drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                منصة مهامي <br/>
                <span className="text-blue-400">للأعمال الذكية</span>
              </h1>
              
              <div className="flex flex-col gap-4">
                <p className="text-xl lg:text-2xl font-bold text-slate-300 opacity-90 flex items-center gap-4 justify-center lg:justify-start">
                  <span className="w-10 h-1 bg-blue-500 rounded-full"></span>
                  إدارة ذكية بإشعارات فورية
                </p>
                <div className="flex gap-4 justify-center lg:justify-start">
                   <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md text-[10px] font-bold text-blue-300">واتساب 🟢</div>
                   <div className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md text-[10px] font-bold text-blue-300">بريد إلكتروني ✉️</div>
                </div>
              </div>
            </div>
         </div>

         {/* Bottom Credit Text */}
         <div className="absolute bottom-10 text-center w-full px-10 z-10">
            <div className="text-sm font-bold tracking-wide flex items-center justify-center gap-2 text-slate-400">
              <span>صنع بكل</span>
              <span className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,1)] animate-pulse scale-125">❤️</span>
              <span>من قبل</span>
              <span className="text-white glowing-text font-black">MOSTAFA ABDO</span>
            </div>
         </div>
      </div>

      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative z-20">
        <div className="w-full max-w-[420px] space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          
          <div className="text-center">
            <h2 className="text-4xl font-black text-[#0f172a] tracking-tight leading-none mb-4">
              {isLoginMode ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </h2>
            <p className="text-[#64748b] text-sm font-medium">
              مرحباً بك، يرجى إدخال بيانات الوصول للنظام.
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-[#64748b] block px-1">اسم المستخدم <span className="text-red-500">*</span></label>
              <input 
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[22px] px-6 py-[16px] text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563eb] transition-all text-sm placeholder:text-[#94a3b8] shadow-sm font-medium"
                placeholder="أدخل اسم المستخدم"
              />
            </div>

            {!isLoginMode && (
              <>
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-[#64748b] block px-1">البريد الإلكتروني <span className="text-red-500">*</span></label>
                  <input 
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[22px] px-6 py-[16px] text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563eb] transition-all text-sm placeholder:text-[#94a3b8] shadow-sm font-medium"
                    placeholder="example@mail.com"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-[#64748b] block px-1">رقم الجوال لتنبيهات الواتساب <span className="text-red-500">*</span></label>
                  <div className="relative flex gap-2">
                    {/* Country Code Selection */}
                    <div className="relative">
                      <button 
                        type="button"
                        onClick={() => setShowCountryPicker(!showCountryPicker)}
                        className="h-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[22px] px-3 flex items-center gap-2 text-slate-700 font-bold hover:bg-slate-50 transition-all min-w-[95px] shadow-sm"
                      >
                        <span dir="ltr" className="text-xs font-black">{selectedCountry.code} <span className="text-[10px] text-slate-400">{selectedCountry.short}</span></span>
                      </button>
                      
                      {showCountryPicker && (
                        <div className="absolute top-full right-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-2xl z-[100] max-h-60 overflow-y-auto no-scrollbar p-2 space-y-1 animate-in zoom-in-95">
                          {COUNTRY_CODES.map((item) => (
                            <button
                              key={item.code}
                              type="button"
                              onClick={() => { setSelectedCountry(item); setShowCountryPicker(false); }}
                              className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 text-right text-xs font-bold text-slate-700 transition-colors"
                            >
                              <span className="text-base">{item.flag}</span>
                              <span className="flex-1">{item.name}</span>
                              <span dir="ltr" className="text-slate-400 text-[10px]">{item.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <input 
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                      dir="ltr"
                      className="flex-1 bg-[#f8fafc] border border-[#e2e8f0] rounded-[22px] px-6 py-[16px] text-right text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563eb] transition-all text-sm placeholder:text-[#94a3b8] shadow-sm font-medium"
                      placeholder="5xxxxxxx"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-[#64748b] block px-1">كلمة المرور <span className="text-red-500">*</span></label>
              <input 
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-[#f8fafc] border border-[#e2e8f0] rounded-[22px] px-6 py-[16px] text-slate-900 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-[#2563eb] transition-all text-sm placeholder:text-[#94a3b8] shadow-sm font-medium"
                placeholder={!isLoginMode ? "أرقام، حروف، ورموز" : "أدخل كلمة المرور"}
              />
              {!isLoginMode && (
                <p className="text-[10px] text-slate-400 px-1 font-bold">تأكد من استخدام خليط من الحروف والأرقام والرموز.</p>
              )}
            </div>

            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-[13px] font-bold text-center animate-in shake duration-300">
                {error}
              </div>
            )}

            <button 
              disabled={isLoading}
              className="w-full bg-[#2563eb] text-white font-black py-[18px] rounded-[24px] text-lg hover:bg-blue-700 shadow-[0_15px_30px_-10px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4 mt-4 group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>{isLoginMode ? 'دخول النظام' : 'إنشاء حسابك'}</span>
                  <Icons.Chevron className="w-5 h-5 -rotate-90 group-hover:translate-x-[-4px] transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2">
            <button 
              onClick={() => { setIsLoginMode(!isLoginMode); setError(''); }}
              className="text-[#2563eb] text-[14px] font-black hover:scale-105 transition-all inline-block"
            >
              {isLoginMode ? (
                <>لا تملك حساباً بعد؟ <span className="underline decoration-2 underline-offset-4">ابدأ الآن مجاناً</span></>
              ) : (
                <>لديك حساب مسبق؟ <span className="underline decoration-2 underline-offset-4">العودة لتسجيل الدخول</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
