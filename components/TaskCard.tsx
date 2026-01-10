
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
  const [isHovered, setIsHovered] = useState(false);
  
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const priorityMeta = PRIORITY_LABELS[task.priority] || PRIORITY_LABELS[TaskPriority.MEDIUM];

  const handleStatusToggle = () => {
    onStatusChange(task.id, isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED);
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
      className={`group relative card-3d-effect rounded-[50px] p-[2px] transition-all duration-700
        ${isCompleted ? 'opacity-70 grayscale-[0.3]' : 'hover:z-50'}
      `}
    >
      {/* Dynamic Glow Border (Border Beam Effect) */}
      <div className={`absolute inset-0 rounded-[50px] transition-opacity duration-1000
        ${isHovered ? 'opacity-100' : 'opacity-0'}
        bg-gradient-to-br from-blue-500 via-indigo-400 to-emerald-400
      `}></div>

      {/* Background Reflection Shine */}
      <div className="absolute inset-0 overflow-hidden rounded-[50px] pointer-events-none">
        <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] animate-glass-shine"></div>
      </div>

      {/* Main Card Body */}
      <div className={`relative p-8 md:p-10 rounded-[48px] h-full flex flex-col gap-8 premium-glass overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.02)]
        ${isCompleted ? 'bg-slate-50/90' : 'bg-white/95'}
      `}>
        
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-4 z-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all
                ${isCompleted ? 'bg-slate-200 text-slate-500 border-slate-300' : priorityMeta.color + ' group-hover:scale-105'}
              `}>
                {priorityMeta.label}
              </span>
              {task.isPinned && (
                <div className="bg-amber-50 text-amber-500 p-1.5 rounded-full shadow-sm animate-pulse">
                  <Icons.Pin className="w-3.5 h-3.5" filled={true} />
                </div>
              )}
            </div>

            <h3 className={`text-2xl font-black transition-all duration-500 tracking-tighter leading-tight relative inline-block
              ${isCompleted ? 'text-slate-400' : 'text-slate-900 ' + (isHovered ? 'glowing-text scale-[1.01] origin-right' : '')}
            `}>
              {task.title}
              {isCompleted && <span className="absolute top-1/2 left-0 w-full h-[2px] bg-slate-400/50 rounded-full"></span>}
            </h3>
          </div>

          <button 
            onClick={handleStatusToggle}
            className={`shrink-0 w-16 h-16 rounded-[28px] flex items-center justify-center transition-all duration-500 active:scale-90 shadow-2xl
              ${isCompleted 
                ? 'bg-emerald-500 text-white shadow-emerald-200' 
                : 'bg-white border-2 border-slate-50 text-slate-300 hover:text-blue-600 hover:shadow-blue-200 hover:scale-110'
              }`}
          >
            {isCompleted ? <Icons.CheckCircle className="w-8 h-8" /> : <div className="w-6 h-6 rounded-full border-[3px] border-current opacity-20"></div>}
          </button>
        </div>

        {/* Task Description */}
        <div className="flex-1 z-10">
           <p className={`text-[14px] font-bold leading-relaxed line-clamp-3 transition-colors duration-500
              ${isCompleted ? 'text-slate-400' : 'text-slate-500 group-hover:text-slate-700'}
           `}>
             {task.description || "لا توجد تفاصيل إضافية مسجلة لهذه العملية."}
           </p>
        </div>

        {/* Info Pills Section */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          <div className={`flex items-center gap-3 px-5 py-2.5 rounded-[22px] bg-white shadow-sm border border-slate-50 transition-all group/pill
            ${isHovered ? 'scale-105 translate-x-1' : ''}
          `}>
             <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover/pill:rotate-12"
               style={{ backgroundColor: isCompleted ? '#94a3b8' : task.color }}>
               <div className="w-4.5 h-4.5">{task.icon && CategoryIconMap[task.icon] ? CategoryIconMap[task.icon] : CategoryIconMap['star']}</div>
             </div>
             <span className="text-[12px] font-black text-slate-800">{task.category}</span>
          </div>

          {task.dueDate && (
            <div className="px-5 py-2.5 rounded-[22px] bg-white border border-slate-50 shadow-sm flex items-center gap-3 text-[11px] font-black text-slate-500">
               <Icons.Calendar className="w-4 h-4 text-blue-500" />
               <span>{new Date(task.dueDate).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}</span>
            </div>
          )}

          {task.reminderAt && !isCompleted && (
            <div className="px-5 py-2.5 rounded-[22px] bg-blue-600 text-white shadow-lg shadow-blue-200 flex items-center gap-3 text-[10px] font-black animate-gentle-pulse">
               <Icons.AlarmClock className="w-4 h-4" />
               <span>{new Date(task.reminderAt).toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</span>
            </div>
          )}
        </div>

        {/* Bottom Floating Control Bar */}
        <div className={`mt-auto transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]
          ${isHovered ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-90 pointer-events-none'}
        `}>
           <div className="bg-white/50 backdrop-blur-xl border border-white/80 p-3 rounded-[32px] flex items-center justify-between shadow-2xl">
              <button 
                onClick={() => setShowDates(!showDates)}
                className="px-6 py-2.5 text-[10px] font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest flex items-center gap-2"
              >
                <Icons.Eye className={`w-4 h-4 transition-transform duration-500 ${showDates ? 'rotate-180' : ''}`} />
                <span>السجل</span>
              </button>

              <div className="flex items-center gap-1.5 px-2">
                 {[
                   { id: 'fav', icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={task.isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>, action: () => onToggleFavorite?.(task.id), color: 'text-rose-500 hover:bg-rose-50' },
                   { id: 'pin', icon: <Icons.Pin className="w-4.5 h-4.5" filled={task.isPinned} />, action: () => onTogglePin(task.id), color: 'text-amber-500 hover:bg-amber-50' },
                   { id: 'edit', icon: <Icons.Edit className="w-4.5 h-4.5" />, action: () => onEdit(task), color: 'text-blue-500 hover:bg-blue-50' },
                   { id: 'delete', icon: <Icons.Trash className="w-4.5 h-4.5" />, action: () => setIsDeleting(true), color: 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' }
                 ].map((btn) => (
                   <button 
                    key={btn.id}
                    onClick={btn.action}
                    className={`w-11 h-11 rounded-[20px] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 ${btn.color}`}
                   >
                     {btn.icon}
                   </button>
                 ))}
              </div>
           </div>
        </div>

        {/* Expandable Meta */}
        <div className={`overflow-hidden transition-all duration-700 ${showDates ? 'max-h-24 mt-6' : 'max-h-0'}`}>
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50/80 p-4 rounded-[24px] border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">تاريخ الإنشاء</p>
                <p className="text-xs font-black text-slate-700">{new Date(task.createdAt).toLocaleDateString('ar-EG')}</p>
              </div>
              <div className="bg-slate-50/80 p-4 rounded-[24px] border border-slate-100">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">آخر تحديث</p>
                <p className="text-xs font-black text-slate-700">{new Date(task.updatedAt).toLocaleDateString('ar-EG')}</p>
              </div>
           </div>
        </div>
      </div>

      {/* Delete Confirmation Overlay */}
      {isDeleting && (
        <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-2xl flex flex-col items-center justify-center p-10 text-center rounded-[48px] animate-in zoom-in-95 duration-500">
           <div className="w-20 h-20 bg-rose-50 rounded-[32px] flex items-center justify-center mb-8 text-rose-500 shadow-2xl animate-bounce">
             <Icons.Trash className="w-10 h-10" />
           </div>
           <h4 className="text-xl font-black text-slate-900 mb-2">تأكيد الحذف النهائي؟</h4>
           <p className="text-slate-500 font-bold mb-10 text-xs">سيتم مسح البيانات بشكل دائم من النظام.</p>
           <div className="flex flex-col gap-3 w-full max-w-[180px]">
             <button onClick={() => onDelete(task.id)} className="w-full py-4 bg-rose-600 text-white rounded-[22px] text-xs font-black hover:bg-rose-700 shadow-xl transition-all active:scale-95">حذف السجل</button>
             <button onClick={() => setIsDeleting(false)} className="w-full py-4 bg-slate-100 text-slate-600 rounded-[22px] text-xs font-black hover:bg-slate-200 transition-all active:scale-95">تراجع</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
