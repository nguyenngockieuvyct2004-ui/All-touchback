import React from 'react';

export default function EmptyState({ title='Không có dữ liệu', description='Hãy thêm mới để bắt đầu', action }){
  return (
    <div className="panel flex flex-col items-center justify-center text-center py-14">
      <div className="mb-4 w-14 h-14 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-300">
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/><path d="M3 13h8v8H3z"/></svg>
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">{description}</p>
      {action}
    </div>
  );
}
