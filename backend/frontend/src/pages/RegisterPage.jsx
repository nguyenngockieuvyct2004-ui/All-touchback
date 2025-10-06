import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage(){
  const { login } = useAuth();
  const navigate = useNavigate();
  const [fullName,setFullName] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [confirm,setConfirm] = useState('');
  const [error,setError] = useState('');
  const [success,setSuccess] = useState(false);
  const [loading,setLoading] = useState(false);
  const [showPw,setShowPw] = useState(false);
  const [showPw2,setShowPw2] = useState(false);

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
  const strongEnough = strength >= 4;

  const unmet = useMemo(()=>{
    const list = [];
    if(password.length < 8) list.push('≥8 ký tự');
    if(!/[a-z]/.test(password)) list.push('chữ thường');
    if(!/[A-Z]/.test(password)) list.push('chữ hoa');
    if(!/\d/.test(password)) list.push('số');
    if(!/[^A-Za-z0-9]/.test(password)) list.push('ký tự đặc biệt');
    return list;
  },[password]);

  async function submit(e){
    e.preventDefault(); setError(''); setSuccess(false);
    if(!fullName.trim()) return setError('Vui lòng nhập họ tên');
    if(!email.trim()) return setError('Vui lòng nhập email');
    if(password.length < 8) return setError('Mật khẩu tối thiểu 8 ký tự');
    if(!strongEnough) return setError('Mật khẩu chưa đủ mạnh');
    if(password !== confirm) return setError('Mật khẩu xác nhận không khớp');
    setLoading(true);
    try {
      const res = await api.post('/auth/register',{ fullName, email: email.toLowerCase(), password });
      if(res.data?.token){
        login(res.data.token);
        setSuccess(true);
        setTimeout(()=>navigate('/'), 600);
      } else setError('Thiếu token trả về');
    } catch(e){
      setError(e.response?.data?.message || 'Đăng ký thất bại');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] w-full flex items-stretch bg-gray-50 dark:bg-gray-950/95">
      <div className="w-full grid md:grid-cols-2 max-w-7xl mx-auto bg-white dark:bg-gray-900 border-y md:border md:rounded-none md:rounded-2xl border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm md:shadow-lg">
        {/* Left reuse hologram panel for brand narrative */}
  <div className="hidden md:flex items-center justify-center p-10 relative holo-outline-blue min-w-[420px] flex-shrink-0">
          <div className="holo-inner"></div>
          <div className="relative z-10 text-center space-y-6 max-w-md">
            <h1 className="text-3xl font-bold tracking-tight panel-text-heading">Tạo tài khoản mới</h1>
            <p className="text-sm leading-relaxed panel-text-body">Chỉ vài bước để bạn bắt đầu lưu giữ kỷ niệm & kết nối qua danh thiếp NFC.</p>
            <div className="flex flex-col gap-3 pt-2 text-left text-xs panel-feature">
              <div className="flex items-start gap-2"><span className="text-cyan-500 dark:text-cyan-400 mt-0.5">✨</span><span>Quản lý kỷ niệm đa phương tiện</span></div>
              <div className="flex items-start gap-2"><span className="text-cyan-500 dark:text-cyan-400 mt-0.5">🔗</span><span>Chia sẻ danh thiếp NFC & vCard</span></div>
              <div className="flex items-start gap-2"><span className="text-cyan-500 dark:text-cyan-400 mt-0.5">🤖</span><span>Trợ lý AI hỗ trợ nhanh</span></div>
              <div className="flex items-start gap-2"><span className="text-cyan-500 dark:text-cyan-400 mt-0.5">🛡️</span><span>Bảo mật & kiểm soát dữ liệu</span></div>
            </div>
          </div>
        </div>
        {/* Right form side */}
        <div className="flex items-center justify-center px-6 sm:px-10 py-12">
          <div className="w-full max-w-sm space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-semibold text-lg text-indigo-600 dark:text-indigo-400">
                <span className="inline-flex w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-sky-400" />
                <span>TouchBack</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">Đăng ký tài khoản <span>🚀</span></h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">Điền thông tin bên dưới để bắt đầu.</p>
            </div>
            <ErrorMessage error={error} />
            {success && <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-900 dark:text-emerald-300">Tạo tài khoản thành công! Đang chuyển hướng...</div>}
            <form onSubmit={submit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="label">Họ tên</label>
                <input className="input" value={fullName} onChange={e=>setFullName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="label">Email</label>
                <input className="input" type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="label">Mật khẩu</label>
                <div className="relative">
                  <input type={showPw ? 'text':'password'} className="input pr-10" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} required />
                  <button type="button" onClick={()=>setShowPw(s=>!s)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label={showPw?'Ẩn mật khẩu':'Hiện mật khẩu'}>{showPw?'👀':'🙈'}</button>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded bg-gray-200 dark:bg-gray-800 overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strength<=1?'bg-red-500':strength===2?'bg-amber-500':strength===3?'bg-yellow-500':strength===4?'bg-emerald-500':'bg-green-600'}`} style={{ width: `${(strength/5)*100}%` }} />
                  </div>
                  <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 min-w-[54px] text-right">{strengthLabel}</span>
                </div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-snug">Yêu cầu: ≥8 ký tự, chữ hoa, chữ thường, số & ký tự đặc biệt.</p>
                {password && unmet.length > 0 && <ul className="mt-1 space-y-0.5 text-[10px] text-red-500 dark:text-red-400 list-disc list-inside">
                  {unmet.map(item=> <li key={item}>{item}</li>)}
                </ul>}
              </div>
              <div className="space-y-1.5">
                <label className="label">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input type={showPw2 ? 'text':'password'} className="input pr-10" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} required />
                  <button type="button" onClick={()=>setShowPw2(s=>!s)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label={showPw2?'Ẩn mật khẩu':'Hiện mật khẩu'}>{showPw2?'👀':'🙈'}</button>
                </div>
              </div>
              <button disabled={loading} className="btn w-full h-11 font-semibold">
                {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
              </button>
            </form>
            <div className="space-y-6">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">Đã có tài khoản? <a href="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Đăng nhập</a></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
