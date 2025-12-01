import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import api from '../lib/api.js';
import { Routes, Route } from 'react-router-dom';

function SideLink({ to, children }){
  return (
    <NavLink to={to} end className={({isActive})=>
      'flex items-center gap-2 px-3 py-2 rounded-md text-sm transition ' +
      (isActive ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white')
    }>
      {children}
    </NavLink>
  );
}

export default function AdminLayout(){
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [newContacts, setNewContacts] = useState(0);
  const [newOrders, setNewOrders] = useState(0);

  useEffect(()=>{
    let mounted = true;
    const load = async ()=>{
      try{
        const r = await api.get('/contact', { params: { status: 'new', limit: 1 } });
        if(mounted) setNewContacts(Number(r.data?.total||0));
      }catch{ /* silent */ }
    };
    load();
    const onSignal = ()=> load();
    window.addEventListener('tb-contacts-updated', onSignal);
    const iv = setInterval(load, 60000);
    return ()=>{ mounted=false; window.removeEventListener('tb-contacts-updated', onSignal); clearInterval(iv); };
  },[]);

  // Poll orders to show new orders badge (e.g. pending orders)
  useEffect(()=>{
    let mounted = true;
    const loadOrders = async ()=>{
      try{
        const r = await api.get('/orders');
        if(!mounted) return;
        const list = Array.isArray(r.data) ? r.data : [];
        const pending = list.filter(o=> o.status === 'pending').length;
        setNewOrders(pending);
      }catch{}
    };
    loadOrders();
    const onSignal = ()=> loadOrders();
    window.addEventListener('tb-orders-updated', onSignal);
    const iv = setInterval(loadOrders, 60000);
    return ()=>{ mounted=false; window.removeEventListener('tb-orders-updated', onSignal); clearInterval(iv); };
  },[]);
  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-[#0a0f1f] border-r border-white/10 p-4 flex flex-col">
        {/* Brand + user */}
        <div className="space-y-3">
          <div className="font-bold text-lg tracking-tight">TouchBack Admin</div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500" />
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">{user?.email || 'Admin'}</div>
              <div className="text-[11px] text-white/60 truncate">{user?.role || 'admin'}</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="mt-4 flex-1 space-y-1 overflow-auto">
          <SideLink to="/admin">Dashboard</SideLink>
          <SideLink to="/admin/orders">
            <span className="flex-1">Orders</span>
            {newOrders>0 && (
              <span className="ml-auto inline-flex min-w-[1.25rem] h-5 px-1.5 items-center justify-center rounded-full text-[11px] bg-rose-500 text-white">
                {newOrders>99?'99+':newOrders}
              </span>
            )}
          </SideLink>
          <SideLink to="/admin/products">Products</SideLink>
          <SideLink to="/admin/users">Users</SideLink>
          <SideLink to="/admin/contacts">
            <span className="flex-1">Contacts</span>
            {newContacts>0 && (
              <span className="ml-auto inline-flex min-w-[1.25rem] h-5 px-1.5 items-center justify-center rounded-full text-[11px] bg-rose-500 text-white">
                {newContacts>99?'99+':newContacts}
              </span>
            )}
          </SideLink>
        </nav>

        {/* Bottom controls */}
        <div className="pt-3 border-t border-white/10">
          <div className="mb-3">
            <ThemeToggle />
          </div>
          <button onClick={()=>{ logout(); navigate('/'); }} className="w-full h-10 rounded-md border border-white/20 hover:border-white/40 bg-white/10">Logout</button>
        </div>
      </div>

      {/* Content */}
      <div className="pl-64">
        {/* Decorative header strip only (no controls) */}
        <header className="h-14 border-b border-white/10 relative overflow-hidden">
          <div className="absolute inset-0 holo-gradient opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <div className="absolute inset-0 bg-black/30 backdrop-blur" />
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
