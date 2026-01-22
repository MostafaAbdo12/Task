
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
  const [smartAdvice, setSmartAdvice] = useState('جارِ تحليل البيانات...');
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
    addToast("تمت إضافة المهمة بنجاح", "success");
    setShowForm(false);
  };

  const handleTaskDelete = (id: string) => {
    setTasks(tasks.filter(x => x.id !== id));
    addToast("تم حذف المهمة نهائياً", "danger");
  };

  const handleTaskCopy = (task: Task) => {
    const newTask = {...task, id: Date.now().toString(), createdAt: new Date().toISOString(), status: TaskStatus.PENDING};
    setTasks([newTask, ...tasks]);
    addToast("تم تكرار المهمة بنجاح", "success");
  };

  const handleStatusChange = (id: string, s: TaskStatus) => {
    setTasks(tasks.map(x => x.id === id ? {...x, status: s, updatedAt: new Date().toISOString()} : x));
    if (s === TaskStatus.COMPLETED) {
      addToast("مهمة أخرى منجزة! عمل رائع", "success");
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
              onAdd={handleCategoryAdd}
              onUpdate={cat => {
                setCategories(categories.map(c => c.id === cat.id ? cat : c));
                addToast("تم تحديث القطاع بنجاح", "success");
              }}
              onDelete={handleCategoryDelete}
            />
          </div>
        );
      default:
        return (
          <div className="animate-reveal">
            {/* Dynamic Dashboard Progress Bar */}
            <div className="glass-panel border-white/5 rounded-[50px] p-8 lg:p-12 mb-10 relative overflow-hidden group shadow-2xl">
               <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-nebula-purple/10 to-transparent pointer-events-none"></div>
               <div className="flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                  <div className="flex-1 w-full space-y-6">
                    <div className="flex items-center justify-between">
                       <div>
                         <h4 className="text-2xl font-black text-white flex items-center gap-4">
                           <Icons.LayoutDashboard className="w-6 h-6 text-nebula-purple animate-pulse" />
                           معدل الإنجاز اليومي
                         </h4>
                         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">المسار الحالي للإنتاجية</p>
                       </div>
                       <div className="text-right">
                         <span className="text-4xl font-black text-nebula-blue glow-text">{stats.progress}%</span>
                       </div>
                    </div>
                    <div className="h-5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-1 relative shadow-inner">
                       <div 
                        className="h-full rounded-full bg-gradient-to-r from-nebula-purple via-nebula-blue to-nebula-pink transition-all duration-1000 cubic-bezier(0.2, 0.8, 0.2, 1) shadow-[0_0_20px_rgba(59,130,246,0.6)]" 
                        style={{ width: `${stats.progress}%` }}
                       ></div>
                       {/* Shimmer effect */}
                       <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_3s_infinite] pointer-events-none"></div>
                    </div>
                    <p className="text-[11px] font-black text-slate-400">لقد أتممت <span className="text-emerald-400">{stats.completed}</span> من أصل <span className="text-nebula-blue">{stats.total}</span> مهمة رقمية.</p>
                  </div>
                  
                  <div className="flex items-center gap-5 bg-white/5 p-8 rounded-[35px] border border-white/5 backdrop-blur-3xl shrink-0 group hover:bg-white/10 transition-all">
                    <div className="w-14 h-14 rounded-2xl bg-nebula-purple/20 flex items-center justify-center text-nebula-purple group-hover:scale-110 transition-transform">
                       <Icons.Sparkles className="w-8 h-8" />
                    </div>
                    <div className="max-w-[220px]">
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">رؤية ذكية</p>
                       <p className="text-sm font-bold text-slate-200 italic leading-snug">"{smartAdvice}"</p>
                    </div>
                  </div>
               </div>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <StatCard label="إجمالي المهام" count={stats.total} icon={<Icons.LayoutDashboard />} color="from-indigo-600 to-blue-500" index={0} />
              <StatCard label="المكتملة" count={stats.completed} icon={<Icons.CheckCircle />} color="from-emerald-600 to-teal-500" index={1} />
              <StatCard label="المثبتة" count={stats.pinned} icon={<Icons.Pin />} color="from-amber-500 to-orange-400" index={2} />
              <StatCard label="المتبقية" count={stats.pending} icon={<Icons.AlarmClock />} color="from-rose-600 to-pink-500" index={3} />
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-32">
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
                <div className="col-span-full py-40 flex flex-col items-center justify-center text-center">
                   <div className="w-32 h-32 bg-white/5 rounded-[45px] flex items-center justify-center text-slate-800 mb-8 border border-white/5">
                      <Icons.LayoutDashboard className="w-12 h-12 opacity-20" />
                   </div>
                   <h3 className="text-2xl font-black text-slate-600 tracking-widest uppercase">السجل فارغ</h3>
                   <p className="text-slate-700 mt-2 font-bold">ابدأ بإضافة مهمتك الأولى لتفعيل النظام</p>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  const handleCategoryAdd = (cat: Category) => {
    setCategories([...categories, cat]);
    addToast(`تمت إضافة قطاع ${cat.name} بنجاح`, "success");
  };

  const handleCategoryDelete = (id: string, action: 'reassign' | 'delete_tasks') => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    if (action === 'delete_tasks') {
      setTasks(tasks.filter(t => t.category !== cat.name));
    } else {
      setTasks(tasks.map(t => t.category === cat.name ? { ...t, category: 'أخرى' } : t));
    }
    setCategories(categories.filter(c => c.id !== id));
    addToast("تم حذف القطاع نهائياً", "info");
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
        <header className="h-24 glass-panel rounded-[40px] px-8 lg:px-12 flex items-center justify-between sticky top-4 z-50 mb-10 border-white/5 shadow-2xl">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-nebula-blue p-3 hover:bg-white/5 rounded-2xl transition-all"><Icons.LayoutDashboard className="w-6 h-6" /></button>
            <div className="flex flex-col">
              <h2 className="text-2xl font-black tracking-tight text-white glow-title uppercase">
                {currentView === 'tasks' ? 'المهام' : currentView === 'settings' ? 'الإعدادات' : 'القطاعات'}
              </h2>
              <div className="flex items-center gap-2 mt-1 opacity-50">
                 <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                 <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">النظام نشط</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-5">
             <div className="relative hidden md:block group">
                <input 
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="بحث سريع..." 
                  className="bg-white/5 border border-white/10 rounded-2xl py-3 pr-10 pl-4 text-xs font-bold outline-none focus:border-nebula-purple/50 focus:bg-white/10 transition-all w-60 text-white"
                />
                <Icons.Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within:text-nebula-purple transition-colors" />
             </div>
             <button 
              onClick={() => { setEditingTask(null); setShowForm(true); }} 
              className="bg-gradient-to-r from-nebula-purple to-nebula-blue text-white text-[11px] font-black px-8 py-3.5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-nebula-purple/20 flex items-center gap-2"
             >
               <Icons.Plus className="w-4 h-4" />
               <span>إضافة</span>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
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
            addToast("تم تحديث المهمة بنجاح", "success");
          }} 
          onClose={() => setShowForm(false)} 
          categories={categories} 
          initialTask={editingTask} 
          onManageCategories={() => { setShowForm(false); setCurrentView('categories'); }} 
        />
      )}

      {/* Global Toast System */}
      <div className="fixed bottom-10 left-10 flex flex-col gap-4 z-[2000]">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`toast-animate flex items-center gap-5 px-6 py-4 rounded-[30px] glass-panel border shadow-2xl
              ${toast.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400' : 
                toast.type === 'danger' ? 'border-rose-500/30 bg-rose-500/5 text-rose-400' : 
                'border-nebula-blue/30 bg-nebula-blue/5 text-nebula-blue'}
            `}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5">
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

const StatCard = ({ label, count, icon, color, index }: any) => (
  <div 
    className="glass-panel p-8 flex items-center gap-6 group relative overflow-hidden rounded-[40px] animate-reveal" 
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${color} flex items-center justify-center text-white shrink-0 shadow-xl group-hover:rotate-6 group-hover:scale-110 transition-all`}>
      <div className="w-6 h-6">{icon}</div>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <h5 className="text-3xl font-black text-white glow-text">{count}</h5>
    </div>
  </div>
);

export default App;
