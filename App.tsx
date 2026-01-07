
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, TaskStatus, TaskPriority, TaskStats } from './types';
import { Icons, CATEGORIES, PRIORITY_LABELS } from './constants';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import { getSmartSubtasks, getSmartAdvice } from './services/geminiService';

const App: React.FC = () => {
  // --- Persisted States from LocalStorage ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('enjaz_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [filter, setFilter] = useState<TaskStatus | 'ALL'>(() => {
    return (localStorage.getItem('enjaz_filter_status') as any) || 'ALL';
  });

  const [selectedCategory, setSelectedCategory] = useState<string>(() => {
    return localStorage.getItem('enjaz_filter_category') || 'الكل';
  });

  const [selectedPriority, setSelectedPriority] = useState<TaskPriority | 'ALL'>(() => {
    return (localStorage.getItem('enjaz_filter_priority') as any) || 'ALL';
  });

  const [searchQuery, setSearchQuery] = useState(() => {
    return localStorage.getItem('enjaz_filter_search') || '';
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('enjaz_dark_mode') === 'true';
  });

  const [showDateFilters, setShowDateFilters] = useState(() => {
    return localStorage.getItem('enjaz_show_date_filters') === 'true';
  });

  const [startDate, setStartDate] = useState(() => localStorage.getItem('enjaz_filter_start_date') || '');
  const [endDate, setEndDate] = useState(() => localStorage.getItem('enjaz_filter_end_date') || '');
  const [dateFilterType, setDateFilterType] = useState<'createdAt' | 'dueDate'>(() => {
    return (localStorage.getItem('enjaz_date_filter_type') as any) || 'dueDate';
  });

  // --- UI States ---
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [aiAdvice, setAiAdvice] = useState('جاري تحليل مهامك...');
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects for Persistence ---
  useEffect(() => {
    localStorage.setItem('enjaz_tasks', JSON.stringify(tasks));
    checkDeadlines();
    fetchAdvice();
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('enjaz_filter_status', filter);
    localStorage.setItem('enjaz_filter_category', selectedCategory);
    localStorage.setItem('enjaz_filter_priority', selectedPriority);
    localStorage.setItem('enjaz_filter_search', searchQuery);
    localStorage.setItem('enjaz_dark_mode', isDarkMode.toString());
    localStorage.setItem('enjaz_show_date_filters', showDateFilters.toString());
    localStorage.setItem('enjaz_filter_start_date', startDate);
    localStorage.setItem('enjaz_filter_end_date', endDate);
    localStorage.setItem('enjaz_date_filter_type', dateFilterType);

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [filter, selectedCategory, selectedPriority, searchQuery, isDarkMode, showDateFilters, startDate, endDate, dateFilterType]);

  // --- Browser Notifications Setup ---
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const fetchAdvice = async () => {
    if (tasks.length === 0) {
      setAiAdvice("أهلاً بك! ابدأ بإضافة مهمتك الأولى لتنظيم يومك.");
      return;
    }
    const advice = await getSmartAdvice(tasks);
    setAiAdvice(advice);
  };

  const checkDeadlines = () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const now = new Date();
    tasks.forEach(task => {
      if (task.status === TaskStatus.COMPLETED || !task.dueDate) return;
      const dueDate = new Date(task.dueDate);
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      if (diffDays > 0 && diffDays <= 1) {
        const notifiedKey = `notified_${task.id}_${task.dueDate}`;
        if (!sessionStorage.getItem(notifiedKey)) {
          new Notification('تنبيه موعد إنجاز', {
            body: `المهمة "${task.title}" تقترب من موعد استحقاقها!`,
            icon: 'https://cdn-icons-png.flaticon.com/512/190/190411.png'
          });
          sessionStorage.setItem(notifiedKey, 'true');
        }
      }
    });
  };

  // --- Actions ---
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
    const finalTask = {
      ...updatedTask,
      updatedAt: new Date().toISOString()
    };
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

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newTasks: Task[] = [];
      const timestamp = new Date().toISOString();
      
      lines.slice(1).forEach(line => {
        const parts = line.split(',').map(s => s.trim());
        if (parts.length >= 1 && parts[0]) {
          const [title, desc, cat, prio, date] = parts;
          newTasks.push({
            id: Math.random().toString(36).substr(2, 9),
            title,
            description: desc || '',
            category: CATEGORIES.includes(cat) ? cat : CATEGORIES[0],
            priority: (prio as any) || TaskPriority.MEDIUM,
            color: '#6366f1',
            dueDate: date || '',
            status: TaskStatus.PENDING,
            subTasks: [],
            isPinned: false,
            createdAt: timestamp,
            updatedAt: timestamp
          });
        }
      });
      setTasks(prev => [...newTasks, ...prev]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  // --- Derived State & Sorting ---
  const filteredTasks = useMemo(() => {
    const list = tasks.filter(t => {
      const matchesStatus = filter === 'ALL' || t.status === filter;
      const matchesCategory = selectedCategory === 'الكل' || t.category === selectedCategory;
      const matchesPriority = selectedPriority === 'ALL' || t.priority === selectedPriority;
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesDate = true;
      const targetDateStr = dateFilterType === 'createdAt' ? t.createdAt : t.dueDate;
      if (targetDateStr) {
        const targetDate = new Date(targetDateStr).setHours(0, 0, 0, 0);
        if (startDate) {
          const start = new Date(startDate).setHours(0, 0, 0, 0);
          if (targetDate < start) matchesDate = false;
        }
        if (endDate) {
          const end = new Date(endDate).setHours(0, 0, 0, 0);
          if (targetDate > end) matchesDate = false;
        }
      } else if (startDate || endDate) {
        matchesDate = false;
      }
      return matchesStatus && matchesCategory && matchesPriority && matchesSearch && matchesDate;
    });

    return [...list].sort((a, b) => {
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
    <div className={`min-h-screen pb-20 transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-500">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 group cursor-default">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 dark:shadow-indigo-900/20 transition-transform group-hover:scale-110 duration-500">
                <Icons.CheckCircle />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight transition-colors group-hover:text-indigo-600">إنجاز</h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">نظام إدارة المهام الذكي</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex flex-col items-center px-4 py-1 border-l border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">الإجمالي</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{stats.total}</span>
                </div>
                <div className="flex flex-col items-center px-4 py-1 border-l border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">مكتمل</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{stats.completed}</span>
                </div>
                <div className="flex flex-col items-center px-4 py-1">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">قيد العمل</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{stats.inProgress}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-11 h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                  title="استيراد CSV"
                >
                  <Icons.FileUp />
                  <input type="file" accept=".csv" ref={fileInputRef} onChange={handleCsvImport} className="hidden" />
                </button>
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="w-11 h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                  title={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"}
                >
                  {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-4 mb-8 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow cursor-default">
          <div className="bg-white dark:bg-slate-800 p-2 rounded-lg text-indigo-600 dark:text-indigo-400 shadow-sm shrink-0 animate-pulse-subtle">
            <Icons.Sparkles />
          </div>
          <div>
            <h4 className="text-indigo-900 dark:text-indigo-200 font-bold text-sm mb-0.5">مساعد إنجاز الذكي</h4>
            <p className="text-indigo-700/80 dark:text-indigo-400/80 text-sm leading-relaxed">{aiAdvice}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-600 transition-colors group-focus-within:text-indigo-500">
                <Icons.Search />
              </div>
              <input 
                type="text" 
                placeholder="ابحث عن مهمة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm outline-none transition-all"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
              {['ALL', TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED].map((st) => (
                <button 
                  key={st}
                  onClick={() => setFilter(st as any)}
                  className={`px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all duration-300 transform active:scale-95 ${
                    filter === st 
                      ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-lg -translate-y-1' 
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {st === 'ALL' ? 'الكل' : st === TaskStatus.PENDING ? 'انتظار' : st === TaskStatus.IN_PROGRESS ? 'تنفيذ' : 'مكتمل'}
                </button>
              ))}
              <button 
                onClick={() => setShowDateFilters(!showDateFilters)}
                className={`px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all duration-300 transform active:scale-95 flex items-center gap-2 ${
                  showDateFilters || startDate || endDate
                    ? 'bg-indigo-600 text-white shadow-lg -translate-y-1' 
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icons.Calendar />
                التاريخ
              </button>
            </div>
          </div>

          {showDateFilters && (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in slide-in-from-top-4 duration-300">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-500 mb-1 mr-1">نوع التاريخ</label>
                  <select 
                    value={dateFilterType}
                    onChange={(e) => setDateFilterType(e.target.value as any)}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                  >
                    <option value="dueDate">تاريخ الاستحقاق</option>
                    <option value="createdAt">تاريخ الإنشاء</option>
                  </select>
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-bold text-slate-500 mb-1">من</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none text-sm" />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-bold text-slate-500 mb-1">إلى</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none text-sm" />
                </div>
                <button onClick={() => { setStartDate(''); setEndDate(''); }} className="px-6 py-2 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors h-[42px]">مسح</button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4 flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 mr-2 uppercase tracking-widest">الأولوية</label>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button onClick={() => setSelectedPriority('ALL')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${selectedPriority === 'ALL' ? 'bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-900 shadow-md' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800'}`}>الكل</button>
            {Object.keys(PRIORITY_LABELS).map((pKey) => (
              <button key={pKey} onClick={() => setSelectedPriority(pKey as TaskPriority)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${selectedPriority === pKey ? `${PRIORITY_LABELS[pKey].color} border-current shadow-sm scale-105` : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800'}`}>{PRIORITY_LABELS[pKey].label}</button>
            ))}
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-600 mr-2 uppercase tracking-widest">التصنيف</label>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button onClick={() => setSelectedCategory('الكل')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === 'الكل' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800'}`}>الكل</button>
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800'}`}>{cat}</button>
            ))}
          </div>
        </div>

        {filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} onDelete={deleteTask} onEdit={startEditing} onStatusChange={updateTaskStatus} onToggleSubtask={toggleSubtask} onBreakdown={handleSmartBreakdown} onTogglePin={togglePin} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-700">
              <Icons.Search />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">لا توجد مهام حالياً</h3>
            <p className="text-slate-500 dark:text-slate-400">جرب تغيير الفلتر أو أضف مهمة جديدة للبدء</p>
          </div>
        )}
      </main>

      <button onClick={() => setShowForm(true)} className="fixed bottom-8 left-8 w-16 h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90 z-40 group">
        <Icons.Plus />
        <span className="absolute right-full mr-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-lg">إضافة مهمة جديدة</span>
      </button>

      {isBreakingDown && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl flex flex-col items-center gap-4 text-center shadow-2xl border dark:border-slate-800">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-indigo-600 animate-pulse"><Icons.Sparkles /></div>
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">جاري التحليل الذكي...</h3>
          </div>
        </div>
      )}

      {showForm && <TaskForm onAdd={addTask} onUpdate={updateTask} onClose={closeForm} initialTask={editingTask} />}
    </div>
  );
};

export default App;
