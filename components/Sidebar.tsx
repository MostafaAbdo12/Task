
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
  const getCount = (name: string) => name === 'الكل' ? tasks.length : tasks.filter(t => t.category === name).length;

  return (
    <>
      <div className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-md lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      
      <aside className={`
        fixed lg:sticky top-0 right-0 z-[110] 
        w-[320px] h-screen glass-panel border-y-0 border-r-0 bg-white/[0.01] flex flex-col
        transition-transform duration-700 cubic-bezier(0.23, 1, 0.32, 1) ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Logo HUD */}
        <div className="p-12 flex flex-col items-center relative overflow-hidden">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
           <div className="w-20 h-20 rounded-[30px] bg-blue-600 flex items-center justify-center text-white mb-8 shadow-[0_20px_40px_rgba(37,99,235,0.4)] transition-all duration-700 hover:rotate-[15deg] hover:scale-110 group">
              <Icons.Sparkles className="w-10 h-10 animate-pulse group-hover:scale-110 transition-transform" />
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter uppercase glow-text">مهامي</h1>
           <div className="px-6 py-1.5 mt-5 rounded-full border border-white/5 bg-white/5">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Smart Core v10.8</p>
           </div>
        </div>

        {/* Navigation HUD */}
        <div className="flex-1 px-6 overflow-y-auto no-scrollbar space-y-12 py-6">
           <div className="space-y-2">
              <Item 
                active={currentView === 'tasks' && selectedCategory === 'الكل'} 
                onClick={() => { onViewChange('tasks'); onCategorySelect('الكل'); onClose(); }}
                icon={<Icons.LayoutDashboard className="w-5 h-5" />} label="لوحة التحكم" 
                count={getCount('الكل')}
              />
              <Item 
                active={currentView === 'categories'} 
                onClick={() => { onViewChange('categories'); onClose(); }}
                icon={<Icons.Folder className="w-5 h-5" />} label="القطاعات الرقمية" 
              />
              <Item 
                active={currentView === 'settings'} 
                onClick={() => { onViewChange('settings'); onClose(); }}
                icon={<Icons.Settings className="w-5 h-5" />} label="إعدادات الهوية" 
              />
           </div>

           <div className="space-y-2">
              <div className="flex items-center gap-4 px-6 mb-6">
                 <div className="h-[1px] flex-1 bg-white/5"></div>
                 <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">الفلترة الذكية</p>
                 <div className="h-[1px] flex-1 bg-white/5"></div>
              </div>
              {categories.map(cat => (
                <Item 
                  key={cat.id}
                  active={currentView === 'tasks' && selectedCategory === cat.name}
                  onClick={() => { onCategorySelect(cat.name); onViewChange('tasks'); onClose(); }}
                  icon={<div className="w-5 h-5" style={{ color: cat.color }}>{cat.icon && CategoryIconMap[cat.icon] ? CategoryIconMap[cat.icon] : CategoryIconMap['star']}</div>}
                  label={cat.name} 
                  count={getCount(cat.name)}
                />
              ))}
           </div>
        </div>

        {/* Profile HUD Footer */}
        <div className="p-8 border-t border-white/5 bg-white/[0.02] backdrop-blur-2xl">
           <div className="flex items-center gap-6 glass-panel border-white/5 p-4 rounded-[25px] hover:bg-white/5 transition-all">
              <div className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center font-black text-white text-lg bg-[#020617] shadow-inner shadow-blue-500/10">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white truncate leading-none mb-2 tracking-tight">{user.username}</p>
                <button onClick={onLogout} className="text-[10px] font-black text-rose-500/60 hover:text-rose-500 transition-colors uppercase tracking-[0.2em]">End Session</button>
              </div>
           </div>
           
           {/* Signature Credits */}
           <div className="mt-8 flex items-center justify-center gap-3 opacity-30">
              <div className="h-[1px] w-8 bg-slate-700"></div>
              <span className="text-[9px] font-black tracking-widest text-slate-500 uppercase">MOSTAFA ABDO</span>
              <div className="h-[1px] w-8 bg-slate-700"></div>
           </div>
        </div>
      </aside>
    </>
  );
};

const Item = ({ active, onClick, icon, label, count }: any) => (
  <button 
    onClick={onClick}
    className={`
      w-full flex items-center gap-5 px-6 py-4 rounded-[22px] text-[13px] font-bold transition-all duration-500 relative overflow-hidden group
      ${active ? 'bg-blue-600/10 text-white border border-blue-500/20' : 'text-slate-500 hover:text-white hover:bg-white/[0.03] border border-transparent'}
    `}
  >
    {active && <div className="absolute left-0 top-0 w-1 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,1)]"></div>}
    <div className={`shrink-0 transition-all duration-500 ${active ? 'text-blue-400 scale-110' : 'group-hover:scale-110'}`}>{icon}</div>
    <span className="flex-1 text-right tracking-tight">{label}</span>
    {count !== undefined && <span className={`text-[10px] font-black font-mono ${active ? 'text-blue-400 opacity-100' : 'opacity-20'}`}>[{count < 10 ? '0' + count : count}]</span>}
  </button>
);

export default Sidebar;
