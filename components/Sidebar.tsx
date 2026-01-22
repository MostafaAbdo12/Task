
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
  isOpen, onClose, categories, tasks, selectedCategory, onCategorySelect, 
  currentView, onViewChange, user, onLogout 
}) => {
  // حساب عدد المهام لكل فئة للعرض في القائمة الجانبية
  const getCategoryCount = (catName: string) => {
    if (catName === 'الكل') return tasks.length;
    return tasks.filter(t => t.category === catName).length;
  };

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
        {/* Identity Box */}
        <div className="p-10 flex flex-col items-center gap-6">
           <div className="w-20 h-20 bg-gradient-to-br from-nebula-purple to-nebula-blue rounded-[30px] flex items-center justify-center text-white shadow-[0_20px_40px_rgba(124,58,237,0.3)] relative group cursor-pointer hover:rotate-12 transition-transform duration-500">
              <Icons.Sparkles className="w-10 h-10 animate-pulse" />
           </div>
           <div className="text-center">
             <h1 className="text-4xl font-black text-white tracking-tighter glow-title">مهامي</h1>
             <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.5em] mt-1">نظام الكفاءة</p>
           </div>
        </div>

        {/* Navigation bar */}
        <div className="flex-1 px-5 overflow-y-auto no-scrollbar space-y-10">
           <div className="space-y-2">
              <p className="px-5 text-[12px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">القائمة الرئيسية</p>
              <NavItem 
                active={currentView === 'tasks' && selectedCategory === 'الكل'} 
                onClick={() => { onViewChange('tasks'); onCategorySelect('الكل'); onClose(); }}
                icon={<Icons.LayoutDashboard className="w-6 h-6" />} label="جميع المهام" color="#7c3aed"
                count={getCategoryCount('الكل')}
              />
              <NavItem 
                active={currentView === 'categories'} 
                onClick={() => { onViewChange('categories'); onClose(); }}
                icon={<Icons.Folder className="w-6 h-6" />} label="القطاعات" color="#3b82f6"
              />
              <NavItem 
                active={currentView === 'settings'} 
                onClick={() => { onViewChange('settings'); onClose(); }}
                icon={<Icons.Settings className="w-6 h-6" />} label="الإعدادات" color="#db2777"
              />
           </div>

           <div className="space-y-2 pb-14">
              <div className="flex items-center justify-between px-5 mb-5">
                 <p className="text-[12px] font-black text-slate-600 uppercase tracking-[0.2em]">توزيـع المهام</p>
              </div>
              <div className="space-y-1.5">
                {categories.map(cat => (
                  <NavItem 
                    key={cat.id}
                    active={currentView === 'tasks' && selectedCategory === cat.name}
                    onClick={() => { onCategorySelect(cat.name); onViewChange('tasks'); onClose(); }}
                    icon={<div className="w-6 h-6" style={{ color: cat.color }}>{cat.icon && CategoryIconMap[cat.icon] ? CategoryIconMap[cat.icon] : CategoryIconMap['star']}</div>}
                    label={cat.name} 
                    color={cat.color}
                    count={getCategoryCount(cat.name)}
                  />
                ))}
              </div>
           </div>
        </div>

        {/* User Module */}
        <div className="p-8 bg-white/[0.02] border-t border-white/[0.05]">
           <div 
            onClick={() => { onViewChange('settings'); onClose(); }}
            className="flex items-center gap-4 p-4 rounded-[30px] bg-white/[0.03] border border-white/[0.05] group hover:bg-white/[0.07] transition-all cursor-pointer overflow-hidden relative"
           >
              <div className="w-12 h-12 rounded-[20px] bg-gradient-to-tr from-nebula-purple to-nebula-blue text-white flex items-center justify-center font-black shadow-2xl">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.username.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-[16px] font-black text-white truncate">{user.username}</p>
                <div className="flex items-center gap-2 mt-0.5">
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                   <span className="text-[10px] font-black text-emerald-500 uppercase">نشط</span>
                </div>
              </div>
              
              <button onClick={(e) => { e.stopPropagation(); onLogout(); }} className="p-3 text-slate-500 hover:text-rose-400">
                <Icons.LogOut className="w-5 h-5" />
              </button>
           </div>
        </div>
      </aside>
    </>
  );
};

const NavItem = ({ active, onClick, icon, label, color, count }: any) => (
  <button 
    onClick={onClick}
    className={`
      w-full flex items-center gap-4 px-5 py-4 rounded-[24px] text-[16px] font-black transition-all duration-500 relative group
      ${active ? 'bg-white/[0.08] text-white' : 'text-slate-500 hover:text-white hover:bg-white/[0.03]'}
    `}
  >
    <div className={`shrink-0 transition-all ${active ? 'scale-110' : ''}`} style={{ color: active ? color : undefined }}>{icon}</div>
    <span className="flex-1 text-right tracking-tight">{label}</span>
    
    {/* وضوح الأرقام في القائمة الجانبية */}
    {count !== undefined && (
      <span 
        className={`
          text-[11px] font-black px-2.5 py-1 rounded-full border transition-all duration-500
          ${active ? 'bg-white text-slate-900 border-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-500 group-hover:text-white group-hover:border-white/20'}
        `}
        style={{ backgroundColor: active ? color : undefined, color: active ? 'white' : undefined }}
      >
        {count}
      </span>
    )}
    
    {active && (
      <div className="absolute right-0 top-1/4 bottom-1/4 w-1.5 rounded-l-full" style={{ backgroundColor: color }}></div>
    )}
  </button>
);

export default Sidebar;
