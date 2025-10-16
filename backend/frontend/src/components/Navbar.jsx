import React, { useState } from 'react';
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
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // desktop dropdown
  const panelRef = React.useRef(null);
  const firstFocusableRef = React.useRef(null);
  const lastFocusableRef = React.useRef(null);
  const deskMenuRef = React.useRef(null);
  const deskBtnRef = React.useRef(null);

  React.useEffect(()=>{
    if(open){
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return ()=> { document.body.style.overflow = prev; };
    }
  },[open]);

  React.useEffect(()=>{
    function onKey(e){
      if(e.key === 'Escape') setOpen(false);
      if(e.key === 'Tab' && open && panelRef.current){
        const focusable = panelRef.current.querySelectorAll('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
        if(focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length-1];
        if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
    }
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  },[open]);

  // Close desktop menu on outside click / Esc
  React.useEffect(()=>{
    function onDocClick(e){
      if(!menuOpen) return;
      if(deskMenuRef.current && !deskMenuRef.current.contains(e.target) && !deskBtnRef.current?.contains(e.target)){
        setMenuOpen(false);
      }
    }
    function onKey(e){ if(e.key==='Escape') setMenuOpen(false); }
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKey);
    return ()=>{ document.removeEventListener('mousedown', onDocClick); window.removeEventListener('keydown', onKey); };
  },[menuOpen]);

  return (
  <header className="sticky top-0 z-[200] relative bg-[#f7f1e5]/90 dark:bg-gray-900/80 backdrop-blur border-b border-black/10 dark:border-white/10">

  <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-6 text-gray-900 dark:text-white">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <img loading="lazy" src={TBLogo} alt="TouchBack" className="w-10 h-10 md:w-16 md:h-16 object-contain rounded pointer-events-none select-none" />
            <span className="tracking-tight">TouchBack</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/products" className={({isActive})=>`relative px-3 py-2 rounded-md text-sm font-medium transition ${isActive? 'bg-black/10 text-gray-900 dark:bg-white/10 dark:text-white' : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-gray-100'}`}>Sản phẩm</NavLink>
            {user && <NavLink to="/memories" className={({isActive})=>`relative px-3 py-2 rounded-md text-sm font-medium transition ${isActive? 'bg-black/10 text-gray-900 dark:bg-white/10 dark:text-white' : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-gray-100'}`}>Memories</NavLink>}
            {user && <NavLink to="/nfc" className={({isActive})=>`relative px-3 py-2 rounded-md text-sm font-medium transition ${isActive? 'bg-black/10 text-gray-900 dark:bg-white/10 dark:text-white' : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-gray-100'}`}>NFC</NavLink>}
            <NavLink to="/about" className={({isActive})=>`relative px-3 py-2 rounded-md text-sm font-medium transition ${isActive? 'bg-black/10 text-gray-900 dark:bg-white/10 dark:text-white' : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-gray-100'}`}>Về chúng tôi</NavLink>
          </nav>
        </div>
        

        {/* Right controls: cart + hamburger */}
        <div className="flex items-center gap-3">
          {/* Cart icon on all sizes */}
          <NavLink to="/cart" className={({isActive})=>`inline-flex items-center justify-center w-9 h-9 rounded-md ${isActive? 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-white' : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-gray-100'} transition`} aria-label="Giỏ hàng">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6h15l-1.5 9h-12z"/><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/></svg>
          </NavLink>
          {/* Desktop dropdown trigger */}
          <div className="relative hidden md:block">
            <button ref={deskBtnRef} aria-haspopup="menu" aria-expanded={menuOpen} onClick={()=> setMenuOpen(v=>!v)} className="inline-flex items-center justify-center w-9 h-9 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-gray-100" title="Menu">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
            </button>
            {menuOpen && (
              <div ref={deskMenuRef} role="menu" className="absolute right-0 mt-2 w-64 rounded-xl border border-black/10 dark:border-white/10 bg-[#f7f1e5] dark:bg-gray-900 shadow-holo z-[300] overflow-hidden text-gray-900 dark:text-gray-100">
                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-black/10 dark:border-white/10">{user ? (user.email || user.role) : 'Tài khoản'}</div>
                <div className="divide-y divide-black/5">
                  {!user ? (
                    <>
                      <button onClick={()=>{ setMenuOpen(false); navigate('/login'); }} className="block w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5">Đăng nhập</button>
                      <button onClick={()=>{ setMenuOpen(false); navigate('/register'); }} className="block w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5">Đăng ký</button>
                    </>
                  ) : (
                    <>
                      <button onClick={()=>{ setMenuOpen(false); navigate('/profile'); }} className="block w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5">Hồ sơ</button>
                      <button onClick={()=>{ setMenuOpen(false); navigate('/change-password'); }} className="block w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5">Đổi mật khẩu</button>
                      <button onClick={()=>{ setMenuOpen(false); navigate('/orders'); }} className="block w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5">Trạng thái đơn hàng</button>
                    </>
                  )}
                </div>
                
                {user && (
                  <div className="border-t border-black/10 dark:border-white/10">
                    <button onClick={()=>{ setMenuOpen(false); logout(); navigate('/'); }} className="block w-full text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5">Đăng xuất</button>
                  </div>
                )}
                {/* Theme toggle */}
                <div className="border-t border-black/5 dark:border-white/10">
                  <ThemeToggle />
                </div>
              </div>
              
            )}
          </div>
          {/* Mobile hamburger */}
          <button aria-label="Toggle menu" onClick={()=> setOpen(s=>!s)} className="inline-flex md:hidden items-center justify-center w-9 h-9 rounded-md hover:bg-black/5 dark:hover:bg-white/5 text-gray-900 dark:text-gray-100">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={open? 'M6 18L18 6M6 6l12 12' : 'M3 12h18M3 6h18M3 18h18'} /></svg>
          </button>
        </div>
      </div>

      {/* Mobile slide-over panel (accessible) */}
  <div aria-hidden={!open} className={`${open? 'fixed inset-0 z-[1000]':'hidden'}`}>
        <div onClick={()=>setOpen(false)} className={`absolute inset-0 bg-black/20 dark:bg-black/60 transition-opacity ${open? 'opacity-100':'opacity-0 pointer-events-none'}`} />
  <aside id="mobile-menu" ref={panelRef} role="dialog" aria-modal="true" className={`absolute right-0 top-0 h-full w-[82%] max-w-sm bg-[#f7f1e5] dark:bg-gray-900 shadow-holo transform transition-transform ${open? 'translate-x-0':'translate-x-full'} focus:outline-none rounded-l-2xl overflow-hidden`}>
          <div className="px-4 pt-4 pb-6 space-y-3 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img loading="lazy" src={TBLogo} alt="TouchBack" className="w-9 h-9 object-contain rounded" />
                <span className="font-semibold">TouchBack</span>
              </div>
              <button aria-label="Close menu" onClick={()=> setOpen(false)} className="p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5">✕</button>
            </div>

            <nav className="flex flex-col gap-1 mt-3">
              <button ref={firstFocusableRef} onClick={()=>{ setOpen(false); navigate('/products'); }} className="text-left px-3 py-2 rounded-md text-sm w-full hover:bg-black/5 dark:hover:bg-white/5">Sản phẩm</button>
              {user && <button onClick={()=>{ setOpen(false); navigate('/memories'); }} className="text-left px-3 py-2 rounded-md text-sm w-full hover:bg-black/5 dark:hover:bg-white/5">Memories</button>}
              {user && <button onClick={()=>{ setOpen(false); navigate('/nfc'); }} className="text-left px-3 py-2 rounded-md text-sm w-full hover:bg-black/5 dark:hover:bg-white/5">NFC</button>}
              <button onClick={()=>{ setOpen(false); navigate('/about'); }} className="text-left px-3 py-2 rounded-md text-sm w-full hover:bg-black/5 dark:hover:bg-white/5">About</button>
              <button onClick={()=>{ setOpen(false); navigate('/cart'); }} className="text-left px-3 py-2 rounded-md text-sm w-full hover:bg-black/5 dark:hover:bg-white/5">Giỏ hàng</button>
            </nav>

            <div className="mt-auto border-t border-black/10 dark:border-white/10 pt-3 flex flex-col gap-2">
              {!user ? (
                <>
                  <Link to="/login" onClick={()=>setOpen(false)} className="block w-full text-center px-3 py-2 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">Đăng nhập</Link>
                  <Link to="/register" onClick={()=>setOpen(false)} className="block w-full text-center px-3 py-2 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">Đăng ký</Link>
                </>
              ) : (
                <>
                  <div className="px-3 text-sm truncate">{user.email || user.role}</div>
                  <button onClick={()=>{ setOpen(false); navigate('/profile'); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5">Hồ sơ</button>
                  <button onClick={()=>{ setOpen(false); navigate('/change-password'); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5">Đổi mật khẩu</button>
                  <button onClick={()=>{ setOpen(false); navigate('/orders'); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5">Đơn hàng</button>
                  <button ref={lastFocusableRef} onClick={()=>{ setOpen(false); logout(); navigate('/') ;}} className="w-full text-left px-3 py-2 rounded-md border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">Thoát</button>
                </>
              )}

              <div className="pt-2">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </header>
  );
}
