import React, { useState, useEffect } from 'react';
import { CheckSquare, Calendar, AlertCircle, Tag, Check, X, Plus } from 'lucide-react';
import api from '../services/api';

const TaskPreviewModal = ({ parsedData, originalText, onClose, onTaskSaved }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [labels, setLabels] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (parsedData) {
      setTitle(parsedData.title || '');
      setDescription(parsedData.description || '');
      setPriority(parsedData.priority || 'medium');
      setLabels(parsedData.labels || []);

      if (parsedData.dueDate) {
        const dateObj = new Date(parsedData.dueDate);
        if (!isNaN(dateObj.getTime())) {
          const tzOffset = dateObj.getTimezoneOffset() * 60000;
          const localIso = new Date(dateObj.getTime() - tzOffset).toISOString().slice(0, 16);
          setDueDate(localIso);
        } else {
          setDueDate('');
        }
      } else {
        setDueDate('');
      }
    }
  }, [parsedData]);

  const handleAddTag = () => {
    if (newTag.trim() && !labels.includes(newTag.trim().toLowerCase())) {
      setLabels([...labels, newTag.trim().toLowerCase()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setLabels(labels.filter((t) => t !== tagToRemove));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        priority,
        labels,
        originalText,
      };

      const res = await api.post('/tasks', payload);
      if (res.data && res.data.success) {
        onTaskSaved(res.data.data);
        onClose();
      } else {
        setError('Failed to save task.');
      }
    } catch (err) {
      console.error('Error saving task:', err);
      setError(err.response?.data?.message || 'Error saving task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!parsedData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 rounded-xl p-6 sm:p-7 shadow-2xl border border-slate-800 relative overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/90 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 tracking-tight font-heading">Confirm Task Details</h3>
              <p className="text-xs text-slate-400">Review and edit task attributes before saving</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fallback Banner Notice */}
        {parsedData.isFallback && (
          <div className="mb-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-amber-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>Parsing completed using standard rule parser. Adjust details below if needed.</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              required
              className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Notes (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="2"
              placeholder="Additional task context or notes..."
              className="w-full px-3.5 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-all resize-none"
            />
          </div>

          {/* Due Date & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Due Date & Time
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>

            {/* Priority Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Priority Level
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-slate-950 border border-slate-800">
                {['low', 'medium', 'high'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                      priority === p
                        ? p === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : p === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tag Chips Editor */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              Labels / Tags
            </label>

            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {labels.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-400 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Add label (press Enter)..."
                className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition-all border border-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 rounded-lg btn-primary text-white text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 transition-all"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Task</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default TaskPreviewModal;
