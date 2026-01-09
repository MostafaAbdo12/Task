
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, TaskStatus, Category, User } from './types';
import { Icons, DEFAULT_CATEGORIES } from './constants';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Sidebar from './components/Sidebar';
import { getSmartAdvice, getSmartSubtasks, getSystemBriefingAudio } from './services/geminiService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('maham_active_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [aiAdvice, setAiAdvice] = useState('جاري استقراء ذكاء المسار...');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusTime, setFocusTime] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (currentUser) {
      const savedTasks = localStorage.getItem(`tasks_${currentUser.username}`);
      setTasks(savedTasks ? JSON.parse(savedTasks) : []);
      playBriefing();
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`tasks_${currentUser.username}`, JSON.stringify(tasks));
      const tid = setTimeout(updateAiAdvice, 1500);
      return () => clearTimeout(tid);
    }
  }, [tasks]);

  useEffect(() => {
    let interval: any;
    if (isTimerRunning && focusTime > 0) {
      interval = setInterval(() => setFocusTime(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, focusTime]);

  const updateAiAdvice = async () => {
    const advice = await getSmartAdvice(tasks);
    setAiAdvice(advice);
  };

  const playBriefing = async () => {
    if (!currentUser) return;
    const base64Audio = await getSystemBriefingAudio(currentUser.username, tasks);
    if (base64Audio) {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const ctx = audioContextRef.current;
      const arrayBuffer = Uint8Array.from(atob(base64Audio), c => c.charCodeAt(0)).buffer;
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => selectedCategory === 'الكل' || t.category === selectedCategory)
      .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));
  }, [tasks, selectedCategory]);

  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  return (
    <div className="h-screen w-full flex overflow-hidden font-sans select-none">
      
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

      <main className={`flex-1 flex flex-col h-full relative transition-all duration-1000 ${isFocusMode ? 'opacity-0 translate-y-20 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
        
        {/* Transparent Glass Header */}
        <nav className="h-24 flex items-center justify-between px-8 lg:px-16 border-b border-white/5 backdrop-blur-md sticky top-0 z-40">
           <div className="flex items-center gap-8">
             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 hover:bg-white/10 rounded-2xl transition-all active:scale-90">
               <Icons.Chevron />
             </button>
             <div className="flex flex-col">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-1 animate-pulse">Neural Workspace</span>
                <h1 className="text-2xl font-bold tracking-tight">{selectedCategory}</h1>
             </div>
           </div>
           
           <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsFocusMode(true)}
               className="p-4 glass-morphism rounded-2xl hover:bg-white/10 hover:text-indigo-400 transition-all active:scale-95 group"
             >
               <div className="group-hover:rotate-45 transition-transform duration-500"><Icons.Eye /></div>
             </button>
             <button 
               onClick={() => setShowForm(true)}
               className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-2xl font-black text-sm shadow-[0_15px_30px_-10px_rgba(79,70,229,0.5)] flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
             >
               <Icons.Plus /> إضافة مهمة
             </button>
           </div>
        </nav>

        <div className="flex-1 overflow-y-auto px-6 py-12 lg:px-24 lg:py-20 custom-scrollbar">
          
          {/* Animated Hero Header */}
          <header className="max-w-4xl mx-auto mb-20 stagger-item">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-16 h-16 rounded-[2rem] bg-indigo-500/20 flex items-center justify-center text-indigo-400 animate-float shadow-inner">
                <Icons.Sparkles />
              </div>
              <div>
                <h2 className="text-4xl lg:text-6xl font-black leading-none mb-2 animate-reveal-text">طاب يومك، {currentUser.username}</h2>
                <p className="text-slate-500 font-medium tracking-wide">نظامك الإداري جاهز للتحليق.</p>
              </div>
            </div>
            
            <div className="glass-morphism p-8 rounded-[2.5rem] border-l-8 border-indigo-500/50 flex items-center gap-6 group hover:border-indigo-400 transition-all duration-700">
              <div className="text-indigo-400 opacity-60 group-hover:opacity-100 transition-opacity"><Icons.Sparkles /></div>
              <p className="text-base lg:text-lg font-semibold text-slate-200 italic tracking-tight transition-all group-hover:translate-x-1">"{aiAdvice}"</p>
            </div>
          </header>

          {/* Grid with stagger */}
          <div className="max-w-4xl mx-auto space-y-6">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, idx) => (
                <TaskCard 
                  key={task.id}
                  task={task}
                  index={idx}
                  onDelete={(id) => setTasks(tasks.filter(t => t.id !== id))}
                  onEdit={(t) => { setEditingTask(t); setShowForm(true); }}
                  onCopy={(t) => setTasks([{...t, id: Date.now().toString(), title: `${t.title} (نسخة)`}, ...tasks])}
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
              <div className="py-40 text-center opacity-20">
                <div className="text-8xl mb-6 animate-float"><Icons.Folder /></div>
                <p className="text-2xl font-black uppercase tracking-[0.3em]">No Records Found</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Full-Screen Motion Focus Overlay */}
      {isFocusMode && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 animate-reveal-text backdrop-blur-3xl">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-indigo-500/10 blur-[200px] rounded-full animate-pulse-glow"></div>
          </div>
          
          <div className="relative text-center z-10">
             <div className="text-[180px] lg:text-[240px] font-thin tracking-tighter leading-none mb-4 font-mono select-none">
               {Math.floor(focusTime / 60)}<span className={`transition-opacity duration-500 ${focusTime % 2 === 0 ? 'opacity-100' : 'opacity-20'}`}>:</span>{String(focusTime % 60).padStart(2, '0')}
             </div>
             <p className="text-xs tracking-[1.5em] uppercase text-indigo-400 mb-20 opacity-50 font-black">Focus State Active</p>
             
             <div className="flex gap-8 justify-center">
               <button 
                 onClick={() => setIsTimerRunning(!isTimerRunning)} 
                 className={`w-24 h-24 rounded-[2.5rem] glass-morphism flex items-center justify-center transition-all hover:scale-110 active:scale-90 ${isTimerRunning ? 'bg-indigo-600 text-white' : 'hover:bg-white/10 text-white'}`}
               >
                 {isTimerRunning ? <Icons.X /> : <Icons.Plus />}
               </button>
               <button 
                 onClick={() => { setIsFocusMode(false); setIsTimerRunning(false); }} 
                 className="w-24 h-24 rounded-[2.5rem] glass-morphism flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-400 transition-all hover:scale-110 active:scale-90"
               >
                 إلغاء
               </button>
             </div>
          </div>
        </div>
      )}

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

// Simplified Auth for demonstration
const Auth: React.FC<{onLogin: (user: User) => void}> = ({onLogin}) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin({ username, lastLogin: new Date().toISOString() });
    }
  };

  return (
    <div className="h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-slate-950">
       <div className="w-full max-w-md relative z-10 stagger-item">
          <div className="mb-16 text-center">
            <div className="inline-block p-8 glass-morphism rounded-[3rem] mb-10 animate-float shadow-2xl">
              <div className="scale-[2.5] text-indigo-500"><Icons.Sparkles /></div>
            </div>
            <h1 className="text-5xl font-black tracking-tighter mb-4">إنجاز <span className="text-indigo-500">Motion</span></h1>
            <p className="text-slate-400 font-medium tracking-wide">الجيل القادم من الإنتاجية السائلة</p>
          </div>
          
          <form onSubmit={handleSubmit} className="glass-morphism p-12 rounded-[3.5rem] border-white/5 space-y-6">
            <input 
              type="text" placeholder="اسم المستخدم العبقري"
              value={username} onChange={e => setUsername(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-8 outline-none focus:border-indigo-500 transition-all text-base font-bold text-center"
              required
            />
            <button className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 active:scale-95 text-lg uppercase tracking-widest">
              إقلاع النظام
            </button>
          </form>
       </div>
    </div>
  )
}

export default App;
