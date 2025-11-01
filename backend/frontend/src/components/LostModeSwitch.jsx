import React from 'react';

export default function LostModeSwitch({ isLost = false, onToggle, disabled = false, className = '' }){
  return (
    <div className={`inline-flex items-center ${className}`}>
      <div className="inline-flex rounded-full overflow-hidden border border-black/10 dark:border-white/10 bg-white/60 dark:bg-gray-900/40 backdrop-blur">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onToggle?.(false)}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${!isLost ? 'text-white bg-gradient-to-r from-pink-500 via-orange-400 to-amber-400 shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'}`}
          title="Active"
        >
          {/* Sun icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>Active</span>
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onToggle?.(true)}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold flex items-center gap-2 transition ${isLost ? 'text-white bg-gradient-to-r from-indigo-500 via-sky-500 to-blue-500 shadow-sm' : 'text-gray-700 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'}`}
          title="Lost"
        >
          {/* Moon icon */}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Lost</span>
        </button>
      </div>
    </div>
  );
}
