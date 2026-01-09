
import React, { useState } from 'react';
import { Task, TaskStatus } from '../types';
import { Icons, PRIORITY_LABELS, CategoryIconMap } from '../constants';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onCopy: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onBreakdown: (task: Task) => void;
  onTogglePin: (id: string) => void;
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, onDelete, onEdit, onCopy, onStatusChange, 
  onToggleSubtask, onBreakdown, onTogglePin, index 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isCompleted = task.status === TaskStatus.COMPLETED;
  
  return (
    <div 
      className={`group w-full glass-morphism rounded-[2.5rem] p-8 transition-all duration-700 stagger-item flex flex-col task-card-motion ${isCompleted ? 'opacity-40' : 'opacity-100'}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center gap-8">
        {/* Liquid Checkbox */}
        <button 
          onClick={() => onStatusChange(task.id, isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED)}
          className={`w-10 h-10 rounded-[1.2rem] border-2 transition-all duration-500 flex items-center justify-center shrink-0 ${isCompleted ? 'bg-indigo-500 border-indigo-500 text-white rotate-[15deg] scale-110 shadow-lg shadow-indigo-500/50' : 'border-white/10 hover:border-indigo-500 bg-white/5 hover:scale-105'}`}
        >
          {isCompleted ? <Icons.CheckCircle /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-indigo-400 transition-colors"></div>}
        </button>

        {/* Title Interaction Area */}
        <div className="flex-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center gap-4 mb-2">
            <h3 className={`text-xl font-bold transition-all duration-500 ${isCompleted ? 'line-through text-slate-500 translate-x-4' : 'text-slate-100 group-hover:text-indigo-400'}`}>
              {task.title}
            </h3>
            {task.isPinned && <div className="text-indigo-400 animate-float"><Icons.Pin filled /></div>}
          </div>
          <div className="flex items-center gap-6">
             <span className="text-[10px] px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 font-black uppercase tracking-[0.2em] border border-white/5 shadow-inner">
               {task.category}
             </span>
             <span className="text-[10px] text-slate-500 font-mono font-bold tracking-widest">{task.dueDate || 'Open Timeline'}</span>
          </div>
        </div>

        {/* Floating Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-8 group-hover:translate-x-0">
          <button onClick={() => onTogglePin(task.id)} className={`p-3 rounded-2xl transition-all active:scale-75 ${task.isPinned ? 'bg-indigo-500/20 text-indigo-400' : 'hover:bg-white/10'}`}><Icons.Pin filled={task.isPinned} /></button>
          <button onClick={() => onEdit(task)} className="p-3 hover:bg-white/10 rounded-2xl transition-all active:scale-75"><Icons.Edit /></button>
          <button onClick={() => onDelete(task.id)} className="p-3 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 rounded-2xl transition-all active:scale-75"><Icons.Trash /></button>
        </div>
      </div>

      {/* Accordion Smooth Expansion */}
      <div className={`overflow-hidden transition-all duration-700 ease-in-out ${isExpanded ? 'max-h-[600px] mt-8 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pt-8 border-t border-white/5 space-y-8">
          <div className="bg-white/[0.03] p-6 rounded-[2rem] border border-white/5 shadow-inner">
             <p className="text-sm text-slate-300 leading-relaxed font-medium italic">"{task.description || 'هذا السجل ينتظر كلماتك ليعبر عن جوهره...'}"</p>
          </div>
          
          <div className="space-y-5">
            <div className="flex justify-between items-center px-4">
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div> الخطة الذكية
               </span>
               <button 
                onClick={(e) => { e.stopPropagation(); onBreakdown(task); }} 
                className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 flex items-center gap-2 transition-all active:scale-95 px-4 py-2 glass-morphism rounded-xl"
               >
                 <Icons.Sparkles /> ذكاء اصطناعي
               </button>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {task.subTasks.map(sub => (
                <div 
                  key={sub.id} 
                  onClick={(e) => { e.stopPropagation(); onToggleSubtask(task.id, sub.id); }} 
                  className="flex items-center gap-5 p-5 glass-morphism rounded-[1.5rem] cursor-pointer hover:bg-white/5 transition-all group/sub"
                >
                  <div className={`w-5 h-5 rounded-lg border-2 transition-all duration-500 ${sub.isCompleted ? 'bg-indigo-500 border-indigo-500 scale-90' : 'border-slate-700 group-hover/sub:border-indigo-500'}`}></div>
                  <span className={`text-xs font-bold transition-all ${sub.isCompleted ? 'line-through text-slate-600 translate-x-2' : 'text-slate-300 group-hover/sub:text-white'}`}>{sub.title}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center px-4 py-2">
             <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                <Icons.Calendar /> تم التعديل: {new Date(task.updatedAt).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}
             </div>
             <div className={`px-6 py-2 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest shadow-lg ${PRIORITY_LABELS[task.priority].color}`}>
               {PRIORITY_LABELS[task.priority].label}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
