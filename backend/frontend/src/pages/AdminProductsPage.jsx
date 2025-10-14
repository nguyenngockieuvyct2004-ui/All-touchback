import React, { useEffect, useState } from 'react';
import api from '../lib/api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function AdminProductsPage(){
  const [items,setItems] = useState([]);
  const [name,setName] = useState('');
  const [code,setCode] = useState('');
  const [category,setCategory] = useState('basic');
  const [price,setPrice] = useState('');
  const [description,setDescription] = useState('');
  const [error,setError] = useState('');
  const [creating,setCreating] = useState(false);
  const [editingId,setEditingId] = useState(null);
  const [edit,setEdit] = useState({ name:'', code:'', category:'basic', price:'', description:'' });

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
      const r = await api.post('/products',{ name, code, category, price: Number(price)||0, description });
      setItems(i=>[r.data, ...i]);
      setName(''); setCode(''); setCategory('basic'); setPrice(''); setDescription('');
    } catch(e){ setError(e.response?.data?.message || 'Tạo thất bại'); }
    finally { setCreating(false); }
  }

  function beginEdit(p){ setEditingId(p._id); setEdit({ name:p.name||'', code:p.code||'', category:p.category||'basic', price:String(p.price||''), description:p.description||'' }); }
  function cancelEdit(){ setEditingId(null); }
  async function saveEdit(id){
    try {
      const payload = { ...edit, price: Number(edit.price)||0 };
      const r = await api.put(`/products/${id}`, payload);
      setItems(list=> list.map(x=> x._id===id? r.data : x));
      setEditingId(null);
    } catch(e){ alert(e.response?.data?.message||'Cập nhật thất bại'); }
  }
  async function remove(id){
    if(!confirm('Xoá sản phẩm này?')) return;
    try { await api.delete(`/products/${id}`); setItems(list=> list.filter(x=> x._id!==id)); }
    catch(e){ alert(e.response?.data?.message||'Xoá thất bại'); }
  }

  return <div className="space-y-8">
    <div>
      <h1 className="text-xl font-semibold mb-4">Quản lý sản phẩm</h1>
      <ErrorMessage error={error} />
      <form onSubmit={create} className="grid gap-4 md:grid-cols-6 card items-end">
        <div>
          <label className="label">Tên</label>
          <input className="input" value={name} onChange={e=>setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Mã (code)</label>
          <input className="input" value={code} onChange={e=>setCode(e.target.value)} />
        </div>
        <div>
          <label className="label">Phân loại</label>
          <select className="input" value={category} onChange={e=>setCategory(e.target.value)}>
            <option value="basic">Basic</option>
            <option value="plus">Plus</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <div>
          <label className="label">Giá</label>
            <input className="input" value={price} onChange={e=>setPrice(e.target.value)} />
        </div>
        <div className="md:col-span-6">
          <label className="label">Mô tả</label>
          <textarea rows={2} className="input" value={description} onChange={e=>setDescription(e.target.value)} />
        </div>
        <button disabled={creating} className="btn md:row-span-2">{creating?'Đang tạo...':'Tạo'}</button>
      </form>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      {items.map(p=> <div key={p._id} className="card space-y-2">
        {editingId===p._id ? (
          <>
            <input className="input" value={edit.name} onChange={e=>setEdit({...edit, name:e.target.value})} />
            <div className="grid grid-cols-3 gap-2">
              <input className="input" value={edit.code} onChange={e=>setEdit({...edit, code:e.target.value})} />
              <select className="input" value={edit.category} onChange={e=>setEdit({...edit, category:e.target.value})}>
                <option value="basic">basic</option>
                <option value="plus">plus</option>
                <option value="premium">premium</option>
              </select>
              <input className="input" value={edit.price} onChange={e=>setEdit({...edit, price:e.target.value})} />
            </div>
            <textarea rows={2} className="input" value={edit.description} onChange={e=>setEdit({...edit, description:e.target.value})} />
            <div className="flex gap-2">
              <button onClick={()=>saveEdit(p._id)} className="btn btn-sm">Lưu</button>
              <button onClick={cancelEdit} className="btn btn-outline btn-sm">Huỷ</button>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-medium">{p.name}</h3>
            <div className="text-xs text-gray-500">Code: {p.code} • {p.category}</div>
            <p className="text-sm text-gray-600 line-clamp-3 mb-2">{p.description}</p>
            <div className="text-blue-600 font-semibold">{p.price?.toLocaleString()} đ</div>
            <div className="flex gap-2 pt-2">
              <button onClick={()=>beginEdit(p)} className="btn btn-outline btn-sm">Sửa</button>
              <button onClick={()=>remove(p._id)} className="btn btn-outline btn-sm" style={{borderColor:'#fca5a5', color:'#f87171'}}>Xoá</button>
            </div>
          </>
        )}
      </div>)}
    </div>
  </div>;
}
