import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import TaskInputForm from '../components/TaskInputForm';
import TaskPreviewModal from '../components/TaskPreviewModal';
import ManualTaskModal from '../components/ManualTaskModal';
import EditTaskModal from '../components/EditTaskModal';
import SettingsModal from '../components/SettingsModal';
import TaskList from '../components/TaskList';
import CalendarView from '../components/CalendarView';
import api from '../services/api';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'calendar'
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search, Filters & Sorting
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [labelFilter, setLabelFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');

  // Modals state
  const [parsedTaskData, setParsedTaskData] = useState(null);
  const [originalText, setOriginalText] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (priorityFilter) params.priority = priorityFilter;
      if (labelFilter) params.label = labelFilter;
      if (sortBy) params.sortBy = sortBy;

      const res = await api.get('/tasks', { params });
      if (res.data && res.data.success) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [search, priorityFilter, labelFilter, sortBy]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Derived available unique labels for filter dropdown
  const availableLabels = [
    ...new Set(tasks.flatMap((t) => t.labels || []).filter(Boolean)),
  ];

  // Handlers
  const handleTaskParsed = (data, text) => {
    setParsedTaskData(data);
    setOriginalText(text);
  };

  const handleTaskSaved = () => {
    fetchTasks();
  };

  const handleToggleStatus = async (taskId) => {
    const targetTask = tasks.find((t) => t._id === taskId);
    if (!targetTask) return;

    const newStatus = targetTask.status === 'completed' ? 'pending' : 'completed';

    // Optimistic UI update for instant visual feedback
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await api.patch(`/tasks/${taskId}/status`);
      if (res.data && res.data.success) {
        setTasks((prev) =>
          prev.map((t) => (t._id === taskId ? res.data.data : t))
        );
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? targetTask : t))
      );
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const res = await api.delete(`/tasks/${taskId}`);
      if (res.data && res.data.success) {
        setTasks((prev) => prev.filter((t) => t._id !== taskId));
      }
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenSettings={() => setShowSettingsModal(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Top Hero Section: AI Natural Language Task Input */}
        <TaskInputForm
          onTaskParsed={handleTaskParsed}
          onOpenManualModal={() => setShowManualModal(true)}
        />

        {/* Main Workspace Section: List View or Calendar View */}
        {currentView === 'list' ? (
          <TaskList
            tasks={tasks}
            loading={loading}
            search={search}
            setSearch={setSearch}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            labelFilter={labelFilter}
            setLabelFilter={setLabelFilter}
            availableLabels={availableLabels}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onToggleStatus={handleToggleStatus}
            onEditTask={(task) => setTaskToEdit(task)}
            onDeleteTask={handleDeleteTask}
          />
        ) : (
          <CalendarView
            tasks={tasks}
            onEventClick={(task) => setTaskToEdit(task)}
          />
        )}
      </main>

      {/* AI Parsed Task Preview Modal */}
      {parsedTaskData && (
        <TaskPreviewModal
          parsedData={parsedTaskData}
          originalText={originalText}
          onClose={() => setParsedTaskData(null)}
          onTaskSaved={handleTaskSaved}
        />
      )}

      {/* Manual Creation Modal */}
      {showManualModal && (
        <ManualTaskModal
          onClose={() => setShowManualModal(false)}
          onTaskSaved={handleTaskSaved}
        />
      )}

      {/* Task Edit Modal */}
      {taskToEdit && (
        <EditTaskModal
          task={taskToEdit}
          onClose={() => setTaskToEdit(null)}
          onTaskUpdated={handleTaskSaved}
        />
      )}

      {/* Account & App Settings Modal */}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </div>
  );
};

export default Dashboard;
