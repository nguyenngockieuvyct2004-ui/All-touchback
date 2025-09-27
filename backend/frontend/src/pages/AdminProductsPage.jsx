import React, { useEffect, useState } from 'react';
import api from '../lib/api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function AdminProductsPage(){
  const [items,setItems] = useState([]);
  const [name,setName] = useState('');
  const [price,setPrice] = useState('');
  const [description,setDescription] = useState('');
  const [error,setError] = useState('');
  const [creating,setCreating] = useState(false);

  async function load(){
    try {
      const r = await api.get('/products');
      setItems(r.data);
    } catch(e){ setError(e.response?.data?.message || 'Tải thất bại'); }
  }
  useEffect(()=>{ load(); },[]);

  async function create(e){
    e.preventDefault(); setError(''); setCreating(true);
    try {
      const r = await api.post('/products',{ name, price: Number(price)||0, description });
      setItems(i=>[r.data, ...i]);
      setName(''); setPrice(''); setDescription('');
    } catch(e){ setError(e.response?.data?.message || 'Tạo thất bại'); }
    finally { setCreating(false); }
  }

  return <div className="space-y-8">
    <div>
      <h1 className="text-xl font-semibold mb-4">Quản lý sản phẩm</h1>
      <ErrorMessage error={error} />
      <form onSubmit={create} className="grid gap-4 md:grid-cols-4 card items-end">
        <div>
          <label className="label">Tên</label>
          <input className="input" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Giá</label>
            <input className="input" value={price} onChange={e=>setPrice(e.target.value)} />
        </div>
        <div className="md:col-span-1 md:col-start-1 md:row-start-2 md:col-span-4">
          <label className="label">Mô tả</label>
          <textarea rows={2} className="input" value={description} onChange={e=>setDescription(e.target.value)} />
        </div>
        <button disabled={creating} className="btn md:row-span-2">{creating?'Đang tạo...':'Tạo'}</button>
      </form>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      {items.map(p=> <div key={p._id} className="card">
        <h3 className="font-medium">{p.name}</h3>
        <p className="text-sm text-gray-600 line-clamp-3 mb-2">{p.description}</p>
        <div className="text-blue-600 font-semibold">{p.price?.toLocaleString()} đ</div>
      </div>)}
    </div>
  </div>;
}
