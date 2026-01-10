
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, TaskStatus, Category, User } from './types';
import { Icons } from './constants';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import CategoryModal from './components/CategoryModal';
import { getSmartAdvice } from './services/geminiService';
import { storageService } from './services/storageService';
import confetti from 'canvas-confetti';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storageService.getSession());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE'>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [systemAdvice, setSystemAdvice] = useState('تحليل الأداء جارٍ...');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  const showToast = useCallback((msg: string) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3000);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const userTasks = storageService.getUserTasks(currentUser.username);
      const userCats = storageService.getUserCategories(currentUser.username);
      
      setTasks(userTasks);
      setCategories(userCats);
      
      const refreshAdvice = async () => {
        const advice = await getSmartAdvice(userTasks);
        setSystemAdvice(advice);
      };
      refreshAdvice();
      
      setTimeout(() => setIsLoaded(true), 300);

      const welcomeMsg = sessionStorage.getItem('auth_success_msg');
      if (welcomeMsg) {
        showToast(welcomeMsg);
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
        confetti({ 
          particleCount: 150, 
          spread: 70, 
          origin: { y: 0.6 },
          colors: ['#2563eb', '#10b981', '#f59e0b']
        });
        showToast("إنجاز رائع! تم تحديث سجلاتك بنجاح.");
      }
      return newTasks;
    });
  };

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
      .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));
  }, [tasks, selectedCategory, searchQuery, statusFilter]);

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
        onLogout={() => { storageService.clearSession(); setCurrentUser(null); }}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden p-4 lg:p-10 relative">
        <header className="flex flex-col gap-6 mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-white border border-slate-200 rounded-2xl shadow-sm hover:bg-slate-50 transition-colors">
                 <Icons.Chevron className="w-5 h-5 rotate-90 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight glowing-text">مهامي الذكية</h1>
                <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">إدارة الإنتاجية والنتائج</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
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
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4">
             <div className="relative flex-1 w-full group">
                <Icons.Search className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="ابحث في سجلاتك الشخصية..." className="w-full bg-white border border-slate-200 rounded-2xl py-4 pr-12 pl-6 text-sm font-bold outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" />
             </div>
             <button onClick={() => setShowCategoryModal(true)} className="w-full md:w-auto p-4 bg-white border border-slate-200 text-slate-600 rounded-2xl hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-3 font-bold text-sm">
                <Icons.Folder className="w-5 h-5" />
                <span className="md:hidden">إدارة التصنيفات</span>
              </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-10 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="p-8 rounded-[32px] bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white border-none shadow-xl relative overflow-hidden group hover:scale-[1.02] transition-transform duration-500">
                <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-125 duration-700">
                  <Icons.LayoutDashboard className="w-20 h-20" />
                </div>
                <p className="text-[10px] font-black opacity-60 mb-3 uppercase tracking-[0.2em] relative z-10">إجمالي العمليات</p>
                <p className="text-4xl font-black relative z-10">{tasks.length}</p>
             </div>
             {[
               { label: 'مكتملة', val: tasks.filter(t => t.status === TaskStatus.COMPLETED).length, color: 'text-emerald-600', icon: <Icons.CheckCircle /> },
               { label: 'نشطة', val: tasks.filter(t => t.status !== TaskStatus.COMPLETED).length, color: 'text-blue-600', icon: <Icons.LayoutDashboard /> },
               { label: 'التوجيه الذكي', val: systemAdvice, color: 'text-slate-800', isAdvice: true, icon: <Icons.Sparkles /> }
             ].map((stat, i) => (
               <div key={i} className={`p-8 rounded-[32px] bg-white border border-slate-100 flex flex-col justify-center shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 duration-300 ${stat.isAdvice ? 'md:col-span-2' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`${stat.color} opacity-40 scale-75`}>{stat.icon}</div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</p>
                  </div>
                  <p className={`text-xl font-black truncate ${stat.color}`}>{stat.val}</p>
               </div>
             ))}
          </div>

          <div>
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
      </main>

      {showForm && (
        <TaskForm onAdd={data => { setTasks([{...data, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}, ...tasks]); setShowForm(false); showToast("تم الحفظ بنجاح"); }} onUpdate={task => { setTasks(tasks.map(t => t.id === task.id ? {...task, updatedAt: new Date().toISOString()} : t)); setShowForm(false); setEditingTask(null); }} onClose={() => { setShowForm(false); setEditingTask(null); }} onManageCategories={() => setShowCategoryModal(true)} initialTask={editingTask} categories={categories} />
      )}

      {showCategoryModal && (
        <CategoryModal categories={categories} onAdd={cat => setCategories([...categories, cat])} onUpdate={updatedCat => setCategories(categories.map(c => c.id === updatedCat.id ? updatedCat : c))} onDelete={id => setCategories(categories.filter(c => c.id !== id))} onClose={() => setShowCategoryModal(false)} />
      )}
    </div>
  );
};

export default App;
