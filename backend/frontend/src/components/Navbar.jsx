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
  const panelRef = React.useRef(null);
  const firstFocusableRef = React.useRef(null);
  const lastFocusableRef = React.useRef(null);

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

  return (
    <header className="sticky top-0 z-40 relative overflow-hidden isolate border-b border-white/10 dark:border-white/10 shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.06)]">
      <div className="absolute inset-0 -z-10">
        <div className="holo-gradient h-full w-full" />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_200px_at_10%_-50%,rgba(255,255,255,0.22),transparent),radial-gradient(800px_180px_at_90%_-60%,rgba(255,255,255,0.12),transparent)] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-6 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 font-semibold text-lg">
            <img loading="lazy" src={TBLogo} alt="TouchBack" className="w-10 h-10 md:w-16 md:h-16 object-contain mix-blend-multiply dark:mix-blend-screen rounded pointer-events-none select-none" />
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
        

        {/* Right controls: desktop auth or user info + mobile menu */}
        <div className="flex items-center gap-3">
          {/* Desktop auth area */}
          {!user ? (
            <>
              <Link to="/login" className="hidden md:inline-flex text-xs md:text-sm px-3 h-9 items-center rounded-md bg-white/20 hover:bg-white/25 text-white border border-white/30 transition">Đăng nhập</Link>
              <Link to="/register" className="hidden md:inline-flex text-xs md:text-sm px-3 h-9 items-center rounded-md bg-white/20 hover:bg-white/25 text-white border border-white/30 transition">Đăng ký</Link>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs md:text-sm text-white/90 max-w-[140px] truncate">{user.email || user.role}</span>
              <button onClick={()=>{logout(); navigate('/');}} className="text-xs md:text-sm px-3 h-9 rounded-md border border-white/30 hover:border-white/50 bg-white/10 hover:bg-white/15 text-white transition">Thoát</button>
            </div>
          )}
  {/* Desktop theme toggle (visible on md+) */}
          <div className="hidden md:flex items-center ml-3">
            <ThemeToggle />
          </div>
        

          {/* Mobile hamburger */}
          <button aria-label="Toggle menu" onClick={()=> setOpen(s=>!s)} className="md:hidden inline-flex items-center justify-center p-2 rounded-md bg-white/10 hover:bg-white/15">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={open? 'M6 18L18 6M6 6l12 12' : 'M3 12h18M3 6h18M3 18h18'} /></svg>
          </button>
        </div>
      </div>

      {/* Mobile slide-over panel (accessible) */}
      <div aria-hidden={!open} className={`md:hidden ${open? 'fixed inset-0 z-50':'hidden'}`}>
        <div onClick={()=>setOpen(false)} className={`absolute inset-0 bg-black/50 transition-opacity ${open? 'opacity-100':'opacity-0 pointer-events-none'}`} />
        <aside id="mobile-menu" ref={panelRef} role="dialog" aria-modal="true" className={`absolute right-0 top-0 h-full w-[82%] max-w-sm bg-gradient-to-br from-[#061016] to-[#081426] shadow-lg transform transition-transform ${open? 'translate-x-0':'translate-x-full'} focus:outline-none`}>
          <div className="px-4 pt-4 pb-6 space-y-3 h-full flex flex-col">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img loading="lazy" src={TBLogo} alt="TouchBack" className="w-9 h-9 object-contain rounded" />
                <span className="text-white font-semibold">TouchBack</span>
              </div>
              <button aria-label="Close menu" onClick={()=> setOpen(false)} className="p-2 rounded-md bg-white/10 hover:bg-white/15 text-white">✕</button>
            </div>

            <nav className="flex flex-col gap-1 mt-3">
              <button ref={firstFocusableRef} onClick={()=>{ setOpen(false); navigate('/products'); }} className="text-left px-3 py-2 rounded-md text-sm w-full text-white hover:bg-white/10">Sản phẩm</button>
              {user && <button onClick={()=>{ setOpen(false); navigate('/memories'); }} className="text-left px-3 py-2 rounded-md text-sm w-full text-white hover:bg-white/10">Memories</button>}
              {user && <button onClick={()=>{ setOpen(false); navigate('/nfc'); }} className="text-left px-3 py-2 rounded-md text-sm w-full text-white hover:bg-white/10">NFC</button>}
              <button onClick={()=>{ setOpen(false); navigate('/cart'); }} className="text-left px-3 py-2 rounded-md text-sm w-full text-white hover:bg-white/10">Giỏ hàng</button>
              {(user && (user.role==='admin' || user.role==='manager')) && <button onClick={()=>{ setOpen(false); navigate('/admin/products'); }} className="text-left px-3 py-2 rounded-md text-sm w-full text-white hover:bg-white/10">Admin</button>}
            </nav>

            <div className="mt-auto border-t border-white/5 pt-3 flex flex-col gap-2">
              {!user ? (
                <>
                  <Link to="/login" onClick={()=>setOpen(false)} className="block w-full text-center px-3 py-2 rounded-md bg-white/20 text-white">Đăng nhập</Link>
                  <Link to="/register" onClick={()=>setOpen(false)} className="block w-full text-center px-3 py-2 rounded-md bg-white/10 text-white">Đăng ký</Link>
                </>
              ) : (
                <>
                  <div className="text-white/90 px-3 text-sm truncate">{user.email || user.role}</div>
                  <button ref={lastFocusableRef} onClick={()=>{ setOpen(false); logout(); navigate('/'); }} className="w-full text-left px-3 py-2 rounded-md bg-white/10 text-white">Thoát</button>
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
