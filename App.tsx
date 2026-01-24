
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, Category, User, TaskStatus, TaskPriority } from './types';
import { Icons, CategoryIconMap } from './constants';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import Settings from './components/Settings';
import CategoryManagement from './components/CategoryManagement';
import { storageService } from './services/storageService';
import { getSmartAdvice } from './services/geminiService';
import { GoogleGenAI, Modality } from "@google/genai";

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storageService.getSession());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [currentView, setCurrentView] = useState<'tasks' | 'settings' | 'categories'>('tasks');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'priority'>('newest');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [smartAdvice, setSmartAdvice] = useState('تحليل المخطط الزمني...');
  const [toasts, setToasts] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Clock Synchronization
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const addToast = useCallback((message: string, type: 'success' | 'danger' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const playVoiceBriefing = async (force = false) => {
    if (isSpeaking && !force) return;
    setIsSpeaking(true);
    
    try {
      const activeTasks = tasks.filter(t => t.status !== TaskStatus.COMPLETED);
      const topTask = activeTasks.sort((a,b) => (a.priority === TaskPriority.URGENT ? -1 : 1))[0];
      
      const speechText = `أهلاً بك يا ${currentUser?.username || 'مستخدمنا المبدع'}. لديك اليوم ${activeTasks.length} مهام نشطة. أهم ما يجب التركيز عليه هو: ${topTask?.title || 'تحديد أولوياتك لليوم'}. بالتوفيق في إنجازاتك.`;

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: speechText }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData)?.inlineData?.data;
      if (base64Audio) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const audioBuffer = await decodeAudioData(decode(base64Audio), audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.onended = () => setIsSpeaking(false);
        source.start();
      } else {
        setIsSpeaking(false);
      }
    } catch (error) {
      console.error("Athena Voice Error:", error);
      setIsSpeaking(false);
    }
  };

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
        
        if (t.length > 0) {
           addToast("تم تحديث قمرة القيادة بنجاح", "info");
        }
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
    const totalCount = tasks.length;
    const completed = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const active = tasks.filter(t => t.status !== TaskStatus.COMPLETED).length;
    const remaining = tasks.filter(t => t.status === TaskStatus.PENDING).length;
    const favorites = tasks.filter(t => t.isFavorite).length;
    const progress = totalCount > 0 ? Math.round((completed / totalCount) * 100) : 0;
    return { active, remaining, completed, favorites, progress };
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const priorityWeight = { [TaskPriority.URGENT]: 4, [TaskPriority.HIGH]: 3, [TaskPriority.MEDIUM]: 2, [TaskPriority.LOW]: 1 };
    return tasks
      .filter(t => (selectedCategory === 'الكل' || t.category === selectedCategory))
      .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        if (sortBy === 'priority') return priorityWeight[b.priority] - priorityWeight[a.priority];
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [tasks, selectedCategory, searchQuery, sortBy]);

  if (isInitialLoading) return (
    <div className="h-screen w-full flex items-center justify-center bg-[#01040f]">
       <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          <div className="absolute inset-4 border-4 border-indigo-500/20 border-b-indigo-500 rounded-full animate-spin-slow"></div>
       </div>
    </div>
  );

  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  return (
    <div className="flex h-screen bg-[#01040f] overflow-hidden text-slate-200 selection:bg-primary/40">
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
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
           <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full"></div>
           <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 blur-[150px] rounded-full"></div>
        </div>

        <div className="pt-8 px-10 lg:px-14 z-[70] space-y-8 animate-fade-in">
           <header className="h-32 bg-slate-900/40 backdrop-blur-3xl border border-white/[0.08] rounded-[3.5rem] px-12 flex items-center justify-between shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] group relative">
              <div className="flex items-center gap-8 z-10">
                <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-4 bg-white/5 text-slate-400 hover:text-white rounded-[1.5rem] border border-white/10 transition-all active:scale-90">
                  <Icons.LayoutDashboard className="w-7 h-7" />
                </button>
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-primary uppercase tracking-[0.6em] mb-2 opacity-70">مركز العمليات الرقمي</span>
                  <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-4">
                    {currentView === 'tasks' ? (selectedCategory === 'الكل' ? 'القائمة الموحدة' : selectedCategory) : 'تخصيص النظام'}
                    <span className="flex h-3 w-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,1)]"></span>
                  </h1>
                </div>
              </div>

              <div className="hidden xl:flex flex-col items-center justify-center bg-black/40 border border-white/10 rounded-[2.5rem] px-14 py-4 backdrop-blur-2xl shadow-inner group/chronos relative z-10 overflow-hidden">
                  <div className="flex items-center gap-6">
                     <span className="text-4xl font-black text-white tracking-[0.1em] font-mono">
                        {currentTime.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                     </span>
                     <div className="h-8 w-[1px] bg-white/20"></div>
                     <div className="flex flex-col">
                        <span className="text-sm font-black text-primary uppercase tracking-[0.3em]">
                           {currentTime.toLocaleDateString('ar-EG', { weekday: 'long' })}
                        </span>
                        <span className="text-[10px] font-black text-slate-500 tracking-widest mt-0.5">
                           {currentTime.toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}
                        </span>
                     </div>
                  </div>
              </div>

              <div className="flex items-center gap-6 z-10">
                 <div className="relative group/athena">
                    <button 
                        onClick={() => playVoiceBriefing(true)}
                        className={`h-18 w-18 lg:h-20 lg:w-20 rounded-[2.5rem] flex items-center justify-center transition-all duration-500 border border-white/10 shadow-2xl
                          ${isSpeaking ? 'bg-primary text-white scale-110 shadow-[0_0_30px_rgba(99,102,241,0.6)]' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-primary'}
                        `}
                    >
                        {isSpeaking ? (
                          <div className="flex gap-1 items-end h-8">
                             {[1,2,3,4,3,2].map((h, i) => (
                               <div key={i} className={`w-1.5 rounded-full bg-white animate-audio-pulse`} style={{ animationDelay: `${i * 100}ms` }}></div>
                             ))}
                          </div>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
                        )}
                    </button>
                 </div>

                 <button onClick={() => { setEditingTask(null); setShowForm(true); }} className="h-20 bg-primary hover:bg-indigo-500 text-white pl-12 pr-10 rounded-[2.5rem] text-[14px] font-black uppercase tracking-[0.3em] flex items-center gap-4 transition-all shadow-[0_30px_60px_-15px_rgba(99,102,241,0.6)] hover:-translate-y-1.5 active:scale-95">
                    <Icons.Plus className="w-7 h-7" />
                    <span className="hidden md:inline">إدراج مهمة</span>
                 </button>
              </div>
           </header>

           <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <StatOrb label="إجمالي النشطة" value={stats.active} color="indigo" icon={<Icons.LayoutDashboard className="w-6 h-6" />} delay="0ms" />
              <StatOrb label="المهام المتبقية" value={stats.remaining} color="amber" icon={<Icons.Zap className="w-6 h-6" />} delay="150ms" />
              <StatOrb label="المنجزات" value={stats.completed} color="emerald" icon={<Icons.CheckCircle className="w-6 h-6" />} delay="300ms" />
              <StatOrb label="المفضلة" value={stats.favorites} color="rose" icon={<Icons.Heart className="w-6 h-6" />} delay="450ms" />
           </div>

           <div className="relative group p-2 bg-white/[0.02] border border-white/[0.08] rounded-[3rem] shadow-2xl overflow-hidden backdrop-blur-xl">
              <div className="relative h-14 bg-black/60 rounded-[2.8rem] overflow-hidden flex items-center">
                 <div 
                    className="absolute inset-y-0 right-0 bg-gradient-to-l from-primary via-indigo-400 to-primary transition-all duration-[2s] cubic-bezier(0.23, 1, 0.32, 1) shadow-[0_0_40px_rgba(99,102,241,0.8)]"
                    style={{ width: `${stats.progress}%` }}
                 >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-energy-flow"></div>
                 </div>
                 <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="px-10 py-2.5 rounded-full bg-black/50 backdrop-blur-2xl border border-white/10 shadow-2xl transform transition-transform group-hover:scale-105">
                        <span className="text-[13px] font-black text-white uppercase tracking-[0.6em]">
                           {stats.progress}% طاقة الإنتاج الرقمي
                        </span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-12 lg:p-16 space-y-16 no-scrollbar relative">
           {currentView === 'tasks' && (
             <div className="max-w-[1400px] mx-auto space-y-16">
                <div className="bg-white/[0.02] backdrop-blur-[60px] border border-white/[0.08] rounded-[4rem] p-12 flex items-center gap-12 hover:bg-white/[0.04] transition-all group relative overflow-hidden shadow-[0_50px_100px_-30px_rgba(0,0,0,0.7)]">
                   <div className="p-8 bg-primary/10 rounded-[2.5rem] text-primary animate-pulse shadow-2xl shadow-primary/30 border border-primary/20 relative z-10">
                      <Icons.Sparkles className="w-12 h-12" />
                   </div>
                   <div className="flex flex-col relative z-10">
                      <span className="text-[12px] font-black text-primary uppercase tracking-[0.6em] mb-3 opacity-60">توجيهات المحرك الاستراتيجي</span>
                      <p className="text-2xl font-black text-slate-100 tracking-tight leading-snug">"{smartAdvice}"</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                   {filteredTasks.map((t, i) => (
                     <TaskCard 
                      key={t.id} 
                      task={t} 
                      index={i}
                      onDelete={(id) => { setTasks(tasks.filter(x => x.id !== id)); addToast("تم إتلاف السجل بنجاح", "info"); }}
                      onEdit={(x) => { setEditingTask(x); setShowForm(true); }}
                      onCopy={(task) => { setTasks([{...task, id: Date.now().toString(), createdAt: new Date().toISOString()}, ...tasks]); addToast("تم استنساخ المهمة بنجاح", "success"); }}
                      onStatusChange={(id, s) => {
                        setTasks(tasks.map(x => x.id === id ? {...x, status: s} : x));
                        if(s === TaskStatus.COMPLETED) addToast("إنجاز مذهل! تم التحديث", "success");
                      }}
                      onTogglePin={(id) => setTasks(tasks.map(x => x.id === id ? {...x, isPinned: !x.isPinned} : x))}
                      onToggleFavorite={(id) => setTasks(tasks.map(x => x.id === id ? {...x, isFavorite: !x.isFavorite} : x))}
                      onSetReminder={(id, time) => {
                        setTasks(tasks.map(x => x.id === id ? {...x, reminderAt: time} : x));
                        addToast("تمت جدولة التنبيه", "success");
                      }}
                     />
                   ))}
                </div>
             </div>
           )}

           {currentView === 'settings' && <Settings user={currentUser} onUpdate={setCurrentUser} showToast={addToast} bgIntensity="medium" onBgIntensityChange={() => {}} />}
           {currentView === 'categories' && <CategoryManagement categories={categories} onAdd={c => setCategories([...categories, c])} onUpdate={c => setCategories(categories.map(x => x.id === c.id ? c : x))} onDelete={(id) => setCategories(categories.filter(x => x.id !== id))} />}
        </div>
      </main>

      {showForm && (
        <TaskForm 
          onAdd={t => { setTasks([{...t, id: Date.now().toString(), createdAt: new Date().toISOString()}, ...tasks]); setShowForm(false); addToast("تم تفعيل السجل الرقمي", "success"); }}
          onUpdate={t => { setTasks(tasks.map(x => x.id === t.id ? t : x)); setShowForm(false); }}
          onClose={() => setShowForm(false)} categories={categories} initialTask={editingTask}
          onManageCategories={() => { setShowForm(false); setCurrentView('categories'); }}
          taskCounts={tasks.reduce((acc, t) => ({...acc, [t.category]: (acc[t.category] || 0) + 1}), {})}
        />
      )}

      <div className="fixed bottom-12 left-12 flex flex-col gap-6 z-[2000]">
        {toasts.map(t => (
          <div key={t.id} className="bg-slate-950/90 backdrop-blur-[40px] border border-white/10 p-8 rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex items-center gap-6 animate-slide-up border-l-8 border-l-primary group">
             <div className={`w-4 h-4 rounded-full ${t.type === 'success' ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.8)]' : 'bg-primary shadow-[0_0_20px_rgba(99,102,241,0.8)]'}`}></div>
             <span className="text-lg font-black text-white tracking-tight">{t.message}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes audio-pulse { 0%, 100% { height: 20%; } 50% { height: 100%; } }
        .animate-audio-pulse { animation: audio-pulse 0.6s ease-in-out infinite; }
        @keyframes energy-flow { 0% { transform: translateX(250%); } 100% { transform: translateX(-250%); } }
        .animate-energy-flow { animation: energy-flow 4s linear infinite; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px) scale(0.9); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .animate-slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fadeIn 1.2s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const StatOrb = ({ label, value, color, icon, delay }: any) => {
  const colorMap: any = {
    indigo: 'from-indigo-500/10 to-indigo-600/5 text-indigo-400 border-indigo-500/20 shadow-indigo-500/20',
    amber: 'from-amber-500/10 to-amber-600/5 text-amber-400 border-amber-500/20 shadow-amber-500/20',
    emerald: 'from-emerald-500/10 to-emerald-600/5 text-emerald-400 border-emerald-500/20 shadow-emerald-500/20',
    rose: 'from-rose-500/10 to-rose-600/5 text-rose-400 border-rose-500/20 shadow-rose-500/20'
  };

  return (
    <div 
      className={`bg-gradient-to-br ${colorMap[color]} border backdrop-blur-[50px] p-10 rounded-[3.5rem] flex items-center justify-between group hover:-translate-y-3 transition-all duration-700 cursor-default relative overflow-hidden`}
      style={{ animation: `slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay} forwards`, opacity: 0 }}
    >
       <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity bg-gradient-to-tr from-white/10 to-transparent"></div>
       <div className="flex flex-col relative z-10">
          <span className="text-[12px] font-black uppercase tracking-[0.5em] opacity-40 mb-4">{label}</span>
          <span className="text-6xl font-black tracking-tighter transition-all group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_currentColor]">
            {value < 10 ? '0' + value : value}
          </span>
       </div>
       <div className="w-20 h-20 rounded-[2.2rem] bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-all shadow-inner relative z-10">
          <div className="transition-transform group-hover:rotate-12 group-hover:scale-125 duration-700">
             {icon}
          </div>
       </div>
    </div>
  );
};

function decode(base64: string) {
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

export default App;
