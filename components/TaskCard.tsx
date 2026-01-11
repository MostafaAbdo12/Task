
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
        particleCount: 40,
        spread: 50,
        origin: { x, y },
        colors: [task.color, '#2563eb', '#10b981'],
        ticks: 200,
        gravity: 1.2,
        scalar: 0.8,
        shapes: ['circle'],
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
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={task.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </div>
      ), 
      action: handleToggleFav, 
      color: task.isFavorite ? 'text-rose-500 bg-rose-50 border-rose-100' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50' 
    },
    { 
      id: 'pin', 
      icon: <Icons.Pin className={`w-4 h-4 transition-transform duration-300 ${task.isPinned ? 'scale-110' : ''}`} filled={task.isPinned} />, 
      action: () => onTogglePin(task.id), 
      color: task.isPinned ? 'text-amber-500 bg-amber-50 border-amber-100' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50' 
    },
    { 
      id: 'copy', 
      icon: <Icons.Copy className="w-4 h-4" />, 
      action: () => onCopy(task), 
      color: 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50' 
    },
    { 
      id: 'edit', 
      icon: <Icons.Edit className="w-4 h-4" />, 
      action: () => onEdit(task), 
      color: 'text-slate-400 hover:text-blue-500 hover:bg-blue-50' 
    },
    { 
      id: 'delete', 
      icon: <Icons.Trash className="w-4 h-4" />, 
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
      className={`group relative rounded-[30px] transition-all duration-500 ease-out
        ${isCompleted ? 'opacity-60 scale-[0.98] grayscale-[0.4]' : 'hover:-translate-y-2 hover:z-20 scale-100'}
      `}
      style={{ 
        boxShadow: isHovered && !isCompleted 
          ? `0 25px 50px -12px ${task.color}30` 
          : '0 8px 20px -6px rgba(0,0,0,0.03)' 
      }}
    >
      <style>{`
        @keyframes heartPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
        .parallax-glow-sm {
          position: absolute;
          inset: 0;
          border-radius: 30px;
          background: radial-gradient(300px circle at var(--mouse-x) var(--mouse-y), ${task.color}15, transparent 80%);
          opacity: 0;
          transition: opacity 0.4s ease;
          pointer-events: none;
          z-index: 5;
        }
        .group:hover .parallax-glow-sm { opacity: 1; }
      `}</style>

      <div className="parallax-glow-sm"></div>

      <div className={`relative p-5 rounded-[30px] h-full flex flex-col gap-4 overflow-hidden transition-all duration-500 border
        ${isCompleted ? 'bg-slate-50/90 border-slate-200/50' : 'bg-white border-slate-100/80 shadow-sm'}
      `}>
        
        {/* Decorative Background Blob */}
        <div 
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-[80px] transition-all duration-1000 opacity-10 pointer-events-none" 
          style={{ backgroundColor: task.color }}
        ></div>

        {/* Top Section */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:scale-110"
              style={{ backgroundColor: isCompleted ? '#cbd5e1' : task.color }}
            >
              <div className="w-5 h-5">{task.icon && CategoryIconMap[task.icon] ? CategoryIconMap[task.icon] : CategoryIconMap['star']}</div>
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-tight">{task.category}</span>
              <span className={`text-[8px] font-black px-2 py-0.5 mt-1 rounded-lg border w-fit ${isCompleted ? 'bg-slate-100 text-slate-400 border-slate-200' : priorityMeta.color + ' border-current/10'}`}>
                {priorityMeta.label}
              </span>
            </div>
          </div>

          <button 
            onClick={handleStatusToggle}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 active:scale-90 border-2
              ${isCompleted 
                ? 'bg-emerald-500 border-emerald-400 text-white' 
                : 'bg-slate-50 border-slate-100 text-slate-200 hover:border-blue-500 hover:text-blue-500 hover:bg-white'
              }`}
          >
            {isCompleted ? <Icons.CheckCircle className="w-6 h-6" /> : <div className="w-5 h-5 rounded-full border-[2.5px] border-current opacity-40"></div>}
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 space-y-2 z-10">
          <h3 className={`text-lg font-black transition-all tracking-tight leading-snug line-clamp-1
            ${isCompleted ? 'text-slate-400 line-through italic' : 'text-slate-800'}
          `}>
            {task.title}
          </h3>
          <p className={`text-[13px] font-medium leading-relaxed line-clamp-2 transition-all
            ${isCompleted ? 'text-slate-400 opacity-60' : 'text-slate-500 group-hover:text-slate-600'}
          `}>
            {task.description || "لا يوجد وصف لهذه المهمة."}
          </p>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2 z-10">
           {task.dueDate && (
             <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-[10px] font-black text-slate-500">
                <Icons.Calendar className="w-3.5 h-3.5 opacity-50" />
                <span>{new Date(task.dueDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</span>
             </div>
           )}
           {task.reminderAt && !isCompleted && (
             <div className="px-3 py-1.5 rounded-xl bg-blue-600 border border-blue-500 flex items-center gap-2 text-[10px] font-black text-white shadow-lg shadow-blue-500/20">
                <Icons.AlarmClock className="w-3.5 h-3.5" />
                <span>{new Date(task.reminderAt).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span>
             </div>
           )}
           {task.isPinned && !isCompleted && <Icons.Pin className="w-3.5 h-3.5 text-amber-500 ml-auto" filled={true} />}
        </div>

        {/* Action Bar - Re-styled for compactness */}
        <div className={`mt-1 pt-4 border-t border-slate-50 transition-all duration-500
          ${isHovered ? 'opacity-100' : 'opacity-0 md:opacity-100'}
        `}>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 {actionButtons.map((btn) => (
                   <button 
                    key={btn.id}
                    onClick={btn.action}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 border border-transparent ${btn.color}`}
                    title={btn.id}
                   >
                     {btn.icon}
                   </button>
                 ))}
              </div>

              <button 
                onClick={() => setShowDates(!showDates)}
                className={`p-2 rounded-lg transition-all flex items-center gap-1.5
                  ${showDates ? 'bg-slate-900 text-white' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}
                `}
              >
                <span className="text-[10px] font-black">{showDates ? 'إغلاق' : 'السجل'}</span>
                <Icons.Eye className="w-3.5 h-3.5" />
              </button>
           </div>
        </div>

        {/* History Meta Grid - Compact Version */}
        <div className={`overflow-hidden transition-all duration-500 ${showDates ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
           <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="space-y-0.5">
                <p className="text-[8px] font-black text-slate-400 uppercase">بدأت في</p>
                <p className="text-[10px] font-bold text-slate-700">{formatDateSmart(task.createdAt)}</p>
              </div>
              <div className="space-y-0.5 border-r border-slate-200 pr-2">
                <p className="text-[8px] font-black text-slate-400 uppercase">عُدلت في</p>
                <p className="text-[10px] font-bold text-slate-700">{formatDateSmart(task.updatedAt)}</p>
              </div>
           </div>
        </div>
      </div>

      {isDeleting && (
        <div className="absolute inset-0 z-[100] bg-white/98 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center rounded-[30px] animate-in fade-in duration-300">
           <Icons.Trash className="w-8 h-8 text-rose-500 mb-4 animate-bounce" />
           <h4 className="text-lg font-black text-slate-900 mb-1">حذف المهمة؟</h4>
           <p className="text-slate-400 font-bold text-[11px] mb-6">هذا الإجراء لا يمكن التراجع عنه.</p>
           <div className="flex gap-2 w-full">
             <button onClick={() => onDelete(task.id)} className="flex-1 py-3 bg-rose-600 text-white rounded-xl text-[11px] font-black">تأكيد</button>
             <button onClick={() => setIsDeleting(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-[11px] font-black">تراجع</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
