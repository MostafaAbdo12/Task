
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, TaskStatus, TaskPriority, TaskStats } from './types';
import { Icons, CATEGORIES, PRIORITY_LABELS } from './constants';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import { getSmartSubtasks, getSmartAdvice } from './services/geminiService';

const App: React.FC = () => {
  // --- التحميل من التخزين المحلي ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('enjaz_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
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

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [aiAdvice, setAiAdvice] = useState('جاري تحليل مهامك...');
  const [isBreakingDown, setIsBreakingDown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- حفظ الإعدادات والمهام ---
  useEffect(() => {
    localStorage.setItem('enjaz_tasks', JSON.stringify(tasks));
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

  const fetchAdvice = async () => {
    if (tasks.length === 0) {
      setAiAdvice("أهلاً بك في إنجاز! ابدأ بإضافة مهمتك الأولى لتنظيم يومك بذكاء.");
      return;
    }
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
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filteredTasks = useMemo(() => {
    const list = tasks.filter(t => {
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
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg"><Icons.CheckCircle /></div>
              <div>
                <h1 className="text-2xl font-black tracking-tight">إنجاز</h1>
                <p className="text-slate-500 text-xs font-medium">إدارة مهام ذكية</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                <div className="flex flex-col items-center px-4 py-1 border-l dark:border-slate-700">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">الإجمالي</span>
                  <span className="font-bold">{stats.total}</span>
                </div>
                <div className="flex flex-col items-center px-4 py-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">مكتمل</span>
                  <span className="font-bold text-green-600">{stats.completed}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="w-11 h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center shadow-sm" title="استيراد CSV">
                  <Icons.FileUp />
                  <input type="file" accept=".csv" ref={fileInputRef} onChange={handleCsvImport} className="hidden" />
                </button>
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="w-11 h-11 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center shadow-sm">
                  {isDarkMode ? <Icons.Sun /> : <Icons.Moon />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 mt-8">
        <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-4 mb-8 flex items-start gap-4">
          <div className="bg-white dark:bg-slate-800 p-2 rounded-lg text-indigo-600 dark:text-indigo-400 animate-pulse-subtle"><Icons.Sparkles /></div>
          <div>
            <h4 className="text-indigo-900 dark:text-indigo-200 font-bold text-sm mb-0.5">مساعد إنجاز</h4>
            <p className="text-indigo-700/80 dark:text-indigo-400/80 text-sm">{aiAdvice}</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"><Icons.Search /></div>
              <input type="text" placeholder="ابحث عن مهمة..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pr-10 pl-4 py-3 rounded-xl border dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {['ALL', TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED].map((st) => (
                <button key={st} onClick={() => setFilter(st as any)} className={`px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all ${filter === st ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-600 border dark:border-slate-800'}`}>
                  {st === 'ALL' ? 'الكل' : st === TaskStatus.PENDING ? 'انتظار' : st === TaskStatus.IN_PROGRESS ? 'تنفيذ' : 'مكتمل'}
                </button>
              ))}
              <button onClick={() => setShowDateFilters(!showDateFilters)} className={`px-5 py-3 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${showDateFilters || startDate || endDate ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-600 border dark:border-slate-800'}`}>
                <Icons.Calendar /> التاريخ
              </button>
            </div>
          </div>

          {showDateFilters && (
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 shadow-sm animate-in slide-in-from-top-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-bold text-slate-500 mb-1">من</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
                </div>
                <div className="flex-1 min-w-[150px]">
                  <label className="block text-xs font-bold text-slate-500 mb-1">إلى</label>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 rounded-lg border dark:border-slate-700 bg-white dark:bg-slate-800 outline-none text-sm" />
                </div>
                <button onClick={() => { setStartDate(''); setEndDate(''); }} className="px-6 py-2 rounded-lg text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">مسح</button>
              </div>
            </div>
          )}
        </div>

        <div className="mb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            <button onClick={() => setSelectedPriority('ALL')} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${selectedPriority === 'ALL' ? 'bg-slate-900 dark:bg-slate-200 text-white dark:text-slate-900' : 'bg-white dark:bg-slate-900 text-slate-500'}`}>الكل</button>
            {Object.keys(PRIORITY_LABELS).map((pKey) => (
              <button key={pKey} onClick={() => setSelectedPriority(pKey as TaskPriority)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all border ${selectedPriority === pKey ? `${PRIORITY_LABELS[pKey].color} border-current` : 'bg-white dark:bg-slate-900 text-slate-500'}`}>{PRIORITY_LABELS[pKey].label}</button>
            ))}
          </div>
        </div>

        {filteredTasks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} onDelete={deleteTask} onEdit={(t) => {setEditingTask(t); setShowForm(true);}} onStatusChange={updateTaskStatus} onToggleSubtask={toggleSubtask} onBreakdown={handleSmartBreakdown} onTogglePin={togglePin} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">لا توجد مهام حالياً</h3>
            <p className="text-slate-500">ابدأ بإضافة مهمة جديدة اليوم</p>
          </div>
        )}
      </main>

      <button onClick={() => {setEditingTask(null); setShowForm(true);}} className="fixed bottom-8 left-8 w-16 h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40">
        <Icons.Plus />
      </button>

      {isBreakingDown && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl flex flex-col items-center gap-4 border dark:border-slate-800">
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">جاري التحليل الذكي...</h3>
          </div>
        </div>
      )}

      {showForm && <TaskForm onAdd={addTask} onUpdate={updateTask} onClose={() => setShowForm(false)} initialTask={editingTask} />}
    </div>
  );
};

export default App;
