
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
      <div className={`absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity duration-700 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}></div>
      
      <aside className={`
        absolute left-0 top-0 h-full w-72 bg-black/40 backdrop-blur-[50px] border-r border-white/10 flex flex-col transition-all duration-700 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-8 flex flex-col h-full relative overflow-hidden">
           {/* Glow Refraction */}
           <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>

           <div className="flex items-center gap-4 mb-12 group">
             <div className="relative">
                <div className="absolute inset-0 bg-cyber-blue blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                <div className="relative w-12 h-12 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center text-lg font-black text-white group-hover:rotate-6 transition-all">
                  {user.username.charAt(0).toUpperCase()}
                </div>
             </div>
             <div className="flex flex-col">
                <span className="text-[8px] font-black text-cyber-blue uppercase tracking-[0.4em]">ROOT_ACCESS</span>
                <span className="text-base font-bold text-white truncate w-32">{user.username}</span>
             </div>
           </div>

           <div className="space-y-10 flex-1 overflow-y-auto no-scrollbar">
             <div>
               <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.5em] mb-4 border-b border-white/5 pb-2">CATEGORIES</p>
               <nav className="space-y-2">
                 <button 
                   onClick={() => { onCategorySelect('الكل'); onClose(); }}
                   className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-xs font-bold transition-all ${
                     selectedCategory === 'الكل' 
                     ? 'bg-cyber-blue text-black shadow-lg shadow-cyber-blue/20 translate-x-1' 
                     : 'text-zinc-500 hover:text-white hover:bg-white/5'
                   }`}
                 >
                   <Icons.Folder className="w-4 h-4" /> 
                   <span>الكل</span>
                 </button>

                 {categories.map((cat) => (
                   <button 
                     key={cat.id} 
                     onClick={() => { onCategorySelect(cat.name); onClose(); }}
                     className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl text-xs font-bold transition-all ${
                       selectedCategory === cat.name 
                       ? 'bg-white/10 text-white translate-x-1' 
                       : 'text-zinc-500 hover:text-white hover:bg-white/5'
                     }`}
                   >
                     <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color, boxShadow: `0 0 8px ${cat.color}` }}></div>
                     <span>{cat.name}</span>
                   </button>
                 ))}
               </nav>
             </div>
           </div>

           <div className="mt-8 pt-8 border-t border-white/5">
             <button 
               onClick={onLogout}
               className="w-full flex items-center justify-center gap-3 py-4 text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/5 border border-rose-500/10 rounded-xl hover:bg-rose-500 hover:text-white transition-all shadow-lg hover:shadow-rose-500/30 active:scale-95"
             >
               <Icons.X className="w-4 h-4" />
               <span>TERM_SESSION</span>
             </button>
           </div>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
