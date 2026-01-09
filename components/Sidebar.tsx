
import React from 'react';
import { Category, User } from '../types';
import { Icons } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (cat: string) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, categories, selectedCategory, onCategorySelect, user, onLogout }) => {
  const currentXp = user.xp || 0;
  const currentLevel = user.level || 1;
  const xpInCurrentLevel = currentXp % 100;
  const progressPercent = Math.min(100, xpInCurrentLevel);

  return (
    <>
      <div 
        className={`fixed inset-0 z-[100] bg-black/80 backdrop-blur-xl transition-opacity duration-700 lg:hidden ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} 
        onClick={onClose}
      ></div>
      
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-[110] 
        w-80 lg:w-96 h-full 
        bg-transparent
        flex flex-col transition-all duration-700 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-10 lg:p-14 flex flex-col h-full relative">
           
           {/* User Profile - Experience System */}
           <div className="flex flex-col items-center gap-6 mb-16 group">
             <div className="relative">
                <div className="absolute inset-0 bg-cmd-accent/30 blur-2xl animate-pulse"></div>
                <div className="relative w-24 h-24 rounded-full bg-white/5 border-2 border-white/10 flex items-center justify-center text-4xl font-black text-white shadow-2xl transition-transform group-hover:scale-105 duration-700">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-cmd-accent rounded-full border-4 border-cmd-bg flex items-center justify-center text-black font-black text-xs shadow-lg">
                  Lvl {currentLevel}
                </div>
             </div>
             <div className="text-center w-full">
                <p className="text-[10px] font-black text-cmd-accent uppercase tracking-[0.5em] mb-1">الحالة العصبية</p>
                <h2 className="text-xl font-black text-white italic tracking-tighter mb-4">{user.username}</h2>
                
                {/* Level Progress Bar */}
                <div className="w-full space-y-2 px-2">
                  <div className="flex justify-between text-[9px] font-mono text-white/40 uppercase">
                    <span>الخبرة XP</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="level-bar-fill h-full bg-cmd-accent shadow-[0_0_10px_rgba(0,242,255,0.5)]"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>
             </div>
           </div>

           {/* Energy Pillars - Navigation */}
           <div className="flex-1 overflow-y-auto no-scrollbar space-y-12">
             <div className="space-y-8">
               <p className="text-[11px] font-black text-white/20 uppercase tracking-[0.8em] px-4">ترددات المجال</p>
               <nav className="space-y-4">
                 <button 
                   onClick={() => { onCategorySelect('الكل'); onClose(); }}
                   className={`w-full flex items-center gap-6 px-8 py-5 rounded-[2rem] text-sm font-black transition-all relative overflow-hidden group ${
                     selectedCategory === 'الكل' 
                     ? 'bg-white/10 text-white border border-white/10' 
                     : 'text-white/20 hover:text-white/60 hover:bg-white/[0.03]'
                   }`}
                 >
                   <Icons.Folder className={`w-5 h-5 transition-transform duration-500 ${selectedCategory === 'الكل' ? 'rotate-12' : 'group-hover:rotate-12'}`} /> 
                   <span className="tracking-widest uppercase">كل الأبعاد</span>
                   {selectedCategory === 'الكل' && <div className="absolute left-0 w-1 h-8 bg-cmd-accent rounded-full"></div>}
                 </button>

                 {categories.map((cat) => (
                   <button 
                     key={cat.id} 
                     onClick={() => { onCategorySelect(cat.name); onClose(); }}
                     className={`w-full flex items-center gap-6 px-8 py-5 rounded-[2rem] text-sm font-black transition-all relative overflow-hidden group ${
                       selectedCategory === cat.name 
                       ? 'bg-white/10 text-white border border-white/10' 
                       : 'text-white/20 hover:text-white/60 hover:bg-white/[0.03]'
                     }`}
                   >
                     <div 
                       className="w-3 h-3 rounded-full transition-all duration-700" 
                       style={{ 
                         backgroundColor: cat.color, 
                         boxShadow: selectedCategory === cat.name ? `0 0 20px ${cat.color}` : 'none',
                         transform: selectedCategory === cat.name ? 'scale(1.5)' : 'scale(1)'
                       }}
                     ></div>
                     <span className="truncate tracking-widest uppercase">{cat.name}</span>
                     {selectedCategory === cat.name && <div className="absolute left-0 w-1 h-8 rounded-full" style={{ backgroundColor: cat.color }}></div>}
                   </button>
                 ))}
               </nav>
             </div>
           </div>

           {/* Footer - Exit Portal & Credits */}
           <div className="mt-auto pt-10 border-t border-white/5 space-y-8">
              <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-4 py-5 text-[11px] font-black uppercase tracking-[0.4em] text-rose-500/60 hover:text-rose-400 bg-rose-500/5 border border-rose-500/10 rounded-3xl hover:bg-rose-500/10 transition-all group"
              >
                <Icons.X className="w-5 h-5 group-hover:rotate-180 transition-transform duration-700" />
                <span>إغلاق البعد</span>
              </button>

              <div className="text-center py-6 px-4 bg-white/[0.02] rounded-[2rem] border border-white/5 relative overflow-hidden group/footer">
                <div className="absolute inset-0 bg-gradient-to-br from-cmd-accent/5 to-transparent"></div>
                <div className="relative z-10 flex flex-col items-center gap-1">
                  <p className="text-[11px] font-bold text-white/50 tracking-tight flex items-center gap-2">
                    <span>صنع بكل</span>
                    <span className="text-rose-500 group-hover/footer:animate-pulse transition-all drop-shadow-[0_0_5px_rgba(244,63,94,0.4)]">❤️</span>
                    <span>من قبل</span>
                  </p>
                  <p className="text-sm font-black text-cmd-accent italic tracking-widest drop-shadow-[0_0_10px_rgba(0,242,255,0.4)] group-hover/footer:drop-shadow-[0_0_15px_rgba(0,242,255,0.7)] transition-all">
                    Mostafa Abdo
                  </p>
                </div>
              </div>
           </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
