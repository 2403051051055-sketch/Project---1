import React from 'react';
import { Calendar, AlertTriangle, Edit3, Trash2, CheckCircle2, Clock, RotateCcw } from 'lucide-react';
import { formatDistanceToNow, format, isBefore } from 'date-fns';

const TaskCard = ({ task, onToggleStatus, onEditTask, onDeleteTask }) => {
  const isCompleted = task.status === 'completed';
  const isReopened = task.status === 'reopened';
  const hasDueDate = Boolean(task.dueDate);
  const dueDateObj = hasDueDate ? new Date(task.dueDate) : null;
  const isOverdue = hasDueDate && !isCompleted && isBefore(dueDateObj, new Date());

  const getPriorityBadge = (p) => {
    switch (p) {
      case 'high':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'medium':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'low':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <button
          onClick={() => onToggleStatus(task._id)}
          title="Click to re-open task"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          Completed
        </button>
      );
    }
    if (isReopened) {
      return (
        <button
          onClick={() => onToggleStatus(task._id)}
          title="Click to mark complete"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
          Reopened
        </button>
      );
    }
    return (
      <button
        onClick={() => onToggleStatus(task._id)}
        title="Click to mark complete"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer"
      >
        <Clock className="w-3.5 h-3.5 text-indigo-400" />
        Pending
      </button>
    );
  };

  return (
    <div
      className={`bg-slate-900/90 rounded-xl p-4 sm:p-5 border relative transition-all group ${
        isCompleted
          ? 'opacity-65 border-slate-800 bg-slate-900/40'
          : isReopened
          ? 'border-purple-500/30 bg-slate-900/90'
          : isOverdue
          ? 'border-rose-500/30 bg-slate-900/90 shadow-md shadow-rose-950/20'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 mb-3 pb-2.5 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEditTask(task)}
            title="Edit Task"
            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDeleteTask(task._id)}
            title="Delete Task"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task Content */}
      <div className="mb-3">
        <h4
          className={`text-sm font-semibold text-slate-100 tracking-tight ${
            isCompleted ? 'line-through text-slate-500' : ''
          }`}
        >
          {task.title}
        </h4>
        {task.description && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{task.description}</p>
        )}
      </div>

      {/* Footer Meta Row */}
      <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-slate-800/60 text-xs">
        {/* Priority Badge */}
        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${getPriorityBadge(
            task.priority
          )}`}
        >
          {task.priority} Priority
        </span>

        {/* Due Date Badge */}
        {hasDueDate && (
          <div
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium border ${
              isOverdue
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30 font-semibold'
                : 'bg-slate-950 text-slate-400 border-slate-800'
            }`}
          >
            {isOverdue ? (
              <AlertTriangle className="w-3 h-3 text-rose-400" />
            ) : (
              <Calendar className="w-3 h-3 text-indigo-400" />
            )}
            <span>
              {format(dueDateObj, 'MMM d, h:mm a')}
              {!isCompleted && (
                <span className="text-[10px] text-slate-500 ml-1">
                  ({formatDistanceToNow(dueDateObj, { addSuffix: true })})
                </span>
              )}
            </span>
          </div>
        )}

        {/* Labels / Tags */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 ml-auto">
            {task.labels.map((label) => (
              <span
                key={label}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
              >
                #{label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
