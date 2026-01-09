
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Task, TaskStatus, Category, User } from './types';
import { Icons, DEFAULT_CATEGORIES } from './constants';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import { getSmartAdvice, getSystemBriefingAudio } from './services/geminiService';

// Audio decoding helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
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
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('maham_active_session');
    if (!saved) return null;
    const user = JSON.parse(saved);
    return { ...user, xp: user.xp || 0, level: user.level || 1 };
  });

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [systemAdvice, setSystemAdvice] = useState('جارٍ معايرة النظم...');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [fullScreenConfetti, setFullScreenConfetti] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (currentUser) {
      const saved = localStorage.getItem(`tasks_${currentUser.username}`);
      if (saved) setTasks(JSON.parse(saved));
      
      const refreshSystem = async () => {
        const advice = await getSmartAdvice(tasks);
        setSystemAdvice(advice);
      };
      refreshSystem();

      const playBriefing = async () => {
        const audioBase64 = await getSystemBriefingAudio(currentUser.username, tasks);
        if (audioBase64) {
          if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          }
          const ctx = audioContextRef.current;
          const audioBytes = decode(audioBase64);
          const buffer = await decodeAudioData(audioBytes, ctx, 24000, 1);
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start();
        }
      };
      
      const handleFirstInteraction = () => {
        playBriefing();
        window.removeEventListener('click', handleFirstInteraction);
      };
      window.addEventListener('click', handleFirstInteraction);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`tasks_${currentUser.username}`, JSON.stringify(tasks));
      localStorage.setItem('maham_active_session', JSON.stringify(currentUser));
    }
  }, [tasks, currentUser]);

  const handleStatusChange = (id: string, status: TaskStatus) => {
    const prevStatus = tasks.find(t => t.id === id)?.status;
    
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));

    // إذا تحولت المهمة إلى مكتملة
    if (status === TaskStatus.COMPLETED && prevStatus !== TaskStatus.COMPLETED) {
      triggerCelebration();
    }
  };

  const triggerCelebration = () => {
    // 1. تفعيل المفرقعات
    setFullScreenConfetti(true);
    setTimeout(() => setFullScreenConfetti(false), 3000);

    // 2. تحديث المستوى و XP
    setCurrentUser(prev => {
      if (!prev) return null;
      const newXp = (prev.xp || 0) + 20;
      const newLevel = Math.floor(newXp / 100) + 1;
      return { ...prev, xp: newXp, level: newLevel };
    });
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => (selectedCategory === 'الكل' || t.category === selectedCategory))
      .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => (a.isPinned === b.isPinned ? 0 : a.isPinned ? -1 : 1));
  }, [tasks, selectedCategory, searchQuery]);

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === TaskStatus.COMPLETED).length,
    pending: tasks.filter(t => t.status !== TaskStatus.COMPLETED).length
  }), [tasks]);

  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  return (
    <div className="h-screen w-full flex bg-transparent overflow-hidden relative selection:bg-cmd-accent/30">
      
      {/* Global Full-Screen Confetti Particles */}
      {fullScreenConfetti && (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          {[...Array(50)].map((_, i) => (
            <div 
              key={i}
              className="confetti-global rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#00f2ff', '#7000ff', '#ffffff', '#00ffaa'][Math.floor(Math.random() * 4)],
                width: `${Math.random() * 10 + 5}px`,
                height: `${Math.random() * 10 + 5}px`,
                animationDelay: `${Math.random() * 1}s`,
              }}
            />
          ))}
        </div>
      )}

      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        categories={DEFAULT_CATEGORIES}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        user={currentUser}
        onLogout={() => {
          localStorage.removeItem('maham_active_session');
          setCurrentUser(null);
        }}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 border-r border-cmd-border bg-transparent">
        
        {/* Universal Command Bar */}
        <header className="h-24 px-8 border-b border-cmd-border flex items-center justify-between bg-black/20 backdrop-blur-md">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-lg text-white/60"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
            </button>
            <div className="hidden md:flex items-center gap-4 text-cmd-text-dim font-mono text-xs tracking-tighter uppercase">
              <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-cmd-accent animate-pulse"></div> نظام القيادة نشط</span>
              <span className="w-1 h-1 rounded-full bg-white/20"></span>
              <span>{new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center bg-white/5 border border-white/5 rounded-full px-5 py-2 group focus-within:border-cmd-accent/30 transition-all">
              <Icons.Search className="w-4 h-4 text-white/30 group-focus-within:text-cmd-accent" />
              <input 
                placeholder="ابحث في قاعدة البيانات..." 
                className="bg-transparent border-none outline-none px-4 text-xs font-medium w-64 text-white placeholder:text-white/20"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="flex items-center gap-3 bg-white text-black px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-cmd-accent transition-all cmd-button-glow"
            >
              <Icons.Plus className="w-4 h-4" />
              <span>مهمة جديدة</span>
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-8">
          <div className="max-w-6xl mx-auto space-y-12">
            
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'إجمالي المهام', value: stats.total, icon: Icons.Folder, color: 'text-white' },
                { label: 'قيد الإنجاز', value: stats.pending, icon: Icons.AlarmClock, color: 'text-cmd-accent' },
                { label: 'تمت أرشفتها', value: stats.completed, icon: Icons.CheckCircle, color: 'text-emerald-400' }
              ].map((item, i) => (
                <div key={i} className="cmd-glass p-6 rounded-3xl border border-cmd-border flex items-center justify-between group hover:border-white/10 transition-all">
                   <div>
                      <p className="text-[10px] text-cmd-text-dim uppercase font-black tracking-widest mb-2">{item.label}</p>
                      <h4 className={`text-4xl font-mono font-black ${item.color}`}>{String(item.value).padStart(2, '0')}</h4>
                   </div>
                   <item.icon className={`w-8 h-8 ${item.color} opacity-20 group-hover:opacity-100 transition-opacity`} />
                </div>
              ))}
            </div>

            {/* AI Advisor Banner */}
            <div className="cmd-glass p-6 rounded-[2rem] flex items-center gap-6 border-l-4 border-l-cmd-accent">
               <div className="w-12 h-12 rounded-full bg-cmd-accent/10 flex items-center justify-center shrink-0">
                  <Icons.Sparkles className="w-6 h-6 text-cmd-accent" />
               </div>
               <div>
                  <p className="text-[10px] text-cmd-accent font-black uppercase tracking-widest mb-1">توصية الذكاء الاصطناعي</p>
                  <p className="text-sm font-medium text-white/80 italic">{systemAdvice}</p>
               </div>
            </div>

            {/* Task List */}
            <div className="space-y-6">
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
                <div className="h-64 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                  <Icons.Folder className="w-16 h-16" />
                  <p className="text-sm font-black uppercase tracking-[0.4em]">لا يوجد سجل بيانات متاح</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showForm && (
        <TaskForm 
          onAdd={data => {
            setTasks([{...data, id: Date.now().toString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()}, ...tasks]);
            setShowForm(false);
          }}
          onUpdate={task => {
            setTasks(tasks.map(t => t.id === task.id ? {...task, updatedAt: new Date().toISOString()} : t));
            setShowForm(false);
            setEditingTask(null);
          }}
          onClose={() => { setShowForm(false); setEditingTask(null); }}
          initialTask={editingTask}
          categories={DEFAULT_CATEGORIES}
        />
      )}
    </div>
  );
};

export default App;
