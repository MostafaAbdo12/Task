
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
type ViewFilter = 'ALL' | 'COMPLETED' | 'FAVORITES' | 'PENDING';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storageService.getSession());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('ALL');
  const [currentView, setCurrentView] = useState<'tasks' | 'settings'>('tasks');
  
  const [showForm, setShowForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const [toast, setToast] = useState<{ message: string; visible: boolean; type: ToastType }>({ 
    message: '', 
    visible: false,
    type: 'success'
  });

  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    setToast({ message: msg, visible: true, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  }, []);

  // جلب البيانات من "السحابة" عند التشغيل
  useEffect(() => {
    const initAppData = async () => {
      if (currentUser) {
        setIsSyncing(true);
        try {
          const [userTasks, userCats] = await Promise.all([
            storageService.getUserTasks(currentUser.username),
            storageService.getUserCategories(currentUser.username)
          ]);
          setTasks(userTasks);
          setCategories(userCats);
        } catch (err) {
          showToast("عذراً، فشل المزامنة مع السحابة", "danger");
        } finally {
          setIsSyncing(false);
          setTimeout(() => setIsInitialLoading(false), 800);
        }
      } else {
        setIsInitialLoading(false);
      }
    };

    initAppData();
  }, [currentUser, showToast]);

  // مزامنة تلقائية مع السحابة عند أي تغيير
  useEffect(() => {
    if (currentUser && tasks.length > 0) {
      storageService.saveUserTasks(currentUser.username, tasks);
    }
  }, [tasks, currentUser]);

  useEffect(() => {
    if (currentUser && categories.length > 0) {
      storageService.saveUserCategories(currentUser.username, categories);
    }
  }, [categories, currentUser]);

  const handleStatusChange = (id: string, status: TaskStatus) => {
    setTasks(prev => {
      const newTasks = prev.map(t => t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t);
      if (status === TaskStatus.COMPLETED) {
        showToast("إنجاز رائع! تم تحديث سجلات السحابة بنجاح.", 'success');
      }
      return newTasks;
    });
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const favorites = tasks.filter(t => t.isFavorite).length;
    const pending = tasks.filter(t => t.status === TaskStatus.PENDING).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, percentage, favorites };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => (selectedCategory === 'الكل' || t.category === selectedCategory))
      .filter(t => {
        if (viewFilter === 'COMPLETED') return t.status === TaskStatus.COMPLETED;
        if (viewFilter === 'FAVORITES') return t.isFavorite;
        if (viewFilter === 'PENDING') return t.status === TaskStatus.PENDING;
        return true;
      })
      .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
        return 0;
      });
  }, [tasks, selectedCategory, searchQuery, viewFilter]);

  if (isInitialLoading) {
    return (
      <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center font-sans">
        <div className="w-24 h-24 bg-blue-600/20 rounded-[30px] flex items-center justify-center animate-pulse mb-8 border border-blue-500/30">
          <Icons.Sparkles className="w-12 h-12 text-blue-500" />
        </div>
        <h2 className="text-white text-xl font-black tracking-widest uppercase mb-2">جاري الاتصال بالسحابة العالمية</h2>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  return (
    <div className={`h-screen w-full flex bg-[#f8fafc] transition-opacity duration-700`}>
      
      {toast.visible && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[2000] animate-in slide-in-from-top-10">
          <div className={`px-8 py-4 rounded-[24px] flex items-center gap-4 shadow-2xl ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
             <span className="font-black text-sm">{toast.message}</span>
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
        {/* مؤشر حالة السحابة */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50">
           <div className="bg-white/90 backdrop-blur-xl border border-slate-200 px-6 py-2 rounded-full shadow-lg flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`}></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                {isSyncing ? 'جاري المزامنة مع السحابة...' : 'قاعدة البيانات العالمية: نشطة'}
              </span>
           </div>
        </div>

        <header className="flex flex-col gap-6 mb-10 pt-12 lg:pt-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white border border-slate-200 rounded-2xl">
                 <Icons.Chevron className="w-5 h-5 rotate-90 text-slate-600" />
              </button>
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                  {currentView === 'tasks' ? 'نظام الإدارة العالمي' : 'إعدادات الحساب السحابي'}
                </h1>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">مرحباً بك، {currentUser.username} • الوصول من أي مكان مفعل</p>
              </div>
            </div>
            {currentView === 'tasks' && (
              <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-[13px] font-black shadow-xl hover:scale-105 transition-all flex items-center gap-3">
                <Icons.Plus className="w-5 h-5" />
                <span>إضافة مهمة سحابية</span>
              </button>
            )}
          </div>
        </header>

        {currentView === 'tasks' ? (
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <button onClick={() => setViewFilter('ALL')} className={`p-6 rounded-[32px] text-right transition-all border-2 ${viewFilter === 'ALL' ? 'bg-[#0f172a] text-white border-blue-500' : 'bg-white text-slate-900 border-transparent shadow-sm'}`}>
                <p className="text-[10px] font-black opacity-60 uppercase mb-2">الكل</p>
                <p className="text-3xl font-black">{stats.total}</p>
              </button>
              <button onClick={() => setViewFilter('COMPLETED')} className={`p-6 rounded-[32px] text-right transition-all border-2 ${viewFilter === 'COMPLETED' ? 'bg-emerald-600 text-white border-white' : 'bg-white text-slate-900 border-transparent shadow-sm'}`}>
                <p className="text-[10px] font-black opacity-60 uppercase mb-2">منجزة</p>
                <p className="text-3xl font-black">{stats.completed}</p>
              </button>
              <button onClick={() => setViewFilter('FAVORITES')} className={`p-6 rounded-[32px] text-right transition-all border-2 ${viewFilter === 'FAVORITES' ? 'bg-rose-600 text-white border-white' : 'bg-white text-slate-900 border-transparent shadow-sm'}`}>
                <p className="text-[10px] font-black opacity-60 uppercase mb-2">المفضلة</p>
                <p className="text-3xl font-black">{stats.favorites}</p>
              </button>
              <button onClick={() => setViewFilter('PENDING')} className={`p-6 rounded-[32px] text-right transition-all border-2 ${viewFilter === 'PENDING' ? 'bg-indigo-800 text-white border-white' : 'bg-white text-slate-900 border-transparent shadow-sm'}`}>
                <p className="text-[10px] font-black opacity-60 uppercase mb-2">لم تنجز</p>
                <p className="text-3xl font-black">{stats.pending}</p>
              </button>
              <div className="p-6 rounded-[32px] bg-orange-500 text-white text-right shadow-lg">
                <p className="text-[10px] font-black opacity-60 uppercase mb-2">نسبة الإنجاز</p>
                <p className="text-3xl font-black">{stats.percentage}%</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
              {filteredTasks.map((task, idx) => (
                <TaskCard 
                  key={task.id} task={task} index={idx} 
                  onDelete={id => setTasks(tasks.filter(t => t.id !== id))} 
                  onEdit={t => { setEditingTask(t); setShowForm(true); }} 
                  onCopy={t => setTasks([{...t, id: Date.now().toString(), title: t.title + ' (نسخة)'}, ...tasks])}
                  onStatusChange={handleStatusChange} 
                  onTogglePin={id => setTasks(tasks.map(t => t.id === id ? {...t, isPinned: !t.isPinned} : t))} 
                  onToggleFavorite={id => setTasks(tasks.map(t => t.id === id ? {...t, isFavorite: !t.isFavorite} : t))}
                />
              ))}
            </div>
          </div>
        ) : (
          <Settings user={currentUser} onUpdate={setCurrentUser} showToast={showToast} />
        )}
      </main>

      {showForm && (
        <TaskForm 
          onAdd={data => { setTasks([{...data, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}, ...tasks]); setShowForm(false); showToast("تم الحفظ في السحابة", "success"); }} 
          onUpdate={task => { setTasks(tasks.map(t => t.id === task.id ? {...task, updatedAt: new Date().toISOString()} : t)); setShowForm(false); setEditingTask(null); }} 
          onClose={() => { setShowForm(false); setEditingTask(null); }} 
          onManageCategories={() => setShowCategoryModal(true)} 
          initialTask={editingTask} categories={categories} 
        />
      )}

      {showCategoryModal && (
        <CategoryModal categories={categories} onAdd={cat => setCategories([...categories, cat])} onUpdate={cat => setCategories(categories.map(c => c.id === cat.id ? cat : c))} onDelete={id => setCategories(categories.filter(c => c.id !== id))} onClose={() => setShowCategoryModal(false)} />
      )}
    </div>
  );
};

export default App;
