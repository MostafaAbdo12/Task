
import React, { useState, useRef } from 'react';
import { Task, TaskStatus } from '../types';
import { Icons, PRIORITY_LABELS } from '../constants';

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
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 25;
    const rotateY = (centerX - x) / 50;
    setRotation({ x: rotateX, y: rotateY });
  };

  const resetRotation = () => setRotation({ x: 0, y: 0 });

  const priorityColor = task.priority === 'URGENT' ? 'cyber-rose' : task.priority === 'HIGH' ? 'cyber-purple' : 'cyber-blue';

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetRotation}
      className={`group crystal-card p-8 flex flex-col transition-all duration-700 relative overflow-hidden rounded-[2.5rem] border-white/5 hover:border-${priorityColor}/30 ${
        isCompleted ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'
      }`}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateY(${rotation.x !== 0 ? '-5px' : '0'})`,
      }}
    >
      {/* Interactive Scan Line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent animate-scan-line opacity-0 group-hover:opacity-100"></div>

      <div className="flex items-center gap-8 relative z-10">
        <button 
          onClick={() => onStatusChange(task.id, isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED)}
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 border ${
            isCompleted 
            ? 'bg-cyber-emerald border-cyber-emerald shadow-[0_0_20px_#00ffaa]' 
            : 'border-white/10 hover:border-cyber-blue/50 bg-black/40'
          }`}
        >
          {isCompleted && <Icons.CheckCircle className="w-6 h-6 text-black" />}
        </button>

        <div className="flex-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center gap-4 mb-2">
            <h3 className={`text-2xl font-black transition-all duration-500 ${isCompleted ? 'line-through text-zinc-700' : 'text-white group-hover:text-cyber-blue'}`}>
              {task.title}
            </h3>
            {task.isPinned && <Icons.Pin className="text-cyber-purple w-4 h-4" filled />}
          </div>
          
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[9px] font-black text-zinc-600 uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.color, boxShadow: `0 0 8px ${task.color}` }}></span>
              {task.category}
            </span>
            <span className="flex items-center gap-2 opacity-50"><Icons.Calendar className="w-3 h-3" /> {task.dueDate || 'NO_DATE'}</span>
            <span className={`text-${priorityColor} px-3 py-1 rounded-lg bg-black/40 border border-${priorityColor}/20`}>
              {PRIORITY_LABELS[task.priority].label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
           <button onClick={(e) => {e.stopPropagation(); onTogglePin(task.id)}} className={`p-3 rounded-xl hover:bg-white/5 ${task.isPinned ? 'text-cyber-purple' : 'text-zinc-600'}`}>
             <Icons.Pin filled={task.isPinned} className="w-4 h-4" />
           </button>
           <button onClick={(e) => {e.stopPropagation(); onEdit(task)}} className="p-3 rounded-xl hover:bg-white/5 text-zinc-600 hover:text-white">
             <Icons.Edit className="w-4 h-4" />
           </button>
           <button onClick={(e) => {e.stopPropagation(); onDelete(task.id)}} className="p-3 rounded-xl hover:bg-rose-500/10 text-zinc-700 hover:text-rose-500">
             <Icons.Trash className="w-4 h-4" />
           </button>
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-700 ${isExpanded ? 'max-h-[500px] mt-8 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="pt-6 border-t border-white/5 space-y-6">
           <p className="text-sm text-zinc-400 leading-relaxed font-medium">{task.description || 'لا توجد بيانات وصفية إضافية.'}</p>
           
           <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <h4 className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">SUB_OPERATIONS</h4>
                 <button 
                   onClick={(e) => {e.stopPropagation(); onBreakdown(task)}}
                   className="text-[8px] font-black text-cyber-blue flex items-center gap-2 hover:scale-105 transition-all"
                 >
                   <Icons.Sparkles className="w-3 h-3" /> AI_BREAKDOWN
                 </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {task.subTasks.map(sub => (
                   <div 
                    key={sub.id} 
                    onClick={(e) => {e.stopPropagation(); onToggleSubtask(task.id, sub.id)}}
                    className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer border transition-all ${
                      sub.isCompleted ? 'bg-cyber-emerald/5 border-cyber-emerald/20' : 'bg-white/5 border-white/5 hover:border-white/20'
                    }`}
                   >
                     <div className={`w-5 h-5 rounded-lg border transition-all flex items-center justify-center ${sub.isCompleted ? 'bg-cyber-emerald border-cyber-emerald shadow-[0_0_10px_#00ffaa]' : 'border-zinc-800'}`}>
                        {sub.isCompleted && <Icons.CheckCircle className="text-black w-3 h-3" />}
                     </div>
                     <span className={`text-xs font-bold ${sub.isCompleted ? 'line-through text-zinc-700' : 'text-zinc-300'}`}>{sub.title}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
