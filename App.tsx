
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  const [smartAdvice, setSmartAdvice] = useState('جارِ تحليل مسارك الإنتاجي...');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    
    let statusLabel = "تحليل الأداء: مستقر";
    if (progress > 80) statusLabel = "أداء استثنائي!";
    else if (progress > 50) statusLabel = "تقدم ممتاز";
    else if (progress > 0) statusLabel = "جاري التنفيذ";

    // Calculate task count per category for the form
    const categoryCounts: Record<string, number> = {};
    tasks.forEach(task => {
      categoryCounts[task.category] = (categoryCounts[task.category] || 0) + 1;
    });

    return { total, completed, pinned, pending, progress, statusLabel, categoryCounts };
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
    addToast("تمت إضافة المهمة بنجاح", "success");
    setShowForm(false);
  };

  const handleTaskDelete = (id: string) => {
    setTasks(tasks.filter(x => x.id !== id));
    addToast("تم حذف المهمة من السجلات", "danger");
  };

  const handleTaskCopy = (task: Task) => {
    const newTask = {...task, id: Date.now().toString(), createdAt: new Date().toISOString(), status: TaskStatus.PENDING};
    setTasks([newTask, ...tasks]);
    addToast("تم استنساخ المهمة", "success");
  };

  const handleStatusChange = (id: string, s: TaskStatus) => {
    setTasks(tasks.map(x => x.id === id ? {...x, status: s, updatedAt: new Date().toISOString()} : x));
    if (s === TaskStatus.COMPLETED) {
      addToast("مهمة مكتملة! أحسنت العمل", "success");
    }
  };

  if (isInitialLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#020617]">
      <div className="w-16 h-16 border-4 border-nebula-purple/20 border-t-nebula-purple rounded-full animate-spin"></div>
    </div>
  );
  
  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  const renderView = () => {
    switch (currentView) {
      case 'settings':
        return <div className="animate-reveal"><Settings user={currentUser} onUpdate={setCurrentUser} showToast={addToast} /></div>;
      case 'categories':
        return (
          <div className="animate-reveal">
            <CategoryManagement 
              categories={categories} 
              onAdd={cat => { setCategories([...categories, cat]); addToast("تمت إضافة الفئة", "success"); }}
              onUpdate={cat => {
                setCategories(categories.map(c => c.id === cat.id ? cat : c));
                addToast("تم تحديث الفئة", "success");
              }}
              onDelete={(id, action) => {
                const cat = categories.find(c => c.id === id);
                if (!cat) return;
                if (action === 'delete_tasks') {
                  setTasks(tasks.filter(t => t.category !== cat.name));
                } else {
                  setTasks(tasks.map(t => t.category === cat.name ? { ...t, category: 'أخرى' } : t));
                }
                setCategories(categories.filter(c => c.id !== id));
                addToast("تم حذف الفئة", "info");
              }}
            />
          </div>
        );
      default:
        return (
          <div className="animate-reveal">
            {/* Progress Dashboard */}
            <div className="glass-panel border-white/5 rounded-[50px] p-10 lg:p-14 mb-14 relative overflow-hidden group shadow-2xl">
               <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-nebula-purple/5 to-transparent pointer-events-none"></div>
               
               <div className="flex flex-col lg:flex-row items-center gap-12 relative z-10">
                  <div className="w-full lg:w-80 shrink-0">
                    <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[40px] border border-white/10 relative overflow-hidden group/card hover:bg-white/[0.08] transition-all">
                       <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-nebula-purple to-nebula-blue flex items-center justify-center text-white shadow-lg animate-pulse-soft">
                             <Icons.Sparkles className="w-7 h-7" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">رؤية ذكية</p>
                            <h5 className="text-white font-black text-sm">نصيحة اليوم</h5>
                          </div>
                       </div>
                       <p className="text-slate-200 text-sm font-bold leading-relaxed italic">"{smartAdvice}"</p>
                       <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
                    </div>
                  </div>

                  <div className="flex-1 w-full space-y-8">
                    <div className="flex items-center justify-between">
                       <div className="space-y-1">
                         <div className="flex items-center gap-3">
                            <Icons.LayoutDashboard className="w-7 h-7 text-nebula-blue" />
                            <h4 className="text-3xl font-black text-white glow-title">معدل الإنجاز اليومي</h4>
                         </div>
                         <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.3em]">{stats.statusLabel}</p>
                       </div>
                       <div className="flex flex-col items-end">
                         <span className="text-5xl font-black text-nebula-blue glow-text tracking-tighter">{stats.progress}%</span>
                         <p className="text-[10px] text-slate-600 font-black mt-1 uppercase tracking-widest">نسبة الكفاءة</p>
                       </div>
                    </div>

                    <div className="relative pt-4">
                       <div className="h-6 w-full bg-black/40 rounded-full overflow-hidden border border-white/10 p-1 relative shadow-inner">
                          <div 
                           className="h-full rounded-full bg-gradient-to-r from-nebula-purple via-nebula-blue to-cyan-400 transition-all duration-[1.5s] cubic-bezier(0.23, 1, 0.32, 1) shadow-[0_0_20px_rgba(59,130,246,0.5)] relative overflow-hidden" 
                           style={{ width: `${stats.progress}%` }}
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                          </div>
                       </div>
                       <div className="justify-between mt-4 px-1 hidden md:flex">
                          <p className="text-[11px] font-black text-slate-400">
                             تم إكمال <span className="text-emerald-400 text-sm">{stats.completed}</span> سجل من أصل <span className="text-white text-sm">{stats.total}</span>
                          </p>
                          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">المتبقي: {stats.pending}</p>
                       </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* UPGRADED STATS CARDS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              <StatCard 
                label="إجمالي المهام" 
                count={stats.total} 
                icon={<Icons.LayoutDashboard />} 
                color="from-blue-600 to-blue-400" 
                accentColor="#3b82f6"
                index={0} 
                iconAnim="group-hover:rotate-12"
              />
              <StatCard 
                label="المكتملة" 
                count={stats.completed} 
                icon={<Icons.CheckCircle />} 
                color="from-emerald-500 to-teal-400" 
                accentColor="#10b981"
                index={1} 
                iconAnim="group-hover:scale-110"
              />
              <StatCard 
                label="المثبتة" 
                count={stats.pinned} 
                icon={<Icons.Pin />} 
                color="from-orange-500 to-amber-400" 
                accentColor="#f59e0b"
                index={2} 
                iconAnim="group-hover:translate-y-[-5px]"
              />
              <StatCard 
                label="المتبقية" 
                count={stats.pending} 
                icon={<Icons.AlarmClock />} 
                color="from-rose-500 to-pink-400" 
                accentColor="#f43f5e"
                index={3} 
                iconAnim="group-hover:rotate-[-15deg]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 pb-40">
              {filteredTasks.length > 0 ? filteredTasks.map((t, i) => (
                <div key={t.id} className="animate-reveal" style={{ animationDelay: `${i * 100}ms` }}>
                  <TaskCard 
                    task={t} index={i}
                    onDelete={handleTaskDelete}
                    onEdit={x => { setEditingTask(x); setShowForm(true); }}
                    onCopy={handleTaskCopy}
                    onStatusChange={handleStatusChange}
                    onTogglePin={id => {
                      setTasks(tasks.map(x => x.id === id ? {...x, isPinned: !x.isPinned} : x));
                      addToast("تم تحديث حالة التثبيت", "info");
                    }}
                  />
                </div>
              )) : (
                <div className="col-span-full py-48 flex flex-col items-center justify-center text-center">
                   <div className="w-40 h-40 bg-white/5 rounded-[50px] flex items-center justify-center text-slate-800 mb-10 border border-white/5">
                      <Icons.LayoutDashboard className="w-16 h-16 opacity-10" />
                   </div>
                   <h3 className="text-3xl font-black text-slate-600 tracking-widest uppercase">السجل خالٍ حالياً</h3>
                   <p className="text-slate-700 text-lg font-bold">ابدأ بإضافة مهمة جديدة لتنشيط مصفوفة الإنتاجية</p>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen p-4 lg:p-6 gap-6 relative">
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
        <header 
          className={`sticky z-[500] transition-all duration-700 ease-in-out ${isScrolled ? 'top-0 mb-8' : 'top-4 mb-12'}`}
        >
           <div 
             className={`glass-panel border-white/10 shadow-[0_35px_80px_-15px_rgba(0,0,0,0.6)] group/header relative overflow-hidden transition-all duration-700 flex items-center justify-between
               ${isScrolled ? 'header-scrolled w-full mx-0' : 'rounded-[50px] h-28 px-8 lg:px-12 w-full'}
             `}
           >
              <div className={`absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-nebula-blue/30 to-transparent transition-opacity ${isScrolled ? 'opacity-100' : 'opacity-0'}`}></div>
              <div className="flex items-center gap-10 relative z-10 nav-title-group transition-all duration-500 origin-right">
                <button 
                  onClick={() => setIsSidebarOpen(true)} 
                  className={`text-nebula-blue bg-white/5 hover:bg-white/10 rounded-2xl transition-all active:scale-90 border border-white/5 lg:hidden ${isScrolled ? 'p-3' : 'p-4'}`}
                >
                  <Icons.LayoutDashboard className={`${isScrolled ? 'w-6 h-6' : 'w-7 h-7'}`} />
                </button>
                <div className="flex flex-col text-right">
                  <h2 className={`font-black tracking-tighter text-white glow-title uppercase drop-shadow-2xl transition-all duration-500 ${isScrolled ? 'text-2xl' : 'text-4xl'}`}>
                    {currentView === 'tasks' ? 'المهـام' : currentView === 'settings' ? 'الإعدادات' : 'القطاعات'}
                  </h2>
                </div>
              </div>
              <div className={`flex-1 mx-12 hidden md:block relative group/search search-engine-group transition-all duration-500 ${isScrolled ? 'max-w-md mx-6' : 'max-w-xl'}`}>
                <input 
                  value={searchQuery} 
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="بحث سريع في السجلات الرقمية..." 
                  className={`w-full bg-black/30 border border-white/10 rounded-[28px] pr-14 pl-8 text-[15px] font-bold outline-none focus:border-nebula-blue/50 focus:bg-black/50 transition-all duration-500 text-white placeholder:text-slate-600 shadow-inner ${isScrolled ? 'py-3' : 'py-5'}`}
                />
                <Icons.Search className={`absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/search:text-nebula-blue group-focus-within/search:scale-110 transition-all ${isScrolled ? 'w-5 h-5' : 'w-6 h-6'}`} />
              </div>
              <div className="flex items-center gap-6 relative z-10">
                 <button 
                  onClick={() => { setEditingTask(null); setShowForm(true); }} 
                  className={`relative group/btn overflow-hidden rounded-[28px] bg-gradient-to-r from-nebula-purple to-nebula-blue text-white font-black shadow-[0_20px_40px_rgba(124,58,237,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-3.5 ${isScrolled ? 'py-3 px-6 text-[11px]' : 'py-5 px-10 text-[13px]'}`}
                 >
                   <Icons.Plus className={`${isScrolled ? 'w-4 h-4' : 'w-5 h-5'} transition-transform group-hover/btn:rotate-90 duration-500`} />
                   <span className="tracking-tight">مهمة جديدة</span>
                 </button>
              </div>
           </div>
        </header>
        <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
          <div className="max-w-7xl mx-auto px-2 lg:px-6">
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
            addToast("تم تحديث البيانات بنجاح", "success");
          }} 
          onClose={() => setShowForm(false)} 
          categories={categories} 
          taskCounts={stats.categoryCounts}
          initialTask={editingTask} 
          onManageCategories={() => { setShowForm(false); setCurrentView('categories'); }} 
        />
      )}

      <div className="fixed bottom-12 left-12 flex flex-col gap-5 z-[2000]">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`toast-animate flex items-center gap-6 px-8 py-5 rounded-[35px] glass-panel border shadow-2xl backdrop-blur-3xl
              ${toast.type === 'success' ? 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400' : 
                toast.type === 'danger' ? 'border-rose-500/40 bg-rose-500/5 text-rose-400' : 
                'border-nebula-blue/40 bg-nebula-blue/5 text-nebula-blue'}
            `}
          >
            <div className="w-12 h-12 rounded-[20px] flex items-center justify-center bg-white/5">
              {toast.type === 'success' ? <Icons.CheckCircle className="w-6 h-6" /> :
               toast.type === 'danger' ? <Icons.Trash className="w-6 h-6" /> :
               <Icons.Sparkles className="w-6 h-6" />}
            </div>
            <p className="text-base font-black tracking-tight">{toast.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// STATCARD COMPONENT - RE-ENGINEERED FOR GIANT, BOLD ICONS
const StatCard = ({ label, count, icon, color, accentColor, index, iconAnim }: any) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseInt(count);
    if (end === 0) { setDisplayCount(0); return; }
    if (start === end) { setDisplayCount(end); return; }
    let duration = 1200;
    let stepTime = Math.abs(Math.floor(duration / end));
    let timer = setInterval(() => {
      start += 1;
      setDisplayCount(start);
      if (start === end) clearInterval(timer);
    }, stepTime);
    return () => clearInterval(timer);
  }, [count]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    cardRef.current.style.setProperty('--x', `${x}px`);
    cardRef.current.style.setProperty('--y', `${y}px`);
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="group relative bg-[#0a1020] border border-white/5 rounded-[45px] p-8 flex items-center justify-between transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] cursor-default overflow-hidden"
      style={{ transformStyle: 'preserve-3d' }}
    >
      {/* Interaction Light */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(circle at var(--x) var(--y), ${accentColor}20, transparent 65%)` }}
      ></div>

      {/* GIANT ICON CONTAINER - PILL SHAPE MATCHING IMAGE */}
      <div 
        className={`relative w-28 h-28 lg:w-32 lg:h-32 rounded-[42px] bg-gradient-to-tr ${color} flex items-center justify-center text-white shadow-2xl transition-all duration-700 overflow-hidden group-hover:shadow-[0_0_40px_${accentColor}40]`}
        style={{ transform: 'translateZ(40px)' }}
      >
        {/* Pulsing Aura */}
        <div className={`absolute inset-0 bg-white/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-[1s]`}></div>
        
        {/* THE ICON - NOW SCALED UP TO 70% OF THE CONTAINER SIZE */}
        <div className={`w-[60%] h-[60%] flex items-center justify-center relative z-10 transition-all duration-700 ease-out ${iconAnim}`}>
          {React.cloneElement(icon as React.ReactElement, { 
            strokeWidth: 3, 
            className: "w-full h-full drop-shadow-[0_0_12px_rgba(255,255,255,0.6)]" 
          })}
        </div>

        {/* Specular Highlight */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1.2s] pointer-events-none"></div>
      </div>

      {/* DATA SECTION */}
      <div className="flex flex-col text-right items-end flex-1 mr-8" style={{ transform: 'translateZ(60px)' }}>
        <p className="text-[14px] font-black text-slate-500 uppercase tracking-[0.25em] mb-3 group-hover:text-slate-300 transition-colors">
          {label}
        </p>
        
        <div className="flex items-center gap-4">
          <h5 className="text-6xl lg:text-7xl font-black text-white tracking-tighter tabular-nums drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">
            {displayCount}
          </h5>
          {/* Status Glow Dot */}
          <div 
            className="w-3 h-3 rounded-full mt-4 animate-pulse"
            style={{ 
              backgroundColor: accentColor, 
              boxShadow: `0 0 15px ${accentColor}, 0 0 35px ${accentColor}80` 
            }}
          ></div>
        </div>
      </div>

      {/* Decorative Border */}
      <div className="absolute inset-px rounded-[44px] border border-white/[0.04] pointer-events-none group-hover:border-white/[0.08] transition-colors"></div>
    </div>
  );
};

export default App;
