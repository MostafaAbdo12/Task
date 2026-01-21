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

/**
 * Manual Base64 decoding to Uint8Array
 */
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM data into an AudioBuffer
 */
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
  
  const [showForm, setShowForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const [smartAdvice, setSmartAdvice] = useState('جاري تحليل مصفوفة البيانات...');
  const [isAudioLoading, setIsAudioLoading] = useState(false);

  const [toast, setToast] = useState<{ message: string; visible: boolean; type: ToastType }>({ 
    message: '', visible: false, type: 'success'
  });

  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    setToast({ message: msg, visible: true, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  }, []);

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
          showToast("فشل في مزامنة البيانات", "danger");
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
    if (currentUser && tasks.length >= 0) {
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
        // Correcting audio playback for PCM data
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const decodedBytes = decodeBase64(audioBase64);
        const audioBuffer = await decodeAudioData(decodedBytes, audioContext, 24000, 1);
        
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        source.start();
      } else {
        showToast("فشل في تحميل التقرير الصوتي", "danger");
      }
    } catch (err) {
      console.error("Audio Playback Error:", err);
      showToast("خطأ في تشغيل الصوت", "danger");
    } finally {
      setIsAudioLoading(false);
    }
  };

  const stats = useMemo(() => {
    const activeTasks = tasks.filter(t => t.status !== TaskStatus.COMPLETED);
    const totalActive = activeTasks.length;
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const favorites = activeTasks.filter(t => t.isFavorite).length;
    const pending = activeTasks.filter(t => t.status === TaskStatus.PENDING).length;
    const totalAll = tasks.length;
    const percentage = totalAll > 0 ? Math.round((completed / totalAll) * 100) : 0;
    return { total: totalActive, completed, pending, percentage, favorites };
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
        const isNowCompleted = status === TaskStatus.COMPLETED;
        return {
          ...t,
          status,
          isFavorite: isNowCompleted ? false : t.isFavorite,
          isPinned: isNowCompleted ? false : t.isPinned,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    }));
    if (status === TaskStatus.COMPLETED) {
      showToast("تم إغلاق السجل بنجاح 🎯", 'success');
    }
  };

  if (isInitialLoading) {
    return (
      <div className="h-screen w-full bg-[#020617] flex flex-col items-center justify-center text-white">
        <div className="w-24 h-24 bg-blue-600/10 border border-blue-500/20 rounded-[40px] flex items-center justify-center animate-pulse mb-8">
          <Icons.Sparkles className="w-12 h-12 text-blue-500" />
        </div>
        <p className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Connecting to Neural Matrix...</p>
      </div>
    );
  }

  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  return (
    <div className="h-screen w-full flex bg-[#f8fafc] overflow-hidden font-sans">
      <style>{`
        @keyframes floatIcon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        .animate-float-icon { animation: floatIcon 4s infinite ease-in-out; }
        .glass-card { background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.3); }
      `}</style>
      
      {toast.visible && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[3000] animate-in slide-in-from-top-12">
           <div className={`px-12 py-5 rounded-[32px] shadow-2xl flex items-center gap-5 border ${toast.type === 'success' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-rose-600 border-rose-400 text-white'}`}>
             <span className="font-black text-[15px] tracking-tight">{toast.message}</span>
           </div>
        </div>
      )}

      <Sidebar 
        isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} 
        categories={categories} tasks={tasks} selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory} currentView={currentView}
        onViewChange={setCurrentView} user={currentUser}
        onLogout={() => { storageService.clearSession(); setCurrentUser(null); }}
        onManageCategories={() => setShowCategoryModal(true)}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-16 pt-32 lg:pt-16">
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
            <div>
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tighter">
                {currentView === 'tasks' ? 'قاعة العمليات' : 'مركز التخصيص'}
              </h1>
              <div className="flex items-center gap-5 mt-6">
                 <div className="bg-emerald-50 text-emerald-700 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-3 border border-emerald-100">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    المشغل: {currentUser.username}
                 </div>
                 <button 
                  onClick={handleAudioBriefing}
                  disabled={isAudioLoading}
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-6 py-2 rounded-full text-[11px] font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 border border-blue-100"
                 >
                    {isAudioLoading ? <div className="w-4 h-4 border-2 border-blue-700/20 border-t-blue-700 rounded-full animate-spin"></div> : <Icons.Bell className="w-4 h-4 animate-float-icon" />}
                    تقرير التلخيص الصوتي
                 </button>
              </div>
            </div>

            {currentView === 'tasks' && (
              <div className="flex flex-wrap items-center gap-6">
                <div className="relative flex-1 min-w-[260px] md:max-w-sm">
                   <input 
                    value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    placeholder="البحث في المصفوفة السحابية..."
                    className="w-full bg-white border border-slate-200 rounded-[32px] py-5 pr-14 pl-8 text-base font-bold shadow-lg focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                   />
                   <Icons.Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6" />
                </div>
                <button 
                  onClick={() => setShowForm(true)} 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 py-5 rounded-[32px] text-lg font-black shadow-xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-5 group"
                >
                  <Icons.Plus className="w-7 h-7 group-hover:rotate-180 transition-transform duration-700" />
                  <span>مهمة جديدة</span>
                </button>
              </div>
            )}
          </header>

          {currentView === 'tasks' ? (
            <div className="space-y-24 pb-32">
              <div className="bg-gradient-to-l from-slate-900 to-indigo-900 p-12 rounded-[50px] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden border border-white/10 group">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(37,99,235,0.1),transparent_60%)]"></div>
                  <div className="relative z-10 space-y-5 text-center md:text-right">
                    <div className="flex items-center justify-center md:justify-start gap-4">
                      <Icons.Sparkles className="w-8 h-8 text-indigo-400 animate-float-icon" />
                      <span className="text-[12px] font-black text-indigo-300 uppercase tracking-[0.4em]">تحليلات الذكاء الاصطناعي</span>
                    </div>
                    <h2 className="text-3xl lg:text-5xl font-black text-white leading-tight">
                       {smartAdvice}
                    </h2>
                  </div>
                  <div className="relative z-10 bg-white/5 backdrop-blur-3xl p-10 rounded-[45px] border border-white/10 text-center min-w-[240px] shadow-2xl">
                     <p className="text-7xl font-black text-white tracking-tighter">{stats.percentage}%</p>
                     <p className="text-[12px] font-black text-indigo-200 uppercase tracking-widest mt-4">إجمالي الإنجاز السحابي</p>
                  </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                <StatCard title="المهام النشطة" value={stats.total} type="total" icon={<Icons.LayoutDashboard />} active={viewFilter === 'ALL'} onClick={() => setViewFilter('ALL')} />
                <StatCard title="الأرشيف المنجز" value={stats.completed} type="completed" icon={<Icons.CheckCircle />} active={viewFilter === 'COMPLETED'} onClick={() => setViewFilter('COMPLETED')} />
                <StatCard title="المفضلة" value={stats.favorites} type="fav" icon={<Icons.Sparkles />} active={viewFilter === 'FAVORITES'} onClick={() => setViewFilter('FAVORITES')} />
                <StatCard title="قيد الانتظار" value={stats.pending} type="pending" icon={<Icons.AlarmClock />} active={viewFilter === 'PENDING'} onClick={() => setViewFilter('PENDING')} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12">
                {filteredTasks.length > 0 ? filteredTasks.map((task, idx) => (
                  <TaskCard 
                    key={task.id} task={task} index={idx} 
                    onDelete={id => { setTasks(tasks.filter(t => t.id !== id)); showToast("تم حذف المهمة نهائياً", 'danger'); }} 
                    onEdit={t => { setEditingTask(t); setShowForm(true); }} 
                    onCopy={t => { setTasks([{...t, id: Date.now().toString(), createdAt: new Date().toISOString(), isFavorite: false, isPinned: false}, ...tasks]); showToast("تم استنساخ المهمة", 'info'); }}
                    onStatusChange={handleStatusChange} 
                    onTogglePin={id => setTasks(tasks.map(t => t.id === id ? {...t, isPinned: !t.isPinned} : t))} 
                    onToggleFavorite={id => setTasks(tasks.map(t => t.id === id ? {...t, isFavorite: !t.isFavorite} : t))}
                  />
                )) : (
                  <div className="col-span-full py-40 text-center glass-card rounded-[60px] border-4 border-dashed border-slate-200 opacity-60">
                    <p className="text-3xl font-black text-slate-300 uppercase tracking-[0.3em]">المصفوفة الرقمية فارغة حالياً</p>
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
    </div>
  );
};

