import React, { useState, useEffect } from 'react';
import { TaskPriority, Category, TaskStatus } from '../types';
import { Icons, PRIORITY_LABELS } from '../constants';
import { getSmartSubtasks } from '../services/geminiService';

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
  const [subTasks, setSubTasks] = useState<{id: string, title: string, isCompleted: boolean}[]>(initialTask?.subTasks || []);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const handleGenerateAI = async () => {
    if (!title.trim()) return;
    setIsGeneratingSubtasks(true);
    const suggestions = await getSmartSubtasks(title);
    if (suggestions.length > 0) {
      const newSubtasks = suggestions.map((s, idx) => ({
        id: `ai-${Date.now()}-${idx}`,
        title: s,
        isCompleted: false
      }));
      setSubTasks(newSubtasks);
    }
    setIsGeneratingSubtasks(false);
  };

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
      subTasks,
      isPinned: initialTask?.isPinned || false,
      reminderFired: initialTask?.reminderFired || false
    };

    if (initialTask && onUpdate) {
      onUpdate({ ...initialTask, ...taskData });
    } else {
      onAdd(taskData);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      <div className={`w-full max-w-2xl bg-white rounded-[40px] shadow-2xl border border-slate-200 transition-all duration-500 transform ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        
        <header className="px-8 py-6 border-b border-slate-50 flex justify-between items-center rounded-t-[40px]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              {initialTask ? <Icons.Edit className="w-6 h-6" /> : <Icons.Plus className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                {initialTask ? 'تعديل المهمة' : 'إنشاء سجل جديد'}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">إدارة العمليات اليومية</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all">
            <Icons.X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mr-2">عنوان المهمة</label>
            <div className="relative">
              <input 
                required autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-lg font-black text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-sm"
                placeholder="ما الذي تود إنجازه؟"
              />
              <button 
                type="button" 
                onClick={handleGenerateAI}
                disabled={isGeneratingSubtasks || !title.trim()}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-md active:scale-95"
              >
                {isGeneratingSubtasks ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div> : <Icons.Sparkles className="w-4 h-4" />}
                <span>تقسيم ذكي</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mr-2">تفاصيل المهمة</label>
            <textarea 
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 text-sm font-bold text-slate-700 outline-none focus:border-indigo-600 focus:bg-white min-h-[100px] resize-none transition-all shadow-sm leading-relaxed"
              placeholder="وصف إضافي للمهمة..."
            />
          </div>

          {subTasks.length > 0 && (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <label className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mr-2">الخطوات التنفيذية (AI)</label>
              <div className="space-y-2">
                {subTasks.map((st, idx) => (
                  <div key={st.id} className="flex items-center gap-3 p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">{idx + 1}</div>
                    <span className="text-sm font-bold text-slate-700">{st.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mr-2">الأولوية</label>
              <select 
                value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-black text-slate-800 outline-none focus:border-indigo-600 appearance-none cursor-pointer"
              >
                {Object.keys(TaskPriority).map(p => <option key={p} value={p}>{PRIORITY_LABELS[p].label}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest mr-2">التصنيف</label>
              <div className="flex gap-2">
                <select 
                  value={category} onChange={e => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-sm font-black text-slate-800 outline-none focus:border-indigo-600 flex-1"
                >
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <button type="button" onClick={onManageCategories} className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center shadow-sm">
                  <Icons.Plus className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-5 border-2 border-slate-100 text-slate-400 font-black rounded-3xl hover:bg-slate-50 transition-all">إلغاء</button>
            <button type="submit" className="flex-[2] py-5 bg-indigo-600 text-white font-black text-lg rounded-3xl hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all active:scale-95">
              {initialTask ? 'حفظ التغييرات' : 'تفعيل المهمة'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
