
import React from 'react';
import { Category, User } from '../types';
import { Icons } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (cat: string) => void;
  onManageCategories: () => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, categories, selectedCategory, onCategorySelect, onManageCategories, user, onLogout }) => {
  return (
    <div className={`fixed inset-0 z-[60] lg:relative lg:block transition-all duration-500 ${isOpen ? 'visible' : 'invisible lg:visible'}`}>
      <div className={`absolute inset-0 bg-cyber-black/80 backdrop-blur-md lg:hidden transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}></div>
      
      <aside className={`
        absolute lg:relative right-0 h-full bg-cyber-dark border-l border-white/5 w-72 transition-transform duration-500 flex flex-col
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-cyber-blue text-black flex items-center justify-center font-black animate-pulse-neon">
            <Icons.Folder />
          </div>
          <div>
            <h2 className="text-xl font-black neon-text uppercase tracking-tighter">نظام مهام</h2>
            <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em]">العميل: {user.username}</p>
          </div>
        </div>

        <nav className="flex-1 px-6 py-6 space-y-8 overflow-y-auto no-scrollbar">
          <div className="space-y-4">
            <div className="flex justify-between items-center px-4">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">ملفات البيانات</p>
              <button 
                onClick={onManageCategories}
                className="p-1 hover:text-cyber-blue transition-colors text-slate-600"
                title="إدارة التصنيفات"
              >
                <Icons.Edit />
              </button>
            </div>
            
            <button 
              onClick={() => { onCategorySelect('الكل'); onClose(); }}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${selectedCategory === 'الكل' ? 'active-cyber' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              <Icons.Folder />
              <span>المخزن الرئيسي</span>
            </button>
            
            {categories.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => { onCategorySelect(cat.name); onClose(); }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-bold transition-all group ${selectedCategory === cat.name ? 'text-white border border-white/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                style={{ backgroundColor: selectedCategory === cat.name ? cat.color + '44' : '' }}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></div>
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="p-8 border-t border-white/5 flex flex-col gap-4">
          <div className="flex items-center gap-4">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-blue to-cyber-purple flex items-center justify-center font-black text-black">
               {user.username.charAt(0).toUpperCase()}
             </div>
             <div>
               <p className="text-xs font-black truncate w-32">{user.username}</p>
               <p className="text-[9px] text-slate-600 uppercase font-black">جلسة نشطة</p>
             </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full py-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black text-cyber-rose hover:bg-cyber-rose/10 hover:border-cyber-rose/20 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
          >
            <Icons.Trash /> إنهاء الجلسة
          </button>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
