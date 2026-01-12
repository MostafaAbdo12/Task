
import React, { useState, useEffect, useRef } from 'react';
import { Category } from '../types';
import { Icons, CategoryIconMap } from '../constants';

interface CategoryModalProps {
  categories: Category[];
  onAdd: (category: Category) => void;
  onUpdate: (category: Category) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const CORP_COLORS = [
  '#FF1744', '#D500F9', '#3D5AFE', '#00E676', '#FFEA00', '#FF9100', 
  '#2979FF', '#00B0FF', '#00E5FF', '#1DE9B6', '#76FF03', '#C6FF00',
  '#FFC400', '#FF3D00', '#757575', '#546E7A', '#37474F', '#1A237E'
];

const CategoryModal: React.FC<CategoryModalProps> = ({ categories, onAdd, onUpdate, onDelete, onClose }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('star');
  const [selectedColor, setSelectedColor] = useState(CORP_COLORS[2]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingId) {
      const cat = categories.find(c => c.id === editingId);
      if (cat) {
        setName(cat.name);
        setSelectedIcon(cat.icon || 'star');
        setSelectedColor(cat.color);
      }
    } else {
      setName('');
      setSelectedIcon('star');
      setSelectedColor(CORP_COLORS[2]);
    }
  }, [editingId, categories]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350; // Increased scroll amount for wider view
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      onUpdate({
        id: editingId,
        name,
        icon: selectedIcon,
        color: selectedColor
      });
      setEditingId(null);
    } else {
      const newCat: Category = {
        id: Date.now().toString(),
        name,
        icon: selectedIcon,
        color: selectedColor
      };
      onAdd(newCat);
    }
    
    setName('');
    setSelectedIcon('star');
    setSelectedColor(CORP_COLORS[2]);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-[#0a0f1d]/85 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      {/* Container widened to max-w-4xl */}
      <div className="relative w-full max-w-4xl bg-white rounded-[50px] border border-slate-200 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.5)] animate-in zoom-in-95 overflow-hidden flex flex-col max-h-[92vh]">
          
          {/* Header */}
          <header className="px-10 py-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
             <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-600 rounded-[22px] flex items-center justify-center text-white shadow-[0_15px_30px_rgba(37,99,235,0.3)] animate-float">
                   <Icons.Folder className="w-7 h-7" />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-slate-900 tracking-tight">إدارة التصنيفات الذكية</h3>
                   <p className="text-[12px] font-bold text-slate-400 uppercase tracking-[0.2em]">تخصيص الهوية البصرية الموحدة</p>
                </div>
             </div>
             <button onClick={onClose} className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-rose-500 border border-transparent hover:border-slate-100 shadow-sm">
                <Icons.X className="w-7 h-7" />
             </button>
          </header>

          <div className="flex-1 overflow-y-auto no-scrollbar p-10 space-y-12">
            
            {/* Horizontal Current Categories List - ENHANCED FOR WIDE VIEW */}
            <div className="space-y-6 relative group/scroll">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                   <label className="text-[13px] font-black text-slate-500 uppercase tracking-widest">التصنيفات النشطة ({categories.length})</label>
                </div>
                <div className="flex gap-3">
                   <button 
                    onClick={() => scroll('right')} 
                    className="w-12 h-12 rounded-[18px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                   >
                     <Icons.Chevron className="w-6 h-6 rotate-90" />
                   </button>
                   <button 
                    onClick={() => scroll('left')} 
                    className="w-12 h-12 rounded-[18px] bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                   >
                     <Icons.Chevron className="w-6 h-6 -rotate-90" />
                   </button>
                </div>
              </div>

              <div 
                ref={scrollContainerRef}
                className="flex gap-6 overflow-x-auto pb-10 pt-2 px-2 snap-x no-scrollbar scroll-smooth"
              >
                 {categories.map(cat => (
                   <div 
                    key={cat.id}
                    onClick={() => setEditingId(cat.id)}
                    className={`shrink-0 snap-start flex items-center gap-6 px-8 py-6 rounded-[35px] border cursor-pointer transition-all duration-500 group/item relative overflow-hidden
                      ${editingId === cat.id 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-[0_25px_50px_-15px_rgba(37,99,235,0.4)] scale-105 z-10' 
                        : 'bg-white border-slate-100 hover:border-blue-300 text-slate-700 hover:shadow-2xl hover:-translate-y-2'}
                    `}
                   >
                      {/* Icon Container - MASSIVE SIZE */}
                      <div 
                        className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-500 group-hover/item:scale-110 group-hover/item:rotate-6
                          ${editingId === cat.id ? 'bg-white/20' : 'shadow-[0_10px_20px_rgba(0,0,0,0.06)]'}
                        `} 
                        style={{ backgroundColor: editingId === cat.id ? undefined : cat.color, color: 'white' }}
                      >
                         <div className="w-8 h-8">{cat.icon && CategoryIconMap[cat.icon]}</div>
                      </div>

                      <div className="flex flex-col">
                        <span className="text-lg font-black tracking-tight">{cat.name}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-widest opacity-50 ${editingId === cat.id ? 'text-white' : 'text-slate-400'}`}>Ref: #{cat.id.slice(-4)}</span>
                      </div>
                      
                      {editingId !== cat.id && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(cat.id); }} 
                          className="hover:bg-rose-50 hover:text-rose-500 transition-all p-3 rounded-2xl bg-slate-50 border border-slate-100 opacity-0 group-hover/item:opacity-100"
                        >
                          <Icons.Trash className="w-5 h-5" />
                        </button>
                      )}
                      
                      {editingId === cat.id && <div className="absolute top-0 right-0 w-2 h-full bg-white/20 animate-pulse"></div>}
                   </div>
                 ))}
              </div>
            </div>

            {/* Editor Form - Wider Layout */}
            <form onSubmit={handleSubmit} className="space-y-10 bg-slate-50/50 p-12 rounded-[50px] border border-slate-100 shadow-inner relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
               
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                     <h4 className="text-[15px] font-black text-slate-900 uppercase tracking-[0.2em]">{editingId ? 'تعديل البيانات الحالية' : 'إنشاء معرف تصنيف جديد'}</h4>
                  </div>
                  {editingId && (
                    <button onClick={() => setEditingId(null)} className="text-[11px] font-black text-blue-600 hover:bg-blue-600 hover:text-white transition-all px-6 py-2.5 border border-blue-200 rounded-full bg-white shadow-sm">
                      إلغاء التعديل
                    </button>
                  )}
               </div>

               {/* Name Input */}
               <div className="space-y-4">
                 <input 
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: اجتماعات الفريق، العائلة..."
                  className="w-full bg-white border-2 border-slate-100 rounded-[30px] py-7 px-12 text-3xl font-black text-slate-800 outline-none focus:border-blue-600 transition-all shadow-sm placeholder:text-slate-200"
                 />
               </div>

               {/* Customization Grid - More spacing in Wide Mode */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-2">تخصيص الأيقونة</label>
                    <div className="grid grid-cols-5 gap-3 max-h-[220px] overflow-y-auto no-scrollbar p-4 bg-white rounded-[35px] border border-slate-100 shadow-sm">
                       {Object.keys(CategoryIconMap).map(iconKey => (
                         <button
                          key={iconKey}
                          type="button"
                          onClick={() => setSelectedIcon(iconKey)}
                          className={`aspect-square rounded-[20px] border-2 flex items-center justify-center transition-all duration-300
                            ${selectedIcon === iconKey ? 'bg-blue-600 border-blue-600 text-white shadow-xl scale-110 -rotate-3' : 'bg-slate-50 border-slate-50 text-slate-400 hover:border-blue-100 hover:bg-white'}
                          `}
                         >
                           <div className="w-7 h-7">{CategoryIconMap[iconKey]}</div>
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-2">تخصيص اللون المحوري</label>
                    <div className="flex flex-wrap gap-4 max-h-[220px] overflow-y-auto no-scrollbar p-4 bg-white rounded-[35px] border border-slate-100 shadow-sm">
                       {CORP_COLORS.map(color => (
                         <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`w-11 h-11 rounded-[18px] border-4 transition-all duration-300
                            ${selectedColor === color ? 'border-blue-600 ring-4 ring-blue-50 scale-125 z-10' : 'border-white shadow-md hover:scale-110'}
                          `}
                          style={{ backgroundColor: color }}
                         />
                       ))}
                    </div>
                  </div>
               </div>

               <button 
                type="submit"
                className="w-full py-7 bg-blue-600 text-white rounded-[35px] font-black text-xl shadow-[0_30px_60px_-15px_rgba(37,99,235,0.4)] hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-5 group overflow-hidden relative"
               >
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                 {editingId ? <Icons.Edit className="w-7 h-7" /> : <Icons.Plus className="w-7 h-7" />}
                 <span>{editingId ? 'حفظ التعديلات الذكية' : 'تفعيل التصنيف الآن'}</span>
               </button>
            </form>
          </div>

          <footer className="px-10 py-8 border-t border-slate-100 flex justify-end bg-slate-50/20">
             <button onClick={onClose} className="px-16 py-5 bg-slate-900 text-white rounded-[26px] text-sm font-black hover:bg-black transition-all shadow-2xl active:scale-95 border border-white/10">إتمام وإغلاق</button>
          </footer>
      </div>
    </div>
  );
};

export default CategoryModal;
