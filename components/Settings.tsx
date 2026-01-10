
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Icons } from '../constants';
import { storageService } from '../services/storageService';

interface SettingsProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  showToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
}

const Settings: React.FC<SettingsProps> = ({ user, onUpdate, showToast }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [otpMode, setOtpMode] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleInitUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من كلمة المرور الحالية قبل البدء
    const users = storageService.getUsers();
    const currentUserData = users.find(u => u.username === user.username);
    
    if (password !== currentUserData.password) {
      showToast("كلمة المرور الحالية غير صحيحة", 'danger');
      return;
    }

    // توليد كود عشوائي ومحاكاة الإرسال
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpMode(true);
    setTimer(60);
    
    // محاكاة إشعار النظام بإرسال الكود
    console.log(`[WhatsApp Simulation] Code sent to ${phone}: ${code}`);
    showToast("تم إرسال رمز التحقق إلى واتساب الخاص بك", 'info');
  };

  const verifyAndSave = () => {
    if (otpValue !== generatedOtp) {
      showToast("رمز التحقق غير صحيح، يرجى المحاولة مرة أخرى", 'danger');
      return;
    }

    setIsVerifying(true);
    
    setTimeout(() => {
      const updatedFields: Partial<User> = {
        username: username,
        email: email,
        phone: phone,
      };

      if (newPassword) {
        updatedFields.password = newPassword;
      }

      const success = storageService.updateUser(user.username, updatedFields);
      
      if (success) {
        const updatedUserSession: User = {
          ...user,
          ...updatedFields,
          lastLogin: new Date().toISOString()
        };
        storageService.setSession(updatedUserSession);
        onUpdate(updatedUserSession);
        showToast("تم تحديث بياناتك الشخصية بنجاح", 'success');
        setOtpMode(false);
        setPassword('');
        setNewPassword('');
      } else {
        showToast("حدث خطأ أثناء تحديث البيانات", 'danger');
      }
      setIsVerifying(false);
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-20 p-4 lg:p-0">
      <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <header className="text-right space-y-2">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">إعدادات الحساب</h2>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">تحديث البيانات والخصوصية</p>
        </header>

        {!otpMode ? (
          <form onSubmit={handleInitUpdate} className="bg-white p-8 lg:p-12 rounded-[45px] shadow-xl border border-slate-100 space-y-8 relative overflow-hidden">
            {/* Decorative BG */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-500"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 block text-right">اسم المستخدم</label>
                <input 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="اسم المستخدم الجديد"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 block text-right">البريد الإلكتروني</label>
                <input 
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 block text-right">رقم الجوال (واتساب)</label>
              <input 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-left"
                placeholder="+20xxxxxxxxxx"
              />
            </div>

            <div className="border-t border-slate-100 pt-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 block text-right">تغيير كلمة المرور (اختياري)</label>
                <input 
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="كلمة المرور الجديدة"
                />
              </div>

              <div className="space-y-2 bg-blue-50/50 p-6 rounded-[30px] border border-blue-100/50">
                <label className="text-[11px] font-black text-blue-600 uppercase tracking-widest px-1 block text-right mb-2">تأكيد الهوية للمتابعة</label>
                <input 
                  required
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white border border-blue-200 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                  placeholder="أدخل كلمة المرور الحالية"
                />
              </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-[28px] text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3">
              <span>تحديث البيانات</span>
              <Icons.Shield className="w-5 h-5" />
            </button>
          </form>
        ) : (
          <div className="bg-white p-12 rounded-[45px] shadow-2xl border border-slate-100 space-y-10 text-center animate-in zoom-in-95 duration-300">
             <div className="w-24 h-24 bg-blue-50 rounded-[35px] flex items-center justify-center mx-auto text-blue-600 mb-6 shadow-inner animate-bounce">
                <Icons.Bell className="w-12 h-12" />
             </div>
             
             <div className="space-y-3">
                <h3 className="text-2xl font-black text-slate-900">أدخل رمز التحقق</h3>
                <p className="text-slate-500 font-bold max-w-sm mx-auto leading-relaxed">أرسلنا رمز OTP مكون من 6 أرقام إلى حساب الواتساب الخاص بك للتحقق من ملكية الحساب.</p>
             </div>

             <div className="max-w-[300px] mx-auto space-y-6">
                <input 
                  autoFocus
                  maxLength={6}
                  value={otpValue}
                  onChange={e => setOtpValue(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center text-4xl font-black tracking-[0.5em] py-6 bg-slate-50 border-2 border-slate-200 rounded-[28px] outline-none focus:border-blue-600 focus:bg-white transition-all text-blue-600"
                  placeholder="------"
                />
                
                <div className="flex flex-col gap-4">
                  <button 
                    disabled={isVerifying || otpValue.length < 6}
                    onClick={verifyAndSave}
                    className="w-full bg-emerald-600 text-white font-black py-5 rounded-[24px] text-lg hover:bg-emerald-700 shadow-xl transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isVerifying ? 'جاري التحقق...' : 'تأكيد وحفظ'}
                  </button>
                  
                  <button 
                    onClick={() => setOtpMode(false)}
                    className="text-slate-400 font-bold text-sm hover:text-slate-600"
                  >
                    إلغاء العملية
                  </button>

                  {timer > 0 ? (
                    <p className="text-xs font-black text-slate-300">إعادة إرسال الرمز خلال {timer} ثانية</p>
                  ) : (
                    <button onClick={() => setTimer(60)} className="text-blue-600 font-black text-xs hover:underline">إعادة إرسال الرمز</button>
                  )}
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Settings;
