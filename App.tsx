
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
import { getSmartAdvice, getSystemBriefingAudio } from './services/geminiService';

type ToastType = 'success' | 'danger' | 'info';
type ViewFilter = 'ALL' | 'COMPLETED' | 'FAVORITES' | 'PENDING';
type AppTheme = 'light' | 'night' | 'midnight';

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storageService.getSession());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [viewFilter, setViewFilter] = useState<ViewFilter>('ALL');
  const [currentView, setCurrentView] = useState<'tasks' | 'settings'>('tasks');
  const [appTheme, setAppTheme] = useState<AppTheme>(() => (localStorage.getItem('maham_theme') as AppTheme) || 'night');
  
  const [showForm, setShowForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const [smartAdvice, setSmartAdvice] = useState('تحليل النبض البياني...');
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const [toast, setToast] = useState<{ message: string; visible: boolean; type: ToastType }>({ 
    message: '', visible: false, type: 'success'
  });

  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    setToast({ message: msg, visible: true, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  }, []);

  // Sync Theme with DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appTheme);
    localStorage.setItem('maham_theme', appTheme);
  }, [appTheme]);

  useEffect(() => {
    const initAppData = async () => {
      if (currentUser) {
        try {
          const [userTasks, userCats] = await Promise.all([
            storageService.getUserTasks(currentUser.username),
            storageService.getUserCategories(currentUser.username)
          ]);
          setTasks(userTasks);
          setCategories(userCats);
          
          const advice = await getSmartAdvice(userTasks);
          setSmartAdvice(advice);
        } catch (err) {
          showToast("فشل في مزامنة البيانات السحابية", "danger");
        } finally {
          setIsInitialLoading(false);
        }
      } else {
        setIsInitialLoading(false);
      }
    };
    initAppData();
  }, [currentUser, showToast]);

  useEffect(() => {
    if (currentUser && tasks) {
      storageService.saveUserTasks(currentUser.username, tasks);
    }
  }, [tasks, currentUser]);

  useEffect(() => {
    if (currentUser && categories.length > 0) {
      storageService.saveUserCategories(currentUser.username, categories);
    }
  }, [categories, currentUser]);

  const handleAudioBriefing = async () => {
    if (!currentUser || isAudioLoading) return;
    setIsAudioLoading(true);
    try {
      const audioBase64 = await getSystemBriefingAudio(currentUser.username, tasks);
      if (audioBase64) {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const decodedBytes = decodeBase64(audioBase64);
        const audioBuffer = await decodeAudioData(decodedBytes, audioContext, 24000, 1);
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
      } else {
        showToast("فشل في تحميل تقرير التلخيص الصوتي", "danger");
      }
    } catch (err) {
      console.error("Audio Playback Error:", err);
      showToast("خطأ في معالجة الصوت", "danger");
    } finally {
      setIsAudioLoading(false);
    }
  };

  const stats = useMemo(() => {
    const activeTasks = tasks.filter(t => t.status !== TaskStatus.COMPLETED);
    const completedTasks = tasks.filter(t => t.status === TaskStatus.COMPLETED);
    
    return {
      total: activeTasks.length,
      completed: completedTasks.length,
      favorites: activeTasks.filter(t => t.isFavorite).length,
      pending: activeTasks.filter(t => t.status === TaskStatus.PENDING).length,
      percentage: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0
    };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => (selectedCategory === 'الكل' || t.category === selectedCategory))
      .filter(t => {
        if (viewFilter === 'ALL') return t.status !== TaskStatus.COMPLETED;
        if (viewFilter === 'COMPLETED') return t.status === TaskStatus.COMPLETED;
        if (viewFilter === 'FAVORITES') return t.isFavorite && t.status !== TaskStatus.COMPLETED;
        if (viewFilter === 'PENDING') return t.status === TaskStatus.PENDING;
        return true;
      })
      .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));
  }, [tasks, selectedCategory, searchQuery, viewFilter]);

  const handleStatusChange = (id: string, status: TaskStatus) => {
    setTasks(prevTasks => prevTasks.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
    
    if (status === TaskStatus.COMPLETED) {
      showToast("رائع! المهمة انتقلت لخانة المنجزات 🚀", 'success');
    } else {
      showToast("تمت استعادة المهمة للعمل النشط", 'info');
    }
  };

  if (isInitialLoading) {
    return (
      <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center text-white">
        <div className="w-20 h-20 bg-indigo-600/10 rounded-[30px] flex items-center justify-center animate-bounce mb-6">
          <Icons.Sparkles className="w-10 h-10 text-indigo-500" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">Loading Intelligence...</p>
      </div>
    );
  }

  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  return (
    <div className="h-screen w-full flex bg-[var(--bg-main)] overflow-hidden font-sans selection:bg-indigo-500/30 transition-colors duration-500">
      <Sidebar 
        isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} 
        categories={categories} tasks={tasks} selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory} currentView={currentView}
        onViewChange={setCurrentView} user={currentUser}
        onLogout={() => { storageService.clearSession(); setCurrentUser(null); }}
        onManageCategories={() => setShowCategoryModal(true)}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] animate-pulse-slow"></div>
        
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-12 pt-28 lg:pt-12 relative z-10">
          <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 mb-16">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-7xl font-black text-[var(--text-primary)] tracking-tighter">
                {currentView === 'tasks' 
                  ? (viewFilter === 'COMPLETED' ? 'قائمة الإنجازات' : 'قاعة العمليات') 
                  : 'إعدادات المستخدم'}
              </h1>
              <div className="flex flex-wrap items-center gap-4">
                 <div className="bg-accent/10 text-accent px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-accent/20 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                    المستخدم {currentUser.username} نشط
                 </div>
                 
                 {/* Theme Switcher Toggle */}
                 <div className="flex bg-[var(--panel-bg)] border border-[var(--border-color)] p-1 rounded-full shadow-lg">
                    <button 
                      onClick={() => setAppTheme('light')}
                      className={`p-2 rounded-full transition-all ${appTheme === 'light' ? 'bg-white text-blue-600 shadow-md scale-110' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                       <Icons.Sun className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setAppTheme('night')}
                      className={`p-2 rounded-full transition-all ${appTheme === 'night' ? 'bg-indigo-600 text-white shadow-md scale-110' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                       <Icons.Moon className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => setAppTheme('midnight')}
                      className={`p-2 rounded-full transition-all ${appTheme === 'midnight' ? 'bg-slate-900 text-cyan-400 shadow-md scale-110' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                       <Icons.Sparkles className="w-3.5 h-3.5" />
                    </button>
                 </div>

                 <button 
                  onClick={handleAudioBriefing}
                  disabled={isAudioLoading}
                  className="bg-accent/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-[var(--border-color)] transition-all flex items-center gap-2"
                 >
                    {isAudioLoading ? <div className="w-3 h-3 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div> : <Icons.Bell className="w-3 h-3" />}
                    تقرير التلخيص الصوتي
                 </button>
              </div>
            </div>

            {currentView === 'tasks' && (
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[240px] max-w-sm">
                   <input 
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="ابحث في الذاكرة..."
                    className="w-full bg-[var(--panel-bg)] border border-[var(--border-color)] rounded-2xl py-4 pr-12 pl-6 text-sm font-bold text-[var(--text-primary)] shadow-xl focus:border-accent/30 outline-none transition-all placeholder:text-slate-600"
                   />
                   <Icons.Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                </div>
                <button 
                  onClick={() => setShowForm(true)} 
                  className="bg-accent hover:opacity-90 text-white px-10 py-4 rounded-2xl text-base font-black shadow-2xl shadow-accent/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-4 group"
                >
                  <Icons.Plus className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
                  <span>مهمة جديدة</span>
                </button>
              </div>
            )}
          </header>

          {currentView === 'tasks' ? (
            <div className="space-y-16 pb-20">
              {/* Dynamic AI Banner */}
              <div className="bg-accent/10 border border-accent/20 p-10 rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(99,102,241,0.1),transparent_50%)]"></div>
                  <div className="relative z-10 space-y-4 text-center md:text-right">
                    <div className="flex items-center justify-center md:justify-start gap-3">
                      <Icons.Sparkles className="w-6 h-6 text-accent animate-float" />
                      <span className="text-[10px] font-black text-accent uppercase tracking-widest">تحليل الذكاء الاصطناعي</span>
                    </div>
                    <h2 className="text-2xl lg:text-4xl font-black text-[var(--text-primary)] leading-tight max-w-2xl">
                       {smartAdvice}
                    </h2>
                  </div>
                  <div className="relative z-10 bg-accent text-white px-8 py-6 rounded-[30px] text-center min-w-[180px] shadow-2xl">
                     <p className="text-5xl font-black tracking-tighter">{stats.percentage}%</p>
                     <p className="text-[9px] font-black uppercase tracking-widest mt-2 opacity-70">إنتاجية المستخدم</p>
                  </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="المهام النشطة" value={stats.total} type="total" icon={<Icons.LayoutDashboard />} active={viewFilter === 'ALL'} onClick={() => setViewFilter('ALL')} />
                <StatCard title="المنجزات" value={stats.completed} type="completed" icon={<Icons.CheckCircle />} active={viewFilter === 'COMPLETED'} onClick={() => setViewFilter('COMPLETED')} />
                <StatCard title="المفضلة النشطة" value={stats.favorites} type="fav" icon={<Icons.Sparkles />} active={viewFilter === 'FAVORITES'} onClick={() => setViewFilter('FAVORITES')} />
                <StatCard title="بانتظار البدء" value={stats.pending} type="pending" icon={<Icons.AlarmClock />} active={viewFilter === 'PENDING'} onClick={() => setViewFilter('PENDING')} />
              </div>

              {/* Task Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredTasks.length > 0 ? filteredTasks.map((task, idx) => (
                  <TaskCard 
                    key={task.id} task={task} index={idx} 
                    onDelete={id => { setTasks(tasks.filter(t => t.id !== id)); showToast("تم حذف السجل بنجاح", 'danger'); }} 
                    onEdit={t => { setEditingTask(t); setShowForm(true); }} 
                    onCopy={t => { setTasks([{...t, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}, ...tasks]); showToast("تم استنساخ المهمة", 'info'); }}
                    onStatusChange={handleStatusChange} 
                    onTogglePin={id => setTasks(tasks.map(t => t.id === id ? {...t, isPinned: !t.isPinned} : t))} 
                    onToggleFavorite={id => setTasks(tasks.map(t => t.id === id ? {...t, isFavorite: !t.isFavorite} : t))}
                  />
                )) : (
                  <div className="col-span-full py-24 text-center border-2 border-dashed border-[var(--border-color)] rounded-[40px] opacity-40">
                    <p className="text-xl font-black text-[var(--text-secondary)] uppercase tracking-widest">
                      {viewFilter === 'COMPLETED' ? 'سجل الإنجازات فارغ' : 'لا يوجد مهام نشطة حالياً'}
                    </p>
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
          onAdd={data => { setTasks([{...data, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}, ...tasks]); setShowForm(false); }} 
          onUpdate={task => { setTasks(tasks.map(t => t.id === task.id ? task : t)); setShowForm(false); setEditingTask(null); }} 
          onClose={() => { setShowForm(false); setEditingTask(null); }} 
          onManageCategories={() => setShowCategoryModal(true)} 
          initialTask={editingTask} categories={categories} 
        />
      )}

      {showCategoryModal && (
        <CategoryModal categories={categories} onAdd={cat => setCategories([...categories, cat])} onUpdate={cat => setCategories(categories.map(c => c.id === cat.id ? cat : c))} onDelete={id => setCategories(categories.filter(c => c.id !== id))} onClose={() => setShowCategoryModal(false)} />
      )}
      
      {toast.visible && (
        <div className="fixed bottom-10 left-10 z-[2000] animate-in slide-in-from-bottom-10">
           <div className={`px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border backdrop-blur-xl ${toast.type === 'success' ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400' : 'bg-rose-600/20 border-rose-500/30 text-rose-400'}`}>
             <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
             <span className="font-bold text-sm">{toast.message}</span>
           </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, type, icon, active, onClick }: any) => {
  const configs = {
    total: 'from-blue-600 to-blue-800',
    completed: 'from-emerald-600 to-emerald-800',
    fav: 'from-rose-600 to-rose-800',
    pending: 'from-amber-600 to-amber-800'
  };
  return (
    <button 
      onClick={onClick}
      className={`relative p-8 rounded-[32px] text-right transition-all duration-500 overflow-hidden shadow-2xl active:scale-95 group border
        ${active ? `bg-gradient-to-br ${configs[type as keyof typeof configs]} text-white border-white/10 scale-105` : 'bg-[var(--panel-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--border-color)]'}
      `}
    >
      <div className="flex items-center justify-between mb-8">
         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all animate-float ${active ? 'bg-white/20 text-white' : 'bg-accent/10 text-accent'}`}>
           <div className="w-6 h-6">{icon}</div>
         </div>
      </div>
      <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-2">{title}</p>
      <p className="text-5xl font-black tracking-tighter drop-shadow-xl">{value}</p>
    </button>
  );
};

export default App;
