
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
  const [showDates, setShowDates] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [favAnimate, setFavAnimate] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const priorityMeta = PRIORITY_LABELS[task.priority] || PRIORITY_LABELS[TaskPriority.MEDIUM];

  const formatDateSmart = (dateStr: string) => {
    if (!dateStr) return '---';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    const timeStr = date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

    if (diffInDays === 0 && date.getDate() === now.getDate()) {
      return `اليوم ${timeStr}`;
    } else if (diffInDays === 1 || (diffInDays === 0 && date.getDate() !== now.getDate())) {
      return `أمس ${timeStr}`;
    } else {
      return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
    }
  };

  const handleStatusToggle = (e: React.MouseEvent) => {
    const nextStatus = isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    
    if (nextStatus === TaskStatus.COMPLETED) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x, y },
        colors: [task.color, '#ffffff', '#2563eb'],
        ticks: 150,
        gravity: 1.2,
        scalar: 0.8,
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
    const rotateX = ((y - centerY) / centerY) * -6;
    const rotateY = ((x - centerX) / centerX) * 6;

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

  const actionButtons = [
    { 
      id: 'fav', 
      title: 'تفضيل',
      icon: (
        <div className={`transition-all duration-300 group-hover/btn:scale-125 ${favAnimate ? 'animate-[heartPop_0.6s_ease-out]' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={task.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </div>
      ), 
      action: () => { if(!task.isFavorite) setFavAnimate(true); onToggleFavorite?.(task.id); }, 
      glowColor: 'rgba(244, 63, 94, 0.5)',
      hoverClass: 'text-rose-500 hover:bg-rose-50' 
    },
    { 
      id: 'pin', 
      title: 'تثبيت',
      icon: <Icons.Pin className={`w-3.5 h-3.5 transition-all duration-300 group-hover/btn:scale-125 ${task.isPinned ? 'scale-110' : ''}`} filled={task.isPinned} />, 
      action: () => onTogglePin(task.id), 
      glowColor: 'rgba(245, 158, 11, 0.5)',
      hoverClass: 'text-amber-500 hover:bg-amber-50' 
    },
    { 
      id: 'reminder', 
      title: 'تنبيه',
      icon: <Icons.AlarmClock className="w-3.5 h-3.5 transition-all duration-300 group-hover/btn:scale-125" />, 
      action: () => onEdit(task), 
      glowColor: 'rgba(79, 70, 229, 0.5)',
      hoverClass: 'text-indigo-600 hover:bg-indigo-50' 
    },
    { 
      id: 'copy', 
      title: 'نسخ',
      icon: <Icons.Copy className="w-3.5 h-3.5 transition-all duration-300 group-hover/btn:scale-125" />, 
      action: () => onCopy(task), 
      glowColor: 'rgba(16, 185, 129, 0.5)',
      hoverClass: 'text-emerald-500 hover:bg-emerald-50' 
    },
    { 
      id: 'edit', 
      title: 'تعديل',
      icon: <Icons.Edit className="w-3.5 h-3.5 transition-all duration-300 group-hover/btn:scale-125" />, 
      action: () => onEdit(task), 
      glowColor: 'rgba(37, 99, 235, 0.5)',
      hoverClass: 'text-blue-500 hover:bg-blue-50' 
    },
    { 
      id: 'delete', 
      title: 'حذف',
      icon: <Icons.Trash className="w-3.5 h-3.5 transition-all duration-300 group-hover/btn:scale-125" />, 
      action: () => setIsDeleting(true), 
      glowColor: 'rgba(225, 29, 72, 0.5)',
      hoverClass: 'text-rose-600 hover:bg-rose-50' 
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
        transform: isHovered && !isCompleted ? `perspective(1000px) rotateX(var(--rotate-x)) rotateY(var(--rotate-y)) scale3d(1.02, 1.02, 1.02)` : 'none'
      }}
      className={`group relative rounded-[32px] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] border animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards
        ${isCompleted ? 'opacity-70 grayscale-[0.4] bg-slate-50 border-slate-200' : 'bg-white hover:border-blue-300 shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)]'}
      `}
    >
      <style>{`
        @keyframes heartPop { 0% { transform: scale(1); } 50% { transform: scale(1.5); } 100% { transform: scale(1); } }
        .magnetic-glow {
          position: absolute;
          inset: 0;
          border-radius: 32px;
          background: radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), ${task.color}08, transparent 80%);
          opacity: 0;
          transition: opacity 0.5s ease;
          pointer-events: none;
          z-index: 1;
        }
        .group:hover .magnetic-glow { opacity: 1; }
      `}</style>

      <div className="magnetic-glow"></div>

      <div className={`relative p-5 h-full flex flex-col gap-4 overflow-hidden z-10 pointer-events-none`}>
        
        {/* Header - Compact Icon & Labels */}
        <div className="pointer-events-auto flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-[14px] flex items-center justify-center text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6"
              style={{ backgroundColor: isCompleted ? '#94a3b8' : task.color }}
            >
              <div className="w-5 h-5">{task.icon && CategoryIconMap[task.icon] ? CategoryIconMap[task.icon] : CategoryIconMap['star']}</div>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{task.category}</span>
              <span className={`text-[8px] font-black px-2 py-0.5 mt-1 rounded-md border w-fit transition-all duration-500 ${isCompleted ? 'bg-slate-200 text-slate-500 border-slate-300' : priorityMeta.color + ' border-current/10'}`}>
                {priorityMeta.label}
              </span>
            </div>
          </div>

          <button 
            onClick={handleStatusToggle}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 active:scale-90 border-2
              ${isCompleted 
                ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-200 rotate-0' 
                : 'bg-white border-slate-100 text-slate-200 hover:border-blue-500 hover:text-blue-500 hover:shadow-xl'
              }`}
          >
            {isCompleted ? <Icons.CheckCircle className="w-6 h-6" /> : <div className="w-5 h-5 rounded-full border-[2.5px] border-current opacity-20"></div>}
          </button>
        </div>

        {/* Content - Compact Title & Body */}
        <div className="pointer-events-auto flex-1 space-y-2">
          <h3 className={`text-[16px] font-black tracking-tight leading-tight line-clamp-1 transition-all duration-500
            ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800 group-hover:text-blue-600'}
          `}>
            {task.title}
          </h3>
          <p className={`text-[12px] font-bold leading-relaxed line-clamp-2 transition-all duration-500
            ${isCompleted ? 'text-slate-400 opacity-60' : 'text-slate-500 group-hover:text-slate-600'}
          `}>
            {task.description || "سجل عملياتي معلق."}
          </p>
        </div>

        {/* Tags */}
        <div className="pointer-events-auto flex items-center flex-wrap gap-2 pt-1">
           {task.dueDate && (
             <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-[10px] font-black text-slate-500">
                <Icons.Calendar className="w-3.5 h-3.5 opacity-40" />
                <span>{new Date(task.dueDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</span>
             </div>
           )}
           {task.isPinned && !isCompleted && (
             <div className="mr-auto">
               <Icons.Pin className="w-4 h-4 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" filled={true} />
             </div>
           )}
        </div>

        {/* Compact Action Bar */}
        <div className={`pointer-events-auto mt-1 pt-4 border-t border-slate-100 transition-all duration-500
          ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none md:pointer-events-auto md:opacity-100 md:translate-y-0'}
        `}>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                 {actionButtons.map((btn) => (
                   <button 
                    key={btn.id}
                    title={btn.title}
                    onClick={(e) => { e.stopPropagation(); btn.action(); }}
                    className={`w-8.5 h-8.5 rounded-lg flex items-center justify-center transition-all duration-300 active:scale-75 border border-transparent group/btn ${btn.hoverClass}`}
                   >
                     {btn.icon}
                   </button>
                 ))}
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); setShowDates(!showDates); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all duration-300
                  ${showDates ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}
                `}
              >
                <Icons.Eye className={`w-3.5 h-3.5 ${showDates ? 'rotate-180' : ''}`} />
              </button>
           </div>
        </div>

        {/* History Panel - Creation & Update */}
        {showDates && (
          <div className="pointer-events-auto mt-2 grid grid-cols-2 gap-3 p-3 bg-slate-50/80 rounded-2xl border border-slate-200 animate-in slide-in-from-top-4 duration-500">
            <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">إنشاء</p>
              <p className="text-[10px] font-bold text-slate-700">{formatDateSmart(task.createdAt)}</p>
            </div>
            <div className="space-y-1 border-r border-slate-200 pr-3">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">تحديث</p>
              <p className="text-[10px] font-bold text-slate-700">{formatDateSmart(task.updatedAt)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Overlay */}
      {isDeleting && (
        <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center rounded-[32px] animate-in zoom-in-95 duration-400">
           <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mb-4 text-rose-500">
              <Icons.Trash className="w-6 h-6" />
           </div>
           <h4 className="text-[14px] font-black text-slate-900 mb-1">حذف المهمة؟</h4>
           <div className="flex gap-3 w-full">
             <button onClick={() => onDelete(task.id)} className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-[11px] font-black shadow-lg shadow-rose-200 active:scale-90">حذف</button>
             <button onClick={() => setIsDeleting(false)} className="flex-1 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[11px] font-black active:scale-90">تراجع</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
