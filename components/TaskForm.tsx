
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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 zenith-blur">
      <div className="w-full max-w-xl bg-zenith-surface border zenith-border rounded-2xl overflow-hidden animate-reveal shadow-2xl">
        <header className="p-6 border-b zenith-border flex justify-between items-center">
          <h2 className="text-sm font-bold uppercase tracking-widest">مهمة جديدة</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full"><Icons.X /></button>
        </header>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <input 
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent text-2xl font-bold border-none outline-none placeholder:text-zenith-muted"
              placeholder="عنوان المهمة..."
            />
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent text-sm border-none outline-none placeholder:text-zenith-muted min-h-[100px] resize-none"
              placeholder="أضف وصفاً اختيارياً..."
            />
          </div>

          <div className="grid grid-cols-2 gap-8 pt-4">
            <div className="space-y-2">
              <label className="text-[10px] text-zenith-muted font-bold uppercase tracking-widest">الأولوية</label>
              <select 
                value={priority}
                onChange={e => setPriority(e.target.value as TaskPriority)}
                className="w-full bg-zenith-bg border zenith-border rounded-lg p-2 text-xs outline-none"
              >
                {Object.keys(TaskPriority).map(p => (
                  <option key={p} value={p}>{PRIORITY_LABELS[p].label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-zenith-muted font-bold uppercase tracking-widest">التصنيف</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-zenith-bg border zenith-border rounded-lg p-2 text-xs outline-none"
              >
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-8 border-t zenith-border flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Icons.Calendar />
              <input 
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="bg-transparent text-[11px] outline-none text-zenith-muted"
              />
            </div>
            <button className="px-8 py-2 bg-white text-black text-xs font-bold rounded-full hover:bg-neutral-200 transition-all">
              {initialTask ? 'تحديث' : 'إنشاء'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
