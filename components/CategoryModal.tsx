
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
  '#2563eb', '#1e293b', '#059669', '#d97706', '#dc2626', '#7c3aed', 
  '#db2777', '#4b5563', '#0891b2', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#f97316', '#14b8a6', '#06b6d4', '#6366f1', '#64748b'
];

const CategoryModal: React.FC<CategoryModalProps> = ({ categories, onAdd, onUpdate, onDelete, onClose }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('star');
  const [selectedColor, setSelectedColor] = useState(CORP_COLORS[0]);

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
      setSelectedColor(CORP_COLORS[0]);
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
    setSelectedColor(CORP_COLORS[0]);
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl bg-white rounded-[45px] border border-slate-200 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] animate-in zoom-in-95 flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[90vh]">
          
          {/* Editor Form - Right Side in RTL */}
          <div className="flex-1 p-8 md:p-12 space-y-10 bg-slate-50/30 overflow-y-auto no-scrollbar order-1 md:order-2">
            <div className="text-right">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                {editingId ? 'تعديل التصنيف' : 'تصنيف جديد'}
              </h2>
              <p className="text-sm text-slate-500 font-bold mt-2 uppercase tracking-widest">تخصيص الهوية والرمز</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Name Input */}
              <div className="space-y-3">
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-1 block text-right">الاسم</label>
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-[28px] py-5 px-8 text-base font-bold outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-600 transition-all shadow-sm placeholder:text-slate-300"
                  placeholder="أدخل اسم التصنيف..."
                  required
                />
              </div>

              {/* Icon Selection - Match Design from Screenshot */}
              <div className="space-y-4">
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-1 block text-right">اختر أيقونة</label>
                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-7 gap-3">
                  {Object.keys(CategoryIconMap).map(iconKey => (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => setSelectedIcon(iconKey)}
                      className={`aspect-square rounded-[22px] border transition-all flex items-center justify-center ${
                        selectedIcon === iconKey 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-[0_15px_30px_-5px_rgba(37,99,235,0.4)] scale-110 z-10' 
                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="scale-90">{CategoryIconMap[iconKey]}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="space-y-4">
                <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest px-1 block text-right">اختر لوناً</label>
                <div className="flex flex-wrap gap-4 justify-start">
                  {CORP_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-4 transition-all shadow-md hover:scale-125 ${
                        selectedColor === color ? 'border-blue-100 ring-4 ring-blue-500/20 scale-125' : 'border-white'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                 <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-black py-5 rounded-[30px] text-lg hover:bg-blue-700 transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3 group"
                >
                  <Icons.Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" />
                  <span>{editingId ? 'حفظ التعديلات' : 'إضافة التصنيف'}</span>
                </button>
                {editingId && (
                  <button 
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-8 py-5 bg-slate-100 text-slate-600 font-bold rounded-[30px] hover:bg-slate-200 transition-all"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List Sidebar - Left Side in RTL */}
          <div className="w-full md:w-[360px] p-8 md:p-10 bg-white border-l border-slate-100 flex flex-col order-2 md:order-1">
            <div className="flex items-center justify-between mb-8 px-2">
              <span className="bg-slate-100 text-slate-400 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest">{categories.length} تصنيفاً</span>
              <label className="text-[12px] font-black text-slate-400 uppercase tracking-widest">التصنيفات الحالية</label>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pb-6">
              {categories.map(cat => (
                <div key={cat.id} className={`flex items-center justify-between p-5 rounded-[28px] group border transition-all duration-500 ${editingId === cat.id ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-lg hover:-translate-y-1'}`}>
                  <div className="flex items-center gap-4">
                    {/* Visual container for category icon */}
                    <div className="w-11 h-11 rounded-2xl text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: cat.color }}>
                      <div className="scale-75">
                        {cat.icon && CategoryIconMap[cat.icon] ? CategoryIconMap[cat.icon] : null}
                      </div>
                    </div>
                    <span className="text-[15px] font-black text-slate-800 truncate max-w-[120px]">{cat.name}</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button 
                      onClick={() => setEditingId(cat.id)}
                      className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      title="تعديل"
                    >
                      <Icons.Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(cat.id)}
                      className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                      title="حذف"
                    >
                      <Icons.Trash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={onClose}
              className="mt-6 w-full py-5 bg-[#0f172a] text-white rounded-[30px] text-base font-black hover:bg-slate-800 transition-all shadow-xl active:scale-95"
            >
              إغلاق
            </button>
          </div>
        </div>
    </div>
  );
};

export default CategoryModal;
