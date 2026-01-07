
import React from 'react';
import { TaskStatus, TaskPriority, Category } from '../types';
import { Icons, PRIORITY_LABELS } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (cat: string) => void;
  selectedPriority: TaskPriority | 'ALL';
  onPrioritySelect: (prio: TaskPriority | 'ALL') => void;
  startDate: string;
  onStartDateChange: (val: string) => void;
  endDate: string;
  onEndDateChange: (val: string) => void;
  dateFilterType: 'createdAt' | 'dueDate';
  onDateFilterTypeChange: (val: 'createdAt' | 'dueDate') => void;
  onClearFilters: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onCategorySelect,
  selectedPriority,
  onPrioritySelect,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  dateFilterType,
  onDateFilterTypeChange,
  onClearFilters,
}) => {
  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed lg:sticky top-0 right-0 h-screen lg:h-[calc(100vh-80px)] w-[320px] 
        bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl
        border-l lg:border-l-0 lg:border-r border-slate-200/50 dark:border-slate-800/50 
        z-50 lg:z-10 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) 
        transform ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:opacity-0'} 
        overflow-y-auto no-scrollbar shadow-2xl lg:shadow-none
      `}>
        <div className="p-8 space-y-10">
          {/* Mobile Close Button */}
          <div className="flex lg:hidden justify-between items-center mb-6">
             <h2 className="text-2xl font-black tracking-tight">تصفية المهام</h2>
             <button onClick={onClose} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:rotate-90 transition-transform">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
             </button>
          </div>

          {/* Categories */}
          <section className="animate-on-load stagger-1">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <span className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500"><Icons.Folder /></span>
              التصنيفات المخصصة
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 group">
                <button 
                  onClick={() => onCategorySelect('الكل')}
                  className={`flex-1 text-right px-5 py-3.5 rounded-2xl text-[15px] font-bold transition-all duration-300 ${selectedCategory === 'الكل' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30 translate-x-1' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:translate-x-1'}`}
                >
                  عرض الكل
                </button>
                <button 
                  onClick={() => onCategorySelect('الكل')}
                  className={`p-3.5 rounded-2xl transition-all duration-300 ${selectedCategory === 'الكل' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10'}`}
                >
                  <Icons.Eye />
                </button>
              </div>
              {categories.map((cat, i) => (
                <button 
                  key={cat.id} 
                  onClick={() => onCategorySelect(cat.name)}
                  className={`w-full text-right px-5 py-3.5 rounded-2xl text-[15px] font-bold transition-all duration-300 flex items-center justify-between group/cat ${selectedCategory === cat.name ? 'text-white shadow-xl shadow-indigo-500/20 translate-x-2' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:translate-x-1'}`}
                  style={{ backgroundColor: selectedCategory === cat.name ? cat.color : '' }}
                >
                  <span className="flex items-center gap-3">
                    <span className={`w-3 h-3 rounded-full transition-all duration-500 ${selectedCategory === cat.name ? 'bg-white scale-125' : 'group-hover/cat:scale-125'}`} style={{ backgroundColor: selectedCategory === cat.name ? 'white' : cat.color }}></span>
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Priority */}
          <section className="animate-on-load stagger-2">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <span className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500"><Icons.Sparkles /></span>
              ترتيب الأولوية
            </h3>
            <div className="grid grid-cols-1 gap-2">
              <button 
                onClick={() => onPrioritySelect('ALL')}
                className={`text-right px-6 py-3.5 rounded-2xl text-[15px] font-bold transition-all duration-300 ${selectedPriority === 'ALL' ? 'bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 shadow-xl' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border-2 dark:border-slate-800'}`}
              >
                جميع المستويات
              </button>
              {Object.keys(PRIORITY_LABELS).map((pKey) => (
                <button 
                  key={pKey} 
                  onClick={() => onPrioritySelect(pKey as TaskPriority)}
                  className={`text-right px-6 py-3.5 rounded-2xl text-[15px] font-bold transition-all duration-300 border-2 ${selectedPriority === pKey ? `${PRIORITY_LABELS[pKey].color} border-current shadow-lg translate-x-1` : 'text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  {PRIORITY_LABELS[pKey].label}
                </button>
              ))}
            </div>
          </section>

          {/* Date Range */}
          <section className="animate-on-load stagger-3">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
              <span className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-500"><Icons.Calendar /></span>
              تصفية زمنية
            </h3>
            <div className="space-y-6">
              <div className="flex bg-slate-100/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                <button 
                  onClick={() => onDateFilterTypeChange('dueDate')}
                  className={`flex-1 py-2.5 text-[11px] font-black rounded-xl transition-all duration-300 ${dateFilterType === 'dueDate' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600 dark:text-indigo-400 scale-102' : 'text-slate-400'}`}
                >
                  تاريخ الاستحقاق
                </button>
                <button 
                  onClick={() => onDateFilterTypeChange('createdAt')}
                  className={`flex-1 py-2.5 text-[11px] font-black rounded-xl transition-all duration-300 ${dateFilterType === 'createdAt' ? 'bg-white dark:bg-slate-700 shadow-xl text-indigo-600 dark:text-indigo-400 scale-102' : 'text-slate-400'}`}
                >
                  تاريخ الإضافة
                </button>
              </div>
              <div className="space-y-4">
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 mb-2 mr-2 uppercase tracking-widest group-focus-within:text-indigo-500 transition-colors">من تاريخ</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => onStartDateChange(e.target.value)}
                    className="w-full px-6 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-[14px] font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  />
                </div>
                <div className="group">
                  <label className="block text-[10px] font-black text-slate-400 mb-2 mr-2 uppercase tracking-widest group-focus-within:text-indigo-500 transition-colors">إلى تاريخ</label>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => onEndDateChange(e.target.value)}
                    className="w-full px-6 py-3.5 rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-[14px] font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  />
                </div>
              </div>
            </div>
          </section>

          <button 
            onClick={onClearFilters}
            className="w-full py-5 rounded-[1.8rem] border-2 border-red-100 dark:border-red-900/20 text-red-500 font-black text-[13px] hover:bg-red-500 hover:text-white hover:border-red-500 shadow-xl hover:shadow-red-500/20 transition-all active:scale-90"
          >
            تصفير جميع الفلاتر
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
