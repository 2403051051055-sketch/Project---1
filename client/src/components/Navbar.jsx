import React from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, LogOut, LayoutList, Calendar, User, Settings } from 'lucide-react';

const Navbar = ({ currentView, setCurrentView, onOpenSettings }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-[#0b0f19]/80 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600/90 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-2 font-heading">
              TaskFlow
              <span className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-normal">Smart Task Workspace</p>
          </div>
        </div>

        {/* View Switcher Toggles */}
        {user && setCurrentView && (
          <div className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentView('list')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'list'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              List View
            </button>
            <button
              onClick={() => setCurrentView('calendar')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                currentView === 'calendar'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Calendar View
            </button>
          </div>
        )}

        {/* User Profile, Settings & Logout */}
        {user ? (
          <div className="flex items-center gap-3">
            {/* User Profile Pill */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
                {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-slate-200 leading-tight">{user.name}</p>
                <p className="text-[10px] text-slate-400 leading-tight">{user.email}</p>
              </div>
            </div>

            {/* Settings Button */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                title="Account Settings"
                className="px-3 py-1.5 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 rounded-lg transition-all border border-slate-800 flex items-center gap-1.5 text-xs font-medium"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">Settings</span>
              </button>
            )}

            {/* Log Out Button */}
            <button
              onClick={logout}
              title="Log Out"
              className="px-3 py-1.5 text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg transition-all border border-rose-500/20 flex items-center gap-1.5 text-xs font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          </div>
        ) : null}

      </div>
    </header>
  );
};

export default Navbar;
