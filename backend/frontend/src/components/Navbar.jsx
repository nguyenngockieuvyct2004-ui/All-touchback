import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import TBLogo from '../../assets/TBlogo.png';

const navLinkClass = ({ isActive }) =>
  'relative px-3 py-2 rounded-md text-sm font-medium transition ' +
  (isActive
    ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-600/10'
    : 'text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-300 hover:bg-gray-100/70 dark:hover:bg-gray-800/60');

export default function Navbar(){
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
  <header className="sticky top-0 z-40 relative overflow-hidden isolate border-b border-white/10 dark:border-white/10 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.06)]">
      {/* Hologram gradient background layer */}
      <div className="absolute inset-0 -z-10">
        <div className="holo-gradient h-full w-full" />
        {/* subtle contrast scrim to keep text readable */}
        <div className="absolute inset-0 bg-black/20" />
        {/* sheen */}
        <div className="absolute inset-0 bg-[radial-gradient(1200px_200px_at_10%_-50%,rgba(255,255,255,0.22),transparent),radial-gradient(800px_180px_at_90%_-60%,rgba(255,255,255,0.12),transparent)] pointer-events-none" />
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-6 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <img src={TBLogo} alt="TouchBack" className="w-5 h-5 object-contain mix-blend-multiply dark:mix-blend-screen rounded pointer-events-none select-none" />
            <span className="tracking-tight">TouchBack</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/products" className={({isActive})=>`relative px-3 py-2 rounded-md text-sm font-medium transition ${isActive? 'bg-white/15 text-white shadow-sm' : 'hover:bg-white/10 text-white/90'}`}>Sản phẩm</NavLink>
            {user && <NavLink to="/memories" className={({isActive})=>`relative px-3 py-2 rounded-md text-sm font-medium transition ${isActive? 'bg-white/15 text-white shadow-sm' : 'hover:bg-white/10 text-white/90'}`}>Memories</NavLink>}
            {user && <NavLink to="/nfc" className={({isActive})=>`relative px-3 py-2 rounded-md text-sm font-medium transition ${isActive? 'bg-white/15 text-white shadow-sm' : 'hover:bg-white/10 text-white/90'}`}>NFC</NavLink>}
            {user && (user.role === 'admin' || user.role==='manager') && <NavLink to="/admin/products" className={({isActive})=>`relative px-3 py-2 rounded-md text-sm font-medium transition ${isActive? 'bg-white/15 text-white shadow-sm' : 'hover:bg-white/10 text-white/90'}`}>Admin</NavLink>}
            <NavLink to="/cart" className={({isActive})=>`relative px-3 py-2 rounded-md text-sm font-medium transition ${isActive? 'bg-white/15 text-white shadow-sm' : 'hover:bg-white/10 text-white/90'}`}>Giỏ hàng</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!user && <>
            <Link to="/login" className="text-xs md:text-sm px-3 h-9 rounded-md border border-white/30 hover:border-white/50 bg-white/10 hover:bg-white/15 text-white transition">Đăng nhập</Link>
            <Link to="/register" className="hidden md:inline-flex text-xs md:text-sm px-3 h-9 items-center rounded-md bg-white/20 hover:bg-white/25 text-white border border-white/30 transition">Đăng ký</Link>
          </>}
          {user && <div className="flex items-center gap-3">
            <span className="text-xs md:text-sm text-white/90 max-w-[140px] truncate">{user.email || user.role}</span>
            <button onClick={()=>{logout(); navigate('/');}} className="text-xs md:text-sm px-3 h-9 rounded-md border border-white/30 hover:border-white/50 bg-white/10 hover:bg-white/15 text-white transition">Thoát</button>
          </div>}
        </div>
      </div>
    </header>
  );
}
