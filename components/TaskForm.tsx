import React, { useState, useEffect } from 'react';
import { TaskPriority, Category, TaskStatus } from '../types';
import { Icons, PRIORITY_LABELS, CategoryIconMap } from '../constants';
import { getMagicFillData } from '../services/geminiService';

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
  const [subTasks, setSubTasks] = useState<{id: string, title: string, isCompleted: boolean}[]>(initialTask?.subTasks || []);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMagicLoading, setIsMagicLoading] = useState(false);

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
        if (data.subTasks) {
          setSubTasks(data.subTasks.map((s: string, i: number) => ({
            id: `magic-${Date.now()}-${i}`,
            title: s,
            isCompleted: false
          })));
        }
      }
    } catch (err) {
      console.error("Magic fill failed", err);
    } finally {
      setIsMagicLoading(false);
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
      
      <div className={`relative w-full max-w-xl bg-[var(--bg-main)] border border-[var(--border-color)] rounded-[45px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh] transition-all duration-500 transform ${isAnimating ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10'}`}>
        
        <header className="px-8 py-6 border-b border-[var(--border-color)] flex items-center justify-between bg-black/5">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-white shadow-xl shadow-accent/20">
              <Icons.Sparkles className={`w-6 h-6 ${isMagicLoading ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="text-xl font-black text-[var(--text-primary)] leading-none">تخطيط ذكي</h3>
              <p className="text-[10px] font-black text-accent uppercase tracking-[0.3em] mt-2">إصدار Gemini Neural</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-400 hover:text-rose-500 transition-all bg-black/5 rounded-xl">
            <Icons.X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8">
          <div className="space-y-3">
            <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-2">هدف العملية</label>
            <div className="relative group">
              <input 
                required autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-black/10 border border-[var(--border-color)] rounded-[25px] py-5 px-7 text-lg font-bold text-[var(--text-primary)] outline-none focus:border-accent/50 transition-all placeholder:text-slate-700"
                placeholder="ما هو هدفك القادم؟"
              />
              <button 
                type="button" 
                onClick={handleMagicFill}
                disabled={isMagicLoading || !title.trim()}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 px-5 py-2.5 bg-accent text-white rounded-2xl text-[11px] font-black hover:scale-105 disabled:opacity-50 disabled:scale-100 transition-all shadow-xl group/magic"
              >
                {isMagicLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Icons.Sparkles className="w-4 h-4 group-hover/magic:rotate-12" />
                )}
                <span>سحر الذكاء</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-2">التفاصيل الفنية</label>
            <textarea 
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-black/10 border border-[var(--border-color)] rounded-[25px] p-6 text-[15px] font-medium text-[var(--text-primary)] outline-none focus:border-accent/50 min-h-[100px] transition-all placeholder:text-slate-700 leading-relaxed"
              placeholder="صف ملامح المهمة هنا..."
            />
          </div>

          {subTasks.length > 0 && (
            <div className="bg-accent/5 border border-accent/10 rounded-[30px] p-6 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-accent uppercase tracking-[0.2em] flex items-center gap-2">
                  <Icons.Sparkles className="w-4 h-4" /> خريطة الطريق المقترحة
                </p>
                <button type="button" onClick={() => setSubTasks([])} className="text-[9px] font-black text-rose-500 uppercase">مسح</button>
              </div>
              <div className="space-y-3">
                {subTasks.map((st, idx) => (
                  <div key={st.id} className="flex items-center gap-4 text-[13px] font-bold text-[var(--text-secondary)] bg-black/5 p-4 rounded-2xl border border-[var(--border-color)] hover:border-accent/20 transition-all">
                    <span className="w-6 h-6 bg-accent text-white rounded-lg flex items-center justify-center text-[11px] font-black">{idx + 1}</span>
                    {st.title}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-2">الأولوية الاستراتيجية</label>
              <select 
                value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-black/10 border border-[var(--border-color)] rounded-2xl py-4 px-5 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-accent/50 appearance-none cursor-pointer"
              >
                {Object.keys(TaskPriority).map(p => (
                  <option key={p} value={p} className="bg-[#0f172a]">{PRIORITY_LABELS[p].label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-2">قطاع المهمة</label>
              <div className="flex gap-2">
                <select 
                  value={category} onChange={e => setCategory(e.target.value)}
                  className="flex-1 bg-black/10 border border-[var(--border-color)] rounded-2xl py-4 px-5 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-accent/50 appearance-none cursor-pointer"
                >
                  {categories.map(c => <option key={c.id} value={c.name} className="bg-[#0f172a]">{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-widest px-2">الموعد النهائي</label>
            <div className="relative">
              <input 
                type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-black/10 border border-[var(--border-color)] rounded-2xl py-4 px-6 text-sm font-bold text-[var(--text-primary)] outline-none focus:border-accent/50 transition-all"
              />
              <Icons.Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-accent w-5 h-5 pointer-events-none" />
            </div>
          </div>
        </form>

        <footer className="p-8 border-t border-[var(--border-color)] flex items-center gap-4 bg-black/5">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 py-5 rounded-2xl border border-[var(--border-color)] text-[var(--text-secondary)] text-sm font-black hover:bg-black/10 transition-all"
          >
            تجاهل
          </button>
          <button 
            onClick={handleSubmit}
            className="flex-[2] py-5 rounded-2xl bg-accent text-white text-sm font-black shadow-2xl shadow-accent/40 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <span>{initialTask ? 'حفظ التغييرات' : 'اعتماد المهمة'}</span>
            <Icons.CheckCircle className="w-5 h-5" />
          </button>
        </footer>
      </div>
    </div>
  );
};

export default TaskForm;