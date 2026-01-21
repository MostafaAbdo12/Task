
import React, { useState, useRef, useMemo } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { Icons, PRIORITY_LABELS, CategoryIconMap } from '../constants';
import { getTaskInsight } from '../services/geminiService';
import confetti from 'canvas-confetti';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onCopy: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onTogglePin: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete, onEdit, onCopy, onStatusChange, onTogglePin, onToggleFavorite, index }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [showCompletionGlow, setShowCompletionGlow] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  const [pinAnim, setPinAnim] = useState(false);
  const [favAnim, setFavAnim] = useState(false);
  
  const cardRef = useRef<HTMLDivElement>(null);
  
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const priorityMeta = PRIORITY_LABELS[task.priority] || PRIORITY_LABELS[TaskPriority.MEDIUM];

  const subtaskProgress = useMemo(() => {
    if (!task.subTasks || task.subTasks.length === 0) return 0;
    const completedCount = task.subTasks.filter(st => st.isCompleted).length;
    return Math.round((completedCount / task.subTasks.length) * 100);
  }, [task.subTasks]);

  const handleStatusToggle = (e: React.MouseEvent) => {
    const nextStatus = isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    
    if (nextStatus === TaskStatus.COMPLETED) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      
      // Subtle, refined confetti burst
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { 
          x: (rect.left + rect.width / 2) / window.innerWidth, 
          y: (rect.top + rect.height / 2) / window.innerHeight 
        },
        colors: [task.color, '#6366f1', '#a855f7'],
        disableForReducedMotion: true,
        scalar: 0.6,
        gravity: 0.9,
        ticks: 200,
        shapes: ['circle', 'square']
      });
      
      setShowCompletionGlow(true);
      setTimeout(() => setShowCompletionGlow(false), 2000);
    }
    onStatusChange(task.id, nextStatus);
  };

  const handleFetchInsight = async () => {
    if (isInsightLoading || isCompleted) return;
    setIsInsightLoading(true);
    const text = await getTaskInsight(task);
    setInsight(text);
    setIsInsightLoading(false);
    setTimeout(() => setInsight(null), 12000);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || isCompleted) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Smooth Tilt rotation
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    // Deep parallax movement for inner layers
    const parallaxX = ((x - centerX) / centerX) * 30;
    const parallaxY = ((y - centerY) / centerY) * 30;
    
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    cardRef.current.style.setProperty('--rotate-x', `${rotateX}deg`);
    cardRef.current.style.setProperty('--rotate-y', `${rotateY}deg`);
    cardRef.current.style.setProperty('--parallax-x', `${parallaxX}px`);
    cardRef.current.style.setProperty('--parallax-y', `${parallaxY}px`);
  };

  const resetStyles = () => {
    if (!cardRef.current) return;
    setIsHovered(false);
    cardRef.current.style.setProperty('--rotate-x', `0deg`);
    cardRef.current.style.setProperty('--rotate-y', `0deg`);
    cardRef.current.style.setProperty('--parallax-x', `0px`);
    cardRef.current.style.setProperty('--parallax-y', `0px`);
  };

  const formatDateFull = (dateStr: string) => {
    if (!dateStr) return '---';
    return new Date(dateStr).toLocaleString('ar-EG', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleCopyDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(formatDateFull(task.createdAt));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return 'بلا موعد';
    return new Date(dateStr).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={resetStyles}
      onMouseMove={handleMouseMove}
      style={{ 
        animationDelay: `${index * 60}ms`,
        transform: isHovered && !isCompleted 
          ? `perspective(1000px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg)) translateY(-12px) scale3d(1.05, 1.05, 1.05)` 
          : 'scale3d(1, 1, 1)'
      }}
      className={`group relative rounded-[44px] transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) border animate-in fade-in slide-in-from-bottom-8 will-change-transform overflow-hidden
        ${showCompletionGlow ? 'vibrant-glow-active' : ''}
        ${isCompleted 
          ? 'opacity-60 bg-[var(--panel-bg)] border-[var(--border-color)] shadow-none scale-95 grayscale-[0.3]' 
          : 'glass-panel border-white/20 shadow-2xl hover:shadow-[0_45px_90px_-20px_rgba(0,0,0,0.35)]'}
      `}
    >
      <style>{`
        /* Futuristic Background Layers */
        .parallax-layer {
          position: absolute;
          inset: -40px;
          pointer-events: none;
          z-index: 0;
          opacity: 0;
          transition: opacity 0.8s ease;
        }
        .group:hover .parallax-layer { opacity: 0.25; }

        .parallax-grid-dots {
          background-image: radial-gradient(${task.color} 1.5px, transparent 1.5px);
          background-size: 30px 30px;
          transform: translate(calc(var(--parallax-x, 0px) * -0.6), calc(var(--parallax-y, 0px) * -0.6));
        }

        .parallax-spotlight-glow {
          background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${task.color}30 0%, transparent 70%);
          z-index: 1;
        }

        @keyframes vibrantGlow {
          0%, 100% { box-shadow: 0 0 15px -5px ${task.color}; }
          50% { box-shadow: 0 0 70px 20px ${task.color}50; }
        }
        .vibrant-glow-active {
          animation: vibrantGlow 2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        /* Tooltip Refined Animation */
        .creation-date-tooltip {
          position: absolute;
          top: 15px;
          left: 50%;
          transform: translateX(-50%) translateY(-20px);
          opacity: 0;
          visibility: hidden;
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          pointer-events: none;
          z-index: 100;
        }
        .group:hover .creation-date-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(calc(5px + var(--rotate-x, 0deg) * 0.5));
        }

        /* Icon Action Animations - Refined with Glow & Scale */
        .icon-btn-modern {
          position: relative;
          transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .icon-btn-modern:hover {
          transform: translateY(-6px) scale(1.3);
          filter: drop-shadow(0 0 12px currentColor);
        }
        .icon-btn-modern::after {
          content: '';
          position: absolute;
          inset: -4px;
          background: currentColor;
          opacity: 0;
          border-radius: inherit;
          filter: blur(8px);
          transition: opacity 0.3s ease;
          z-index: -1;
        }
        .icon-btn-modern:hover::after {
          opacity: 0.15;
        }
        
        @keyframes heartPulseEffect { 
          0%, 100% { transform: scale(1); } 
          50% { transform: scale(1.5); filter: drop-shadow(0 0 20px #f43f5e); } 
        }
        .fav-pulse-anim { animation: heartPulseEffect 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275); }

        @keyframes rotatePin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .pin-spin-anim { animation: rotatePin 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
      `}</style>

      {/* Futuristic Background Parallax Elements */}
      <div className="parallax-layer parallax-grid-dots" />
      <div className="parallax-layer parallax-spotlight-glow" />

      <div className="relative p-9 h-full flex flex-col gap-6 z-10">
        
        {/* Creation Date Tooltip (Floating Context) */}
        <div 
          onClick={handleCopyDate}
          className="creation-date-tooltip bg-[var(--bg-main)]/95 backdrop-blur-3xl text-[var(--text-primary)] text-[10px] font-black px-6 py-3 rounded-2xl border border-[var(--border-color)] shadow-2xl flex items-center gap-3 cursor-pointer hover:scale-105 hover:bg-white transition-all"
        >
           <Icons.Calendar className="w-4 h-4 text-accent" />
           <span className="tracking-tight">{copySuccess ? 'تم النسخ للسجل' : `أنشئت في: ${formatShortDate(task.createdAt)}`}</span>
           <Icons.Copy className="w-3 h-3 opacity-20" />
        </div>

        {/* AI Insight Overlay */}
        {insight && (
          <div className="absolute top-6 left-6 right-6 z-50 animate-in zoom-in-95 slide-in-from-top-6 duration-500">
            <div className="bg-accent text-white p-6 rounded-[32px] shadow-[0_25px_60px_-10px_rgba(var(--accent-rgb,37,99,235),0.5)] border border-white/20 text-[12px] font-black flex items-center gap-5">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse shrink-0">
                <Icons.Sparkles className="w-6 h-6" />
              </div>
              <p className="leading-relaxed flex-1">{insight}</p>
            </div>
          </div>
        )}

        {/* Card Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div 
              className="w-20 h-20 rounded-[30px] flex items-center justify-center text-white shadow-2xl transition-all duration-700 group-hover:scale-115 group-hover:rotate-6"
              style={{ 
                backgroundColor: isCompleted ? '#64748b' : task.color,
                boxShadow: isHovered && !isCompleted ? `0 20px 50px ${task.color}60` : 'none'
              }}
            >
              <div className="w-10 h-10">{task.icon && CategoryIconMap[task.icon] ? CategoryIconMap[task.icon] : CategoryIconMap['star']}</div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.25em]">{task.category}</span>
              <span className={`text-[9px] font-black px-4 py-1.5 rounded-xl border w-fit transition-all duration-500 ${isCompleted ? 'bg-slate-100 text-slate-500 border-transparent' : priorityMeta.color + ' border-current/20'}`}>
                {priorityMeta.label}
              </span>
            </div>
          </div>

          <button 
            onClick={handleStatusToggle}
            className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-500 active:scale-75 border-2 shadow-sm
              ${isCompleted 
                ? 'bg-emerald-500 border-emerald-400 text-white shadow-xl scale-110 shadow-emerald-500/30' 
                : 'bg-white/5 border-[var(--border-color)] text-[var(--text-secondary)] hover:border-accent hover:text-accent hover:bg-accent/10'
              }`}
          >
            {isCompleted ? <Icons.CheckCircle className="w-10 h-10" /> : <div className="w-8 h-8 rounded-full border-[4px] border-current opacity-10 group-hover:opacity-100 transition-opacity"></div>}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-4">
          <h3 className={`text-2xl font-black tracking-tight leading-tight transition-all duration-500
            ${isCompleted ? 'text-slate-400 line-through opacity-70' : 'text-[var(--text-primary)] group-hover:text-accent'}
          `}>
            {task.title}
          </h3>
          <p className={`text-[15px] font-bold leading-relaxed line-clamp-2 transition-all duration-500
            ${isCompleted ? 'text-slate-400 opacity-40' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}
          `}>
            {task.description || "لا توجد بيانات تفصيلية متوفرة لهذا المسار الرقمي."}
          </p>

          {/* Execution Roadmap (Progress) */}
          {task.subTasks && task.subTasks.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                 <span className="opacity-60">خارطة التنفيذ</span>
                 <span className="text-accent">{subtaskProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-black/5 rounded-full overflow-hidden shadow-inner border border-black/5">
                 <div 
                    className="h-full bg-accent transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) shadow-[0_0_15px_var(--accent-color)]" 
                    style={{ width: `${subtaskProgress}%` }}
                  />
              </div>
            </div>
          )}
        </div>

        {/* Futuristic Action Interface */}
        <div className="pt-7 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <ActionBtn icon={<Icons.Edit className="w-5 h-5" />} onClick={() => onEdit(task)} title="تعديل" color="hover:text-blue-500" />
              <ActionBtn icon={<Icons.Heart className={`w-5 h-5 ${favAnim ? 'fav-pulse-anim' : ''}`} filled={task.isFavorite} />} onClick={() => { setFavAnim(true); setTimeout(() => setFavAnim(false), 600); onToggleFavorite?.(task.id); }} title="المفضلة" color={task.isFavorite ? 'text-rose-500' : 'hover:text-rose-500'} />
              <ActionBtn icon={isInsightLoading ? <div className="w-4 h-4 border-2 border-accent/20 border-t-accent rounded-full animate-spin"></div> : <Icons.Sparkles className="w-5 h-5" />} onClick={handleFetchInsight} title="ذكاء اصطناعي" color="hover:text-accent" />
              <ActionBtn icon={<Icons.Copy className="w-5 h-5" />} onClick={() => onCopy(task)} title="استنساخ" color="hover:text-emerald-500" />
              <ActionBtn icon={<Icons.Pin className={`w-5 h-5 ${pinAnim ? 'pin-spin-anim' : ''}`} filled={task.isPinned} />} onClick={() => { setPinAnim(true); setTimeout(() => setPinAnim(false), 800); onTogglePin(task.id); }} title="تثبيت" color={task.isPinned ? 'text-amber-500' : 'hover:text-amber-500'} />
              <ActionBtn icon={<Icons.Trash className="w-5 h-5" />} onClick={() => setIsDeleting(true)} title="حذف نهائي" color="hover:text-rose-500" />
            </div>
            
            <div className="flex items-center gap-3 text-[10px] font-black text-[var(--text-secondary)] bg-black/5 px-5 py-3 rounded-2xl border border-[var(--border-color)] group/date transition-all hover:border-accent/30 hover:bg-white shadow-sm">
               <Icons.Calendar className="w-4 h-4 opacity-40 group-hover/date:text-accent group-hover/date:scale-110 transition-all" />
               <span className="tracking-tighter">{formatShortDate(task.dueDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Overlay (Futuristic Glass) */}
      {isDeleting && (
        <div className="absolute inset-0 z-[200] bg-[var(--bg-main)]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-10 text-center animate-in zoom-in-95 duration-500">
           <div className="w-24 h-24 bg-rose-500/10 rounded-[40px] flex items-center justify-center mb-7 text-rose-500 shadow-2xl animate-bounce">
              <Icons.Trash className="w-11 h-11" />
           </div>
           <h4 className="text-3xl font-black text-[var(--text-primary)] mb-4 tracking-tighter">إلغاء البروتوكول؟</h4>
           <p className="text-[13px] text-[var(--text-secondary)] mb-12 px-6 font-bold opacity-70 leading-relaxed max-w-[320px]">تحذير: هذا الإجراء سيقوم بمسح كافة السجلات الرقمية المتعلقة بهذه المهمة نهائياً.</p>
           <div className="flex gap-4 w-full max-w-[340px]">
             <button onClick={() => onDelete(task.id)} className="flex-1 py-5 bg-rose-600 text-white rounded-[26px] text-[14px] font-black hover:bg-rose-700 transition-all shadow-[0_20px_45px_-10px_rgba(225,29,72,0.4)] hover:scale-105 active:scale-95">تأكيد الحذف</button>
             <button onClick={() => setIsDeleting(false)} className="flex-1 py-5 bg-white/5 border border-[var(--border-color)] text-[var(--text-primary)] rounded-[26px] text-[14px] font-black hover:bg-white/20 transition-all">تراجع</button>
           </div>
        </div>
      )}
    </div>
  );
};

const ActionBtn = ({ icon, onClick, title, color }: { icon: React.ReactNode, onClick: () => void, title: string, color: string }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    title={title}
    className={`w-11 h-11 rounded-[18px] flex items-center justify-center transition-all duration-400 active:scale-75 text-[var(--text-secondary)] icon-btn-modern ${color}`}
  >
    {icon}
  </button>
);

export default TaskCard;
