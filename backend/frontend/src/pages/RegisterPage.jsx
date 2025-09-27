import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage(){
  const { login } = useAuth();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [fullName,setFullName] = useState('');
  const [error,setError] = useState('');
  const [success,setSuccess] = useState(false);
  const [loading,setLoading] = useState(false);
  const navigate = useNavigate();

  async function submit(e){
    e.preventDefault(); setError(''); setSuccess(false);
    if(!fullName.trim()) return setError('Vui lòng nhập họ tên');
    if(!email.trim()) return setError('Vui lòng nhập email');
    if(password.length < 6) return setError('Mật khẩu tối thiểu 6 ký tự');
    setLoading(true);
    try {
      const res = await api.post('/auth/register',{ fullName, email, password });
      // Auto login: store token then navigate home
      if(res.data?.token){
        login(res.data.token);
        setSuccess(true);
        setTimeout(()=>navigate('/'), 500);
      } else {
        setError('Thiếu token trả về');
      }
    } catch(e){
      setError(e.response?.data?.message || 'Đăng ký thất bại');
    } finally { setLoading(false); }
  }

  return <div className="max-w-md mx-auto w-full">
    <div className="panel space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight gradient-text">Đăng ký</h1>
        <p className="text-sm text-muted-foreground">Tạo tài khoản mới để bắt đầu trải nghiệm.</p>
      </div>
      <ErrorMessage error={error} />
      {error && error.includes('Network') && (
        <div className="p-3 rounded-md bg-amber-50 border border-amber-200 text-[11px] text-amber-700 dark:bg-amber-950/40 dark:border-amber-900 dark:text-amber-300">
          Không kết nối được server. Hãy kiểm tra backend có chạy ở cổng 3000 không và biến VITE_API_BASE có khớp.
        </div>
      )}
      {success && <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">Tạo tài khoản thành công! Đang chuyển hướng...</div>}
      <form onSubmit={submit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="label">Họ tên</label>
          <input className="input" value={fullName} onChange={e=>setFullName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="label">Email</label>
          <input className="input" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <label className="label">Mật khẩu</label>
          <input type="password" className="input" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} />
        </div>
        <button disabled={loading} className="btn btn-primary w-full shadow-sm hover:shadow transition-shadow duration-200">
          {loading?'Đang xử lý...':'Tạo tài khoản'}
        </button>
      </form>
    </div>
  </div>;
}
