
import React, { useState, useEffect } from 'react';
import { TaskPriority, Category, TaskStatus, RecurrenceInterval } from '../types';
import { Icons, PRIORITY_LABELS, CategoryIconMap } from '../constants';
import { getMagicFillData, getSmartSubtasks } from '../services/geminiService';

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
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || new Date().toISOString().split('T')[0]);
  const [reminderAt, setReminderAt] = useState(initialTask?.reminderAt || '');
  const [recurrence, setRecurrence] = useState<RecurrenceInterval>(initialTask?.recurrence || RecurrenceInterval.NONE);
  const [assignedTo, setAssignedTo] = useState(initialTask?.assignedTo || '');
  const [subTasks, setSubTasks] = useState<{id: string, title: string, isCompleted: boolean}[]>(initialTask?.subTasks || []);
  
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [isSubtaskLoading, setIsSubtaskLoading] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const handleMagicFill = async () => {
    if (!title.trim() || isMagicLoading) return;
    setIsMagicLoading(true);
    try {
      const data = await getMagicFillData(title);
      if (data) {
        if (data.description) setDescription(data.description);
        if (data.priority) setPriority(data.priority as TaskPriority);
        if (data.category) {
          const catExists = categories.find(c => c.name === data.category);
          if (catExists) setCategory(data.category);
        }
      }
    } catch (err) {
      console.error("Magic fill failed", err);
    } finally {
      setIsMagicLoading(false);
    }
  };

  const generateSubtasks = async () => {
    if (!title.trim() || isSubtaskLoading) return;
    setIsSubtaskLoading(true);
    try {
      const suggested = await getSmartSubtasks(title, description);
      if (suggested && suggested.length > 0) {
        setSubTasks(suggested.map((s: string, i: number) => ({
          id: `st-${Date.now()}-${i}`,
          title: s,
          isCompleted: false
        })));
      }
    } finally {
      setIsSubtaskLoading(false);
    }
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
      recurrence,
      assignedTo,
      color: selectedCategoryData?.color || '#6366f1',
      icon: selectedCategoryData?.icon || 'star',
      status: initialTask?.status || TaskStatus.PENDING,
      subTasks,
      isPinned: initialTask?.isPinned || false,
      isFavorite: initialTask?.isFavorite || false,
      createdAt: initialTask?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (initialTask && onUpdate) {
      onUpdate({ ...initialTask, ...taskData });
    } else {
      onAdd(taskData);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className={`relative w-full max-w-2xl bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[40px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh] transition-all duration-500 transform ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        
        <header className="px-8 py-6 border-b border-[var(--border-color)] flex items-center justify-between bg-black/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Icons.Sparkles className={`w-6 h-6 ${isMagicLoading ? 'animate-spin' : ''}`} />
            </div>
            <h3 className="text-xl font-black text-[var(--text-primary)]">{initialTask ? 'تعديل المهمة' : 'اضافة مهمة جديدة'}</h3>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-rose-500 bg-black/5 rounded-xl transition-all">
            <Icons.X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8">
          {/* Title & Description */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest mr-2">عنوان المهمة</label>
              <div className="relative">
                <input 
                  required autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/5 border border-[var(--border-color)] rounded-2xl py-4 px-6 text-lg font-bold text-[var(--text-primary)] outline-none focus:border-accent/50 transition-all"
                  placeholder="ما الذي تود إنجازه؟"
                />
                <button 
                  type="button" 
                  onClick={handleMagicFill}
                  disabled={isMagicLoading || !title.trim()}
                  className="absolute left-3 top-1/2 -translate-y-1/2 px-4 py-2 bg-accent text-white rounded-xl text-[10px] font-black hover:scale-105 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  <Icons.Sparkles className="w-3.5 h-3.5" />
                  <span>تعبئة ذكية</span>
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest mr-2">الوصف والتفاصيل</label>
              <textarea 
                value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-black/5 border border-[var(--border-color)] rounded-2xl p-6 text-[14px] font-medium text-[var(--text-primary)] outline-none focus:border-accent/50 min-h-[100px] transition-all leading-relaxed"
                placeholder="أضف تفاصيل إضافية هنا..."
              />
            </div>
          </div>

          {/* Subtasks */}
          <div className="bg-black/5 border border-[var(--border-color)] rounded-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest">قائمة المهام الفرعية ({subTasks.length})</label>
              <button 
                type="button" 
                onClick={generateSubtasks}
                disabled={isSubtaskLoading || !title.trim()}
                className="text-accent text-[10px] font-black flex items-center gap-2 hover:underline disabled:opacity-50"
              >
                {isSubtaskLoading ? <Icons.Sparkles className="w-3 h-3 animate-spin" /> : <Icons.Zap className="w-3 h-3" />}
                تفكيك ذكي للمهمة
              </button>
            </div>
            {subTasks.length > 0 && (
              <div className="space-y-2">
                {subTasks.map((st, idx) => (
                  <div key={st.id} className="flex items-center gap-3 bg-white/50 p-3 rounded-xl border border-white">
                    <span className="text-[10px] font-black opacity-40">{idx + 1}</span>
                    <input 
                      value={st.title} 
                      onChange={(e) => setSubTasks(subTasks.map(s => s.id === st.id ? {...s, title: e.target.value} : s))}
                      className="flex-1 bg-transparent border-none outline-none text-xs font-bold"
                    />
                    <button type="button" onClick={() => setSubTasks(subTasks.filter(s => s.id !== st.id))} className="text-rose-400 hover:text-rose-600">
                      <Icons.X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button 
              type="button" 
              onClick={() => setSubTasks([...subTasks, {id: Date.now().toString(), title: '', isCompleted: false}])}
              className="w-full py-3 rounded-xl border-2 border-dashed border-slate-300 text-slate-400 text-[11px] font-black hover:border-accent hover:text-accent transition-all"
            >
              + إضافة خطوة جديدة
            </button>
          </div>

          {/* Advanced Config */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest mr-2">الأولوية</label>
              <select 
                value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-black/5 border border-[var(--border-color)] rounded-2xl py-4 px-5 text-sm font-bold text-[var(--text-primary)] outline-none appearance-none"
              >
                {Object.keys(TaskPriority).map(p => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p].label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest mr-2">التصنيف</label>
              <select 
                value={category} onChange={e => setCategory(e.target.value)}
                className="w-full bg-black/5 border border-[var(--border-color)] rounded-2xl py-4 px-5 text-sm font-bold text-[var(--text-primary)] outline-none appearance-none"
              >
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest mr-2">التكرار</label>
              <select 
                value={recurrence} onChange={e => setRecurrence(e.target.value as RecurrenceInterval)}
                className="w-full bg-black/5 border border-[var(--border-color)] rounded-2xl py-4 px-5 text-sm font-bold text-[var(--text-primary)] outline-none"
              >
                <option value={RecurrenceInterval.NONE}>بدون تكرار</option>
                <option value={RecurrenceInterval.DAILY}>يومياً</option>
                <option value={RecurrenceInterval.WEEKLY}>أسبوعياً</option>
                <option value={RecurrenceInterval.MONTHLY}>شهرياً</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest mr-2">تعيين لـ</label>
              <div className="relative">
                <input 
                  value={assignedTo} onChange={e => setAssignedTo(e.target.value)}
                  className="w-full bg-black/5 border border-[var(--border-color)] rounded-2xl py-4 px-6 text-sm font-bold text-[var(--text-primary)] outline-none"
                  placeholder="اسم المستخدم"
                />
                <Icons.User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest mr-2">الموعد النهائي</label>
              <input 
                type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full bg-black/5 border border-[var(--border-color)] rounded-2xl py-4 px-6 text-sm font-bold text-[var(--text-primary)] outline-none"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest mr-2">وقت التنبيه</label>
              <input 
                type="datetime-local" value={reminderAt} onChange={e => setReminderAt(e.target.value)}
                className="w-full bg-black/5 border border-[var(--border-color)] rounded-2xl py-4 px-6 text-sm font-bold text-[var(--text-primary)] outline-none"
              />
            </div>
          </div>
        </form>

        <footer className="p-8 border-t border-[var(--border-color)] flex items-center gap-4 bg-black/5">
          <button type="button" onClick={onClose} className="flex-1 py-4 rounded-2xl border border-[var(--border-color)] text-[var(--text-secondary)] text-sm font-black hover:bg-black/5 transition-all">إلغاء</button>
          <button 
            onClick={handleSubmit}
            className="flex-[2] py-4 rounded-2xl bg-accent text-white text-sm font-black shadow-xl shadow-accent/30 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
          >
            <span>{initialTask ? 'حفظ التعديلات' : 'اعتماد المهمة'}</span>
            <Icons.CheckCircle className="w-5 h-5" />
          </button>
        </footer>
      </div>
    </div>
  );
};

export default TaskForm;
