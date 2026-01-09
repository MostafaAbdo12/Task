
import React from 'react';
import { Category } from '../types';
import { Icons } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (cat: string) => void;
  onManageCategories: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, categories, selectedCategory, onCategorySelect, onManageCategories }) => {
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
            <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em]">الإصدار 4.0.0-PRO</p>
          </div>
        </div>

        <nav className="flex-1 px-6 py-10 space-y-10 overflow-y-auto no-scrollbar">
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

          <div className="p-6 rounded-3xl bg-cyber-blue/5 border border-cyber-blue/10">
            <h4 className="text-[10px] font-black text-cyber-blue uppercase mb-2">التشفير السحابي</h4>
            <p className="text-[11px] text-slate-500 font-medium">جميع بياناتك محفوظة في مخزن البيانات اللامركزي ومزمنة محلياً.</p>
          </div>
        </nav>

        <div className="p-8 border-t border-white/5">
          <div className="flex items-center gap-4 opacity-50">
             <div className="w-8 h-8 rounded-full bg-slate-800"></div>
             <div>
               <p className="text-xs font-black">الرائد المحاكي</p>
               <p className="text-[10px] text-slate-600">تسجيل دخول آمن</p>
             </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
