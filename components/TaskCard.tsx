
import React, { useState, useRef, useMemo } from 'react';
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
  onToggleSubtask?: (taskId: string, subtaskId: string) => void;
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, onDelete, onEdit, onCopy, onStatusChange, onTogglePin, index 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isCompleted = task.status === TaskStatus.COMPLETED;
  
  // حساب تقدم المهام الفرعية
  const subtasksStats = useMemo(() => {
    if (!task.subTasks || task.subTasks.length === 0) return null;
    const completed = task.subTasks.filter(st => st.isCompleted).length;
    const total = task.subTasks.length;
    return {
      percent: Math.round((completed / total) * 100),
      text: `${completed}/${total}`
    };
  }, [task.subTasks]);

  // منطق التحريك ثلاثي الأبعاد والبارالاكس
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // إحداثيات الماوس للتوهج
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);

    // منطق الإمالة (Tilt)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -10; // أقصى ميل 10 درجات
    const rotateY = ((x - centerX) / centerX) * 10;
    
    cardRef.current.style.transform = `perspective(1000px) scale(1.05) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = `perspective(1000px) scale(1) rotateX(0deg) rotateY(0deg)`;
  };

  const getPriorityTheme = (p: TaskPriority) => {
    switch(p) {
      case TaskPriority.URGENT: return { 
        bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', glow: 'shadow-[0_0_25px_rgba(244,63,94,0.4)]' 
      };
      case TaskPriority.HIGH: return { 
        bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', glow: 'shadow-[0_0_25px_rgba(249,115,22,0.4)]' 
      };
      case TaskPriority.MEDIUM: return { 
        bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', glow: 'shadow-[0_0_25px_rgba(59,130,246,0.4)]' 
      };
      default: return { 
        bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', glow: '' 
      };
    }
  };

  const pTheme = getPriorityTheme(task.priority);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      day: 'numeric',
      month: 'short'
    });
  };

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    
    if (nextStatus === TaskStatus.COMPLETED) {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { 
          x: (rect.left + rect.width / 2) / window.innerWidth, 
          y: (rect.top + rect.height / 2) / window.innerHeight 
        },
        colors: [task.color, '#7c3aed', '#3b82f6', '#ffffff'],
        disableForReducedMotion: true,
        scalar: 1.4,
        gravity: 0.7
      });
    }
    
    onStatusChange(task.id, nextStatus);
  };

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ animationDelay: `${index * 100}ms` }}
      className={`
        nebula-card p-9 flex flex-col gap-7 relative group transition-all duration-300 ease-out
        rounded-[45px] border border-white/10 
        bg-gradient-to-br from-white/[0.1] via-white/[0.03] to-transparent
        backdrop-blur-[45px] shadow-2xl
        hover:border-white/40 hover:from-white/[0.15]
        hover:shadow-[0_60px_120px_-30px_rgba(0,0,0,0.9)]
        ${isCompleted ? 'opacity-60 saturate-[0.2] scale-[0.96]' : 'opacity-100'}
      `}
    >
      {/* Dynamic Interaction Aura - 3D Glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none rounded-[45px] z-0" 
        style={{ 
          background: `radial-gradient(500px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${task.color}55, transparent 85%)`,
        }}
      ></div>

      {/* Background Decorative Element with Parallax */}
      <div className="absolute -bottom-6 -left-6 text-white/[0.03] group-hover:text-white/[0.08] transition-all duration-1000 z-0 pointer-events-none group-hover:-translate-y-8 group-hover:translate-x-8">
        <Icons.Sparkles className="w-40 h-40 rotate-[25deg] transform-gpu" />
      </div>

      {/* Header Info */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
           <div className={`px-6 py-2.5 rounded-2xl border text-[11px] font-black uppercase tracking-[0.25em] shadow-2xl transition-all duration-500 group-hover:-translate-y-2 ${pTheme.bg} ${pTheme.text} ${pTheme.border} ${pTheme.glow}`}>
             {PRIORITY_LABELS[task.priority]?.label}
           </div>
           {task.isPinned && (
             <div className="bg-amber-500/20 text-amber-400 p-2.5 rounded-xl border border-amber-500/30 animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.4)]">
               <Icons.Pin className="w-4.5 h-4.5" filled />
             </div>
           )}
        </div>

        <button 
          onClick={handleComplete}
          className={`
            w-16 h-16 rounded-[24px] border-2 transition-all duration-500 flex items-center justify-center shrink-0 overflow-hidden relative shadow-2xl active:scale-90
            ${isCompleted 
              ? 'bg-emerald-500/20 border-emerald-500/70 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.6)]' 
              : 'border-white/20 bg-white/5 hover:border-blue-400/50 hover:scale-110 hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]'}
          `}
        >
          {isCompleted ? (
            <Icons.CheckCircle className="w-8 h-8 animate-in zoom-in spin-in-90 duration-500" />
          ) : (
            <div className="w-4 h-4 rounded-full bg-slate-600 transition-all duration-500 group-hover:bg-blue-400 group-hover:scale-150 shadow-[0_0_20px_rgba(59,130,246,1)]"></div>
          )}
        </button>
      </div>

      {/* Title & Body Section */}
      <div className="flex-1 space-y-5 relative z-10 px-2 transition-transform duration-500 group-hover:translate-x-3">
        <div>
          <h3 className={`text-2xl lg:text-3xl font-black tracking-tight leading-tight transition-all duration-700 ${isCompleted ? 'text-slate-500 line-through opacity-40' : 'text-white group-hover:text-blue-200'}`}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-[15px] text-slate-400 font-bold mt-4 leading-relaxed opacity-60 group-hover:opacity-100 transition-opacity line-clamp-3">
              {task.description}
            </p>
          )}
        </div>

        {/* Subtasks Progress - Glassy Multi-layered Bar */}
        {subtasksStats && (
          <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-bottom-6 duration-700">
             <div className="flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-widest px-1">
               <span className="flex items-center gap-2.5 transition-colors group-hover:text-blue-400">
                 <Icons.LayoutDashboard className="w-4 h-4" /> حالة الإنجاز التشغيلي
               </span>
               <span className="text-blue-400 font-black drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">{subtasksStats.text} ({subtasksStats.percent}%)</span>
             </div>
             <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(59,130,246,0.8)] relative"
                  style={{ width: `${subtasksStats.percent}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-30"></div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Footer Meta & Interaction Icons */}
      <div className="space-y-6 relative z-10 px-2 mt-2">
         <div className="flex flex-wrap items-center gap-6 text-[12px] font-black text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-3 transition-all group-hover:text-white group-hover:translate-x-2">
               <Icons.Calendar className="w-4.5 h-4.5 text-blue-500 group-hover:scale-125 transition-transform" />
               <span>{formatDate(task.dueDate) || 'موعد مفتوح'}</span>
            </div>
            {task.reminderAt && (
              <div className="flex items-center gap-3 text-amber-400 animate-pulse bg-amber-500/10 px-4 py-2 rounded-2xl border border-amber-500/20">
                 <Icons.AlarmClock className="w-4.5 h-4.5" />
                 <span>تنبيه نشط</span>
              </div>
            )}
            <div className="flex-1"></div>
            <div className="flex items-center gap-4 bg-white/5 px-5 py-2.5 rounded-[20px] border border-white/5 text-slate-300 transition-all hover:bg-white/15 hover:border-white/20 hover:scale-110">
               <span className="text-[10px]">{task.category}</span>
               <div className="w-5 h-5 text-blue-400 opacity-80 group-hover:scale-125 transition-transform group-hover:rotate-12">
                  {task.icon && CategoryIconMap[task.icon] ? CategoryIconMap[task.icon] : CategoryIconMap['star']}
               </div>
            </div>
         </div>

         {/* Action Bar - Advanced Hover Effects */}
         <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <div className="flex items-center gap-3">
               <button 
                  onClick={() => onEdit(task)} 
                  className="p-3.5 text-slate-500 hover:text-white transition-all icon-action-btn hover:rotate-[15deg] group/edit" 
                  title="تعديل المهمة"
               >
                 <Icons.Edit className="w-5.5 h-5.5 group-hover/edit:drop-shadow-[0_0_12px_rgba(255,255,255,0.9)] transition-all" />
               </button>
               <button 
                  onClick={() => onCopy(task)} 
                  className="p-3.5 text-slate-500 hover:text-blue-400 transition-all icon-action-btn group/copy" 
                  title="تكرار المهمة"
               >
                 <Icons.Copy className="w-5.5 h-5.5 group-hover/copy:translate-x-1 group-hover/copy:-translate-y-1 group-hover/copy:drop-shadow-[0_0_12px_rgba(59,130,246,0.8)] transition-all" />
               </button>
               <button 
                  onClick={() => onEdit(task)} 
                  className="p-3.5 text-slate-500 hover:text-amber-400 transition-all icon-action-btn group/bell" 
                  title="إعداد التنبيه"
               >
                 <Icons.AlarmClock className="w-5.5 h-5.5 group-hover/bell:animate-bounce group-hover/bell:drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
               </button>
               <button 
                  onClick={() => onTogglePin(task.id)} 
                  className={`p-3.5 transition-all icon-action-btn ${task.isPinned ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'text-slate-500 hover:text-amber-300'} group/pin`} 
                  title="تثبيت المهمة"
               >
                 <Icons.Pin className={`w-5.5 h-5.5 transition-transform group-hover/pin:scale-125 ${task.isPinned ? 'rotate-[20deg]' : ''}`} filled={task.isPinned} />
               </button>
            </div>
            <button 
              onClick={() => setIsDeleting(true)} 
              className="p-3.5 text-slate-500 hover:text-rose-500 transition-all icon-action-btn group/trash" 
              title="حذف نهائي"
            >
              <Icons.Trash className="w-5.5 h-5.5 group-hover/trash:animate-[shake_0.6s_infinite] group-hover/trash:drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]" />
            </button>
         </div>
      </div>

      {/* Confirmation UI */}
      {isDeleting && (
        <div className="absolute inset-0 z-[100] bg-slate-950/99 backdrop-blur-[60px] rounded-[45px] flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-300 border border-rose-500/30 shadow-[0_0_150px_rgba(244,63,94,0.25)]">
          <div className="w-28 h-28 bg-rose-500/10 text-rose-500 rounded-[40px] flex items-center justify-center mb-8 border border-rose-500/25 shadow-[0_0_80px_rgba(244,63,94,0.5)] animate-pulse">
             <Icons.Trash className="w-14 h-14" />
          </div>
          <h4 className="text-3xl font-black text-white mb-4 tracking-tighter">حذف المهمة؟</h4>
          <p className="text-slate-500 text-[14px] font-bold mb-12 opacity-80 leading-relaxed max-w-[280px]">هذا الإجراء سيؤدي إلى مسح البيانات بشكل نهائي من السحابة ولا يمكن التراجع عنه.</p>
          <div className="flex gap-5 w-full max-w-[340px]">
            <button onClick={() => onDelete(task.id)} className="flex-1 py-5 bg-rose-600 hover:bg-rose-50 text-white hover:text-rose-600 text-[13px] font-black rounded-[28px] transition-all shadow-2xl active:scale-95 border border-rose-500/20">تأكيد الحذف</button>
            <button onClick={() => setIsDeleting(false)} className="flex-1 py-5 bg-white/5 text-slate-400 text-[13px] font-black rounded-[28px] hover:bg-white/10 transition-all active:scale-95 border border-white/10">تراجع</button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-12deg); }
          40% { transform: rotate(12deg); }
          60% { transform: rotate(-12deg); }
          80% { transform: rotate(12deg); }
        }
      `}</style>
    </div>
  );
};

export default TaskCard;
