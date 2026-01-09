
import React, { useState } from 'react';
import { TaskPriority, Category } from '../types';
import { Icons, CategoryIconMap, PRIORITY_LABELS } from '../constants';

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
  const [reminderAt, setReminderAt] = useState(initialTask?.reminderAt || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    const taskData = {
      title,
      description,
      priority,
      category,
      dueDate,
      reminderAt,
      reminderFired: initialTask?.reminderFired || false,
      color: categories.find(c => c.name === category)?.color || '#00d2ff',
      icon: categories.find(c => c.name === category)?.icon || 'star',
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div className="absolute inset-0 bg-cyber-black/90 backdrop-blur-xl" onClick={onClose}></div>
      
      {/* Professional Command Center UI */}
      <div className="relative w-full max-w-3xl cyber-card rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] animate-fade-up">
        
        {/* Header with Scanning Line */}
        <div className="bg-white/5 px-10 py-8 border-b border-white/5 flex justify-between items-center relative">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-cyber-blue animate-scan opacity-30"></div>
          <div>
            <h2 className="text-2xl font-black neon-text uppercase tracking-tighter flex items-center gap-3">
              <span className="p-2 bg-cyber-blue text-black rounded-lg"><Icons.Plus /></span>
              {initialTask ? 'تعديل بروتوكول المهمة' : 'بروتوكول مهمة جديد'}
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">تشفير البيانات: AES-256 ACTIVE</p>
          </div>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-2xl hover:text-cyber-rose hover:bg-cyber-rose/10 transition-all">
            <Icons.Trash />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto max-h-[75vh] no-scrollbar">
          
          {/* Main Input Section */}
          <div className="space-y-6">
            <div className="space-y-3 group">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                <span className="w-1 h-1 bg-cyber-blue rounded-full"></span> عنوان السجل
              </label>
              <input 
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 outline-none focus:border-cyber-blue focus:bg-white/10 transition-all font-bold text-xl placeholder:text-slate-800"
                placeholder="ما هو هدفك القادم؟"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 flex items-center gap-2">
                <span className="w-1 h-1 bg-cyber-purple rounded-full"></span> تفاصيل المعالجة
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 outline-none focus:border-cyber-purple focus:bg-white/10 transition-all font-medium text-sm placeholder:text-slate-800 min-h-[120px] resize-none"
                placeholder="أدخل التفاصيل الفنية للمهمة..."
              />
            </div>
          </div>

          {/* Metadata Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 pt-4">
            
            {/* Priority Matrix Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">مستوى الأولوية</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(TaskPriority).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p as TaskPriority)}
                    className={`px-4 py-3 rounded-xl text-[10px] font-black transition-all border flex items-center justify-center gap-2 ${
                      priority === p 
                        ? 'bg-cyber-blue text-black border-cyber-blue shadow-[0_0_15px_rgba(0,210,255,0.3)]' 
                        : 'bg-white/5 text-slate-500 border-white/5 hover:border-white/20'
                    }`}
                  >
                    {PRIORITY_LABELS[p].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Grid Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">تصنيف البيانات</label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.name)}
                    className={`p-3 rounded-xl transition-all border flex flex-col items-center gap-2 ${
                      category === c.name 
                        ? 'border-white/20 bg-white/10 text-white' 
                        : 'border-transparent bg-white/5 text-slate-600 hover:bg-white/10'
                    }`}
                  >
                    <span style={{ color: category === c.name ? c.color : 'inherit' }}>{c.icon && CategoryIconMap[c.icon]}</span>
                    <span className="text-[9px] font-black truncate w-full text-center">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">الموعد النهائي</label>
              <div className="relative">
                <input 
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none font-black text-xs text-cyber-blue focus:border-cyber-blue appearance-none"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyber-blue/50 pointer-events-none">
                  <Icons.Calendar />
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">ضبط منبه مخصص</label>
              <div className="relative">
                <input 
                  type="datetime-local"
                  value={reminderAt}
                  onChange={(e) => setReminderAt(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none font-black text-[10px] text-cyber-purple focus:border-cyber-purple appearance-none"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-cyber-purple/50 pointer-events-none">
                  <Icons.Bell />
                </span>
              </div>
            </div>
            
            <div className="flex items-end">
              <button 
                type="submit"
                className="w-full bg-cyber-blue text-black font-black py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all text-sm shadow-[0_15px_30px_rgba(0,210,255,0.3)] flex items-center justify-center gap-3 group"
              >
                <span>{initialTask ? 'تحديث السجلات' : 'تفعيل المهمة'}</span>
                <span className="group-hover:translate-x-1 transition-transform rotate-180"><Icons.Chevron /></span>
              </button>
            </div>
          </div>
        </form>

        {/* Footer Status */}
        <div className="bg-white/5 px-10 py-4 flex justify-between items-center text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
           <span>نظام إدارة المهام المتطور V4</span>
           <span className="flex items-center gap-2">
             <span className="w-1.5 h-1.5 bg-cyber-lime rounded-full"></span> جاهز للإرسال
           </span>
        </div>
      </div>
    </div>
  );
};

export default TaskForm;
