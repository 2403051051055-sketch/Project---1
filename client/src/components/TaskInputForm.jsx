import React, { useState } from 'react';
import { CheckSquare, Plus, AlertTriangle, ArrowRight } from 'lucide-react';
import api from '../services/api';

const TaskInputForm = ({ onTaskParsed, onOpenManualModal }) => {
  const [inputText, setInputText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setError('');
    setParsing(true);

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const clientNow = new Date().toISOString();

    try {
      const res = await api.post('/tasks/parse', {
        text: inputText.trim(),
        timeZone,
        clientNow,
      });

      if (res.data && res.data.success) {
        onTaskParsed(res.data.data, inputText.trim());
        setInputText('');
      } else {
        setError('Could not parse task text. Please try again.');
      }
    } catch (err) {
      console.error('Task parsing error:', err);
      const fallback = {
        title: inputText.trim(),
        description: '',
        dueDate: null,
        priority: 'medium',
        labels: [],
        isFallback: true,
      };
      onTaskParsed(fallback, inputText.trim());
      setInputText('');
    } finally {
      setParsing(false);
    }
  };

  const examplePrompts = [
    'Submit project report by Friday 5pm, high priority, #work',
    'Math homework tomorrow at 3pm, #college',
    'Call doctor next Monday 10am',
    'Buy groceries tonight, #personal',
  ];

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-xl rounded-2xl p-6 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600/90 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 tracking-tight font-heading">Quick Task Creation</h2>
              <p className="text-xs text-slate-400">Type in natural language to automatically schedule and categorize tasks</p>
            </div>
          </div>

          <button
            onClick={onOpenManualModal}
            className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Manual Entry</span>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="relative mt-2">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={parsing}
              placeholder="e.g., Submit project report by Friday 5pm, high priority, #college..."
              className="w-full pl-4 pr-32 py-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />

            <button
              type="submit"
              disabled={parsing || !inputText.trim()}
              className="absolute right-1.5 py-2 px-4 rounded-lg btn-primary text-white text-xs font-semibold flex items-center gap-1.5 shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {parsing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Parsing...</span>
                </>
              ) : (
                <>
                  <span>Add Task</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Loading Indicator */}
        {parsing && (
          <div className="mt-3 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-indigo-300 font-medium">
              Extracting title, dates, priority, and tags...
            </p>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center gap-2 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Sample Prompt Chips */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">Examples:</span>
          {examplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInputText(prompt)}
              className="text-xs text-slate-400 hover:text-slate-200 bg-slate-950/80 hover:bg-slate-800 px-2.5 py-1 rounded-md border border-slate-800 transition-all text-left truncate max-w-xs"
            >
              "{prompt}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskInputForm;
