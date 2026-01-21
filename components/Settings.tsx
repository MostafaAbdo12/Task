
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

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
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
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-700">
        
        {/* Profile Header Card */}
        <div className="relative group">
          <div className="h-72 w-full rounded-[50px] bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#1e293b] overflow-hidden relative shadow-2xl border border-white/5">
            {/* Ambient Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
               <div className="absolute -top-24 -right-24 w-96 h-96 bg-accent opacity-20 rounded-full blur-[120px] animate-pulse"></div>
               <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500 opacity-10 rounded-full blur-[100px] animate-pulse-slow"></div>
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            </div>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 z-10">
              <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-xl px-6 py-2.5 rounded-full border border-white/10 mb-6 transition-all group-hover:bg-white/10">
                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
                 <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">نظام التشفير النشط: AES-256</span>
              </div>
              <h2 className="text-4xl lg:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">تعديل الهوية الرقمية</h2>
              <p className="text-slate-400 mt-4 text-sm font-bold opacity-70">قم بتخصيص ملامح حسابك السحابي وإدارة إعدادات الأمان</p>
            </div>
          </div>

          {/* Floating Profile Image */}
          <div className="relative -mt-24 flex justify-center px-4">
            <div className="bg-white/10 backdrop-blur-3xl p-4 rounded-[60px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] border border-white/20 group/avatar">
              <div className="relative">
                <div className="w-40 h-40 lg:w-48 lg:h-48 rounded-[48px] overflow-hidden bg-slate-800 border-4 border-white shadow-2xl flex items-center justify-center transition-transform duration-500 group-hover/avatar:scale-[1.02]">
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-accent to-indigo-700 flex items-center justify-center text-6xl font-black text-white">
                      {username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                {/* Upload Action Button */}
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-14 h-14 bg-accent text-white rounded-2xl shadow-xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all border-4 border-white group/btn"
                >
                   <Icons.Eye className="w-7 h-7 group-hover/btn:rotate-12 transition-transform" />
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

        <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           
           {/* Section 1: Personal Information */}
           <div className="lg:col-span-7 bg-[var(--panel-bg)] backdrop-blur-3xl p-10 lg:p-14 rounded-[50px] border border-[var(--border-color)] shadow-2xl space-y-12">
              <div className="flex items-center gap-5 border-b border-[var(--border-color)] pb-8">
                 <div className="w-14 h-14 rounded-3xl bg-accent/10 flex items-center justify-center text-accent shadow-sm">
                    <Icons.User className="w-8 h-8" />
                 </div>
                 <div>
                    <h4 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">البيانات الأساسية</h4>
                    <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-1">المعلومات التي تظهر في ملفك الشخصي</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-2 block">الاسم البرمجي</label>
                    <div className="relative">
                      <input 
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full bg-black/5 border-2 border-[var(--border-color)] rounded-3xl py-5 px-8 text-base font-bold text-[var(--text-primary)] outline-none focus:border-accent transition-all shadow-inner"
                        placeholder="اسم المستخدم"
                      />
                      <Icons.User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20" />
                    </div>
                 </div>
                 
                 <div className="space-y-3">
                    <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-2 block">البريد السحابي</label>
                    <div className="relative">
                      <input 
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-black/5 border-2 border-[var(--border-color)] rounded-3xl py-5 px-8 text-base font-bold text-[var(--text-primary)] outline-none focus:border-accent transition-all shadow-inner"
                        placeholder="name@cloud.com"
                      />
                      <Icons.Bell className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20" />
                    </div>
                 </div>

                 <div className="md:col-span-2 space-y-3">
                    <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-2 block">رقم التواصل الموحد</label>
                    <div className="relative">
                       <input 
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        className="w-full bg-black/5 border-2 border-[var(--border-color)] rounded-3xl py-5 px-8 text-base font-bold text-[var(--text-primary)] outline-none focus:border-accent transition-all shadow-inner text-left"
                        placeholder="+20xxxxxxxxxx"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                         <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">مفعل</span>
                      </div>
                    </div>
                 </div>
              </div>

              <div className="bg-accent/5 p-8 rounded-[40px] border border-accent/10 flex items-start gap-5">
                 <div className="w-10 h-10 bg-accent text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-accent/20">
                    <Icons.Sparkles className="w-6 h-6" />
                 </div>
                 <div>
                    <h5 className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-widest">تلميحات الإنتاجية</h5>
                    <p className="text-sm text-[var(--text-secondary)] font-bold mt-2 leading-relaxed">بقاء بياناتك محدثة يساعد نظام الذكاء الاصطناعي في تقديم اقتراحات أكثر دقة ومواءمة لنمط عملك اليومي.</p>
                 </div>
              </div>
           </div>

           {/* Section 2: Security & Save */}
           <div className="lg:col-span-5 space-y-8">
              <div className="bg-[var(--panel-bg)] backdrop-blur-3xl p-10 lg:p-12 rounded-[50px] border border-[var(--border-color)] shadow-2xl space-y-10">
                 <div className="flex items-center gap-5 border-b border-[var(--border-color)] pb-8">
                    <div className="w-14 h-14 rounded-3xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-sm">
                       <Icons.Shield className="w-8 h-8" />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">الأمان والخصوصية</h4>
                       <p className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest mt-1">إدارة طبقات الحماية</p>
                    </div>
                 </div>

                 <div className="space-y-8">
                    <div className="space-y-3">
                       <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-2 block">كلمة مرور جديدة (اتركها فارغة لعدم التغيير)</label>
                       <div className="relative">
                         <input 
                           type="password"
                           value={newPassword}
                           onChange={e => setNewPassword(e.target.value)}
                           className="w-full bg-black/5 border-2 border-[var(--border-color)] rounded-3xl py-5 px-8 text-base font-bold text-[var(--text-primary)] outline-none focus:border-rose-500 transition-all shadow-inner"
                           placeholder="••••••••"
                         />
                         <Icons.Shield className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 opacity-20" />
                       </div>
                    </div>

                    <div className="p-10 rounded-[45px] bg-[#0f172a] text-white space-y-6 relative overflow-hidden group/pass shadow-2xl">
                       <div className="absolute top-0 right-0 p-10 opacity-5 group-hover/pass:rotate-12 transition-transform duration-1000 scale-150 pointer-events-none">
                          <Icons.LogOut className="w-32 h-32" />
                       </div>
                       
                       <div className="relative z-10">
                          <label className="text-[11px] font-black text-accent uppercase tracking-[0.3em] block mb-4">تأكيد الهوية البيومترية</label>
                          <input 
                            required
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full bg-white/5 border-2 border-white/10 rounded-[28px] py-6 px-10 text-lg font-bold outline-none focus:bg-white focus:text-slate-900 transition-all placeholder:text-white/20 shadow-2xl"
                            placeholder="كلمة المرور الحالية"
                          />
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-4 text-center">مطلوب لاعتماد أي تغييرات في السجل</p>
                       </div>
                    </div>
                 </div>
              </div>

              <button 
                type="submit" 
                disabled={isUpdating}
                className="w-full py-8 bg-accent hover:bg-accent/90 text-white font-black text-2xl rounded-[50px] shadow-[0_30px_70px_-15px_rgba(37,99,235,0.4)] transition-all active:scale-[0.97] flex items-center justify-center gap-6 group disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden relative"
              >
                 <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                 {isUpdating ? (
                    <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                 ) : (
                    <>
                      <span className="relative z-10">مزامنة البيانات الآن</span>
                      <div className="w-14 h-14 bg-white/20 rounded-3xl flex items-center justify-center group-hover:rotate-12 transition-all shadow-xl relative z-10">
                         <Icons.CheckCircle className="w-8 h-8" />
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
