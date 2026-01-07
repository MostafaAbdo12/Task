
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, TaskStatus, TaskPriority, TaskStats, Category } from './types';
import { Icons, DEFAULT_CATEGORIES, PRIORITY_LABELS, CategoryIconMap } from './constants';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Sidebar from './components/Sidebar';
import { getSmartSubtasks, getSmartAdvice } from './services/geminiService';

const App: React.FC = () => {
  // تحسين تحميل البيانات مع التأكد من النوع
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
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [aiAdvice, setAiAdvice] = useState('أهلاً بك في مهام!');
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  
  const [newCatName, setNewCatName] = useState('');

  // مزامنة البيانات
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

  const fetchAdvice = async () => {
    if (tasks.length === 0) return;
    const advice = await getSmartAdvice(tasks);
    setAiAdvice(advice);
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isPinned'>) => {
    const timestamp = new Date().toISOString();
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: timestamp,
      updatedAt: timestamp,
      isPinned: false
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (updatedTask: Task) => {
    const finalTask = { ...updatedTask, updatedAt: new Date().toISOString() };
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? finalTask : t));
    setEditingTask(null);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t));
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
    }
    setIsBreakingDown(false);
  };

  const addCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: Math.random().toString(36).substr(2, 5),
      name: newCatName,
      color: '#6366f1',
      icon: 'star'
    };
    setCategories([...categories, newCat]);
    setNewCatName('');
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
  };

  const clearFilters = () => {
    setFilter('ALL');
    setSelectedCategory('الكل');
    setSelectedPriority('ALL');
    setStartDate('');
    setEndDate('');
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

  const stats: TaskStats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
    pending: tasks.filter(t => t.status === TaskStatus.PENDING).length,
    inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
  }), [tasks]);

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-700 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header */}
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-3 bg-slate-100 dark:bg-slate-800 rounded-[1.2rem] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="9" y1="12" y2="12"/><line x1="21" x2="3" y1="18" y2="18"/></svg>
            </button>
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl animate-float transition-transform group-hover:scale-110">
                <Icons.CheckCircle />
              </div>
              <h1 className="text-2xl font-black tracking-tight hidden sm:block bg-gradient-to-l from-indigo-600 to-indigo-400 bg-clip-text text-transparent">مهام</h1>
            </div>
          </div>

          <div className="flex-1 max-w-xl mx-12 relative hidden md:block">
            <div className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-400 pointer-events-none"><Icons.Search /></div>
            <input 
              type="text" 
              placeholder="ابحث عن مهامك..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="w-full pr-14 pl-6 py-3.5 rounded-[1.5rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 outline-none focus:bg-white dark:focus:bg-slate-800 transition-all font-bold" 
            />
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowCategoryManager(true)} className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center shadow-md hover:scale-110 transition-all">
              <Icons.Folder />
            </button>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-12 h-12 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center shadow-md hover:scale-110 transition-all">
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
            
            <div className="animate-on-load group bg-indigo-600 dark:bg-indigo-900/40 border border-indigo-400/20 rounded-[3rem] p-8 flex items-center gap-8 shadow-2xl transition-all">
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
                  className={`px-10 py-4 rounded-[1.8rem] font-black transition-all duration-500 border-2 ${filter === st.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xl translate-y-[-2px]' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800'}`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            {/* Tasks Grid or Empty State */}
            {filteredTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
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
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-8 text-slate-300">
                   <Icons.Plus />
                </div>
                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 mb-4">قائمتك فارغة الآن</h3>
                <p className="text-slate-500 font-medium max-w-xs">ابدأ بإضافة مهمتك الأولى لتنظيم يومك وتحقيق إنجازاتك!</p>
                <button 
                  onClick={() => {setEditingTask(null); setShowForm(true);}}
                  className="mt-12 bg-indigo-600 text-white px-12 py-5 rounded-[2rem] font-black shadow-2xl hover:bg-indigo-700 transition-all active:scale-95"
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
        className="fixed bottom-10 left-10 w-20 h-20 bg-indigo-600 text-white rounded-[2rem] shadow-[0_20px_50px_rgba(79,70,229,0.3)] flex items-center justify-center transition-all hover:scale-110 z-40 border-8 border-slate-50 dark:border-slate-950"
      >
        <Icons.Plus />
      </button>

      {/* Category Manager */}
      {showCategoryManager && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl z-[60] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] w-full max-w-lg shadow-3xl animate-on-load border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-10">
              <div className="flex justify-between items-center mb-10">
                <button onClick={() => setShowCategoryManager(false)} className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-all">
                   <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
                <h2 className="text-2xl font-black tracking-tight">إدارة تصنيفاتك</h2>
              </div>
              <div className="space-y-6 mb-10">
                <input type="text" placeholder="اسم التصنيف الجديد..." value={newCatName} onChange={(e) => setNewCatName(e.target.value)} className="w-full px-8 py-5 rounded-[1.8rem] border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 outline-none focus:border-indigo-500 font-bold transition-all" />
                <button onClick={addCategory} className="w-full bg-indigo-600 text-white py-5 rounded-[1.8rem] font-black shadow-2xl transition-all">إضافة التصنيف الآن</button>
              </div>
              <div className="space-y-3 max-h-[300px] overflow-y-auto no-scrollbar border-t-2 pt-8 border-slate-50 dark:border-slate-800">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-4 rounded-[1.5rem] bg-slate-50 dark:bg-slate-800 border border-transparent hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 flex items-center justify-center rounded-[1.2rem] text-white shadow-lg" style={{ backgroundColor: cat.color }}>
                        {cat.icon && CategoryIconMap[cat.icon]}
                      </div>
                      <span className="font-bold text-lg">{cat.name}</span>
                    </div>
                    <button onClick={() => deleteCategory(cat.id)} className="text-red-400 p-3 hover:bg-red-50 dark:hover:bg-red-900 rounded-2xl transition-all">
                      <Icons.Trash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && <TaskForm onAdd={addTask} onUpdate={updateTask} onClose={() => setShowForm(false)} initialTask={editingTask} categories={categories} />}
    </div>
  );
};

export default App;
