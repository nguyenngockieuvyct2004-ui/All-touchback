import React, { useEffect, useState } from 'react';
import api from '../lib/api.js';
import { ProductCardSkeleton } from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function CartPage(){
  const [cart,setCart] = useState(null);
  const [loading,setLoading] = useState(true);

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
            <p className="font-medium text-sm truncate">{i.product?.name || 'Sản phẩm đã xoá'}</p>
            <p className="text-xs text-muted-foreground">Đơn giá: {(i.product?.price||0).toLocaleString()} đ</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>changeQuantity(i.productId, Math.max(1, i.quantity-1))} disabled={i.quantity<=1} className="px-2 h-8 rounded-md border bg-muted text-xs">-</button>
            <input value={i.quantity} onChange={e=>{
              const v = parseInt(e.target.value)||1; changeQuantity(i.productId, v);
            }} className="w-12 h-8 text-center rounded-md border bg-background text-sm" />
            <button onClick={()=>changeQuantity(i.productId, i.quantity+1)} className="px-2 h-8 rounded-md border bg-muted text-xs">+</button>
          </div>
          <div className="font-semibold text-sm w-24 text-right">{((i.product?.price||0)*i.quantity).toLocaleString()} đ</div>
          <button onClick={()=>removeItem(i.productId)} className="text-xs text-red-600 hover:underline">Xoá</button>
        </li>)}
      </ul>
      <div className="flex items-center justify-end pt-2">
        <div className="text-lg font-semibold">Tổng: {total.toLocaleString()} đ</div>
      </div>
    </div>}
  </div>;
}
