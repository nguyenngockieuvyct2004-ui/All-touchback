import React from 'react';
import Navbar from './Navbar.jsx';
import ChatWidget from './ChatWidget.jsx';
import { subscribe } from '../lib/toast.js';

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
          <a className="hover:text-gray-900 dark:hover:text-white transition" href="#">Support</a>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">© {new Date().getFullYear()} TouchBack</div>
      </div>
    </footer>
  );
}

function ToastContainer(){
  const [items, setItems] = React.useState([]);
  React.useEffect(()=>{
    return subscribe((evt)=>{
      if (evt.action === 'add') setItems((arr)=>[...arr, evt.item]);
      if (evt.action === 'remove') setItems((arr)=>arr.filter(x=>x.id!==evt.id));
    });
  },[]);
  return (
    <div className="fixed bottom-4 right-4 z-[9999] space-y-2">
      {items.map((t)=> (
        <div key={t.id} className="px-4 py-3 rounded-lg shadow border border-black/10 dark:border-white/10 bg-[#fffdfa]/95 dark:bg-gray-900/95 text-gray-900 dark:text-gray-100 min-w-[240px]">
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 h-2.5 w-2.5 rounded-full ${t.type==='success'?'bg-green-600':t.type==='error'?'bg-red-600':t.type==='warn'?'bg-amber-500':'bg-gray-500'}`}></span>
            <div>
              <div className="text-sm font-medium text-gray-900">{t.title}</div>
              {t.message && <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{t.message}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
