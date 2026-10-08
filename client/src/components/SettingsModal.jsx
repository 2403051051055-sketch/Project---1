import React, { useState } from 'react';
import { Settings, User, Mail, Globe, Bell, ShieldCheck, LogOut, X, Check, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SettingsModal = ({ onClose }) => {
  const { user, logout, updateUserProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [timeZone, setTimeZone] = useState(user?.timeZone || 'UTC');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (updateUserProfile) {
      await updateUserProfile({ name, timeZone });
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const timezones = [
    { label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
    { label: 'Asia/Kolkata (IST - India)', value: 'Asia/Kolkata' },
    { label: 'America/New_York (EST - Eastern Time)', value: 'America/New_York' },
    { label: 'America/Los_Angeles (PST - Pacific Time)', value: 'America/Los_Angeles' },
    { label: 'Europe/London (GMT/BST - UK)', value: 'Europe/London' },
    { label: 'Asia/Tokyo (JST - Japan)', value: 'Asia/Tokyo' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/10 relative overflow-hidden text-slate-100">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Account & App Settings</h3>
              <p className="text-xs text-slate-400">Manage profile preferences, AI engine, and security</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Notice */}
        {savedSuccess && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-400 text-xs animate-fadeIn">
            <Check className="w-4 h-4 shrink-0" />
            <span>Settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* User Profile Info */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-white/5">
              <div className="w-12 h-12 rounded-full bg-sky-500/20 text-sky-400 font-bold text-lg flex items-center justify-center border border-sky-500/30">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">{user?.name || 'User Profile'}</h4>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-500" />
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Display Name Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-sky-400" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-500 transition-all"
              />
            </div>

            {/* Timezone Preference */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-sky-400" />
                Time Zone Preference
              </label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white text-xs focus:outline-none focus:border-sky-500 transition-all"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value} className="bg-slate-900 text-white">
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Email Notification Toggle */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                Email Task Reminders
              </label>
              <p className="text-[11px] text-slate-400">Receive email alerts 1 hour before tasks are due</p>
            </div>
            <button
              type="button"
              onClick={() => setEmailNotifications(!emailNotifications)}
              className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                emailNotifications ? 'bg-sky-500' : 'bg-slate-800'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  emailNotifications ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* System & AI Engine Status */}
          <div className="p-3.5 rounded-xl bg-sky-500/5 border border-sky-500/20 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                AI Parsing Engine:
              </span>
              <span className="font-semibold text-sky-300">Google Gemini (gemini-1.5-flash)</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Security & Encryption:
              </span>
              <span className="font-semibold text-emerald-400">JWT + Bcrypt Protected</span>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                logout();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold border border-rose-500/20 flex items-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium border border-white/10 transition-all"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl btn-gradient text-white text-xs font-semibold shadow-lg shadow-sky-500/20 flex items-center gap-1.5 hover:opacity-95 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};

export default SettingsModal;
