
import React, { useState } from 'react';
import { TaskPriority, Category } from '../types';
import { Icons, PRIORITY_LABELS } from '../constants';

interface TaskFormProps {
  onAdd: (task: any) => void;
  onUpdate?: (task: any) => void;
  onClose: () => void;
  initialTask?: any;
  categories: Category[];
}

const TaskForm: React.FC<TaskFormProps> = ({ onAdd, onUpdate, onClose, initialTask, categories }) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority || TaskPriority.MEDIUM);
  const [category, setCategory] = useState(initialTask?.category || categories[0].name);
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    const taskData = {
      title,
      description,
      priority,
      category,
      dueDate,
      color: categories.find(c => c.name === category)?.color || '#ffffff',
      status: initialTask?.status || 'PENDING',
      subTasks: initialTask?.subTasks || [],
      isPinned: initialTask?.isPinned || false
    };

    if (initialTask && onUpdate) {
      onUpdate({ ...initialTask, ...taskData });
    } else {
      onAdd(taskData);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
      
      <div className="w-full max-w-2xl bg-cmd-card rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-cmd-border relative">
        
        {/* System Header */}
        <header className="px-10 py-8 border-b border-cmd-border flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cmd-accent/10 flex items-center justify-center">
               <Icons.Plus className="w-5 h-5 text-cmd-accent" />
            </div>
            <div>
              <h2 className="text-white text-xl font-bold tracking-tight italic">
                {initialTask ? 'تعديل سجل البيانات' : 'بروتوكول مهمة جديدة'}
              </h2>
              <p className="text-[9px] text-cmd-text-dim uppercase font-mono tracking-[0.4em]">system_registry // input_mode</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-white/5 rounded-xl transition-all text-white/30 hover:text-white"
          >
            <Icons.X className="w-6 h-6" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-10 space-y-10">
          
          {/* Main Identity Input */}
          <div className="space-y-4">
            <label className="text-[10px] text-cmd-text-dim font-black uppercase tracking-[0.4em] px-2 flex items-center gap-2">
               <div className="w-1 h-1 bg-cmd-accent rounded-full"></div> 1. تعريف الكيان
            </label>
            <div className="relative group">
              <input 
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/[0.03] border border-cmd-border rounded-2xl px-6 py-5 text-xl font-bold text-white outline-none focus:border-cmd-accent/50 transition-all placeholder:text-white/5"
                placeholder="أدخل مسمى المهمة هنا..."
              />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] text-cmd-text-dim font-black uppercase tracking-[0.4em] px-2 flex items-center gap-2">
               <div className="w-1 h-1 bg-cmd-accent rounded-full"></div> 2. الوصف التقني
            </label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/[0.03] border border-cmd-border rounded-2xl p-6 text-sm text-white/70 outline-none focus:border-cmd-accent/30 min-h-[120px] resize-none leading-relaxed transition-all placeholder:text-white/5"
              placeholder="تفاصيل إضافية للبروتوكول..."
            />
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-[10px] text-cmd-text-dim font-black uppercase tracking-[0.4em] px-2">3. مستوى الأولوية</label>
              <div className="relative group">
                <select 
                  value={priority}
                  onChange={e => setPriority(e.target.value as TaskPriority)}
                  className="w-full bg-white/[0.03] border border-cmd-border rounded-2xl px-6 py-4 text-xs font-mono font-bold text-white outline-none focus:border-cmd-accent/30 appearance-none cursor-pointer uppercase tracking-widest"
                >
                  {Object.keys(TaskPriority).map(p => (
                    <option key={p} value={p} className="bg-cmd-card text-white">{PRIORITY_LABELS[p].label}</option>
                  ))}
                </select>
                <Icons.Chevron className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] text-cmd-text-dim font-black uppercase tracking-[0.4em] px-2">4. مجال العمل</label>
              <div className="relative group">
                <select 
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-white/[0.03] border border-cmd-border rounded-2xl px-6 py-4 text-xs font-mono font-bold text-white outline-none focus:border-cmd-accent/30 appearance-none cursor-pointer uppercase tracking-widest"
                >
                  {categories.map(c => <option key={c.id} value={c.name} className="bg-cmd-card text-white">{c.name}</option>)}
                </select>
                <Icons.Chevron className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Deadline & Submit */}
          <div className="pt-8 border-t border-cmd-border flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 bg-white/[0.02] px-6 py-4 rounded-2xl border border-cmd-border w-full md:w-auto">
              <Icons.Calendar className="text-cmd-accent w-4 h-4" />
              <input 
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="bg-transparent text-[11px] font-mono font-bold text-white/60 outline-none cursor-pointer uppercase tracking-tighter"
              />
            </div>
            
            <button 
              type="submit"
              className="w-full md:w-auto px-12 py-4 bg-white text-black text-xs font-black rounded-2xl hover:bg-cmd-accent transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-4 cmd-button-glow"
            >
              <span>{initialTask ? 'تحديث السجل' : 'حفظ المهمة'}</span>
              <Icons.CheckCircle className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Decorative Element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cmd-accent/5 blur-[80px] pointer-events-none"></div>
      </div>
    </div>
  );
};

export default TaskForm;
