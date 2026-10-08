import React from 'react';
import TaskCard from './TaskCard';
import { Search, Filter, ArrowUpDown, ListTodo } from 'lucide-react';

const TaskList = ({
  tasks,
  loading,
  search,
  setSearch,
  priorityFilter,
  setPriorityFilter,
  labelFilter,
  setLabelFilter,
  availableLabels,
  sortBy,
  setSortBy,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
}) => {
  return (
    <div className="w-full space-y-5">
      
      {/* Search, Filter & Sort Toolbar */}
      <div className="bg-slate-900/90 backdrop-blur-xl rounded-xl p-4 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          
          {/* Priority Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          {/* Tag Filter */}
          {availableLabels && availableLabels.length > 0 && (
            <select
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="">All Tags</option>
              {availableLabels.map((lbl) => (
                <option key={lbl} value={lbl}>
                  #{lbl}
                </option>
              ))}
            </select>
          )}

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="createdAt">Newest First</option>
              <option value="dueDate">Due Date (Ascending)</option>
              <option value="createdAtAsc">Oldest First</option>
            </select>
          </div>

        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-slate-900 p-5 rounded-xl border border-slate-800 animate-pulse space-y-3">
              <div className="h-4 bg-slate-800 rounded w-3/4"></div>
              <div className="h-3 bg-slate-800/60 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        /* Empty State */
        <div className="bg-slate-900/60 rounded-xl p-10 text-center border border-slate-800 flex flex-col items-center justify-center gap-2.5">
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700">
            <ListTodo className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-200">No Tasks Found</h3>
          <p className="text-xs text-slate-400 max-w-sm">
            {search || priorityFilter || labelFilter
              ? 'No tasks match your filter criteria. Try clearing search or filters.'
              : 'You have no active tasks yet. Type a sentence above to create your first task!'}
          </p>
        </div>
      ) : (
        /* Task Card Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onToggleStatus={onToggleStatus}
              onEditTask={onEditTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default TaskList;
