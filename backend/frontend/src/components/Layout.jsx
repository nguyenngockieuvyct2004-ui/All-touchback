import React from 'react';
import Navbar from './Navbar.jsx';
import ChatWidget from './ChatWidget.jsx';

export default function Layout({ children }){
  return (
    <div className="min-h-screen flex flex-col theme-transition">
      <Navbar />
      <div className="flex-1 w-full">
        {children}
      </div>
      <ChatWidget />
      <Footer />
    </div>
  );
}

function Footer(){
  return (
    <footer className="mt-16 border-t border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-950/60 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 text-sm flex flex-col md:flex-row gap-6 md:items-center justify-between">
        <div className="space-y-1">
          <p className="font-semibold text-gradient">TouchBack</p>
          <p className="text-gray-500 dark:text-gray-400">NFC • Kỷ niệm số • E-commerce</p>
        </div>
        <div className="flex gap-6 text-xs text-gray-500 dark:text-gray-400">
          <a className="hover:text-brand-600 dark:hover:text-brand-400 transition" href="#">Privacy</a>
          <a className="hover:text-brand-600 dark:hover:text-brand-400 transition" href="#">Terms</a>
          <a className="hover:text-brand-600 dark:hover:text-brand-400 transition" href="#">Support</a>
        </div>
        <div className="text-xs text-gray-400">© {new Date().getFullYear()} TouchBack</div>
      </div>
    </footer>
  );
}
