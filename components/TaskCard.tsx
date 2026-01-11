
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
        particleCount: 30,
        spread: 40,
        origin: { x, y },
        colors: [task.color, '#2563eb'],
        ticks: 150,
        gravity: 1.5,
        scalar: 0.7,
      });
    }
    
    onStatusChange(task.id, nextStatus);
  };

  const handleToggleFav = () => {
    if (!task.isFavorite) {
      setFavAnimate(true);
      setTimeout(() => setFavAnimate(false), 600);
    }
    onToggleFavorite?.(task.id);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current || isCompleted) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  const actionButtons = [
    { 
      id: 'fav', 
      icon: (
        <div className={`relative ${favAnimate ? 'animate-[heartPop_0.6s_ease-out]' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={task.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </div>
      ), 
      action: handleToggleFav, 
      color: task.isFavorite ? 'text-rose-500 bg-rose-50' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50' 
    },
    { 
      id: 'pin', 
      icon: <Icons.Pin className={`w-3.5 h-3.5 ${task.isPinned ? 'scale-110' : ''}`} filled={task.isPinned} />, 
      action: () => onTogglePin(task.id), 
      color: task.isPinned ? 'text-amber-500 bg-amber-50' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50' 
    },
    { 
      id: 'copy', 
      icon: <Icons.Copy className="w-3.5 h-3.5" />, 
      action: () => onCopy(task), 
      color: 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50' 
    },
    { 
      id: 'edit', 
      icon: <Icons.Edit className="w-3.5 h-3.5" />, 
      action: () => onEdit(task), 
      color: 'text-slate-400 hover:text-blue-500 hover:bg-blue-50' 
    },
    { 
      id: 'delete', 
      icon: <Icons.Trash className="w-3.5 h-3.5" />, 
      action: () => setIsDeleting(true), 
      color: 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' 
    }
  ];

  return (
    <div 
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className={`group relative rounded-[24px] transition-all duration-300 ease-out border
        ${isCompleted ? 'opacity-60 grayscale-[0.3]' : 'bg-white hover:border-blue-200 hover:shadow-xl shadow-sm'}
      `}
      style={{ 
        boxShadow: isHovered && !isCompleted 
          ? `0 15px 30px -10px ${task.color}20` 
          : '0 4px 12px -4px rgba(0,0,0,0.02)' 
      }}
    >
      <style>{`
        @keyframes heartPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        .mini-parallax-glow {
          position: absolute;
          inset: 0;
          border-radius: 24px;
          background: radial-gradient(200px circle at var(--mouse-x) var(--mouse-y), ${task.color}10, transparent 80%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          z-index: 1;
        }
        .group:hover .mini-parallax-glow { opacity: 1; }
      `}</style>

      <div className="mini-parallax-glow"></div>

      <div className={`relative p-4 h-full flex flex-col gap-3 overflow-hidden z-10`}>
        
        {/* Top Header Row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105"
              style={{ backgroundColor: isCompleted ? '#cbd5e1' : task.color }}
            >
              <div className="w-4 h-4">{task.icon && CategoryIconMap[task.icon] ? CategoryIconMap[task.icon] : CategoryIconMap['star']}</div>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{task.category}</span>
              <span className={`text-[7px] font-black px-1.5 py-0.5 mt-0.5 rounded-md border w-fit ${isCompleted ? 'bg-slate-100 text-slate-400 border-slate-200' : priorityMeta.color + ' border-current/10'}`}>
                {priorityMeta.label}
              </span>
            </div>
          </div>

          <button 
            onClick={handleStatusToggle}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all active:scale-90 border-2
              ${isCompleted 
                ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-200' 
                : 'bg-slate-50 border-slate-100 text-slate-200 hover:border-blue-500 hover:text-blue-500'
              }`}
          >
            {isCompleted ? <Icons.CheckCircle className="w-5 h-5" /> : <div className="w-4 h-4 rounded-full border-[2px] border-current opacity-30"></div>}
          </button>
        </div>

        {/* Title & Description */}
        <div className="flex-1 space-y-1">
          <h3 className={`text-[15px] font-black tracking-tight leading-tight line-clamp-1
            ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'}
          `}>
            {task.title}
          </h3>
          <p className={`text-[11.5px] font-medium leading-relaxed line-clamp-2
            ${isCompleted ? 'text-slate-400 opacity-70' : 'text-slate-500'}
          `}>
            {task.description || "لا يوجد تفاصيل إضافية."}
          </p>
        </div>

        {/* Bottom Metadata */}
        <div className="flex items-center gap-2">
           {task.dueDate && (
             <div className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-1.5 text-[9px] font-black text-slate-500">
                <Icons.Calendar className="w-3 h-3 opacity-40" />
                <span>{new Date(task.dueDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</span>
             </div>
           )}
           {task.reminderAt && !isCompleted && (
             <div className="px-2 py-1 rounded-lg bg-blue-600 text-white flex items-center gap-1.5 text-[9px] font-black shadow-sm">
                <Icons.AlarmClock className="w-3 h-3" />
                <span>{new Date(task.reminderAt).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span>
             </div>
           )}
           {task.isPinned && !isCompleted && <Icons.Pin className="w-3 h-3 text-amber-500 mr-auto" filled={true} />}
        </div>

        {/* Dynamic Action Bar (Compact) */}
        <div className={`mt-1 pt-3 border-t border-slate-50 transition-all duration-300
          ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none md:pointer-events-auto md:opacity-100 md:translate-y-0'}
        `}>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                 {actionButtons.map((btn) => (
                   <button 
                    key={btn.id}
                    onClick={(e) => { e.stopPropagation(); btn.action(); }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90 border border-transparent ${btn.color}`}
                   >
                     {btn.icon}
                   </button>
                 ))}
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); setShowDates(!showDates); }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-black transition-all
                  ${showDates ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}
                `}
              >
                <span>{showDates ? 'إغلاق' : 'السجل'}</span>
                <Icons.Eye className="w-3 h-3" />
              </button>
           </div>
        </div>

        {/* Expanded History Panel (Compact) */}
        {showDates && (
          <div className="mt-2 grid grid-cols-2 gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100 animate-in slide-in-from-top-2">
            <div className="space-y-0.5">
              <p className="text-[7px] font-black text-slate-400 uppercase">الإنشاء</p>
              <p className="text-[9px] font-bold text-slate-600">{formatDateSmart(task.createdAt)}</p>
            </div>
            <div className="space-y-0.5 border-r border-slate-200 pr-2">
              <p className="text-[7px] font-black text-slate-400 uppercase">التحديث</p>
              <p className="text-[9px] font-bold text-slate-600">{formatDateSmart(task.updatedAt)}</p>
            </div>
          </div>
        )}
      </div>

      {isDeleting && (
        <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center rounded-[24px] animate-in fade-in duration-200">
           <Icons.Trash className="w-6 h-6 text-rose-500 mb-3" />
           <p className="text-[11px] font-black text-slate-900 mb-4">حذف المهمة؟</p>
           <div className="flex gap-2 w-full">
             <button onClick={() => onDelete(task.id)} className="flex-1 py-2 bg-rose-600 text-white rounded-lg text-[10px] font-black">حذف</button>
             <button onClick={() => setIsDeleting(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black">إلغاء</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
