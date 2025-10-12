import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
// Illustration removed; using hologram outline panel instead

export default function LoginPage(){
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState(() => (new URLSearchParams(location.search).get('expired') ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' : ''));
  const [loading,setLoading] = useState(false);
  const [showPassword,setShowPassword] = useState(false);
  const togglePw = ()=> setShowPassword(s=>!s);
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

  return (
      <div className="min-h-[calc(100vh-4rem)] w-full flex items-stretch bg-gray-50 dark:bg-gray-950/95">
        <div className="w-full grid md:grid-cols-2 max-w-7xl mx-auto bg-white dark:bg-gray-900 border-y md:border md:rounded-none md:rounded-2xl border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm md:shadow-lg">
          {/* Left hologram side (black background + animated blue border) */}
          <div className="hidden md:flex items-center justify-center p-10 relative holo-outline-blue md:min-w-[420px] flex-shrink-0">
            <div className="holo-inner"></div>
            <div className="relative z-10 text-center space-y-6 max-w-md">
              <h1 className="text-3xl font-bold tracking-tight panel-text-heading">Chào mừng quay lại</h1>
              <p className="text-sm leading-relaxed panel-text-body">Đăng nhập để tiếp tục quản lý kỷ niệm, danh thiếp NFC và trải nghiệm trợ lý AI.</p>
              <div className="flex flex-col gap-3 pt-2 text-left text-xs panel-feature">
                <div className="flex items-start gap-2"><span className="text-cyan-500 dark:text-cyan-400 mt-0.5">✔</span><span>Lưu & chia sẻ kỷ niệm đa phương tiện</span></div>
                <div className="flex items-start gap-2"><span className="text-cyan-500 dark:text-cyan-400 mt-0.5">✔</span><span>Danh thiếp NFC + vCard</span></div>
                <div className="flex items-start gap-2"><span className="text-cyan-500 dark:text-cyan-400 mt-0.5">✔</span><span>Trợ lý AI linh hoạt</span></div>
                <div className="flex items-start gap-2"><span className="text-cyan-500 dark:text-cyan-400 mt-0.5">✔</span><span>Giao diện tối ưu & mượt</span></div>
              </div>
            </div>
          </div>
          {/* Form side */}
          <div className="flex items-center justify-center px-6 sm:px-10 py-12">
            <div className="w-full max-w-sm space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-lg text-indigo-600 dark:text-indigo-400">
                  <span className="inline-flex w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-sky-400" />
                  <span>TouchBack</span>
                </div>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">Chào mừng quay lại <span>👋</span></h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Vui lòng đăng nhập để bắt đầu trải nghiệm.</p>
              </div>
              <ErrorMessage error={error} />
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="label">Email</label>
                  <input className="input" placeholder="you@example.com" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <label className="label">Mật khẩu</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text':'password'}
                      className="input pr-10"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      value={password}
                      onChange={e=>setPassword(e.target.value)}
                      required
                    />
                    <button type="button" onClick={togglePw} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label={showPassword?'Ẩn mật khẩu':'Hiện mật khẩu'}>
                      {showPassword ? '👀' : '🙈'}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <label className="inline-flex items-center gap-2 select-none text-gray-600 dark:text-gray-400"><input type="checkbox" className="rounded border-gray-300 dark:border-gray-600 text-indigo-600 focus:ring-indigo-500" /> Nhớ tôi</label>
                  <a href="/forgot-password" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Quên mật khẩu?</a>
                </div>
                <button disabled={loading} className="btn w-full h-11 font-semibold">
                  {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                </button>
              </form>
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                  <span className="text-[11px] uppercase tracking-wider font-medium text-gray-500 dark:text-gray-500">Hoặc</span>
                  <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800" />
                </div>
                <div className="flex flex-col items-center gap-4 -mt-1">
                  {googleClientId ? <>
                    <div id="g_id_onload"
                      data-client_id={googleClientId}
                      data-context="signin"
                      data-callback="handleGoogleCredential"
                      data-ux_mode="popup"
                      data-auto_prompt="false"></div>
                    <div id="g_id_manual" className="flex justify-center" />
                  </> : <div className="text-xs text-amber-600 dark:text-amber-400">Thiếu biến môi trường Google Sign-In</div>}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="inline-flex w-8 h-8 items-center justify-center rounded border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">f</span>
                    <span className="inline-flex w-8 h-8 items-center justify-center rounded border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">𝕏</span>
                    <span className="inline-flex w-8 h-8 items-center justify-center rounded border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">GH</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Chưa có tài khoản? <a href="/register" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Tạo tài khoản</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}
