import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function ResetPasswordPage(){
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token') || '';
  const [password,setPassword] = useState('');
  const [confirm,setConfirm] = useState('');
  const [error,setError] = useState('');
  const [success,setSuccess] = useState(false);
  const [loading,setLoading] = useState(false);
  const [showPw,setShowPw] = useState(false);
  const [showPw2,setShowPw2] = useState(false);

  useEffect(()=>{ if(!token) setError('Thiếu token'); },[token]);

  const strength = useMemo(()=>{
    if(!password) return 0;
    let score = 0;
    if(password.length >= 8) score++;
    if(/[a-z]/.test(password)) score++;
    if(/[A-Z]/.test(password)) score++;
  if(/\d/.test(password)) score++;
    if(/[^A-Za-z0-9]/.test(password)) score++;
    return score; // 0-5
  },[password]);

  const strengthLabel = ['Rất yếu','Yếu','Trung bình','Khá','Mạnh','Rất mạnh'][strength];
  const strongEnough = strength >= 4; // need at least 4 criteria

  async function submit(e){
    e.preventDefault(); setError(''); setSuccess(false);
    if(password.length < 8) return setError('Mật khẩu tối thiểu 8 ký tự');
    if(!strongEnough) return setError('Mật khẩu chưa đủ mạnh');
    if(password !== confirm) return setError('Mật khẩu xác nhận không khớp');
    setLoading(true);
    try {
      const res = await api.post('/auth/reset',{ token, password });
      setSuccess(true);
      if(res.data?.token){
        login(res.data.token);
        setTimeout(()=> navigate('/'), 800);
      }
    } catch(e){
      setError(e.response?.data?.message || 'Đặt lại thất bại');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-stretch bg-gray-50 dark:bg-gray-950/95">
      <div className="w-full max-w-md mx-auto py-16 px-6">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Đặt lại mật khẩu</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Nhập mật khẩu mới cho tài khoản của bạn.</p>
          </div>
          <ErrorMessage error={error} />
            {success && <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">Đặt lại thành công! Đang chuyển hướng...</div>}
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="label">Mật khẩu mới</label>
              <div className="relative">
                <input type={showPw?'text':'password'} className="input pr-10" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} required />
                <button type="button" onClick={()=>setShowPw(s=>!s)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label={showPw?'Ẩn mật khẩu':'Hiện mật khẩu'}>{showPw?'👀':'🙈'}</button>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="flex-1 h-1.5 rounded bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strength<=1?'bg-red-500':strength===2?'bg-amber-500':strength===3?'bg-yellow-500':strength===4?'bg-emerald-500':'bg-green-600'}`} style={{ width: `${(strength/5)*100}%` }} />
                </div>
                <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 min-w-[54px] text-right">{strengthLabel}</span>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-snug">Yêu cầu: ≥8 ký tự, chữ hoa, chữ thường, số & ký tự đặc biệt, và khác mật khẩu cũ.</p>
            </div>
            <div className="space-y-1.5">
              <label className="label">Xác nhận mật khẩu</label>
              <div className="relative">
                <input type={showPw2?'text':'password'} className="input pr-10" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} required />
                <button type="button" onClick={()=>setShowPw2(s=>!s)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label={showPw2?'Ẩn mật khẩu':'Hiện mật khẩu'}>{showPw2?'👀':'🙈'}</button>
              </div>
            </div>
            <button disabled={loading || !token} className="btn w-full h-11 font-semibold">{loading? 'Đang đặt lại...':'Cập nhật mật khẩu'}</button>
          </form>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">Quay lại <a href="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Đăng nhập</a></p>
        </div>
      </div>
    </div>
  );
}
