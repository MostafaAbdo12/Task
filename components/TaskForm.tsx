
import React, { useState, useEffect, useRef } from 'react';
import { TaskPriority, Category } from '../types';
import { Icons, PRIORITY_LABELS } from '../constants';

interface TaskFormProps {
  onAdd: (task: any) => void;
  onUpdate?: (task: any) => void;
  onClose: () => void;
  initialTask?: any;
  categories: Category[];
}

const TaskForm: React.FC<TaskFormProps> = ({ onAdd, onUpdate, onClose, initialTask, categories }) => {
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority || TaskPriority.MEDIUM);
  const [category, setCategory] = useState(initialTask?.category || categories[0].name);
  const [dueDate, setDueDate] = useState(initialTask?.dueDate || '');
  
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 25;
    const rotateY = (centerX - x) / 25;
    setRotate({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    const taskData = {
      title,
      description,
      priority,
      category,
      dueDate,
      color: categories.find(c => c.name === category)?.color || '#ffffff',
      status: initialTask?.status || 'PENDING',
      subTasks: initialTask?.subTasks || [],
      isPinned: initialTask?.isPinned || false
    };

    if (initialTask && onUpdate) {
      onUpdate({ ...initialTask, ...taskData });
    } else {
      onAdd(taskData);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/85 backdrop-blur-3xl perspective-1000 animate-in fade-in duration-500">
      
      <div 
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: 'transform 0.1s ease-out'
        }}
        className="w-full max-w-2xl relative transition-all duration-700"
      >
        {/* Glow Aura behind the card */}
        <div className="absolute inset-[-40px] bg-cyber-blue/10 blur-[100px] rounded-full pointer-events-none animate-pulse"></div>
        
        <div className="relative bg-zinc-950/70 backdrop-blur-[60px] border border-white/10 rounded-[3.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] group">
          
          {/* Holographic Scan Line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyber-blue/40 to-transparent animate-scan-line opacity-50"></div>

          {/* Header Section */}
          <header className="px-12 pt-12 pb-6 flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-white italic tracking-tighter drop-shadow-[0_0_10px_rgba(0,242,255,0.3)]">
                {initialTask ? 'تحديث المعالجة' : 'بدء المهمة'}
              </h2>
              <p className="text-zinc-600 text-[9px] font-black tracking-[0.5em] uppercase">Operation_Initialization</p>
            </div>
            <button 
              onClick={onClose} 
              className="w-12 h-12 flex items-center justify-center bg-black/40 border border-white/5 rounded-2xl text-zinc-500 hover:text-rose-500 hover:border-rose-500/30 transition-all active:scale-90"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </header>

          <form onSubmit={handleSubmit} className="px-12 pb-12 space-y-8">
            {/* Title Identity Input */}
            <div className="space-y-3 group/field">
              <div className="flex justify-between items-center px-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-focus-within/field:text-cyber-blue transition-colors">مسمى المهمة</label>
                <Icons.Sparkles className="w-3.5 h-3.5 text-zinc-700 group-focus-within/field:text-cyber-blue transition-colors" />
              </div>
              <div className="relative">
                <input 
                  required
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pr-8 pl-8 py-5 outline-none focus:border-cyber-blue/40 focus:bg-white/[0.03] transition-all text-white font-black placeholder:text-zinc-800 text-2xl"
                  placeholder="ENTRY_TITLE..."
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-cyber-blue group-focus-within/field:w-[90%] transition-all duration-700 shadow-[0_0_10px_#00f2ff]"></div>
              </div>
            </div>

            {/* Description Matrix Input */}
            <div className="space-y-3 group/field">
              <div className="flex justify-between items-center px-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest group-focus-within/field:text-cyber-purple transition-colors">مصفوفة التفاصيل</label>
                <Icons.Folder className="w-3.5 h-3.5 text-zinc-700 group-focus-within/field:text-cyber-purple transition-colors" />
              </div>
              <div className="relative">
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl pr-8 pl-8 py-5 outline-none focus:border-cyber-purple/40 focus:bg-white/[0.03] transition-all text-zinc-400 font-medium placeholder:text-zinc-800 text-sm min-h-[140px] resize-none leading-relaxed"
                  placeholder="DETAILS_BLOB..."
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[1px] bg-cyber-purple group-focus-within/field:w-[90%] transition-all duration-700 shadow-[0_0_10px_#bc13fe]"></div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3 group/field">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-4 block">أولوية المعالجة</label>
                <div className="relative">
                  <select 
                    value={priority}
                    onChange={e => setPriority(e.target.value as TaskPriority)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-[11px] font-black outline-none focus:border-cyber-blue/40 transition-all appearance-none text-white cursor-pointer"
                  >
                    {Object.keys(TaskPriority).map(p => (
                      <option key={p} value={p} className="bg-zinc-950">{PRIORITY_LABELS[p].label}</option>
                    ))}
                  </select>
                  <Icons.Chevron className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 pointer-events-none w-4 h-4" />
                </div>
              </div>

              <div className="space-y-3 group/field">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-4 block">القطاع المستهدف</label>
                <div className="relative">
                  <select 
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-[11px] font-black outline-none focus:border-cyber-blue/40 transition-all appearance-none text-white cursor-pointer"
                  >
                    {categories.map(c => <option key={c.id} value={c.name} className="bg-zinc-950">{c.name}</option>)}
                  </select>
                  <Icons.Chevron className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-700 pointer-events-none w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Execution Footer */}
            <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-5 bg-black/60 px-8 py-4 rounded-2xl border border-white/5 group/date hover:border-cyber-purple/30 transition-all">
                <Icons.Calendar className="text-cyber-purple w-5 h-5 drop-shadow-[0_0_8px_#bc13fe]" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Target_Date</span>
                  <input 
                    type="date"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                    className="bg-transparent text-xs outline-none font-black text-white [color-scheme:dark] cursor-pointer"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full md:w-auto min-w-[220px] h-16 group/btn relative overflow-hidden rounded-2xl transition-all duration-700 active:scale-95 shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-blue bg-[length:200%_auto] animate-shimmer opacity-90 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                
                <div className="relative h-full px-10 flex items-center justify-center gap-4">
                  <span className="text-[11px] font-black text-white uppercase tracking-[0.6em] group-hover:tracking-[0.8em] transition-all duration-500">
                    {initialTask ? 'تحديث النواة' : 'تنفيذ المهمة'}
                  </span>
                  <Icons.Sparkles className="text-white w-4 h-4 group-hover:rotate-12 transition-transform" />
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.2;
          cursor: pointer;
        }
        input[type="date"]::-webkit-calendar-picker-indicator:hover {
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
};

export default TaskForm;
