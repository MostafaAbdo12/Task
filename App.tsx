
import React, { useState, useEffect, useMemo } from 'react';
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

  // Sync categories & tasks to storage
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

  if (isInitialLoading) return <div className="h-screen flex items-center justify-center bg-[#020617]"><div className="w-12 h-12 border-4 border-nebula-purple border-t-transparent rounded-full animate-spin shadow-glow"></div></div>;
  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  const renderView = () => {
    switch (currentView) {
      case 'settings':
        return <Settings user={currentUser} onUpdate={setCurrentUser} showToast={() => {}} />;
      case 'categories':
        return (
          <CategoryManagement 
            categories={categories} 
            onAdd={cat => setCategories([...categories, cat])}
            onUpdate={cat => setCategories(categories.map(c => c.id === cat.id ? cat : c))}
            onDelete={id => setCategories(categories.filter(c => c.id !== id))}
          />
        );
      default:
        return (
          <>
            {/* Stats Dashboard Header */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
              <StatCard 
                label="إجمالي المهام" 
                count={stats.total} 
                icon={<Icons.LayoutDashboard className="w-6 h-6" />} 
                color="from-blue-600 to-indigo-500" 
                glow="rgba(37, 99, 235, 0.3)"
              />
              <StatCard 
                label="المهام المنجزة" 
                count={stats.completed} 
                icon={<Icons.CheckCircle className="w-6 h-6" />} 
                color="from-emerald-600 to-teal-500" 
                glow="rgba(16, 185, 129, 0.3)"
              />
              <StatCard 
                label="المهام المثبتة" 
                count={stats.pinned} 
                icon={<Icons.Pin className="w-6 h-6" />} 
                color="from-amber-500 to-orange-400" 
                glow="rgba(245, 158, 11, 0.3)"
              />
              <StatCard 
                label="المهام المتبقية" 
                count={stats.pending} 
                icon={<Icons.AlarmClock className="w-6 h-6" />} 
                color="from-rose-600 to-pink-500" 
                glow="rgba(225, 29, 72, 0.3)"
              />
            </div>

            {/* AI Progress & Advice Section */}
            <div className="glass-panel border-nebula-purple/20 rounded-[32px] p-8 flex flex-col gap-8 shadow-2xl relative overflow-hidden mb-12">
               <div className="absolute top-0 right-0 w-64 h-64 bg-nebula-purple/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
               
               <div className="flex flex-col md:flex-row items-center gap-10">
                  {/* Circular Progress (Desktop only visual) or percentage */}
                  <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * stats.progress) / 100} strokeLinecap="round" className="text-nebula-purple transition-all duration-1000 ease-out" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <span className="text-3xl font-black text-white">{stats.progress}%</span>
                       <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">معدل الإنجاز</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></div>
                         <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em]">توصية المركز العصبي</p>
                       </div>
                       <span className="text-[10px] font-black text-slate-500 italic">ذكاء اصطناعي نشط</span>
                    </div>
                    <p className="text-xl font-bold text-white/90 leading-relaxed italic border-r-2 border-nebula-purple/30 pr-6">
                      "{smartAdvice}"
                    </p>
                    
                    {/* Linear Progress Bar (The requested one) */}
                    <div className="space-y-2 pt-4">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">تطور المهمة الحالية</span>
                        <span className="text-[10px] font-black text-nebula-purple">{stats.progress}%</span>
                      </div>
                      <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[2px]">
                        <div 
                          className="h-full bg-gradient-to-r from-nebula-blue via-nebula-purple to-nebula-pink rounded-full transition-all duration-1000 relative"
                          style={{ width: `${stats.progress}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredTasks.length > 0 ? filteredTasks.map((t, i) => (
                <TaskCard 
                  key={t.id} task={t} index={i}
                  onDelete={id => setTasks(tasks.filter(x => x.id !== id))}
                  onEdit={x => { setEditingTask(x); setShowForm(true); }}
                  onCopy={x => setTasks([{...x, id: Date.now().toString(), createdAt: new Date().toISOString()}, ...tasks])}
                  onStatusChange={(id, s) => setTasks(tasks.map(x => x.id === id ? {...x, status: s, updatedAt: new Date().toISOString()} : x))}
                  onTogglePin={id => setTasks(tasks.map(x => x.id === id ? {...x, isPinned: !x.isPinned} : x))}
                />
              )) : (
                <div className="col-span-full py-40 flex flex-col items-center justify-center text-center space-y-6 animate-pulse">
                  <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center text-slate-700">
                     <Icons.LayoutDashboard className="w-16 h-16" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-slate-500 uppercase tracking-[0.5em]">المجال الكوني فارغ</p>
                    <p className="text-sm text-slate-600 font-bold mt-2">ابدأ بإنشاء أول مهمة جديدة الآن</p>
                  </div>
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
        <header className="h-20 glass-panel rounded-[28px] px-8 flex items-center justify-between sticky top-4 z-50 mb-4 transition-all duration-500">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-blue-400 p-2 hover:bg-white/5 rounded-xl"><Icons.LayoutDashboard className="w-6 h-6" /></button>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white uppercase">
                {currentView === 'tasks' ? 'نظام الإنجاز' : currentView === 'settings' ? 'تكوين الهوية' : 'مختبر القطاعات'}
              </h2>
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">مستوى الوصول: متميز</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             {currentView === 'tasks' && (
               <div className="relative hidden md:block">
                  <input 
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="ابحث في الذاكرة..." 
                    className="bg-white/5 border border-white/10 rounded-2xl py-2 pr-10 pl-4 text-xs font-bold outline-none focus:border-nebula-purple focus:bg-white/10 transition-all w-64 text-white"
                  />
                  <Icons.Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
               </div>
             )}
             <button 
              onClick={() => { setEditingTask(null); setShowForm(true); }} 
              className="bg-gradient-to-r from-nebula-purple to-nebula-blue text-white text-[11px] font-black px-6 py-3 rounded-2xl hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(124,58,237,0.3)] active:scale-95"
             >
               + مهمة جديدة
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar pt-6 pb-20">
          <div className="max-w-7xl mx-auto px-4 lg:px-10">
            {renderView()}
          </div>
        </div>
      </main>

      {showForm && (
        <TaskForm 
          onAdd={data => {setTasks([{...data, id: Date.now().toString()} , ...tasks]); setShowForm(false);}} 
          onUpdate={task => {setTasks(tasks.map(t => t.id === task.id ? task : t)); setShowForm(false);}} 
          onClose={() => setShowForm(false)} 
          categories={categories} 
          initialTask={editingTask} 
          onManageCategories={() => setCurrentView('categories')} 
        />
      )}
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
  <div className="nebula-card p-6 flex items-center gap-6 group hover:border-white/20 relative" style={{ boxShadow: `0 0 20px ${glow}` }}>
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${color} flex items-center justify-center text-white shrink-0 shadow-lg group-hover:rotate-12 transition-transform duration-500`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{label}</p>
      <h5 className="text-3xl font-black text-white">{count}</h5>
    </div>
    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
  </div>
);

export default App;
