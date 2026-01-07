
import React, { useState } from 'react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { CATEGORIES, Icons } from '../constants';

interface TaskFormProps {
  onAdd: (task: any) => void;
  onUpdate?: (task: Task) => void;
  onClose: () => void;
  initialTask?: Task | null;
}

const TaskForm: React.FC<TaskFormProps> = ({ onAdd, onUpdate, onClose, initialTask }) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority || TaskPriority.MEDIUM);
  const [category, setCategory] = useState(initialTask?.category || CATEGORIES[0]);
  const [color, setColor] = useState(initialTask?.color || '#6366f1');
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || '');

  const isEditing = !!initialTask;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEditing && onUpdate && initialTask) {
      onUpdate({
        ...initialTask,
        title,
        description,
        priority,
        category,
        color,
        dueDate,
      });
    } else {
      onAdd({
        title,
        description,
        priority,
        category,
        color,
        dueDate,
        status: TaskStatus.PENDING,
        subTasks: [],
        isPinned: false
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col border border-slate-100 dark:border-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50 dark:border-slate-800">
          <button 
            onClick={onClose} 
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
            {isEditing ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
          </h2>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[75vh] no-scrollbar">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1">عنوان المهمة</label>
            <div className="relative group">
              <input 
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 text-slate-700 dark:text-slate-100 font-semibold placeholder:text-slate-300 dark:placeholder:text-slate-600"
                placeholder="ما الذي تريد إنجازه؟"
              />
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1">الوصف (اختياري)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 text-slate-700 dark:text-slate-100 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 min-h-[120px] resize-none"
              placeholder="تفاصيل إضافية..."
            />
          </div>

          {/* Row: Priority & Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1">الأولوية</label>
              <div className="relative">
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 appearance-none focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 outline-none transition-all duration-300 text-slate-700 dark:text-slate-100 font-bold cursor-pointer"
                >
                  <option value={TaskPriority.LOW}>منخفضة</option>
                  <option value={TaskPriority.MEDIUM}>متوسطة</option>
                  <option value={TaskPriority.HIGH}>عالية</option>
                  <option value={TaskPriority.URGENT}>عاجلة</option>
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1">التصنيف</label>
              <div className="relative">
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 appearance-none focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 outline-none transition-all duration-300 text-slate-700 dark:text-slate-100 font-bold cursor-pointer"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>
          </div>

          {/* Row: Color & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1">لون التصنيف</label>
              <div className="flex items-center h-[60px] p-1 bg-slate-50/50 dark:bg-slate-800/40 border-2 border-slate-100 dark:border-slate-800 rounded-2xl group transition-all duration-300 focus-within:border-indigo-500 focus-within:bg-white dark:focus-within:bg-slate-800 overflow-hidden">
                <input 
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-full bg-transparent border-none cursor-pointer rounded-xl overflow-hidden scale-[1.3] transform origin-center"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1">تاريخ الاستحقاق</label>
              <div className="relative">
                <input 
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 outline-none transition-all duration-300 text-slate-700 dark:text-slate-100 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-6 flex flex-row-reverse gap-4">
            <button 
              type="submit"
              className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-[1.5rem] shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 hover:shadow-indigo-300 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <span>{isEditing ? 'تحديث المهمة' : 'حفظ المهمة'}</span>
              <div className="bg-white/20 p-1 rounded-full">
                <Icons.CheckCircle />
              </div>
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold transition-all active:scale-95 text-center"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
