import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }){
  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(true);

  useEffect(()=>{
    const stored = localStorage.getItem('jwt');
    if(stored){
      // optionally fetch profile; for now decode payload lightly
      try {
        const payload = JSON.parse(atob(stored.split('.')[1]));
        const now = Math.floor(Date.now()/1000);
        if(payload?.exp && payload.exp <= now){
          localStorage.removeItem('jwt');
        } else {
          setUser({ id: payload.sub, role: payload.role, email: payload.email });
        }
      } catch(_){
        // if decode fails, remove token to avoid bad state
        localStorage.removeItem('jwt');
      }
    }
    setLoading(false);
  },[]);

  const login = useCallback((token)=>{
    localStorage.setItem('jwt', token);
    try { const payload = JSON.parse(atob(token.split('.')[1])); setUser({ id: payload.sub, role: payload.role, email: payload.email }); } catch {}
  },[]);

  const logout = useCallback(()=>{
    localStorage.removeItem('jwt');
    setUser(null);
  },[]);

  return <AuthContext.Provider value={{ user, login, logout, loading }}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth(){ return useContext(AuthContext); }
