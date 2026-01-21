
import React, { useState, useRef } from 'react';
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
  const cardRef = useRef<HTMLDivElement>(null);
  
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const priorityMeta = PRIORITY_LABELS[task.priority] || PRIORITY_LABELS[TaskPriority.MEDIUM];

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
        colors: [task.color, '#6366f1', '#ffffff'],
        disableForReducedMotion: true,
        scalar: 0.7,
        gravity: 1.2,
        ticks: 200
      });
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
    
    // Smooth 3D tilt calculation
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    // Dynamic CSS variables for spotlight and tilt
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
        ${isCompleted 
          ? 'opacity-60 bg-[var(--panel-bg)] border-[var(--border-color)] shadow-none scale-95 grayscale-[0.3]' 
          : 'bg-gradient-to-br from-[var(--panel-bg)] via-[var(--panel-bg)] to-transparent border-[var(--border-color)] hover:border-accent/40 shadow-2xl hover:shadow-[0_45px_90px_-20px_rgba(0,0,0,0.4)]'}
      `}
    >
      <style>{`
        .parallax-spotlight {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at var(--mouse-x, 50%) var(--mouse-y, 50%), 
            ${task.color}20 0%, 
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
        @keyframes subtleGlow {
          0%, 100% { text-shadow: 0 0 12px ${task.color}30; opacity: 0.95; }
          50% { text-shadow: 0 0 30px ${task.color}70; opacity: 1; }
        }
        .dynamic-glow-title {
          animation: subtleGlow 4s infinite ease-in-out;
        }
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
          transform: translateX(-50%) translateY(0);
        }
        .action-icon-refined {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .action-icon-refined:hover {
          transform: scale(1.3) translateY(-4px) rotate(5deg);
          filter: drop-shadow(0 0 10px currentColor);
        }
      `}</style>

      {/* Futuristic Background Parallax Layer */}
      <div className="parallax-spotlight" />

      <div className="relative p-8 h-full flex flex-col gap-6 z-10">
        
        {/* Interactive Tooltip: Creation Date */}
        <div className="creation-date-tooltip bg-slate-900/95 backdrop-blur-2xl text-white text-[10px] font-black px-5 py-2.5 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-2">
           <Icons.Calendar className="w-3.5 h-3.5 text-accent" />
           <span>سجل المستخدم: {formatDateFull(task.createdAt)}</span>
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
              <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-[0.25em]">{task.category}</span>
              <span className={`text-[9px] font-black px-3 py-1 rounded-xl border w-fit transition-all ${isCompleted ? 'bg-slate-100 text-slate-500 border-transparent' : priorityMeta.color + ' border-current/15'}`}>
                {priorityMeta.label}
              </span>
            </div>
          </div>

          <button 
            onClick={handleStatusToggle}
            className={`w-14 h-14 rounded-[24px] flex items-center justify-center transition-all duration-500 active:scale-75 border-2 shadow-sm action-icon-refined
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
            ${isCompleted ? 'text-slate-400 line-through' : 'text-[var(--text-primary)] dynamic-glow-title group-hover:text-accent'}
          `}>
            {task.title}
          </h3>
          <p className={`text-[15px] font-medium leading-relaxed line-clamp-2 transition-opacity duration-500
            ${isCompleted ? 'text-slate-400 opacity-50' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}
          `}>
            {task.description || "لا توجد تفاصيل إضافية لهذا المسار الرقمي."}
          </p>
        </div>

        {/* Footer and Action Interface */}
        <div className="pt-7 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <CardAction 
                icon={<Icons.Edit className="w-5 h-5" />} 
                onClick={() => onEdit(task)} 
                title="تعديل المهمة" 
                hoverTheme="hover:text-blue-500 hover:bg-blue-500/10"
              />
              <CardAction 
                icon={<Icons.Bell className="w-5 h-5" />} 
                onClick={() => { /* Open Reminder Interface */ }} 
                title="ضبط تذكير" 
                hoverTheme="hover:text-indigo-500 hover:bg-indigo-500/10"
              />
              <CardAction 
                icon={isInsightLoading ? <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div> : <Icons.Sparkles className="w-5 h-5" />} 
                onClick={handleFetchInsight} 
                title="نصيحة ذكية" 
                hoverTheme="hover:text-accent hover:bg-accent/10"
              />
              <CardAction 
                icon={<Icons.Copy className="w-5 h-5" />} 
                onClick={() => onCopy(task)} 
                title="استنساخ" 
                hoverTheme="hover:text-emerald-500 hover:bg-emerald-500/10"
              />
              <CardAction 
                icon={<Icons.Pin className="w-5 h-5" filled={task.isPinned} />} 
                onClick={() => onTogglePin(task.id)} 
                title={task.isPinned ? "إلغاء التثبيت" : "تثبيت في الواجهة"} 
                hoverTheme={task.isPinned ? "text-amber-500 bg-amber-500/10 shadow-inner" : "hover:text-amber-500 hover:bg-amber-500/10"}
              />
              <CardAction 
                icon={<Icons.Trash className="w-5 h-5" />} 
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
           <div className="w-24 h-24 bg-rose-500/10 rounded-[35px] flex items-center justify-center mb-6 text-rose-500 shadow-[0_20px_40px_rgba(244,63,94,0.2)] animate-bounce">
              <Icons.Trash className="w-12 h-12" />
           </div>
           <h4 className="text-2xl font-black text-[var(--text-primary)] mb-3">إزالة المهمة؟</h4>
           <p className="text-sm text-[var(--text-secondary)] mb-10 px-4 font-bold max-w-[300px] leading-relaxed">هذا الإجراء سيقوم بمسح البيانات والملحقات المرتبطة نهائياً.</p>
           <div className="flex gap-4 w-full max-w-[320px]">
             <button onClick={() => onDelete(task.id)} className="flex-1 py-4 bg-rose-600 text-white rounded-[24px] text-[14px] font-black hover:bg-rose-700 transition-all active:scale-95 shadow-2xl shadow-rose-600/30">تأكيد الحذف</button>
             <button onClick={() => setIsDeleting(false)} className="flex-1 py-4 bg-white/10 text-[var(--text-primary)] rounded-[24px] text-[14px] font-black hover:bg-white/20 transition-all active:scale-95">تراجع</button>
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
    className={`w-11 h-11 rounded-[18px] flex items-center justify-center transition-all duration-300 active:scale-75 text-[var(--text-secondary)] action-icon-refined ${hoverTheme}`}
  >
    {icon}
  </button>
);

export default TaskCard;
