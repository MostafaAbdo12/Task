
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
        group relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-[2.5rem] p-6 flex flex-col 
        border border-slate-100 dark:border-slate-800/50 
        transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1)
        hover:scale-[1.04] hover:-translate-y-3 
        hover:shadow-[0_30px_60px_-15px_rgba(79,70,229,0.2)] dark:hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]
        hover:border-indigo-400 dark:hover:border-indigo-500/50
        ${isCompleted ? 'bg-slate-50/40 dark:bg-slate-800/20 grayscale-[0.3] opacity-80' : 'shadow-xl shadow-slate-200/40 dark:shadow-none'} 
        ${statusAnimation ? 'ring-8 ring-indigo-500/10 scale-95' : ''} 
        ${task.isPinned ? 'border-amber-400/50 dark:border-amber-500/30 bg-amber-50/20 dark:bg-amber-900/10' : ''}
      `}
    >
      
      {/* Header Area */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-wrap gap-2">
          <span className={`px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-transform group-hover:scale-110 ${PRIORITY_LABELS[task.priority].color}`}>
            {PRIORITY_LABELS[task.priority].label}
          </span>
          <span className="px-4 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider text-white shadow-md flex items-center gap-2 transition-all group-hover:translate-x-1" style={{ backgroundColor: task.color || '#6366f1' }}>
            {task.icon && CategoryIconMap[task.icon] ? (
              <span className="animate-float">{CategoryIconMap[task.icon]}</span>
            ) : (
              <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            )}
            {task.category}
          </span>
        </div>
        <div className="flex items-center gap-1.5 -translate-y-1 opacity-40 group-hover:opacity-100 transition-all duration-300">
          <div className="relative">
            <button 
              onClick={handleReminderClick}
              className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-300 ${task.reminderAt ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 animate-pulse-subtle' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'}`}
              title="ضبط تذكير"
            >
              <Icons.Bell />
              {task.reminderAt && <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-ping"></span>}
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
            className={`w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-300 ${task.isPinned ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
            title={task.isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
          >
            <Icons.Pin filled={task.isPinned} />
          </button>
          <button 
            onClick={() => onEdit(task)}
            className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-2xl transition-all"
            title="تعديل"
          >
            <Icons.Edit />
          </button>
          <button 
            onClick={() => setShowConfirmDelete(true)}
            className="w-10 h-10 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
            title="حذف"
          >
            <Icons.Trash />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center gap-3 mb-3">
        <h3 className={`text-2xl font-black transition-all duration-500 ${isCompleted ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`}>
          {task.title}
        </h3>
      </div>
      
      {/* Reminder Info Badge */}
      {task.reminderAt && !isCompleted && (
        <div className="mb-4 flex items-center gap-2 text-[11px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-900/30 px-4 py-2 rounded-2xl w-fit border border-indigo-100 dark:border-indigo-800 animate-fade-in">
          <Icons.Bell />
          <span>تنبيه: {formatDateTime(task.reminderAt)}</span>
        </div>
      )}

      {/* Description */}
      {task.description && (
        <div className="relative mb-2">
          <p className={`text-slate-500 dark:text-slate-400 text-[15px] leading-relaxed transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-12 opacity-80 line-clamp-2'}`}>
            {task.description}
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {subtasksCount > 0 && (
        <div className="mb-6 bg-slate-50/50 dark:bg-slate-800/40 p-4 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800">
          <div className="flex justify-between items-center text-[11px] font-black text-slate-500 dark:text-slate-400 mb-3 px-1">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              مستوى الإنجاز
              <span className="text-slate-400 dark:text-slate-600 ml-1">({completedSubtasksCount}/{subtasksCount})</span>
            </span>
            <span className={`transition-all duration-500 ${progress === 100 ? 'text-green-500' : 'text-indigo-600 dark:text-indigo-400'}`}>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700/50 h-2.5 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full ${progress === 100 ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]' : 'bg-indigo-600 dark:bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.3)]'}`} 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Expanded Content: Subtasks List */}
      <div className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
        {subtasksCount > 0 && (
          <div className="space-y-3 pt-2">
            {task.subTasks.map(st => (
              <label key={st.id} className={`flex items-center gap-4 p-4 rounded-[1.5rem] cursor-pointer border-2 transition-all duration-300 group/item ${st.isCompleted ? 'bg-slate-50/50 dark:bg-slate-800/20 border-transparent' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-400/30 hover:shadow-lg'}`}>
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={st.isCompleted} 
                    onChange={() => onToggleSubtask(task.id, st.id)}
                    className="w-6 h-6 rounded-lg text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-transparent transition-all cursor-pointer transform active:scale-75"
                  />
                </div>
                <span className={`text-base font-bold transition-all duration-300 ${st.isCompleted ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-200 group-hover/item:translate-x-1'}`}>
                  {st.title}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info Area */}
      <div className="mt-auto space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800/50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center text-slate-400 dark:text-slate-500 text-[12px] font-black group-hover:text-indigo-500 transition-colors">
            <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl mr-2 transition-all group-hover:rotate-12 group-hover:bg-indigo-600 group-hover:text-white">
              <Icons.Calendar />
            </div>
            <span>{task.dueDate ? formatDate(task.dueDate) : 'مفتوح الوقت'}</span>
          </div>
          
          <select 
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
            className={`text-[11px] font-black rounded-2xl px-5 py-2.5 cursor-pointer transition-all duration-500 outline-none border-2 appearance-none text-center min-w-[120px] shadow-sm hover:scale-105 active:scale-95 ${
              task.status === TaskStatus.COMPLETED 
                ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50' 
                : task.status === TaskStatus.IN_PROGRESS 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50'
                : 'bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
          >
            <option value={TaskStatus.PENDING}>قيد الانتظار</option>
            <option value={TaskStatus.IN_PROGRESS}>قيد التنفيذ</option>
            <option value={TaskStatus.COMPLETED}>تم بنجاح</option>
          </select>
        </div>

        {/* Expand Toggle Button */}
        {(task.description || subtasksCount > 0) && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full py-3.5 flex items-center justify-center gap-3 rounded-[1.5rem] text-[12px] font-black transition-all duration-500 group/expand ${isExpanded ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none translate-y-0.5' : 'bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300'}`}
          >
            <span>{isExpanded ? 'طي التفاصيل' : 'عرض التفاصيل'}</span>
            <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'rotate-180' : 'group-hover:translate-y-1'}`}>
              <Icons.Chevron />
            </div>
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-sm w-full shadow-2xl animate-on-load border border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/40 text-red-500 dark:text-red-400 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-float">
              <Icons.Trash />
            </div>
            <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-4 text-center">حذف المهمة؟</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-10 text-center leading-relaxed">
              ستفقد جميع التفاصيل والخطوات الفرعية المرتبطة بمهمة <span className="text-slate-800 dark:text-slate-100 font-bold">"{task.title}"</span>.
            </p>
            <div className="flex flex-col gap-4">
              <button 
                onClick={() => { onDelete(task.id); setShowConfirmDelete(false); }}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-black py-5 rounded-[1.5rem] shadow-xl shadow-red-200 dark:shadow-none transition-all active:scale-95"
              >
                تأكيد الحذف النهائي
              </button>
              <button 
                onClick={() => setShowConfirmDelete(false)}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black py-5 rounded-[1.5rem] transition-all active:scale-95"
              >
                تراجع
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
