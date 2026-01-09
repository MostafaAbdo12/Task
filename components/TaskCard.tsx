
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
import { Icons, PRIORITY_LABELS, CategoryIconMap } from '../constants';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onBreakdown: (task: Task) => void;
  onTogglePin: (id: string) => void;
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete, onEdit, onStatusChange, onToggleSubtask, onBreakdown, onTogglePin, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const isCompleted = task.status === TaskStatus.COMPLETED;
  
  const progress = task.subTasks.length 
    ? Math.round((task.subTasks.filter(s => s.isCompleted).length / task.subTasks.length) * 100)
    : (isCompleted ? 100 : 0);

  const glowColor = task.color || '#00d2ff';

  const handleStatusToggle = () => {
    const newStatus = isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    
    if (newStatus === TaskStatus.COMPLETED) {
      setIsCelebrating(true);
      setTimeout(() => setIsCelebrating(false), 1000);
    }
    
    onStatusChange(task.id, newStatus);
  };

  // توليد جزيئات عشوائية للاحتفال
  const particles = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i / 12) * 360;
    const distance = 100 + Math.random() * 50;
    const tx = Math.cos(angle * Math.PI / 180) * distance;
    const ty = Math.sin(angle * Math.PI / 180) * distance;
    return { tx, ty, color: i % 2 === 0 ? task.color : '#ccff00' };
  });

  return (
    <div 
      className={`group cyber-card rounded-2xl p-6 transition-all duration-500 animate-fade-up border-r-4 ${
        isCompleted 
          ? 'opacity-60 grayscale-[0.5] border-white/5' 
          : 'hover:scale-[1.03] hover:border-white/20 active:scale-95'
      } ${isCompleted ? 'is-completed' : ''}`}
      style={{ 
        animationDelay: `${index * 0.05}s`,
        borderRightColor: isCompleted ? 'rgba(255,255,255,0.1)' : glowColor,
      }}
    >
      {/* تأثير الفلاش عند الإنجاز */}
      {isCelebrating && (
        <div className="absolute inset-0 z-50 animate-success-flash pointer-events-none rounded-2xl" />
      )}

      {/* الجزيئات المنفجرة */}
      {isCelebrating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          {particles.map((p, i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{ 
                backgroundColor: p.color,
                '--tw-translate-x': `${p.tx}px`,
                '--tw-translate-y': `${p.ty}px`
              } as any}
            />
          ))}
        </div>
      )}

      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
           style={{ boxShadow: isCompleted ? 'none' : `inset 0 0 20px ${glowColor}15, 0 10px 40px -10px ${glowColor}30` }} />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">محدد الهوية: {task.id.slice(-6)}</span>
            <div className="flex items-center gap-3">
               <div 
                className={`p-2 rounded-xl bg-white/5 transition-all duration-500 ${isCompleted ? 'rotate-[360deg] scale-110 text-cyber-lime' : 'group-hover:rotate-12'}`}
                style={{ color: isCompleted ? '#ccff00' : glowColor }}
               >
                  {isCompleted ? <Icons.CheckCircle /> : (task.icon && CategoryIconMap[task.icon] ? CategoryIconMap[task.icon] : CategoryIconMap['star'])}
               </div>
               <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-300">{task.category}</span>
                  {task.reminderAt && !task.reminderFired && (
                    <span className="text-[8px] text-cyber-purple font-black uppercase tracking-widest flex items-center gap-1">
                      <Icons.Bell /> مبرمج
                    </span>
                  )}
               </div>
            </div>
          </div>
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
            <button onClick={() => onTogglePin(task.id)} className={`p-1.5 rounded-lg transition-colors ${task.isPinned ? 'text-cyber-lime' : 'text-slate-600 hover:text-white'}`}><Icons.Pin filled={task.isPinned} /></button>
            <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg text-slate-600 hover:text-cyber-blue transition-colors"><Icons.Edit /></button>
            <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-lg text-slate-600 hover:text-cyber-rose transition-colors"><Icons.Trash /></button>
          </div>
        </div>

        <div className="mb-6 space-y-2">
          <h3 className={`text-xl font-bold tracking-tight transition-colors strike-animate ${isCompleted ? 'text-slate-500' : 'text-white group-hover:text-cyber-blue'}`}>
            {task.title}
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">
            {task.description}
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-slate-600 uppercase">تكامل البيانات</span>
            <span className={`text-xs font-black transition-colors ${isCompleted ? 'text-cyber-lime' : 'text-cyber-blue'}`}>{progress}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%`, backgroundColor: isCompleted ? '#ccff00' : task.color }}
            />
          </div>
        </div>

        {isExpanded && task.subTasks.length > 0 && (
          <div className="mb-6 space-y-2 animate-fade-up">
            {task.subTasks.map(st => (
              <div key={st.id} onClick={() => onToggleSubtask(task.id, st.id)} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:border-cyber-blue/30 group/sub transition-all">
                <div className={`w-4 h-4 rounded border transition-all ${st.isCompleted ? 'bg-cyber-blue border-cyber-blue' : 'border-slate-700'}`}>
                  {st.isCompleted && <Icons.CheckCircle />}
                </div>
                <span className={`text-[11px] font-bold ${st.isCompleted ? 'text-slate-600 line-through' : 'text-slate-300'}`}>{st.title}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-600">
              <Icons.Calendar />
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString('ar-SA') : 'مفتوح'}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onBreakdown(task)} className="p-2 bg-white/5 text-cyber-purple rounded-xl hover:scale-110 active:scale-90 transition-all hover:bg-cyber-purple/10">
              <Icons.Sparkles />
            </button>
            <button 
              onClick={handleStatusToggle}
              className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${isCompleted ? 'bg-cyber-lime text-black shadow-[0_0_15px_rgba(204,255,0,0.4)]' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'}`}
            >
              {isCompleted ? 'مهمة منجزة ✓' : 'معالجة المهمة'}
            </button>
            <button onClick={() => setIsExpanded(!isExpanded)} className={`p-2 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-cyber-blue' : 'text-slate-600'}`}>
              <Icons.Chevron />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
