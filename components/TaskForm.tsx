
import React, { useState, useEffect } from 'react';
import { TaskPriority, Category, TaskStatus } from '../types';
import { Icons, PRIORITY_LABELS } from '../constants';

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
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || '');
  const [reminderAt, setReminderAt] = useState(initialTask?.reminderAt || '');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
  }, []);

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
      color: selectedCategoryData?.color || '#2563eb',
      icon: selectedCategoryData?.icon || 'star',
      status: initialTask?.status || TaskStatus.PENDING,
      subTasks: initialTask?.subTasks || [],
      isPinned: initialTask?.isPinned || false,
      reminderFired: initialTask?.reminderFired || false
    };

    if (initialTask && onUpdate) {
      onUpdate({ ...initialTask, ...taskData });
    } else {
      onAdd(taskData);
    }
  };

  const openPicker = (e: any) => {
    try {
      if (typeof e.target.showPicker === 'function') {
        e.target.showPicker();
      }
    } catch (err) {
      console.warn("showPicker is not supported on this browser", err);
    }
  };

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-[#0a0f1d]/95 backdrop-blur-2xl animate-in fade-in duration-700 overflow-y-auto">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,0.1),transparent_50%)]"></div>
        <div className="absolute top-1/4 -right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
      </div>

      <div className={`w-full max-w-4xl bg-white rounded-[50px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-slate-200/50 transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) relative z-10 ${isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-24 opacity-0 scale-90'}`}>
        
        {/* Luxury Header */}
        <header className="px-10 lg:px-14 py-10 border-b border-slate-100 flex justify-between items-center bg-gradient-to-l from-white to-slate-50/50 rounded-t-[50px]">
          <div className="relative">
            <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter leading-tight flex items-center gap-4">
              <span className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                {initialTask ? <Icons.Edit className="w-6 h-6" /> : <Icons.Plus className="w-7 h-7" />}
              </span>
              {initialTask ? 'تعديل المهمة' : 'مهمة جديدة'}
            </h2>
            <p className="text-[12px] font-black text-blue-600/60 mt-2 uppercase tracking-[0.4em] mr-16">نظام الإنتاجية الفائقة</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="w-14 h-14 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-white hover:shadow-2xl rounded-2xl transition-all duration-500 active:scale-75 border border-transparent hover:border-slate-100"
          >
            <Icons.X className="w-8 h-8" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-10 lg:p-14 space-y-12 max-h-[75vh] overflow-y-auto no-scrollbar">
          
          {/* Main Title Field */}
          <div className={`space-y-4 transition-all duration-700 delay-[100ms] ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest px-1 block">عنوان المهمة الرئيسي</label>
            <div className="relative group">
               <input 
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-[30px] px-8 py-6 text-2xl font-black text-slate-800 outline-none focus:ring-[15px] focus:ring-blue-600/5 focus:border-blue-600 focus:bg-white transition-all shadow-inner placeholder:text-slate-300"
                placeholder="ما الذي تريد إنجازه اليوم؟"
              />
              <div className="absolute left-8 top-1/2 -translate-y-1/2 text-blue-600 opacity-0 group-focus-within:opacity-100 group-focus-within:scale-125 transition-all duration-500">
                <Icons.Sparkles className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Description Field */}
          <div className={`space-y-4 transition-all duration-700 delay-[200ms] ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest px-1 block">وصف التفاصيل</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-[35px] p-8 text-lg font-bold text-slate-700 outline-none focus:ring-[15px] focus:ring-blue-600/5 focus:border-blue-600 focus:bg-white min-h-[160px] resize-none transition-all shadow-inner placeholder:text-slate-300 leading-relaxed"
              placeholder="اكتب وصفاً دقيقاً لخطوات التنفيذ..."
            />
          </div>

          {/* Settings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Priority Select */}
            <div className={`space-y-4 transition-all duration-700 delay-[300ms] ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest px-1 block">الأولوية</label>
              <div className="relative group">
                <select 
                  value={priority}
                  onChange={e => setPriority(e.target.value as TaskPriority)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[25px] px-8 py-5 text-base font-black text-slate-800 outline-none focus:border-blue-600 appearance-none cursor-pointer transition-all pr-14"
                >
                  {Object.keys(TaskPriority).map(p => (
                    <option key={p} value={p}>{PRIORITY_LABELS[p].label}</option>
                  ))}
                </select>
                <Icons.Chevron className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-6 h-6" />
                <div className={`absolute right-8 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${priority === TaskPriority.URGENT ? 'bg-red-500 shadow-lg shadow-red-200 animate-pulse' : priority === TaskPriority.HIGH ? 'bg-orange-500 shadow-lg shadow-orange-200' : 'bg-blue-500 shadow-lg shadow-blue-200'}`}></div>
              </div>
            </div>

            {/* Category Select */}
            <div className={`space-y-4 transition-all duration-700 delay-[400ms] ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest px-1 block">التصنيف</label>
              <div className="flex gap-4">
                <div className="relative flex-1 group">
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-[25px] px-8 py-5 text-base font-black text-slate-800 outline-none focus:border-blue-600 appearance-none cursor-pointer transition-all"
                  >
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                  <Icons.Chevron className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-6 h-6" />
                </div>
                <button 
                  type="button"
                  onClick={onManageCategories}
                  className="w-16 h-16 bg-blue-50 text-blue-600 border-2 border-blue-100 rounded-[22px] hover:bg-blue-600 hover:text-white transition-all active:scale-90 flex items-center justify-center group shadow-xl shadow-blue-500/10"
                >
                  <Icons.Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" />
                </button>
              </div>
            </div>

            {/* Deadline */}
            <div className={`space-y-4 transition-all duration-700 delay-[500ms] ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest px-1 block">تاريخ الإنجاز</label>
              <div className="relative group">
                <Icons.Calendar className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 pointer-events-none group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  onClick={openPicker}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[25px] pr-16 pl-8 py-5 text-base font-black text-slate-800 outline-none focus:border-blue-600 cursor-pointer shadow-inner text-center"
                />
              </div>
            </div>

            {/* Reminder */}
            <div className={`space-y-4 transition-all duration-700 delay-[600ms] ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest px-1 block">تذكير واتساب</label>
              <div className="relative group">
                <Icons.AlarmClock className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 pointer-events-none group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="datetime-local"
                  value={reminderAt}
                  onChange={e => setReminderAt(e.target.value)}
                  onClick={openPicker}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-[25px] pr-16 pl-8 py-5 text-base font-black text-slate-800 outline-none focus:border-blue-600 cursor-pointer shadow-inner text-center"
                />
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className={`pt-10 flex flex-col sm:flex-row gap-6 transition-all duration-1000 delay-[700ms] ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-7 border-2 border-slate-100 text-slate-500 text-base font-black rounded-[35px] hover:bg-slate-50 hover:text-slate-900 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              <span>إلغاء العملية</span>
            </button>
            <button 
              type="submit"
              className="flex-[2] py-7 bg-blue-600 text-white text-lg font-black rounded-[35px] hover:bg-blue-700 shadow-[0_25px_50px_-15px_rgba(37,99,235,0.4)] active:scale-95 transition-all flex items-center justify-center gap-4 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span>{initialTask ? 'حفظ التعديلات' : 'إنشاء المهمة الآن'}</span>
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Icons.CheckCircle className="w-6 h-6" />
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
