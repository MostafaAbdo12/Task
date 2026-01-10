
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
  '#2563eb', '#1e293b', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#4b5563', '#0891b2', '#10b981', '#f59e0b', '#8b5cf6'
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
      
      <div className="relative w-full max-w-3xl bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] animate-in zoom-in-95">
        <div className="flex flex-col md:flex-row h-full">
          
          {/* Editor Form */}
          <div className="flex-1 p-10 space-y-8 bg-slate-50/50">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {editingId ? 'تعديل التصنيف' : 'تصنيف جديد'}
                </h2>
                <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">تخصيص الهوية والرمز</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">الاسم</label>
                <input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-[22px] py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all shadow-sm"
                  placeholder="أدخل اسم التصنيف..."
                  required
                />
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">اختر أيقونة</label>
                <div className="grid grid-cols-6 md:grid-cols-7 gap-3">
                  {Object.keys(CategoryIconMap).map(iconKey => (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => setSelectedIcon(iconKey)}
                      className={`w-11 h-11 rounded-2xl border-2 transition-all flex items-center justify-center ${
                        selectedIcon === iconKey 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-[0_8px_20px_-5px_rgba(37,99,235,0.6)] scale-110' 
                        : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {CategoryIconMap[iconKey]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">اختر لوناً</label>
                <div className="flex flex-wrap gap-3">
                  {CORP_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-9 h-9 rounded-full border-4 transition-all shadow-sm hover:scale-110 ${
                        selectedColor === color ? 'border-white ring-4 ring-blue-100 scale-125' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                 <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-black py-4 rounded-[22px] hover:bg-blue-700 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                >
                  {editingId ? <Icons.CheckCircle className="w-5 h-5" /> : <Icons.Plus className="w-5 h-5" />}
                  <span>{editingId ? 'حفظ التعديلات' : 'إضافة التصنيف'}</span>
                </button>
                {editingId && (
                  <button 
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="px-6 py-4 bg-slate-200 text-slate-700 font-bold rounded-[22px] hover:bg-slate-300 transition-all"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List Sidebar */}
          <div className="w-full md:w-[320px] p-10 bg-white border-r border-slate-100 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">التصنيفات الحالية</label>
            </div>
            
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-6">
              {categories.map(cat => (
                <div key={cat.id} className={`flex items-center justify-between p-4 rounded-[22px] group border transition-all duration-300 ${editingId === cat.id ? 'bg-blue-50 border-blue-200' : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl text-white flex items-center justify-center shadow-md" style={{ backgroundColor: cat.color }}>
                      {cat.icon && CategoryIconMap[cat.icon]}
                    </div>
                    <span className="text-sm font-bold text-slate-800 truncate max-w-[100px]">{cat.name}</span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => setEditingId(cat.id)}
                      className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                      title="تعديل"
                    >
                      <Icons.Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => onDelete(cat.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
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
              className="mt-6 w-full py-4 bg-slate-900 text-white rounded-[22px] text-sm font-black hover:bg-slate-800 transition-all"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
