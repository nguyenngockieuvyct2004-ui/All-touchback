import React, { useEffect, useState } from 'react';
import api from '../lib/api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import ProductCard from '../components/ProductCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { ProductCardSkeleton } from '../components/Skeleton.jsx';

export default function ProductsPage(){
  const [items,setItems] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');

  useEffect(()=>{
    let active = true;
    api.get('/products')
      .then(r=>{ if(active) setItems(r.data); })
      .catch(e=> setError(e.response?.data?.message || 'Load failed'))
      .finally(()=> setLoading(false));
    return ()=>{ active=false; };
  },[]);

  return <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-semibold tracking-tight" style={{fontFamily:'var(--font-display, ui-serif)'}}>Sản phẩm</h1>
    </div>
    <ErrorMessage error={error} />
    {loading && <div className="grid-auto">{Array.from({length:6}).map((_,i)=><ProductCardSkeleton key={i} />)}</div>}
    {!loading && items.length>0 && <div className="grid-auto">{items.map(p=> <ProductCard key={p._id} product={p} />)}</div>}
    {!loading && !items.length && <EmptyState title="Chưa có sản phẩm" description="Hệ thống chưa có dữ liệu sản phẩm. Hãy thêm ở trang Admin nếu bạn có quyền." />}
  </div>;
}
