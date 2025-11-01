import React, { useEffect, useState } from 'react';
import api from '../lib/api.js';

export default function AdminContactsPage(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('desc');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const limit = 10;

  const fetchData = ()=>{
    setLoading(true);
    api.get('/contact', { params: { page, limit, status, q: debouncedQ, sort } })
      .then(r=> { setItems(r.data.items||[]); setTotal(r.data.total||0); })
      .catch(e=> setError(e.response?.data?.message || e.message))
      .finally(()=> setLoading(false));
  };

  useEffect(()=>{ fetchData(); }, [page, status, debouncedQ, sort]);

  // debounce search
  useEffect(()=>{
    const t = setTimeout(()=> setDebouncedQ(q.trim()), 350);
    return ()=> clearTimeout(t);
  }, [q]);

  const updateMsgStatus = async (id, status)=>{
    await api.patch(`/contact/${id}`, { status });
    fetchData();
    try { window.dispatchEvent(new Event('tb-contacts-updated')); } catch {}
  };

  const totalPages = Math.max(1, Math.ceil(total/limit));

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h1 className="text-xl font-semibold">Liên hệ</h1>
        <div className="flex items-center gap-2">
          <select value={status} onChange={(e)=>{ setPage(1); setStatus(e.target.value); }} className="h-9 px-3 rounded bg-white/10 border border-white/20">
            <option value="all">Tất cả</option>
            <option value="new">Mới</option>
            <option value="read">Đã đọc</option>
            <option value="closed">Đóng</option>
          </select>
          <select value={sort} onChange={(e)=>{ setPage(1); setSort(e.target.value); }} className="h-9 px-3 rounded bg-white/10 border border-white/20">
            <option value="desc">Mới nhất</option>
            <option value="asc">Cũ nhất</option>
          </select>
          <input value={q} onChange={(e)=>{ setPage(1); setQ(e.target.value); }} placeholder="Tìm theo tên, email, SĐT, nội dung..." className="h-9 px-3 rounded bg-white/10 border border-white/20 placeholder-white/50" />
        </div>
      </div>
      {loading && <div className="text-white/70">Đang tải...</div>}
      {error && <div className="text-red-400">{error}</div>}

      {!loading && !error && (
        <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-white/70">
              <tr>
                <th className="text-left px-4 py-3">Người gửi</th>
                <th className="text-left px-4 py-3">Email</th>
                <th className="text-left px-4 py-3">Số điện thoại</th>
                <th className="text-left px-4 py-3">Chủ đề</th>
                <th className="text-left px-4 py-3">Nội dung</th>
                <th className="text-left px-4 py-3">Thời gian</th>
                <th className="text-left px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3"/>
              </tr>
            </thead>
            <tbody>
              {items.map(m => (
                <tr key={m._id} className="border-t border-white/10">
                  <td className="px-4 py-3">{m.name}</td>
                  <td className="px-4 py-3">{m.email}</td>
                  <td className="px-4 py-3">{m.phone ? (<a className="text-blue-300 hover:underline" href={`tel:${String(m.phone).replace(/\s+/g,'')}`}>{m.phone}</a>) : '-'}</td>
                  <td className="px-4 py-3">{m.subject || '-'}</td>
                  <td className="px-4 py-3 max-w-[380px]"><div className="line-clamp-2 text-white/90">{m.message}</div></td>
                  <td className="px-4 py-3">{new Date(m.createdAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs ${m.status==='new'?'bg-blue-500/20 text-blue-300': m.status==='read'?'bg-yellow-500/20 text-yellow-300':'bg-green-500/20 text-green-300'}`}>{m.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      {m.status!=='read' && <button className="px-3 h-8 rounded bg-white/10 hover:bg-white/20" onClick={()=> updateMsgStatus(m._id,'read')}>Đã đọc</button>}
                      {m.status!=='closed' && <button className="px-3 h-8 rounded bg-white/10 hover:bg-white/20" onClick={()=> updateMsgStatus(m._id,'closed')}>Đóng</button>}
                    </div>
                  </td>
                </tr>
              ))}
              {!items.length && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-white/50">Chưa có liên hệ</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="text-white/60 text-sm">Tổng: {total}</div>
        <div className="flex items-center gap-2">
          <button disabled={page<=1} onClick={()=> setPage(p=> Math.max(1,p-1))} className="px-3 h-9 rounded bg-white/10 disabled:opacity-40">Trước</button>
          <div className="text-sm text-white/70">{page}/{totalPages}</div>
          <button disabled={page>=totalPages} onClick={()=> setPage(p=> Math.min(totalPages,p+1))} className="px-3 h-9 rounded bg-white/10 disabled:opacity-40">Sau</button>
        </div>
      </div>
    </div>
  );
}
