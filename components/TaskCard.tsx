
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
  const [animatePin, setAnimatePin] = useState(false);
  const [animateFav, setAnimateFav] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const isCompleted = task.status === TaskStatus.COMPLETED;

  useEffect(() => {
    if (task.isPinned) {
      setAnimatePin(true);
      const timer = setTimeout(() => setAnimatePin(false), 600);
      return () => clearTimeout(timer);
    }
  }, [task.isPinned]);

  useEffect(() => {
    if (task.isFavorite) {
      setAnimateFav(true);
      const timer = setTimeout(() => setAnimateFav(false), 600);
      return () => clearTimeout(timer);
    }
  }, [task.isFavorite]);

  const priorityMeta = PRIORITY_LABELS[task.priority] || PRIORITY_LABELS[TaskPriority.MEDIUM];

  const handleStatusToggle = () => {
    const newStatus = isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED;
    onStatusChange(task.id, newStatus);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${task.title}\n${task.description}`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return '---';
    try {
      return new Date(dateStr).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative p-0.5 rounded-[54px] transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${isCompleted ? 'grayscale-[0.5] opacity-80 scale-95' : 'hover:scale-[1.03]'}
      `}
    >
      {/* High-End Glassmorphism Background Layer */}
      <div className={`absolute inset-0 rounded-[54px] bg-gradient-to-br transition-opacity duration-1000 
        ${isHovered ? 'opacity-100' : 'opacity-20'}
        ${isCompleted ? 'from-slate-200 to-slate-400' : 'from-blue-600/30 via-indigo-600/20 to-emerald-500/30'}
      `}></div>

      {/* Main Card Content */}
      <div className={`relative p-10 rounded-[52px] h-full flex flex-col gap-8 overflow-hidden border border-white/80 backdrop-blur-3xl transition-all duration-700
        ${isCompleted ? 'bg-white/90' : 'bg-gradient-to-br from-white/95 to-slate-50/90 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.06)]'}
        group-hover:shadow-[0_50px_140px_-30px_rgba(37,99,235,0.18)]
      `}>
        
        {/* Animated Background Blobs (Luxury Parallax) */}
        <div className={`absolute -top-16 -right-16 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] transition-all duration-1000 pointer-events-none
          ${isHovered ? 'translate-x-12 -translate-y-12 scale-150 rotate-90 opacity-80' : 'opacity-20'}
        `}></div>
        <div className={`absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-[70px] transition-all duration-1000 pointer-events-none
          ${isHovered ? '-translate-x-12 translate-y-12 scale-150 -rotate-90 opacity-80' : 'opacity-20'}
        `}></div>

        {/* Header: Title & Priority Badge */}
        <div className="flex items-start justify-between gap-6 z-10">
          <div className="flex-1 min-w-0">
             <div className="flex items-center gap-2 mb-4">
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all duration-500
                  ${isCompleted ? 'bg-slate-100 text-slate-400 border-slate-200' : priorityMeta.color + ' group-hover:scale-105'}`}>
                  {priorityMeta.label}
                </div>
                {task.isPinned && (
                  <Icons.Pin className="w-3.5 h-3.5 text-amber-500 animate-pulse" filled={true} />
                )}
             </div>
             
             <h3 className={`text-2xl font-black transition-all duration-500 tracking-tighter leading-tight relative inline-block mb-3
                ${isCompleted ? 'text-slate-400' : 'text-slate-900 ' + (isHovered ? 'glowing-text scale-[1.02] origin-right' : '')}
             `}>
                {task.title}
                {isCompleted && <span className="absolute top-1/2 left-0 w-full h-[3px] bg-slate-400/40 rounded-full animate-strike-draw"></span>}
             </h3>

             <div className={`max-h-24 overflow-y-auto pr-2 transition-all duration-500 custom-mini-scrollbar
                ${isCompleted ? 'text-slate-400 italic opacity-60' : 'text-slate-500 group-hover:text-slate-800'}
             `}>
                <p className="text-[14px] font-bold leading-relaxed opacity-80">
                  {task.description || "لا توجد تفاصيل إضافية مسجلة لهذه العملية الذكية."}
                </p>
             </div>
          </div>

          <button 
            onClick={handleStatusToggle}
            className={`shrink-0 w-16 h-16 rounded-[28px] flex items-center justify-center transition-all duration-700 active:scale-75 shadow-lg group/check
              ${isCompleted 
                ? 'bg-emerald-500 text-white shadow-emerald-200 rotate-[360deg]' 
                : 'bg-white border-2 border-slate-100 text-slate-300 hover:text-blue-600 hover:border-blue-300 hover:shadow-blue-500/10 hover:scale-110'
              }`}
          >
            {isCompleted ? <Icons.CheckCircle className="w-8 h-8 animate-state-pop" /> : <div className="w-6 h-6 rounded-full border-[3px] border-current opacity-20 group-hover/check:opacity-100 transition-all"></div>}
          </button>
        </div>

        {/* Information Badges Section */}
        <div className="flex flex-wrap items-center gap-4 z-10 mt-2">
           {/* Category Badge */}
           <div className={`flex items-center gap-4 px-6 py-3 rounded-[26px] transition-all duration-500 border
              ${isCompleted ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100 shadow-sm group-hover:border-blue-100 group-hover:bg-blue-50/40'}
           `}>
              <div 
                className="w-10 h-10 rounded-[18px] flex items-center justify-center text-white shadow-xl transition-all duration-700 group-hover:rotate-[12deg] group-hover:scale-110" 
                style={{ 
                  backgroundColor: isCompleted ? '#cbd5e1' : task.color,
                  boxShadow: isHovered ? `0 12px 25px -5px ${task.color}55` : 'none'
                }}
              >
                <div className="w-5 h-5 drop-shadow-md">{task.icon && CategoryIconMap[task.icon] ? CategoryIconMap[task.icon] : CategoryIconMap['star']}</div>
              </div>
              <span className={`text-[13px] font-black tracking-tight ${isCompleted ? 'text-slate-400' : 'text-slate-800'}`}>{task.category}</span>
           </div>

           {/* Date Badge */}
           {task.dueDate && (
             <div className={`px-6 py-3 rounded-[26px] flex items-center gap-3 text-[12px] font-black border transition-all duration-500
                ${isCompleted ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-slate-100 text-slate-600 shadow-sm hover:border-slate-300'}
             `}>
                <Icons.Calendar className="w-4.5 h-4.5 opacity-40" />
                <span>{new Date(task.dueDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long' })}</span>
             </div>
           )}

           {/* Reminder Badge */}
           {task.reminderAt && !isCompleted && (
             <div className="px-6 py-3 rounded-[26px] bg-blue-600 text-white text-[11px] font-black flex items-center gap-3 shadow-2xl shadow-blue-500/20 animate-gentle-pulse">
                <Icons.AlarmClock className="w-4.5 h-4.5" />
                <span>{new Date(task.reminderAt).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span>
             </div>
           )}
        </div>

        {/* Footer Actions (Floating Glass Bar) */}
        <div className="mt-auto pt-8 border-t border-slate-100/50 z-10 flex items-center justify-between">
           <button 
              onClick={() => setShowDates(!showDates)}
              className="px-5 py-2.5 bg-slate-50 text-[10px] font-black text-slate-500 hover:text-blue-600 hover:bg-white rounded-full transition-all group/btn uppercase tracking-widest border border-transparent hover:border-blue-100"
            >
              <span className="flex items-center gap-2">
                 <Icons.Eye className={`w-4 h-4 transition-all duration-700 ${showDates ? 'rotate-180 text-blue-500' : 'group-hover/btn:scale-110'}`} />
                 {showDates ? 'طي السجلات' : 'عرض السجلات'}
              </span>
           </button>

           <div className={`flex items-center gap-2 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
            `}>
              {[
                { 
                  id: 'fav',
                  icon: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={task.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>, 
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
                  id: 'edit',
                  icon: <Icons.Edit className="w-5 h-5" />, 
                  title: "تعديل", 
                  action: () => onEdit(task), 
                  color: 'text-slate-500 bg-slate-50 hover:bg-blue-50 hover:text-blue-600' 
                },
                { 
                  id: 'delete',
                  icon: <Icons.Trash className="w-5 h-5" />, 
                  title: "حذف", 
                  action: () => setIsDeleting(true), 
                  color: 'text-slate-500 bg-slate-50 hover:bg-rose-50 hover:text-rose-600' 
                }
              ].map((btn) => (
                <button 
                  key={btn.id}
                  onClick={btn.action}
                  className={`w-12 h-12 rounded-2xl transition-all duration-300 flex items-center justify-center relative border border-transparent shadow-sm
                    ${btn.active ? btn.color + ' border-current/20 shadow-lg scale-110' : 'text-slate-400 ' + btn.color.split(' ').slice(1).join(' ') + ' hover:scale-110 active:scale-90'}
                  `}
                  title={btn.title}
                >
                  <div className={`transition-all duration-500 ${btn.active ? 'animate-state-pop' : ''}`}>{btn.icon}</div>
                </button>
              ))}
            </div>
        </div>

        {/* Expandable History Logs */}
        <div className={`grid grid-cols-2 gap-4 transition-all duration-1000 cubic-bezier(0.23,1,0.32,1) overflow-hidden 
          ${showDates ? 'max-h-40 opacity-100 mt-6' : 'max-h-0 opacity-0 mt-0'}
        `}>
           <div className="bg-slate-50/50 p-5 rounded-[28px] border border-slate-100 transition-all hover:bg-white hover:shadow-lg">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-right">سجل الإنشاء</p>
              <p className="text-[12px] font-black text-slate-800 text-right">{formatDateShort(task.createdAt)}</p>
           </div>
           <div className="bg-slate-50/50 p-5 rounded-[28px] border border-slate-100 transition-all hover:bg-white hover:shadow-lg">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-right">آخر تحديث</p>
              <p className="text-[12px] font-black text-slate-800 text-right">{formatDateShort(task.updatedAt)}</p>
           </div>
        </div>
      </div>

      {/* Deletion Overlay Layer */}
      {isDeleting && (
        <div className="absolute inset-0 z-[60] bg-white/95 backdrop-blur-3xl flex flex-col items-center justify-center p-12 text-center rounded-[52px] animate-in fade-in zoom-in-95 duration-700">
           <div className="w-24 h-24 bg-rose-50 rounded-[40px] flex items-center justify-center mb-10 text-rose-500 shadow-2xl shadow-rose-500/10 animate-bounce">
             <Icons.Trash className="w-12 h-12" />
           </div>
           <h4 className="text-2xl font-black text-slate-900 mb-3 tracking-tighter">هل أنت متأكد من الحذف؟</h4>
           <p className="text-slate-500 font-bold mb-12 text-sm leading-relaxed">سيتم مسح بيانات هذه المهمة بشكل نهائي من قاعدة بياناتك الشخصية.</p>
           <div className="flex flex-col gap-4 w-full max-w-[220px]">
             <button onClick={() => onDelete(task.id)} className="w-full py-5 bg-rose-600 text-white rounded-[26px] text-sm font-black hover:bg-rose-700 shadow-2xl shadow-rose-600/30 transition-all active:scale-95">تأكيد الحذف النهائي</button>
             <button onClick={() => setIsDeleting(false)} className="w-full py-5 bg-slate-100 text-slate-600 rounded-[26px] text-sm font-black hover:bg-slate-200 transition-all active:scale-95">تراجع الآن</button>
           </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-mini-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-mini-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(37, 99, 235, 0.1);
          border-radius: 20px;
        }
        .custom-mini-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(37, 99, 235, 0.3);
        }
      `}} />
    </div>
  );
};

export default TaskCard;
