
import React, { useState, useRef } from 'react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { PRIORITY_LABELS, Icons, CategoryIconMap } from '../constants';

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
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [statusAnimation, setStatusAnimation] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const reminderInputRef = useRef<HTMLInputElement>(null);

  const isCompleted = task.status === TaskStatus.COMPLETED;
  const subtasksCount = task.subTasks.length;
  const completedSubtasksCount = task.subTasks.filter(st => st.isCompleted).length;
  
  const progress = subtasksCount > 0 
    ? (completedSubtasksCount / subtasksCount) * 100
    : isCompleted ? 100 : 0;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleString('ar-EG', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatusAnimation(true);
    if (newStatus === TaskStatus.COMPLETED && task.status !== TaskStatus.COMPLETED) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    }
    onStatusChange(task.id, newStatus);
    setTimeout(() => setStatusAnimation(false), 800);
  };

  const handleReminderClick = () => {
    reminderInputRef.current?.showPicker?.();
    reminderInputRef.current?.focus();
  };

  const handleReminderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onEdit({ ...task, reminderAt: val });
  };

  return (
    <div 
      style={{ animationDelay: `${index * 0.05}s` }}
      className={`
        animate-slide-up opacity-0
        group relative flex flex-col 
        rounded-[3rem] p-7 
        border-2 border-transparent
        transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)
        hover:scale-[1.05] hover:-translate-y-4
        hover:shadow-[0_40px_80px_-15px_rgba(79,70,229,0.25)] dark:hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)]
        hover:border-indigo-400/30 dark:hover:border-indigo-500/20
        ${isCompleted 
          ? 'bg-slate-50/60 dark:bg-slate-800/20 grayscale-[0.4] opacity-80' 
          : 'bg-gradient-to-br from-white via-white/95 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900/95 dark:to-indigo-950/10 shadow-[0_15px_35px_-5px_rgba(0,0,0,0.05)] dark:shadow-none'} 
        ${statusAnimation ? 'ring-[12px] ring-indigo-500/10 scale-95' : ''} 
        ${task.isPinned ? 'ring-2 ring-amber-400/40 dark:ring-amber-500/20' : ''}
      `}
    >
      {/* Confetti Animation Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-[100] flex items-center justify-center overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2.5 h-2.5 rounded-full animate-confetti"
              style={{
                backgroundColor: ['#4f46e5', '#10b981', '#f59e0b', '#f43f5e', '#0ea5e9', '#ec4899'][i % 6],
                left: `${30 + (Math.random() * 40)}%`,
                top: `${30 + (Math.random() * 40)}%`,
                transform: `rotate(${Math.random() * 360}deg) translate(${(Math.random() - 0.5) * 150}px, ${(Math.random() - 0.5) * 150}px)`,
                animationDelay: `${Math.random() * 0.3}s`,
                animationDuration: `${0.7 + Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Pin & Status Overlay Indicators */}
      {task.isPinned && (
        <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/40 animate-float z-10">
          <Icons.Pin filled />
        </div>
      )}
      
      {/* Header Area */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-wrap gap-2.5">
          <span className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-transparent transition-all group-hover:scale-110 group-hover:shadow-md ${PRIORITY_LABELS[task.priority].color}`}>
            {PRIORITY_LABELS[task.priority].label}
          </span>
          <span className="px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg flex items-center gap-2.5 transition-all group-hover:translate-x-1 group-hover:shadow-indigo-500/20" style={{ backgroundColor: task.color || '#6366f1' }}>
            {task.icon && CategoryIconMap[task.icon] ? (
              <span className="scale-125">{CategoryIconMap[task.icon]}</span>
            ) : (
              <span className="w-2.5 h-2.5 bg-white/50 rounded-full animate-pulse"></span>
            )}
            {task.category}
          </span>
        </div>
        
        <div className="flex items-center gap-2 opacity-30 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100 origin-right">
          <div className="relative">
            <button 
              onClick={handleReminderClick}
              className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 ${task.reminderAt ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 animate-pulse-subtle' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'}`}
              title="ضبط تذكير"
            >
              <Icons.Bell />
              {task.reminderAt && <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>}
            </button>
            <input 
              type="datetime-local" 
              ref={reminderInputRef}
              value={task.reminderAt || ''}
              onChange={handleReminderChange}
              className="absolute inset-0 opacity-0 pointer-events-none w-0 h-0"
            />
          </div>
          <button 
            onClick={() => onTogglePin(task.id)}
            className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all duration-300 ${task.isPinned ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/40' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30'}`}
            title={task.isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
          >
            <Icons.Pin filled={task.isPinned} />
          </button>
          <button 
            onClick={() => onEdit(task)}
            className="w-11 h-11 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-2xl transition-all"
            title="تعديل"
          >
            <Icons.Edit />
          </button>
          <button 
            onClick={() => setShowConfirmDelete(true)}
            className="w-11 h-11 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-2xl transition-all"
            title="حذف"
          >
            <Icons.Trash />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center gap-4 mb-4">
        <h3 className={`text-[26px] font-black leading-tight transition-all duration-500 ${isCompleted ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
          {task.title}
        </h3>
      </div>
      
      {/* Reminder Info Badge */}
      {task.reminderAt && !isCompleted && (
        <div className="mb-5 flex items-center gap-3 text-[12px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-900/40 px-5 py-2.5 rounded-[1.2rem] w-fit border border-indigo-100/50 dark:border-indigo-800/40 animate-fade-in group-hover:scale-105 transition-transform">
          <div className="animate-pulse"><Icons.Bell /></div>
          <span>تذكير: {formatDateTime(task.reminderAt)}</span>
        </div>
      )}

      {/* Description */}
      {task.description && (
        <div className="relative mb-4">
          <p className={`text-slate-500 dark:text-slate-400 text-[15.5px] leading-[1.6] font-medium transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-12 opacity-80 line-clamp-2'}`}>
            {task.description}
          </p>
        </div>
      )}

      {/* Progress Section */}
      {subtasksCount > 0 && (
        <div className="mb-7 bg-white dark:bg-slate-800/60 p-5 rounded-[2.2rem] border border-slate-100 dark:border-slate-800/50 transition-all shadow-sm hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800">
          <div className="flex justify-between items-center text-[12px] font-black text-slate-500 dark:text-slate-400 mb-4 px-1">
            <span className="flex items-center gap-2.5">
              <span className={`w-2.5 h-2.5 rounded-full transition-colors ${progress === 100 ? 'bg-green-500' : 'bg-indigo-500 animate-pulse'}`}></span>
              تقدّم المهمة
              <span className="text-slate-400 dark:text-slate-600 font-bold ml-1">({completedSubtasksCount}/{subtasksCount})</span>
            </span>
            <span className={`transition-all duration-700 font-black ${progress === 100 ? 'text-green-500' : 'text-indigo-600 dark:text-indigo-400'}`}>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700/30 h-3 rounded-full overflow-hidden shadow-inner border border-slate-200/20 dark:border-slate-700/20">
            <div 
              className={`h-full transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) rounded-full ${progress === 100 ? 'bg-gradient-to-r from-green-400 to-green-600 shadow-[0_0_20px_rgba(34,197,94,0.3)]' : 'bg-gradient-to-r from-indigo-500 to-indigo-700 shadow-[0_0_20px_rgba(79,70,229,0.3)]'}`} 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Expanded Content: Subtasks List */}
      <div className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100 mb-7' : 'max-h-0 opacity-0'}`}>
        {subtasksCount > 0 && (
          <div className="space-y-3.5 pt-2">
            {task.subTasks.map(st => (
              <label key={st.id} className={`flex items-center gap-4.5 p-5 rounded-[2rem] cursor-pointer border-2 transition-all duration-400 group/item ${st.isCompleted ? 'bg-slate-50/50 dark:bg-slate-800/30 border-transparent opacity-60' : 'bg-white dark:bg-slate-800 border-slate-50 dark:border-slate-700/50 hover:border-indigo-400/40 hover:shadow-xl hover:-translate-y-1'}`}>
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={st.isCompleted} 
                    onChange={() => onToggleSubtask(task.id, st.id)}
                    className="w-6.5 h-6.5 rounded-xl text-indigo-600 dark:text-indigo-500 focus:ring-offset-2 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-transparent transition-all cursor-pointer transform active:scale-50"
                  />
                </div>
                <span className={`text-[17px] font-bold transition-all duration-400 ${st.isCompleted ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-200 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-300 group-hover/item:translate-x-1'}`}>
                  {st.title}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info Area */}
      <div className="mt-auto space-y-5 pt-7 border-t border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center justify-between gap-5">
          <div className="flex items-center text-slate-400 dark:text-slate-500 text-[13px] font-black group-hover:text-indigo-500 transition-all">
            <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl mr-2.5 transition-all duration-500 group-hover:rotate-[15deg] group-hover:bg-indigo-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-indigo-500/20">
              <Icons.Calendar />
            </div>
            <span>{task.dueDate ? formatDate(task.dueDate) : 'وقت مفتوح'}</span>
          </div>
          
          <div className="relative">
            <select 
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              className={`text-[12px] font-black rounded-[1.4rem] px-6 py-3 cursor-pointer transition-all duration-500 outline-none border-2 appearance-none text-center min-w-[130px] shadow-sm hover:scale-105 active:scale-95 ${
                task.status === TaskStatus.COMPLETED 
                  ? 'bg-green-50 dark:bg-green-900/40 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50 shadow-green-500/10' 
                  : task.status === TaskStatus.IN_PROGRESS 
                  ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50 shadow-blue-500/10'
                  : 'bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 shadow-slate-500/10'
              }`}
            >
              <option value={TaskStatus.PENDING}>قيد الانتظار</option>
              <option value={TaskStatus.IN_PROGRESS}>جاري العمل</option>
              <option value={TaskStatus.COMPLETED}>مكتملة</option>
            </select>
          </div>
        </div>

        {/* Expand Toggle Button */}
        {(task.description || subtasksCount > 0) && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full py-4.5 flex items-center justify-center gap-3.5 rounded-[1.8rem] text-[13px] font-black transition-all duration-500 group/expand overflow-hidden relative ${isExpanded ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 dark:shadow-none' : 'bg-slate-50/90 dark:bg-slate-800/60 text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-300 border border-slate-100 dark:border-slate-700/50'}`}
          >
            <span className="relative z-10">{isExpanded ? 'إغلاق التفاصيل' : 'عرض التفاصيل'}</span>
            <div className={`transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] relative z-10 ${isExpanded ? 'rotate-180' : 'group-hover:translate-y-1'}`}>
              <Icons.Chevron />
            </div>
            {!isExpanded && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-50/40 dark:via-indigo-900/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
            )}
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] p-12 max-w-sm w-full shadow-3xl animate-on-load border-2 border-slate-100 dark:border-slate-800">
            <div className="w-24 h-24 bg-rose-50 dark:bg-rose-900/40 text-rose-500 dark:text-rose-400 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 animate-float shadow-xl shadow-rose-500/10">
              <Icons.Trash />
            </div>
            <h4 className="text-[28px] font-black text-slate-800 dark:text-slate-100 mb-4 text-center tracking-tight">هل أنت متأكد؟</h4>
            <p className="text-slate-500 dark:text-slate-400 text-[15px] mb-12 text-center leading-relaxed font-medium">
              سيتم حذف مهمة <span className="text-slate-900 dark:text-slate-100 font-black">"{task.title}"</span> نهائياً ولن تتمكن من استعادتها.
            </p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => { onDelete(task.id); setShowConfirmDelete(false); }}
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-black py-5.5 rounded-[1.8rem] shadow-2xl shadow-rose-500/30 transition-all active:scale-95 hover:scale-[1.02]"
              >
                نعم، احذف المهمة
              </button>
              <button 
                onClick={() => setShowConfirmDelete(false)}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black py-5.5 rounded-[1.8rem] transition-all active:scale-95"
              >
                إلغاء التراجع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