const StatCard = ({ title, value, type, icon, active, onClick }: any) => {
  const configs = {
    total: 'from-blue-600 to-blue-800 shadow-blue-100',
    completed: 'from-emerald-500 to-emerald-700 shadow-emerald-100',
    fav: 'from-rose-500 to-rose-700 shadow-rose-100',
    pending: 'from-amber-500 to-amber-700 shadow-amber-100'
  };
  return (
    <button 
      onClick={onClick}
      className={`relative p-10 rounded-[45px] text-right transition-all duration-700 overflow-hidden shadow-2xl active:scale-95 group
        ${active ? `bg-gradient-to-br ${configs[type as keyof typeof configs]} text-white scale-105` : 'bg-white text-slate-400 hover:text-slate-800 border border-slate-100 hover:shadow-xl'}
      `}
    >
      <div className="flex items-center justify-between mb-10">
         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all animate-float-icon ${active ? 'bg-white/20' : 'bg-slate-50'}`}>
           <div className="w-7 h-7">{icon}</div>
         </div>
         {active && <div className="w-3 h-3 rounded-full bg-white animate-ping"></div>}
      </div>
      <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60 mb-2">{title}</p>
      <p className="text-6xl font-black tracking-tighter drop-shadow-lg">{value}</p>
      {active && <div className="absolute bottom-0 right-0 w-full h-1 bg-white/20"></div>}
    </button>
  );
};

export default App;