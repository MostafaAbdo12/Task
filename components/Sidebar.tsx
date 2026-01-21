
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
  currentView, onViewChange, user, onLogout, onManageCategories
}) => {
  const getCategoryCount = (name: string) => tasks.filter(t => t.category === name).length;

  return (
    <>
      <div 
        className={`fixed inset-0 z-[100] bg-black/60 backdrop-blur-md lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      ></div>

      <aside className={`
        fixed lg:sticky top-4 right-4 z-[110] 
        w-[280px] h-[calc(100vh-32px)] glass-panel
        rounded-[32px] transition-all duration-700 cubic-bezier(0.23, 1, 0.32, 1)
        ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+16px)] lg:translate-x-0'}
        flex flex-col overflow-hidden border-white/5 shadow-2xl
      `}>
        {/* Futuristic Brand */}
        <div className="p-10">
          <div 
            className="flex flex-col items-center gap-4 text-center group cursor-pointer" 
            onClick={() => { onViewChange('tasks'); onCategorySelect('الكل'); onClose(); }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-nebula-purple to-nebula-blue rounded-2xl flex items-center justify-center text-white shadow-2xl floating group-hover:rotate-12 transition-transform">
              <Icons.Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tighter glow-title">مهامي</h1>
              <p className="text-[10px] text-nebula-blue font-bold uppercase tracking-[0.4em]">الإنتاجية الذكية</p>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-6 overflow-y-auto no-scrollbar space-y-10">
          <div>
            <p className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">الوصول السريع</p>
            <div className="space-y-2">
              <NavItem 
                active={currentView === 'tasks' && selectedCategory === 'الكل'} 
                onClick={() => { onViewChange('tasks'); onCategorySelect('الكل'); onClose(); }}
                icon={<Icons.LayoutDashboard className="w-5 h-5" />}
                label="الرئيسية"
              />
              <NavItem 
                active={currentView === 'categories'} 
                onClick={() => { onViewChange('categories'); onClose(); }}
                icon={<Icons.Folder className="w-5 h-5" />}
                label="إدارة القطاعات"
              />
              <NavItem 
                active={currentView === 'settings'} 
                onClick={() => { onViewChange('settings'); onClose(); }}
                icon={<Icons.Settings className="w-5 h-5" />}
                label="الإعدادات"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-4 mb-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">القطاعات</p>
              <button onClick={() => { onViewChange('categories'); onClose(); }} className="text-nebula-blue hover:scale-125 transition-transform">
                <Icons.Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 pb-10">
              {categories.map(cat => (
                <NavItem 
                  key={cat.id}
                  active={currentView === 'tasks' && selectedCategory === cat.name}
                  onClick={() => { onCategorySelect(cat.name); onViewChange('tasks'); onClose(); }}
                  icon={<div className="w-5 h-5 flex items-center justify-center" style={{ color: cat.color }}>{cat.icon && CategoryIconMap[cat.icon]}</div>}
                  label={cat.name}
                  count={getCategoryCount(cat.name)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* User Profile Station */}
        <div className="p-6 bg-white/5 mt-auto border-t border-white/5">
          <div className="flex items-center gap-4 p-4 rounded-[28px] bg-white/5 border border-white/5 transition-all group hover:bg-white/10">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-nebula-purple to-nebula-pink text-white flex items-center justify-center font-black text-xl shadow-lg transform group-hover:rotate-6 transition-transform">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0 text-right">
              <p className="text-sm font-black truncate glow-username uppercase tracking-tight">{user.username}</p>
              <p className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest mt-0.5">وضع الاتصال</p>
            </div>
            <button 
              onClick={onLogout} 
              className="p-2.5 text-slate-500 hover:text-rose-500 transition-colors"
              title="تسجيل خروج"
            >
              <Icons.LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

const NavItem = ({ active, onClick, icon, label, count }: any) => (
  <button 
    onClick={onClick}
    className={`
      w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-[14px] font-bold transition-all duration-300
      ${active 
        ? 'bg-gradient-to-r from-nebula-purple/20 to-transparent text-white border-r-2 border-nebula-purple shadow-[inset_10px_0_20px_rgba(124,58,237,0.1)]' 
        : 'text-slate-400 hover:text-white hover:bg-white/5'}
    `}
  >
    <span className={`shrink-0 transition-transform duration-500 ${active ? 'scale-110' : ''}`}>{icon}</span>
    <span className="flex-1 text-right">{label}</span>
    {count !== undefined && (
      <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${active ? 'bg-nebula-purple text-white' : 'bg-white/5 text-slate-500'}`}>{count}</span>
    )}
  </button>
);

export default Sidebar;
