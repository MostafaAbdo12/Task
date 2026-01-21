
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
        showToast("حجم الصورة كبير جداً (الأقصى 2MB)", 'danger');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAvatar(base64String);
        showToast("تم تحليل الصورة بنجاح، احفظ التغييرات للتثبيت", 'info');
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
        showToast("شفرة التأكيد الحالية غير صحيحة", 'danger');
        setIsUpdating(false);
        return;
      }

      const updatedFields: Partial<User> = {
        username,
        email,
        phone,
        avatar,
      };

      if (newPassword) {
        updatedFields.password = newPassword;
      }

      const success = await storageService.updateUser(user.username, updatedFields);
      if (success) {
        const updatedUserSession: User = { ...user, ...updatedFields, lastLogin: new Date().toISOString() };
        storageService.setSession(updatedUserSession);
        onUpdate(updatedUserSession);
        showToast("تمت مزامنة هويتك الرقمية بنجاح 🚀", 'success');
        setPassword('');
        setNewPassword('');
      } else {
        showToast("فشل في تحديث مصفوفة البيانات", 'danger');
      }
    } catch (err) {
      showToast("خطأ في الاتصال بالمركز السحابي", 'danger');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24 px-4 lg:px-12 pt-6 selection:bg-accent/30">
      <style>{`
        .settings-card {
          background: rgba(var(--panel-bg-rgb, 255, 255, 255), 0.03);
          backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.4);
        }
        .input-neural {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .input-neural:focus {
          background: rgba(0, 0, 0, 0.3);
          border-color: var(--accent-color);
          box-shadow: 0 0 20px rgba(var(--accent-rgb, 37, 99, 235), 0.15);
        }
        .avatar-frame {
          position: relative;
          padding: 8px;
          border-radius: 50px;
          background: linear-gradient(135deg, var(--accent-color), transparent);
        }
      `}</style>

      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        
        {/* Profile Command Header */}
        <div className="relative group">
          <div className="h-80 w-full rounded-[60px] bg-gradient-to-br from-[#0f172a] via-[#020617] to-[#1e293b] overflow-hidden relative border border-white/5 shadow-2xl">
            {/* Cinematic Background Elements */}
            <div className="absolute inset-0">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
               <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-accent/10 rounded-full blur-[140px] animate-pulse-slow"></div>
               <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] animate-pulse"></div>
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
              <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-3xl px-6 py-2.5 rounded-full border border-white/10 mb-8 transform transition-transform group-hover:scale-105">
                 <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>
                 <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">نظام التشفير السحابي النشط</span>
              </div>
              <h2 className="text-5xl lg:text-7xl font-black text-white tracking-tighter drop-shadow-2xl mb-4">مركز الهوية</h2>
              <p className="text-slate-400 text-sm font-bold opacity-60 max-w-lg mx-auto">تعديل ملامح حضورك الرقمي وإدارة مستويات الوصول والأمان</p>
            </div>
          </div>

          {/* Epic Avatar Controller */}
          <div className="relative -mt-24 flex justify-center">
            <div className="avatar-frame shadow-2xl group/avatar transition-transform duration-700 hover:rotate-3">
              <div className="relative w-44 h-44 lg:w-52 lg:h-52 rounded-[42px] overflow-hidden bg-[#0f172a] border-4 border-[#020617] shadow-2xl">
                 {avatar ? (
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent to-indigo-900 flex items-center justify-center text-6xl font-black text-white">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Upload Overlay */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer backdrop-blur-sm"
                  >
                    <Icons.FileUp className="w-10 h-10 text-white animate-bounce" />
                    <span className="text-[10px] font-black text-white uppercase mt-2">تحديث الصورة</span>
                  </div>
              </div>
              <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
           
           {/* Section 1: Core Digital Identity */}
           <div className="lg:col-span-7 settings-card p-10 lg:p-14 rounded-[55px] space-y-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
              
              <div className="flex items-center gap-6 border-b border-white/5 pb-10">
                 <div className="w-16 h-16 rounded-[24px] bg-accent/10 flex items-center justify-center text-accent shadow-inner">
                    <Icons.User className="w-8 h-8" />
                 </div>
                 <div>
                    <h4 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">السجل الشخصي</h4>
                    <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1">البيانات المرئية للشبكة</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-3 block">الاسم الرقمي</label>
                    <div className="relative">
                      <input 
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full input-neural rounded-[28px] py-6 px-10 text-base font-bold text-[var(--text-primary)] outline-none text-right pr-16"
                        placeholder="معرف المستخدم"
                      />
                      <Icons.User className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600" />
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-3 block">الاتصال السحابي</label>
                    <div className="relative">
                      <input 
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full input-neural rounded-[28px] py-6 px-10 text-base font-bold text-[var(--text-primary)] outline-none text-right pr-16"
                        placeholder="name@nexus.com"
                      />
                      <Icons.Mail className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600" />
                    </div>
                 </div>

                 <div className="md:col-span-2 space-y-4">
                    <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-3 block">قناة التواصل الهاتفي</label>
                    <div className="relative">
                       <input 
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full input-neural rounded-[28px] py-6 px-10 text-base font-bold text-[var(--text-primary)] outline-none text-left"
                        placeholder="+20 xxxx xxxx"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                         <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">مؤمن</span>
                      </div>
                    </div>
                 </div>
              </div>

              <div className="bg-white/5 border border-white/5 p-8 rounded-[40px] flex items-center gap-6 group hover:bg-white/[0.07] transition-all">
                 <div className="w-14 h-14 bg-accent/20 text-accent rounded-3xl flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-12 transition-transform">
                    <Icons.Sparkles className="w-7 h-7" />
                 </div>
                 <div>
                    <h5 className="text-[12px] font-black text-[var(--text-primary)] uppercase tracking-widest">مزامنة الكفاءة الذكية</h5>
                    <p className="text-[13px] text-[var(--text-secondary)] font-bold mt-2 leading-relaxed">تساعدك المعلومات الدقيقة في الحصول على تقارير ذكاء اصطناعي أكثر صلة بأهدافك اليومية.</p>
                 </div>
              </div>
           </div>

           {/* Section 2: Core Security Panel */}
           <div className="lg:col-span-5 space-y-10">
              <div className="settings-card p-10 lg:p-12 rounded-[55px] space-y-12 relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500/30 to-transparent"></div>
                 
                 <div className="flex items-center gap-6 border-b border-white/5 pb-10">
                    <div className="w-16 h-16 rounded-[24px] bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner">
                       <Icons.Shield className="w-8 h-8" />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">بروتوكول الأمان</h4>
                       <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em] mt-1">إدارة شفرات الوصول</p>
                    </div>
                 </div>

                 <div className="space-y-10">
                    <div className="space-y-4">
                       <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-3 block">تشفير جديد (اختياري)</label>
                       <div className="relative">
                         <input 
                           type="password"
                           value={newPassword}
                           onChange={e => setNewPassword(e.target.value)}
                           className="w-full input-neural rounded-[28px] py-6 px-10 text-base font-bold text-[var(--text-primary)] outline-none text-right pr-16"
                           placeholder="••••••••"
                         />
                         <Icons.Key className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-600" />
                       </div>
                    </div>

                    <div className="p-10 rounded-[45px] bg-[#020617] border border-white/5 text-white space-y-6 shadow-3xl relative overflow-hidden group/security">
                       <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 transition-transform duration-1000 group-hover/security:rotate-12 pointer-events-none">
                          <Icons.Shield className="w-32 h-32" />
                       </div>
                       
                       <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-6">
                             <div className="w-1.5 h-10 bg-accent rounded-full"></div>
                             <label className="text-[11px] font-black text-accent uppercase tracking-[0.3em]">تحقق الهوية الإلزامي</label>
                          </div>
                          <input 
                            required
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-[30px] py-6 px-10 text-xl font-bold outline-none focus:bg-white focus:text-slate-900 transition-all placeholder:text-white/10 shadow-2xl text-right"
                            placeholder="الشفرة الحالية"
                          />
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-6 text-center opacity-50">هذا الحقل مطلوب لإتمام أي عملية مزامنة</p>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Massive Action Button */}
              <button 
                type="submit" 
                disabled={isUpdating}
                className="w-full py-8 bg-accent text-white font-black text-2xl rounded-[60px] shadow-[0_40px_80px_-20px_rgba(var(--accent-rgb,37,99,235),0.5)] transition-all active:scale-[0.96] hover:scale-[1.02] flex items-center justify-center gap-8 group disabled:opacity-50 relative overflow-hidden"
              >
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                 {isUpdating ? (
                    <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                 ) : (
                    <>
                      <span>اعتماد المزامنة السحابية</span>
                      <div className="w-16 h-16 bg-white/20 rounded-[28px] flex items-center justify-center transition-all group-hover:rotate-12 shadow-inner">
                         <Icons.CheckCircle className="w-9 h-9" />
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
