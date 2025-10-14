import React, { useEffect, useMemo, useState } from 'react';
import api from '../lib/api.js';

function HoloCard({ title, value, delta, accent="from-cyan-400 to-fuchsia-500" }){
  return (
    <div className="relative rounded-xl p-5 bg-[#0e1424] border border-white/10 overflow-hidden">
      <div className={`absolute -inset-1 opacity-25 blur-2xl bg-gradient-to-br ${accent}`}></div>
      <div className="relative">
        <div className="text-xs text-white/60">{title}</div>
        <div className="mt-1 text-2xl font-semibold text-white">{value}</div>
        {typeof delta !== 'undefined' && <div className={`text-[11px] mt-1 ${delta>=0? 'text-emerald-400':'text-rose-400'}`}>{delta>=0? '▲' : '▼'} {Math.abs(delta)}%</div>}
      </div>
    </div>
  );
}

// very lightweight area chart
function AreaSpark({ data, max }){
  const points = data.map((v,i)=> `${(i/(data.length-1))*100},${100 - (v/max)*100}`).join(' ');
  return (
    <svg viewBox="0 0 100 40" className="w-full h-24">
      <polyline points={points} fill="none" stroke="url(#g)" strokeWidth="2" />
      <defs>
        <linearGradient id="g" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function BarChart({ data }){
  const max = Math.max(1, ...data.map(d=> d.revenue));
  return (
    <div className="grid grid-cols-12 gap-2 items-end h-40">
      {data.map((d,i)=>{
        const h = Math.max(4, (d.revenue/max)*140);
        return <div key={i} className="flex flex-col items-center gap-1">
          <div className="w-4 rounded-sm bg-gradient-to-t from-indigo-600 to-cyan-400" style={{height: h}} />
          <div className="text-[10px] text-white/60">{d.month}</div>
        </div>;
      })}
    </div>
  );
}

export default function AdminDashboardPage(){
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);
  const [err,setErr] = useState('');
  const [range,setRange] = useState('12m');
  useEffect(()=>{
    // optional range param in future
    api.get('/stats/dashboard')
      .then(r=> setData(r.data))
      .catch(e=> setErr(e.response?.data?.message||'Tải thất bại'))
      .finally(()=> setLoading(false));
  },[range]);

  const monthSeries = useMemo(()=>{
    if(!data?.byMonth) return [];
    // Format last 12 months labels
    return data.byMonth.map(d=> ({
      month: `${String(d.month).padStart(2,'0')}/${String(d.year).slice(-2)}`,
      revenue: d.revenue,
      orders: d.orders,
    }));
  },[data]);

  const sparkValues = useMemo(()=> monthSeries.map(m=> m.revenue), [monthSeries]);
  const sparkMax = useMemo(()=> Math.max(1, ...sparkValues), [sparkValues]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-white/60">Tổng quan cửa hàng</p>
        </div>
        <div>
          <select value={range} onChange={e=>setRange(e.target.value)} className="input bg-white/10 border-white/10">
            <option value="3m">3 tháng</option>
            <option value="6m">6 tháng</option>
            <option value="12m">12 tháng</option>
          </select>
        </div>
      </div>
      {loading ? <div>Đang tải...</div> : err ? <div className="text-rose-400">{err}</div> : (
        <>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <HoloCard title="Doanh thu" value={(data.summary.revenue||0).toLocaleString()+" đ"} delta={+12.6} accent="from-amber-400 to-rose-500" />
              <AreaSpark data={sparkValues.length? sparkValues : [0,0,0,0,0,0]} max={sparkMax} />
            </div>
            <HoloCard title="Đơn hàng" value={data.summary.orders} delta={-0.82} accent="from-indigo-500 to-cyan-500" />
            <HoloCard title="Khách hàng" value={data.summary.users} delta={+6.24} accent="from-emerald-500 to-cyan-500" />
            <HoloCard title="Sản phẩm" value={data.summary.products} delta={+10.51} accent="from-fuchsia-500 to-pink-500" />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 rounded-xl border border-white/10 bg-[#0e1424] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-semibold">Sales Analytics</div>
                <div className="text-xs text-white/50">12 tháng gần nhất</div>
              </div>
              <BarChart data={monthSeries} />
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0e1424] p-4">
              <div className="font-semibold mb-3">Top Selling Products</div>
              <ul className="space-y-2 text-sm">
                {data.topProducts.map((p,i)=> (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-white/80 truncate max-w-[60%]">{p.name}</span>
                    <span className="text-white/60">{p.quantity} sp • {(p.amount||0).toLocaleString()} đ</span>
                  </li>
                ))}
                {!data.topProducts.length && <li className="text-white/40">Chưa có dữ liệu</li>}
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-[#0e1424] p-4">
              <div className="font-semibold mb-3">Recent Activity</div>
              <ul className="space-y-2 text-sm">
                {data.recentOrders.map(o=> (
                  <li key={o._id} className="flex items-center justify-between">
                    <span className="text-white/80">Order #{o._id.slice(-6)}</span>
                    <span className="text-white/60 capitalize">{o.status}</span>
                  </li>
                ))}
                {!data.recentOrders.length && <li className="text-white/40">Chưa có hoạt động</li>}
              </ul>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#0e1424] p-4">
              <div className="font-semibold mb-3">Top Users</div>
              <div className="text-sm text-white/50">Sẽ hiển thị khách hàng mua nhiều nhất (cần mở rộng API)</div>
              <ul className="mt-2 space-y-2 text-sm">
                {(data.topUsers||[]).map(u=> (
                  <li key={u.id} className="flex items-center justify-between">
                    <span>{u.email}</span>
                    <span className="text-white/60">{u.total.toLocaleString()} đ</span>
                  </li>
                ))}
                {!data.topUsers && <li className="text-white/40">Chưa có dữ liệu</li>}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
