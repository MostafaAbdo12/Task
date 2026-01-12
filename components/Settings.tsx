
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
        showToast("تم رفع الصورة بنجاح، احفظ التغييرات للتثبيت", 'info');
      };
      reader.readAsDataURL(file);
    }
  };

  // Fix: handleUpdate is now async to properly await storageService.getUsers() and storageService.updateUser()
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      // Correctly await the promise from storageService.getUsers() to get the actual array
      const users = await storageService.getUsers();
      const currentUserData = users.find(u => u.username === user.username);
      
      if (!currentUserData || password !== currentUserData.password) {
        showToast("كلمة المرور الحالية غير صحيحة", 'danger');
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

      // Correctly await the promise from storageService.updateUser()
      const success = await storageService.updateUser(user.username, updatedFields);
      if (success) {
        const updatedUserSession: User = { ...user, ...updatedFields, lastLogin: new Date().toISOString() };
        storageService.setSession(updatedUserSession);
        onUpdate(updatedUserSession);
        showToast("تم تحديث هويتك الرقمية بنجاح", 'success');
        setPassword('');
        setNewPassword('');
      } else {
        showToast("خطأ في تحديث البيانات", 'danger');
      }
    } catch (err) {
      console.error("Cloud Update Error:", err);
      showToast("فشل الاتصال بقاعدة البيانات العالمية", 'danger');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pb-24 px-4 lg:px-12 pt-6">
      <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        
        {/* Hero Section / Profile Header */}
        <div className="relative">
          <div className="h-64 w-full rounded-[60px] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] overflow-hidden relative shadow-2xl border border-white/5">
            {/* Abstract Pattern Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
               <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
               <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-[150px] translate-y-1/2 -translate-x-1/2"></div>
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
              <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter mb-4 drop-shadow-2xl">تخصيص الهوية الرقمية</h2>
              <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-2 rounded-full border border-white/10">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">نظام التشفير النشط: 256-Bit</span>
              </div>
            </div>
          </div>

          {/* Floating Profile Image Card */}
          <div className="relative -mt-20 flex justify-center px-4">
            <div className="bg-white/80 backdrop-blur-3xl p-3 rounded-[50px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-white/50 group">
              <div className="relative">
                <div className="w-36 h-36 lg:w-44 lg:h-44 rounded-[42px] overflow-hidden bg-slate-100 border-4 border-white shadow-inner flex items-center justify-center">
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-5xl font-black text-white">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                {/* Upload Trigger Button */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-blue-600 border border-slate-100 hover:scale-110 active:scale-95 transition-all group/cam"
                  title="تغيير الصورة"
                >
                   <Icons.Eye className="w-6 h-6 group-hover/cam:rotate-12 transition-transform" />
                   <input 
                     ref={fileInputRef}
                     type="file" 
                     className="hidden" 
                     accept="image/*"
                     onChange={handleImageUpload}
                   />
                </button>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
           
           {/* Left Card: Account Details */}
           <div className="bg-white/70 backdrop-blur-xl p-10 rounded-[50px] border border-white/50 shadow-2xl shadow-slate-200/50 space-y-10">
              <div className="flex items-center gap-4 mb-2">
                 <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                    <Icons.User className="w-6 h-6" />
                 </div>
                 <div>
                    <h4 className="text-lg font-black text-slate-900 tracking-tight">البيانات العامة</h4>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">معلومات الحساب الأساسية</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block text-right">الاسم البرمجي</label>
                    <input 
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      className="w-full bg-slate-50/50 border-2 border-slate-100/50 rounded-3xl py-5 px-8 text-base font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                      placeholder="اسم المستخدم"
                    />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block text-right">البريد الإلكتروني</label>
                    <input 
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-50/50 border-2 border-slate-100/50 rounded-3xl py-5 px-8 text-base font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                      placeholder="name@domain.com"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block text-right">رقم التواصل الموحد</label>
                    <div className="relative group">
                       <input 
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full bg-slate-50/50 border-2 border-slate-100/50 rounded-3xl py-5 px-8 text-base font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner text-left"
                        placeholder="+20xxxxxxxxxx"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">تنبيهات نشطة</span>
                      </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Right Card: Security & Submission */}
           <div className="space-y-8">
              <div className="bg-white/70 backdrop-blur-xl p-10 rounded-[50px] border border-white/50 shadow-2xl shadow-slate-200/50 space-y-10">
                 <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm">
                       <Icons.Shield className="w-6 h-6" />
                    </div>
                    <div>
                       <h4 className="text-lg font-black text-slate-900 tracking-tight">إدارة الأمان</h4>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">كلمات المرور والتشفير</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block text-right">كلمة مرور جديدة (اختياري)</label>
                       <input 
                         type="password"
                         value={newPassword}
                         onChange={e => setNewPassword(e.target.value)}
                         className="w-full bg-slate-50/50 border-2 border-slate-100/50 rounded-3xl py-5 px-8 text-base font-bold outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
                         placeholder="••••••••"
                       />
                    </div>

                    <div className="p-8 rounded-[40px] bg-[#0f172a] text-white space-y-4 relative overflow-hidden group/pass">
                       <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/pass:rotate-45 transition-transform duration-700">
                          <Icons.LogOut className="w-24 h-24" />
                       </div>
                       <label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] block text-right relative z-10">تأكيد الهوية الحالية</label>
                       <input 
                         required
                         type="password"
                         value={password}
                         onChange={e => setPassword(e.target.value)}
                         className="w-full bg-white/10 border border-white/10 rounded-2xl py-5 px-8 text-base font-bold outline-none focus:bg-white focus:text-slate-900 transition-all placeholder:text-white/20 relative z-10 shadow-2xl"
                         placeholder="كلمة المرور الحالية"
                       />
                    </div>
                 </div>
              </div>

              <button 
                type="submit" 
                disabled={isUpdating}
                className="w-full py-7 bg-blue-600 hover:bg-blue-700 text-white font-black text-xl rounded-[40px] shadow-[0_30px_60px_-15px_rgba(37,99,235,0.4)] transition-all active:scale-[0.97] flex items-center justify-center gap-4 group disabled:opacity-70"
              >
                 {isUpdating ? (
                    <div className="w-8 h-8 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                 ) : (
                    <>
                      <span>تطبيق التغييرات الذكية</span>
                      <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg">
                         <Icons.CheckCircle className="w-6 h-6" />
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
