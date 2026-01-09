
import React, { useState, useRef, useMemo } from 'react';
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
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Calculate relative percentage for spotlight
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });

    // Calculate 3D rotation
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (e.clientY - rect.top - centerY) / 20;
    const rotateY = (centerX - (e.clientX - rect.left)) / 40;
    setRotation({ x: rotateX, y: rotateY });
  };

  const resetEffects = () => {
    setRotation({ x: 0, y: 0 });
    setMousePos({ x: 50, y: 50 });
  };

  const priorityStyles = useMemo(() => {
    switch (task.priority) {
      case 'URGENT': return { color: 'cyber-rose', glow: 'rgba(255, 0, 85, 0.4)' };
      case 'HIGH': return { color: 'cyber-purple', glow: 'rgba(188, 19, 254, 0.4)' };
      default: return { color: 'cyber-blue', glow: 'rgba(0, 242, 255, 0.4)' };
    }
  }, [task.priority]);

  return (
    <div 
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetEffects}
      className={`group relative perspective-1000 transition-all duration-500 ${isCompleted ? 'opacity-40 grayscale-[0.6]' : 'opacity-100'}`}
    >
      {/* 3D Wrapper */}
      <div 
        className="crystal-card p-8 flex flex-col transition-all duration-300 ease-out rounded-[2.5rem] border-white/5 group-hover:border-white/10 group-hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]"
        style={{
          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${rotation.x !== 0 ? 1.02 : 1})`,
          background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.08) 0%, transparent 60%), rgba(10, 10, 15, 0.6)`
        }}
      >
        {/* Animated Corner Accents */}
        <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-${priorityStyles.color}/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-tr-[2.5rem]`}></div>
        
        {/* Floating Glass Reflection */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-10 transition-opacity duration-700"
          style={{
            background: `linear-gradient(${135 + rotation.y * 2}deg, transparent 40%, white 50%, transparent 60%)`,
            transform: `translateX(${rotation.y * 5}px) translateY(${rotation.x * 5}px)`
          }}
        ></div>

        {/* Holographic Top Bar */}
        <div className={`absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-${priorityStyles.color}/40 to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-shimmer`}></div>

        <div className="flex items-center gap-8 relative z-10">
          {/* Status Toggle Node */}
          <button 
            onClick={() => onStatusChange(task.id, isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED)}
            className={`relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 border group/check ${
              isCompleted 
              ? 'bg-cyber-emerald border-cyber-emerald shadow-[0_0_25px_#00ffaa]' 
              : 'border-white/10 hover:border-cyber-blue/50 bg-black/60 shadow-inner'
            }`}
          >
            <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 group-hover/check:opacity-100 animate-pulse"></div>
            {isCompleted ? <Icons.CheckCircle className="w-7 h-7 text-black drop-shadow-md" /> : <div className="w-3 h-3 rounded-full border border-zinc-700 group-hover/check:scale-125 transition-transform"></div>}
          </button>

          <div className="flex-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex items-center gap-5 mb-3">
              <h3 className={`text-2xl font-black transition-all duration-500 tracking-tight ${isCompleted ? 'line-through text-zinc-700' : 'text-white group-hover:text-cyber-blue'}`}>
                {task.title}
              </h3>
              {task.isPinned && (
                <div className="bg-cyber-purple/10 p-2 rounded-lg border border-cyber-purple/20 animate-pulse">
                  <Icons.Pin className="text-cyber-purple w-4 h-4" filled />
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2.5 group/label">
                <span className="w-2 h-2 rounded-full transition-all group-hover/label:scale-150" style={{ backgroundColor: task.color, boxShadow: `0 0 12px ${task.color}` }}></span>
                {task.category}
              </span>
              <span className="flex items-center gap-2.5 group/date">
                <Icons.Calendar className="w-3.5 h-3.5 group-hover/date:text-cyber-purple transition-colors" /> 
                {task.dueDate || 'PENDING_DATE'}
              </span>
              <span className={`flex items-center gap-2 border border-${priorityStyles.color}/20 bg-${priorityStyles.color}/5 text-${priorityStyles.color} px-4 py-1.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.3)]`}>
                <div className={`w-1.5 h-1.5 rounded-full bg-${priorityStyles.color} animate-pulse`}></div>
                {PRIORITY_LABELS[task.priority].label}
              </span>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
             <button onClick={(e) => {e.stopPropagation(); onTogglePin(task.id)}} className={`p-3.5 rounded-2xl border border-white/5 transition-all hover:border-cyber-purple/30 ${task.isPinned ? 'text-cyber-purple bg-cyber-purple/5' : 'text-zinc-600 hover:text-cyber-purple bg-black/40'}`}>
               <Icons.Pin filled={task.isPinned} className="w-4.5 h-4.5" />
             </button>
             <button onClick={(e) => {e.stopPropagation(); onEdit(task)}} className="p-3.5 rounded-2xl border border-white/5 bg-black/40 text-zinc-600 hover:text-cyber-blue hover:border-cyber-blue/30 transition-all">
               <Icons.Edit className="w-4.5 h-4.5" />
             </button>
             <button onClick={(e) => {e.stopPropagation(); onDelete(task.id)}} className="p-3.5 rounded-2xl border border-white/5 bg-black/40 text-zinc-700 hover:text-rose-500 hover:border-rose-500/30 transition-all">
               <Icons.Trash className="w-4.5 h-4.5" />
             </button>
          </div>
        </div>

        {/* Detailed Breakdown Section */}
        <div className={`overflow-hidden transition-all duration-700 cubic-bezier(0.16, 1, 0.3, 1) ${isExpanded ? 'max-h-[800px] mt-10 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="pt-10 border-t border-white/10 space-y-10">
             <div className="relative p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                <div className="absolute top-4 left-4 text-[8px] font-black text-zinc-800 tracking-widest">DATA_CORE</div>
                <p className="text-base text-zinc-300 leading-relaxed font-medium pt-4">{task.description || 'النظام لم يسجل تفاصيل إضافية لهذا الكيان.'}</p>
             </div>
             
             <div className="space-y-6">
                <div className="flex justify-between items-center px-2">
                   <div className="flex items-center gap-4">
                      <div className="w-1 h-6 bg-cyber-blue rounded-full"></div>
                      <h4 className="text-[11px] font-black text-white uppercase tracking-[0.4em]">SUB_SYSTEM_MODULES</h4>
                   </div>
                   <button 
                     onClick={(e) => {e.stopPropagation(); onBreakdown(task)}}
                     className="text-[9px] font-black text-cyber-blue flex items-center gap-3 px-4 py-2 bg-cyber-blue/5 rounded-full border border-cyber-blue/20 hover:bg-cyber-blue hover:text-black transition-all shadow-[0_0_15px_rgba(0,242,255,0.1)]"
                   >
                     <Icons.Sparkles className="w-3.5 h-3.5" /> AI_BREAKDOWN
                   </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {task.subTasks.map((sub, sIdx) => (
                     <div 
                      key={sub.id} 
                      onClick={(e) => {e.stopPropagation(); onToggleSubtask(task.id, sub.id)}}
                      className={`group/sub flex items-center gap-5 p-5 rounded-[1.5rem] cursor-pointer border transition-all duration-500 active:scale-95 ${
                        sub.isCompleted 
                        ? 'bg-cyber-emerald/5 border-cyber-emerald/20 shadow-inner' 
                        : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/[0.03]'
                      }`}
                      style={{ transitionDelay: `${sIdx * 50}ms` }}
                     >
                       <div className={`w-6 h-6 rounded-xl border transition-all flex items-center justify-center ${
                         sub.isCompleted 
                         ? 'bg-cyber-emerald border-cyber-emerald shadow-[0_0_15px_#00ffaa]' 
                         : 'border-zinc-800 bg-zinc-950/50 group-hover/sub:border-cyber-blue/50'
                       }`}>
                          {sub.isCompleted && <Icons.CheckCircle className="text-black w-4 h-4" />}
                       </div>
                       <span className={`text-sm font-bold tracking-tight ${sub.isCompleted ? 'line-through text-zinc-600' : 'text-zinc-300 group-hover/sub:text-white transition-colors'}`}>
                        {sub.title}
                       </span>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
