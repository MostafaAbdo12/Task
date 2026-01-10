
import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../types';
import { Icons, PRIORITY_LABELS, CategoryIconMap } from '../constants';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onTogglePin: (id: string) => void;
  index: number;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete, onEdit, onStatusChange, onTogglePin, index }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDates, setShowDates] = useState(false);
  const isCompleted = task.status === TaskStatus.COMPLETED;

  const priorityColors = {
    [TaskPriority.LOW]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    [TaskPriority.MEDIUM]: 'bg-blue-50 text-blue-600 border-blue-100',
    [TaskPriority.HIGH]: 'bg-amber-50 text-amber-600 border-amber-100',
    [TaskPriority.URGENT]: 'bg-rose-50 text-rose-600 border-rose-100',
  }[task.priority];

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

  return (
    <div 
      className={`group relative p-7 rounded-[40px] transition-all duration-500 ease-out border border-slate-100
        bg-gradient-to-br from-white to-slate-50/50 hover:to-white
        hover:-translate-y-3 hover:shadow-[0_30px_60px_-15px_rgba(37,99,235,0.1)]
        overflow-hidden
        ${isCompleted ? 'opacity-75 grayscale-[0.2]' : 'shadow-sm'}
      `}
    >
      {/* Parallax Background Blobs */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/5 rounded-full blur-3xl group-hover:translate-x-4 group-hover:-translate-y-4 transition-transform duration-700"></div>
      <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-indigo-400/5 rounded-full blur-2xl group-hover:-translate-x-4 group-hover:translate-y-4 transition-transform duration-1000"></div>

      {/* Dynamic Glow Effect */}
      <div className="absolute inset-0 rounded-[40px] bg-gradient-to-br from-blue-500/0 via-transparent to-blue-500/0 group-hover:from-blue-500/[0.04] group-hover:to-indigo-500/[0.04] transition-all duration-700 pointer-events-none"></div>

      <div className="relative z-10 flex flex-col gap-6">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
             <button 
              onClick={() => onStatusChange(task.id, isCompleted ? TaskStatus.PENDING : TaskStatus.COMPLETED)}
              className={`shrink-0 w-8 h-8 rounded-2xl border-2 flex items-center justify-center transition-all duration-500 transform active:scale-90
                ${isCompleted ? 'bg-blue-600 border-blue-600 shadow-[0_5px_15px_rgba(37,99,235,0.4)]' : 'bg-white border-slate-200 hover:border-blue-400'}`}
            >
              <div className={`transition-all duration-500 ${isCompleted ? 'scale-100 opacity-100 rotate-0' : 'scale-0 opacity-0 -rotate-45'}`}>
                <Icons.CheckCircle className="w-4 h-4 text-white" />
              </div>
            </button>
            
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className={`text-xl font-black text-slate-900 transition-all duration-500 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                  {task.title}
                </h3>
                {task.isPinned && (
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-[10px] font-black flex items-center gap-1 border border-blue-100 animate-gentle-pulse">
                    <Icons.Pin className="w-3 h-3 rotate-45" filled={true} />
                    <span>مثبت</span>
                  </span>
                )}
              </div>
              <p className={`text-[14px] font-medium leading-relaxed transition-colors duration-500 ${isCompleted ? 'text-slate-400' : 'text-slate-500'}`}>
                {task.description || "لا يوجد وصف لهذه المهمة."}
              </p>
            </div>
          </div>

          <div className={`shrink-0 px-4 py-1.5 rounded-2xl text-[10px] font-black border transition-all duration-500 uppercase tracking-widest ${priorityColors}`}>
            {PRIORITY_LABELS[task.priority]?.label}
          </div>
        </div>

        {/* Content Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all group-hover:scale-105 group-hover:shadow-md group-hover:border-blue-200 duration-300">
             <div className="text-white p-1 rounded-lg transition-transform group-hover:rotate-12 duration-300" style={{ backgroundColor: task.color }}>
               {task.icon && CategoryIconMap[task.icon] ? CategoryIconMap[task.icon] : CategoryIconMap['star']}
             </div>
             <span className="text-[12px] font-black text-slate-700">{task.category}</span>
          </div>
          
          {task.dueDate && (
            <div className="px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100 text-[12px] font-bold text-slate-500 flex items-center gap-2">
               <Icons.Calendar className="w-4 h-4 opacity-60" />
               <span>{new Date(task.dueDate).toLocaleDateString('ar-EG')}</span>
            </div>
          )}
          
          {task.reminderAt && !isCompleted ? (
            <div className="px-4 py-2 rounded-2xl bg-blue-50 border border-blue-100 text-[12px] font-black text-blue-600 flex items-center gap-2 animate-gentle-pulse shadow-sm">
               <Icons.AlarmClock className="w-4 h-4" />
               <span>{formatDateTime(task.reminderAt)}</span>
            </div>
          ) : !isCompleted && (
            <button 
              onClick={() => onEdit(task)}
              className="px-4 py-2 rounded-2xl bg-white border border-dashed border-slate-200 text-[11px] font-black text-slate-400 flex items-center gap-2 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
              title="ضبط تذكير"
            >
               <Icons.AlarmClock className="w-4 h-4" />
               <span>ضبط تنبيه</span>
            </button>
          )}
        </div>

        {/* Footer Area with Dates */}
        <div className="flex flex-col gap-4 pt-6 border-t border-slate-100">
           <div className="flex items-center justify-between">
              <button 
                onClick={() => setShowDates(!showDates)}
                className="text-[10px] font-black text-slate-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
              >
                <Icons.Eye className={`w-3.5 h-3.5 transition-transform ${showDates ? 'rotate-180' : ''}`} />
                <span>{showDates ? 'إخفاء السجل' : 'عرض السجل'}</span>
              </button>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                 <button 
                  onClick={() => onTogglePin(task.id)} 
                  className={`p-2.5 rounded-2xl transition-all duration-300 ${task.isPinned ? 'text-blue-600 bg-blue-50 shadow-sm ring-1 ring-blue-100' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:shadow-[0_0_15px_rgba(37,99,235,0.2)]'}`} 
                  title="تثبيت"
                 >
                   <Icons.Pin className="w-4.5 h-4.5" filled={task.isPinned} />
                 </button>

                 <button 
                  onClick={() => onEdit(task)} 
                  className="p-2.5 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:shadow-[0_0_15px_rgba(37,99,235,0.2)] transition-all duration-300" 
                  title="تعديل"
                 >
                   <Icons.Edit className="w-4.5 h-4.5" />
                 </button>

                 <button 
                  onClick={() => setIsDeleting(true)} 
                  className="p-2.5 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all duration-300" 
                  title="حذف"
                 >
                   <Icons.Trash className="w-4.5 h-4.5" />
                 </button>
              </div>
           </div>

           {showDates && (
             <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">تاريخ الإنشاء</p>
                   <p className="text-[11px] font-bold text-slate-600">{formatDateShort(task.createdAt)}</p>
                </div>
                <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">آخر تحديث</p>
                   <p className="text-[11px] font-bold text-slate-600">{formatDateShort(task.updatedAt)}</p>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* Delete Confirmation Overlay */}
      {isDeleting && (
        <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-[40px] animate-in fade-in duration-300">
           <div className="w-14 h-14 bg-rose-50 rounded-3xl flex items-center justify-center mb-5 text-rose-500 shadow-sm animate-bounce">
             <Icons.Trash className="w-7 h-7" />
           </div>
           <p className="text-base font-black text-slate-900 mb-6">هل أنت متأكد من الحذف؟</p>
           <div className="flex gap-3 w-full max-w-[240px]">
             <button onClick={() => onDelete(task.id)} className="flex-[2] py-4 bg-rose-600 text-white rounded-2xl text-[13px] font-black hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all active:scale-95">حذف</button>
             <button onClick={() => setIsDeleting(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl text-[13px] font-black hover:bg-slate-200 transition-all active:scale-95">رجوع</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
