
// Import useMemo hook which was missing and caused a reference error
import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  const cardRef = useRef<HTMLDivElement>(null);
  
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const priorityMeta = PRIORITY_LABELS[task.priority] || PRIORITY_LABELS[TaskPriority.MEDIUM];

  // Subtask progress calculation
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
    
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    cardRef.current.style.setProperty('--rotate-x', `${rotateX}deg`);
    cardRef.current.style.setProperty('--rotate-y', `${rotateY}deg`);
  };

  const resetStyles = () => {
    if (!cardRef.current) return;
    setIsHovered(false);
    cardRef.current.style.setProperty('--rotate-x', `0deg`);
    cardRef.current.style.setProperty('--rotate-y', `0deg`);
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

  return (
    <div 
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={resetStyles}
      onMouseMove={handleMouseMove}
      style={{ 
        animationDelay: `${index * 60}ms`,
        transform: isHovered && !isCompleted 
          ? `perspective(1000px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg)) scale3d(1.04, 1.04, 1.04)` 
          : 'scale3d(1, 1, 1)'
      }}
      className={`group relative rounded-[40px] transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) border animate-in fade-in slide-in-from-bottom-8 will-change-transform overflow-hidden
        ${showCompletionGlow ? 'vibrant-glow-active' : ''}
        ${isCompleted 
          ? 'opacity-70 bg-[var(--panel-bg)] border-[var(--border-color)] shadow-none scale-95' 
          : 'bg-gradient-to-br from-[var(--panel-bg)] via-[var(--panel-bg)] to-transparent border-[var(--border-color)] hover:border-accent/50 shadow-2xl hover:shadow-[0_45px_90px_-20px_rgba(0,0,0,0.5)]'}
      `}
    >
      <style>{`
        .parallax-spotlight {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
            ${task.color}30 0%, 
            transparent 75%
          );
          pointer-events: none;
          z-index: 0;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .group:hover .parallax-spotlight {
          opacity: 1;
        }
        
        @keyframes vibrantGlow {
          0%, 100% { box-shadow: 0 0 20px -5px ${task.color}; }
          50% { box-shadow: 0 0 50px 10px ${task.color}80; }
        }
        .vibrant-glow-active {
          animation: vibrantGlow 2s ease forwards;
        }

        /* Tooltip with parallax offset on hover */
        .creation-date-tooltip {
          position: absolute;
          top: 15px;
          left: 50%;
          transform: translateX(-50%) translateY(-10px);
          opacity: 0;
          visibility: hidden;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          pointer-events: none;
          white-space: nowrap;
          z-index: 100;
        }
        .group:hover .creation-date-tooltip {
          opacity: 1;
          visibility: visible;
          transform: translateX(-50%) translateY(calc(0px + var(--rotate-x, 0deg) * 0.5));
          pointer-events: auto;
        }

        /* Specific Icon Animations */
        .icon-edit:hover { animation: wiggle 0.4s ease infinite; }
        .icon-trash:hover { animation: shake 0.4s ease infinite; }
        .icon-copy:hover { animation: bounce 0.6s ease infinite; }
        .icon-pin:hover { animation: rotateSmall 1s linear infinite; }
        .icon-bell:hover { animation: bellSwing 0.8s ease-in-out infinite; }
        .icon-sparkle:hover { animation: pulseGlow 1.2s infinite; }
        .icon-status:hover { transform: scale(1.15); filter: drop-shadow(0 0 8px currentColor); }

        @keyframes wiggle { 0%, 100% { transform: rotate(-10deg) scale(1.1); } 50% { transform: rotate(10deg) scale(1.1); } }
        @keyframes shake { 0%, 100% { transform: translateX(0) scale(1.1); } 25% { transform: translateX(-2px) scale(1.1); } 75% { transform: translateX(2px) scale(1.1); } }
        @keyframes bounce { 0%, 100% { transform: translateY(0) scale(1.1); } 50% { transform: translateY(-4px) scale(1.1); } }
        @keyframes rotateSmall { from { transform: rotate(0deg) scale(1.1); } to { transform: rotate(360deg) scale(1.1); } }
        @keyframes bellSwing { 0%, 100% { transform: rotate(0deg) scale(1.1); } 25% { transform: rotate(15deg) scale(1.1); } 75% { transform: rotate(-15deg) scale(1.1); } }
        @keyframes pulseGlow { 0%, 100% { transform: scale(1.1); filter: drop-shadow(0 0 2px currentColor); } 50% { transform: scale(1.3); filter: drop-shadow(0 0 10px currentColor); } }
      `}</style>

      {/* Futuristic Background Parallax Layer */}
      <div className="parallax-spotlight" />

      <div className="relative p-8 h-full flex flex-col gap-6 z-10">
        
        {/* Tooltip: Creation Date with Copy Option */}
        <div 
          onClick={handleCopyDate}
          className="creation-date-tooltip bg-slate-900/95 backdrop-blur-2xl text-white text-[10px] font-black px-5 py-2.5 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-2 cursor-pointer hover:bg-slate-800 transition-colors"
        >
           <Icons.Calendar className="w-3.5 h-3.5 text-accent" />
           <span>{copySuccess ? 'تم النسخ!' : `سجل: ${formatDateFull(task.createdAt)}`}</span>
           {!copySuccess && <Icons.Copy className="w-3 h-3 opacity-40 ml-1" />}
        </div>

        {/* AI Insight Popup */}
        {insight && (
          <div className="absolute top-6 left-6 right-6 z-50 animate-in zoom-in-95 slide-in-from-top-4 duration-400">
            <div className="bg-accent text-white p-5 rounded-3xl shadow-2xl border border-white/20 text-xs font-black flex items-center gap-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center animate-pulse">
                <Icons.Sparkles className="w-6 h-6" />
              </div>
              <p className="leading-relaxed">{insight}</p>
            </div>
          </div>
        )}

        {/* Card Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div 
              className="w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-6"
              style={{ 
                backgroundColor: isCompleted ? '#64748b' : task.color,
                boxShadow: isHovered && !isCompleted ? `0 15px 40px ${task.color}50` : 'none'
              }}
            >
              <div className="w-8 h-8">{task.icon && CategoryIconMap[task.icon] ? CategoryIconMap[task.icon] : CategoryIconMap['star']}</div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.2em]">{task.category}</span>
              <span className={`text-[9px] font-black px-3 py-1 rounded-xl border w-fit transition-all duration-500 ${isCompleted ? 'bg-slate-100 text-slate-500 border-transparent' : priorityMeta.color + ' border-current/15'}`}>
                {priorityMeta.label}
              </span>
            </div>
          </div>

          <button 
            onClick={handleStatusToggle}
            className={`w-14 h-14 rounded-[24px] flex items-center justify-center transition-all duration-500 active:scale-75 border-2 shadow-sm icon-status
              ${isCompleted 
                ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/20 shadow-lg' 
                : 'bg-white/5 border-[var(--border-color)] text-[var(--text-secondary)] hover:border-accent hover:text-accent hover:bg-accent/5'
              }`}
          >
            {isCompleted ? <Icons.CheckCircle className="w-8 h-8" /> : <div className="w-7 h-7 rounded-full border-[3px] border-current opacity-20 transition-opacity group-hover:opacity-100"></div>}
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 space-y-4">
          <h3 className={`text-2xl font-black tracking-tight leading-tight transition-all duration-500
            ${isCompleted ? 'text-slate-400 line-through' : 'text-[var(--text-primary)] group-hover:text-accent'}
          `}>
            {task.title}
          </h3>
          <p className={`text-[15px] font-medium leading-relaxed line-clamp-2 transition-opacity duration-500
            ${isCompleted ? 'text-slate-400 opacity-50' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}
          `}>
            {task.description || "لا توجد تفاصيل إضافية لهذا المسار الرقمي."}
          </p>

          {/* Subtask Progress Bar */}
          {task.subTasks && task.subTasks.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)]">
                 <span>خارطة التنفيذ</span>
                 <span className="text-accent">{subtaskProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-black/10 rounded-full overflow-hidden">
                 <div 
                    className="h-full bg-accent transition-all duration-1000 ease-out shadow-[0_0_10px_var(--accent-color)]" 
                    style={{ width: `${subtaskProgress}%` }}
                  />
              </div>
            </div>
          )}
        </div>

        {/* Footer and Action Interface */}
        <div className="pt-7 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <CardAction 
                icon={<Icons.Edit className="w-5 h-5 icon-edit" />} 
                onClick={() => onEdit(task)} 
                title="تعديل المهمة" 
                hoverTheme="hover:text-blue-500 hover:bg-blue-500/10"
              />
              <CardAction 
                icon={<Icons.Bell className="w-5 h-5 icon-bell" />} 
                onClick={() => {}} 
                title="ضبط تذكير" 
                hoverTheme="hover:text-indigo-500 hover:bg-indigo-500/10"
              />
              <CardAction 
                icon={isInsightLoading ? <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div> : <Icons.Sparkles className="w-5 h-5 icon-sparkle" />} 
                onClick={handleFetchInsight} 
                title="نصيحة ذكية" 
                hoverTheme="hover:text-accent hover:bg-accent/10"
              />
              <CardAction 
                icon={<Icons.Copy className="w-5 h-5 icon-copy" />} 
                onClick={() => onCopy(task)} 
                title="استنساخ" 
                hoverTheme="hover:text-emerald-500 hover:bg-emerald-500/10"
              />
              <CardAction 
                icon={<Icons.Pin className="w-5 h-5 icon-pin" filled={task.isPinned} />} 
                onClick={() => onTogglePin(task.id)} 
                title={task.isPinned ? "إلغاء التثبيت" : "تثبيت في الواجهة"} 
                hoverTheme={task.isPinned ? "text-amber-500 bg-amber-500/10" : "hover:text-amber-500 hover:bg-amber-500/10"}
              />
              <CardAction 
                icon={<Icons.Trash className="w-5 h-5 icon-trash" />} 
                onClick={() => setIsDeleting(true)} 
                title="حذف نهائي" 
                hoverTheme="hover:text-rose-500 hover:bg-rose-500/10"
              />
            </div>
            
            <div className="flex items-center gap-3 text-[10px] font-black text-[var(--text-secondary)] bg-black/5 px-4 py-2.5 rounded-[20px] border border-[var(--border-color)] group/date transition-all hover:border-accent/30">
               <Icons.Calendar className="w-4 h-4 opacity-40 group-hover/date:text-accent transition-colors" />
               <span>{formatShortDate(task.dueDate)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Deletion Interface Overlay */}
      {isDeleting && (
        <div className="absolute inset-0 z-[200] bg-[var(--bg-main)]/95 backdrop-blur-3xl flex flex-col items-center justify-center p-10 text-center animate-in zoom-in-95 duration-400">
           <div className="w-24 h-24 bg-rose-500/10 rounded-[35px] flex items-center justify-center mb-6 text-rose-500 shadow-lg animate-bounce">
              <Icons.Trash className="w-12 h-12" />
           </div>
           <h4 className="text-2xl font-black text-[var(--text-primary)] mb-3">إزالة المهمة؟</h4>
           <p className="text-sm text-[var(--text-secondary)] mb-10 px-4 font-bold max-w-[300px] leading-relaxed">هذا الإجراء سيقوم بمسح البيانات والملحقات المرتبطة نهائياً.</p>
           <div className="flex gap-4 w-full max-w-[320px]">
             <button onClick={() => onDelete(task.id)} className="flex-1 py-4 bg-rose-600 text-white rounded-[24px] text-[14px] font-black hover:bg-rose-700 transition-all shadow-lg shadow-rose-600/30">تأكيد</button>
             <button onClick={() => setIsDeleting(false)} className="flex-1 py-4 bg-white/10 text-[var(--text-primary)] rounded-[24px] text-[14px] font-black hover:bg-white/20 transition-all">تراجع</button>
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
    className={`w-11 h-11 rounded-[18px] flex items-center justify-center transition-all duration-300 active:scale-75 text-[var(--text-secondary)] ${hoverTheme}`}
  >
    {icon}
  </button>
);

export default TaskCard;
