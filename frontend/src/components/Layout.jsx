import React from 'react';
import Navbar from './Navbar.jsx';
import ChatWidget from './ChatWidget.jsx';
import { subscribe, getToastConfig, subscribeConfig } from '../lib/toast.js';

export default function Layout({ children }){
  React.useEffect(()=>{
    // Ensure light theme by default to match new cream design
    if(localStorage.getItem('tb-theme') !== 'dark'){
      document.documentElement.classList.remove('dark');
    }
  },[]);
  return (
    <div className="min-h-screen flex flex-col theme-transition">
      <Navbar />
      <div className="flex-1 w-full">
        {children}
      </div>
      <ToastContainer />
      <ChatWidget />
      <Footer />
    </div>
  );
}

function Footer(){
  return (
    <footer className="mt-16 border-t border-black/10 dark:border-gray-800 bg-[#f7f1e5]/80 dark:bg-gray-950/60 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 text-sm flex flex-col md:flex-row gap-6 md:items-center justify-between text-gray-800 dark:text-gray-200">
        <div className="space-y-1">
          <p className="font-semibold text-gradient">TouchBack</p>
          <p className="text-gray-500 dark:text-gray-400">NFC • Kỷ niệm số • E-commerce</p>
        </div>
        <div className="flex gap-6 text-xs text-gray-600 dark:text-gray-400">
          <a className="hover:text-gray-900 dark:hover:text-white transition" href="#">Privacy</a>
          <a className="hover:text-gray-900 dark:hover:text-white transition" href="#">Terms</a>
          <a className="hover:text-gray-900 dark:hover:text-white transition" href="/huong-dan">Support</a>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">© {new Date().getFullYear()} TouchBack</div>
      </div>
    </footer>
  );
}

function ToastContainer(){
  const [items, setItems] = React.useState([]);
  const [pos, setPos] = React.useState(getToastConfig().position);
  React.useEffect(()=>{
    const unsub1 = subscribe((evt)=>{
      if (evt.action === 'add') setItems((arr)=>[...arr, evt.item]);
      if (evt.action === 'remove') setItems((arr)=>arr.filter(x=>x.id!==evt.id));
    });
    const unsub2 = subscribeConfig((cfg)=> setPos(cfg.position));
    return ()=> { unsub1(); unsub2(); };
  },[]);
  const base = 'fixed z-[9999] space-y-2 pointer-events-none';
  const map = {
    'top-right': 'top-4 right-4 items-end',
    'top-left': 'top-4 left-4 items-start',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
    'bottom-right': 'bottom-4 right-4 items-end',
    'bottom-left': 'bottom-4 left-4 items-start',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
  };
  const animMap = {
    'top-right': 'toast-enter-right',
    'bottom-right': 'toast-enter-right',
    'top-left': 'toast-enter-left',
    'bottom-left': 'toast-enter-left',
    'top-center': 'toast-enter-top',
    'bottom-center': 'toast-enter-bottom',
  };
  const typeClass = (type)=> type==='success' ? 'toast-success' : type==='error' ? 'toast-error' : type==='warn' ? 'toast-warn' : 'toast-info';
  const typeIcon = (type)=> type==='success' ? '✓' : type==='error' ? '✖' : type==='warn' ? '⚠' : 'ℹ';
  return (
    <div className={`${base} flex flex-col ${map[pos] || map['top-right']}`}>
      {items.map((t)=> (
        <div key={t.id} className={`pointer-events-auto min-w-[240px] toast-card ${typeClass(t.type)} ${animMap[pos] || animMap['top-right']}`}>
          <div className="px-4 py-3">
            <div className="flex items-start gap-3">
              <span className="text-lg mt-0.5" style={{ color: 'var(--toast-accent)' }}>{typeIcon(t.type)}</span>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{t.title}</div>
                {t.message && <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{t.message}</div>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
