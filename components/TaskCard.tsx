
import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { Icons, PRIORITY_LABELS } from '../constants';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onTogglePin: (id: string) => void;
  index: number;
}

const PRIORITY_THEMES: Record<TaskPriority, string> = {
  [TaskPriority.LOW]: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5',
  [TaskPriority.MEDIUM]: 'border-blue-500/20 text-blue-400 bg-blue-500/5',
  [TaskPriority.HIGH]: 'border-orange-500/20 text-orange-400 bg-orange-500/5',
  [TaskPriority.URGENT]: 'border-rose-500/20 text-rose-400 bg-rose-500/5',
};

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete, onEdit, onStatusChange, onTogglePin, index }) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const isCompleted = task.status === TaskStatus.COMPLETED;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('ar-EG', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div 
      className={`relative overflow-hidden cmd-glass p-6 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 group border border-cmd-border transition-all duration-500 
        ${isCompleted ? 'opacity-40 grayscale scale-[0.98]' : 'hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_rgba(0,242,255,0.15)] hover:border-cmd-accent/40'}
        bg-gradient-to-br from-white/[0.02] to-transparent`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      {/* Selection Glow Effect */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cmd-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

      {/* Status Toggle Area */}
      <div className="relative shrink-0">
        <button 
          onClick={() => onStatusChange(task.id, isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED)}
          className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-300 
            ${isCompleted ? 'bg-cmd-accent border-cmd-accent text-black shadow-[0_0_15px_rgba(0,242,255,0.5)]' : 'border-white/10 hover:border-cmd-accent/50 text-cmd-accent bg-white/5'}`}
        >
          {isCompleted ? <Icons.CheckCircle className="w-6 h-6" /> : <div className="w-2 h-2 rounded-full bg-cmd-accent/30"></div>}
        </button>
      </div>

      {/* Task Content */}
      <div className="flex-1 min-w-0 space-y-3 z-10">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className={`text-lg font-bold truncate transition-all duration-500 ${isCompleted ? 'line-through text-white/20' : 'text-white'}`}>
            {task.title}
          </h3>
          <div className="flex items-center gap-2">
            {task.isPinned && <Icons.Pin className="w-3.5 h-3.5 text-cmd-accent drop-shadow-[0_0_5px_rgba(0,242,255,0.5)]" filled />}
            <span className={`text-[9px] font-mono px-2.5 py-1 rounded-lg border uppercase font-black tracking-widest ${PRIORITY_THEMES[task.priority]}`}>
              {PRIORITY_LABELS[task.priority]?.label}
            </span>
          </div>
        </div>
        
        <p className={`text-sm leading-relaxed transition-colors duration-500 ${isCompleted ? 'text-white/10' : 'text-cmd-text-dim group-hover:text-white/60'}`}>
          {task.description || "لا يوجد بروتوكول وصفي لهذه المهمة."}
        </p>

        {/* Metadata Footer */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-3 border-t border-white/5">
          <div className="flex items-center gap-2 text-[10px] font-mono text-white/30 uppercase tracking-tighter">
             <div className="w-2 h-2 rounded-sm rotate-45" style={{ backgroundColor: task.color }}></div>
             <span className="group-hover:text-cmd-accent transition-colors">{task.category}</span>
          </div>
          
          <div className="flex items-center gap-4 text-[9px] font-mono text-white/20">
             <div className="flex items-center gap-1.5">
               <Icons.Calendar className="w-3 h-3 opacity-50" />
               <span>أنشئت: {formatDate(task.createdAt)}</span>
             </div>
             {task.updatedAt !== task.createdAt && (
               <div className="flex items-center gap-1.5 text-cmd-accent/40">
                 <Icons.Sparkles className="w-3 h-3" />
                 <span>تعديل: {formatDate(task.updatedAt)}</span>
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Interactive Controls */}
      <div className="flex items-center gap-2 z-10">
        {isConfirmingDelete ? (
          <div className="flex items-center gap-2 animate-in slide-in-from-left-4">
             <p className="text-[10px] font-black text-rose-500 uppercase tracking-tighter ml-2">متأكد؟</p>
             <button 
               onClick={() => onDelete(task.id)}
               className="px-3 py-1.5 bg-rose-500 text-white text-[10px] font-black rounded-lg hover:bg-rose-600 transition-colors"
             >تأكيد</button>
             <button 
               onClick={() => setIsConfirmingDelete(false)}
               className="px-3 py-1.5 bg-white/5 text-white/40 text-[10px] font-black rounded-lg hover:bg-white/10"
             >إلغاء</button>
          </div>
        ) : (
          <div className="flex items-center gap-1 md:opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
            <button 
              onClick={() => onTogglePin(task.id)} 
              title="تثبيت"
              className={`p-2.5 rounded-xl hover:bg-white/5 transition-colors ${task.isPinned ? 'text-cmd-accent bg-cmd-accent/5' : 'text-white/20'}`}
            >
              <Icons.Pin className="w-4 h-4" filled={task.isPinned} />
            </button>
            <button 
              onClick={() => onEdit(task)} 
              title="تعديل"
              className="p-2.5 rounded-xl hover:bg-white/5 text-white/20 hover:text-white transition-colors"
            >
              <Icons.Edit className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setIsConfirmingDelete(true)} 
              title="حذف"
              className="p-2.5 rounded-xl hover:bg-rose-500/10 text-white/20 hover:text-rose-500 transition-colors"
            >
              <Icons.Trash className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
