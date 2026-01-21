
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
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { 
          x: (rect.left + rect.width / 2) / window.innerWidth, 
          y: (rect.top + rect.height / 2) / window.innerHeight 
        },
        colors: [task.color, '#ff00ff', '#00ffff'],
        disableForReducedMotion: true,
        scalar: 0.7,
        gravity: 1.2,
        ticks: 200
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
    
    // Tilt rotation logic
    const rotateX = ((y - centerY) / centerY) * -12;
    const rotateY = ((x - centerX) / centerX) * 12;
    
    // Deep parallax movement for background elements
    const parallaxX = ((x - centerX) / centerX) * 20;
    const parallaxY = ((y - centerY) / centerY) * 20;
    
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCopyDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const dateText = formatDateFull(task.createdAt);
    navigator.clipboard.writeText(dateText);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const formatShortDate = (dateStr: string) => {
    if (!dateStr) return 'بلا موعد';
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleTogglePinWithAnim = () => {
    setPinAnim(true);
    setTimeout(() => setPinAnim(false), 600);
    onTogglePin(task.id);
  };

  const handleToggleFavoriteWithAnim = () => {
    setFavAnim(true);
    setTimeout(() => setFavAnim(false), 600);
    onToggleFavorite?.(task.id);
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
          ? `perspective(1000px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg)) scale3d(1.05, 1.05, 1.05)` 
          : 'scale3d(1, 1, 1)'
      }}
      className={`group relative rounded-[42px] transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) border animate-in fade-in slide-in-from-bottom-8 will-change-transform overflow-hidden
        ${showCompletionGlow ? 'vibrant-glow-active' : ''}
        ${isCompleted 
          ? 'opacity-70 bg-[var(--panel-bg)] border-[var(--border-color)] shadow-none scale-95' 
          : 'bg-gradient-to-br from-[var(--panel-bg)] via-[var(--panel-bg)] to-transparent border-[var(--border-color)] hover:border-accent/40 shadow-2xl hover:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.45)]'}
      `}
    >
      <style>{`
        /* Futuristic Background Parallax */
        .parallax-layer {
          position: absolute;
          inset: -40px;
          pointer-events: none;
          z-index: 0;
          opacity: 0;
          transition: opacity 0.6s ease;
        }
        .group:hover .parallax-layer { opacity: 1; }

        .parallax-grid {
          background-image: 
            radial-gradient(circle at 1px 1px, ${task.color}15 1px, transparent 0);
          background-size: 32px 32px;
          transform: translate(calc(var(--parallax-x, 0px) * -0.8), calc(var(--parallax-y, 0px) * -0.8));
        }

        .parallax-spot {
          background: radial-gradient(
            circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
            ${task.color}25 0%, 
            transparent 75%
          );
          transform: translate(calc(var(--parallax-x, 0px) * 0.3), calc(var(--parallax-y, 0px) * 0.3));
        }

        @keyframes vibrantGlow {
          0%, 100% { box-shadow: 0 0 20px -5px ${task.color}; }
          50% { box-shadow: 0 0 60px 15px ${task.color}60; }
        }
        .vibrant-glow-active {
          animation: vibrantGlow 2s ease forwards;
        }

        /* Tooltip refinement */
        .creation-date-tooltip {
          position: absolute;
          top: 15px;
          left: 50%;
          transform: translateX(-50%) translateY(-15px);
          opacity: 0;
          visibility: hidden;
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          pointer-events: none;
          white-space: nowrap;
          z-index: 100;
        }
        .group:hover .creation-date-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(calc(0px + var(--rotate-x, 0deg) * 0.4));
          pointer-events: auto;
        }

        /* Icon Hover Refinement */
        .icon-action {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .icon-action:hover {
          transform: translateY(-5px) scale(1.25);
          filter: drop-shadow(0 0 15px currentColor);
          background: currentColor;
          color: white;
        }

        @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spinSlow 3s linear infinite; }
      `}</style>

      {/* Parallax Layers */}
      <div className="parallax-layer parallax-grid" />
      <div className="parallax-layer parallax-spot" />

      <div className="relative p-8 h-full flex flex-col gap-6 z-10">
        
        {/* Creation Date Tooltip */}
        <div 
          onClick={handleCopyDate}
          className="creation-date-tooltip bg-slate-900/95 backdrop-blur-3xl text-white text-[10px] font-black px-6 py-3 rounded-2xl border border-white/15 shadow-2xl flex items-center gap-2.5 cursor-pointer hover:bg-slate-800 transition-all"
        >
           <Icons.Calendar className="w-3.5 h-3.5 text-accent" />
           <span>{copySuccess ? 'تم النسخ!' : `أنشئت في: ${formatDateFull(task.createdAt)}`}</span>
           {!copySuccess && <Icons.Copy className="w-3 h-3 opacity-30 ml-1" />}
        </div>

        {/* AI Insight Popup */}
        {insight && (
          <div className="absolute top-6 left-6 right-6 z-50 animate-in zoom-in-95 slide-in-from-top-6 duration-500">
            <div className="bg-accent text-white p-6 rounded-[32px] shadow-[0_20px_50px_rgba(var(--accent-rgb,37,99,235),0.4)] border border-white/25 text-xs font-black flex items-center gap-5">
              <div className="w-11 h-11 bg-white/20 rounded-2xl flex items-center justify-center animate-pulse shrink-0">
                <Icons.Sparkles className="w-6 h-6" />
              </div>
              <p className="leading-relaxed flex-1">{insight}</p>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div 
              className="w-18 h-18 rounded-[28px] flex items-center justify-center text-white shadow-2xl transition-all duration-700 group-hover:scale-115 group-hover:-rotate-3"
              style={{ 
                backgroundColor: isCompleted ? '#64748b' : task.color,
                boxShadow: isHovered && !isCompleted ? `0 20px 45px ${task.color}60` : 'none'
              }}
            >
              <div className="w-9 h-9">{task.icon && CategoryIconMap[task.icon] ? CategoryIconMap[task.icon] : CategoryIconMap['star']}</div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.25em]">{task.category}</span>
              <span className={`text-[9px] font-black px-3.5 py-1.5 rounded-xl border w-fit transition-all duration-500 ${isCompleted ? 'bg-slate-100 text-slate-500 border-transparent' : priorityMeta.color + ' border-current/20'}`}>
                {priorityMeta.label}
              </span>
            </div>
          </div>

          <button 
            onClick={handleStatusToggle}
            className={`w-15 h-15 rounded-[26px] flex items-center justify-center transition-all duration-500 active:scale-75 border-2 shadow-sm
              ${isCompleted 
                ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/30 shadow-xl scale-110' 
                : 'bg-white/5 border-[var(--border-color)] text-[var(--text-secondary)] hover:border-accent hover:text-accent hover:bg-accent/10'
              }`}
          >
            {isCompleted ? <Icons.CheckCircle className="w-9 h-9" /> : <div className="w-8 h-8 rounded-full border-[4px] border-current opacity-20 transition-opacity group-hover:opacity-100"></div>}
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-5">
          <h3 className={`text-2xl font-black tracking-tighter leading-[1.2] transition-all duration-500
            ${isCompleted ? 'text-slate-400 line-through' : 'text-[var(--text-primary)] group-hover:text-accent'}
          `}>
            {task.title}
          </h3>
          <p className={`text-[15px] font-bold leading-relaxed line-clamp-2 transition-opacity duration-500
            ${isCompleted ? 'text-slate-400 opacity-50' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}
          `}>
            {task.description || "لا توجد تفاصيل إضافية لهذا المسار الرقمي."}
          </p>

          {/* Subtask Progress */}
          {task.subTasks && task.subTasks.length > 0 && (
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                 <span className="opacity-60">مؤشر الإنجاز</span>
                 <span className="text-accent">{subtaskProgress}%</span>
              </div>
              <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden shadow-inner">
                 <div 
                    className="h-full bg-accent transition-all duration-1000 ease-out shadow-[0_0_15px_var(--accent-color)]" 
                    style={{ width: `${subtaskProgress}%` }}
                  />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-8 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <CardAction 
                icon={<Icons.Edit className="w-5 h-5" />} 
                onClick={() => onEdit(task)} 
                title="تعديل" 
                hoverTheme="hover:text-blue-500"
              />
              <CardAction 
                icon={<Icons.Heart className={`w-5 h-5 ${favAnim ? 'animate-bounce' : ''}`} filled={task.isFavorite} />} 
                onClick={handleToggleFavoriteWithAnim} 
                title="المفضلة" 
                hoverTheme={task.isFavorite ? "text-rose-500" : "hover:text-rose-500"}
              />
              <CardAction 
                icon={isInsightLoading ? <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div> : <Icons.Sparkles className="w-5 h-5" />} 
                onClick={handleFetchInsight} 
                title="ذكاء اصطناعي" 
                hoverTheme="hover:text-accent"
              />
              <CardAction 
                icon={<Icons.Copy className="w-5 h-5" />} 
                onClick={() => onCopy(task)} 
                title="نسخ" 
                hoverTheme="hover:text-emerald-500"
              />
              <CardAction 
                icon={<Icons.Pin className={`w-5 h-5 ${pinAnim ? 'animate-spin-slow' : ''}`} filled={task.isPinned} />} 
                onClick={handleTogglePinWithAnim} 
                title="تثبيت" 
                hoverTheme={task.isPinned ? "text-amber-500" : "hover:text-amber-500"}
              />
              <CardAction 
                icon={<Icons.Trash className="w-5 h-5" />} 
                onClick={() => setIsDeleting(true)} 
                title="حذف" 
                hoverTheme="hover:text-rose-500"
              />
            </div>
            
            <div className="flex items-center gap-3 text-[10px] font-black text-[var(--text-secondary)] bg-black/5 px-4.5 py-3 rounded-2xl border border-[var(--border-color)] group/date transition-all hover:border-accent/40 hover:bg-white shadow-sm">
               <Icons.Calendar className="w-4 h-4 opacity-50 group-hover/date:text-accent group-hover/date:scale-110 transition-all" />
               <span className="tracking-tighter">{formatShortDate(task.dueDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deletion Interface */}
      {isDeleting && (
        <div className="absolute inset-0 z-[200] bg-[var(--bg-main)]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 duration-500">
           <div className="w-26 h-26 bg-rose-500/15 rounded-[40px] flex items-center justify-center mb-8 text-rose-500 shadow-2xl animate-bounce">
              <Icons.Trash className="w-13 h-13" />
           </div>
           <h4 className="text-3xl font-black text-[var(--text-primary)] mb-4 tracking-tighter">حذف المهمة؟</h4>
           <p className="text-sm text-[var(--text-secondary)] mb-12 px-6 font-bold max-w-[320px] leading-relaxed opacity-80">سيتم إزالة كافة السجلات الرقمية المتعلقة بهذه المهمة فوراً من السحابة.</p>
           <div className="flex gap-5 w-full max-w-[340px]">
             <button onClick={() => onDelete(task.id)} className="flex-1 py-4.5 bg-rose-600 text-white rounded-[26px] text-[15px] font-black hover:bg-rose-700 transition-all shadow-[0_15px_40px_rgba(225,29,72,0.4)] hover:scale-105 active:scale-95">تأكيد</button>
             <button onClick={() => setIsDeleting(false)} className="flex-1 py-4.5 bg-white/10 text-[var(--text-primary)] border border-[var(--border-color)] rounded-[26px] text-[15px] font-black hover:bg-white/20 transition-all">تراجع</button>
           </div>
        </div>
      )}
    </div>
  );
};

const CardAction = ({ icon, onClick, title, hoverTheme }: { icon: React.ReactNode, onClick: () => void, title: string, hoverTheme: string }) => (
  <button 
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    title={title}
    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-400 active:scale-75 text-[var(--text-secondary)] icon-action ${hoverTheme}`}
  >
    {icon}
  </button>
);

export default TaskCard;
