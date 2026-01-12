
import React, { useState, useRef } from 'react';
import { Category, User, Task } from '../types';
import { Icons, CategoryIconMap } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  tasks: Task[];
  selectedCategory: string;
  onCategorySelect: (cat: string) => void;
  currentView: 'tasks' | 'settings';
  onViewChange: (view: 'tasks' | 'settings') => void;
  user: User;
  onLogout: () => void;
  onManageCategories: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, onClose, categories, tasks, selectedCategory, onCategorySelect, 
  currentView, onViewChange, user, onLogout, onManageCategories
}) => {
  
  const getCategoryCount = (name: string) => tasks.filter(t => t.category === name).length;
  
  // التحكم في تأثير الـ 3D الاحترافي للتوقيع
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const signatureRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!signatureRef.current) return;
    const rect = signatureRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // زيادة حساسية الـ 3D لتأثير أعمق
    const rotateX = (y - centerY) / 6;
    const rotateY = (centerX - x) / 6;
    setRotate({ x: rotateX, y: rotateY });
  };

  const resetRotate = () => setRotate({ x: 0, y: 0 });

  return (
    <>
      <style>{`
        @keyframes neonPulse {
          0%, 100% { text-shadow: 0 0 10px rgba(37, 99, 235, 0.6), 0 0 20px rgba(37, 99, 235, 0.3); color: #60a5fa; }
          50% { text-shadow: 0 0 25px rgba(37, 99, 235, 0.9), 0 0 45px rgba(37, 99, 235, 0.6); color: #fff; }
        }
        @keyframes heartBeat3D {
          0% { transform: translateZ(20px) scale(1); }
          15% { transform: translateZ(35px) scale(1.3); }
          30% { transform: translateZ(20px) scale(1); }
          45% { transform: translateZ(35px) scale(1.3); }
          100% { transform: translateZ(20px) scale(1); }
        }
        .signature-3d-wrap {
          perspective: 1200px;
        }
        .signature-card-3d {
          transition: transform 0.15s ease-out, box-shadow 0.3s ease;
          transform-style: preserve-3d;
        }
        .neon-name {
          animation: neonPulse 2.5s infinite ease-in-out;
          transform: translateZ(40px);
        }
        .pulse-heart-3d {
          animation: heartBeat3D 1.8s infinite;
          display: inline-block;
          transform: translateZ(25px);
        }
        .shimmer-effect {
          background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(255, 255, 255, 0.05) 45%,
            rgba(255, 255, 255, 0.15) 50%,
            rgba(255, 255, 255, 0.05) 55%,
            transparent 100%
          );
          background-size: 200% 200%;
          animation: shimmerAnim 4s infinite linear;
        }
        @keyframes shimmerAnim {
          0% { background-position: -200% -200%; }
          100% { background-position: 200% 200%; }
        }
      `}</style>

      <div 
        className={`fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      ></div>
      
      <aside className={`
        fixed lg:relative inset-y-0 right-0 z-[110] 
        w-[320px] h-full bg-[#0f172a] text-white
        transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1)
        border-l border-white/5 shadow-2xl
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-full flex flex-col p-8">
           {/* الشعار المطور */}
           <div className="flex items-center gap-5 mb-14 group cursor-pointer" onClick={() => { onViewChange('tasks'); onClose(); }}>
              <div className="w-14 h-14 rounded-[22px] bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center shadow-[0_15px_35px_rgba(37,99,235,0.4)] transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
                 <Icons.Sparkles className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter">مهامي</h1>
                <p className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em]">Neural Core</p>
              </div>
           </div>

           {/* التنقل الرئيسي والقسم الجديد لإضافة تصنيف */}
           <div className="flex-1 overflow-y-auto no-scrollbar space-y-10">
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">لوحة النظام</p>
                 <nav className="space-y-2">
                    <NavItem active={currentView === 'tasks' && selectedCategory === 'الكل'} onClick={() => { onViewChange('tasks'); onCategorySelect('الكل'); onClose(); }} icon={<Icons.LayoutDashboard />} label="جميع المهام" count={tasks.length} />
                    <NavItem active={currentView === 'settings'} onClick={() => { onViewChange('settings'); onClose(); }} icon={<Icons.Settings />} label="الإعدادات" />
                    
                    {/* زر إضافة تصنيف - الموقع الجديد تحت المهام مباشرة */}
                    <button 
                        onClick={() => { onManageCategories(); onClose(); }}
                        className="w-full flex items-center gap-5 px-6 py-4 rounded-[22px] text-sm font-black text-blue-400 bg-blue-600/5 hover:bg-blue-600/15 transition-all duration-300 border border-blue-500/20 mt-4 group relative overflow-hidden shadow-lg shadow-blue-900/10"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        <div className="w-5 h-5 flex items-center justify-center group-hover:rotate-90 transition-transform duration-500 bg-blue-500/20 rounded-lg">
                           <Icons.Plus className="w-3.5 h-3.5" />
                        </div>
                        <span className="flex-1 text-right">إضافة تصنيف جديد</span>
                    </button>
                 </nav>
              </div>

              {currentView === 'tasks' && (
                <div className="space-y-4 pt-4">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4">التصنيفات</p>
                  <nav className="space-y-2">
                     {categories.map(cat => (
                       <NavItem 
                        key={cat.id} 
                        active={selectedCategory === cat.name} 
                        onClick={() => { onCategorySelect(cat.name); onClose(); }} 
                        icon={<div className="w-4 h-4" style={{ color: cat.color }}>{cat.icon && CategoryIconMap[cat.icon]}</div>} 
                        label={cat.name} 
                        count={getCategoryCount(cat.name)}
                       />
                     ))}
                  </nav>
                </div>
              )}
           </div>

           {/* فوتر القائمة المطور بالتوقيع الـ 3D */}
           <div className="mt-auto pt-10 space-y-6">
              {/* بطاقة المستخدم */}
              <div className="bg-slate-800/40 border border-white/5 p-3.5 rounded-[28px] flex items-center gap-4 group">
                 <div className="relative">
                   <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-lg font-black overflow-hidden shadow-lg border border-white/10 group-hover:scale-105 transition-transform">
                     {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.username.charAt(0).toUpperCase()}
                   </div>
                   <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#0f172a] rounded-full"></div>
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate tracking-tight">{user.username}</p>
                    <p className="text-[8px] text-slate-500 font-black tracking-widest uppercase">مزامنة سحابية</p>
                 </div>
                 <button onClick={onLogout} className="p-2.5 text-slate-600 hover:text-rose-500 transition-colors bg-slate-900/50 rounded-xl">
                    <Icons.LogOut className="w-4.5 h-4.5" />
                 </button>
              </div>

              {/* التوقيع الاحترافي الثلاثي الأبعاد المذهل */}
              <div 
                className="signature-3d-wrap"
                onMouseMove={handleMouseMove}
                onMouseLeave={resetRotate}
              >
                 <div 
                  ref={signatureRef}
                  className="signature-card-3d bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-5 rounded-[32px] shadow-[0_25px_50px_-15px_rgba(0,0,0,0.5)] overflow-hidden relative group/sig cursor-default"
                  style={{ 
                    transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
                    boxShadow: rotate.x !== 0 ? `0 ${20 + Math.abs(rotate.x)}px ${40 + Math.abs(rotate.y)}px -15px rgba(37,99,235,0.2)` : 'none'
                  }}
                 >
                    {/* طبقة Shimmer المتحركة */}
                    <div className="shimmer-effect absolute inset-0 opacity-40"></div>
                    
                    <div className="flex flex-col items-center gap-3 relative z-10" style={{ transform: 'translateZ(30px)' }}>
                       <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span>صنع بكل</span>
                          <span className="pulse-heart-3d text-rose-500 text-lg drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">❤️</span>
                          <span>من قبل</span>
                       </div>
                       
                       <div className="w-12 h-[2px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
                       
                       <div className="text-[15px] font-black tracking-[0.3em] neon-name uppercase text-center mt-1">
                          MOSTAFA ABDO
                       </div>
                       
                       <div className="text-[7px] text-slate-600 font-black uppercase tracking-[0.5em] mt-1 opacity-50">
                         Creative Director
                       </div>
                    </div>

                    {/* إضاءات نيون في الزوايا */}
                    <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500/10 blur-xl"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 bg-indigo-500/10 blur-xl"></div>
                 </div>
              </div>
           </div>
        </div>
      </aside>
    </>
  );
};

const NavItem = ({ active, onClick, icon, label, count }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-5 px-6 py-4 rounded-[22px] text-sm font-bold transition-all duration-400 group/nav ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 translate-x-[-8px]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
  >
    <span className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover/nav:scale-110 group-hover/nav:rotate-6'}`}>{icon}</span>
    <span className="flex-1 text-right">{label}</span>
    {count !== undefined && <span className={`text-[10px] px-2.5 py-0.5 rounded-lg font-black transition-colors ${active ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500 group-hover/nav:bg-slate-700'}`}>{count}</span>}
  </button>
);

export default Sidebar;
