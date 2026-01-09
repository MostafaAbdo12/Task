
import React, { useState } from 'react';
import { Category } from '../types';
import { Icons, CategoryIconMap } from '../constants';

interface CategoryModalProps {
  categories: Category[];
  onAdd: (category: Category) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const CYBER_COLORS = [
  '#00d2ff', '#9d50bb', '#ccff00', '#ff0055', '#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'
];

const CategoryModal: React.FC<CategoryModalProps> = ({ categories, onAdd, onDelete, onClose }) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('star');
  const [selectedColor, setSelectedColor] = useState(CYBER_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCat: Category = {
      id: Date.now().toString(),
      name,
      icon: selectedIcon,
      color: selectedColor
    };

    onAdd(newCat);
    setName('');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-cyber-black/95 backdrop-blur-2xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-xl cyber-card rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl animate-fade-up">
        <div className="p-10 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black neon-text uppercase tracking-tighter">إدارة ملفات البيانات</h2>
            <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:text-cyber-rose transition-all"><Icons.Trash /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">اسم التصنيف الجديد</label>
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-cyber-blue transition-all font-bold"
                placeholder="أدخل مسمى التصنيف..."
              />
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">اختيار الأيقونة</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.keys(CategoryIconMap).map(iconKey => (
                    <button
                      key={iconKey}
                      type="button"
                      onClick={() => setSelectedIcon(iconKey)}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-center ${
                        selectedIcon === iconKey ? 'bg-cyber-blue text-black border-cyber-blue' : 'bg-white/5 text-slate-500 border-white/5'
                      }`}
                    >
                      {CategoryIconMap[iconKey]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">اختيار اللون</label>
                <div className="grid grid-cols-5 gap-2">
                  {CYBER_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        selectedColor === color ? 'border-white scale-125' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-white/5 border border-cyber-blue/30 text-cyber-blue font-black py-4 rounded-2xl hover:bg-cyber-blue hover:text-black transition-all shadow-lg"
            >
              إضافة إلى النظام
            </button>
          </form>

          <div className="space-y-4 border-t border-white/5 pt-6">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">التصنيفات الحالية</label>
            <div className="max-h-40 overflow-y-auto no-scrollbar space-y-2">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 group">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: cat.color + '22', color: cat.color }}>
                      {cat.icon && CategoryIconMap[cat.icon]}
                    </div>
                    <span className="text-sm font-bold">{cat.name}</span>
                  </div>
                  <button 
                    onClick={() => onDelete(cat.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-cyber-rose transition-all"
                  >
                    <Icons.Trash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
