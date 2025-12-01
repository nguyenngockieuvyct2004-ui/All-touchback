import React, { useEffect, useState } from 'react';
import api from '../lib/api.js';
import { ProductCardSkeleton } from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { thumbUrl } from '../lib/images.js';
import AddressPicker from '../components/AddressPicker.jsx';

export default function CartPage(){
  const [cart,setCart] = useState(null);
  const [loading,setLoading] = useState(true);
  // Place all hooks before any conditional return to keep order stable across renders
  const [addr,setAddr] = useState('');
  const [phone,setPhone] = useState('');
  const [note,setNote] = useState('');
  const [pm,setPm] = useState('cod');
  const [placing,setPlacing] = useState(false);
  const [placed,setPlaced] = useState(null);
  const [errors,setErrors] = useState({});

  useEffect(()=>{
    api.get('/cart')
      .then(r=> setCart(r.data))
      .finally(()=> setLoading(false));
  },[]);

  if(loading) return <div className="space-y-6"><h1 className="text-2xl font-semibold tracking-tight">Giỏ hàng</h1><div className="space-y-3">{Array.from({length:3}).map((_,i)=><ProductCardSkeleton key={i} />)}</div></div>;

  const items = cart?.items || [];
  const total = items.reduce((sum,i)=> sum + ((i.product?.price)||0) * i.quantity, 0);

  async function changeQuantity(productId, quantity){
    try {
      const r = await api.post('/cart/update',{ productId, quantity });
      setCart(r.data);
    } catch(e){ console.error(e); }
  }

  async function removeItem(productId){
    await changeQuantity(productId, 0);
  }

  async function clearAll(){
    try {
      const r = await api.post('/cart/clear');
      setCart(r.data);
    } catch(e){ console.error(e); }
  }

  const phoneOk = /^[0-9+()\s-]{8,20}$/.test(phone||'');
  // addr format: province|district|ward|detail
  const [prov,dst,ward,detail] = (addr||'').split('|');
  const addrOk = !!prov && !!dst && !!ward && (detail?.trim().length>=3);
  const canPlace = items.length>0 && phoneOk && addrOk && !placing;

  return <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold tracking-tight">Giỏ hàng</h1>
      {!!items.length && <button onClick={clearAll} className="btn btn-outline btn-sm">Xoá giỏ hàng</button>}
    </div>
    {!items.length && <EmptyState title="Giỏ hàng trống" description="Hãy thêm sản phẩm vào giỏ để tiếp tục." />}
    {!!items.length && <div className="panel space-y-4">
      <ul className="divide-y divide-border">
        {items.map((i,idx)=> <li key={i.product?._id || idx} className="py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-3">
              {i.product?.images?.length ? (
                <img src={thumbUrl(i.product.images[0])} alt={i.product.name} className="w-16 h-16 object-cover rounded-md border border-white/10" />
              ) : (
                <div className="w-16 h-16 rounded-md border border-white/10 bg-white/5" />
              )}
              <div className="min-w-0">
                <p className="font-medium text-sm truncate">{i.product?.name || 'Sản phẩm đã xoá'}</p>
                <p className="text-xs text-muted-foreground">Đơn giá: {(i.product?.price||0).toLocaleString()} đ</p>
                {i.purpose && (
                  <span className="inline-flex items-center gap-1 text-[11px] mt-1 px-1.5 py-0.5 rounded border border-black/10 dark:border-white/10">
                    {i.purpose==='memory' ? 'Lưu ảnh/video' : 'Danh thiếp'}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>changeQuantity(i.productId, Math.max(1, i.quantity-1))} disabled={i.quantity<=1} className="px-2 h-8 rounded-md border border-white/10 bg-white/10 text-white text-xs">-</button>
            <input value={i.quantity} onChange={e=>{
              const raw = e.target.value.replace(/[^0-9]/g,'');
              const v = Math.max(1, parseInt(raw||'1',10));
              changeQuantity(i.productId, v);
            }} className="w-12 h-8 text-center rounded-md border border-white/10 bg-white/5 text-white text-sm" />
            <button onClick={()=>changeQuantity(i.productId, i.quantity+1)} className="px-2 h-8 rounded-md border border-white/10 bg-white/10 text-white text-xs ">+</button>
          </div>
          <div className="font-semibold text-sm w-24 text-right ">{((i.product?.price||0)*i.quantity).toLocaleString()} đ</div>
          <button onClick={()=>removeItem(i.productId)} className="text-xs text-red-600 hover:underline">Xoá</button>
        </li>)}
      </ul>
      <div className="flex items-center justify-end pt-2">
        <div className="text-lg font-semibold">Tổng: {total.toLocaleString()} đ</div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h3 className="font-medium">Thông tin giao hàng</h3>
          <div>
            <input type="tel" pattern="[0-9+()\\s-]{8,20}" className={`input ${errors.phone? 'border-red-500':''}`} placeholder="Số điện thoại" value={phone} onChange={e=>{ setPhone(e.target.value); setErrors(prev=>({...prev, phone: undefined})); }} required />
            {!phoneOk && phone && <p className="text-xs text-red-500 mt-1">Số điện thoại không hợp lệ</p>}
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>
          <AddressPicker value={addr} onChange={setAddr} errors={{
            province: errors.province, district: errors.district, ward: errors.ward, detail: errors.detail
          }} />
          <textarea rows={2} className="input" placeholder="Ghi chú" value={note} onChange={e=>setNote(e.target.value)} />
        </div>
        <div className="space-y-3">
          <h3 className="font-medium">Thanh toán</h3>
          <select className="input" value={pm} onChange={e=>setPm(e.target.value)}>
            <option value="cod">COD (Thanh toán khi nhận hàng)</option>
            <option value="bank">Chuyển khoản</option>
            <option value="momo">Momo</option>
          </select>
          <button onClick={async ()=>{
            // Inline validations, show messages under fields
            const nextErrors = {};
            if(!phone || !/^[0-9+()\s-]{8,20}$/.test(phone)){
              nextErrors.phone = 'Vui lòng nhập số điện thoại hợp lệ';
            }
            if(!prov) nextErrors.province = 'Chọn Tỉnh/Thành phố';
            if(!dst) nextErrors.district = 'Chọn Quận/Huyện';
            if(!ward) nextErrors.ward = 'Chọn Xã/Phường/Thị trấn';
            if(!(detail||'').trim()) nextErrors.detail = 'Nhập địa chỉ cụ thể';
            setErrors(nextErrors);
            if(Object.keys(nextErrors).length){ return; }
            setPlacing(true);
            try {
              const r = await api.post('/orders/checkout', { shippingAddress: `${prov}|${dst}|${ward}|${detail}`, phone, note, paymentMethod: pm });
              setPlaced(r.data); setCart({ items: [] });
              try { window.dispatchEvent(new Event('tb-orders-updated')); } catch {}
            } catch(e){ alert(e.response?.data?.message || 'Đặt hàng thất bại'); }
            finally { setPlacing(false); }
          }} className="btn w-full disabled:opacity-100">{placing? 'Đang đặt...':'Đặt hàng'}</button>
          {placed && <div className="text-sm text-emerald-500">Đặt hàng thành công #{placed._id.slice(-6)}</div>}
        </div>
      </div>
    </div>}
  </div>;
}
