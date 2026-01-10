
import React, { useState } from 'react';
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
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-white rounded-[40px] overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border border-slate-200 animate-in zoom-in-95">
        
        <header className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {initialTask ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
            </h2>
            <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">تخطيط وتنفيذ المهام</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-3 text-slate-400 hover:text-slate-900 hover:bg-white rounded-2xl border border-transparent hover:border-slate-200 transition-all shadow-sm"
          >
            <Icons.X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
          
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">عنوان المهمة</label>
            <input 
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-[20px] px-6 py-4 text-base font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all shadow-sm placeholder:text-slate-300"
              placeholder="ما الذي تريد إنجازه؟"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">التفاصيل</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-[20px] p-6 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 min-h-[120px] resize-none transition-all shadow-sm placeholder:text-slate-300"
              placeholder="اكتب وصفاً مختصراً للمهمة..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">الأولوية</label>
              <div className="relative">
                <select 
                  value={priority}
                  onChange={e => setPriority(e.target.value as TaskPriority)}
                  className="w-full bg-white border border-slate-200 rounded-[20px] px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 appearance-none cursor-pointer shadow-sm"
                >
                  {Object.keys(TaskPriority).map(p => (
                    <option key={p} value={p}>{PRIORITY_LABELS[p].label}</option>
                  ))}
                </select>
                <Icons.Chevron className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">التصنيف</label>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-[20px] px-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 appearance-none cursor-pointer shadow-sm"
                  >
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <Icons.Chevron className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
                </div>
                <button 
                  type="button"
                  onClick={onManageCategories}
                  className="p-4 bg-blue-50 text-blue-600 border border-blue-100 rounded-[20px] hover:bg-blue-600 hover:text-white transition-all shadow-sm group"
                  title="إضافة تصنيف جديد"
                >
                  <Icons.Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 text-center md:text-right">موعد التسليم</label>
              <div className="relative group">
                <Icons.Calendar className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  onClick={openPicker}
                  className="w-full bg-white border border-slate-200 rounded-full pr-14 pl-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 cursor-pointer shadow-sm text-center md:text-right"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 text-center md:text-right">تذكير ذكي</label>
              <div className="relative group">
                <Icons.AlarmClock className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                <input 
                  type="datetime-local"
                  value={reminderAt}
                  onChange={e => setReminderAt(e.target.value)}
                  onClick={openPicker}
                  className="w-full bg-white border border-slate-200 rounded-full pr-14 pl-6 py-4 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 cursor-pointer shadow-sm text-center md:text-right"
                />
              </div>
            </div>
          </div>

          <div className="pt-8 flex gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-8 py-4 border border-slate-200 text-slate-600 text-[13px] font-black rounded-[22px] hover:bg-slate-50 transition-all active:scale-95"
            >
              تجاهل
            </button>
            <button 
              type="submit"
              className="flex-[2] px-8 py-4 bg-[#2563eb] text-white text-[13px] font-black rounded-[22px] hover:bg-blue-700 shadow-[0_15px_30px_-10px_rgba(37,99,235,0.4)] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <span>{initialTask ? 'حفظ التعديلات' : 'إنشاء المهمة'}</span>
              <Icons.CheckCircle className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
