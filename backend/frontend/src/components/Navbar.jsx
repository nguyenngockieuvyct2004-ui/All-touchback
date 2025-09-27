import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';

const navLinkClass = ({ isActive }) =>
  'relative px-3 py-2 rounded-md text-sm font-medium transition ' +
  (isActive
    ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-600/10'
    : 'text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/60');

export default function Navbar(){
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:supports-[backdrop-filter]:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg text-gradient">
            <LogoIcon className="w-5 h-5" />
            TouchBack
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/products" className={navLinkClass}>Sản phẩm</NavLink>
            {user && <NavLink to="/memories" className={navLinkClass}>Memories</NavLink>}
            {user && <NavLink to="/nfc" className={navLinkClass}>NFC</NavLink>}
            {user && (user.role === 'admin' || user.role==='manager') && <NavLink to="/admin/products" className={navLinkClass}>Admin</NavLink>}
            <NavLink to="/cart" className={navLinkClass}>Giỏ hàng</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!user && <>
            <Link to="/login" className="btn-outline text-xs md:text-sm">Đăng nhập</Link>
            <Link to="/register" className="btn hidden md:inline-flex text-xs md:text-sm">Đăng ký</Link>
          </>}
          {user && <div className="flex items-center gap-3">
            <span className="text-xs md:text-sm text-gray-600 dark:text-gray-300 max-w-[140px] truncate">{user.email || user.role}</span>
            <button onClick={()=>{logout(); navigate('/');}} className="btn-outline text-xs md:text-sm">Thoát</button>
          </div>}
        </div>
      </div>
    </header>
  );
}

function LogoIcon(props){
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="3" width="7" height="7" rx="2" />
      <rect x="14" y="14" width="7" height="7" rx="2" />
      <path d="M3 13h8v8H3z" />
    </svg>
  );
}
