
import React, { useState } from 'react';
import { Category } from '../types';
import { Icons, CategoryIconMap } from '../constants';

interface CategoryManagementProps {
  categories: Category[];
  onAdd: (category: Category) => void;
  onUpdate: (category: Category) => void;
  onDelete: (id: string) => void;
}

const COSMIC_COLORS = [
  '#7c3aed', '#3b82f6', '#db2777', '#10b981', '#f59e0b', '#ef4444', 
  '#06b6d4', '#6366f1', '#a855f7', '#ec4899', '#14b8a6', '#84cc16'
];

const CategoryManagement: React.FC<CategoryManagementProps> = ({ categories, onAdd, onUpdate, onDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('star');
  const [selectedColor, setSelectedColor] = useState(COSMIC_COLORS[0]);

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setSelectedIcon(cat.icon || 'star');
    setSelectedColor(cat.color);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      onUpdate({ id: editingId, name, icon: selectedIcon, color: selectedColor });
      setEditingId(null);
    } else {
      onAdd({ id: Date.now().toString(), name, icon: selectedIcon, color: selectedColor });
    }
    
    setName('');
    setSelectedIcon('star');
    setSelectedColor(COSMIC_COLORS[0]);
  };

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Creation Lab */}
      <section className="glass-panel rounded-[40px] p-10 border-nebula-purple/30 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-nebula-purple to-transparent"></div>
        
        <div className="flex flex-col md:flex-row gap-12">
          <div className="flex-1 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-nebula-purple/10 flex items-center justify-center text-nebula-purple">
                {editingId ? <Icons.Edit className="w-6 h-6" /> : <Icons.Plus className="w-6 h-6" />}
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">
                {editingId ? 'تحديث التصنيف' : 'توليد تصنيف جديد'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mr-4">معرف الاسم</label>
                <input 
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثل: مشاريع المريخ، الصحة الجسدية..."
                  className="w-full bg-white/5 border-2 border-white/5 rounded-[24px] py-5 px-8 text-xl font-bold text-white outline-none focus:border-nebula-purple transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mr-4">البصمة اللونية</label>
                  <div className="flex flex-wrap gap-3 p-4 bg-white/5 rounded-[24px] border border-white/5">
                    {COSMIC_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-xl border-2 transition-all duration-300 ${selectedColor === color ? 'scale-125 border-white shadow-glow' : 'border-transparent scale-100 hover:scale-110 opacity-60 hover:opacity-100'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mr-4">الرمز الأيقوني</label>
                  <div className="grid grid-cols-5 gap-2 p-4 bg-white/5 rounded-[24px] border border-white/5 max-h-[160px] overflow-y-auto no-scrollbar">
                    {Object.keys(CategoryIconMap).map(iconKey => (
                      <button
                        key={iconKey}
                        type="button"
                        onClick={() => setSelectedIcon(iconKey)}
                        className={`aspect-square rounded-xl border flex items-center justify-center transition-all ${selectedIcon === iconKey ? 'bg-nebula-purple border-nebula-purple text-white shadow-lg scale-110' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                      >
                        <div className="w-5 h-5">{CategoryIconMap[iconKey]}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  type="submit"
                  className="flex-1 py-5 bg-gradient-to-r from-nebula-purple to-nebula-blue text-white rounded-[24px] font-black text-lg shadow-glow hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                  {editingId ? <Icons.Edit className="w-6 h-6" /> : <Icons.Plus className="w-6 h-6" />}
                  <span>{editingId ? 'حفظ البيانات' : 'تفعيل التصنيف'}</span>
                </button>
                {editingId && (
                  <button 
                    type="button"
                    onClick={() => { setEditingId(null); setName(''); }}
                    className="px-8 bg-white/5 text-slate-400 rounded-[24px] font-bold hover:bg-white/10 transition-all"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="w-full md:w-72 flex flex-col items-center justify-center space-y-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">معاينة الحضور</p>
            <div className="w-56 h-56 rounded-[48px] glass-panel flex flex-col items-center justify-center gap-6 shadow-2xl relative group">
               <div className="absolute inset-0 bg-gradient-to-br opacity-10 rounded-[48px]" style={{ backgroundImage: `linear-gradient(to bottom right, ${selectedColor}, transparent)` }}></div>
               <div className="w-24 h-24 rounded-[32px] flex items-center justify-center text-white shadow-2xl floating" style={{ backgroundColor: selectedColor }}>
                  <div className="w-12 h-12">{CategoryIconMap[selectedIcon]}</div>
               </div>
               <span className="text-xl font-black text-white tracking-tight">{name || 'اسم التصنيف'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-4">
           <h4 className="text-lg font-black text-white/50 uppercase tracking-[0.4em]">التصنيفات النشطة</h4>
           <div className="h-px flex-1 mx-8 bg-white/5"></div>
           <span className="text-nebula-purple font-black">{categories.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat, i) => (
            <div 
              key={cat.id}
              style={{ animationDelay: `${i * 100}ms` }}
              className="nebula-card p-6 flex items-center gap-6 group hover:border-white/20"
            >
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:rotate-12 transition-transform" style={{ backgroundColor: cat.color }}>
                <div className="w-8 h-8">{cat.icon && CategoryIconMap[cat.icon]}</div>
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-lg font-black text-white truncate">{cat.name}</h5>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Ref: {cat.id.slice(-4)}</p>
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-transform">
                <button onClick={() => handleEdit(cat)} className="p-2 text-slate-500 hover:text-nebula-blue"><Icons.Edit className="w-4 h-4" /></button>
                <button onClick={() => onDelete(cat.id)} className="p-2 text-slate-500 hover:text-rose-500"><Icons.Trash className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CategoryManagement;
