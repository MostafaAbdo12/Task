
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, TaskStatus, TaskPriority, TaskStats, Category } from './types';
import { Icons, DEFAULT_CATEGORIES, PRIORITY_LABELS, CategoryIconMap } from './constants';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Sidebar from './components/Sidebar';
import { getSmartSubtasks, getSmartAdvice } from './services/geminiService';

const PRESET_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#f43f5e', '#0ea5e9', '#8b5cf6', '#ec4899', '#64748b', '#f97316'
];

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('maham_tasks');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch { return []; }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('maham_categories');
      const parsed = saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
      return Array.isArray(parsed) ? parsed : DEFAULT_CATEGORIES;
    } catch { return DEFAULT_CATEGORIES; }
  });

  const [filter, setFilter] = useState<TaskStatus | 'ALL'>(() => {
    return (localStorage.getItem('maham_filter_status') as any) || 'ALL';
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    return localStorage.getItem('maham_filter_category') || 'الكل';
  });

  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'ALL'>(() => {
    return (localStorage.getItem('maham_filter_priority') as any) || 'ALL';
  });

  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem('maham_filter_search') || '';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('maham_dark_mode') === 'true';
  });

  const [startDate, setStartDate] = useState(() => localStorage.getItem('maham_filter_start_date') || '');
  const [endDate, setEndDate] = useState(() => localStorage.getItem('maham_filter_end_date') || '');
  const [dateFilterType, setDateFilterType] = useState<'createdAt' | 'dueDate'>(() => {
    return (localStorage.getItem('maham_date_filter_type') as any) || 'dueDate';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return window.innerWidth > 1024;
  });

  const [showForm, setShowForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [aiAdvice, setAiAdvice] = useState('أهلاً بك في مهام!');
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'info' } | null>(null);
  
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(PRESET_COLORS[0]);
  const [newCatIcon, setNewCatIcon] = useState('star');

  const [dbConfig] = useState({
    host: 'pg.neon.tech',
    database: 'neondb',
    user: 'neondb_owner',
    status: 'connected'
  });

  useEffect(() => {
    localStorage.setItem('maham_tasks', JSON.stringify(tasks));
    if (tasks.length > 0) fetchAdvice();
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('maham_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('maham_filter_status', filter);
    localStorage.setItem('maham_filter_category', selectedCategory);
    localStorage.setItem('maham_filter_priority', selectedPriority);
    localStorage.setItem('maham_filter_search', searchQuery);
    localStorage.setItem('maham_dark_mode', isDarkMode.toString());
    localStorage.setItem('maham_filter_start_date', startDate);
    localStorage.setItem('maham_filter_end_date', endDate);
    localStorage.setItem('maham_date_filter_type', dateFilterType);

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [filter, selectedCategory, selectedPriority, searchQuery, isDarkMode, startDate, endDate, dateFilterType]);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAdvice = async () => {
    if (tasks.length === 0) return;
    const advice = await getSmartAdvice(tasks);
    setAiAdvice(advice);
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isPinned'>) => {
    const timestamp = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: timestamp,
      updatedAt: timestamp,
      isPinned: false
    };
    
    // نستخدم الـ functional update للتأكد من عدم مسح المهام القديمة
    setTasks(prev => [newTask, ...prev]);
    
    // تصفير الفلاتر لضمان رؤية المهمة الجديدة فوراً
    setFilter('ALL');
    setSearchQuery('');
    setSelectedCategory('الكل');
    
    showToast('تمت إضافة المهمة بنجاح إلى قائمتك!');
  };

  const updateTask = (updatedTask: Task) => {
    const finalTask = { ...updatedTask, updatedAt: new Date().toISOString() };
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? finalTask : t));
    setEditingTask(null);
    showToast('تم تحديث بيانات المهمة', 'info');
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast('تم حذف المهمة بنجاح', 'info');
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t));
    if (status === TaskStatus.COMPLETED) {
      showToast('أحسنت! مهمة أخرى مكتملة 🎉');
    }
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedSubtasks = t.subTasks.map(st => 
          st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
        );
        return { ...t, subTasks: updatedSubtasks, updatedAt: new Date().toISOString() };
      }
      return t;
    }));
  };

  const togglePin = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t));
  };

  const handleSmartBreakdown = async (targetTask: Task) => {
    setIsBreakingDown(true);
    const subtaskTitles = await getSmartSubtasks(targetTask.title, targetTask.description);
    if (subtaskTitles.length > 0) {
      const newSubtasks = subtaskTitles.map(title => ({
        id: Math.random().toString(36).substr(2, 5),
        title,
        isCompleted: false
      }));
      setTasks(prev => prev.map(t => 
        t.id === targetTask.id 
          ? { ...t, subTasks: [...t.subTasks, ...newSubtasks], updatedAt: new Date().toISOString() } 
          : t
      ));
      showToast('قام الذكاء الاصطناعي بتفكيك المهمة بنجاح');
    }
    setIsBreakingDown(false);
  };

  const clearFilters = () => {
    setFilter('ALL');
    setSelectedCategory('الكل');
    setSelectedPriority('ALL');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesStatus = filter === 'ALL' || t.status === filter;
      const matchesCategory = selectedCategory === 'الكل' || t.category === selectedCategory;
      const matchesPriority = selectedPriority === 'ALL' || t.priority === selectedPriority;
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesDate = true;
      const targetDateStr = dateFilterType === 'createdAt' ? t.createdAt : t.dueDate;
      if (targetDateStr && (startDate || endDate)) {
        const targetDate = new Date(targetDateStr).setHours(0, 0, 0, 0);
        if (startDate && targetDate < new Date(startDate).setHours(0,0,0,0)) matchesDate = false;
        if (endDate && targetDate > new Date(endDate).setHours(0,0,0,0)) matchesDate = false;
      }
      return matchesStatus && matchesCategory && matchesPriority && matchesSearch && matchesDate;
    }).sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tasks, filter, selectedCategory, selectedPriority, searchQuery, startDate, endDate, dateFilterType]);

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-700 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-slide-up">
           <div className={`px-8 py-4 rounded-[2rem] shadow-2xl backdrop-blur-xl flex items-center gap-4 border-2 ${toast.type === 'success' ? 'bg-indigo-600/90 border-indigo-400 text-white' : 'bg-slate-800/90 border-slate-700 text-white'}`}>
             <div className="bg-white/20 p-2 rounded-full"><Icons.CheckCircle /></div>
             <span className="font-black text-sm">{toast.message}</span>
           </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-3 bg-slate-100 dark:bg-slate-800 rounded-[1.2rem] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all active:scale-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="3" y1="18" y2="18"/></svg>
            </button>
            <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl animate-float transition-transform group-hover:scale-110 group-hover:rotate-12">
                <Icons.CheckCircle />
              </div>
              <h1 className="text-2xl font-black tracking-tight hidden sm:block bg-gradient-to-l from-indigo-600 to-indigo-400 bg-clip-text text-transparent">مهام</h1>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-12 relative hidden md:block">
            <div className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 pointer-events-none transition-colors group-focus-within:text-indigo-500"><Icons.Search /></div>
            <input 
              type="text" 
              placeholder="ابحث عن مهامك بذكاء..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pr-14 pl-6 py-3.5 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-indigo-500 transition-all font-bold group" 
            />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowSettings(true)} className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center shadow-md hover:scale-110 hover:rotate-45 transition-all active:scale-95" title="الإعدادات">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center shadow-md hover:scale-110 hover:-rotate-3 transition-all active:scale-95">
              {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar 
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          selectedPriority={selectedPriority}
          onPrioritySelect={setSelectedPriority}
          startDate={startDate}
          onStartDateChange={setStartDate}
          endDate={endDate}
          onEndDateChange={setEndDate}
          dateFilterType={dateFilterType}
          onDateFilterTypeChange={setDateFilterType}
          onClearFilters={clearFilters}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-12 no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12">
            
            <div className="animate-on-load group bg-indigo-600 dark:bg-indigo-900/40 border border-indigo-400/20 rounded-[3rem] p-8 flex items-center gap-8 shadow-2xl transition-all hover:scale-[1.01]">
              <div className="bg-white/20 backdrop-blur-md p-5 rounded-[2rem] text-white shadow-inner animate-pulse-subtle">
                <Icons.Sparkles />
              </div>
              <div className="flex-1">
                <h4 className="text-white/60 font-black text-xs mb-1 tracking-[0.2em] uppercase">مساعد المهام الذكي</h4>
                <p className="text-white text-xl font-bold leading-relaxed">{aiAdvice}</p>
              </div>
            </div>

            {/* Status Tabs */}
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 animate-on-load stagger-1">
              {[
                { id: 'ALL', label: 'كل المهام' },
                { id: TaskStatus.PENDING, label: 'قيد الانتظار' },
                { id: TaskStatus.IN_PROGRESS, label: 'قيد العمل' },
                { id: TaskStatus.COMPLETED, label: 'مكتملة' }
              ].map((st) => (
                <button 
                  key={st.id} 
                  onClick={() => setFilter(st.id as any)} 
                  className={`px-10 py-4 rounded-[1.8rem] font-black transition-all duration-500 border-2 ${filter === st.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl translate-y-[-2px] scale-105' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:border-indigo-200'}`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Tasks Grid or Empty State */}
            {filteredTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 pb-24">
                {filteredTasks.map((task, idx) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    index={idx}
                    onDelete={deleteTask} 
                    onEdit={(t) => {setEditingTask(t); setShowForm(true);}} 
                    onStatusChange={updateTaskStatus} 
                    onToggleSubtask={toggleSubtask} 
                    onBreakdown={handleSmartBreakdown} 
                    onTogglePin={togglePin} 
                  />
                ))}
              </div>
            ) : (
              <div className="animate-on-load stagger-2 text-center py-32 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center w-full min-h-[400px] justify-center">
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-8 text-slate-300 animate-float">
                   <Icons.Plus />
                </div>
                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-4">قائمتك فارغة الآن</h3>
                <p className="text-slate-500 font-medium max-w-xs">ابدأ بإضافة مهمتك الأولى لتنظيم يومك وتحقيق إنجازاتك!</p>
                <button 
                  onClick={() => {setEditingTask(null); setShowForm(true);}}
                  className="mt-12 bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black shadow-2xl hover:bg-indigo-700 hover:scale-105 transition-all active:scale-95"
                >
                  إضافة مهمة أولى
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <button 
        onClick={() => {setEditingTask(null); setShowForm(true);}} 
        className="fixed bottom-10 left-10 w-20 h-20 bg-indigo-600 text-white rounded-[2rem] shadow-[0_20px_50px_rgba(79,70,229,0.3)] flex items-center justify-center transition-all hover:scale-110 active:scale-90 z-40 border-8 border-slate-50 dark:border-slate-950 animate-glow"
      >
        <div className="scale-125"><Icons.Plus /></div>
      </button>

      {/* Forms & Modals */}
      {showForm && (
        <TaskForm 
          key={editingTask ? editingTask.id : 'new-task-form'} // ضمان رندر نظيف للنموذج
          onAdd={addTask} 
          onUpdate={updateTask} 
          onClose={() => setShowForm(false)} 
          initialTask={editingTask} 
          categories={categories} 
        />
      )}
      
      {/* ... بقية النوافذ المنبثقة (Settings, CategoryManager) تظل كما هي ... */}
    </div>
  );
};

export default App;
