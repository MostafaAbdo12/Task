
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-8 bg-[#0a0f1d]/60 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-6xl bg-white rounded-[60px] border border-slate-200 overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] animate-in zoom-in-95 flex flex-col md:flex-row h-[90vh] md:h-[750px]">
          
          {/* Sidebar - Existing Categories */}
          <div className="w-full md:w-[380px] bg-slate-50 border-l border-slate-200 flex flex-col order-2 md:order-1">
            <div className="p-10 pb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[13px] font-black text-slate-900 uppercase tracking-[0.2em]">التصنيفات الحالية</h3>
                <span className="bg-blue-600 text-white text-[11px] px-3 py-1 rounded-full font-black shadow-lg">
                  {categories.length}
                </span>
              </div>
              <p className="text-[12px] text-slate-500 font-bold">إدارة الهوية البصرية لمجموعاتك</p>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar px-8 space-y-4 pb-8">
              {categories.map(cat => (
                <div 
                  key={cat.id} 
                  className={`group flex items-center justify-between p-5 rounded-[30px] border transition-all duration-500 cursor-pointer
                    ${editingId === cat.id ? 'bg-blue-600 border-blue-500 shadow-xl scale-[1.02]' : 'bg-white border-slate-100 hover:border-blue-400 hover:shadow-xl'}
                  `}
                  onClick={() => setEditingId(cat.id)}
                >
                  <div className="flex items-center gap-4 overflow-hidden">
                    <div 
                      className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12 duration-500
                        ${editingId === cat.id ? 'bg-white/20' : ''}
                      `} 
                      style={{ backgroundColor: editingId === cat.id ? undefined : cat.color }}
                    >
                      <div className="w-6 h-6 text-white">
                        {cat.icon && CategoryIconMap[cat.icon] ? CategoryIconMap[cat.icon] : null}
                      </div>
                    </div>
                    <span className={`text-[15px] font-black truncate transition-colors ${editingId === cat.id ? 'text-white' : 'text-slate-800'}`}>
                      {cat.name}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(cat.id); }} 
                    className={`p-2.5 rounded-xl transition-all ${editingId === cat.id ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-slate-300 hover:text-rose-600 hover:bg-rose-50'}`}
                  >
                    <Icons.Trash className="w-4.5 h-4.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="p-10 pt-4">
               <button 
                onClick={onClose}
                className="w-full py-5 bg-slate-900 text-white rounded-[30px] text-[14px] font-black hover:bg-black transition-all shadow-xl active:scale-95"
              >
                إنهاء التعديل
              </button>
            </div>
          </div>

          {/* Main Content - Editor */}
          <div className="flex-1 p-10 md:p-16 overflow-y-auto no-scrollbar order-1 md:order-2 bg-white">
            <div className="flex justify-between items-start mb-16">
               <div>
                  <h2 className="text-4xl font-black text-slate-900 tracking-tighter glowing-text">
                    {editingId ? 'تعديل التصنيف' : 'تصنيف جديد'}
                  </h2>
                  <p className="text-[15px] font-bold text-slate-400 mt-3">خصص الاسم، الأيقونة، واللون لضمان وضوح التنظيم</p>
               </div>
               {editingId && (
                 <button 
                  onClick={() => setEditingId(null)}
                  className="bg-amber-50 text-amber-600 px-8 py-3 rounded-2xl text-[12px] font-black border border-amber-100 hover:bg-amber-100 transition-all"
                 >
                   إلغاء التعديل
                 </button>
               )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-16">
              {/* Input Field - REFINED FOR CLARITY */}
              <div className="space-y-6">
                <div className="flex justify-between items-center px-4">
                   <label className="text-[16px] font-black text-slate-900 uppercase tracking-widest">اسم التصنيف</label>
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping"></div>
                </div>
                <div className="relative group">
                  <input 
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white border-[3px] border-blue-600 rounded-full py-7 px-12 text-2xl font-black text-slate-900 outline-none focus:ring-[15px] focus:ring-blue-600/5 focus:bg-white transition-all shadow-[0_10px_30px_rgba(37,99,235,0.1)] placeholder:text-slate-400 placeholder:font-bold"
                    placeholder="اكتب اسم التصنيف هنا..."
                    required
                  />
                  <div className="absolute left-10 top-1/2 -translate-y-1/2 text-blue-600 opacity-20 group-focus-within:opacity-100 transition-all">
                    <Icons.Sparkles className="w-7 h-7" />
                  </div>
                </div>
              </div>

              {/* Icon Selection */}
              <div className="space-y-8">
                <label className="text-[14px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 block">اختر الرمز التعريفي</label>
                <div className="grid grid-cols-6 sm:grid-cols-8 gap-5">
                  {Object.keys(CategoryIconMap).map(iconKey => (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => setSelectedIcon(iconKey)}
                      className={`aspect-square rounded-[28px] border-2 transition-all duration-500 flex items-center justify-center relative group
                        ${selectedIcon === iconKey 
                          ? 'bg-blue-600 border-blue-600 text-white shadow-2xl scale-110 rotate-3' 
                          : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-blue-300 hover:text-blue-600 hover:bg-white'
                        }
                      `}
                    >
                      <div className="w-7 h-7 transition-transform group-hover:scale-110">{CategoryIconMap[iconKey]}</div>
                      {selectedIcon === iconKey && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-xl border-2 border-blue-600 animate-in zoom-in">
                          <Icons.CheckCircle className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-8">
                <label className="text-[14px] font-black text-slate-500 uppercase tracking-[0.2em] px-4 block">تخصيص اللون</label>
                <div className="flex flex-wrap gap-6">
                  {CORP_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-12 h-12 rounded-full border-4 transition-all duration-500 relative hover:scale-125
                        ${selectedColor === color 
                          ? 'border-white ring-[8px] ring-blue-500/10 shadow-2xl scale-125 z-10' 
                          : 'border-white shadow-lg shadow-slate-200'
                        }
                      `}
                      style={{ backgroundColor: color }}
                    >
                       {selectedColor === color && (
                         <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></div>
                         </div>
                       )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-10">
                 <button 
                  type="submit"
                  disabled={!name.trim()}
                  className="w-full bg-blue-600 text-white font-black py-7 rounded-[35px] text-xl hover:bg-blue-700 transition-all shadow-[0_25px_60px_-15px_rgba(37,99,235,0.4)] active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center relative z-10 shadow-lg group-hover:rotate-12 transition-transform">
                    {editingId ? <Icons.Edit className="w-5 h-5" /> : <Icons.Plus className="w-6 h-6" />}
                  </div>
                  <span className="relative z-10">{editingId ? 'حفظ التحديثات' : 'تفعيل التصنيف'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
    </div>
  );
};

export default CategoryModal;
