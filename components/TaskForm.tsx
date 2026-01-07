
import React, { useState, useEffect } from 'react';
import { Task, TaskPriority, TaskStatus, Category } from '../types';
import { Icons } from '../constants';

interface TaskFormProps {
  onAdd: (task: any) => void;
  onUpdate?: (task: Task) => void;
  onClose: () => void;
  initialTask?: Task | null;
  categories: Category[];
}

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#f43f5e', // Rose
  '#0ea5e9', // Sky
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#64748b', // Slate
  '#f97316', // Orange
];

const TaskForm: React.FC<TaskFormProps> = ({ onAdd, onUpdate, onClose, initialTask, categories }) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority || TaskPriority.MEDIUM);
  const [category, setCategory] = useState(initialTask?.category || categories[0]?.name || '');
  const [color, setColor] = useState(initialTask?.color || categories[0]?.color || '#6366f1');
  const [icon, setIcon] = useState(initialTask?.icon || categories[0]?.icon || '');
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || '');
  const [reminderAt, setReminderAt] = useState(initialTask?.reminderAt || '');

  const isEditing = !!initialTask;

  const handleCategoryChange = (catName: string) => {
    setCategory(catName);
    const selectedCat = categories.find(c => c.name === catName);
    if (selectedCat) {
      setColor(selectedCat.color);
      setIcon(selectedCat.icon || '');
    }
  };

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
        icon,
        dueDate,
        reminderAt,
      });
    } else {
      onAdd({
        title,
        description,
        priority,
        category,
        color,
        icon,
        dueDate,
        reminderAt,
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
            <input 
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 text-slate-700 dark:text-slate-100 font-semibold placeholder:text-slate-300 dark:placeholder:text-slate-600"
              placeholder="ما الذي تريد إنجازه؟"
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1">الوصف (اختياري)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all duration-300 text-slate-700 dark:text-slate-100 font-medium placeholder:text-slate-300 dark:placeholder:text-slate-600 min-h-[100px] resize-none"
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
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1">التصنيف</label>
              <div className="relative">
                <select 
                  value={category}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 appearance-none focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 outline-none transition-all duration-300 text-slate-700 dark:text-slate-100 font-bold cursor-pointer"
                >
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* New Color Picker Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1">اختر لوناً للمهمة</label>
            <div className="flex flex-wrap gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-3xl border-2 border-slate-100 dark:border-slate-800">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full transition-all duration-300 transform hover:scale-125 hover:rotate-12 ${color === c ? 'ring-4 ring-offset-2 ring-indigo-500 scale-110 rotate-0 z-10' : 'ring-0 shadow-sm'}`}
                  style={{ backgroundColor: c }}
                  title={c}
                >
                  {color === c && (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    </div>
                  )}
                </button>
              ))}
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-400 transition-colors">
                <input 
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full scale-150"
                  title="لون مخصص"
                />
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Icons.Plus />
                </div>
              </div>
            </div>
          </div>

          {/* Date & Reminder Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1">تاريخ الاستحقاق</label>
              <input 
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 outline-none transition-all duration-300 text-slate-700 dark:text-slate-100 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 mr-1">وقت التذكير</label>
              <input 
                type="datetime-local"
                value={reminderAt}
                onChange={(e) => setReminderAt(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 outline-none transition-all duration-300 text-slate-700 dark:text-slate-100 font-bold"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-6 flex flex-row-reverse gap-4">
            <button 
              type="submit"
              className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-6 rounded-[1.5rem] shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 hover:shadow-indigo-300 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <span>{isEditing ? 'تحديث المهمة' : 'حفظ المهمة'}</span>
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
