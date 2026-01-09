
import React, { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus, Category, User } from './types';
import { Icons, DEFAULT_CATEGORIES } from './constants';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Sidebar from './components/Sidebar';
import CategoryModal from './components/CategoryModal';
import Auth from './components/Auth';
import { getSmartAdvice, getSmartSubtasks } from './services/geminiService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('maham_active_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [aiAdvice, setAiAdvice] = useState('نظام الذكاء الاصطناعي متصل...');
  const [toast, setToast] = useState<{ msg: string, type: string } | null>(null);

  // تحميل البيانات عند تسجيل الدخول
  useEffect(() => {
    if (currentUser) {
      const savedTasks = localStorage.getItem(`tasks_${currentUser.username}`);
      const savedCats = localStorage.getItem(`categories_${currentUser.username}`);
      
      setTasks(savedTasks ? JSON.parse(savedTasks) : []);
      setCategories(savedCats ? JSON.parse(savedCats) : DEFAULT_CATEGORIES);
      localStorage.setItem('maham_active_session', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('maham_active_session');
    }
  }, [currentUser]);

  // حفظ البيانات عند التغيير
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`tasks_${currentUser.username}`, JSON.stringify(tasks));
      if (tasks.length > 0) updateAiAdvice();
    }
  }, [tasks, currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`categories_${currentUser.username}`, JSON.stringify(categories));
    }
  }, [categories, currentUser]);

  // طلب إذن الإشعارات
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // مراقب التنبيهات الذكي
  useEffect(() => {
    if (!currentUser) return;
    
    const checkReminders = () => {
      const now = new Date();
      let updated = false;
      const newTasks = tasks.map(task => {
        if (task.reminderAt && !task.reminderFired && task.status !== TaskStatus.COMPLETED) {
          const reminderTime = new Date(task.reminderAt);
          if (now >= reminderTime) {
            triggerReminder(task);
            updated = true;
            return { ...task, reminderFired: true };
          }
        }
        return task;
      });

      if (updated) setTasks(newTasks);
    };

    const interval = setInterval(checkReminders, 15000);
    return () => clearInterval(interval);
  }, [tasks, currentUser]);

  const triggerReminder = (task: Task) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("تذكير من نظام مهام", { body: task.title });
    }
    showNotification(`تنبيه المهمة: ${task.title}`, 'urgent');
  };

  const updateAiAdvice = async () => {
    const advice = await getSmartAdvice(tasks);
    setAiAdvice(advice);
  };

  const showNotification = (msg: string, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setTasks([]);
    setCategories(DEFAULT_CATEGORIES);
    setSelectedCategory('الكل');
    showNotification('تم إنهاء الجلسة بنجاح');
  };

  const handleCopyTask = (task: Task) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      title: `${task.title} (نسخة)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      status: TaskStatus.PENDING,
      reminderFired: false
    };
    setTasks([newTask, ...tasks]);
    showNotification('تم استنساخ المهمة بنجاح');
  };

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
    percent: tasks.length ? Math.round((tasks.filter(t => t.status === TaskStatus.COMPLETED).length / tasks.length) * 100) : 0
  }), [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const matchesStatus = filter === 'ALL' || t.status === filter;
      const matchesCategory = selectedCategory === 'الكل' || t.category === selectedCategory;
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    }).sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));
  }, [tasks, filter, selectedCategory, searchQuery]);

  if (!currentUser) {
    return <Auth onLogin={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-cyber-black text-white overflow-hidden selection:bg-cyber-blue selection:text-black animate-fade-in">
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        onManageCategories={() => setShowCatModal(true)}
        user={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 h-screen overflow-y-auto no-scrollbar relative">
        <header className="sticky top-0 z-40 bg-cyber-black/80 backdrop-blur-xl border-b border-white/5 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:text-cyber-blue transition-colors lg:hidden">
              <Icons.Folder />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tighter neon-text flex items-center gap-3">
                <span className="w-2 h-8 bg-cyber-blue rounded-full"></span>
                قاعدة بيانات {currentUser.username}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button onClick={() => setShowForm(true)} className="bg-cyber-blue text-black font-black px-6 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(0,210,255,0.3)] flex items-center gap-2">
              <Icons.Plus /> إضافة مهمة
            </button>
          </div>
        </header>

        <div className="p-8 lg:p-12 space-y-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 cyber-card rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 border-l-4 border-l-cyber-purple">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyber-blue to-cyber-purple animate-pulse-neon flex items-center justify-center relative z-10">
                  <Icons.Sparkles />
                </div>
              </div>
              <div className="flex-1 text-center md:text-right">
                <p className="text-xs font-black text-cyber-purple uppercase tracking-[0.3em] mb-2">توصية الذكاء الاصطناعي</p>
                <h3 className="text-lg md:text-xl font-bold leading-relaxed text-slate-200">"{aiAdvice}"</h3>
              </div>
            </div>

            <div className="cyber-card rounded-3xl p-8 flex flex-col justify-center items-center text-center border-t-4 border-t-cyber-blue">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">كفاءة الإنجاز</p>
              <div className="text-5xl font-black neon-text mb-2">{stats.percent}%</div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-cyber-blue transition-all duration-1000" style={{ width: `${stats.percent}%` }}></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white/5 p-4 rounded-3xl border border-white/5">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
              {['ALL', TaskStatus.PENDING, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED].map(s => (
                <button 
                  key={s} 
                  onClick={() => setFilter(s as any)}
                  className={`px-6 py-2 rounded-2xl text-xs font-black transition-all whitespace-nowrap ${filter === s ? 'active-cyber' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  {s === 'ALL' ? 'جميع الملفات' : s === 'PENDING' ? 'في الانتظار' : s === 'IN_PROGRESS' ? 'تحت المعالجة' : 'المهام المؤرشفة'}
                </button>
              ))}
            </div>
            <div className="relative w-full md:w-80 group">
              <input 
                type="text" 
                placeholder="ابحث في السجلات..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-cyber-black/50 border border-white/10 rounded-2xl py-2.5 px-10 outline-none focus:border-cyber-blue transition-all font-bold text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-cyber-blue"><Icons.Search /></span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-24">
            {filteredTasks.map((task, idx) => (
              <TaskCard 
                key={task.id}
                task={task}
                index={idx}
                onDelete={(id) => setTasks(tasks.filter(t => t.id !== id))}
                onEdit={(t) => { setEditingTask(t); setShowForm(true); }}
                onCopy={handleCopyTask}
                onStatusChange={(id, status) => setTasks(tasks.map(t => t.id === id ? {...t, status} : t))}
                onTogglePin={(id) => setTasks(tasks.map(t => t.id === id ? {...t, isPinned: !t.isPinned} : t))}
                onBreakdown={async (task) => {
                  showNotification('جاري التحليل الرقمي...', 'info');
                  const subs = await getSmartSubtasks(task.title, task.description);
                  if (subs.length > 0) {
                    const newSubs = subs.map(s => ({ id: Math.random().toString(), title: s, isCompleted: false }));
                    setTasks(tasks.map(t => t.id === task.id ? {...t, subTasks: [...t.subTasks, ...newSubs]} : t));
                    showNotification('تم تفكيك المهمة بنجاح');
                  }
                }}
                onToggleSubtask={(tid, sid) => {
                  setTasks(tasks.map(t => t.id === tid ? {
                    ...t, subTasks: t.subTasks.map(s => s.id === sid ? {...s, isCompleted: !s.isCompleted} : s)
                  } : t));
                }}
              />
            ))}
          </div>
        </div>
      </main>

      {showForm && (
        <TaskForm 
          onAdd={(data) => {
            const newTask = {...data, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()};
            setTasks([newTask, ...tasks]);
            setShowForm(false);
            showNotification('تم تسجيل البيانات بنجاح');
          }}
          onUpdate={(task) => {
            setTasks(tasks.map(t => t.id === task.id ? task : t));
            setEditingTask(null);
            setShowForm(false);
          }}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
          initialTask={editingTask}
          categories={categories}
        />
      )}

      {showCatModal && (
        <CategoryModal 
          categories={categories}
          onAdd={(c) => setCategories([...categories, c])}
          onDelete={(id) => setCategories(categories.filter(c => c.id !== id))}
          onClose={() => setShowCatModal(false)}
        />
      )}

      {toast && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] ${toast.type === 'urgent' ? 'animate-bounce' : 'animate-glitch'}`}>
          <div className={`px-8 py-3 rounded-full font-black text-sm shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center gap-3 ${
            toast.type === 'urgent' ? 'bg-cyber-rose text-white' : 'bg-cyber-blue text-black'
          }`}>
            {toast.msg}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
