import React, { useState, useEffect } from 'react';
import { TaskPriority, Category, TaskStatus, RecurrenceInterval, SubTask } from '../types';
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
  const [subTasks, setSubTasks] = useState<SubTask[]>(initialTask?.subTasks || []);
  const [isFavorite, setIsFavorite] = useState(initialTask?.isFavorite || false);
  
  const [isMagicLoading, setIsMagicLoading] = useState(false);
  const [isSubtaskLoading, setIsSubtaskLoading] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

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
      isFavorite,
      color: selectedCategoryData?.color || '#2563eb',
      icon: selectedCategoryData?.icon || 'star',
      status: initialTask?.status || TaskStatus.PENDING,
      subTasks,
      isPinned: initialTask?.isPinned || false,
      createdAt: initialTask?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (initialTask && onUpdate) {
      onUpdate({ ...initialTask, ...taskData });
    } else {
      onAdd(taskData);
    }
  };

  const handleMagicFill = async () => {
    if (!title.trim() || isMagicLoading) return;
    setIsMagicLoading(true);
    const data = await getMagicFillData(title);
    if (data) {
      if (data.description) setDescription(data.description);
      if (data.priority) setPriority(data.priority as TaskPriority);
      if (data.category && categories.some(c => c.name === data.category)) setCategory(data.category);
      if (data.subTasks && data.subTasks.length > 0) {
        const generated = data.subTasks.map((t: string) => ({ id: Math.random().toString(), title: t, isCompleted: false }));
        setSubTasks(generated);
      }
    }
    setIsMagicLoading(false);
  };

  const handleGenerateSubtasks = async () => {
    if (!title.trim() || isSubtaskLoading) return;
    setIsSubtaskLoading(true);
    const tasksStrings = await getSmartSubtasks(title);
    if (tasksStrings && tasksStrings.length > 0) {
      const generated = tasksStrings.map((t: string) => ({ id: Math.random().toString(), title: t, isCompleted: false }));
      setSubTasks([...subTasks, ...generated]);
    }
    setIsSubtaskLoading(false);
  };

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubTasks([...subTasks, { id: Date.now().toString(), title: newSubtaskTitle, isCompleted: false }]);
    setNewSubtaskTitle('');
  };

  const removeSubtask = (id: string) => {
    setSubTasks(subTasks.filter(s => s.id !== id));
  };

  const toggleSubtask = (id: string) => {
    setSubTasks(subTasks.map(s => s.id === id ? { ...s, isCompleted: !s.isCompleted } : s));
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-[#020617]/80 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative w-full max-w-3xl glass-panel border-white/10 rounded-[50px] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-reveal flex flex-col max-h-[92vh]">
        
        {/* Modal Header HUD */}
        <header className="px-12 py-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02] relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-600 rounded-[22px] flex items-center justify-center text-white shadow-2xl">
              <Icons.Sparkles className={`w-7 h-7 ${isMagicLoading ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white tracking-tighter">{initialTask ? 'تحديث المعاملة' : 'معاملة جديدة'}</h3>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Professional Task System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <button 
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`w-12 h-12 rounded-[18px] flex items-center justify-center transition-all ${isFavorite ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-white/5 text-slate-500 hover:text-rose-500'}`}
             >
                <Icons.Heart className="w-6 h-6" filled={isFavorite} />
             </button>
             <button onClick={onClose} className="w-12 h-12 glass-panel hover:bg-white/10 rounded-[18px] transition-all flex items-center justify-center text-slate-500 hover:text-rose-500">
               <Icons.X className="w-6 h-6" />
             </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-12 space-y-10">
          {/* Main Title Input HUD */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">تعريف المهمة</label>
                <button 
                  type="button" 
                  onClick={handleMagicFill}
                  className="text-[10px] font-black text-blue-400 bg-blue-500/10 px-5 py-2 rounded-full border border-blue-500/20 hover:bg-blue-500/20 transition-all flex items-center gap-3 group"
                >
                   <Icons.Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                   التحليل الذكي
                </button>
             </div>
             <input 
              required autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 rounded-[30px] py-6 px-8 text-2xl font-black text-white outline-none focus:border-blue-500/50 transition-all shadow-inner placeholder:text-slate-800"
              placeholder="ما هو الهدف القادم؟"
             />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] px-2">الموعد النهائي</label>
                <input 
                  type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                  className="w-full glass-panel bg-white/[0.03] rounded-[22px] py-4 px-6 text-sm font-black text-white outline-none border border-white/5 focus:border-blue-500/30 transition-all"
                />
             </div>
             <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] px-2">تذكير رقمي</label>
                <input 
                  type="datetime-local" value={reminderAt} onChange={e => setReminderAt(e.target.value)}
                  className="w-full glass-panel bg-white/[0.03] rounded-[22px] py-4 px-6 text-sm font-black text-white outline-none border border-white/5 focus:border-blue-500/30 transition-all"
                />
             </div>
          </div>

          {/* Subtasks Section */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em]">المهام الفرعية</label>
                <button 
                  type="button" 
                  onClick={handleGenerateSubtasks}
                  className="text-[9px] font-black text-indigo-400 bg-indigo-500/5 px-4 py-1.5 rounded-full border border-indigo-500/10 hover:bg-indigo-500/10 transition-all"
                >
                   {isSubtaskLoading ? 'تفكيك...' : 'تفكيك المهمة ذكياً'}
                </button>
             </div>
             <div className="space-y-2">
                {subTasks.map(st => (
                  <div key={st.id} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-2xl group">
                     <button type="button" onClick={() => toggleSubtask(st.id)} className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${st.isCompleted ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-700 hover:border-indigo-500 text-transparent'}`}>
                        <Icons.CheckCircle className="w-3 h-3" />
                     </button>
                     <span className={`flex-1 text-xs font-bold ${st.isCompleted ? 'line-through text-slate-600' : 'text-slate-300'}`}>{st.title}</span>
                     <button type="button" onClick={() => removeSubtask(st.id)} className="p-1.5 text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Icons.Trash className="w-4 h-4" />
                     </button>
                  </div>
                ))}
                <div className="flex items-center gap-3 bg-white/[0.03] border border-dashed border-white/10 rounded-2xl p-2 pr-4">
                   <input 
                      value={newSubtaskTitle}
                      onChange={e => setNewSubtaskTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                      placeholder="إضافة خطوة تنفيذية..."
                      className="flex-1 bg-transparent text-xs font-bold text-white outline-none placeholder:text-slate-700"
                   />
                   <button type="button" onClick={addSubtask} className="p-2 bg-white/5 rounded-xl hover:bg-indigo-500 hover:text-white transition-all">
                      <Icons.Plus className="w-4 h-4" />
                   </button>
                </div>
             </div>
          </div>

          {/* Sector Selection Grid */}
          <div className="space-y-6">
             <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] px-2 block">توجيه القطاع</label>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => (
                  <button
                    key={cat.id} type="button" onClick={() => setCategory(cat.name)}
                    className={`
                      relative glass-panel rounded-[24px] p-4 flex items-center gap-4 transition-all duration-300 group
                      ${category === cat.name ? 'border-blue-500/50 bg-blue-500/10 shadow-lg shadow-blue-500/5' : 'hover:bg-white/5 border-white/5'}
                    `}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg" style={{ backgroundColor: cat.color }}>
                       {cat.icon && CategoryIconMap[cat.icon] ? CategoryIconMap[cat.icon] : CategoryIconMap['star']}
                    </div>
                    <div className="text-right">
                       <p className="text-[12px] font-black text-white truncate leading-none mb-1">{cat.name}</p>
                       <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">[{taskCounts[cat.name] || 0} Records]</p>
                    </div>
                    {category === cat.name && <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-blue-400"></div>}
                  </button>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] px-2">الأولوية</label>
                <select 
                  value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}
                  className="w-full glass-panel bg-white/[0.03] rounded-[22px] py-4 px-6 text-sm font-black text-white outline-none appearance-none border border-white/5 focus:border-blue-500/30 transition-all"
                >
                  {Object.keys(TaskPriority).map(p => <option key={p} value={p} className="bg-[#0f172a]">{PRIORITY_LABELS[p].label}</option>)}
                </select>
             </div>
             <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] px-2">التكرار</label>
                <select 
                  value={recurrence} onChange={e => setRecurrence(e.target.value as RecurrenceInterval)}
                  className="w-full glass-panel bg-white/[0.03] rounded-[22px] py-4 px-6 text-sm font-black text-white outline-none appearance-none border border-white/5 focus:border-blue-500/30 transition-all"
                >
                  <option value={RecurrenceInterval.NONE} className="bg-[#0f172a]">بدون تكرار</option>
                  <option value={RecurrenceInterval.DAILY} className="bg-[#0f172a]">يومي</option>
                  <option value={RecurrenceInterval.WEEKLY} className="bg-[#0f172a]">أسبوعي</option>
                  <option value={RecurrenceInterval.MONTHLY} className="bg-[#0f172a]">شهري</option>
                </select>
             </div>
          </div>

          <div className="space-y-4">
             <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.4em] px-2">مذكرة فنية</label>
             <textarea 
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full glass-panel bg-white/[0.03] border border-white/5 rounded-[30px] p-6 text-xs font-bold text-slate-300 outline-none focus:border-blue-500/50 transition-all min-h-[120px] leading-relaxed"
              placeholder="أضف تفاصيل إضافية لتوضيح السياق..."
             />
          </div>
        </form>

        <footer className="px-12 py-8 border-t border-white/5 bg-white/[0.02] flex items-center gap-6">
          <button type="button" onClick={onClose} className="flex-1 py-5 glass-panel rounded-[22px] text-slate-400 text-xs font-black uppercase tracking-widest hover:text-white transition-all">إلغاء المعاملة</button>
          <button onClick={handleSubmit} className="flex-[2] py-5 bg-primary text-white rounded-[22px] text-xs font-black uppercase tracking-[0.3em] hover:bg-indigo-500 transition-all shadow-xl shadow-primary/10">
             {initialTask ? 'تثبيت التعديلات' : 'تفعيل السجل الرقمي'}
          </button>
        </footer>
      </div>
    </div>
  );
};

export default TaskForm;