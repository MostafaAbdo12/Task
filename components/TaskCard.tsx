
import React, { useState } from 'react';
import { Task, TaskPriority, TaskStatus } from '../types';
import { PRIORITY_LABELS, Icons } from '../constants';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onBreakdown: (task: Task) => void;
  onTogglePin: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete, onEdit, onStatusChange, onToggleSubtask, onBreakdown, onTogglePin }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [statusAnimation, setStatusAnimation] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleStatusChange = (newStatus: TaskStatus) => {
    setStatusAnimation(true);
    onStatusChange(task.id, newStatus);
    setTimeout(() => setStatusAnimation(false), 1000);
  };

  return (
    <div className={`group bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 p-6 transition-all duration-500 hover:shadow-2xl dark:hover:shadow-indigo-900/10 hover:-translate-y-1 flex flex-col ${isCompleted ? 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-700' : ''} ${statusAnimation ? 'ring-4 ring-indigo-500/20' : ''} ${task.isPinned ? 'border-amber-200 dark:border-amber-900/50 ring-1 ring-amber-100 dark:ring-amber-900/20' : ''}`}>
      
      {/* Header Area */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${PRIORITY_LABELS[task.priority].color}`}>
            {PRIORITY_LABELS[task.priority].label}
          </span>
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-sm flex items-center gap-1.5" style={{ backgroundColor: task.color || '#6366f1' }}>
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            {task.category}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onTogglePin(task.id)}
            className={`w-8 h-8 flex items-center justify-center rounded-xl transition-all icon-transition ${task.isPinned ? 'text-amber-500 bg-amber-50 dark:bg-amber-900/30' : 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/10'}`}
            title={task.isPinned ? 'إلغاء التثبيت' : 'تثبيت'}
          >
            <Icons.Pin filled={task.isPinned} />
          </button>
          <button 
            onClick={() => onBreakdown(task)}
            className="w-8 h-8 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-xl transition-all icon-transition"
            title="تقسيم ذكي"
          >
            <Icons.Sparkles />
          </button>
          <button 
            onClick={() => onEdit(task)}
            className="w-8 h-8 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-xl transition-all icon-transition"
            title="تعديل"
          >
            <Icons.Edit />
          </button>
          <button 
            onClick={() => setShowConfirmDelete(true)}
            className="w-8 h-8 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all icon-transition"
            title="حذف"
          >
            <Icons.Trash />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="flex items-center gap-3 mb-2">
        <h3 className={`text-xl font-black transition-all duration-300 ${isCompleted ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-slate-100'}`}>
          {task.title}
        </h3>
      </div>
      
      {/* Description */}
      {task.description && (
        <div className="relative">
          <p className={`text-slate-500 dark:text-slate-400 text-sm leading-relaxed transition-all duration-500 overflow-hidden ${isExpanded ? 'max-h-[500px] mb-4' : 'max-h-12 mb-2 line-clamp-2'}`}>
            {task.description}
          </p>
        </div>
      )}

      {/* Progress Bar */}
      {subtasksCount > 0 && (
        <div className="mb-4 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100/50 dark:border-slate-700/50">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-2 px-1">
            <span className="flex items-center gap-1.5">
              إنجاز الخطوات 
              <span className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">{completedSubtasksCount}/{subtasksCount}</span>
            </span>
            <span className={`${progress === 100 ? 'text-green-500' : 'text-indigo-500 dark:text-indigo-400'}`}>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full transition-all duration-1000 ease-out rounded-full ${progress === 100 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]' : 'bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.3)]'}`} 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Expanded Content: Subtasks List */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
        {subtasksCount > 0 && (
          <div className="space-y-3 pt-2">
            {task.subTasks.map(st => (
              <label key={st.id} className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer group/item border-2 transition-all duration-300 ${st.isCompleted ? 'bg-slate-50 dark:bg-slate-800/20 border-transparent opacity-60' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10'}`}>
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={st.isCompleted} 
                    onChange={() => onToggleSubtask(task.id, st.id)}
                    className="w-5 h-5 rounded-lg text-indigo-600 dark:text-indigo-400 focus:ring-indigo-500 border-slate-300 dark:border-slate-600 bg-transparent transition-all cursor-pointer"
                  />
                </div>
                <span className={`text-sm font-bold transition-all duration-300 ${st.isCompleted ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-200 group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400'}`}>
                  {st.title}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Footer Info Area */}
      <div className="mt-auto space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center text-slate-400 dark:text-slate-500 text-[11px] font-bold">
            <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-lg mr-2">
              <Icons.Calendar />
            </div>
            <span>{task.dueDate ? formatDate(task.dueDate) : 'بدون تاريخ'}</span>
          </div>
          
          <select 
            value={task.status}
            onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
            className={`text-xs font-black rounded-xl px-3 py-2 cursor-pointer transition-all outline-none border-2 appearance-none text-center min-w-[100px] ${
              task.status === TaskStatus.COMPLETED 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-100 dark:border-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/40' 
                : task.status === TaskStatus.IN_PROGRESS 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <option value={TaskStatus.PENDING}>قيد الانتظار</option>
            <option value={TaskStatus.IN_PROGRESS}>قيد التنفيذ</option>
            <option value={TaskStatus.COMPLETED}>مكتملة</option>
          </select>
        </div>

        {/* Expand Toggle Button */}
        {(task.description || subtasksCount > 0) && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full py-2.5 flex items-center justify-center gap-2 rounded-2xl text-[11px] font-black transition-all duration-300 group/expand ${isExpanded ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            <span>{isExpanded ? 'طي التفاصيل' : 'عرض التفاصيل والخطوات'}</span>
            <div className={`transition-transform duration-500 ${isExpanded ? 'rotate-180' : 'animate-bounce'}`}>
              <Icons.Chevron />
            </div>
          </button>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Icons.Trash />
            </div>
            <h4 className="text-xl font-black text-slate-800 dark:text-slate-100 mb-3 text-center">تأكيد الحذف</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 text-center leading-relaxed">
              هل أنت متأكد من رغبتك في حذف المهمة <span className="text-slate-800 dark:text-slate-100 font-bold">"{task.title}"</span>؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => { onDelete(task.id); setShowConfirmDelete(false); }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-100 transition-all active:scale-95"
              >
                حذف المهمة
              </button>
              <button 
                onClick={() => setShowConfirmDelete(false)}
                className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-black py-4 rounded-2xl transition-all active:scale-95"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
