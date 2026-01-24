
import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
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
  onSetReminder?: (id: string, time: string) => void;
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, onDelete, onEdit, onCopy, onStatusChange, onTogglePin, onToggleFavorite, index 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);
  const isCompleted = task.status === TaskStatus.COMPLETED;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Spotlight position
    cardRef.current.style.setProperty('--x', `${x}px`);
    cardRef.current.style.setProperty('--y', `${y}px`);

    // 3D Tilt calculation
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10; // Max 10 degrees
    const rotateY = ((x - centerX) / centerX) * 10;
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    
    if (nextStatus === TaskStatus.COMPLETED) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { 
          x: (rect.left + rect.width / 2) / window.innerWidth, 
          y: (rect.top + rect.height / 2) / window.innerHeight 
        },
        colors: [task.color, '#6366f1', '#ffffff'],
        disableForReducedMotion: true
      });
    }
    onStatusChange(task.id, nextStatus);
  };

  const priority = PRIORITY_LABELS[task.priority] || PRIORITY_LABELS.MEDIUM;

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        relative group rounded-[3.5rem] p-8 flex flex-col h-full transition-all duration-500
        bg-slate-900/20 border border-white/[0.03] backdrop-blur-[30px] overflow-hidden
        hover:border-primary/40 hover:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]
        perspective-1000 animate-slide-up
        ${isCompleted ? 'grayscale-[0.6] opacity-60' : 'opacity-100'}
      `}
      style={{ 
        animationDelay: `${index * 80}ms`,
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        willChange: 'transform'
      }}
    >
      {/* Glossy Overlay Layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      {/* Interactive Spotlight Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--x)_var(--y),rgba(99,102,241,0.15),transparent_65%)] pointer-events-none"></div>

      {/* Floating Animated Orbs */}
      <div className="absolute -right-20 -top-20 w-48 h-48 bg-primary/10 rounded-full blur-[80px] group-hover:bg-primary/20 transition-all duration-1000 animate-pulse"></div>

      {/* Top HUD */}
      <div className="flex items-start justify-between mb-8 relative z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleComplete}
            className={`
              w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 hover:scale-110 active:scale-90
              ${isCompleted 
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]' 
                : 'border-white/10 text-transparent hover:border-primary/50 hover:text-primary'
              }
            `}
          >
            <Icons.CheckCircle className="w-6 h-6" />
          </button>
          
          <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/5 ${priority.color.replace('bg-', 'bg-opacity-10 ').replace('text-', 'text-opacity-80 ')}`}>
            {priority.label}
          </div>
        </div>

        <div className="flex items-center gap-2">
           {task.isPinned && (
             <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500 animate-bounce-subtle">
               <Icons.Pin className="w-3.5 h-3.5" filled />
             </div>
           )}
           {task.isFavorite && (
             <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20 text-rose-500">
               <Icons.Heart className="w-3.5 h-3.5" filled />
             </div>
           )}
        </div>
      </div>

      {/* Title & Description HUD */}
      <div className="flex-1 mb-10 relative z-20">
        <h3 className={`text-xl font-black mb-3 tracking-tight transition-all duration-500 ${isCompleted ? 'line-through text-slate-500' : 'text-white'}`}>
          {task.title}
        </h3>
        <p className="text-[12px] text-slate-400 line-clamp-2 leading-relaxed font-bold opacity-70 group-hover:opacity-100 transition-all">
          {task.description}
        </p>

        <div className="flex flex-wrap gap-2.5 mt-6">
           {task.reminderAt && (
             <div className="flex items-center gap-2 text-[9px] font-black text-primary bg-primary/10 px-3.5 py-2 rounded-xl border border-primary/10">
                <Icons.AlarmClock className="w-3.5 h-3.5" />
                <span>{new Date(task.reminderAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
             </div>
           )}
        </div>
      </div>

      {/* Footer Controls HUD */}
      <div className="pt-6 border-t border-white/[0.04] flex items-center justify-between relative z-20">
         <div className="flex items-center gap-4">
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-700 group-hover:rotate-[15deg] group-hover:scale-110 shadow-lg" 
              style={{ backgroundColor: `${task.color}15`, color: task.color }}
            >
               <div className="w-7 h-7">
                 {task.icon && CategoryIconMap[task.icon] ? CategoryIconMap[task.icon] : CategoryIconMap['star']}
               </div>
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-1">{task.category}</span>
               <div className="flex items-center gap-1.5 text-slate-600">
                  <Icons.Calendar className="w-3 h-3" />
                  <span className="text-[9px] font-black uppercase">
                    {new Date(task.dueDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                  </span>
               </div>
            </div>
         </div>

         {/* Advanced Action HUD - Visible on Hover */}
         <div className="flex gap-2 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
            <ActionButton 
              icon={<Icons.Copy className="w-4 h-4" />} 
              onClick={() => onCopy(task)} 
              label="نسخ"
            />
            <ActionButton 
              icon={<Icons.Edit className="w-4 h-4" />} 
              onClick={() => onEdit(task)} 
              label="تعديل"
              activeColor="indigo"
            />
            <ActionButton 
              icon={<Icons.Trash className="w-4 h-4" />} 
              onClick={() => setIsDeleting(true)} 
              label="حذف"
              activeColor="rose"
            />
         </div>
      </div>

      {/* Deletion Interface Layer */}
      {isDeleting && (
        <div className="absolute inset-0 z-50 bg-[#020617]/98 backdrop-blur-2xl rounded-[3.5rem] flex flex-col items-center justify-center p-10 text-center animate-in zoom-in duration-300">
           <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mb-6 border border-rose-500/20">
              <Icons.Trash className="w-8 h-8" />
           </div>
           <h4 className="text-xl font-black text-white mb-2 uppercase tracking-tight">إتلاف السجل؟</h4>
           <p className="text-[10px] font-bold text-slate-500 mb-8 uppercase tracking-widest">تحذير: لا يمكن التراجع عن الحذف</p>
           <div className="flex gap-3 w-full">
              <button onClick={() => onDelete(task.id)} className="flex-1 py-4 bg-rose-600 text-white text-[10px] font-black uppercase rounded-2xl shadow-xl shadow-rose-900/20 active:scale-95 transition-all">تأكيد</button>
              <button onClick={() => setIsDeleting(false)} className="flex-1 py-4 bg-white/5 text-slate-400 text-[10px] font-black uppercase rounded-2xl hover:bg-white/10 active:scale-95 transition-all">إلغاء</button>
           </div>
        </div>
      )}

      <style>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-subtle { animation: bounce-subtle 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

const ActionButton = ({ icon, onClick, activeColor = 'primary', label }: any) => {
  const colorMap: any = {
    primary: 'hover:bg-primary/20 hover:text-primary hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]',
    indigo: 'hover:bg-indigo-500/20 hover:text-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]',
    rose: 'hover:bg-rose-500/20 hover:text-rose-400 hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]'
  };

  return (
    <div className="relative group/btn">
      <button 
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        className={`
          w-10 h-10 rounded-xl transition-all duration-300 border border-white/5 bg-white/5 flex items-center justify-center text-slate-500
          ${colorMap[activeColor]}
          hover:scale-110 active:scale-90
        `}
      >
        {icon}
      </button>
      <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 border border-white/10 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest text-white opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
        {label}
      </span>
    </div>
  );
};

export default TaskCard;
