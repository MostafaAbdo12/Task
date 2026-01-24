import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, Category, User, TaskStatus, TaskPriority } from './types';
import { Icons } from './constants';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import Settings from './components/Settings';
import CategoryManagement from './components/CategoryManagement';
import { storageService } from './services/storageService';
import { getSmartAdvice } from './services/geminiService';

type SortOption = 'newest' | 'dueDate' | 'priority';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storageService.getSession());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [currentView, setCurrentView] = useState<'tasks' | 'settings' | 'categories'>('tasks');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [smartAdvice, setSmartAdvice] = useState('تحليل المهام...');
  const [toasts, setToasts] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  const addToast = useCallback((message: string, type: 'success' | 'danger' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const init = async () => {
      if (currentUser) {
        const [t, c] = await Promise.all([
          storageService.getUserTasks(currentUser.username),
          storageService.getUserCategories(currentUser.username)
        ]);
        setTasks(t);
        setCategories(c);
        getSmartAdvice(t).then(setSmartAdvice).catch(() => {});
        setIsInitialLoading(false);
      } else {
        setIsInitialLoading(false);
      }
    };
    init();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      storageService.saveUserCategories(currentUser.username, categories);
      storageService.saveUserTasks(currentUser.username, tasks);
    }
  }, [tasks, categories, currentUser]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const pending = tasks.filter(t => t.status !== TaskStatus.COMPLETED).length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, progress };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const priorityWeight = { [TaskPriority.URGENT]: 4, [TaskPriority.HIGH]: 3, [TaskPriority.MEDIUM]: 2, [TaskPriority.LOW]: 1 };

    return tasks
      .filter(t => (selectedCategory === 'الكل' || t.category === selectedCategory))
      .filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortBy === 'dueDate') {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        } else if (sortBy === 'priority') {
          return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        }
        return 0;
      });
  }, [tasks, selectedCategory, searchQuery, sortBy]);

  if (isInitialLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-950">
       <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
    </div>
  );

  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden text-slate-200">
      <Sidebar 
        isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} 
        categories={categories} tasks={tasks}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        currentView={currentView} onViewChange={setCurrentView}
        user={currentUser}
        onLogout={() => { storageService.clearSession(); setCurrentUser(null); }}
        onManageCategories={() => { setCurrentView('categories'); setIsSidebarOpen(false); }}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Advanced Command Center Header */}
        <header className="h-28 bg-slate-950/40 backdrop-blur-3xl border-b border-white/[0.05] px-10 flex items-center justify-between shrink-0 relative z-[60]">
           {/* Section 1: Dashboard Context & Live Clock */}
           <div className="flex items-center gap-8">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="lg:hidden p-3.5 bg-white/5 text-slate-400 hover:text-white rounded-[1.25rem] border border-white/5 transition-all active:scale-95 shadow-xl"
              >
                <Icons.LayoutDashboard className="w-6 h-6" />
              </button>
              
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-1.5">
                   <div className={`w-2.5 h-2.5 rounded-full ${stats.progress > 70 ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]' : 'bg-primary shadow-[0_0_12px_rgba(99,102,241,0.6)]'} animate-pulse`}></div>
                   <h1 className="text-2xl font-black text-white tracking-tight">
                     {currentView === 'tasks' ? (selectedCategory === 'الكل' ? 'المركز الرئيسي' : selectedCategory) : 'تخصيص النظام'}
                   </h1>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-lg border border-white/5">
                      <Icons.Calendar className="w-3 h-3 text-slate-500" />
                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        {currentTime.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </span>
                   </div>
                   <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></div>
                      <span className="text-[10px] text-primary font-black uppercase tracking-widest">
                        {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                   </div>
                </div>
              </div>
           </div>

           {/* Section 2: Command Palette Search */}
           <div className="hidden lg:flex items-center gap-4 flex-1 max-w-2xl mx-16">
              <div className="relative w-full group">
                 {/* Decorative background glow */}
                 <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 rounded-[1.5rem] blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-500"></div>
                 
                 <div className="relative flex items-center bg-slate-900/60 border border-white/10 rounded-[1.5rem] px-5 py-4 focus-within:border-primary/50 focus-within:bg-slate-900/80 transition-all duration-300">
                    <Icons.Search className="text-slate-500 w-5 h-5 group-focus-within:text-primary transition-colors" />
                    <input 
                      value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                      placeholder="ابدأ البحث أو اكتب أمراً..." 
                      className="flex-1 bg-transparent px-4 text-sm font-bold text-white placeholder:text-slate-600 outline-none"
                    />
                    <div className="flex items-center gap-1.5 opacity-40 group-focus-within:opacity-100 transition-opacity">
                       <kbd className="px-2 py-1 rounded-md border border-white/10 text-[10px] font-black text-slate-500 bg-white/5">Ctrl</kbd>
                       <kbd className="px-2 py-1 rounded-md border border-white/10 text-[10px] font-black text-slate-500 bg-white/5">K</kbd>
                    </div>
                 </div>
              </div>
           </div>

           {/* Section 3: Meta Actions & Profile */}
           <div className="flex items-center gap-5">
              {/* Notifications / System Status */}
              <div className="hidden md:flex items-center gap-5 px-6 py-3 bg-white/[0.03] border border-white/[0.05] rounded-[1.5rem] hover:bg-white/[0.06] transition-all cursor-pointer group">
                 <div className="flex flex-col text-right">
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">System Health</span>
                   <span className="text-[11px] font-black text-emerald-400 group-hover:text-white transition-colors">مستقر بنسبة 99%</span>
                 </div>
                 <div className="relative">
                    <Icons.Bell className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 border-2 border-slate-950 rounded-full"></div>
                 </div>
              </div>

              {/* Primary Action Button */}
              <button 
                onClick={() => { setEditingTask(null); setShowForm(true); }} 
                className="group relative bg-primary hover:bg-indigo-500 text-white pl-8 pr-6 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.3em] flex items-center gap-4 transition-all shadow-2xl shadow-primary/30 hover:-translate-y-1 active:scale-95 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <div className="bg-white/20 p-1.5 rounded-lg group-hover:rotate-180 transition-transform duration-500">
                  <Icons.Plus className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline">مهمة جديدة</span>
              </button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 lg:p-12 space-y-12 no-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.05),transparent_40%)]">
           {currentView === 'tasks' && (
             <div className="max-w-7xl mx-auto space-y-12 animate-slide-up">
                
                {/* Visual Intelligence Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <StatItem label="إجمالي السجلات" value={stats.total} icon={<Icons.Database className="w-5 h-5" />} color="text-indigo-400" />
                   <StatItem label="أهداف معلقة" value={stats.pending} icon={<Icons.Calendar className="w-5 h-5" />} color="text-amber-400" />
                   
                   <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-center border-white/[0.05] group hover:border-primary/20 transition-all bg-white/[0.02]">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">معيار الترتيب</span>
                        <div className="p-1.5 bg-white/5 rounded-lg text-slate-600 group-hover:text-primary transition-colors">
                           <Icons.Chevron className="w-3 h-3" />
                        </div>
                      </div>
                      <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="bg-transparent text-xs font-black text-white outline-none cursor-pointer hover:text-primary transition-colors appearance-none"
                      >
                        <option value="newest" className="bg-slate-900">سجل الأحداث</option>
                        <option value="dueDate" className="bg-slate-900">الموعد النهائي</option>
                        <option value="priority" className="bg-slate-900">قوة التأثير</option>
                      </select>
                   </div>

                   <div className="glass-card p-6 rounded-[2rem] flex flex-col justify-center border-white/[0.05] relative overflow-hidden bg-white/[0.02]">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">كفاءة الإنجاز</span>
                        <span className="text-sm font-black text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]">{stats.progress}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden p-0.5 border border-white/[0.05]">
                        <div className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(99,102,241,0.8)] transition-all duration-1000 ease-out" style={{ width: `${stats.progress}%` }}></div>
                      </div>
                   </div>
                </div>

                {/* Smart Guidance Section */}
                <div className="group relative bg-gradient-to-r from-primary/10 via-white/[0.03] to-transparent border border-white/[0.08] rounded-[2.5rem] p-8 flex items-center gap-8 overflow-hidden transition-all hover:bg-white/[0.05]">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                   <div className="relative p-5 bg-primary/20 rounded-[1.5rem] text-primary shadow-2xl shadow-primary/30 group-hover:scale-110 transition-transform duration-500">
                      <Icons.Sparkles className="w-8 h-8 animate-pulse" />
                   </div>
                   <div className="flex flex-col relative z-10">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] mb-2">إرشادات الذكاء الاصطناعي</span>
                      <p className="text-lg font-bold text-white/90 leading-relaxed italic tracking-tight">"{smartAdvice}"</p>
                   </div>
                </div>

                {/* Tasks Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                   {filteredTasks.map((t, i) => (
                     <TaskCard 
                      key={t.id} task={t} index={i}
                      onDelete={id => { setTasks(tasks.filter(x => x.id !== id)); addToast("تم نقل السجل إلى الأرشيف", "info"); }}
                      onEdit={x => { setEditingTask(x); setShowForm(true); }}
                      onCopy={task => { setTasks([{...task, id: Date.now().toString(), createdAt: new Date().toISOString()}, ...tasks]); addToast("تم تكرار المهمة بنجاح", "success"); }}
                      onStatusChange={(id, s) => setTasks(tasks.map(x => x.id === id ? {...x, status: s} : x))}
                      onTogglePin={id => setTasks(tasks.map(x => x.id === id ? {...x, isPinned: !x.isPinned} : x))}
                      onToggleFavorite={id => setTasks(tasks.map(x => x.id === id ? {...x, isFavorite: !x.isFavorite} : x))}
                     />
                   ))}
                </div>

                {filteredTasks.length === 0 && (
                   <div className="flex flex-col items-center justify-center py-40 opacity-30 animate-pulse">
                      <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10">
                         <Icons.Search className="w-10 h-10 text-slate-500" />
                      </div>
                      <p className="text-3xl font-black tracking-[0.2em] uppercase text-white/50">لا يوجد بيانات</p>
                      <span className="text-sm font-bold text-slate-600 mt-4">نظامك نظيف حالياً، ابدأ بإضافة مهامك الأولى</span>
                   </div>
                )}
             </div>
           )}

           {currentView === 'settings' && <Settings user={currentUser} onUpdate={setCurrentUser} showToast={addToast} bgIntensity="medium" onBgIntensityChange={() => {}} />}
           {currentView === 'categories' && <CategoryManagement categories={categories} onAdd={c => setCategories([...categories, c])} onUpdate={c => setCategories(categories.map(x => x.id === c.id ? c : x))} onDelete={id => setCategories(categories.filter(x => x.id !== id))} />}
        </div>
      </main>

      {showForm && (
        <TaskForm 
          onAdd={t => { setTasks([{...t, id: Date.now().toString(), createdAt: new Date().toISOString()}, ...tasks]); setShowForm(false); addToast("تمت جدولة الهدف بنجاح", "success"); }}
          onUpdate={t => { setTasks(tasks.map(x => x.id === t.id ? t : x)); setShowForm(false); addToast("تم تحديث قاعدة البيانات", "info"); }}
          onClose={() => setShowForm(false)} categories={categories} initialTask={editingTask}
          onManageCategories={() => { setShowForm(false); setCurrentView('categories'); }}
          taskCounts={tasks.reduce((acc, t) => ({...acc, [t.category]: (acc[t.category] || 0) + 1}), {})}
        />
      )}

      {/* Modern HUD Notification System */}
      <div className="fixed bottom-12 left-12 flex flex-col gap-4 z-[2000]">
        {toasts.map(t => (
          <div key={t.id} className="bg-slate-900/95 backdrop-blur-3xl border border-white/10 p-5 rounded-[1.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] flex items-center gap-5 animate-slide-up border-l-4 border-l-primary">
             <div className={`w-3.5 h-3.5 rounded-full ${t.type === 'success' ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)]' : t.type === 'danger' ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]' : 'bg-primary shadow-[0_0_15px_rgba(99,102,241,0.6)]'}`}></div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">System Message</span>
                <span className="text-sm font-black text-white/90 tracking-tight">{t.message}</span>
             </div>
             <button className="mr-4 p-1.5 hover:bg-white/10 rounded-lg transition-colors" onClick={() => setToasts(toasts.filter(x => x.id !== t.id))}>
               <Icons.X className="w-4 h-4 text-slate-500" />
             </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatItem = ({ label, value, icon, color }: any) => (
  <div className="glass-card p-7 rounded-[2rem] flex items-center gap-7 border-white/[0.05] group hover:border-primary/20 transition-all bg-white/[0.02] shadow-xl">
    <div className={`w-16 h-16 bg-white/5 ${color} rounded-[1.25rem] flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">{label}</span>
      <span className="text-3xl font-black text-white tracking-tight">{value < 10 && value > 0 ? '0' + value : value}</span>
    </div>
  </div>
);

export default App;