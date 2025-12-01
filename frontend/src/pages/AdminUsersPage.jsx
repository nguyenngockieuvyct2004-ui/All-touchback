import React, { useEffect, useState } from 'react';
import api from '../lib/api.js';

export default function AdminUsersPage(){
  const [list,setList] = useState([]);
  const [loading,setLoading] = useState(true);
  const [err,setErr] = useState('');
  const [creating,setCreating] = useState(false);
  const [form,setForm] = useState({ fullName:'', email:'', password:'', role:'customer', isActive:true });

  async function load(){
    try { const r = await api.get('/admin/users'); setList(r.data); } catch(e){ setErr(e.response?.data?.message||'Tải thất bại'); } finally { setLoading(false); }
  }
  useEffect(()=>{ load(); },[]);

  async function create(e){ e.preventDefault(); setCreating(true); setErr('');
    try { const r = await api.post('/admin/users', form); setList(l=>[r.data, ...l]); setForm({ fullName:'', email:'', password:'', role:'customer', isActive:true }); }
    catch(e){ setErr(e.response?.data?.message||'Tạo thất bại'); }
    finally { setCreating(false); }
  }

  async function toggle(u){
    const r = await api.put(`/admin/users/${u._id||u.id}/active`, { isActive: !u.isActive });
    setList(l=> l.map(x=> (x._id===u._id||x.id===u.id) ? { ...x, isActive: r.data.isActive } : x));
  }

  async function remove(u){
    if(!confirm('Xoá tài khoản này?')) return;
    await api.delete(`/admin/users/${u._id||u.id}`);
    setList(l=> l.filter(x=> (x._id||x.id)!==(u._id||u.id)));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Quản lý người dùng</h1>
        {err && <div className="text-red-600 text-sm mt-2">{err}</div>}
      </div>

      <form onSubmit={create} className="grid md:grid-cols-6 gap-3 bg-gray-900/40 border border-white/10 p-4 rounded-xl">
        <input className="input md:col-span-2" placeholder="Họ tên" value={form.fullName} onChange={e=>setForm({...form, fullName:e.target.value})} />
        <input className="input md:col-span-2" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
        <input type="password" className="input" placeholder="Mật khẩu" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
        <select className="input" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
          <option value="customer">Customer</option>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
        </select>
        <label className="flex items-center gap-2 text-xs text-gray-300">
          <input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form, isActive:e.target.checked})} /> Active
        </label>
        <button disabled={creating} className="btn md:col-span-1">{creating?'Đang tạo...':'Tạo mới'}</button>
      </form>

      {loading? <div>Đang tải...</div> :
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-900/60 text-gray-300">
            <tr>
              <th className="px-3 py-2 text-left">Họ tên</th>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {list.map(u=> (
              <tr key={u._id||u.id} className="border-t border-white/10">
                <td className="px-3 py-2">{u.fullName}</td>
                <td className="px-3 py-2 text-gray-300">{u.email}</td>
                <td className="px-3 py-2 text-center">{u.role}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs ${u.isActive? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>{u.isActive? 'Active':'Inactive'}</span>
                </td>
                <td className="px-3 py-2 text-right space-x-2">
                  <button onClick={()=>toggle(u)} className="btn btn-outline btn-xs">{u.isActive? 'Deactivate':'Activate'}</button>
                  <button onClick={()=>remove(u)} className="btn btn-outline btn-xs border-red-400 text-red-400">Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </div>
  );
}
