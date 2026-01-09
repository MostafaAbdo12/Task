
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, TaskStatus, Category, User, TaskStats } from './types';
import { Icons, DEFAULT_CATEGORIES } from './constants';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import { getSmartAdvice, getSmartSubtasks, getSystemBriefingAudio } from './services/geminiService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('maham_active_session');
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [aiAdvice, setAiAdvice] = useState('جاري مزامنة الوعي الرقمي...');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (currentUser) {
      const savedTasks = localStorage.getItem(`tasks_${currentUser.username}`);
      if (savedTasks) {
        try { setTasks(JSON.parse(savedTasks)); } catch(e) { setTasks([]); }
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`tasks_${currentUser.username}`, JSON.stringify(tasks));
      const tid = setTimeout(() => getSmartAdvice(tasks).then(setAiAdvice), 3000);
      return () => clearTimeout(tid);
    }
  }, [tasks]);

  const stats = useMemo<TaskStats>(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
    pending: tasks.filter(t => t.status === TaskStatus.PENDING).length,
    inProgress: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length,
  }), [tasks]);

  const handlePlayBriefing = async () => {
    if (!currentUser) return;
    setIsAudioLoading(true);
    const audioData = await getSystemBriefingAudio(currentUser.username, tasks);
    if (audioData) {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffer = await decodeAudioData(decodeBase64(audioData), audioContextRef.current);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    }
    setIsAudioLoading(false);
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => (selectedCategory === 'الكل' || t.category === selectedCategory))
      .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));
  }, [tasks, selectedCategory, searchQuery]);

  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  return (
    <div className="h-screen w-full flex bg-[#020205] text-zinc-400 overflow-hidden select-none relative perspective-1000">
      
      {/* Background Smeared Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[60vw] h-[60vh] bg-cyber-blue/5 blur-[120px] rounded-full animate-aura-shift"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[60vw] h-[60vh] bg-cyber-purple/5 blur-[120px] rounded-full animate-aura-shift" style={{ animationDirection: 'reverse' }}></div>
      </div>

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        user={currentUser}
        onLogout={() => {
          localStorage.removeItem('maham_active_session');
          setCurrentUser(null);
        }}
      />

      <main className="flex-1 flex flex-col h-full relative z-10">
        {/* Futuristic Glass Header */}
        <header className="h-24 flex items-center justify-between px-10 border-b border-white/5 backdrop-blur-3xl bg-black/20">
           <div className="flex items-center gap-8">
             <button 
                onClick={() => setIsSidebarOpen(true)}
                className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:border-cyber-blue/40 hover:bg-cyber-blue/5 transition-all group"
             >
               <Icons.Chevron className="-rotate-90 group-hover:scale-110 text-zinc-500 group-hover:text-cyber-blue transition-all" />
             </button>

             <div className="flex flex-col">
                <h1 className="text-xl font-black text-white tracking-widest uppercase flex items-center gap-2">
                  <span className="text-cyber-blue">{selectedCategory}</span> 
                  <span className="opacity-20">/</span>
                  <span className="text-xs opacity-40">INTERFACE_V6</span>
                </h1>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyber-emerald animate-pulse shadow-[0_0_8px_#00ffaa]"></div>
                  <span className="text-[8px] font-black text-zinc-600 tracking-[0.4em] uppercase">User: {currentUser.username}</span>
                </div>
             </div>
           </div>
           
           <div className="flex items-center gap-6">
             <div className="hidden lg:flex items-center bg-black/40 rounded-xl px-5 py-2.5 border border-white/5 focus-within:border-cyber-blue/30 transition-all group backdrop-blur-xl">
                <Icons.Search className="text-zinc-700 group-focus-within:text-cyber-blue transition-colors w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="SEARCH_DB..." 
                  className="bg-transparent border-none outline-none px-4 text-[9px] w-40 focus:w-64 transition-all text-white font-black tracking-widest placeholder:text-zinc-800"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
             </div>
             
             <button 
               onClick={() => setShowForm(true)}
               className="relative group h-12 px-8 overflow-hidden rounded-xl active:scale-95 transition-all"
             >
               <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue to-cyber-purple animate-shimmer opacity-80 group-hover:opacity-100"></div>
               <div className="relative h-full flex items-center gap-3">
                 <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">NEW_TASK</span>
                 <Icons.Plus className="text-white w-4 h-4 group-hover:rotate-90 transition-transform" />
               </div>
             </button>
           </div>
        </header>

        {/* Cinematic Dashboard Area */}
        <div className="flex-1 overflow-y-auto px-10 py-8 lg:px-20 no-scrollbar">
          <div className="max-w-7xl mx-auto space-y-12 pb-12">
            
            {/* Bento Statistics Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
               <div className="xl:col-span-8 crystal-card p-10 group relative overflow-hidden rounded-[2.5rem]">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyber-blue/10 blur-[80px] pointer-events-none group-hover:bg-cyber-blue/20 transition-all"></div>
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-blue/40 to-transparent animate-scan-line opacity-30"></div>
                  
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyber-blue shadow-[0_0_10px_#00f2ff] animate-pulse"></div>
                      <span className="text-[9px] font-black text-cyber-blue uppercase tracking-[0.4em]">NEURAL_ADVISOR_ONLINE</span>
                    </div>
                    <button 
                      onClick={handlePlayBriefing}
                      disabled={isAudioLoading}
                      className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-cyber-purple/20 hover:text-cyber-purple transition-all"
                    >
                      {isAudioLoading ? <Icons.Sparkles className="animate-spin w-4 h-4" /> : <Icons.Sun className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-4xl font-black text-white leading-tight tracking-tighter mb-6 transition-all duration-700 group-hover:text-cyber-blue">
                    {aiAdvice}
                  </p>
               </div>

               <div className="xl:col-span-4 crystal-card p-8 flex flex-col items-center justify-center rounded-[2.5rem] group">
                  <div className="relative w-24 h-24 mb-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" className="stroke-white/5 fill-none" strokeWidth="6" />
                      <circle 
                        cx="50" cy="50" r="42" 
                        className="stroke-cyber-emerald fill-none transition-all duration-1000 ease-out" 
                        strokeWidth="6"
                        strokeDasharray="264"
                        strokeDashoffset={264 - (264 * (stats.total > 0 ? stats.completed / stats.total : 0))}
                        strokeLinecap="round"
                        style={{ filter: 'drop-shadow(0 0 8px #00ffaa)' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <span className="text-2xl font-black text-white">{stats.total > 0 ? Math.round((stats.completed/stats.total)*100) : 0}%</span>
                    </div>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-[0.5em] text-zinc-600">SYNC_LEVEL</span>
               </div>
            </div>

            {/* Task Registry Header */}
            <div className="space-y-8">
               <div className="flex items-center gap-8">
                  <h2 className="text-xs font-black text-white uppercase tracking-[0.8em] flex items-center gap-3">
                    <Icons.Bell className="text-cyber-blue w-4 h-4" /> TASK_REGISTRY
                  </h2>
                  <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 via-white/5 to-transparent"></div>
               </div>

               <div className="grid grid-cols-1 gap-6">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task, idx) => (
                      <TaskCard 
                        key={task.id}
                        task={task}
                        index={idx}
                        onDelete={(id) => setTasks(tasks.filter(t => t.id !== id))}
                        onEdit={(t) => { setEditingTask(t); setShowForm(true); }}
                        onCopy={(t) => setTasks([{...t, id: Date.now().toString(), title: `${t.title} (COPY)`}, ...tasks])}
                        onStatusChange={(id, status) => setTasks(tasks.map(t => t.id === id ? {...t, status} : t))}
                        onTogglePin={(id) => setTasks(tasks.map(t => t.id === id ? {...t, isPinned: !t.isPinned} : t))}
                        onBreakdown={async (task) => {
                           const subs = await getSmartSubtasks(task.title, task.description);
                           const newSubs = subs.map(s => ({ id: Math.random().toString(), title: s, isCompleted: false }));
                           setTasks(tasks.map(t => t.id === task.id ? {...t, subTasks: [...t.subTasks, ...newSubs]} : t));
                        }}
                        onToggleSubtask={(tid, sid) => {
                          setTasks(tasks.map(t => t.id === tid ? {
                            ...t, subTasks: t.subTasks.map(s => s.id === sid ? {...s, isCompleted: !s.isCompleted} : s)
                          } : t));
                        }}
                      />
                    ))
                  ) : (
                    <div className="py-32 text-center rounded-[3rem] border border-dashed border-white/5 bg-black/20 flex flex-col items-center justify-center group">
                       <Icons.FileUp className="text-zinc-800 w-12 h-12 mb-6 group-hover:scale-110 group-hover:text-cyber-blue transition-all" />
                       <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[1em]">SYSTEM_STANDBY</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Global Credit Meta */}
            <footer className="pt-12 pb-6 border-t border-white/5 flex flex-col items-center gap-4">
               <div className="flex items-center gap-5">
                  <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-zinc-800"></div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
                    صنع بكل <span className="text-cyber-rose animate-pulse">❤️</span> بواسطة 
                    <span className="mr-2 text-white font-black hover:text-cyber-blue transition-all cursor-default">Mostafa Abdo</span>
                  </p>
                  <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-zinc-800"></div>
               </div>
               <span className="text-[7px] font-black text-zinc-700 tracking-[0.5em] uppercase">© 2025 HYPER-ENJAZ CORE ENGINE</span>
            </footer>

          </div>
        </div>
      </main>

      {showForm && (
        <TaskForm 
          onAdd={(data) => { 
            const newTask = { ...data, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
            setTasks([newTask, ...tasks]); 
            setShowForm(false); 
          }}
          onUpdate={(task) => { 
            setTasks(tasks.map(t => t.id === task.id ? { ...task, updatedAt: new Date().toISOString() } : t)); 
            setEditingTask(null); 
            setShowForm(false); 
          }}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
          initialTask={editingTask}
          categories={categories}
        />
      )}
    </div>
  );
};

// Helpers for Audio Decoding
function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, 24000);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

export default App;
