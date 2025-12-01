import React from 'react';

export default function StatGroup({ stats }){
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map(s => <div key={s.label} className="panel relative overflow-hidden">
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition bg-gradient-to-br from-brand-500/5 to-brand-700/10 pointer-events-none" />
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">{s.label}</p>
        <p className="text-2xl font-semibold text-gradient leading-none mb-1">{s.value}</p>
        {s.desc && <p className="text-xs text-gray-500 dark:text-gray-400">{s.desc}</p>}
      </div>)}
    </div>
  );
}
