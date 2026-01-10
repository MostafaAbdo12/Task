
import React, { useState, useEffect } from 'react';
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 bg-slate-900/40 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-6xl bg-white/80 backdrop-blur-2xl rounded-[50px] border border-white/40 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] animate-in zoom-in-95 flex flex-col md:flex-row h-[90vh] md:h-[700px]">
          
          {/* Sidebar - Existing Categories */}
          <div className="w-full md:w-[350px] bg-white/50 border-l border-slate-100 flex flex-col order-2 md:order-1">
            <div className="p-8 pb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">التصنيفات الحالية</h3>
                <span className="bg-blue-600 text-white text-[10px] px-2.5 py-1 rounded-full font-black shadow-lg shadow-blue-200">
                  {categories.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-bold">إدارة وحذف التصنيفات النشطة</p>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar px-6 space-y-3 pb-8">
              {categories.map(cat => (
                <div 
                  key={cat.id} 
                  className={`group flex items-center justify-between p-4 rounded-[28px] border transition-all duration-300 cursor-pointer
                    ${editingId === cat.id ? 'bg-blue-600 border-blue-600 shadow-xl scale-[1.02]' : 'bg-white border-slate-50 hover:border-blue-200 hover:shadow-lg'}
                  `}
                  onClick={() => setEditingId(cat.id)}
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div 
                      className={`w-10 h-10 shrink-0 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6 duration-500
                        ${editingId === cat.id ? 'bg-white/20' : ''}
                      `} 
                      style={{ backgroundColor: editingId === cat.id ? undefined : cat.color }}
                    >
                      <div className={`w-5 h-5 ${editingId === cat.id ? 'text-white' : 'text-white'}`}>
                        {cat.icon && CategoryIconMap[cat.icon] ? CategoryIconMap[cat.icon] : null}
                      </div>
                    </div>
                    <span className={`text-sm font-black truncate transition-colors ${editingId === cat.id ? 'text-white' : 'text-slate-700'}`}>
                      {cat.name}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDelete(cat.id); }} 
                      className={`p-2 rounded-xl transition-all ${editingId === cat.id ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-slate-300 hover:text-rose-500 hover:bg-rose-50'}`}
                    >
                      <Icons.Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 pt-0">
               <button 
                onClick={onClose}
                className="w-full py-4.5 bg-slate-900 text-white rounded-[24px] text-[13px] font-black hover:bg-slate-800 transition-all shadow-xl active:scale-95"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>

          {/* Main Content - Editor */}
          <div className="flex-1 p-8 md:p-12 overflow-y-auto no-scrollbar order-1 md:order-2">
            <div className="flex justify-between items-start mb-12">
               <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    {editingId ? 'تعديل الهوية' : 'تصنيف جديد'}
                  </h2>
                  <p className="text-sm font-bold text-slate-400 mt-2">خصص الأيقونة واللون لتمييز مهامك</p>
               </div>
               {editingId && (
                 <button 
                  onClick={() => setEditingId(null)}
                  className="bg-amber-50 text-amber-600 px-6 py-2 rounded-2xl text-xs font-black border border-amber-100 animate-in fade-in"
                 >
                   إلغاء التعديل
                 </button>
               )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-12">
              {/* Input Field */}
              <div className="space-y-4">
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 block">اسم التصنيف</label>
                <input 
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[30px] py-5 px-8 text-lg font-black outline-none focus:ring-[12px] focus:ring-blue-500/5 focus:border-blue-600 focus:bg-white transition-all shadow-inner placeholder:text-slate-300"
                  placeholder="مثال: عمل، دراسة، رياضة..."
                  required
                />
              </div>

              {/* Icon Selection */}
              <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                   <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">اختر أيقونة معبرة</label>
                   <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full">أيقونة مميزة</span>
                </div>
                <div className="grid grid-cols-6 sm:grid-cols-9 gap-4">
                  {Object.keys(CategoryIconMap).map(iconKey => (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => setSelectedIcon(iconKey)}
                      className={`aspect-square rounded-[22px] border-2 transition-all duration-300 flex items-center justify-center relative group
                        ${selectedIcon === iconKey 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-200 scale-110' 
                          : 'bg-white border-slate-100 text-slate-300 hover:border-blue-200 hover:text-blue-500'
                        }
                      `}
                    >
                      <div className="w-6 h-6">{CategoryIconMap[iconKey]}</div>
                      {selectedIcon === iconKey && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md border border-blue-600 animate-in zoom-in duration-300">
                          <Icons.CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-6">
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 block">اختر لوناً هوياً</label>
                <div className="flex flex-wrap gap-5">
                  {CORP_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-11 h-11 rounded-full border-4 transition-all duration-500 relative hover:scale-125
                        ${selectedColor === color 
                          ? 'border-white ring-[6px] ring-blue-500/10 shadow-2xl scale-125 z-10' 
                          : 'border-white shadow-lg'
                        }
                      `}
                      style={{ backgroundColor: color }}
                    >
                       {selectedColor === color && (
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                         </div>
                       )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6">
                 <button 
                  type="submit"
                  disabled={!name.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black py-6 rounded-[32px] text-lg hover:brightness-110 transition-all shadow-2xl shadow-blue-200 active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  <div className="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center">
                    {editingId ? <Icons.Edit className="w-4 h-4" /> : <Icons.Plus className="w-5 h-5" />}
                  </div>
                  <span>{editingId ? 'حفظ التغييرات الجديدة' : 'إضافة إلى القائمة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
    </div>
  );
};

export default CategoryModal;
