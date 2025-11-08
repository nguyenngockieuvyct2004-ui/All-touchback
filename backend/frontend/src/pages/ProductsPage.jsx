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
  // Tìm kiếm & lọc theo category
  const [q,setQ] = useState('');
  const [cat,setCat] = useState('all');
  const [categories,setCategories] = useState([{ slug: 'all', name: 'Tất cả' }]);
  const [catsLoading,setCatsLoading] = useState(true);
  const [catsError,setCatsError] = useState('');

  useEffect(()=>{
    let active = true;
    api.get('/products')
      .then(r=>{ if(active) setItems(r.data); })
      .catch(e=> setError(e.response?.data?.message || 'Load failed'))
      .finally(()=> setLoading(false));
    return ()=>{ active=false; };
  },[]);

  useEffect(()=>{
    let active = true;
    setCatsLoading(true);
    api.get('/categories')
      .then(r=>{ if(!active) return; const list = r.data || []; setCategories([{ slug: 'all', name: 'Tất cả' }, ...list.map(c=>({ slug: c.slug || c._id, name: c.name }))]); })
      .catch(e=> { if(!active) return; setCatsError(e.response?.data?.message || 'Không thể tải categories') })
      .finally(()=> { if(active) setCatsLoading(false); });
    return ()=>{ active=false; };
  },[]);

  const filtered = items.filter(p=>{
    // product.category stores a slug (or free-form string). Match against selected category slug.
    const okCat = cat==='all' || (p.category === cat) || (p.category?.slug === cat);
    const kw = q.trim().toLowerCase();
    const okQ = !kw || p.name?.toLowerCase().includes(kw) || p.description?.toLowerCase().includes(kw) || p.code?.toLowerCase().includes(kw);
    return okCat && okQ;
  });

  return <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <h1 className="text-3xl font-semibold tracking-tight" style={{fontFamily:'var(--font-display, ui-serif)'}}>Sản phẩm</h1>
      <div className="flex items-center gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} className="input h-10 w-64" placeholder="Tìm kiếm sản phẩm..." />
        <select value={cat} onChange={e=>setCat(e.target.value)} className="input h-10 w-40">
          {categories.map(c=> <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
      </div>
    </div>
    <ErrorMessage error={error} />
    {loading && <div className="grid-auto">{Array.from({length:6}).map((_,i)=><ProductCardSkeleton key={i} />)}</div>}
    {!loading && filtered.length>0 && <div className="grid-auto">{filtered.map(p=> <ProductCard key={p._id} product={p} />)}</div>}
    {!loading && !filtered.length && <EmptyState title="Không tìm thấy sản phẩm" description="Thử đổi từ khoá, hoặc chọn category khác." />}
  </div>;
}
