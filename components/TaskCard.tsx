
import React, { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { Icons, PRIORITY_LABELS, CategoryIconMap } from '../constants';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onTogglePin: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete, onEdit, onStatusChange, onTogglePin, onToggleFavorite, index }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDates, setShowDates] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const [animatePin, setAnimatePin] = useState(false);
  const [animateFav, setAnimateFav] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const isCompleted = task.status === TaskStatus.COMPLETED;

  useEffect(() => {
    if (task.isPinned) {
      setAnimatePin(true);
      const timer = setTimeout(() => setAnimatePin(false), 400);
      return () => clearTimeout(timer);
    }
  }, [task.isPinned]);

  useEffect(() => {
    if (task.isFavorite) {
      setAnimateFav(true);
      const timer = setTimeout(() => setAnimateFav(false), 400);
      return () => clearTimeout(timer);
    }
  }, [task.isFavorite]);

  const priorityMeta = PRIORITY_LABELS[task.priority] || PRIORITY_LABELS[TaskPriority.MEDIUM];

  const handleStatusToggle = () => {
    const newStatus = isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    if (newStatus === TaskStatus.COMPLETED) {
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1500);
    }
    onStatusChange(task.id, newStatus);
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('ar-EG', { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return dateStr;
    }
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '---';
    try {
      return new Date(dateStr).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${task.title}\n${task.description}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative p-1 rounded-[48px] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${isCompleted ? 'grayscale-[0.5] opacity-80' : 'hover:scale-[1.03]'}
      `}
    >
      {/* Dynamic Background Gradient Border */}
      <div className={`absolute inset-0 rounded-[48px] bg-gradient-to-br transition-opacity duration-700 
        ${isHovered ? 'opacity-100' : 'opacity-0'}
        ${isCompleted ? 'from-slate-200 to-slate-300' : 'from-blue-500/20 via-indigo-500/20 to-emerald-500/20'}
      `}></div>

      {/* Main Card Body */}
      <div className={`relative p-8 rounded-[46px] h-full flex flex-col gap-6 overflow-hidden border border-white/60 backdrop-blur-xl transition-all duration-700
        ${isCompleted ? 'bg-slate-50/90' : 'bg-gradient-to-br from-white to-slate-50/50 shadow-[0_15px_45px_-10px_rgba(0,0,0,0.05)]'}
        group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)]
      `}>
        
        {/* Parallax Background Decorations */}
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-3xl transition-transform duration-1000 ease-out
          ${isHovered ? 'translate-x-12 -translate-y-12 scale-150' : 'translate-x-0 translate-y-0 scale-100'}
        `}></div>
        <div className={`absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-2xl transition-transform duration-1000 ease-out
          ${isHovered ? '-translate-x-12 translate-y-12 scale-150' : 'translate-x-0 translate-y-0 scale-100'}
        `}></div>

        {/* Floating Creation Date Tooltip */}
        <div className={`absolute top-4 left-1/2 -translate-x-1/2 transition-all duration-500 pointer-events-none z-30
          ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <div className="bg-slate-900/90 text-[10px] font-bold text-white px-4 py-1.5 rounded-full shadow-2xl backdrop-blur-md border border-white/10">
            سجل الإنشاء: {formatDateShort(task.createdAt)}
          </div>
        </div>

        {/* Completion Sparkles */}
        {showSparkles && (
          <div className="absolute inset-0 z-50 pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="absolute w-2 h-2 rounded-full animate-sparkle-pop"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  backgroundColor: ['#3b82f6', '#10b981', '#fbbf24'][Math.floor(Math.random() * 3)],
                  animationDelay: `${i * 0.05}s`
                }}
              />
            ))}
          </div>
        )}

        {/* Header Section */}
        <div className="flex items-start justify-between gap-4 z-10">
          <div className="flex items-start gap-4 flex-1">
            <button 
              onClick={handleStatusToggle}
              className={`shrink-0 w-11 h-11 rounded-[22px] flex items-center justify-center transition-all duration-500 active:scale-75 shadow-sm group/check
                ${isCompleted 
                  ? 'bg-emerald-500 text-white shadow-emerald-200' 
                  : 'bg-white border border-slate-100 text-slate-300 hover:text-blue-500 hover:border-blue-200 hover:shadow-md'
                }`}
            >
              {isCompleted ? <Icons.CheckCircle className="w-6 h-6 animate-state-pop" /> : <div className="w-4 h-4 rounded-full border-2 border-current opacity-40 group-hover/check:scale-125 transition-transform"></div>}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h3 className={`text-xl font-black transition-all duration-500 tracking-tight leading-tight relative inline-block
                  ${isCompleted ? 'text-slate-400' : 'text-slate-900 group-hover:text-blue-600'}
                `}>
                  {task.title}
                  <span className={`absolute top-1/2 left-0 h-[2px] bg-slate-400/50 rounded-full transition-all duration-700 ease-out
                    ${isCompleted ? 'w-full opacity-100' : 'w-0 opacity-0'}
                  `}></span>
                </h3>
                <div className="flex items-center gap-1.5">
                  {task.isPinned && (
                    <span className={`transition-all duration-500 ${animatePin ? 'animate-state-pop' : ''}`}>
                      <Icons.Pin className="w-4 h-4 text-amber-500 drop-shadow-sm rotate-45" filled={true} />
                    </span>
                  )}
                  {task.isFavorite && (
                    <span className={`transition-all duration-500 ${animateFav ? 'animate-state-pop' : ''}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-rose-500 drop-shadow-sm"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                    </span>
                  )}
                </div>
              </div>
              <p className={`text-[14px] font-medium leading-relaxed line-clamp-2 transition-all duration-500
                ${isCompleted ? 'text-slate-400 italic opacity-60' : 'text-slate-500'}
              `}>
                {task.description || "لا توجد تفاصيل إضافية لهذه العملية"}
              </p>
            </div>
          </div>
          
          <div className={`shrink-0 px-3.5 py-1.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all duration-500
            ${isCompleted ? 'bg-slate-100 text-slate-400 border-slate-200' : priorityMeta.color}`}>
            {priorityMeta.label}
          </div>
        </div>

        {/* Badges Section */}
        <div className="flex flex-wrap items-center gap-2.5 z-10">
          <div className={`flex items-center gap-2.5 px-4 py-2 rounded-[20px] transition-all duration-500 border
            ${isCompleted ? 'bg-slate-100 border-slate-200' : 'bg-white border-slate-100 shadow-sm group-hover:border-blue-100 group-hover:bg-blue-50/30'}
          `}>
             <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:rotate-[10deg] transition-transform duration-500" style={{ backgroundColor: isCompleted ? '#94a3b8' : task.color }}>
               <div className="w-4 h-4">{task.icon && CategoryIconMap[task.icon] ? CategoryIconMap[task.icon] : CategoryIconMap['star']}</div>
             </div>
             <span className={`text-[12px] font-black ${isCompleted ? 'text-slate-400' : 'text-slate-700'}`}>{task.category}</span>
          </div>
          
          {task.dueDate && (
            <div className={`px-4 py-2 rounded-[20px] flex items-center gap-2 text-[12px] font-bold border transition-all duration-500
              ${isCompleted ? 'bg-slate-100 border-slate-200 text-slate-400' : 'bg-white border-slate-100 text-slate-500 shadow-sm hover:border-slate-300'}
            `}>
               <Icons.Calendar className="w-4 h-4 opacity-40" />
               <span>{new Date(task.dueDate).toLocaleDateString('ar-EG')}</span>
            </div>
          )}

          {task.reminderAt && !isCompleted && (
            <div className="px-4 py-2 rounded-[20px] bg-blue-50 border border-blue-100 text-blue-600 text-[12px] font-black flex items-center gap-2 shadow-sm animate-gentle-pulse">
               <Icons.AlarmClock className="w-4 h-4" />
               <span className="truncate max-w-[100px]">{formatDateTime(task.reminderAt)}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-6 border-t border-slate-100/60 z-10">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setShowDates(!showDates)}
              className="text-[10px] font-black text-slate-400 hover:text-blue-600 flex items-center gap-2 transition-all group/btn"
            >
              <Icons.Eye className={`w-4 h-4 transition-transform duration-700 ${showDates ? 'rotate-180 text-blue-500' : 'group-hover/btn:scale-125 group-hover/btn:rotate-12'}`} />
              <span>{showDates ? 'إغفاء السجل' : 'عرض السجل'}</span>
            </button>

            <div className={`flex items-center gap-1 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}>
              {[
                { 
                  id: 'fav',
                  icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={task.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>, 
                  title: "المفضلة", 
                  active: task.isFavorite, 
                  action: () => onToggleFavorite?.(task.id), 
                  color: 'text-rose-500 bg-rose-50 hover:bg-rose-100' 
                },
                { 
                  id: 'pin',
                  icon: <Icons.Pin className="w-5 h-5" filled={task.isPinned} />, 
                  title: "تثبيت", 
                  active: task.isPinned, 
                  action: () => onTogglePin(task.id), 
                  color: 'text-amber-500 bg-amber-50 hover:bg-amber-100' 
                },
                { 
                  id: 'copy',
                  icon: copySuccess ? <Icons.CheckCircle className="w-5 h-5" /> : <Icons.Copy className="w-5 h-5" />, 
                  title: "نسخ", 
                  active: copySuccess, 
                  action: handleCopy, 
                  color: copySuccess ? 'text-emerald-500 bg-emerald-50' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50' 
                },
                { 
                  id: 'edit',
                  icon: <Icons.Edit className="w-5 h-5" />, 
                  title: "تعديل", 
                  action: () => onEdit(task), 
                  color: 'text-slate-400 hover:text-blue-500 hover:bg-blue-50' 
                },
                { 
                  id: 'delete',
                  icon: <Icons.Trash className="w-5 h-5" />, 
                  title: "حذف", 
                  action: () => setIsDeleting(true), 
                  color: 'text-slate-400 hover:text-rose-500 hover:bg-rose-50' 
                }
              ].map((btn) => (
                <button 
                  key={btn.id}
                  onClick={btn.action}
                  className={`p-2.5 rounded-[18px] transition-all duration-300 flex items-center justify-center relative group/ctrl
                    ${btn.active ? btn.color + ' shadow-md scale-110' : 'text-slate-400 hover:shadow-xl active:scale-90 hover:scale-125 ' + btn.color.split(' ').slice(1).join(' ')}
                  `}
                  title={btn.title}
                >
                  <div className={`transition-all duration-300 ${btn.active ? 'animate-state-pop' : 'group-hover/ctrl:scale-110'}`}>{btn.icon}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Expandable Meta Info */}
          <div className={`grid grid-cols-2 gap-3 transition-all duration-700 overflow-hidden 
            ${showDates ? 'max-h-32 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}
          `}>
             <div className="bg-white/40 p-3 rounded-2xl border border-white/60 shadow-inner group/info">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right group-hover/info:text-blue-500 transition-colors">تاريخ البداية</p>
                <p className="text-[11px] font-bold text-slate-700 text-right">{formatDateShort(task.createdAt)}</p>
             </div>
             <div className="bg-white/40 p-3 rounded-2xl border border-white/60 shadow-inner group/info">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-right group-hover/info:text-blue-500 transition-colors">آخر تحديث</p>
                <p className="text-[11px] font-bold text-slate-700 text-right">{formatDateShort(task.updatedAt)}</p>
             </div>
          </div>
        </div>
      </div>

      {/* Modern Deletion Overlay */}
      {isDeleting && (
        <div className="absolute inset-0 z-[60] bg-white/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center rounded-[46px] animate-in fade-in zoom-in-95 duration-500">
           <div className="w-20 h-20 bg-rose-50 rounded-[32px] flex items-center justify-center mb-6 text-rose-500 shadow-2xl shadow-rose-100 animate-bounce">
             <Icons.Trash className="w-10 h-10" />
           </div>
           <p className="text-xl font-black text-slate-900 mb-8 leading-relaxed">تأكيد حذف <br/>هذا السجل؟</p>
           <div className="flex gap-4 w-full">
             <button onClick={() => onDelete(task.id)} className="flex-[2] py-4 bg-rose-600 text-white rounded-[22px] text-sm font-black hover:bg-rose-700 shadow-xl shadow-rose-200 transition-all active:scale-95">حذف نهائي</button>
             <button onClick={() => setIsDeleting(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-[22px] text-sm font-black hover:bg-slate-200 transition-all active:scale-95">تراجع</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
