
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
          showToast("عذراً، فشل المزامنة السحابية", "danger");
        } finally {
          setIsSyncing(false);
          setTimeout(() => setIsInitialLoading(false), 1000);
        }
      } else {
        setIsInitialLoading(false);
      }
    };
    initAppData();
  }, [currentUser, showToast]);

  useEffect(() => {
    if (currentUser && tasks.length >= 0) {
      storageService.saveUserTasks(currentUser.username, tasks);
    }
  }, [tasks, currentUser]);

  useEffect(() => {
    if (currentUser && categories.length > 0) {
      storageService.saveUserCategories(currentUser.username, categories);
    }
  }, [categories, currentUser]);

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
      .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));
  }, [tasks, selectedCategory, searchQuery, viewFilter]);

  if (isInitialLoading) {
    return (
      <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center">
        <div className="w-24 h-24 bg-blue-600/10 border border-blue-500/20 rounded-[40px] flex items-center justify-center animate-pulse mb-8">
          <Icons.Sparkles className="w-12 h-12 text-blue-500" />
        </div>
        <div className="text-white font-black text-sm tracking-[0.3em] uppercase animate-pulse">Initializing Neural Core...</div>
      </div>
    );
  }

  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  return (
    <div className="h-screen w-full flex bg-[#f8fafc] overflow-hidden font-sans">
      
      <style>{`
        @keyframes floatIcon {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes glowRing {
          0% { box-shadow: 0 0 10px rgba(37, 99, 235, 0.2); }
          50% { box-shadow: 0 0 25px rgba(37, 99, 235, 0.5); }
          100% { box-shadow: 0 0 10px rgba(37, 99, 235, 0.2); }
        }
        .animate-float-icon { animation: floatIcon 3s infinite ease-in-out; }
      `}</style>

      {toast.visible && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[3000] animate-in slide-in-from-top-12">
           <div className={`px-10 py-5 rounded-[30px] shadow-2xl flex items-center gap-4 border ${toast.type === 'success' ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-rose-600 border-rose-400 text-white'}`}>
             <span className="font-black text-sm tracking-tight">{toast.message}</span>
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
        onManageCategories={() => setShowCategoryModal(true)}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-12 pt-24 lg:pt-12">
          
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="flex items-center gap-6">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-4 bg-white rounded-3xl shadow-sm border border-slate-200">
                <Icons.Chevron className="w-6 h-6 rotate-90 text-slate-600" />
              </button>
              <div>
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter glowing-text">
                  {currentView === 'tasks' ? 'لوحة العمليات' : 'تخصيص الحساب'}
                </h1>
                <p className="text-[12px] font-bold text-slate-400 mt-2 uppercase tracking-[0.3em]">
                   قاعدة البيانات: {currentUser.username} • نظام مشفر
                </p>
              </div>
            </div>

            {currentView === 'tasks' && (
              <button 
                onClick={() => setShowForm(true)} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-5 rounded-[28px] text-[14px] font-black shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-4 group"
              >
                <Icons.Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
                <span>إضافة سجل جديد</span>
              </button>
            )}
          </header>

          {currentView === 'tasks' ? (
            <div className="space-y-16 pb-24">
              {/* مربعات الإحصائيات الملونة المتوهجة */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                 <StatCard 
                    onClick={() => setViewFilter('ALL')} 
                    active={viewFilter === 'ALL'} 
                    title="الإجمالي" 
                    value={stats.total} 
                    type="total"
                    icon={<Icons.LayoutDashboard />} 
                 />
                 <StatCard 
                    onClick={() => setViewFilter('COMPLETED')} 
                    active={viewFilter === 'COMPLETED'} 
                    title="المنجزة" 
                    value={stats.completed} 
                    type="completed"
                    icon={<Icons.CheckCircle />} 
                 />
                 <StatCard 
                    onClick={() => setViewFilter('FAVORITES')} 
                    active={viewFilter === 'FAVORITES'} 
                    title="المفضلة" 
                    value={stats.favorites} 
                    type="favorites"
                    icon={<Icons.Sparkles />} 
                 />
                 <StatCard 
                    onClick={() => setViewFilter('PENDING')} 
                    active={viewFilter === 'PENDING'} 
                    title="قيد الانتظار" 
                    value={stats.pending} 
                    type="pending"
                    icon={<Icons.AlarmClock />} 
                 />
                 
                 {/* بطاقة معدل الإنجاز المتوهجة */}
                 <div className="relative group cursor-pointer" onClick={() => showToast("مستوى أدائك في تحسن مستمر", "info")}>
                    <div className="absolute inset-0 bg-violet-600 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative bg-white p-8 rounded-[45px] border border-violet-100 flex flex-col justify-between shadow-xl h-full transition-all group-hover:-translate-y-2 overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">معدل الإنجاز</p>
                          <div className="w-12 h-12 bg-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-violet-200 animate-float-icon">
                              <Icons.Sparkles className="w-6 h-6" />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-5xl font-black text-slate-900 tracking-tighter">{stats.percentage}%</span>
                          <div className="w-full h-3 bg-slate-100 rounded-full mt-6 overflow-hidden relative">
                              <div 
                                className="absolute inset-y-0 right-0 bg-gradient-to-l from-violet-600 to-indigo-500 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(124,58,237,0.5)]" 
                                style={{ width: `${stats.percentage}%` }}
                              >
                                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite_linear]"></div>
                              </div>
                          </div>
                        </div>
                    </div>
                 </div>
              </div>

              {/* شبكة المهام */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task, idx) => (
                    <TaskCard 
                      key={task.id} task={task} index={idx} 
                      onDelete={id => { setTasks(tasks.filter(t => t.id !== id)); showToast("تم حذف السجل", 'danger'); }} 
                      onEdit={t => { setEditingTask(t); setShowForm(true); }} 
                      onCopy={t => { setTasks([{...t, id: Date.now().toString(), title: t.title + ' (نسخة)'}, ...tasks]); showToast("تم نسخ السجل بنجاح", 'info'); }}
                      onStatusChange={(id, status) => { 
                        setTasks(tasks.map(t => t.id === id ? {...t, status, updatedAt: new Date().toISOString()} : t));
                        if(status === TaskStatus.COMPLETED) showToast("تم إنجاز المهمة! 🎉", 'success');
                      }} 
                      onTogglePin={id => setTasks(tasks.map(t => t.id === id ? {...t, isPinned: !t.isPinned} : t))} 
                      onToggleFavorite={id => setTasks(tasks.map(t => t.id === id ? {...t, isFavorite: !t.isFavorite} : t))}
                    />
                  ))
                ) : (
                  <div className="col-span-full py-32 bg-white/50 border border-dashed border-slate-300 rounded-[60px] flex flex-col items-center justify-center text-center opacity-80">
                    <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-8">
                       <Icons.Folder className="w-12 h-12 text-slate-300" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-400">لا توجد سجلات في هذا النطاق</h3>
                    <p className="text-sm font-bold text-slate-300 mt-2 tracking-wide uppercase">سير العمل نظيف حالياً</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Settings user={currentUser} onUpdate={setCurrentUser} showToast={showToast} />
          )}
        </div>
      </main>

      {showForm && (
        <TaskForm 
          onAdd={data => { setTasks([{...data, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}, ...tasks]); setShowForm(false); showToast("تم إضافة مهمة سحابية", 'success'); }} 
          onUpdate={task => { setTasks(tasks.map(t => t.id === task.id ? {...task, updatedAt: new Date().toISOString()} : t)); setShowForm(false); setEditingTask(null); showToast("تم تحديث البيانات", 'info'); }} 
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

interface StatCardProps { 
  title: string; 
  value: number; 
  type: 'total' | 'completed' | 'favorites' | 'pending'; 
  icon: React.ReactNode; 
  active: boolean; 
  onClick: () => void; 
}

const StatCard = ({ title, value, type, icon, active, onClick }: StatCardProps) => {
  const configs = {
    total: {
      gradient: 'from-blue-700 to-indigo-900',
      glow: 'rgba(37, 99, 235, 0.4)',
      iconBg: 'bg-white/20'
    },
    completed: {
      gradient: 'from-emerald-500 to-teal-800',
      glow: 'rgba(16, 185, 129, 0.4)',
      iconBg: 'bg-white/20'
    },
    favorites: {
      gradient: 'from-rose-500 to-pink-800',
      glow: 'rgba(244, 63, 94, 0.4)',
      iconBg: 'bg-white/20'
    },
    pending: {
      gradient: 'from-amber-500 to-orange-800',
      glow: 'rgba(245, 158, 11, 0.4)',
      iconBg: 'bg-white/20'
    }
  };

  const current = configs[type];

  return (
    <div className="relative group">
      {/* التوهج الخلفي (Neon Glow) */}
      <div 
        className="absolute inset-0 blur-3xl opacity-30 group-hover:opacity-60 transition-opacity duration-500"
        style={{ backgroundColor: current.glow }}
      ></div>

      <button 
        onClick={onClick}
        className={`relative w-full p-8 rounded-[45px] text-right transition-all duration-500 border border-white/20 overflow-hidden shadow-2xl active:scale-95 group-hover:-translate-y-2
          bg-gradient-to-br ${current.gradient} text-white
          ${active ? 'ring-4 ring-white/30 scale-[1.03]' : 'opacity-90 hover:opacity-100'}
        `}
      >
        {/* تأثير Shimmer ملون */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

        <div className="flex items-center justify-between mb-8 relative z-10">
           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-xl animate-float-icon ${current.iconBg}`}>
             <div className="w-7 h-7">{icon}</div>
           </div>
           <div className={`w-2 h-2 rounded-full ${active ? 'bg-white animate-ping' : 'bg-white/30'}`}></div>
        </div>
        
        <div className="relative z-10">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">{title}</p>
          <p className="text-5xl font-black tracking-tighter drop-shadow-md">{value}</p>
        </div>
      </button>
    </div>
  );
};

export default App;
