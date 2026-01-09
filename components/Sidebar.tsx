
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
  return (
    <div className={`fixed inset-0 z-[100] transition-all duration-700 ${isOpen ? 'visible' : 'invisible'}`}>
      <div className={`absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity duration-700 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}></div>
      
      <aside className={`
        absolute left-0 top-0 h-full w-80 glass-morphism border-r border-white/5 flex flex-col transition-all duration-700 ease-in-out
        ${isOpen ? 'translate-x-0 skew-y-0' : '-translate-x-full -skew-y-12'}
      `}>
        <div className="p-12 flex flex-col h-full">
           <div className="flex items-center gap-5 mb-16 stagger-item">
             <div className="w-14 h-14 rounded-3xl bg-white text-black flex items-center justify-center text-xl font-black shadow-2xl animate-float">
               {user.username.charAt(0).toUpperCase()}
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Chief Officer</span>
                <span className="text-lg font-bold truncate">{user.username}</span>
             </div>
           </div>

           <div className="space-y-12 flex-1">
             <div className="stagger-item" style={{ animationDelay: '0.1s' }}>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-6">القطاعات الرئيسية</p>
               <nav className="space-y-3">
                 <button 
                   onClick={() => { onCategorySelect('الكل'); onClose(); }}
                   className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-500 ${selectedCategory === 'الكل' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 translate-x-2' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                 >
                   <Icons.Folder /> الكل
                 </button>
                 {categories.map((cat, idx) => (
                   <button 
                     key={cat.id} 
                     onClick={() => { onCategorySelect(cat.name); onClose(); }}
                     className={`w-full flex items-center gap-5 px-6 py-4 rounded-2xl text-sm font-bold transition-all duration-500 ${selectedCategory === cat.name ? 'bg-white/10 text-white shadow-lg translate-x-2' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                     style={{ animationDelay: `${idx * 0.05}s` }}
                   >
                     <div className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]" style={{ backgroundColor: cat.color, color: cat.color }}></div>
                     {cat.name}
                   </button>
                 ))}
               </nav>
             </div>
           </div>

           <div className="mt-auto stagger-item" style={{ animationDelay: '0.3s' }}>
             <button 
               onClick={onLogout}
               className="w-full flex items-center justify-center gap-4 px-6 py-5 bg-rose-500/10 text-rose-400 font-black text-[11px] uppercase tracking-widest rounded-2xl hover:bg-rose-500 hover:text-white transition-all duration-500 active:scale-90"
             >
               <Icons.X /> إغلاق الجلسة
             </button>
           </div>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
