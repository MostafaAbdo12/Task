
import React from 'react';
import { Category, User } from '../types';
import { Icons, CategoryIconMap } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (cat: string) => void;
  currentView: 'tasks' | 'settings';
  onViewChange: (view: 'tasks' | 'settings') => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, onClose, categories, selectedCategory, onCategorySelect, 
  currentView, onViewChange, user, onLogout 
}) => {
  return (
    <>
      <style>{`
        @keyframes heartBeatPulse {
          0% { transform: scale(1); }
          15% { transform: scale(1.2); }
          30% { transform: scale(1); }
          45% { transform: scale(1.1); }
          60% { transform: scale(1); }
        }
        .animate-heart-beat-pulse {
          animation: heartBeatPulse 1.8s infinite cubic-bezier(0.2, 0, 0, 1);
        }
        @keyframes signatureGlow {
          0%, 100% { box-shadow: 0 0 10px rgba(37, 99, 235, 0.1), 0 0 5px rgba(37, 99, 235, 0.05); }
          50% { box-shadow: 0 0 25px rgba(37, 99, 235, 0.35), 0 0 8px rgba(37, 99, 235, 0.15); }
        }
        .kinetic-signature-card-mini {
          animation: signatureGlow 4s ease-in-out infinite;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(8px);
        }
        @keyframes neonFlickerMini {
          0%, 100% { opacity: 0.9; text-shadow: 0 0 3px rgba(37, 99, 235, 0.2); }
          50% { opacity: 1; text-shadow: 0 0 10px rgba(37, 99, 235, 0.4); }
        }
        .neon-name-mini {
          animation: neonFlickerMini 3s ease-in-out infinite;
          background: linear-gradient(90deg, #2563eb, #4f46e5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      <div 
        className={`fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      ></div>
      
      <aside className={`
        fixed lg:relative inset-y-0 right-0 z-[110] 
        w-[300px] h-full bg-[#0f172a] text-white
        transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
        border-l border-slate-800/50 shadow-2xl
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col">
           {/* Header Section */}
           <div className="px-8 pt-12 pb-8">
             <div className="flex items-center gap-4 group cursor-pointer" onClick={() => { onViewChange('tasks'); onClose(); }}>
               <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-all duration-500 group-hover:rotate-12">
                 <Icons.Sparkles className="w-6 h-6 text-white" />
               </div>
               <div>
                 <h1 className="text-2xl font-black tracking-tighter text-white">مهامي</h1>
                 <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">نظام الإدارة الذكي</p>
               </div>
             </div>
           </div>

           <div className="flex-1 px-4 py-4 space-y-10 overflow-y-auto no-scrollbar">
              {/* Main Navigation */}
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-4">القائمة الرئيسية</p>
                 <nav className="space-y-1">
                   <button 
                     onClick={() => { onViewChange('tasks'); onCategorySelect('الكل'); onClose(); }}
                     className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[14px] font-bold transition-all duration-300 ${
                       currentView === 'tasks' && selectedCategory === 'الكل' 
                       ? 'bg-blue-600 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.5)]' 
                       : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                     }`}
                   >
                     <Icons.LayoutDashboard className="w-5 h-5" /> 
                     <span>جميع المهام</span>
                   </button>

                   <button 
                     onClick={() => { onViewChange('settings'); onClose(); }}
                     className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[14px] font-bold transition-all duration-300 ${
                       currentView === 'settings'
                       ? 'bg-blue-600 text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.5)]' 
                       : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                     }`}
                   >
                     <Icons.Settings className="w-5 h-5" /> 
                     <span>الإعدادات</span>
                   </button>
                 </nav>
              </div>

              {/* Dynamic Categories Section */}
              {currentView === 'tasks' && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="flex items-center justify-between px-4">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">التصنيفات</p>
                    <span className="bg-slate-800 text-slate-400 text-[10px] px-2 py-0.5 rounded-full font-bold">{categories.length}</span>
                  </div>
                  <nav className="space-y-1 pb-10">
                    {categories.map((cat) => {
                      const isActive = selectedCategory === cat.name;
                      return (
                        <button 
                          key={cat.id} 
                          onClick={() => { onCategorySelect(cat.name); onClose(); }}
                          className={`w-full group flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[14px] font-bold transition-all duration-300 ${
                            isActive 
                            ? 'bg-slate-800/80 text-white ring-1 ring-slate-700/50' 
                            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                          }`}
                        >
                          <div 
                            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive ? 'scale-110 shadow-lg' : 'group-hover:scale-105'}`}
                            style={{ 
                              backgroundColor: isActive ? cat.color : `${cat.color}15`,
                              color: isActive ? 'white' : cat.color
                            }}
                          >
                            {cat.icon && CategoryIconMap[cat.icon] ? CategoryIconMap[cat.icon] : CategoryIconMap['star']}
                          </div>
                          <span className="truncate flex-1 text-right">{cat.name}</span>
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]"></div>}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              )}
           </div>

           {/* Footer Section */}
           <div className="p-6 mt-auto space-y-5">
              {/* User Profile */}
              <div className="bg-[#1e293b]/40 border border-slate-700/40 p-3.5 rounded-[22px] flex items-center gap-3.5 hover:bg-[#1e293b]/60 transition-colors">
                 <div className="relative">
                   <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center overflow-hidden shadow-lg border border-white/10">
                     {user.avatar ? (
                       <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                     ) : (
                       <span className="text-base font-black text-white">{user.username.charAt(0).toUpperCase()}</span>
                     )}
                   </div>
                   <div className="absolute -bottom-0.5 -left-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0f172a] rounded-full"></div>
                 </div>
                 <div className="flex-1 min-w-0 text-right">
                   <p className="text-[13px] font-bold text-white truncate">{user.username}</p>
                   <p className="text-[9px] text-slate-500 font-medium tracking-wide">الوضع النشط</p>
                 </div>
                 <button 
                   onClick={onLogout} 
                   className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
                   title="خروج"
                 >
                    <Icons.LogOut className="w-4 h-4" />
                 </button>
              </div>

              {/* Mini Kinetic Signature Credit */}
              <div className="px-1 transform transition-transform hover:scale-105 duration-500">
                <div className="kinetic-signature-card-mini px-4 py-2.5 rounded-[20px] flex flex-col items-center gap-1.5 border border-blue-100/30 shadow-lg relative overflow-hidden group">
                  <div className="flex items-center gap-2 text-[8.5px] font-black text-slate-500 uppercase tracking-[0.2em] relative z-10">
                    <span>صنع بكل</span>
                    <span className="animate-heart-beat-pulse inline-block text-rose-500 text-base drop-shadow-[0_0_5px_rgba(244,63,94,0.4)]">❤️</span>
                    <span>من قبل</span>
                  </div>
                  
                  <div className="h-[1px] w-8 bg-gradient-to-r from-transparent via-blue-100 to-transparent relative z-10"></div>
                  
                  <div className="neon-name-mini text-[11px] font-black tracking-[0.2em] uppercase select-none cursor-default relative z-10">
                    MOSTAFA ABDO
                  </div>
                </div>
              </div>
           </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
