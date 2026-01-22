
import React from 'react';
import { Category, User, Task } from '../types';
import { Icons, CategoryIconMap } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  tasks: Task[];
  selectedCategory: string;
  onCategorySelect: (cat: string) => void;
  currentView: 'tasks' | 'settings' | 'categories';
  onViewChange: (view: 'tasks' | 'settings' | 'categories') => void;
  user: User;
  onLogout: () => void;
  onManageCategories: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, onClose, categories, selectedCategory, onCategorySelect, 
  currentView, onViewChange, user, onLogout 
}) => {
  return (
    <>
      <div 
        className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      ></div>
      
      <aside className={`
        fixed lg:sticky top-0 right-0 z-[110] 
        w-[300px] h-[calc(100vh-32px)] my-4 mx-4
        transition-all duration-700 cubic-bezier(0.23, 1, 0.32, 1)
        glass-panel rounded-[45px] flex flex-col overflow-hidden border-white/[0.05] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)]
        ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+32px)] lg:translate-x-0'}
      `}>
        {/* Identity Box with Glowing Title */}
        <div className="p-10 flex flex-col items-center gap-6">
           <div className="w-20 h-20 bg-gradient-to-br from-nebula-purple to-nebula-blue rounded-[30px] flex items-center justify-center text-white shadow-[0_20px_40px_rgba(124,58,237,0.3)] relative group cursor-pointer hover:rotate-12 transition-transform duration-500">
              <Icons.Sparkles className="w-10 h-10 animate-pulse" />
              <div className="absolute inset-0 bg-white/20 blur-2xl opacity-0 group-hover:opacity-60 transition-opacity"></div>
           </div>
           <div className="text-center">
             <h1 className="text-4xl font-black text-white tracking-tighter glow-title">مهامي</h1>
             <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.5em] mt-1">الجيل الخامس</p>
           </div>
        </div>

        {/* Navigation bar with Options */}
        <div className="flex-1 px-5 overflow-y-auto no-scrollbar space-y-10">
           <div className="space-y-2">
              <p className="px-5 text-[12px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">النظام الأساسي</p>
              <NavItem 
                active={currentView === 'tasks' && selectedCategory === 'الكل'} 
                onClick={() => { onViewChange('tasks'); onCategorySelect('الكل'); onClose(); }}
                icon={<Icons.LayoutDashboard className="w-6 h-6" />} label="جميع المهام" color="#7c3aed"
              />
              <NavItem 
                active={currentView === 'categories'} 
                onClick={() => { onViewChange('categories'); onClose(); }}
                icon={<Icons.Folder className="w-6 h-6" />} label="إدارة القطاعات" color="#3b82f6"
              />
              <NavItem 
                active={currentView === 'settings'} 
                onClick={() => { onViewChange('settings'); onClose(); }}
                icon={<Icons.Settings className="w-6 h-6" />} label="الإعدادات" color="#db2777"
              />
           </div>

           <div className="space-y-2 pb-14">
              <div className="flex items-center justify-between px-5 mb-5">
                 <p className="text-[12px] font-black text-slate-600 uppercase tracking-[0.2em]">القطاعات المتصلة</p>
                 <span className="text-[13px] text-slate-700 font-black bg-white/5 px-3 py-1 rounded-full border border-white/5">{categories.length}</span>
              </div>
              <div className="space-y-1.5">
                {categories.map(cat => (
                  <NavItem 
                    key={cat.id}
                    active={currentView === 'tasks' && selectedCategory === cat.name}
                    onClick={() => { onCategorySelect(cat.name); onViewChange('tasks'); onClose(); }}
                    icon={<div className="w-6 h-6" style={{ color: cat.color }}>{cat.icon && CategoryIconMap[cat.icon] ? CategoryIconMap[cat.icon] : CategoryIconMap['star']}</div>}
                    label={cat.name} color={cat.color}
                  />
                ))}
              </div>
           </div>
        </div>

        {/* User Module with Glowing Text */}
        <div className="p-8 bg-white/[0.02] border-t border-white/[0.05]">
           <div 
            onClick={() => { onViewChange('settings'); onClose(); }}
            className="flex items-center gap-4 p-4 rounded-[30px] bg-white/[0.03] border border-white/[0.05] group hover:bg-white/[0.07] transition-all cursor-pointer overflow-hidden relative"
           >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="w-12 h-12 rounded-[20px] bg-gradient-to-tr from-nebula-purple to-nebula-blue text-white flex items-center justify-center font-black relative overflow-hidden shadow-2xl border border-white/10 group-hover:scale-105 transition-transform">
                {user.avatar ? (
                  <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-black text-white truncate uppercase tracking-tight glow-text group-hover:brightness-125 transition-all">{user.username}</p>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]"></div>
                   <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">متصل بالسحابة</span>
                </div>
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); onLogout(); }} 
                className="p-3 text-slate-500 hover:text-rose-400 transition-colors z-10 active:scale-75"
                title="تسجيل الخروج"
              >
                <Icons.LogOut className="w-5 h-5" />
              </button>
           </div>
        </div>
      </aside>
    </>
  );
};

const NavItem = ({ active, onClick, icon, label, color }: any) => (
  <button 
    onClick={onClick}
    className={`
      w-full flex items-center gap-5 px-5 py-4 rounded-[24px] text-[17px] font-black transition-all duration-500 relative group overflow-hidden
      ${active ? 'bg-white/[0.08] text-white shadow-inner' : 'text-slate-500 hover:text-white hover:bg-white/[0.03]'}
    `}
  >
    <div className={`shrink-0 transition-all duration-500 ${active ? 'scale-125 drop-shadow-[0_0_12px_currentColor]' : 'group-hover:scale-110 group-hover:rotate-6'}`} style={{ color: active ? color : undefined }}>{icon}</div>
    <span className="flex-1 text-right relative z-10 tracking-tight">{label}</span>
    {active && (
      <div className="absolute right-0 top-1/4 bottom-1/4 w-1.5 rounded-l-full shadow-[0_0_20px_white]" style={{ backgroundColor: color }}></div>
    )}
  </button>
);

export default Sidebar;
