
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Task, TaskStatus, Category, User } from './types';
import { Icons, DEFAULT_CATEGORIES } from './constants';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import CategoryModal from './components/CategoryModal';
import { getSmartAdvice } from './services/geminiService';
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('maham_active_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error("Failed to parse session", e);
      return null;
    }
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem('maham_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch (e) {
      return DEFAULT_CATEGORIES;
    }
  });
  
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [showForm, setShowForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [systemAdvice, setSystemAdvice] = useState('تحليل الأداء جارٍ...');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  
  const reminderIntervalRef = useRef<number | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  }, []);

  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (e) {
        console.warn("Notification permission error", e);
      }
    }
  }, []);

  const sendNotification = useCallback((task: Task) => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    
    try {
      new Notification("تذكير بمهمة: " + task.title, {
        body: task.description || "اقترب موعد تنفيذ هذه المهمة.",
        icon: "/favicon.ico", 
        dir: 'rtl',
        lang: 'ar'
      });
    } catch (e) {
      console.error("Notification failed", e);
    }
  }, []);

  const checkReminders = useCallback(() => {
    const now = new Date();
    let hasUpdates = false;
    
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.status !== TaskStatus.COMPLETED && task.reminderAt && !task.reminderFired) {
          const reminderDate = new Date(task.reminderAt);
          if (reminderDate <= now) {
            sendNotification(task);
            hasUpdates = true;
            return { ...task, reminderFired: true };
          }
        }
        return task;
      });
      
      return hasUpdates ? updatedTasks : prevTasks;
    });
  }, [sendNotification]);

  useEffect(() => {
    const authStatus = sessionStorage.getItem('auth_success_msg');
    if (authStatus && currentUser) {
      showToast(authStatus);
      sessionStorage.removeItem('auth_success_msg');
      requestNotificationPermission();
    }
  }, [currentUser, showToast, requestNotificationPermission]);

  useEffect(() => {
    if (currentUser) {
      try {
        const savedTasks = localStorage.getItem(`tasks_${currentUser.username}`);
        if (savedTasks) setTasks(JSON.parse(savedTasks));
      } catch (e) {
        console.error("Failed to load tasks", e);
      }
      
      const refreshAdvice = async () => {
        try {
          const advice = await getSmartAdvice(tasks);
          setSystemAdvice(advice);
        } catch (e) {
          setSystemAdvice("النظام جاهز للعمل.");
        }
      };
      refreshAdvice();
      setTimeout(() => setIsLoaded(true), 500);

      reminderIntervalRef.current = window.setInterval(checkReminders, 60000);
      checkReminders();
    }

    return () => {
      if (reminderIntervalRef.current) clearInterval(reminderIntervalRef.current);
    };
  }, [currentUser, checkReminders]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`tasks_${currentUser.username}`, JSON.stringify(tasks));
      localStorage.setItem('maham_active_session', JSON.stringify(currentUser));
    }
  }, [tasks, currentUser]);

  useEffect(() => {
    localStorage.setItem('maham_categories', JSON.stringify(categories));
  }, [categories]);

  const handleStatusChange = (id: string, status: TaskStatus) => {
    setTasks(prev => {
      const newTasks = prev.map(t => t.id === id ? { ...t, status } : t);
      if (status === TaskStatus.COMPLETED) {
        try {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#2563eb', '#10b981', '#ffffff']
          });
        } catch (e) {}
        showToast("تم انجاز مهامك بنجاح");
      }
      return newTasks;
    });
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => (selectedCategory === 'الكل' || t.category === selectedCategory))
      .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));
  }, [tasks, selectedCategory, searchQuery]);

  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  return (
    <div className={`h-screen w-full flex bg-corp-bg transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      
      {toast.visible && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[1000] animate-slide-in">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-500/50">
            <Icons.CheckCircle className="w-5 h-5" />
            <span className="text-sm font-bold">{toast.message}</span>
          </div>
        </div>
      )}

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        user={currentUser}
        onLogout={() => { localStorage.removeItem('maham_active_session'); setCurrentUser(null); }}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden p-6 lg:p-10 relative">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 transition-all">
               <Icons.Chevron className="w-5 h-5 rotate-90" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight glowing-text">مهام | نظرة عامة</h1>
              <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">إدارة الإنتاجية والنتائج</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative flex-1 md:w-80 group">
                <Icons.Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن مهمة أو مشروع..."
                  className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pr-12 pl-6 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-corp-accent transition-all shadow-sm"
                />
             </div>
             <div className="flex gap-3">
               <button 
                  onClick={() => setShowCategoryModal(true)}
                  className="p-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center"
                  title="إدارة التصنيفات"
                >
                  <Icons.Folder className="w-6 h-6" />
                </button>
               <button 
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-3 bg-corp-accent text-white px-6 py-3.5 rounded-2xl text-[13px] font-black shadow-[0_15px_30px_-10px_rgba(37,99,235,0.4)] hover:brightness-110 active:scale-95 transition-all animate-gentle-pulse"
                >
                  <Icons.Plus className="w-5 h-5" />
                  <span>إضافة مهمة</span>
                </button>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-10 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="p-8 rounded-[32px] bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white border-none shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-125 duration-700">
                  <Icons.Folder className="w-20 h-20" />
                </div>
                <p className="text-[10px] font-black opacity-60 mb-3 uppercase tracking-[0.2em] relative z-10">إجمالي العمليات</p>
                <p className="text-4xl font-black relative z-10">{tasks.length}</p>
             </div>
             {[
               { label: 'مكتملة', val: tasks.filter(t => t.status === TaskStatus.COMPLETED).length, color: 'text-emerald-600', icon: <Icons.CheckCircle /> },
               { label: 'نشطة', val: tasks.filter(t => t.status !== TaskStatus.COMPLETED).length, color: 'text-blue-600', icon: <Icons.LayoutDashboard /> },
               { label: 'التوجيه الذكي', val: systemAdvice, color: 'text-slate-800', isAdvice: true, icon: <Icons.Sparkles /> }
             ].map((stat, i) => (
               <div key={i} className={`p-8 rounded-[32px] bg-white border border-slate-100 flex flex-col justify-center shadow-sm hover:shadow-md transition-shadow ${stat.isAdvice ? 'md:col-span-2' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`${stat.color} opacity-40 scale-75`}>{stat.icon}</div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                  </div>
                  <p className={`text-xl font-black truncate ${stat.color}`}>{stat.val}</p>
               </div>
             ))}
          </div>

          <div>
            <div className="flex items-center justify-between mb-8 px-2">
               <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                 <span>سجل العمليات والمهام</span>
               </h2>
               <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">آخر تحديث: {new Date().toLocaleTimeString('ar-EG')}</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, idx) => (
                  <TaskCard 
                    key={task.id}
                    task={task}
                    index={idx}
                    onDelete={id => setTasks(tasks.filter(t => t.id !== id))}
                    onEdit={t => { setEditingTask(t); setShowForm(true); }}
                    onStatusChange={handleStatusChange}
                    onTogglePin={id => setTasks(tasks.map(t => t.id === id ? {...t, isPinned: !t.isPinned} : t))}
                  />
                ))
              ) : (
                <div className="col-span-full py-24 bg-white border border-dashed border-slate-200 rounded-[40px] flex flex-col items-center text-center shadow-sm">
                   <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mb-6 shadow-inner">
                      <Icons.Folder className="w-10 h-10 text-slate-200" />
                   </div>
                   <h3 className="text-xl font-black text-slate-400">نظامك خالي من المهام</h3>
                   <p className="text-[13px] font-bold text-slate-300 mt-2">ابدأ بإدراج مهمة جديدة لضبط جدول أعمالك.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showForm && (
        <TaskForm 
          onAdd={data => { 
            setTasks([{...data, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}, ...tasks]); 
            setShowForm(false); 
            showToast("تم إضافة مهامك بنجاح");
          }}
          onUpdate={task => { 
            setTasks(tasks.map(t => t.id === task.id ? {...task, updatedAt: new Date().toISOString(), reminderFired: false} : t)); 
            setShowForm(false); 
            setEditingTask(null); 
          }}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
          onManageCategories={() => setShowCategoryModal(true)}
          initialTask={editingTask}
          categories={categories}
        />
      )}

      {showCategoryModal && (
        <CategoryModal
          categories={categories}
          onAdd={cat => {
            setCategories([...categories, cat]);
            showToast("تم إضافة التصنيف الجديد بنجاح");
          }}
          onUpdate={updatedCat => {
            setCategories(categories.map(c => c.id === updatedCat.id ? updatedCat : c));
            showToast("تم تحديث التصنيف بنجاح");
          }}
          onDelete={id => {
            setCategories(categories.filter(c => c.id !== id));
            showToast("تم حذف التصنيف");
          }}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
    </div>
  );
};

export default App;
