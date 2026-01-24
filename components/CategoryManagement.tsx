
import React, { useState } from 'react';
import { Category } from '../types';
import { Icons, CategoryIconMap } from '../constants';

interface CategoryManagementProps {
  categories: Category[];
  onAdd: (category: Category) => void;
  onUpdate: (category: Category) => void;
  onDelete: (id: string, action: 'reassign' | 'delete_tasks') => void;
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
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);

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

  const confirmDelete = (action: 'reassign' | 'delete_tasks') => {
    if (deletingCatId) {
      onDelete(deletingCatId, action);
      setDeletingCatId(null);
    }
  };

  return (
    <div className="space-y-16 animate-reveal pb-24 pt-4">
      {/* Category Creation Lab */}
      <section className="glass-panel rounded-[50px] p-8 lg:p-12 border-white/5 relative overflow-hidden group shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-nebula-purple via-nebula-blue to-nebula-pink"></div>
        
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-nebula-purple to-nebula-blue flex items-center justify-center text-white shadow-xl shadow-nebula-purple/20">
                {editingId ? <Icons.Edit className="w-8 h-8" /> : <Icons.Plus className="w-8 h-8" />}
              </div>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight glow-title">
                  {editingId ? 'تحديث القطاع' : 'توليد قطاع جديد'}
                </h3>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-1">تخصيص الهوية التصنيفية</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2 block">اسم القطاع</label>
                <input 
                  autoFocus required value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: العمل، المنزل..."
                  className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 px-8 text-xl font-black text-white outline-none focus:border-nebula-purple transition-all shadow-inner"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2 block">اللون</label>
                  <div className="flex flex-wrap gap-3 p-4 bg-white/5 rounded-3xl border border-white/10">
                    {COSMIC_COLORS.map(color => (
                      <button
                        key={color} type="button" onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-xl border-2 transition-all ${selectedColor === color ? 'scale-110 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2 block">الأيقونة</label>
                  <div className="grid grid-cols-5 gap-3 p-4 bg-white/5 rounded-3xl border border-white/10 max-h-[140px] overflow-y-auto no-scrollbar">
                    {Object.keys(CategoryIconMap).map(iconKey => (
                      <button
                        key={iconKey} type="button" onClick={() => setSelectedIcon(iconKey)}
                        className={`aspect-square rounded-xl border-2 flex items-center justify-center transition-all ${selectedIcon === iconKey ? 'bg-nebula-purple border-white text-white shadow-lg' : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'}`}
                      >
                        <div className="w-6 h-6">{CategoryIconMap[iconKey]}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="submit"
                  className="flex-1 py-6 bg-gradient-to-r from-nebula-purple to-nebula-blue text-white rounded-3xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                  {editingId ? <Icons.Edit className="w-6 h-6" /> : <Icons.Plus className="w-6 h-6" />}
                  <span>{editingId ? 'حفظ التغييرات' : 'تفعيل القطاع'}</span>
                </button>
                {editingId && (
                  <button 
                    type="button" onClick={() => { setEditingId(null); setName(''); }}
                    className="px-8 bg-white/5 text-slate-400 rounded-3xl font-black hover:bg-white/10 transition-all border border-white/10"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="w-full lg:w-80 flex flex-col items-center justify-center p-10 bg-white/5 rounded-[50px] border border-white/10 shadow-2xl">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-10">معاينة الحضور</p>
            <div className="w-56 h-56 rounded-[50px] glass-panel flex flex-col items-center justify-center gap-6 shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 opacity-10 transition-all group-hover:opacity-20" style={{ background: `radial-gradient(circle at center, ${selectedColor}, transparent 70%)` }}></div>
               <div className="w-24 h-24 rounded-[30px] flex items-center justify-center text-white shadow-2xl transition-all group-hover:scale-110" style={{ backgroundColor: selectedColor }}>
                  <div className="w-12 h-12">{CategoryIconMap[selectedIcon]}</div>
               </div>
               <span className="text-2xl font-black text-white tracking-tight">{name || 'انتظار الاسم'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-10">
        <h4 className="text-[12px] font-black text-white uppercase tracking-[0.4em] px-10 flex items-center gap-4">
           القطاعات الحالية
           <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
          {categories.map((cat, i) => (
            <div 
              key={cat.id}
              className="glass-panel p-8 flex items-center gap-6 group hover:border-white/20 transition-all rounded-[35px]"
            >
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg group-hover:rotate-6 group-hover:scale-105 transition-all" 
                style={{ backgroundColor: cat.color }}
              >
                <div className="w-7 h-7">{cat.icon && CategoryIconMap[cat.icon] ? CategoryIconMap[cat.icon] : CategoryIconMap['star']}</div>
              </div>
              <div className="flex-1 min-w-0">
                <h5 className="text-xl font-black text-white truncate">{cat.name}</h5>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">#{cat.id.slice(-4)}</p>
              </div>
              <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                <button onClick={() => handleEdit(cat)} className="p-2 text-slate-400 hover:text-white transition-all"><Icons.Edit className="w-4 h-4" /></button>
                <button onClick={() => setDeletingCatId(cat.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-all"><Icons.Trash className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Delete Modal */}
      {deletingCatId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-500">
          <div className="relative w-full max-w-md glass-panel border-white/10 rounded-[40px] p-10 shadow-2xl text-center">
             <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-rose-500/20">
                <Icons.Trash className="w-10 h-10" />
             </div>
             <h4 className="text-2xl font-black text-white mb-4">حذف القطاع</h4>
             <p className="text-slate-400 text-sm font-bold leading-relaxed mb-10">ماذا تريد أن تفعل بالمهام المرتبطة بهذا القطاع؟</p>
             <div className="space-y-4">
                <button onClick={() => confirmDelete('reassign')} className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-black transition-all">نقل المهام إلى "أخرى"</button>
                <button onClick={() => confirmDelete('delete_tasks')} className="w-full py-5 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 rounded-2xl text-rose-400 font-black transition-all">حذف جميع المهام المرتبطة</button>
                <button onClick={() => setDeletingCatId(null)} className="w-full py-3 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all">إلغاء</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
