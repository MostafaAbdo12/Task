
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, Category, User, TaskStatus } from './types';
import { Icons } from './constants';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import Settings from './components/Settings';
import CategoryManagement from './components/CategoryManagement';
import { storageService } from './services/storageService';
import { getSmartAdvice } from './services/geminiService';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'danger' | 'info';
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storageService.getSession());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [currentView, setCurrentView] = useState<'tasks' | 'settings' | 'categories'>('tasks');
  
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [smartAdvice, setSmartAdvice] = useState('جارِ تهيئة الأنظمة ...');
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'danger' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    const initData = async () => {
      if (currentUser) {
        try {
          const [t, c] = await Promise.all([
            storageService.getUserTasks(currentUser.username),
            storageService.getUserCategories(currentUser.username)
          ]);
          setTasks(t);
          setCategories(c);
          setSmartAdvice(await getSmartAdvice(t));
        } finally {
          setIsInitialLoading(false);
        }
      } else {
        setIsInitialLoading(false);
      }
    };
    initData();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      storageService.saveUserCategories(currentUser.username, categories);
    }
  }, [categories, currentUser]);

  useEffect(() => {
    if (currentUser) {
      storageService.saveUserTasks(currentUser.username, tasks);
    }
  }, [tasks, currentUser]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const pinned = tasks.filter(t => t.isPinned).length;
    const pending = tasks.filter(t => t.status !== TaskStatus.COMPLETED).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, pinned, pending, progress };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => (selectedCategory === 'الكل' || t.category === selectedCategory))
      .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));
  }, [tasks, selectedCategory, searchQuery]);

  const handleTaskAdd = (data: any) => {
    const newTask = { ...data, id: Date.now().toString() };
    setTasks([newTask, ...tasks]);
    addToast("تمت إضافة مهمة جديدة بنجاح", "success");
  };

  const handleTaskDelete = (id: string) => {
    setTasks(tasks.filter(x => x.id !== id));
    addToast("تم حذف المهمة نهائياً من سجلاتك", "danger");
  };

  const handleTaskCopy = (task: Task) => {
    const newTask = {...task, id: Date.now().toString(), createdAt: new Date().toISOString(), status: TaskStatus.PENDING};
    setTasks([newTask, ...tasks]);
    addToast("تم تكرار المهمة بنجاح", "success");
  };

  const handleStatusChange = (id: string, s: TaskStatus) => {
    setTasks(tasks.map(x => x.id === id ? {...x, status: s, updatedAt: new Date().toISOString()} : x));
    if (s === TaskStatus.COMPLETED) {
      addToast("تم إنجاز المهمة! عمل رائع", "success");
    } else {
      addToast("تم تحديث حالة المهمة", "info");
    }
  };

  const handleCategoryAdd = (cat: Category) => {
    setCategories([...categories, cat]);
    addToast(`تم تفعيل قطاع ${cat.name}`, "success");
  };

  const handleCategoryDelete = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    addToast("تمت إزالة القطاع", "info");
  };

  if (isInitialLoading) return <div className="h-screen flex items-center justify-center bg-[#020617]"><div className="w-12 h-12 border-4 border-nebula-purple border-t-transparent rounded-full animate-spin shadow-glow"></div></div>;
  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  // حساب المحيط الدقيق للدائرة: محيط الدائرة = 2 * ط * نصف القطر
  // نصف القطر المستخدم هنا هو 40 في إطار 100
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (stats.progress / 100) * circumference;

  const renderView = () => {
    switch (currentView) {
      case 'settings':
        return <Settings user={currentUser} onUpdate={setCurrentUser} showToast={addToast} />;
      case 'categories':
        return (
          <CategoryManagement 
            categories={categories} 
            onAdd={handleCategoryAdd}
            onUpdate={cat => {
              setCategories(categories.map(c => c.id === cat.id ? cat : c));
              addToast("تم تحديث بيانات القطاع", "success");
            }}
            onDelete={handleCategoryDelete}
            onAddTask={handleTaskAdd}
          />
        );
      default:
        return (
          <>
            {/* Dashboard Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard label="إجمالي المهام" count={stats.total} icon={<Icons.LayoutDashboard className="w-6 h-6" />} color="from-blue-600 to-indigo-500" glow="rgba(37, 99, 235, 0.3)" />
              <StatCard label="المنجزة" count={stats.completed} icon={<Icons.CheckCircle className="w-6 h-6" />} color="from-emerald-600 to-teal-500" glow="rgba(16, 185, 129, 0.3)" />
              <StatCard label="المثبتة" count={stats.pinned} icon={<Icons.Pin className="w-6 h-6" />} color="from-amber-500 to-orange-400" glow="rgba(245, 158, 11, 0.3)" />
              <StatCard label="قيد الانتظار" count={stats.pending} icon={<Icons.AlarmClock className="w-6 h-6" />} color="from-rose-600 to-pink-500" glow="rgba(225, 29, 72, 0.3)" />
            </div>

            {/* Redesigned Circular Progress - Precision Fix */}
            <div className="glass-panel border-white/5 rounded-[50px] p-10 mb-12 relative overflow-hidden group shadow-2xl">
               <div className="absolute top-0 right-0 w-64 h-64 bg-nebula-purple/5 blur-[100px] pointer-events-none"></div>
               
               <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
                  {/* Precise SVG Circular Progress */}
                  <div className="relative w-44 h-44 lg:w-48 lg:h-48 flex items-center justify-center shrink-0">
                    <svg 
                      viewBox="0 0 100 100" 
                      className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_15px_rgba(124,58,237,0.2)]"
                    >
                      {/* Background Track */}
                      <circle 
                        cx="50" cy="50" r={radius} 
                        stroke="rgba(255,255,255,0.03)" 
                        strokeWidth="8" 
                        fill="transparent" 
                      />
                      {/* Main Progress Stroke */}
                      <circle 
                        cx="50" cy="50" r={radius} 
                        stroke="url(#progressGradient)" 
                        strokeWidth="8" 
                        fill="transparent" 
                        strokeDasharray={circumference} 
                        strokeDashoffset={dashOffset} 
                        strokeLinecap="round" 
                        className="transition-all duration-1000 ease-out"
                      />
                      
                      <defs>
                        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#7c3aed" />
                          <stop offset="50%" stopColor="#3b82f6" />
                          <stop offset="100%" stopColor="#db2777" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Centered Stats Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-5xl font-black text-white glow-title leading-none">{stats.progress}%</span>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-3">إنجاز كلي</span>
                    </div>
                  </div>

                  {/* Insight and Advice Section */}
                  <div className="flex-1 w-full text-center lg:text-right">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
                       <div>
                         <h4 className="text-2xl font-black text-white tracking-tight mb-2">مستوى الكفاءة التشغيلية</h4>
                         <p className="text-slate-400 text-xs font-bold opacity-60">تحليل الأداء اللحظي بناءً على قاعدة البيانات</p>
                       </div>
                       <div className="flex items-center gap-3 bg-emerald-500/10 px-5 py-2 rounded-full border border-emerald-500/20 shadow-inner">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">تزامن نشط</span>
                       </div>
                    </div>
                    
                    {/* Linear Progress Bar Details */}
                    <div className="relative mb-8">
                      <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                         <div 
                           className="h-full bg-gradient-to-r from-nebula-purple to-nebula-blue rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                           style={{ width: `${stats.progress}%` }}
                         ></div>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 p-6 rounded-[30px] relative overflow-hidden group/advice">
                       <Icons.Sparkles className="absolute -left-2 -bottom-2 w-16 h-16 text-white/5 rotate-12 transition-transform group-hover/advice:scale-125 group-hover/advice:rotate-45" />
                       <p className="text-sm lg:text-base text-slate-300 font-bold italic leading-relaxed relative z-10">
                         "{smartAdvice}"
                       </p>
                    </div>
                  </div>
               </div>
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-10">
              {filteredTasks.length > 0 ? filteredTasks.map((t, i) => (
                <TaskCard 
                  key={t.id} task={t} index={i}
                  onDelete={handleTaskDelete}
                  onEdit={x => { setEditingTask(x); setShowForm(true); }}
                  onCopy={handleTaskCopy}
                  onStatusChange={handleStatusChange}
                  onTogglePin={id => {
                    const task = tasks.find(x => x.id === id);
                    setTasks(tasks.map(x => x.id === id ? {...x, isPinned: !x.isPinned} : x));
                    addToast(task?.isPinned ? "تم إلغاء تثبيت المهمة" : "تم تثبيت المهمة بنجاح", "info");
                  }}
                />
              )) : (
                <div className="col-span-full py-40 flex flex-col items-center justify-center text-center">
                   <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-slate-700 mb-6">
                      <Icons.LayoutDashboard className="w-12 h-12" />
                   </div>
                   <h3 className="text-xl font-black text-slate-500 tracking-[0.3em] uppercase">لا توجد مهام حالية</h3>
                   <p className="text-sm text-slate-600 mt-2 font-bold">ابدأ بإضافة مهمة جديدة لمتابعة إنجازاتك</p>
                </div>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div className="flex min-h-screen p-4 gap-4">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        categories={categories} 
        tasks={tasks}
        selectedCategory={selectedCategory}
        onCategorySelect={(cat) => { setSelectedCategory(cat); setCurrentView('tasks'); }}
        currentView={currentView}
        onViewChange={setCurrentView}
        user={currentUser}
        onLogout={() => { storageService.clearSession(); setCurrentUser(null); }}
        onManageCategories={() => setCurrentView('categories')}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 glass-panel rounded-[28px] px-8 flex items-center justify-between sticky top-4 z-50 mb-4 transition-all duration-500 border-white/5">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-nebula-blue p-2 hover:bg-white/5 rounded-xl"><Icons.LayoutDashboard className="w-6 h-6" /></button>
            <h2 className="text-xl font-black tracking-tight text-white glow-title uppercase">
              {currentView === 'tasks' ? 'مركز القيادة' : currentView === 'settings' ? 'تكوين الهوية' : 'إدارة القطاعات'}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
             {currentView === 'tasks' && (
               <div className="relative hidden md:block">
                  <input 
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="ابحث في المهام..." 
                    className="bg-white/5 border border-white/10 rounded-2xl py-2 pr-10 pl-4 text-xs font-bold outline-none focus:border-nebula-purple transition-all w-64 text-white"
                  />
                  <Icons.Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               </div>
             )}
             <button 
              onClick={() => { setEditingTask(null); setShowForm(true); }} 
              className="bg-gradient-to-r from-nebula-purple to-nebula-blue text-white text-[11px] font-black px-6 py-3 rounded-2xl hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(124,58,237,0.3)]"
             >
               + إضافة مهمة
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar pt-2 pb-20">
          <div className="max-w-7xl mx-auto px-4 lg:px-10">
            {renderView()}
          </div>
        </div>
      </main>

      {showForm && (
        <TaskForm 
          onAdd={handleTaskAdd} 
          onUpdate={task => {
            setTasks(tasks.map(t => t.id === task.id ? task : t)); 
            setShowForm(false);
            addToast("تم تحديث بيانات المهمة", "success");
          }} 
          onClose={() => setShowForm(false)} 
          categories={categories} 
          initialTask={editingTask} 
          onManageCategories={() => setCurrentView('categories')} 
        />
      )}

      {/* Real-time Toast Notifications Container */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`flex items-center gap-4 px-6 py-4 rounded-2xl glass-panel border shadow-2xl animate-in slide-in-from-left duration-500
              ${toast.type === 'success' ? 'border-emerald-500/30 text-emerald-400' : 
                toast.type === 'danger' ? 'border-rose-500/30 text-rose-400' : 
                'border-nebula-blue/30 text-nebula-blue'}
            `}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-white/5`}>
              {toast.type === 'success' ? <Icons.CheckCircle className="w-5 h-5" /> :
               toast.type === 'danger' ? <Icons.Trash className="w-5 h-5" /> :
               <Icons.Sparkles className="w-5 h-5" />}
            </div>
            <p className="text-sm font-black tracking-tight">{toast.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  count: number;
  icon: React.ReactNode;
  color: string;
  glow: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, count, icon, color, glow }) => (
  <div className="nebula-card p-6 flex items-center gap-6 group relative overflow-hidden" style={{ boxShadow: `0 0 20px ${glow}` }}>
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${color} flex items-center justify-center text-white shrink-0 shadow-lg group-hover:rotate-12 transition-transform duration-500`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0 text-right">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <h5 className="text-3xl font-black text-white">{count}</h5>
    </div>
  </div>
);

export default App;
