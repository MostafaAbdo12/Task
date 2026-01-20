import React, { useState, useRef } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { Icons, PRIORITY_LABELS, CategoryIconMap } from '../constants';
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
  const [favAnimate, setFavAnimate] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const priorityMeta = PRIORITY_LABELS[task.priority] || PRIORITY_LABELS[TaskPriority.MEDIUM];

  // User-friendly date formatter
  const formatUserFriendlyDate = (dateStr: string) => {
    if (!dateStr) return '---';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'الآن';
    if (diffInSeconds < 3600) return `منذ ${Math.floor(diffInSeconds / 60)} دقيقة`;
    if (diffInSeconds < 86400) return `منذ ${Math.floor(diffInSeconds / 3600)} ساعة`;
    
    const diffInDays = Math.floor(diffInSeconds / 86400);
    if (diffInDays === 1) return 'أمس';
    if (diffInDays < 7) return `منذ ${diffInDays} أيام`;
    
    return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
  };

  const handleStatusToggle = (e: React.MouseEvent) => {
    const nextStatus = isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    
    if (nextStatus === TaskStatus.COMPLETED) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { 
          x: (rect.left + rect.width / 2) / window.innerWidth, 
          y: (rect.top + rect.height / 2) / window.innerHeight 
        },
        colors: [task.color, '#ffffff', '#2563eb'],
        gravity: 0.8,
        scalar: 1.1,
        ticks: 250
      });
    }
    onStatusChange(task.id, nextStatus);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || isCompleted) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Tilt Effect
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    // Parallax movement for background elements
    const moveX = ((x - centerX) / centerX) * 15;
    const moveY = ((y - centerY) / centerY) * 15;

    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    cardRef.current.style.setProperty('--rotate-x', `${rotateX}deg`);
    cardRef.current.style.setProperty('--rotate-y', `${rotateY}deg`);
    cardRef.current.style.setProperty('--parallax-x', `${moveX}px`);
    cardRef.current.style.setProperty('--parallax-y', `${moveY}px`);
  };

  const resetStyles = () => {
    if (!cardRef.current) return;
    setIsHovered(false);
    cardRef.current.style.setProperty('--rotate-x', `0deg`);
    cardRef.current.style.setProperty('--rotate-y', `0deg`);
    cardRef.current.style.setProperty('--parallax-x', `0px`);
    cardRef.current.style.setProperty('--parallax-y', `0px`);
  };

  const actionButtons = [
    { 
      id: 'fav', 
      title: 'تفضيل',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={task.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
      ), 
      action: () => { if(!task.isFavorite) setFavAnimate(true); onToggleFavorite?.(task.id); setTimeout(() => setFavAnimate(false), 600); }, 
      hoverClass: 'text-rose-500 hover:bg-rose-50',
      glow: 'drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
    },
    { 
      id: 'pin', 
      title: 'تثبيت',
      icon: <Icons.Pin className={`w-4 h-4`} filled={task.isPinned} />, 
      action: () => onTogglePin(task.id), 
      hoverClass: 'text-amber-500 hover:bg-amber-50',
      glow: 'drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
    },
    { 
      id: 'reminder', 
      title: 'تذكير',
      icon: <Icons.AlarmClock className="w-4 h-4" />, 
      action: () => onEdit(task), // Reminder logic usually shared with edit
      hoverClass: 'text-violet-500 hover:bg-violet-50',
      glow: 'drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]'
    },
    { 
      id: 'copy', 
      title: 'نسخ',
      icon: <Icons.Copy className="w-4 h-4" />, 
      action: () => onCopy(task), 
      hoverClass: 'text-emerald-500 hover:bg-emerald-50',
      glow: 'drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]'
    },
    { 
      id: 'edit', 
      title: 'تعديل',
      icon: <Icons.Edit className="w-4 h-4" />, 
      action: () => onEdit(task), 
      hoverClass: 'text-blue-500 hover:bg-blue-50',
      glow: 'drop-shadow-[0_0_8px_rgba(37,99,235,0.6)]'
    },
    { 
      id: 'delete', 
      title: 'حذف',
      icon: <Icons.Trash className="w-4 h-4" />, 
      action: () => setIsDeleting(true), 
      hoverClass: 'text-rose-600 hover:bg-rose-50',
      glow: 'drop-shadow-[0_0_8px_rgba(225,29,72,0.6)]'
    }
  ];

  return (
    <div 
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={resetStyles}
      onMouseMove={handleMouseMove}
      style={{ 
        animationDelay: `${index * 50}ms`,
        transform: isHovered && !isCompleted 
          ? `perspective(1200px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg)) scale3d(1.02, 1.02, 1.02)` 
          : 'scale3d(1, 1, 1)'
      }}
      className={`group relative rounded-[40px] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border animate-in fade-in slide-in-from-bottom-4 will-change-transform overflow-hidden
        ${isCompleted 
          ? 'opacity-60 bg-slate-50 border-slate-200' 
          : 'bg-white border-slate-100 hover:border-blue-300 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_70px_-20px_rgba(0,0,0,0.12)]'}
      `}
    >
      <style>{`
        @keyframes heartPop { 0% { transform: scale(1); } 50% { transform: scale(1.6); } 100% { transform: scale(1); } }
        .parallax-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, ${task.color}15 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(40px);
          pointer-events: none;
          z-index: 0;
          transition: transform 0.1s ease-out;
          transform: translate(calc(-50% + var(--parallax-x, 0px)), calc(-50% + var(--parallax-y, 0px)));
          top: 50%;
          left: 50%;
        }
      `}</style>

      {/* Parallax Background Element */}
      <div className="parallax-glow"></div>

      <div className="relative p-8 h-full flex flex-col gap-6 z-10">
        
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-5">
            <div 
              className="w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-6"
              style={{ 
                backgroundColor: isCompleted ? '#94a3b8' : task.color,
                boxShadow: isHovered && !isCompleted ? `0 15px 35px ${task.color}40` : 'none'
              }}
            >
              <div className="w-8 h-8">{task.icon && CategoryIconMap[task.icon] ? CategoryIconMap[task.icon] : CategoryIconMap['star']}</div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{task.category}</span>
              <span className={`text-[10px] font-black px-4 py-1.5 rounded-xl border w-fit shadow-sm transition-all duration-500 ${isCompleted ? 'bg-slate-200 text-slate-500 border-slate-300' : priorityMeta.color + ' border-current/10'}`}>
                {priorityMeta.label}
              </span>
            </div>
          </div>

          <button 
            onClick={handleStatusToggle}
            className={`w-14 h-14 rounded-3xl flex items-center justify-center transition-all duration-500 active:scale-90 border-2
              ${isCompleted 
                ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg' 
                : 'bg-white border-slate-100 text-slate-200 hover:border-blue-500 hover:text-blue-500 hover:shadow-xl'
              }`}
          >
            {isCompleted ? <Icons.CheckCircle className="w-8 h-8" /> : <div className="w-7 h-7 rounded-full border-[4px] border-current opacity-10"></div>}
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 space-y-4">
          <h3 className={`text-[21px] font-black tracking-tight leading-tight line-clamp-1 transition-all duration-500
            ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800 group-hover:text-blue-600'}
          `}>
            {task.title}
          </h3>
          <p className={`text-[14.5px] font-bold leading-relaxed line-clamp-2 transition-all duration-500
            ${isCompleted ? 'text-slate-400 opacity-60' : 'text-slate-500 group-hover:text-slate-600'}
          `}>
            {task.description || "لا توجد تفاصيل إضافية مسجلة لهذه المهمة."}
          </p>
        </div>

        {/* Action Bar & Metadata */}
        <div className="mt-4 pt-6 border-t border-slate-100/50">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                 {actionButtons.map((btn) => (
                   <button 
                    key={btn.id}
                    title={btn.title}
                    onClick={(e) => { e.stopPropagation(); btn.action(); }}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 active:scale-75 border border-transparent group/btn ${btn.hoverClass}`}
                   >
                     <div className={`transition-all duration-300 group-hover/btn:scale-125 group-hover/btn:filter ${btn.glow} ${btn.id === 'fav' && favAnimate ? 'animate-[heartPop_0.6s_ease-out]' : ''}`}>
                        {btn.icon}
                     </div>
                   </button>
                 ))}
              </div>
              
              {task.isPinned && !isCompleted && (
                <div className="animate-pulse">
                  <Icons.Pin className="w-5 h-5 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" filled={true} />
                </div>
              )}
           </div>

           {/* User-friendly Date Section */}
           <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                 <span>إنشاء: {formatUserFriendlyDate(task.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                 <Icons.Calendar className="w-3.5 h-3.5 opacity-40" />
                 <span>تحديث: {formatUserFriendlyDate(task.updatedAt)}</span>
              </div>
           </div>
        </div>
      </div>

      {/* Delete Confirmation Overlay */}
      {isDeleting && (
        <div className="absolute inset-0 z-[100] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center animate-in zoom-in-95 duration-500">
           <div className="w-24 h-24 bg-rose-500/10 rounded-[30px] flex items-center justify-center mb-10 text-rose-500 shadow-[0_0_50px_rgba(225,29,72,0.3)] animate-bounce">
              <Icons.Trash className="w-12 h-12" />
           </div>
           <h4 className="text-[24px] font-black text-white mb-4">تفكيك السجل الرقمي؟</h4>
           <p className="text-[15px] font-bold text-slate-400 mb-10 leading-relaxed">أنت على وشك محو بيانات هذه المهمة نهائياً من مصفوفة النظام.</p>
           <div className="flex gap-6 w-full max-w-[280px]">
             <button onClick={() => onDelete(task.id)} className="flex-1 py-5 bg-rose-600 text-white rounded-2xl text-[14px] font-black shadow-xl active:scale-95 transition-all">حذف</button>
             <button onClick={() => setIsDeleting(false)} className="flex-1 py-5 bg-white/10 text-white rounded-2xl text-[14px] font-black hover:bg-white/20 active:scale-95 transition-all">إلغاء</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;