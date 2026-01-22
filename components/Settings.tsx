
import React, { useState, useRef } from 'react';
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
        showToast("تم معالجة البصمة الصورية بنجاح", 'success');
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
    <div className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-4 px-2 lg:px-6">
      <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Module Header: Profile Identity */}
        <section className="relative group">
          <div className="h-72 w-full rounded-[50px] bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#1e293b] overflow-hidden relative border border-white/5 shadow-2xl">
            {/* Background Dynamics */}
            <div className="absolute inset-0">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
               <div className="absolute -top-20 -left-20 w-80 h-80 bg-nebula-purple/10 rounded-full blur-[100px] animate-pulse-slow"></div>
               <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-nebula-blue/5 rounded-full blur-[80px] animate-pulse"></div>
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
              <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-2xl px-5 py-2 rounded-full border border-white/10 mb-6 group-hover:scale-105 transition-transform">
                 <Icons.Sparkles className="w-4 h-4 text-nebula-blue" />
                 <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.4em]">مركز إدارة الهوية الرقمية</span>
              </div>
              <h2 className="text-5xl font-black text-white glow-title mb-2">إعدادات الحساب</h2>
              <p className="text-slate-500 text-xs font-bold italic opacity-80">تحكم في مظهرك الرقمي ومستويات الأمان في المجرة</p>
            </div>
          </div>

          {/* Epic Avatar Node */}
          <div className="relative -mt-20 flex justify-center z-20">
            <div className="p-1.5 bg-gradient-to-tr from-nebula-purple via-nebula-blue to-nebula-pink rounded-[45px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-500 hover:rotate-3">
              <div className="relative w-40 h-40 lg:w-48 lg:h-48 rounded-[40px] overflow-hidden bg-[#020617] border-4 border-[#020617] group/avatar">
                 {avatar ? (
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-nebula-purple to-nebula-blue flex items-center justify-center text-5xl font-black text-white">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Interaction Overlay */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-nebula-dark/80 opacity-0 group-hover/avatar:opacity-100 transition-all flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm"
                  >
                    <Icons.FileUp className="w-8 h-8 text-white animate-bounce" />
                    <span className="text-[9px] font-black text-white uppercase mt-2 tracking-widest">تحديث البصمة</span>
                  </div>
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
          </div>
        </section>

        <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
           
           {/* Primary Module: Identity Matrix */}
           <div className="lg:col-span-7 space-y-8">
              <div className="glass-panel p-10 lg:p-12 rounded-[50px] border-white/5 relative overflow-hidden group/panel">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-nebula-purple/40 to-transparent"></div>
                 
                 <div className="flex items-center gap-5 mb-12 border-b border-white/5 pb-8">
                    <div className="w-14 h-14 rounded-2xl bg-nebula-purple/10 flex items-center justify-center text-nebula-purple shadow-inner floating-slow">
                       <Icons.User className="w-7 h-7" />
                    </div>
                    <div>
                       <h4 className="text-xl font-black text-white">بيانات التعريف</h4>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">المعلومات الشخصية والعامة</p>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الاسم الرقمي</label>
                       <div className="relative group/input">
                          <input 
                            value={username} onChange={e => setUsername(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-3xl py-5 px-12 text-sm font-bold text-white outline-none focus:border-nebula-purple transition-all shadow-inner text-right"
                            placeholder="اسم المستخدم"
                          />
                          <Icons.User className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within/input:text-nebula-purple transition-colors" />
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">الاتصال السحابي</label>
                       <div className="relative group/input">
                          <input 
                            type="email" value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-3xl py-5 px-12 text-sm font-bold text-white outline-none focus:border-nebula-purple transition-all shadow-inner text-right"
                            placeholder="user@nebula.com"
                          />
                          <Icons.Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within/input:text-nebula-purple transition-colors" />
                       </div>
                    </div>

                    <div className="md:col-span-2 space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">قناة التواصل الهاتفي</label>
                       <div className="relative group/input">
                          <input 
                            value={phone} onChange={e => setPhone(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-3xl py-5 px-12 text-sm font-bold text-white outline-none focus:border-nebula-purple transition-all shadow-inner text-left"
                            placeholder="+966 00 000 0000"
                          />
                          <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                             <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">موثق</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="mt-12 p-6 rounded-[32px] bg-white/5 border border-white/5 flex items-center gap-5 group hover:bg-white/[0.08] transition-all">
                    <div className="w-12 h-12 bg-nebula-purple/20 text-nebula-purple rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                       <Icons.Sparkles className="w-6 h-6" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                       يتم تشفير هذه البيانات ومزامنتها لحظياً لضمان استمرارية تجربة الإنجاز الخاصة بك عبر كافة الأنظمة.
                    </p>
                 </div>
              </div>
           </div>

           {/* Secondary Module: Security Protocol */}
           <div className="lg:col-span-5 space-y-8">
              <div className="glass-panel p-10 lg:p-12 rounded-[50px] border-white/5 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-nebula-pink/40 to-transparent"></div>
                 
                 <div className="flex items-center gap-5 mb-12 border-b border-white/5 pb-8">
                    <div className="w-14 h-14 rounded-2xl bg-nebula-pink/10 flex items-center justify-center text-nebula-pink shadow-inner">
                       <Icons.Shield className="w-7 h-7" />
                    </div>
                    <div>
                       <h4 className="text-xl font-black text-white">بروتوكول الأمان</h4>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">تشفير الدخول والتحقق</p>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">تغيير شفرة الدخول</label>
                       <div className="relative group/input">
                          <input 
                            type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-3xl py-5 px-12 text-sm font-bold text-white outline-none focus:border-nebula-purple transition-all shadow-inner text-right"
                            placeholder="شفرة جديدة (اختياري)"
                          />
                          <Icons.Key className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600 group-focus-within/input:text-nebula-purple transition-colors" />
                       </div>
                    </div>

                    <div className="p-8 rounded-[40px] bg-[#020617]/50 border border-white/5 space-y-6 relative overflow-hidden group/verif">
                       <div className="absolute top-0 right-0 p-8 opacity-5 scale-150 rotate-12 pointer-events-none text-nebula-purple transition-transform duration-1000 group-hover/verif:rotate-0">
                          <Icons.Shield className="w-24 h-24" />
                       </div>
                       
                       <div className="relative z-10">
                          <label className="text-[9px] font-black text-nebula-purple uppercase tracking-[0.3em] mb-4 block">التحقق الإلزامي للمزامنة</label>
                          <input 
                            required type="password" value={password} onChange={e => setPassword(e.target.value)}
                            className="w-full bg-white/10 border border-white/10 rounded-[30px] py-5 px-8 text-lg font-bold text-white outline-none focus:bg-white focus:text-slate-900 transition-all text-center shadow-2xl"
                            placeholder="الشفرة الحالية"
                          />
                          <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-4 text-center">يرجى تأكيد هويتك لاعتماد التغييرات</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Action Node */}
              <button 
                type="submit" disabled={isUpdating}
                className="w-full py-7 bg-gradient-to-r from-nebula-purple via-nebula-blue to-nebula-purple bg-[length:200%_auto] hover:bg-right text-white font-black text-xl rounded-[40px] shadow-[0_30px_60px_-15px_rgba(124,58,237,0.4)] transition-all active:scale-[0.96] hover:scale-[1.02] flex items-center justify-center gap-6 group disabled:opacity-50 relative overflow-hidden"
              >
                 {isUpdating ? (
                    <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                 ) : (
                    <>
                      <span>اعتماد المزامنة السحابية</span>
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center transition-all group-hover:rotate-12">
                         <Icons.CheckCircle className="w-7 h-7" />
                      </div>
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
