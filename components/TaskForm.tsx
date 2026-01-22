
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
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className={`relative w-full max-w-2xl glass-panel border-white/10 rounded-[40px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh] transition-all duration-500 transform ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}>
        
        {/* Glowing Header Area */}
        <header className="px-8 py-8 border-b border-white/5 flex items-center justify-between bg-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-nebula-purple/20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-nebula-purple to-nebula-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-nebula-purple/20">
              <Icons.Sparkles className={`w-7 h-7 ${isMagicLoading ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white glow-title">{initialTask ? 'تحديث المهمة' : 'مهمة جديدة'}</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">تنسيق البروتوكول العملي</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 text-slate-500 hover:text-rose-500 bg-white/5 hover:bg-white/10 rounded-2xl transition-all relative z-10">
            <Icons.X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-10">
          {/* Main Title Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">ما هي خطتك القادمة؟</label>
              <button 
                type="button" 
                onClick={handleMagicFill}
                disabled={isMagicLoading || !title.trim()}
                className="text-nebula-purple text-[10px] font-black flex items-center gap-2 hover:brightness-125 disabled:opacity-30 transition-all bg-nebula-purple/10 px-4 py-1.5 rounded-full border border-nebula-purple/20 shadow-glow"
              >
                <Icons.Sparkles className="w-3.5 h-3.5" />
                <span>الذكاء الاصطناعي</span>
              </button>
            </div>
            <input 
              required autoFocus value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-3xl py-6 px-8 text-2xl font-black text-white outline-none focus:border-nebula-purple transition-all shadow-inner placeholder:text-slate-700"
              placeholder="اكتب عنوان المهمة هنا..."
            />
          </div>

          {/* Description Section */}
          <div className="space-y-4">
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] px-2">وصف المهمة</label>
            <textarea 
              value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-3xl p-8 text-sm font-bold text-white outline-none focus:border-nebula-purple min-h-[140px] transition-all leading-relaxed placeholder:text-slate-700 shadow-inner"
              placeholder="هل هناك تفاصيل إضافية تود تدوينها؟"
            />
          </div>

          {/* Subtasks Interactive Lab */}
          <div className="bg-white/5 border border-white/5 rounded-[32px] p-8 space-y-6 relative overflow-hidden group shadow-inner">
            <div className="absolute top-0 right-0 w-2 h-full bg-nebula-blue/20"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Icons.LayoutDashboard className="w-4 h-4 text-nebula-blue" />
                 <label className="text-[11px] font-black text-white uppercase tracking-widest">المراحل التنفيذية ({subTasks.length})</label>
              </div>
              <button 
                type="button" 
                onClick={generateSubtasks}
                disabled={isSubtaskLoading || !title.trim()}
                className="text-nebula-blue text-[10px] font-black flex items-center gap-2 hover:scale-105 disabled:opacity-30 transition-all"
              >
                {isSubtaskLoading ? <Icons.Sparkles className="w-3 h-3 animate-spin" /> : <Icons.Zap className="w-3 h-3" />}
                تفكيك ذكي للمهمة
              </button>
            </div>
            
            <div className="space-y-3">
              {subTasks.map((st, idx) => (
                <div key={st.id} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group/st hover:bg-white/10 transition-all">
                  <span className="text-[10px] font-black text-nebula-blue/60">{idx + 1}</span>
                  <input 
                    value={st.title} 
                    onChange={(e) => setSubTasks(subTasks.map(s => s.id === st.id ? {...s, title: e.target.value} : s))}
                    className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-white"
                    placeholder="اكتب الخطوة..."
                  />
                  <button type="button" onClick={() => setSubTasks(subTasks.filter(s => s.id !== st.id))} className="text-slate-600 hover:text-rose-500 transition-colors">
                    <Icons.X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => setSubTasks([...subTasks, {id: Date.now().toString(), title: '', isCompleted: false}])}
                className="w-full py-4 rounded-2xl border-2 border-dashed border-white/10 text-slate-500 text-[11px] font-black hover:border-nebula-blue hover:text-nebula-blue transition-all"
              >
                + إضافة خطوة جديدة للمهمة
              </button>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-2">مستوى الأولوية</label>
              <select 
                value={priority} onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs font-black text-white outline-none appearance-none hover:bg-white/10 transition-all cursor-pointer"
              >
                {Object.keys(TaskPriority).map(p => (
                  <option key={p} value={p} className="bg-slate-900">{PRIORITY_LABELS[p].label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-2">قطاع المهمة</label>
              <div className="flex gap-2">
                <select 
                  value={category} onChange={e => setCategory(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs font-black text-white outline-none appearance-none hover:bg-white/10 transition-all cursor-pointer"
                >
                  {categories.map(c => <option key={c.id} value={c.name} className="bg-slate-900">{c.name}</option>)}
                </select>
                <button 
                  type="button"
                  onClick={onManageCategories}
                  className="w-12 h-12 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-nebula-blue hover:bg-nebula-blue/20 hover:scale-110 transition-all"
                  title="إدارة القطاعات"
                >
                   <Icons.Settings className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-2">الموعد النهائي</label>
              <input 
                type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs font-black text-white outline-none hover:bg-white/10 transition-all cursor-pointer"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest px-2">وقت التنبيه</label>
              <input 
                type="datetime-local" value={reminderAt} onChange={e => setReminderAt(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-xs font-black text-white outline-none hover:bg-white/10 transition-all cursor-pointer"
              />
            </div>
          </div>
        </form>

        <footer className="p-10 border-t border-white/5 flex items-center gap-4 bg-white/5">
          <button type="button" onClick={onClose} className="flex-1 py-5 rounded-2xl border border-white/10 text-slate-400 text-xs font-black hover:bg-white/5 transition-all">إلغاء الأمر</button>
          <button 
            onClick={handleSubmit}
            className="flex-[2] py-5 rounded-2xl bg-gradient-to-r from-nebula-purple to-nebula-blue text-white text-xs font-black shadow-glow hover:scale-[1.02] transition-all flex items-center justify-center gap-4"
          >
            <span>{initialTask ? 'تحديث السجلات' : 'تفعيل المهمة الآن'}</span>
            <Icons.CheckCircle className="w-5 h-5" />
          </button>
        </footer>
      </div>
    </div>
  );
};

export default TaskForm;
