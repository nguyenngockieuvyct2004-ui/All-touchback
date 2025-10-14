import React, { useEffect, useState } from 'react';
import api from '../lib/api.js';

export default function MyOrdersPage(){
  const [orders,setOrders] = useState([]);
  const [loading,setLoading] = useState(true);
  useEffect(()=>{ api.get('/orders/mine').then(r=> setOrders(r.data)).finally(()=> setLoading(false)); },[]);
  if(loading) return <div>Đang tải...</div>;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Đơn hàng của tôi</h1>
      <div className="space-y-4">
        {orders.map(o=> (
          <div key={o._id} className="panel">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <div>#{o._id.slice(-6)} • {new Date(o.createdAt).toLocaleString()}</div>
              <div className="capitalize">{o.status}</div>
            </div>
            <ul className="mt-2 text-sm text-gray-300 list-disc pl-5">
              {o.items.map((i,idx)=> <li key={idx}>{i.name} x {i.quantity} • {(i.price*i.quantity).toLocaleString()} đ</li>)}
            </ul>
            <div className="text-right font-semibold mt-2">Tổng: {o.total.toLocaleString()} đ</div>
          </div>
        ))}
        {!orders.length && <div className="text-sm text-gray-400">Bạn chưa có đơn hàng nào.</div>}
      </div>
    </div>
  );
}
