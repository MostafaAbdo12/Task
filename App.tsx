
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, TaskStatus, Category, User } from './types';
import { Icons } from './constants';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import Settings from './components/Settings';
import CategoryModal from './components/CategoryModal';
import { storageService } from './services/storageService';

type ToastType = 'success' | 'danger' | 'info';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storageService.getSession());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE'>('ALL');
  const [currentView, setCurrentView] = useState<'tasks' | 'settings'>('tasks');
  
  const [showForm, setShowForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean; type: ToastType }>({ 
    message: '', 
    visible: false,
    type: 'success'
  });

  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    setToast({ message: msg, visible: true, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const userTasks = storageService.getUserTasks(currentUser.username);
      const userCats = storageService.getUserCategories(currentUser.username);
      
      setTasks(userTasks);
      setCategories(userCats);
      
      setTimeout(() => setIsLoaded(true), 300);

      const welcomeMsg = sessionStorage.getItem('auth_success_msg');
      if (welcomeMsg) {
        showToast(welcomeMsg, 'success');
        sessionStorage.removeItem('auth_success_msg');
      }
    } else {
      setIsLoaded(false);
    }
  }, [currentUser, showToast]);

  useEffect(() => {
    if (currentUser) {
      storageService.saveUserTasks(currentUser.username, tasks);
    }
  }, [tasks, currentUser]);

  useEffect(() => {
    if (currentUser) {
      storageService.saveUserCategories(currentUser.username, categories);
    }
  }, [categories, currentUser]);

  const handleStatusChange = (id: string, status: TaskStatus) => {
    setTasks(prev => {
      const newTasks = prev.map(t => t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t);
      if (status === TaskStatus.COMPLETED) {
        showToast("إنجاز رائع! تم تحديث سجلاتك بنجاح.", 'success');
      }
      return newTasks;
    });
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast("تم حذف المهمة بنجاح", 'danger');
  };

  const handleCopyTask = (task: Task) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      title: `${task.title} (نسخة)`,
      status: TaskStatus.PENDING,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false
    };
    setTasks([newTask, ...tasks]);
    showToast("تم نسخ المهمة بنجاح 📋", 'success');
  };

  const handleToggleFavorite = (id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      const isNowFavorite = !task?.isFavorite;
      if (isNowFavorite) {
        showToast("تمت إضافة المهمة إلى المفضلة ❤️", 'success');
      }
      return prev.map(t => t.id === id ? { ...t, isFavorite: isNowFavorite } : t);
    });
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const favorites = tasks.filter(t => t.isFavorite).length;
    const active = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, active, percentage, favorites };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => (selectedCategory === 'الكل' || t.category === selectedCategory))
      .filter(t => {
        if (statusFilter === 'ACTIVE') {
          return t.status === TaskStatus.PENDING || t.status === TaskStatus.IN_PROGRESS;
        }
        return true;
      })
      .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
        return 0;
      });
  }, [tasks, selectedCategory, searchQuery, statusFilter]);

  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  return (
    <div className={`h-screen w-full flex bg-corp-bg transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      
      {toast.visible && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[2000] animate-[slideIn_0.5s_cubic-bezier(0.175,0.885,0.32,1.275)_forwards]">
          <div className={`
            px-8 py-4 rounded-[24px] flex items-center gap-4 border shadow-2xl transition-all duration-500
            ${toast.type === 'success' 
              ? 'bg-emerald-600 border-emerald-400 shadow-[0_20px_50px_-10px_rgba(16,185,129,0.5)]' 
              : toast.type === 'danger'
              ? 'bg-rose-600 border-rose-400 shadow-[0_20px_50px_-10px_rgba(225,29,72,0.5)]'
              : 'bg-blue-600 border-blue-400 shadow-[0_20px_50px_-10_rgba(37,99,235,0.5)]'}
          `}>
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center animate-gentle-pulse">
              {toast.type === 'danger' ? <Icons.Trash className="w-5 h-5 text-white" /> : <Icons.CheckCircle className="w-5 h-5 text-white" />}
            </div>
            <div className="flex flex-col">
              <span className="text-white text-[15px] font-black tracking-tight">{toast.message}</span>
              <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-0.5">تحديث النظام الذكي</span>
            </div>
          </div>
        </div>
      )}

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        categories={categories}
        tasks={tasks}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        currentView={currentView}
        onViewChange={setCurrentView}
        user={currentUser}
        onLogout={() => { storageService.clearSession(); setCurrentUser(null); }}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden p-4 lg:p-10 relative">
        {/* شريط حالة قاعدة البيانات السحابية */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 hidden md:flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-2 rounded-full border border-slate-200 shadow-sm z-50">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">قاعدة البيانات: متصلة عالمياً 🌍</span>
        </div>

        <header className="flex flex-col gap-6 mb-10 pt-4 lg:pt-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 transition-colors">
                 <Icons.Chevron className="w-5 h-5 rotate-90 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight glowing-text">
                  {currentView === 'tasks' ? 'مهامي الذكية' : 'إعدادات الحساب'}
                </h1>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">
                  {currentView === 'tasks' ? 'إدارة الإنتاجية والنتائج' : 'تخصيص الهوية الرقمية'}
                </p>
              </div>
            </div>

            {currentView === 'tasks' && (
              <div className="flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="bg-white p-1 rounded-2xl border border-slate-200 flex shadow-sm">
                    <button 
                      onClick={() => setStatusFilter('ALL')}
                      className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${statusFilter === 'ALL' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      الكل
                    </button>
                    <button 
                      onClick={() => setStatusFilter('ACTIVE')}
                      className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${statusFilter === 'ACTIVE' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      النشطة
                    </button>
                </div>
                
                <button onClick={() => setShowForm(true)} className="flex items-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-2xl text-[13px] font-black shadow-[0_10px_25px_rgba(37,99,235,0.4)] hover:brightness-110 active:scale-95 transition-all">
                    <Icons.Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">مهمة جديدة</span>
                  </button>
              </div>
            )}
          </div>

          {currentView === 'tasks' && (
            <div className="flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="relative flex-1 w-full group">
                  <Icons.Search className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    placeholder="ابحث في سجلاتك الشخصية..." 
                    className="w-full bg-white border-2 border-slate-100 rounded-[32px] py-6 pr-14 pl-8 text-base font-bold outline-none focus:ring-12 focus:ring-blue-500/5 focus:border-blue-400 transition-all shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)]" 
                  />
              </div>
              <button 
                onClick={() => setShowCategoryModal(true)} 
                className="w-full md:w-auto px-10 py-6 bg-white border-2 border-slate-100 text-slate-800 rounded-[32px] hover:border-blue-500 hover:bg-blue-50/20 transition-all shadow-[0_10px_40px_-10px_rgba(0,0,0,0.03)] flex items-center justify-center gap-4 font-black text-base group active:scale-95"
              >
                  <div className="bg-slate-50 p-2 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Icons.Folder className="w-6 h-6 text-slate-500 group-hover:text-white" />
                  </div>
                  <span>إضافة تصنيف جديد</span>
              </button>
            </div>
          )}
        </header>

        {currentView === 'tasks' ? (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-10 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              
              {/* عدد المهام */}
              <div className="p-8 rounded-[32px] bg-[#0f172a] text-white border-none shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                  <div className="absolute -bottom-2 -right-2 p-4 opacity-10 transition-transform group-hover:scale-125 group-hover:-rotate-12 duration-700">
                    <Icons.LayoutDashboard className="w-24 h-24" />
                  </div>
                  <div className="flex justify-between items-start mb-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <Icons.LayoutDashboard className="w-4 h-4 opacity-60" />
                    </div>
                    <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.2em]">عدد المهام</p>
                  </div>
                  <p className="text-4xl font-black relative z-10 text-left">{stats.total}</p>
              </div>

              {/* منجزة */}
              <div className="p-8 rounded-[32px] bg-emerald-600 text-white border-none shadow-lg shadow-emerald-200/50 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                  <div className="absolute -bottom-2 -right-2 p-4 opacity-10 transition-transform group-hover:scale-125 group-hover:rotate-6 duration-700">
                    <Icons.CheckCircle className="w-24 h-24" />
                  </div>
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Icons.CheckCircle className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.2em]">منجزة</p>
                  </div>
                  <p className="text-3xl font-black relative z-10 text-left">{stats.completed}</p>
              </div>

              {/* المفضلة */}
              <div className="p-8 rounded-[32px] bg-rose-600 text-white border-none shadow-lg shadow-rose-200/50 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                  <div className="absolute -bottom-2 -right-2 p-4 opacity-10 transition-transform group-hover:scale-125 group-hover:-rotate-12 duration-700">
                    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24" fill="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                  </div>
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    </div>
                    <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.2em]">المفضلة</p>
                  </div>
                  <p className="text-3xl font-black relative z-10 text-left">{stats.favorites}</p>
              </div>

              {/* نشطة */}
              <div className="p-8 rounded-[32px] bg-blue-600 text-white border-none shadow-lg shadow-blue-200/50 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                  <div className="absolute -bottom-2 -right-2 p-4 opacity-10 transition-transform group-hover:scale-125 duration-700">
                    <Icons.Sparkles className="w-24 h-24" />
                  </div>
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                      <Icons.LayoutDashboard className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.2em]">نشطة</p>
                  </div>
                  <p className="text-3xl font-black relative z-10 text-left">{stats.active}</p>
              </div>

              {/* نسبة الإنجاز */}
              <div className={`p-8 rounded-[32px] text-white border-none shadow-lg flex flex-col justify-between hover:scale-[1.02] transition-all duration-700 group overflow-hidden relative
                ${stats.percentage === 100 ? 'bg-indigo-600 shadow-indigo-400 animate-[pulseGlow_3s_infinite]' : 'bg-orange-500 shadow-orange-200/50'}
              `}>
                  <div className="absolute -bottom-2 -right-2 p-4 opacity-10 transition-transform group-hover:scale-125 group-hover:rotate-12 duration-700">
                    <Icons.Sparkles className="w-24 h-24" />
                  </div>
                  <div className="flex items-center justify-between mb-3 relative z-10">
                    <div className={`w-8 h-8 rounded-full bg-white/20 flex items-center justify-center ${stats.percentage === 100 ? 'animate-bounce' : ''}`}>
                      <Icons.Sparkles className="w-4 h-4" />
                    </div>
                    <p className="text-[10px] font-black opacity-80 uppercase tracking-[0.2em]">نسبة الإنجاز</p>
                  </div>
                  <div className="flex items-baseline gap-1 relative z-10 transition-transform duration-500 group-hover:scale-110 text-left">
                    <p className="text-4xl font-black">{stats.percentage}%</p>
                    <p className="text-[10px] font-black opacity-70 uppercase tracking-widest mr-1">مكتمل</p>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 w-full h-3 bg-black/10 overflow-hidden">
                    <div 
                      className={`h-full bg-white transition-all duration-[1.5s] cubic-bezier(0.34, 1.56, 0.64, 1) relative
                        ${stats.percentage === 100 ? 'bg-emerald-400' : ''}
                      `}
                      style={{ width: `${stats.percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite] pointer-events-none"></div>
                    </div>
                  </div>
              </div>
            </div>

            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task, idx) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      index={idx} 
                      onDelete={handleDeleteTask} 
                      onEdit={t => { setEditingTask(t); setShowForm(true); }} 
                      onCopy={handleCopyTask}
                      onStatusChange={handleStatusChange} 
                      onTogglePin={id => setTasks(tasks.map(t => t.id === id ? {...t, isPinned: !t.isPinned} : t))} 
                      onToggleFavorite={handleToggleFavorite}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-24 bg-white border border-dashed border-slate-200 rounded-[40px] flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[24px] flex items-center justify-center mb-6 shadow-inner animate-pulse">
                        <Icons.Folder className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-black text-slate-400">لا توجد سجلات مطابقة</h3>
                    <p className="text-[13px] font-bold text-slate-300 mt-2">قم بتغيير خيارات التصفية أو أضف مهمة جديدة للبدء.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <Settings user={currentUser} onUpdate={setCurrentUser} showToast={showToast} />
        )}
      </main>

      {showForm && (
        <TaskForm onAdd={data => { setTasks([{...data, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}, ...tasks]); setShowForm(false); showToast("تم إضافة المهمة بنجاح", 'success'); }} onUpdate={task => { setTasks(tasks.map(t => t.id === task.id ? {...task, updatedAt: new Date().toISOString()} : t)); setShowForm(false); setEditingTask(null); showToast("تم تحديث المهمة بنجاح", 'info'); }} onClose={() => { setShowForm(false); setEditingTask(null); }} onManageCategories={() => setShowCategoryModal(true)} initialTask={editingTask} categories={categories} />
      )}

      {showCategoryModal && (
        <CategoryModal categories={categories} onAdd={cat => { setCategories([...categories, cat]); showToast("تم إضافة التصنيف بنجاح", 'success'); }} onUpdate={updatedCat => { setCategories(categories.map(c => c.id === updatedCat.id ? updatedCat : c)); showToast("تم تحديث التصنيف بنجاح", 'info'); }} onDelete={id => { setCategories(categories.filter(c => c.id !== id)); showToast("تم حذف التصنيف", 'danger'); }} onClose={() => setShowCategoryModal(false)} />
      )}
    </div>
  );
};

export default App;
