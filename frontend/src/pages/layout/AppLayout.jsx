import React from 'react';
import { Link, Outlet } from 'react-router-dom';

export default function AppLayout(){
  return (
    <div>
      <header style={{padding:'12px', borderBottom:'1px solid #ddd'}}>
        <strong>TouchBack</strong>
        <nav style={{marginTop:8}}>
          <Link to="/" style={{marginRight:12}}>Home</Link>
          <Link to="/products" style={{marginRight:12}}>Products</Link>
          <Link to="/profile" style={{marginRight:12}}>Profile</Link>
          <Link to="/contact" style={{marginRight:12}}>Contact</Link>
          <Link to="/cart" style={{marginRight:12}}>Cart</Link>
        </nav>
      </header>
      <main style={{padding:24}}>
        <Outlet />
      </main>
    </div>
  );
}
