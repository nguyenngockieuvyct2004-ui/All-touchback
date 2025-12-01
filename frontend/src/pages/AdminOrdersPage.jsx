import React, { useEffect, useState } from 'react';
import api from '../lib/api.js';

const STATUS = ["pending","paid","shipped","completed","cancelled"];

export default function AdminOrdersPage(){
  const [orders,setOrders] = useState([]);
  const [loading,setLoading] = useState(true);
  const [err,setErr] = useState('');

  async function load(){
    try { const r = await api.get('/orders'); setOrders(r.data); } catch(e){ setErr(e.response?.data?.message||'Tải thất bại'); } finally { setLoading(false); }
  }
  useEffect(()=>{ load(); },[]);

  async function changeStatus(o, status){
    const r = await api.put(`/orders/${o._id}/status`, { status });
    setOrders(list=> list.map(x=> x._id===o._id? r.data : x));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Đơn hàng</h1>
        {err && <div className="text-red-600 text-sm mt-2">{err}</div>}
      </div>
      {loading? <div>Đang tải...</div> :
      <div className="space-y-4">
        {orders.map(o=> (
          <div key={o._id} className="rounded-xl border border-white/10 p-4 bg-gray-900/40">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">#{o._id.slice(-6)} • {new Date(o.createdAt).toLocaleString()}</div>
              <select value={o.status} onChange={e=>changeStatus(o, e.target.value)} className="input w-40 bg-white/10 border-white/20 text-white dark:text-white">
                {STATUS.map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="mt-3 grid md:grid-cols-2 gap-3">
              <div>
                <div className="text-xs text-gray-400">Khách hàng</div>
                <div className="text-sm">{o.userId?.email || o.userId}</div>
                <div className="text-xs text-gray-400 mt-1">SĐT: {o.phone||'-'} • Địa chỉ: {o.shippingAddress||'-'}</div>
              </div>
              <div className="text-right font-semibold">Tổng: {o.total.toLocaleString()} đ</div>
            </div>
            <ul className="mt-3 text-sm text-gray-300 list-disc pl-5">
              {o.items.map((i,idx)=> <li key={idx}>{i.name} x {i.quantity} • {(i.price*i.quantity).toLocaleString()} đ</li>)}
            </ul>
          </div>
        ))}
      </div>}
    </div>
  );
}
