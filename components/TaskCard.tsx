
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
      return `اليوم الساعة ${timeStr}`;
    } else if (diffInDays === 1 || (diffInDays === 0 && date.getDate() !== now.getDate())) {
      return `أمس الساعة ${timeStr}`;
    } else {
      return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
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
        spread: 70,
        origin: { x, y },
        colors: [task.color, '#2563eb', '#10b981'],
        ticks: 250,
        gravity: 1.2,
        scalar: 0.9,
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
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={task.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          {favAnimate && <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-md animate-ping"></div>}
        </div>
      ), 
      action: handleToggleFav, 
      color: task.isFavorite ? 'text-rose-500 bg-rose-50 border-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]' 
    },
    { 
      id: 'pin', 
      icon: <Icons.Pin className={`w-5 h-5 transition-transform duration-300 ${task.isPinned ? 'scale-110' : ''}`} filled={task.isPinned} />, 
      action: () => onTogglePin(task.id), 
      color: task.isPinned ? 'text-amber-500 bg-amber-50 border-amber-100 shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]' 
    },
    { 
      id: 'copy', 
      icon: <Icons.Copy className="w-5 h-5" />, 
      action: () => onCopy(task), 
      color: 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]' 
    },
    { 
      id: 'edit', 
      icon: <Icons.Edit className="w-5 h-5" />, 
      action: () => onEdit(task), 
      color: 'text-slate-400 hover:text-blue-500 hover:bg-blue-50 hover:shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
    },
    { 
      id: 'delete', 
      icon: <Icons.Trash className="w-5 h-5" />, 
      action: () => setIsDeleting(true), 
      color: 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:shadow-[0_0_20px_rgba(225,29,72,0.3)]' 
    }
  ];

  return (
    <div 
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
      className={`group relative rounded-[40px] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
        ${isCompleted ? 'opacity-60 scale-[0.97] grayscale-[0.6]' : 'hover:-translate-y-3 hover:z-20 scale-100'}
      `}
      style={{ 
        boxShadow: isHovered && !isCompleted 
          ? `0 45px 90px -25px ${task.color}45` 
          : '0 15px 35px -10px rgba(0,0,0,0.05)' 
      }}
    >
      <style>{`
        @keyframes heartPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.6); }
          100% { transform: scale(1); }
        }
        .parallax-glow {
          position: absolute;
          inset: 0;
          border-radius: 40px;
          background: radial-gradient(450px circle at var(--mouse-x) var(--mouse-y), ${task.color}25, transparent 80%);
          opacity: 0;
          transition: opacity 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          pointer-events: none;
          z-index: 5;
        }
        .group:hover .parallax-glow {
          opacity: 1;
        }
      `}</style>

      {/* Parallax Interactive Glow */}
      <div className="parallax-glow"></div>

      <div className={`relative p-8 rounded-[40px] h-full flex flex-col gap-6 overflow-hidden transition-all duration-500 border
        ${isCompleted ? 'bg-slate-50/80 border-slate-200/50' : 'bg-white border-slate-100 backdrop-blur-sm shadow-sm'}
      `}>
        
        {/* Decorative Background Blob with Parallax Effect */}
        <div 
          className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-[110px] transition-all duration-1000 opacity-20
            ${isHovered && !isCompleted ? 'scale-150' : 'scale-100'}
          `} 
          style={{ 
            backgroundColor: task.color,
            transform: isHovered ? `translate(calc(var(--mouse-x) * 0.05), calc(var(--mouse-y) * 0.05))` : 'none'
          }}
        ></div>

        {/* Top Section */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div 
              className="w-12 h-12 rounded-[22px] flex items-center justify-center text-white shadow-xl transition-all duration-1000 group-hover:rotate-[360deg] group-hover:scale-110"
              style={{ backgroundColor: isCompleted ? '#94a3b8' : task.color }}
            >
              <div className="w-6 h-6">{task.icon && CategoryIconMap[task.icon] ? CategoryIconMap[task.icon] : CategoryIconMap['star']}</div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">{task.category}</span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl border ${isCompleted ? 'bg-slate-100 text-slate-400 border-slate-200' : priorityMeta.color + ' border-current/10 shadow-sm'}`}>
                  {priorityMeta.label}
                </span>
                {task.isPinned && <Icons.Pin className="w-3.5 h-3.5 text-amber-500 animate-pulse" filled={true} />}
              </div>
            </div>
          </div>

          <button 
            onClick={handleStatusToggle}
            className={`w-14 h-14 rounded-[22px] flex items-center justify-center transition-all duration-700 active:scale-75 shadow-lg group/check border-2
              ${isCompleted 
                ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-200 rotate-[360deg]' 
                : 'bg-slate-50 border-slate-100 text-slate-300 hover:bg-blue-600 hover:border-blue-500 hover:text-white hover:shadow-blue-200 hover:scale-110'
              }`}
          >
            {isCompleted ? <Icons.CheckCircle className="w-8 h-8" /> : <div className="w-7 h-7 rounded-full border-[3.5px] border-current opacity-30 group-hover/check:opacity-100 transition-all"></div>}
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 space-y-4 z-10">
          <h3 className={`text-2xl font-black transition-all duration-700 tracking-tight leading-tight line-clamp-1
            ${isCompleted ? 'text-slate-400 line-through decoration-slate-300 decoration-2 italic' : 'text-slate-800 group-hover:text-blue-600 group-hover:translate-x-1'}
          `}>
            {task.title}
          </h3>
          <p className={`text-[15px] font-bold leading-relaxed line-clamp-2 transition-all duration-700
            ${isCompleted ? 'text-slate-400 opacity-60' : 'text-slate-500 group-hover:text-slate-700'}
          `}>
            {task.description || "لا توجد تفاصيل إضافية لهذا السجل التقني المتطور."}
          </p>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-3 z-10">
           {task.dueDate && (
             <div className="px-5 py-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-[11px] font-black text-slate-500 transition-all hover:bg-white hover:border-blue-100 hover:text-blue-600 hover:scale-105">
                <Icons.Calendar className="w-4.5 h-4.5 opacity-50" />
                <span>{new Date(task.dueDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</span>
             </div>
           )}
           {task.reminderAt && !isCompleted && (
             <div className="px-5 py-3 rounded-2xl bg-blue-600 border border-blue-500 flex items-center gap-2.5 text-[11px] font-black text-white shadow-xl shadow-blue-500/30 animate-gentle-pulse hover:scale-105 transition-transform cursor-default">
                <Icons.AlarmClock className="w-4.5 h-4.5" />
                <span>{new Date(task.reminderAt).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span>
             </div>
           )}
        </div>

        {/* Action Bar */}
        <div className={`mt-2 pt-6 border-t border-slate-100 transition-all duration-700 ease-[cubic-bezier(0.23, 1, 0.32, 1)]
          ${isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none md:opacity-100 md:translate-y-0 md:scale-100 md:pointer-events-auto'}
        `}>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 {actionButtons.map((btn) => (
                   <button 
                    key={btn.id}
                    onClick={btn.action}
                    className={`w-11 h-11 rounded-[16px] bg-white flex items-center justify-center transition-all duration-500 hover:scale-125 active:scale-90 shadow-sm border border-slate-100/50 ${btn.color}`}
                    title={btn.id}
                   >
                     {btn.icon}
                   </button>
                 ))}
              </div>

              <button 
                onClick={() => setShowDates(!showDates)}
                className={`px-5 py-3 rounded-2xl text-[14px] font-black transition-all flex items-center gap-2.5 border
                  ${showDates ? 'bg-slate-900 border-slate-800 text-white shadow-2xl scale-105' : 'text-slate-400 border-transparent hover:text-slate-900 hover:bg-slate-50 hover:border-slate-100'}
                `}
              >
                <span>السجل</span>
                <Icons.Eye className={`w-5 h-5 transition-transform duration-700 ${showDates ? 'rotate-180' : 'opacity-40 group-hover:scale-110'}`} />
              </button>
           </div>
        </div>

        {/* History Meta Grid - ENHANCED WITH SMART FORMATTING */}
        <div className={`overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${showDates ? 'max-h-32 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 bg-slate-50/80 rounded-[30px] border border-slate-100 shadow-inner">
              <div className="space-y-1.5 px-2">
                <div className="flex items-center gap-2 mb-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">تاريخ التدشين</p>
                </div>
                <p className="text-[12px] font-black text-slate-800">{formatDateSmart(task.createdAt)}</p>
              </div>
              <div className="space-y-1.5 px-2 border-r sm:border-r border-slate-200 pr-4">
                <div className="flex items-center gap-2 mb-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">آخر تحديث للنظام</p>
                </div>
                <p className="text-[12px] font-black text-slate-800">{formatDateSmart(task.updatedAt)}</p>
              </div>
           </div>
        </div>
      </div>

      {isDeleting && (
        <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-2xl flex flex-col items-center justify-center p-10 text-center rounded-[40px] animate-in fade-in zoom-in-95 duration-500 shadow-2xl">
           <div className="w-20 h-20 bg-rose-50 rounded-[32px] flex items-center justify-center mb-8 text-rose-500 animate-bounce shadow-inner">
             <Icons.Trash className="w-11 h-11" />
           </div>
           <h4 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">تأكيد الحذف النهائي؟</h4>
           <p className="text-slate-400 font-bold text-[13px] mb-10 leading-relaxed px-4">سيتم إزالة كافة السجلات البرمجية المرتبطة بهذه المهمة من قاعدة البيانات المركزية.</p>
           <div className="flex gap-4 w-full max-w-[320px]">
             <button onClick={() => onDelete(task.id)} className="flex-1 py-5 bg-rose-600 text-white rounded-2xl text-[13px] font-black hover:bg-rose-700 transition-all shadow-xl shadow-rose-200 active:scale-95">حذف السجل</button>
             <button onClick={() => setIsDeleting(false)} className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-2xl text-[13px] font-black hover:bg-slate-200 transition-all active:scale-95">تراجع</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
