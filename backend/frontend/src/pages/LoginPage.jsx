import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function LoginPage(){
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState(() => (new URLSearchParams(location.search).get('expired') ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' : ''));
  const [loading,setLoading] = useState(false);
  // Declare early so effects below can use it without temporal dead zone
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(()=>{ if(user) navigate(from, { replace:true }); },[user,from,navigate]);

  async function handleSubmit(e){
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await api.post('/auth/login',{ email,password });
      login(res.data.token);
    } catch(e){
      setError(e.response?.data?.message || 'Đăng nhập thất bại');
    } finally { setLoading(false); }
  }

  // Google One Tap credential handler (window scope)
  useEffect(()=>{
    window.handleGoogleCredential = async (credential)=>{
      try {
        const res = await api.post('/auth/google-token',{ credential });
        login(res.data.token);
      } catch(e){
        const msg = e?.response?.data?.message || e?.message || 'Google Sign-In thất bại';
        console.error('Google Sign-In error:', msg);
        setError(msg);
      }
    };
  },[login]);
  
  // Debug: log presence of client id once
  useEffect(()=>{
    if(!googleClientId){
      console.warn('VITE_GOOGLE_CLIENT_ID missing. Create frontend/.env.local with VITE_GOOGLE_CLIENT_ID=... and restart dev server.');
    } else if (import.meta.env.DEV) {
      const mask = (id)=> id ? `${id.slice(0,8)}...${id.slice(-10)}` : '';
      console.log('[Google] Using client id:', mask(googleClientId));
    }
  },[googleClientId]);

  // Ensure Google SDK script is present, then render button with retry
  useEffect(()=>{
    if(!googleClientId) return; // nothing to do
    let attempts = 0;
    const maxAttempts = 12; // ~3.6s total at 300ms intervals
    function tryRender(){
      if(window.google?.accounts?.id){
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (resp)=> window.handleGoogleCredential && window.handleGoogleCredential(resp.credential),
            ux_mode: 'popup'
          });
          const container = document.getElementById('g_id_manual');
            if(container && container.childElementCount === 0){
              window.google.accounts.id.renderButton(container, { theme:'outline', size:'large', shape:'rect', logo_alignment:'left' });
              // optional prompt disabled for now
            }
          return; // success
        } catch(e){
          console.warn('Google render error', e);
          return;
        }
      }
      if(attempts < maxAttempts){
        attempts++;
        setTimeout(tryRender, 300);
      } else {
        console.warn('Google SDK not ready after retries');
      }
    }
    // If for any reason the script tag is missing, insert it
    if(!document.querySelector('script[src^="https://accounts.google.com/gsi/client"]')){
      const s = document.createElement('script');
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true; s.defer = true;
      s.onload = tryRender; s.onerror = ()=> console.warn('Không tải được Google SDK');
      document.head.appendChild(s);
    } else {
      tryRender();
    }
  },[googleClientId]);

  return <div className="max-w-md mx-auto w-full">
    <div className="panel space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight gradient-text">Đăng nhập</h1>
        <p className="text-sm text-muted-foreground">Chào mừng bạn quay lại. Nhập thông tin để tiếp tục.</p>
      </div>
      <ErrorMessage error={error} />
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="label">Email</label>
          <input className="input" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="label">Mật khẩu</label>
            <input type="password" className="input" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button disabled={loading} className="btn btn-primary w-full shadow-sm hover:shadow transition-shadow duration-200">
          {loading?'Đang xử lý...':'Đăng nhập'}
        </button>
      </form>
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Hoặc</span>
          <div className="h-px flex-1 bg-border" />
        </div>  
        <div className="mt-5 space-y-3">
          {googleClientId ? <>
            <div id="g_id_onload"
              data-client_id={googleClientId}
              data-context="signin"
              data-callback="handleGoogleCredential"
              data-ux_mode="popup"
              data-auto_prompt="false"></div>
            <div id="g_id_manual" className="flex"></div>
          </> : <div className="text-xs text-amber-600 dark:text-amber-400">Thiếu biến môi trường VITE_GOOGLE_CLIENT_ID nên Google Sign-In tạm thời ẩn.</div>}
        </div>
      </div>
    </div>
  </div>;
}
