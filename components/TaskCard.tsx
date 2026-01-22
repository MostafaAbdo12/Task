
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
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, onDelete, onEdit, onCopy, onStatusChange, onTogglePin, index 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isCompleted = task.status === TaskStatus.COMPLETED;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
    
    const normX = (x / rect.width) - 0.5;
    const normY = (y / rect.height) - 0.5;
    cardRef.current.style.setProperty('--norm-x', `${normX}`);
    cardRef.current.style.setProperty('--norm-y', `${normY}`);

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
    
    cardRef.current.style.transform = `perspective(1000px) translateY(-8px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) translateY(0) rotateX(0deg) rotateY(0deg)`;
    cardRef.current.style.setProperty('--norm-x', `0`);
    cardRef.current.style.setProperty('--norm-y', `0`);
  };

  const getPriorityTheme = (p: TaskPriority) => {
    switch(p) {
      case TaskPriority.URGENT: return { 
        bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-500/20', glow: 'glow-urgent' 
      };
      case TaskPriority.HIGH: return { 
        bg: 'bg-orange-950/40', text: 'text-orange-400', border: 'border-orange-500/20', glow: '' 
      };
      case TaskPriority.MEDIUM: return { 
        bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-500/20', glow: '' 
      };
      default: return { 
        bg: 'bg-slate-900/40', text: 'text-slate-400', border: 'border-slate-500/10', glow: '' 
      };
    }
  };

  const pTheme = getPriorityTheme(task.priority);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'long'
    });
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    
    if (nextStatus === TaskStatus.COMPLETED) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      
      // Subtle Star-dust Confetti
      confetti({
        particleCount: 45,
        spread: 70,
        origin: { 
          x: (rect.left + rect.width / 2) / window.innerWidth, 
          y: (rect.top + rect.height / 2) / window.innerHeight 
        },
        colors: [task.color, '#ffffff', '#ffd700', '#3b82f6'],
        scale: 0.8,
        gravity: 1.2,
        ticks: 200,
        shapes: ['circle', 'square'],
      });
    }
    
    onStatusChange(task.id, nextStatus);
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        animationDelay: `${index * 80}ms`,
        background: `linear-gradient(165deg, rgba(15, 23, 42, 0.92) 0%, rgba(2, 6, 23, 0.98) 100%)`
      }}
      className={`
        relative group transition-all duration-700 ease-out
        rounded-[45px] border border-white/5 
        backdrop-blur-[35px]
        overflow-hidden flex flex-col p-7 min-h-[400px]
        hover:border-white/10 hover:shadow-[0_45px_100px_-25px_rgba(0,0,0,0.9)]
        ${isCompleted ? 'grayscale-[0.8] opacity-60 scale-[0.97]' : 'opacity-100 scale-100'}
      `}
    >
      {/* Dynamic Parallax Nebulae - Layer 1 */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-10 transition-opacity duration-1000 pointer-events-none"
        style={{
          transform: `translate(calc(var(--norm-x) * 25px), calc(var(--norm-y) * 25px))`,
          background: `radial-gradient(circle at 70% 30%, ${task.color}30, transparent 60%)`,
          filter: 'blur(50px)'
        }}
      />

      {/* Dynamic Parallax Nebulae - Layer 2 */}
      <div 
        className="absolute top-0 left-0 w-full h-full opacity-0 group-hover:opacity-[0.15] transition-opacity duration-700 pointer-events-none"
        style={{
          transform: `translate(calc(var(--norm-x) * -40px), calc(var(--norm-y) * -40px)) scale(1.1)`,
          background: `radial-gradient(circle at 20% 80%, ${task.color}20, transparent 50%)`,
          filter: 'blur(80px)'
        }}
      />

      {/* Background Decorative Star with Parallax */}
      <div 
        className="absolute -bottom-6 -left-6 w-40 h-40 text-white/5 pointer-events-none group-hover:text-white/10 transition-all duration-700 ease-in-out"
        style={{
          transform: `translate(calc(var(--norm-x) * -15px), calc(var(--norm-y) * -15px)) rotate(12deg) scale(1.1)`
        }}
      >
        <Icons.Sparkles className="w-full h-full" />
      </div>

      {/* Top Section */}
      <div className="flex items-start justify-between relative z-10 mb-4">
        <button 
          onClick={handleComplete}
          className={`
            w-14 h-14 rounded-[24px] border border-white/10 flex items-center justify-center transition-all duration-500 active:scale-75 relative group/check
            ${isCompleted ? 'bg-emerald-500/20 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.2)]' : 'bg-white/5 hover:bg-white/10'}
          `}
        >
          {isCompleted && (
            <div className="absolute inset-0 rounded-[24px] animate-ping bg-emerald-500/20 pointer-events-none"></div>
          )}
          <div 
            className={`w-5 h-5 rounded-full transition-all duration-700 transform 
              ${isCompleted ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] scale-125' : 'bg-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse'}
              group-hover/check:scale-110
            `}
          />
        </button>

        <div className="flex items-center gap-2.5">
          {task.isPinned && (
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 animate-in zoom-in duration-300">
              <Icons.Pin className="w-5 h-5" filled />
            </div>
          )}
          <div className={`px-5 py-2 rounded-2xl border text-[11px] font-black uppercase tracking-[0.05em] ${pTheme.bg} ${pTheme.text} ${pTheme.border} ${pTheme.glow} transition-all duration-500`}>
            {PRIORITY_LABELS[task.priority]?.label}
          </div>
        </div>
      </div>

      {/* Title & Description */}
      <div className="flex-1 flex flex-col justify-center text-right space-y-3 relative z-10 mb-6 px-1 transition-transform duration-500 group-hover:-translate-x-1">
        <h3 
          className={`
            text-2xl lg:text-3xl font-black leading-tight transition-all duration-500
            ${isCompleted ? 'text-slate-500 line-through italic' : 'text-white'}
          `}
        >
          {task.title}
        </h3>
        {task.description && (
          <p className={`text-sm font-bold transition-all duration-500 line-clamp-2 ${isCompleted ? 'text-slate-700 opacity-30' : 'text-slate-400 opacity-70 group-hover:opacity-100'}`}>
            {task.description}
          </p>
        )}
      </div>

      {/* Info Badges Area */}
      <div className="flex flex-col gap-4 relative z-10 mb-6">
        <div className="flex items-center justify-end gap-5">
           {task.reminderAt && (
             <div className="bg-amber-500/5 backdrop-blur-xl border border-amber-500/10 px-4 py-2 rounded-full flex items-center gap-2 text-amber-500/80">
               <Icons.AlarmClock className="w-4 h-4" />
               <span className="text-[11px] font-black">تنبيه نشط</span>
             </div>
           )}
           <div className="flex items-center gap-2 text-slate-300 font-black group-hover:text-blue-400 transition-colors duration-500">
             <span className="text-sm">{formatDate(task.dueDate)}</span>
             <Icons.Calendar className="w-5 h-5" />
           </div>
        </div>

        <div className="flex justify-end">
          <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 px-6 py-2.5 rounded-3xl flex items-center gap-3 group-hover:bg-slate-800/80 transition-all duration-500">
             <div className="w-6 h-6 flex items-center justify-center transition-transform duration-700" style={{ color: task.color }}>
               {task.icon && CategoryIconMap[task.icon] ? CategoryIconMap[task.icon] : CategoryIconMap['star']}
             </div>
             <span className="text-sm font-black text-slate-200">{task.category}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6 relative z-10"></div>

      {/* Bottom Action Bar */}
      <div className="flex items-center justify-center gap-6 relative z-10">
        <ActionButton 
          onClick={() => setIsDeleting(true)} 
          icon={<Icons.Trash className="w-5 h-5" />} 
          hoverClass="hover:text-rose-500 hover:bg-rose-500/10" 
          glowColor="rgba(244, 63, 94, 0.4)"
          title="حذف" 
        />
        <ActionButton 
          onClick={() => onTogglePin(task.id)} 
          icon={<Icons.Pin className="w-5 h-5" filled={task.isPinned} />} 
          active={task.isPinned}
          hoverClass="hover:text-amber-400 hover:bg-amber-400/10"
          glowColor="rgba(251, 191, 36, 0.4)"
          title="تثبيت" 
        />
        <ActionButton 
          icon={<Icons.AlarmClock className="w-5 h-5" />} 
          hoverClass="hover:text-blue-400 hover:bg-blue-400/10"
          glowColor="rgba(96, 165, 250, 0.4)"
          title="تنبيه" 
        />
        <ActionButton 
          onClick={() => onCopy(task)}
          icon={<Icons.Copy className="w-5 h-5" />} 
          hoverClass="hover:text-white hover:bg-white/10"
          glowColor="rgba(255, 255, 255, 0.2)"
          title="تكرار" 
        />
        <ActionButton 
          onClick={() => onEdit(task)} 
          icon={<Icons.Edit className="w-5 h-5" />} 
          hoverClass="hover:text-nebula-blue hover:bg-nebula-blue/10"
          glowColor="rgba(59, 130, 246, 0.4)"
          title="تعديل" 
        />
      </div>

      {/* Interactive Mouse Glow with Parallax Refinement */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none z-0" 
        style={{ 
          background: `radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${task.color}, transparent 80%)`,
        }}
      ></div>

      {/* Deletion Modal */}
      {isDeleting && (
        <div className="absolute inset-0 z-[100] bg-slate-950/98 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-[28px] flex items-center justify-center mb-6 animate-bounce">
             <Icons.Trash className="w-10 h-10" />
          </div>
          <p className="text-xl font-black text-white mb-8">حذف المهمة نهائياً؟</p>
          <div className="flex gap-3 w-full">
            <button 
              onClick={() => onDelete(task.id)} 
              className="flex-1 py-4 bg-rose-600 text-white font-black rounded-2xl shadow-xl hover:brightness-110 active:scale-95 transition-all"
            >
              نعم
            </button>
            <button 
              onClick={() => setIsDeleting(false)} 
              className="flex-1 py-4 bg-white/10 text-white font-black rounded-2xl hover:bg-white/20 active:scale-95 transition-all"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface ActionButtonProps {
  onClick?: () => void;
  icon: React.ReactNode;
  hoverClass: string;
  glowColor?: string;
  title: string;
  active?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, icon, hoverClass, glowColor, title, active }) => (
  <button 
    onClick={onClick}
    className={`
      p-3.5 text-slate-500 transition-all duration-300 rounded-2xl active:scale-75 relative group/btn
      ${hoverClass}
      ${active ? 'scale-110 text-amber-400 bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.3)] ring-1 ring-amber-400/20' : ''}
    `}
    title={title}
  >
    <div className="relative z-10 transition-all duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover/btn:scale-125 group-hover/btn:rotate-6 group-hover/btn:brightness-125">
      {icon}
    </div>
    <div 
      className="absolute inset-0 rounded-2xl opacity-0 group-hover/btn:opacity-100 transition-all duration-500 pointer-events-none blur-xl"
      style={{ backgroundColor: glowColor || 'currentColor' }}
    ></div>
    <div 
      className="absolute inset-0 rounded-2xl opacity-0 group-hover/btn:opacity-20 transition-all duration-300 pointer-events-none border border-current"
    ></div>
  </button>
);

export default TaskCard;
