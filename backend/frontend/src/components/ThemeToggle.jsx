import React, { useEffect, useState } from 'react';

export default function ThemeToggle(){
  const [dark,setDark] = useState(()=> localStorage.getItem('tb-theme') === 'dark');

  useEffect(()=>{
    const root = document.documentElement;
    if(dark){
      root.classList.add('dark');
      localStorage.setItem('tb-theme','dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('tb-theme','light');
    }
  },[dark]);

  return (
    <button
      type="button"
      onClick={()=> setDark(d=>!d)}
      className="btn-ghost focus-ring text-gray-600 dark:text-gray-300"
      aria-label="Toggle dark mode"
    >
      {dark ? (
        <span className="flex items-center gap-1 text-xs"><SunIcon className="w-4 h-4"/> Light</span>
      ) : (
        <span className="flex items-center gap-1 text-xs"><MoonIcon className="w-4 h-4"/> Dark</span>
      )}
    </button>
  );
}

function SunIcon(props){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2m16 0h2M6.34 17.66l1.41-1.41M15.66 8.75l1.41-1.41"/></svg>;}
function MoonIcon(props){return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79z"/></svg>;}
