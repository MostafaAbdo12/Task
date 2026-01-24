import React, { useState } from 'react';
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
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, onDelete, onEdit, onCopy, onStatusChange, onTogglePin, onToggleFavorite, index 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const isCompleted = task.status === TaskStatus.COMPLETED;

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    
    if (nextStatus === TaskStatus.COMPLETED) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      confetti({
        particleCount: 35,
        spread: 45,
        origin: { 
          x: (rect.left + rect.width / 2) / window.innerWidth, 
          y: (rect.top + rect.height / 2) / window.innerHeight 
        },
        colors: ['#6366f1', '#818cf8', '#ffffff'],
      });
    }
    onStatusChange(task.id, nextStatus);
  };

  const priority = PRIORITY_LABELS[task.priority] || PRIORITY_LABELS.MEDIUM;

  return (
    <div 
      className={`
        relative group rounded-[2.5rem] p-6 flex flex-col h-full transition-all duration-500
        bg-gradient-to-br from-white/[0.06] to-white/[0.01]
        border border-white/10 hover:border-indigo-500/40
        backdrop-blur-xl shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-2
        ${isCompleted ? 'opacity-50 grayscale-[0.3]' : 'opacity-100'}
      `}
    >
      {/* Decorative Glow background on hover */}
      <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[2.5rem] -z-10"></div>

      {/* Top Header Section */}
      <div className="flex items-start justify-between mb-5">
        <button 
          onClick={handleComplete}
          className={`
            w-7 h-7 rounded-xl border-2 flex items-center justify-center transition-all duration-300
            ${isCompleted 
              ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30' 
              : 'border-white/10 hover:border-indigo-400 text-transparent hover:text-indigo-400/50'
            }
          `}
        >
          <Icons.CheckCircle className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
           {task.isPinned && (
             <div className="bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20">
               <Icons.Pin className="w-3.5 h-3.5 text-amber-500" filled />
             </div>
           )}
           <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border border-white/5 ${priority.color.replace('bg-', 'bg-opacity-10 ').replace('text-', 'text-opacity-90 ')}`}>
             {priority.label}
           </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 mb-8">
        <h3 className={`text-lg font-bold text-white mb-2 leading-tight tracking-tight group-hover:text-indigo-100 transition-colors ${isCompleted ? 'line-through text-slate-500' : ''}`}>
          {task.title}
        </h3>
        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed font-medium">
          {task.description}
        </p>

        {/* Dynamic Status Indicators */}
        <div className="flex flex-wrap gap-2 mt-4">
           {task.subTasks && task.subTasks.length > 0 && (
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 bg-white/5 px-2.5 py-1.5 rounded-xl border border-white/5">
                <Icons.LayoutDashboard className="w-3.5 h-3.5" />
                <span>{task.subTasks.filter(s => s.isCompleted).length} / {task.subTasks.length}</span>
             </div>
           )}
           {task.reminderAt && (
              <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2.5 py-1.5 rounded-xl border border-indigo-500/10">
                <Icons.AlarmClock className="w-3.5 h-3.5" />
                <span>{new Date(task.reminderAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
           )}
        </div>
      </div>

      {/* Footer Actions Section */}
      <div className="pt-5 border-t border-white/10 flex items-center justify-between">
         <div className="flex items-center gap-3.5">
            <div 
              className="w-10 h-10 rounded-[1.25rem] bg-white/[0.04] flex items-center justify-center transition-all duration-500 group-hover:bg-indigo-500/10 group-hover:rotate-6 group-hover:scale-110" 
              style={{ color: task.color }}
            >
               <div className="w-5 h-5">
                 {task.icon && CategoryIconMap[task.icon] ? CategoryIconMap[task.icon] : CategoryIconMap['star']}
               </div>
            </div>
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">{task.category}</span>
               <span className="text-[10px] font-bold text-slate-500">
                  {new Date(task.dueDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
               </span>
            </div>
         </div>

         {/* Hidden Actions - Animated Appearance */}
         <div className="flex gap-1.5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <button 
              onClick={() => onToggleFavorite?.(task.id)} 
              className={`p-2.5 rounded-xl transition-all ${task.isFavorite ? 'text-rose-500 bg-rose-500/10' : 'text-slate-500 hover:text-rose-400 hover:bg-white/10'}`}
              title="تفضيل"
            >
               <Icons.Heart className="w-4 h-4" filled={task.isFavorite} />
            </button>
            <button 
              onClick={() => onEdit(task)} 
              className="p-2.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              title="تعديل"
            >
              <Icons.Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsDeleting(true)} 
              className="p-2.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
              title="حذف"
            >
              <Icons.Trash className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Confirmation Overlay */}
      {isDeleting && (
        <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in-95 duration-300">
           <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mb-6 border border-rose-500/20">
              <Icons.Trash className="w-8 h-8" />
           </div>
           <p className="text-sm font-black text-white mb-8 tracking-tight">هل تريد إرسال هذا السجل إلى سلة المحذوفات؟</p>
           <div className="flex gap-3 w-full">
              <button 
                onClick={() => onDelete(task.id)} 
                className="flex-1 py-3.5 bg-rose-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-rose-700 active:scale-95 transition-all shadow-xl shadow-rose-900/20"
              >
                تأكيد الحذف
              </button>
              <button 
                onClick={() => setIsDeleting(false)} 
                className="flex-1 py-3.5 bg-white/5 text-slate-400 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 active:scale-95 transition-all"
              >
                تراجع
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;