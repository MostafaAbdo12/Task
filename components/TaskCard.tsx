
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
  const [copySuccess, setCopySuccess] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);
  const isCompleted = task.status === TaskStatus.COMPLETED;

  const priorityColors = {
    [TaskPriority.LOW]: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    [TaskPriority.MEDIUM]: 'bg-blue-50 text-blue-600 border-blue-100',
    [TaskPriority.HIGH]: 'bg-amber-50 text-amber-600 border-amber-100',
    [TaskPriority.URGENT]: 'bg-rose-50 text-rose-600 border-rose-100',
  }[task.priority];

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
    navigator.clipboard.writeText(task.title + (task.description ? `: ${task.description}` : ''));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div 
      className={`group relative p-8 rounded-[45px] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] border border-slate-100
        bg-white hover:bg-gradient-to-br hover:from-white hover:to-slate-50/80
        hover:scale-[1.03] hover:shadow-[0_45px_100px_-25px_rgba(0,0,0,0.12)]
        overflow-hidden
        ${isCompleted ? 'opacity-80 grayscale-[0.3]' : 'shadow-[0_15px_40px_-10px_rgba(0,0,0,0.05)]'}
      `}
    >
      {/* المؤشر العائم لتاريخ الإنشاء */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0 z-20">
        <div className="bg-slate-900/90 backdrop-blur text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-xl border border-white/20 whitespace-nowrap">
          أُنشئت: {formatDateShort(task.createdAt)}
        </div>
      </div>

      {/* تأثير الاحتفال (Sparkles/Confetti) عند الاكتمال */}
      {showSparkles && (
        <div className="absolute inset-0 z-50 pointer-events-none">
          {[...Array(24)].map((_, i) => (
            <div 
              key={i} 
              className="absolute w-2 h-2 rounded-full animate-sparkle-pop"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#3b82f6', '#10b981', '#fbbf24', '#f43f5e', '#8b5cf6'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 0.4}s`
              }}
            />
          ))}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] animate-ping" />
        </div>
      )}

      {/* تأثير الخلفية (Parallax Light Blobs) */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-400/5 rounded-full blur-3xl group-hover:translate-x-12 group-hover:-translate-y-12 transition-transform duration-1000"></div>
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/5 rounded-full blur-3xl group-hover:-translate-x-12 group-hover:translate-y-12 transition-transform duration-1000"></div>

      <div className="relative z-10 flex flex-col gap-6">
        {/* رأس البطاقة */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
             <button 
              onClick={handleStatusToggle}
              className={`shrink-0 w-10 h-10 rounded-[20px] border-2 flex items-center justify-center transition-all duration-500 transform active:scale-75
                ${isCompleted ? 'bg-emerald-600 border-emerald-600 shadow-[0_10px_25px_rgba(16,185,129,0.3)]' : 'bg-white border-slate-200 hover:border-blue-500 hover:shadow-lg hover:rotate-6'}`}
            >
              <div className={`transition-all duration-500 ${isCompleted ? 'scale-100 opacity-100' : 'scale-0 opacity-0 -rotate-90'}`}>
                <Icons.CheckCircle className="w-6 h-6 text-white" />
              </div>
            </button>
            
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className={`text-xl font-black transition-all duration-500 ${isCompleted ? 'line-through text-slate-400' : 'glowing-text'}`}>
                  {task.title}
                </h3>
                {task.isPinned && (
                  <span className="bg-amber-50 text-amber-600 px-2.5 py-1 rounded-xl text-[9px] font-black flex items-center gap-1.5 border border-amber-100 animate-gentle-pulse shadow-sm uppercase tracking-wider">
                    <Icons.Pin className="w-3 h-3 rotate-45" filled={true} />
                    <span>مثبت</span>
                  </span>
                )}
              </div>
              <p className={`text-[14px] font-medium leading-relaxed transition-colors duration-500 ${isCompleted ? 'text-slate-400 italic' : 'text-slate-500'}`}>
                {task.description || "لا توجد تفاصيل إضافية لهذه المهمة."}
              </p>
            </div>
          </div>

          <div className={`shrink-0 px-4 py-2 rounded-2xl text-[10px] font-black border transition-all duration-500 uppercase tracking-widest shadow-sm group-hover:translate-x-1 ${priorityColors}`}>
            {PRIORITY_LABELS[task.priority]?.label}
          </div>
        </div>

        {/* الأوسمة (Badges) */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm transition-all group-hover:bg-white group-hover:border-blue-200 duration-300">
             <div className="text-white p-1 rounded-lg shadow-lg group-hover:scale-110 transition-transform" style={{ backgroundColor: task.color }}>
               {task.icon && CategoryIconMap[task.icon] ? CategoryIconMap[task.icon] : CategoryIconMap['star']}
             </div>
             <span className="text-[12px] font-black text-slate-700">{task.category}</span>
          </div>
          
          {task.dueDate && (
            <div className="px-4 py-2 rounded-2xl bg-white border border-slate-100 text-[12px] font-bold text-slate-500 flex items-center gap-2 shadow-sm">
               <Icons.Calendar className="w-4 h-4 opacity-50" />
               <span>{new Date(task.dueDate).toLocaleDateString('ar-EG')}</span>
            </div>
          )}
          
          {task.reminderAt && !isCompleted && (
            <div className="px-4 py-2 rounded-2xl bg-blue-50 border border-blue-100 text-[12px] font-black text-blue-600 flex items-center gap-2 animate-gentle-pulse shadow-inner">
               <Icons.AlarmClock className="w-4 h-4" />
               <span>{formatDateTime(task.reminderAt)}</span>
            </div>
          )}
        </div>

        {/* منطقة التحكم (Action Area) */}
        <div className="flex flex-col gap-4 pt-6 border-t border-slate-50">
           <div className="flex items-center justify-between">
              <button 
                onClick={() => setShowDates(!showDates)}
                className="text-[10px] font-black text-slate-400 hover:text-blue-600 flex items-center gap-1.5 transition-all group/btn"
              >
                <Icons.Eye className={`w-4 h-4 transition-transform duration-500 ${showDates ? 'rotate-180 scale-125 text-blue-600' : 'group-hover/btn:scale-110'}`} />
                <span>{showDates ? 'إغفاء السجل' : 'عرض السجل'}</span>
              </button>

              <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-700 ease-out">
                 {/* زر ضبط التنبيه */}
                 <button 
                  onClick={() => onEdit(task)} 
                  className={`p-2.5 rounded-2xl transition-all duration-300 group/btn relative ${task.reminderAt ? 'text-blue-600 bg-blue-50 shadow-sm' : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:shadow-lg'}`}
                  title="ضبط تنبيه"
                 >
                   <Icons.AlarmClock className="w-5 h-5 transition-transform duration-300 group-hover/btn:scale-125 group-hover/btn:rotate-12" />
                 </button>

                 <button 
                  onClick={() => onTogglePin(task.id)} 
                  className={`p-2.5 rounded-2xl transition-all duration-300 group/btn ${task.isPinned ? 'text-amber-600 bg-amber-50 shadow-sm' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:shadow-lg'}`} 
                  title="تثبيت"
                 >
                   <Icons.Pin className={`w-5 h-5 transition-transform duration-300 group-hover/btn:scale-125 group-hover/btn:-rotate-12`} filled={task.isPinned} />
                 </button>

                 <button 
                  onClick={handleCopy} 
                  className={`p-2.5 rounded-2xl transition-all duration-300 group/btn ${copySuccess ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 hover:shadow-lg'}`} 
                  title="نسخ"
                 >
                   {copySuccess ? (
                     <Icons.CheckCircle className="w-5 h-5 animate-in zoom-in-50" />
                   ) : (
                     <Icons.Copy className="w-5 h-5 transition-transform duration-300 group-hover/btn:scale-125" />
                   )}
                 </button>

                 <button 
                  onClick={() => onEdit(task)} 
                  className="p-2.5 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 hover:shadow-lg transition-all duration-300 group/btn" 
                  title="تعديل"
                 >
                   <Icons.Edit className="w-5 h-5 transition-transform duration-300 group-hover/btn:scale-125 group-hover/btn:rotate-12" />
                 </button>

                 <button 
                  onClick={() => setIsDeleting(true)} 
                  className="p-2.5 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:shadow-lg transition-all duration-300 group/btn" 
                  title="حذف"
                 >
                   <Icons.Trash className="w-5 h-5 transition-transform duration-300 group-hover/btn:scale-125 group-hover/btn:-rotate-12" />
                 </button>
              </div>
           </div>

           {showDates && (
             <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-500 ease-out">
                <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 hover:border-slate-200 transition-colors shadow-inner">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 text-right">تاريخ الإنشاء</p>
                   <p className="text-[11px] font-bold text-slate-700 text-right">{formatDateShort(task.createdAt)}</p>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-3xl border border-slate-100 hover:border-slate-200 transition-colors shadow-inner">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 text-right">آخر تحديث</p>
                   <p className="text-[11px] font-bold text-slate-700 text-right">{formatDateShort(task.updatedAt)}</p>
                </div>
             </div>
           )}
        </div>
      </div>

      {/* واجهة تأكيد الحذف */}
      {isDeleting && (
        <div className="absolute inset-0 z-[60] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 text-center rounded-[45px] animate-in fade-in zoom-in-95 duration-300">
           <div className="w-20 h-20 bg-rose-50 rounded-[30px] flex items-center justify-center mb-6 text-rose-500 shadow-xl shadow-rose-100 animate-bounce">
             <Icons.Trash className="w-10 h-10" />
           </div>
           <p className="text-xl font-black text-slate-900 mb-8 leading-relaxed">هل تريد حذف هذه المهمة <br/>بشكل نهائي؟</p>
           <div className="flex gap-4 w-full max-w-[300px]">
             <button onClick={() => onDelete(task.id)} className="flex-[2] py-4.5 bg-rose-600 text-white rounded-[24px] text-sm font-black hover:bg-rose-700 shadow-2xl shadow-rose-200 transition-all active:scale-95">حذف السجل</button>
             <button onClick={() => setIsDeleting(false)} className="flex-1 py-4.5 bg-slate-100 text-slate-600 rounded-[24px] text-sm font-black hover:bg-slate-200 transition-all active:scale-95">إلغاء</button>
           </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
