
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
        w-[280px] h-[calc(100vh-32px)] my-4 mx-4
        transition-all duration-700 cubic-bezier(0.2, 0.8, 0.2, 1)
        glass-panel rounded-[40px] flex flex-col overflow-hidden border-white/[0.05]
        ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+32px)] lg:translate-x-0'}
      `}>
        {/* Identity Box with Glowing Title */}
        <div className="p-8 flex flex-col items-center gap-4">
           <div className="w-16 h-16 bg-gradient-to-br from-nebula-purple to-nebula-blue rounded-[24px] flex items-center justify-center text-white shadow-2xl relative group">
              <Icons.Sparkles className="w-8 h-8 animate-pulse" />
              <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
           </div>
           <div className="text-center">
             <h1 className="text-3xl font-black text-white tracking-tighter glow-title">مهامي</h1>
             <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.4em]">إصدار المحترفين</p>
           </div>
        </div>

        {/* Navigation bar with Options */}
        <div className="flex-1 px-4 overflow-y-auto no-scrollbar space-y-8">
           <div className="space-y-1">
              <p className="px-4 text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">التنقل السريع</p>
              <NavItem 
                active={currentView === 'tasks' && selectedCategory === 'الكل'} 
                onClick={() => { onViewChange('tasks'); onCategorySelect('الكل'); onClose(); }}
                icon={<Icons.LayoutDashboard className="w-5 h-5" />} label="جميع المهام" color="#7c3aed"
              />
              <NavItem 
                active={currentView === 'categories'} 
                onClick={() => { onViewChange('categories'); onClose(); }}
                icon={<Icons.Folder className="w-5 h-5" />} label="إدارة القطاعات" color="#3b82f6"
              />
              <NavItem 
                active={currentView === 'settings'} 
                onClick={() => { onViewChange('settings'); onClose(); }}
                icon={<Icons.Settings className="w-5 h-5" />} label="الإعدادات" color="#db2777"
              />
           </div>

           <div className="space-y-1 pb-10">
              <div className="flex items-center justify-between px-4 mb-3">
                 <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">التصنيفات</p>
                 <span className="text-[10px] text-slate-700 font-bold">{categories.length}</span>
              </div>
              {categories.map(cat => (
                <NavItem 
                  key={cat.id}
                  active={currentView === 'tasks' && selectedCategory === cat.name}
                  onClick={() => { onCategorySelect(cat.name); onViewChange('tasks'); onClose(); }}
                  icon={<div className="w-5 h-5" style={{ color: cat.color }}>{cat.icon && CategoryIconMap[cat.icon] ? CategoryIconMap[cat.icon] : CategoryIconMap['star']}</div>}
                  label={cat.name} color={cat.color}
                />
              ))}
           </div>
        </div>

        {/* User Module with Glowing Text */}
        <div className="p-6 bg-white/[0.02] border-t border-white/[0.05]">
           <div 
            onClick={() => { onViewChange('settings'); onClose(); }}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 group hover:bg-white/10 transition-all cursor-pointer overflow-hidden relative"
           >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-nebula-purple to-nebula-blue text-white flex items-center justify-center font-black relative overflow-hidden shadow-lg border border-white/10">
                {user.avatar ? (
                  <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
                ) : (
                  user.username.charAt(0).toUpperCase()
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-black text-white truncate uppercase tracking-tight glow-text group-hover:brightness-125 transition-all">{user.username}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                   <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">متصل</span>
                </div>
              </div>
              
              <button 
                onClick={(e) => { e.stopPropagation(); onLogout(); }} 
                className="p-2 text-slate-500 hover:text-rose-400 transition-colors z-10 active:scale-90"
                title="خروج"
              >
                <Icons.LogOut className="w-4 h-4" />
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
      w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[12px] font-black transition-all duration-300 relative group overflow-hidden
      ${active ? 'bg-white/10 text-white shadow-inner' : 'text-slate-500 hover:text-white hover:bg-white/5'}
    `}
  >
    <div className={`shrink-0 transition-all ${active ? 'scale-110 drop-shadow-[0_0_10px_currentColor]' : ''}`} style={{ color: active ? color : undefined }}>{icon}</div>
    <span className="flex-1 text-right relative z-10">{label}</span>
    {active && <div className="absolute right-0 top-1/4 bottom-1/4 w-1 rounded-l-full shadow-[0_0_15px_white]" style={{ backgroundColor: color }}></div>}
  </button>
);

export default Sidebar;
