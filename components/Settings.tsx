
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Icons } from '../constants';
import { storageService } from '../services/storageService';

interface SettingsProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
  showToast: (msg: string, type: 'success' | 'danger' | 'info') => void;
  bgIntensity: 'low' | 'medium' | 'high' | 'dynamic';
  onBgIntensityChange: (intensity: 'low' | 'medium' | 'high' | 'dynamic') => void;
}

const AVATAR_OPTIONS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka&backgroundColor=ffdfbf',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe&backgroundColor=c0aede',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack&backgroundColor=d1d4f9',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max&backgroundColor=ffd5dc',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Robo1&backgroundColor=b6e3f4',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Robo2&backgroundColor=c0aede',
];

const Settings: React.FC<SettingsProps> = ({ user, onUpdate, showToast, bgIntensity, onBgIntensityChange }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("حجم الملف يتجاوز الحد المسموح (2MB)", 'danger');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
        showToast("تم تحديث البصمة الصورية المخصصة", 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      const users = await storageService.getUsers();
      const currentUserData = users.find(u => u.username === user.username);
      
      if (!currentUserData || password !== currentUserData.password) {
        showToast("فشل التحقق: شفرة التأكيد غير صحيحة", 'danger');
        setIsUpdating(false);
        return;
      }

      const updatedFields: Partial<User> = { username, email, phone, avatar };
      if (newPassword) updatedFields.password = newPassword;

      const success = await storageService.updateUser(user.username, updatedFields);
      if (success) {
        const updatedUserSession: User = { ...user, ...updatedFields, lastLogin: new Date().toISOString() };
        storageService.setSession(updatedUserSession);
        onUpdate(updatedUserSession);
        showToast("تمت مزامنة البيانات مع السحابة بنجاح", 'success');
        setPassword('');
        setNewPassword('');
      } else {
        showToast("حدث خطأ في تحديث مصفوفة البيانات", 'danger');
      }
    } catch (err) {
      showToast("خطأ في الاتصال بالنظام المركزي", 'danger');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-4 px-2 lg:px-6 animate-reveal">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Module Header */}
        <section className="relative group">
          <div className="h-64 w-full rounded-[50px] bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#1e293b] overflow-hidden relative border border-white/5 shadow-2xl transition-all">
            <div className="absolute inset-0">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
              <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-2xl px-5 py-2 rounded-full border border-white/10 mb-4">
                 <Icons.Settings className="w-4 h-4 text-nebula-blue" />
                 <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.4em]">مركز إدارة الهوية الرقمية</span>
              </div>
              <h2 className="text-4xl font-black text-white glow-title">إعدادات الحساب</h2>
            </div>
          </div>

          <div className="relative -mt-20 flex justify-center z-20">
            <div className="p-1.5 bg-gradient-to-tr from-nebula-purple via-nebula-blue to-nebula-pink rounded-[45px] shadow-2xl">
              <div className="relative w-40 h-40 lg:w-44 lg:h-44 rounded-[40px] overflow-hidden bg-[#020617] border-4 border-[#020617] group/avatar">
                 {avatar ? (
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-nebula-purple to-nebula-blue flex items-center justify-center text-5xl font-black text-white">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-nebula-dark/80 opacity-0 group-hover/avatar:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm"
                  >
                    <Icons.FileUp className="w-8 h-8 text-white" />
                    <span className="text-[9px] font-black text-white uppercase mt-2 tracking-widest">تحميل مخصص</span>
                  </div>
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
          </div>
        </section>

        {/* Dynamic Background Settings */}
        <section className="glass-panel p-10 lg:p-12 rounded-[50px] border-white/5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-nebula-blue to-transparent"></div>
          <div className="flex items-center gap-5 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-nebula-blue/10 flex items-center justify-center text-nebula-blue">
              <Icons.Sun className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xl font-black text-white">تخصيص البيئة الكونية</h4>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">اضبط كثافة السدم والنجوم</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {[
              { id: 'low', label: 'هادئ', desc: 'كثافة بصرية منخفضة' },
              { id: 'medium', label: 'متوازن', desc: 'المظهر الافتراضي' },
              { id: 'high', label: 'غامر', desc: 'تفاصيل كونية عميقة' },
              { id: 'dynamic', label: 'تلقائي', desc: 'يتغير مع الوقت' }
            ].map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onBgIntensityChange(option.id as any);
                  showToast(`تم ضبط الكثافة إلى: ${option.label}`, 'info');
                }}
                className={`
                  p-6 rounded-[35px] border-2 text-right transition-all duration-500 flex flex-col gap-2 relative overflow-hidden
                  ${bgIntensity === option.id 
                    ? 'bg-nebula-blue/20 border-nebula-blue shadow-lg scale-105' 
                    : 'bg-white/5 border-white/5 hover:border-white/10'}
                `}
              >
                <span className={`text-lg font-black ${bgIntensity === option.id ? 'text-white' : 'text-slate-400'}`}>{option.label}</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{option.desc}</span>
                {bgIntensity === option.id && <div className="absolute top-0 left-0 w-full h-1 bg-nebula-blue animate-pulse"></div>}
              </button>
            ))}
          </div>
        </section>

        {/* Profile Details Form */}
        <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <div className="lg:col-span-7 space-y-8">
              <div className="glass-panel p-10 lg:p-12 rounded-[50px] border-white/5 shadow-xl">
                 <div className="flex items-center gap-5 mb-10 border-b border-white/5 pb-8">
                    <div className="w-14 h-14 rounded-2xl bg-nebula-purple/10 flex items-center justify-center text-nebula-purple">
                       <Icons.User className="w-7 h-7" />
                    </div>
                    <div>
                       <h4 className="text-xl font-black text-white">بيانات التعريف</h4>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">المعلومات الشخصية</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الاسم الرقمي</label>
                       <input 
                         value={username} onChange={e => setUsername(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-8 text-sm font-bold text-white outline-none focus:border-nebula-purple transition-all"
                         placeholder="اسم المستخدم"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الاتصال السحابي</label>
                       <input 
                         type="email" value={email} onChange={e => setEmail(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-8 text-sm font-bold text-white outline-none focus:border-nebula-purple transition-all"
                         placeholder="user@nebula.com"
                       />
                    </div>
                    <div className="md:col-span-2 space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">قناة التواصل الهاتفي</label>
                       <input 
                         value={phone} onChange={e => setPhone(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-8 text-sm font-bold text-white outline-none focus:border-nebula-purple transition-all"
                         placeholder="+966 00 000 0000"
                       />
                    </div>
                 </div>
              </div>
           </div>

           <div className="lg:col-span-5 space-y-8">
              <div className="glass-panel p-10 lg:p-12 rounded-[50px] border-white/5 shadow-xl">
                 <div className="flex items-center gap-5 mb-10 border-b border-white/5 pb-8">
                    <div className="w-14 h-14 rounded-2xl bg-nebula-pink/10 flex items-center justify-center text-nebula-pink">
                       <Icons.Shield className="w-7 h-7" />
                    </div>
                    <div>
                       <h4 className="text-xl font-black text-white">بروتوكول الأمان</h4>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">تشفير الدخول</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">شفرة جديدة</label>
                       <input 
                         type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                         className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-8 text-sm font-bold text-white outline-none focus:border-nebula-purple transition-all"
                         placeholder="شفرة جديدة (اختياري)"
                       />
                    </div>
                    <div className="p-8 rounded-[40px] bg-[#020617]/50 border border-white/5 space-y-4">
                        <label className="text-[9px] font-black text-nebula-purple uppercase tracking-[0.3em] block">التحقق الإلزامي</label>
                        <input 
                          required type="password" value={password} onChange={e => setPassword(e.target.value)}
                          className="w-full bg-white/10 border border-white/10 rounded-[30px] py-5 px-8 text-lg font-bold text-white outline-none focus:bg-white focus:text-slate-900 transition-all text-center"
                          placeholder="الشفرة الحالية"
                        />
                    </div>
                 </div>
              </div>

              <button 
                type="submit" disabled={isUpdating}
                className="w-full py-7 bg-gradient-to-r from-nebula-purple via-nebula-blue to-nebula-purple bg-[length:200%_auto] hover:bg-right text-white font-black text-xl rounded-[40px] shadow-lg transition-all active:scale-[0.96] flex items-center justify-center gap-6 disabled:opacity-50"
              >
                 {isUpdating ? (
                    <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                 ) : (
                    <>
                      <span>حفظ التغييرات</span>
                      <Icons.CheckCircle className="w-7 h-7" />
                    </>
                 )}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
