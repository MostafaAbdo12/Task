
import React, { useState, useEffect } from 'react';
import { TaskPriority, Category, TaskStatus } from '../types';
import { Icons, PRIORITY_LABELS } from '../constants';

interface TaskFormProps {
  onAdd: (task: any) => void;
  onUpdate?: (task: any) => void;
  onClose: () => void;
  onManageCategories: () => void;
  initialTask?: any;
  categories: Category[];
}

const TaskForm: React.FC<TaskFormProps> = ({ onAdd, onUpdate, onClose, onManageCategories, initialTask, categories }) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority || TaskPriority.MEDIUM);
  const [category, setCategory] = useState(initialTask?.category || categories[0]?.name || 'أخرى');
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || '');
  const [reminderAt, setReminderAt] = useState(initialTask?.reminderAt || '');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    const selectedCategoryData = categories.find(c => c.name === category);
    
    const taskData = {
      title,
      description,
      priority,
      category,
      dueDate,
      reminderAt,
      color: selectedCategoryData?.color || '#2563eb',
      icon: selectedCategoryData?.icon || 'star',
      status: initialTask?.status || TaskStatus.PENDING,
      subTasks: initialTask?.subTasks || [],
      isPinned: initialTask?.isPinned || false,
      reminderFired: initialTask?.reminderFired || false
    };

    if (initialTask && onUpdate) {
      onUpdate({ ...initialTask, ...taskData });
    } else {
      onAdd(taskData);
    }
  };

  const openPicker = (e: any) => {
    try {
      if (typeof e.target.showPicker === 'function') {
        e.target.showPicker();
      }
    } catch (err) {
      console.warn("showPicker is not supported on this browser", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-[#0a0f1d]/90 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto no-scrollbar">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.05),transparent_50%)]"></div>
      </div>

      <div className={`w-full max-w-xl bg-white rounded-[40px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.4)] border border-slate-200/50 transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) relative z-10 ${isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-95'}`}>
        
        {/* Compact Header */}
        <header className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 rounded-t-[40px]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              {initialTask ? <Icons.Edit className="w-5 h-5" /> : <Icons.Plus className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {initialTask ? 'تحديث المهمة' : 'مهمة جديدة'}
              </h2>
              <p className="text-[9px] font-black text-blue-600/50 uppercase tracking-[0.3em]">Core Operations</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white rounded-xl transition-all active:scale-75 border border-transparent hover:border-slate-100 shadow-sm"
          >
            <Icons.X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
          
          {/* Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">العنوان</label>
            <input 
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-lg font-black text-slate-800 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner placeholder:text-slate-300"
              placeholder="ما هي العملية القادمة؟"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">التفاصيل</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 text-sm font-bold text-slate-700 outline-none focus:border-blue-600 focus:bg-white min-h-[100px] resize-none transition-all shadow-inner placeholder:text-slate-300 leading-relaxed"
              placeholder="أدخل مواصفات المهمة هنا..."
            />
          </div>

          {/* Compact Settings Row 1 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">الأولوية</label>
              <div className="relative">
                <select 
                  value={priority}
                  onChange={e => setPriority(e.target.value as TaskPriority)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-black text-slate-800 outline-none focus:border-blue-600 appearance-none cursor-pointer transition-all"
                >
                  {Object.keys(TaskPriority).map(p => (
                    <option key={p} value={p}>{PRIORITY_LABELS[p].label}</option>
                  ))}
                </select>
                <Icons.Chevron className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">التصنيف</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-black text-slate-800 outline-none focus:border-blue-600 appearance-none cursor-pointer transition-all"
                  >
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <Icons.Chevron className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-4 h-4" />
                </div>
                <button 
                  type="button"
                  onClick={onManageCategories}
                  className="w-12 h-12 bg-blue-50 text-blue-600 border border-blue-100 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90 flex items-center justify-center shrink-0"
                >
                  <Icons.Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Compact Settings Row 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">تاريخ الإنجاز</label>
              <div className="relative">
                <input 
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  onClick={openPicker}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-black text-slate-800 outline-none focus:border-blue-600 cursor-pointer shadow-inner text-center"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">تذكير التنبيه</label>
              <div className="relative">
                <input 
                  type="datetime-local"
                  value={reminderAt}
                  onChange={e => setReminderAt(e.target.value)}
                  onClick={openPicker}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3.5 text-xs font-black text-slate-800 outline-none focus:border-blue-600 cursor-pointer shadow-inner text-center"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border-2 border-slate-100 text-slate-400 text-xs font-black rounded-2xl hover:bg-slate-50 hover:text-slate-700 transition-all active:scale-95"
            >
              إلغاء
            </button>
            <button 
              type="submit"
              className="flex-[2] py-4 bg-blue-600 text-white text-xs font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95 transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span>{initialTask ? 'حفظ التعديل' : 'إنشاء السجل'}</span>
              <Icons.CheckCircle className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
