
import React, { useState } from 'react';
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
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const priorityMeta = PRIORITY_LABELS[task.priority] || PRIORITY_LABELS[TaskPriority.MEDIUM];

  // تنسيق تاريخ الإنشاء
  const formattedDate = new Date(task.createdAt).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    
    if (nextStatus === TaskStatus.COMPLETED) {
      // إطلاق القصاصات الملونة احتفالاً بالإنجاز
      const scalar = 1.3;
      const triangle = confetti.shapeFromPath({ path: 'M0 10 L5 0 L10 10z' });

      confetti({
        shapes: [triangle, 'circle'],
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6, x: 0.5 },
        colors: [task.color, '#7c3aed', '#3b82f6', '#db2777'],
        gravity: 1.2,
        scalar: scalar,
        ticks: 180
      });
    }
    
    onStatusChange(task.id, nextStatus);
  };

  return (
    <div 
      style={{ animationDelay: `${index * 80}ms` }}
      className={`nebula-card p-7 flex flex-col gap-6 relative group transition-all duration-700 ${isCompleted ? 'opacity-40 grayscale-[0.8]' : ''}`}
    >
      {/* Enhanced Parallax Background Layer */}
      <div 
        className="card-parallax-bg absolute inset-0 opacity-20 pointer-events-none transition-all duration-700 group-hover:opacity-40" 
        style={{ 
          background: `radial-gradient(circle at top right, ${task.color}44 0%, transparent 70%)`,
        }}
      ></div>

      {/* Modern Creation Date Tooltip */}
      <div className="absolute top-4 left-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform -translate-y-2 group-hover:translate-y-0 z-20 pointer-events-none">
        <div className="tooltip-nebula">
          <span className="opacity-60 ml-1">تاريخ الإضافة:</span> {formattedDate}
        </div>
      </div>

      {/* Glowing Status Streamer */}
      {!isCompleted && (
        <div className="absolute top-0 right-0 w-full h-[3px] bg-gradient-to-l from-transparent via-nebula-purple/40 to-transparent group-hover:via-nebula-purple group-hover:shadow-[0_0_20px_rgba(124,58,237,0.6)] transition-all duration-700"></div>
      )}

      <div className="flex items-start justify-between gap-4 relative z-10">
        <div className="flex items-start gap-5 flex-1">
          {/* Completion Checkbox Button */}
          <button 
            onClick={handleComplete}
            className={`mt-1 w-9 h-9 rounded-2xl border-2 transition-all duration-700 flex items-center justify-center shrink-0
              ${isCompleted 
                ? 'bg-nebula-purple border-nebula-purple text-white shadow-[0_0_20px_rgba(124,58,237,0.7)] rotate-[360deg]' 
                : 'border-white/10 hover:border-nebula-purple hover:scale-110 group-hover:bg-white/10'}
            `}
          >
            {isCompleted ? <Icons.CheckCircle className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-white/30 group-hover:bg-nebula-purple/50 transition-colors"></div>}
          </button>

          <div className="flex-1">
            <h3 className={`font-black text-2xl tracking-tight transition-all duration-500 ${isCompleted ? 'text-slate-500 line-through' : 'text-white group-hover:text-nebula-purple'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-[14px] text-slate-400 mt-2 line-clamp-2 leading-relaxed font-medium transition-colors group-hover:text-slate-200">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Pin Action with Animation */}
        <button 
          onClick={() => onTogglePin(task.id)} 
          className={`p-3 rounded-2xl bg-white/5 transition-all duration-500 hover:scale-125 hover:bg-white/10 ${task.isPinned ? 'text-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.4)] rotate-12' : 'text-slate-600 hover:text-white'}`}
          title={task.isPinned ? 'إلغاء التثبيت' : 'تثبيت المهمة'}
        >
          <Icons.Pin className="w-5 h-5" filled={task.isPinned} />
        </button>
      </div>

      {/* Footer Area with Action Icons */}
      <div className="flex items-center justify-between pt-6 mt-auto border-t border-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/5 border border-white/5 transition-all group-hover:bg-white/10 group-hover:border-white/10">
             <div className="w-4 h-4 transition-transform duration-700 group-hover:scale-125 group-hover:rotate-6" style={{ color: task.color }}>{task.icon && CategoryIconMap[task.icon]}</div>
             <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{task.category}</span>
          </div>
          <span className={`text-[10px] font-black px-3.5 py-1 rounded-xl uppercase tracking-tighter shadow-sm ${priorityMeta.color.replace('bg-', 'bg-').replace('text-', 'text-')}`}>
            {priorityMeta.label}
          </span>
        </div>
        
        {/* Actions Button Group - Animated & Including Reminder Icon */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 duration-500 delay-75">
          <button 
            onClick={() => onEdit(task)} 
            className="p-2.5 text-slate-400 icon-action-btn hover:text-nebula-pink" 
            title="إضافة تنبيه مخصص"
          >
            <Icons.AlarmClock className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onCopy(task)} 
            className="p-2.5 text-slate-400 icon-action-btn hover:text-emerald-400" 
            title="نسخ مكرر"
          >
            <Icons.Copy className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onEdit(task)} 
            className="p-2.5 text-slate-400 icon-action-btn hover:text-nebula-blue"
            title="تعديل البيانات"
          >
            <Icons.Edit className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setIsDeleting(true)} 
            className="p-2.5 text-slate-400 icon-action-btn hover:text-rose-500"
            title="حذف المهمة"
          >
            <Icons.Trash className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Modern Delete Overlay */}
      {isDeleting && (
        <div className="absolute inset-0 z-40 bg-[#020617]/95 backdrop-blur-2xl rounded-[32px] flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 bg-rose-500/20 rounded-3xl flex items-center justify-center text-rose-500 mb-6 animate-bounce shadow-2xl">
            <Icons.Trash className="w-8 h-8" />
          </div>
          <p className="text-xl font-black mb-8 tracking-tight text-white">هل تريد إزالة هذه المهمة نهائياً؟</p>
          <div className="flex gap-4 w-full max-w-xs">
            <button 
              onClick={() => onDelete(task.id)} 
              className="flex-1 py-4 bg-gradient-to-r from-rose-600 to-rose-500 text-white text-[14px] font-black rounded-2xl shadow-xl shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all"
            >
              تأكيد الحذف
            </button>
            <button 
              onClick={() => setIsDeleting(false)} 
              className="flex-1 py-4 bg-white/5 border border-white/10 text-[14px] font-black rounded-2xl hover:bg-white/10 transition-all text-slate-400"
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
