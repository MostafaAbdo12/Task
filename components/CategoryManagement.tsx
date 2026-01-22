
import React, { useState } from 'react';
import { Category } from '../types';
import { Icons, CategoryIconMap } from '../constants';

interface CategoryManagementProps {
  categories: Category[];
  onAdd: (category: Category) => void;
  onUpdate: (category: Category) => void;
  onDelete: (id: string) => void;
  onAddTask?: (task: any) => void;
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
    <div className="space-y-16 animate-fade-in pb-24 pt-4">
      {/* 1. Category Creation Lab */}
      <section className="glass-panel rounded-[40px] p-10 border-white/5 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-nebula-purple to-transparent group-hover:via-nebula-blue transition-all duration-700"></div>
        
        <div className="flex flex-col md:flex-row gap-12">
          <div className="flex-1 space-y-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-nebula-purple/10 flex items-center justify-center text-nebula-purple shadow-lg shadow-nebula-purple/10 floating">
                {editingId ? <Icons.Edit className="w-7 h-7" /> : <Icons.Plus className="w-7 h-7" />}
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight glow-title">
                  {editingId ? 'تعديل السجل الرقمي' : 'توليد قطاع جديد'}
                </h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">بروتوكول إدارة التصنيفات</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">معرف الاسم الرقمي</label>
                <input 
                  autoFocus required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="مثل: مهمات سرية، حياة شخصية..."
                  className="w-full bg-white/5 border-2 border-white/5 rounded-[28px] py-6 px-10 text-xl font-bold text-white outline-none focus:border-nebula-purple transition-all placeholder:text-slate-800 shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">البصمة اللونية</label>
                  <div className="flex flex-wrap gap-4 p-5 bg-white/5 rounded-[32px] border border-white/5 shadow-inner">
                    {COSMIC_COLORS.map(color => (
                      <button
                        key={color} type="button" onClick={() => setSelectedColor(color)}
                        className={`w-11 h-11 rounded-2xl border-2 transition-all duration-300 ${selectedColor === color ? 'scale-125 border-white shadow-glow ring-4 ring-white/10' : 'border-transparent scale-100 hover:scale-110 opacity-60 hover:opacity-100'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">الرمز الأيقوني</label>
                  <div className="grid grid-cols-5 gap-3 p-5 bg-white/5 rounded-[32px] border border-white/5 max-h-[160px] overflow-y-auto no-scrollbar shadow-inner">
                    {Object.keys(CategoryIconMap).map(iconKey => (
                      <button
                        key={iconKey} type="button" onClick={() => setSelectedIcon(iconKey)}
                        className={`aspect-square rounded-2xl border flex items-center justify-center transition-all ${selectedIcon === iconKey ? 'bg-nebula-purple border-nebula-purple text-white shadow-lg scale-110 -rotate-3' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                      >
                        <div className="w-6 h-6">{CategoryIconMap[iconKey]}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  type="submit"
                  className="flex-1 py-6 bg-gradient-to-r from-nebula-purple to-nebula-blue text-white rounded-[28px] font-black text-lg shadow-glow hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-5"
                >
                  {editingId ? <Icons.Edit className="w-7 h-7" /> : <Icons.Plus className="w-7 h-7" />}
                  <span>{editingId ? 'حفظ البيانات' : 'تفعيل القطاع'}</span>
                </button>
                {editingId && (
                  <button 
                    type="button" onClick={() => { setEditingId(null); setName(''); }}
                    className="px-10 bg-white/5 text-slate-400 rounded-[28px] font-bold hover:bg-white/10 transition-all border border-white/5"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="w-full md:w-80 flex flex-col items-center justify-center space-y-8 p-10 bg-white/5 rounded-[50px] border border-white/5 relative overflow-hidden group/preview">
            <div className="absolute inset-0 bg-gradient-to-br from-nebula-purple/5 to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity"></div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] relative z-10">معاينة الحضور الرقمي</p>
            <div className="w-60 h-60 rounded-[60px] glass-panel flex flex-col items-center justify-center gap-6 shadow-2xl relative z-10 group-hover/preview:scale-105 transition-transform duration-700">
               <div className="absolute inset-0 bg-gradient-to-br opacity-20 rounded-[60px]" style={{ backgroundImage: `linear-gradient(to bottom right, ${selectedColor}, transparent)` }}></div>
               <div className="w-28 h-28 rounded-[36px] flex items-center justify-center text-white shadow-2xl floating transition-all duration-700 group-hover/preview:rotate-12" style={{ backgroundColor: selectedColor }}>
                  <div className="w-14 h-14">{CategoryIconMap[selectedIcon]}</div>
               </div>
               <span className="text-2xl font-black text-white tracking-tight relative z-10">{name || 'انتظار الاسم'}</span>
            </div>
            <div className="flex items-center gap-3 relative z-10">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">جاهز للبث</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Categories Grid */}
      <section className="space-y-10">
        <div className="flex items-center justify-between px-8">
           <h4 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-4">
             <Icons.LayoutDashboard className="w-5 h-5 text-nebula-blue" />
             القطاعات التشغيلية الحالية
           </h4>
           <div className="h-[2px] flex-1 mx-10 bg-gradient-to-r from-white/5 via-white/5 to-transparent"></div>
           <span className="text-nebula-purple font-black text-lg bg-nebula-purple/10 px-6 py-2 rounded-2xl border border-nebula-purple/20">{categories.length}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
          {categories.map((cat, i) => (
            <div 
              key={cat.id}
              style={{ animationDelay: `${i * 100}ms` }}
              className="nebula-card p-8 flex items-center gap-6 group hover:border-white/20 transition-all"
            >
              <div className="w-16 h-16 rounded-[22px] flex items-center justify-center text-white shrink-0 shadow-lg group-hover:rotate-12 transition-transform" style={{ backgroundColor: cat.color }}>
                <div className="w-8 h-8">{cat.icon && CategoryIconMap[cat.icon]}</div>
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xl font-black text-white truncate">{cat.name}</h5>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">ID: {cat.id.slice(-4)}</p>
              </div>
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                <button onClick={() => handleEdit(cat)} className="p-2.5 text-slate-400 hover:text-nebula-blue bg-white/5 rounded-xl transition-all hover:scale-110"><Icons.Edit className="w-4 h-4" /></button>
                <button onClick={() => onDelete(cat.id)} className="p-2.5 text-slate-400 hover:text-rose-500 bg-white/5 rounded-xl transition-all hover:scale-110"><Icons.Trash className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CategoryManagement;
