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

  const formatFullDate = (dateStr: string) => {
    if (!dateStr) return 'تاريخ غير معروف';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusToggle = (e: React.MouseEvent) => {
    const nextStatus = isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    if (nextStatus === TaskStatus.COMPLETED) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      confetti({
        particleCount: 100,
        spread: 60,
        origin: { 
          x: (rect.left + rect.width / 2) / window.innerWidth, 
          y: (rect.top + rect.height / 2) / window.innerHeight 
        },
        colors: [task.color, '#ffffff', '#fbbf24'],
        gravity: 1.2,
        scalar: 0.8,
        ticks: 100
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
    
    const blobX = (x - centerX) / 8;
    const blobY = (y - centerY) / 8;

    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    cardRef.current.style.setProperty('--rotate-x', `${rotateX}deg`);
    cardRef.current.style.setProperty('--rotate-y', `${rotateY}deg`);
    cardRef.current.style.setProperty('--blob-x', `${blobX}px`);
    cardRef.current.style.setProperty('--blob-y', `${blobY}px`);
  };

  const resetStyles = () => {
    if (!cardRef.current) return;
    setIsHovered(false);
    cardRef.current.style.setProperty('--rotate-x', `0deg`);
    cardRef.current.style.setProperty('--rotate-y', `0deg`);
    cardRef.current.style.setProperty('--blob-x', `0px`);
    cardRef.current.style.setProperty('--blob-y', `0px`);
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
          ? `perspective(1000px) rotateX(var(--rotate-x, 0deg)) rotateY(var(--rotate-y, 0deg)) scale3d(1.02, 1.02, 1.02)` 
          : 'scale3d(1, 1, 1)'
      }}
      className={`group relative rounded-[42px] transition-all duration-500 border animate-in fade-in slide-in-from-bottom-6 overflow-hidden
        ${isCompleted 
          ? 'opacity-60 grayscale bg-slate-50 border-slate-200' 
          : 'bg-white border-white/60 shadow-xl hover:shadow-2xl hover:border-blue-100/50'}
      `}
    >
      <style>{`
        @keyframes futuristicGlow {
          0%, 100% { filter: drop-shadow(0 0 1px ${task.color}40); background-position: 0% 50%; }
          50% { filter: drop-shadow(0 0 10px ${task.color}80); background-position: 100% 50%; }
        }
        .glowing-title-neon {
          background: linear-gradient(90deg, #1e293b, ${task.color}, #1e293b);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: futuristicGlow 4s infinite linear;
        }
        .parallax-blob {
          position: absolute;
          width: 140px;
          height: 140px;
          background: ${task.color};
          filter: blur(50px);
          opacity: 0.1;
          border-radius: 50%;
          pointer-events: none;
          z-index: 0;
          transition: transform 0.15s ease-out;
        }
        .blob-tl { top: -30px; left: -30px; transform: translate(calc(var(--blob-x, 0px) * 1.5), calc(var(--blob-y, 0px) * 1.5)); }
        .blob-br { bottom: -30px; right: -30px; transform: translate(calc(var(--blob-x, 0px) * -1.5), calc(var(--blob-y, 0px) * -1.5)); }
        
        .interactive-tooltip {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translate(-50%, -100%) scale(0.9);
          background: #0f172a;
          color: white;
          padding: 6px 14px;
          border-radius: 14px;
          font-size: 9px;
          font-weight: 900;
          white-space: nowrap;
          pointer-events: none;
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 100;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .group:hover .interactive-tooltip {
          opacity: 1;
          transform: translate(-50%, 15px) scale(1);
        }
        .icon-btn-glow:hover {
          filter: drop-shadow(0 0 8px currentColor);
          transform: translateY(-3px) scale(1.1);
        }
      `}</style>

      {/* Blobs for Parallax */}
      <div className="parallax-blob blob-tl"></div>
      <div className="parallax-blob blob-br"></div>

      {/* Interactive Tooltip */}
      <div className="interactive-tooltip">
        سُجل في: {formatFullDate(task.createdAt)}
      </div>

      <div className="relative p-9 h-full flex flex-col gap-7 z-10">
        <header className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-6"
              style={{ backgroundColor: isCompleted ? '#cbd5e1' : task.color }}
            >
              <div className="w-8 h-8">{task.icon && CategoryIconMap[task.icon] ? CategoryIconMap[task.icon] : CategoryIconMap['star']}</div>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.category}</span>
              <div className={`mt-1 px-3 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${priorityMeta.color}`}>
                {priorityMeta.label}
              </div>
            </div>
          </div>

          <button 
            onClick={handleStatusToggle}
            className={`w-14 h-14 rounded-[22px] flex items-center justify-center transition-all duration-500 active:scale-90 border-2
              ${isCompleted 
                ? 'bg-emerald-500 border-emerald-400 text-white shadow-xl shadow-emerald-100' 
                : 'bg-white border-slate-100 text-slate-200 hover:border-indigo-400 hover:text-indigo-500 hover:shadow-xl'
              }`}
          >
            {isCompleted ? <Icons.CheckCircle className="w-8 h-8" /> : <div className="w-6 h-6 rounded-full border-[3px] border-current opacity-20"></div>}
          </button>
        </header>

        <section className="flex-1 space-y-3">
          <h3 className={`text-2xl font-black tracking-tight leading-tight glowing-title-neon
            ${isCompleted ? 'opacity-40 line-through' : ''}
          `}>
            {task.title}
          </h3>
          <p className={`text-[14px] font-bold leading-relaxed line-clamp-2
            ${isCompleted ? 'text-slate-400' : 'text-slate-500'}
          `}>
            {task.description || "لا يوجد وصف لهذه المهمة الرقمية."}
          </p>
        </section>

        <footer className="mt-2 pt-6 border-t border-slate-50 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <IconButton title="تفضيل" onClick={() => { if(!task.isFavorite) setFavAnimate(true); onToggleFavorite?.(task.id); setTimeout(() => setFavAnimate(false), 600); }} icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={task.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>} active={task.isFavorite} color="text-rose-500" anim={favAnimate} />
              <IconButton title="تثبيت" onClick={() => onTogglePin(task.id)} icon={<Icons.Pin className="w-4 h-4" filled={task.isPinned} />} color="text-amber-500" />
              <IconButton title="تعديل" onClick={() => onEdit(task)} icon={<Icons.Edit className="w-4 h-4" />} color="text-blue-500" />
              <IconButton title="نسخ" onClick={() => onCopy(task)} icon={<Icons.Copy className="w-4 h-4" />} color="text-slate-500" />
              <IconButton title="حذف" onClick={() => setIsDeleting(true)} icon={<Icons.Trash className="w-4 h-4" />} color="text-rose-600" />
           </div>
           
           {task.isPinned && !isCompleted && (
             <div className="w-8 h-8 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center animate-bounce shadow-sm">
               <Icons.Pin className="w-3.5 h-3.5" filled={true} />
             </div>
           )}
        </footer>
      </div>

      {isDeleting && (
        <div className="absolute inset-0 z-[110] bg-slate-900/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center rounded-[42px] animate-in zoom-in-95 duration-300">
           <div className="w-20 h-20 bg-rose-500/15 rounded-[30px] flex items-center justify-center mb-6 text-rose-500 shadow-2xl">
              <Icons.Trash className="w-10 h-10" />
           </div>
           <h4 className="text-xl font-black text-white mb-2">تأكيد الحذف؟</h4>
           <div className="flex gap-3 w-full max-w-[200px]">
             <button onClick={() => onDelete(task.id)} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-rose-900/40 active:scale-95 transition-all">حذف</button>
             <button onClick={() => setIsDeleting(false)} className="flex-1 py-4 bg-white/10 text-white rounded-2xl text-xs font-black hover:bg-white/20 active:scale-95 transition-all">إلغاء</button>
           </div>
        </div>
      )}
    </div>
  );
};

const IconButton = ({ onClick, icon, color, title, anim }: any) => (
  <button 
    title={title}
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 icon-btn-glow ${color} hover:bg-slate-50`}
  >
    <div className={`transition-transform ${anim ? 'animate-bounce' : ''}`}>
      {icon}
    </div>
  </button>
);

export default TaskCard;