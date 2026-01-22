
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
  taskCounts?: Record<string, number>;
}

const TaskForm: React.FC<TaskFormProps> = ({ 
  onAdd, onUpdate, onClose, onManageCategories, initialTask, categories, taskCounts = {} 
}) => {
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
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className={`relative w-full max-w-2xl glass-panel border-white/10 rounded-[40px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh] transition-all duration-500 transform ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        
        {/* Header */}
        <header className="px-8 py-8 border-b border-white/5 flex items-center justify-between bg-white/5 relative overflow-hidden">
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-nebula-purple to-nebula-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-nebula-purple/20">
              <Icons.Sparkles className={`w-7 h-7 ${isMagicLoading ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">{initialTask ? 'تحديث المهمة' : 'مهمة جديدة'}</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">سجل المهام اليومي</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-500 hover:text-rose-500 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
            <Icons.X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-10">
          {/* Title Input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">ما هو الهدف القادم؟</label>
              <button 
                type="button" 
                onClick={handleMagicFill}
                disabled={isMagicLoading || !title.trim()}
                className="text-nebula-purple text-[10px] font-black flex items-center gap-2 hover:brightness-125 disabled:opacity-30 transition-all bg-nebula-purple/10 px-4 py-1.5 rounded-full border border-nebula-purple/20"
              >
                <Icons.Sparkles className="w-3.5 h-3.5" />
                <span>الذكاء الاصطناعي</span>
              </button>
            </div>
            <input 
              required autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 px-8 text-2xl font-black text-white outline-none focus:border-nebula-purple transition-all shadow-inner"
              placeholder="اكتب عنوان المهمة..."
            />
          </div>

          {/* SENSATIONAL SECTOR SELECTOR WITH PROMINENT NUMBERS */}
          <div className="space-y-5">
            <div className="flex items-center justify-between px-2">
               <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">تصنيف المهمة وعبء العمل الحالي</label>
               <button type="button" onClick={onManageCategories} className="text-[10px] font-black text-nebula-blue flex items-center gap-2 hover:underline">إدارة</button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat) => {
                const isActive = category === cat.name;
                const count = taskCounts[cat.name] || 0;
                
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`
                      relative group flex items-center justify-between p-5 rounded-[30px] border transition-all duration-500
                      ${isActive 
                        ? 'bg-white/10 border-white/20 shadow-2xl ring-1 ring-white/10' 
                        : 'bg-white/5 border-white/5 hover:border-white/10'}
                    `}
                  >
                    <div className="flex items-center gap-4 relative z-10 min-w-0">
                      <div 
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isActive ? 'scale-110 shadow-lg' : ''}`}
                        style={{ backgroundColor: isActive ? cat.color : `${cat.color}20`, color: isActive ? 'white' : cat.color }}
                      >
                        {cat.icon && CategoryIconMap[cat.icon] ? CategoryIconMap[cat.icon] : CategoryIconMap['star']}
                      </div>
                      <div className="text-right">
                         <span className={`block text-[15px] font-black truncate ${isActive ? 'text-white' : 'text-slate-400'}`}>
                           {cat.name}
                         </span>
                         <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">تصنيف نشط</span>
                      </div>
                    </div>

                    {/* SUPER PROMINENT AND CLEAR SECTOR NUMBER */}
                    <div className="flex flex-col items-center gap-1">
                      <div 
                        className={`
                          min-w-[45px] h-[45px] rounded-[18px] flex items-center justify-center text-lg font-black relative z-10 transition-all duration-500 border-2
                          ${isActive 
                            ? 'bg-white text-slate-950 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] animate-pulse' 
                            : 'bg-black/20 text-slate-500 border-white/5'}
                        `}
                        style={{ 
                          backgroundColor: isActive ? cat.color : undefined,
                          color: isActive ? 'white' : undefined,
                          borderColor: isActive ? 'rgba(255,255,255,0.4)' : undefined
                        }}
                      >
                        {count}
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-tighter ${isActive ? 'text-white' : 'text-slate-700'}`}>مهام مسبقة</span>
                    </div>

                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite] pointer-events-none"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">التفاصيل الفنية</label>
            <textarea 
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-sm font-bold text-white outline-none focus:border-nebula-purple min-h-[140px] transition-all leading-relaxed shadow-inner"
              placeholder="أضف وصفاً دقيقاً للمهمة..."
            />
          </div>

          {/* Subtasks */}
          <div className="bg-white/5 border border-white/5 rounded-[32px] p-8 space-y-6 shadow-inner">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-white uppercase tracking-widest">المراحل التنفيذية ({subTasks.length})</label>
              <button 
                type="button" 
                onClick={generateSubtasks}
                disabled={isSubtaskLoading || !title.trim()}
                className="text-nebula-blue text-[10px] font-black flex items-center gap-2 hover:scale-105 transition-all"
              >
                {isSubtaskLoading ? <Icons.Sparkles className="w-3 h-3 animate-spin" /> : <Icons.Zap className="w-3 h-3" />}
                تفكيك ذكي
              </button>
            </div>
            
            <div className="space-y-3">
              {subTasks.map((st, idx) => (
                <div key={st.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group/st">
                  <span className="text-[10px] font-black text-nebula-blue/60">{idx + 1}</span>
                  <input 
                    value={st.title} 
                    onChange={(e) => setSubTasks(subTasks.map(s => s.id === st.id ? {...s, title: e.target.value} : s))}
                    className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-white"
                  />
                  <button type="button" onClick={() => setSubTasks(subTasks.filter(s => s.id !== st.id))} className="text-slate-600 hover:text-rose-500">
                    <Icons.X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => setSubTasks([...subTasks, {id: Date.now().toString(), title: '', isCompleted: false}])}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-white/10 text-slate-500 text-[11px] font-black hover:border-nebula-blue transition-all"
              >
                + إضافة مرحلة جديدة
              </button>
            </div>
          </div>

          {/* Grid Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">الأولوية</label>
              <select 
                value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs font-black text-white outline-none appearance-none"
              >
                {Object.keys(TaskPriority).map(p => (
                  <option key={p} value={p} className="bg-slate-900">{PRIORITY_LABELS[p].label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-2">الموعد النهائي</label>
              <input 
                type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs font-black text-white outline-none"
              />
            </div>
          </div>
        </form>

        <footer className="p-10 border-t border-white/5 flex items-center gap-4 bg-white/5">
          <button type="button" onClick={onClose} className="flex-1 py-5 rounded-2xl border border-white/10 text-slate-400 text-xs font-black hover:bg-white/5">إلغاء</button>
          <button 
            onClick={handleSubmit}
            className="flex-[2] py-5 rounded-2xl bg-gradient-to-r from-nebula-purple to-nebula-blue text-white text-xs font-black shadow-lg hover:scale-[1.02] transition-all"
          >
            {initialTask ? 'تحديث السجل' : 'إضافة المهمة'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default TaskForm;
