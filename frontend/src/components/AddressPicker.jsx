import React, { useEffect, useMemo, useState } from 'react';
import { loadVnAddress } from '../lib/vnAddress.js';

export default function AddressPicker({ value, onChange, errors = {} }){
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);
  const [province,setProvince] = useState('');
  const [district,setDistrict] = useState('');
  const [ward,setWard] = useState('');
  const [detail,setDetail] = useState('');

  // hydrate from value (if any)
  useEffect(()=>{
    if(!value) return;
    const parts = value.split('|');
    if(parts.length >= 4){
      setProvince(parts[0]||'');
      setDistrict(parts[1]||'');
      setWard(parts[2]||'');
      setDetail(parts.slice(3).join('|')||'');
    }
  },[value]);

  useEffect(()=>{ (async ()=>{
    try{ const d = await loadVnAddress(); setData(d);} finally{ setLoading(false);} })(); },[]);

  const districts = useMemo(()=> data && province ? (data.districtsByProvince?.[province]||[]) : [], [data, province]);
  const wards = useMemo(()=> data && district ? (data.wardsByDistrict?.[district]||[]) : [], [data, district]);

  useEffect(()=>{ if(onChange){ onChange([province,district,ward,detail].join('|')); } }, [province,district,ward,detail]);

  if(loading) return <div className="text-sm text-muted-foreground">Đang tải địa chỉ...</div>;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Tỉnh/Thành phố</label>
          <select className={`input ${errors.province ? 'border-red-500' : ''}`} value={province} onChange={e=>{ setProvince(e.target.value); setDistrict(''); setWard(''); }}>
            <option value="">Chọn Tỉnh/Thành phố</option>
            {data?.provinces?.map(p=> <option key={p.code} value={p.code}>{p.name}</option>)}
          </select>
          {errors.province && <p className="text-xs text-red-500 mt-1">{errors.province}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Quận/Huyện</label>
          <select className={`input ${errors.district ? 'border-red-500' : ''}`} value={district} onChange={e=>{ setDistrict(e.target.value); setWard(''); }} disabled={!province}>
            <option value="">Chọn Quận/Huyện</option>
            {districts.map(d=> <option key={d.code} value={d.code}>{d.name}</option>)}
          </select>
          {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Xã/Phường/Thị trấn</label>
          <select className={`input ${errors.ward ? 'border-red-500' : ''}`} value={ward} onChange={e=> setWard(e.target.value)} disabled={!district}>
            <option value="">Chọn Xã/Phường/Thị trấn</option>
            {wards.map(w=> <option key={w.code} value={w.code}>{w.name}</option>)}
          </select>
          {errors.ward && <p className="text-xs text-red-500 mt-1">{errors.ward}</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Địa chỉ</label>
          <input className={`input ${errors.detail ? 'border-red-500' : ''}`} placeholder="Nhập địa chỉ cụ thể: Số nhà, tên đường..." value={detail} onChange={e=> setDetail(e.target.value)} />
          {errors.detail && <p className="text-xs text-red-500 mt-1">{errors.detail}</p>}
        </div>
      </div>
    </div>
  );
}
