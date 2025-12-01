import React, { useState } from 'react';
import api from '../lib/api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function ForgotPasswordPage(){
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e.preventDefault(); setError(''); setSent(false); setLoading(true);
    try {
      await api.post('/auth/forgot',{ email });
      setSent(true);
    } catch(e){
      setError(e.response?.data?.message || 'Gửi yêu cầu thất bại');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-stretch bg-gray-50 dark:bg-gray-950/95">
      <div className="w-full max-w-md mx-auto py-16 px-6">
        <div className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Quên mật khẩu</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Nhập email bạn đã đăng ký. Nếu tồn tại chúng tôi sẽ gửi liên kết đặt lại mật khẩu.</p>
          </div>
          <ErrorMessage error={error} />
          {sent && <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">Nếu email tồn tại chúng tôi đã gửi hướng dẫn đặt lại.</div>}
          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <button disabled={loading} className="btn w-full h-11 font-semibold">{loading? 'Đang gửi...':'Gửi liên kết đặt lại'}</button>
          </form>
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">Nhớ mật khẩu? <a href="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Đăng nhập</a></p>
        </div>
      </div>
    </div>
  );
}
