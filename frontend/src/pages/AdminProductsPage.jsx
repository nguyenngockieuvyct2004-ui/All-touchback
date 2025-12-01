import React, { useEffect, useState, useRef } from 'react';
import api from '../lib/api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function AdminProductsPage(){
  const [items,setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [name,setName] = useState('');
  const [code,setCode] = useState('');
  const [category,setCategory] = useState('basic');
  const [price,setPrice] = useState('');
  const [description,setDescription] = useState('');
  const [error,setError] = useState('');
  const [creating,setCreating] = useState(false);
  const [editingId,setEditingId] = useState(null);
  const [edit,setEdit] = useState({ name:'', code:'', category:'basic', price:'', description:'', images: [] });
  const [bulkText, setBulkText] = useState('');
  const fileRef = useRef();
  const [createFiles, setCreateFiles] = useState(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCat, setEditingCat] = useState({ name:'', description:'' });

  async function load(){
    try {
      const r = await api.get('/products');
      setItems(r.data);
      const cr = await api.get('/categories');
      setCategories(cr.data);
    } catch(e){ setError(e.response?.data?.message || 'Tải thất bại'); }
  }
  useEffect(()=>{ load(); },[]);
  useEffect(()=>{ loadCategories(); },[]);

  async function loadCategories(){
    try{
      const cr = await api.get('/categories');
      // ensure array
      setCategories(Array.isArray(cr.data) ? cr.data : []);
    }catch(e){ console.warn('load categories failed', e); }
  }

  async function create(e){
    e.preventDefault(); setError(''); setCreating(true);
    try {
      let images = undefined;
      if(createFiles && createFiles.length){
        const fd = new FormData();
        Array.from(createFiles).forEach(f=> fd.append('files', f));
        const up = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        images = (up.data.files || []).map(x=> x.url);
      }
      const payload = { name, code, category, price: Number(price)||0, description };
      if(images) payload.images = images;
      const r = await api.post('/products', payload);
      setItems(i=>[r.data, ...i]);
      setName(''); setCode(''); setCategory('basic'); setPrice(''); setDescription('');
      setCreateFiles(null);
    } catch(e){ setError(e.response?.data?.message || 'Tạo thất bại'); }
    finally { setCreating(false); }
  }

  async function createCategory(e){
    e.preventDefault();
    try{
      const r = await api.post('/categories', { name: catName, description: catDesc });
      // reload categories from server to ensure consistent shape
      await loadCategories();
      // set the product create form to the new category
      if(r.data && r.data.slug) setCategory(r.data.slug);
      setCatName(''); setCatDesc('');
    }catch(err){ alert(err.response?.data?.message || 'Tạo category thất bại'); }
  }

  async function deleteCategory(id){
    if(!confirm('Xoá category này?')) return;
    try{ await api.delete(`/categories/${id}`); setCategories(c=>c.filter(x=>x._id!==id)); }
    catch(e){ alert(e.response?.data?.message||'Xoá thất bại'); }
  }

  function beginCategoryEdit(cat){
    setEditingCatId(cat._id);
    setEditingCat({ name: cat.name || '', description: cat.description || '' });
  }

  function cancelCategoryEdit(){ setEditingCatId(null); setEditingCat({ name:'', description:'' }); }

  async function saveCategory(id){
    try{
      const r = await api.put(`/categories/${id}`, editingCat);
      // reload
      await loadCategories();
      setEditingCatId(null);
      setEditingCat({ name:'', description:'' });
    }catch(e){ alert(e.response?.data?.message || 'Cập nhật thất bại'); }
  }

  // Bulk import with optional file uploads
  async function importBulk(e){
    e.preventDefault(); setError('');
    try{
      let data = [];
      if(bulkText.trim()) data = JSON.parse(bulkText);
      else if(fileRef.current?.files?.length){
        // read file as text (JSON or CSV)
        const f = fileRef.current.files[0];
        const text = await f.text();
        try{ data = JSON.parse(text); }
        catch(_){
          const lines = text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
          const headers = lines.shift().split(',').map(h=>h.trim());
          data = lines.map(l=>{
            const cols = l.split(',').map(c=>c.trim());
            const obj = {}; headers.forEach((h,i)=> obj[h]=cols[i]||'');
            // support images column with semicolon-separated urls
            if(obj.images && typeof obj.images === 'string'){
              obj.images = obj.images.split(';').map(s=>s.trim()).filter(Boolean);
            }
            return obj;
          });
        }
      }

      if(!data.length) return alert('Không có dữ liệu để import');

      // If there are files to upload (multiple images), allow user to select files and map them by filename
      // If you want to upload files along with CSV, implement mapping by filename in CSV's images column.

      const r = await api.post('/products/bulk', data);
      alert(`Created ${r.data.created.length} items, ${r.data.errors.length} errors`);
      load();
    }catch(err){ setError(err.response?.data?.message || String(err.message)); }
  }

  function beginEdit(p){
    setEditingId(p._id);
    setEdit({
      name: p.name||'',
      code: p.code||'',
      category: p.category||'basic',
      price: String(p.price||''),
      description: p.description||'',
      // keep existing images so they remain visible while editing
      images: Array.isArray(p.images) ? [...p.images] : [] ,
      files: undefined,
    });
  }
  function cancelEdit(){ setEditingId(null); }
  async function saveEdit(id){
    try {
      // Determine images to send: if user uploaded new files, use them (replace); otherwise keep edit.images
      let images = undefined;
      if(edit.files && edit.files.length){
        const fd = new FormData();
        Array.from(edit.files).forEach(f=> fd.append('files', f));
        const up = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        images = (up.data.files || []).map(x=> x.url);
      } else if (Array.isArray(edit.images)){
        images = edit.images; // preserve existing images when not replaced
      }

      // Build a clean payload (whitelist) so we don't accidentally send File objects
      const payload = {
        name: edit.name,
        code: edit.code,
        category: edit.category,
        variant: edit.variant,
        description: edit.description,
        price: Number(edit.price) || 0,
      };
      if (images !== undefined) payload.images = images;
      if (edit.isFeatured !== undefined) payload.isFeatured = edit.isFeatured;
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
            {categories.length ? categories.map(c=> (
              <option key={c._id} value={c.slug}>{c.name}</option>
            )) : (
              <>
                <option value="basic">Basic</option>
                <option value="plus">Plus</option>
                <option value="premium">Premium</option>
              </>
            )}
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
        <div className="md:col-span-6">
          <label className="label">Hình ảnh (tùy chọn)</label>
          <input type="file" multiple onChange={e=>setCreateFiles(e.target.files)} />
        </div>
        <button disabled={creating} className="btn md:row-span-2">{creating?'Đang tạo...':'Tạo'}</button>
      </form>
    </div>

    <div className="grid gap-4 md:grid-cols-2">
      <div className="card">
        <h3 className="font-semibold mb-2">Categories</h3>
        <form onSubmit={createCategory} className="grid gap-2">
          <input className="input" placeholder="Tên category" value={catName} onChange={e=>setCatName(e.target.value)} />
          <input className="input" placeholder="Mô tả" value={catDesc} onChange={e=>setCatDesc(e.target.value)} />
          <div className="flex gap-2"><button className="btn">Tạo</button></div>
        </form>
        <ul className="mt-3 space-y-2">
          {categories.map(c=> (
            <li key={c._id} className="flex items-start justify-between">
              {editingCatId===c._id ? (
                <div className="flex-1">
                  <input className="input mb-2" value={editingCat.name} onChange={e=>setEditingCat({...editingCat, name: e.target.value})} />
                  <input className="input" value={editingCat.description} onChange={e=>setEditingCat({...editingCat, description: e.target.value})} />
                </div>
              ) : (
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-gray-500">{c.slug}</div>
                </div>
              )}
              <div className="flex items-center gap-2 ml-4">
                {editingCatId===c._id ? (
                  <>
                    <button className="btn btn-sm" onClick={()=>saveCategory(c._id)}>Lưu</button>
                    <button className="btn btn-outline btn-sm" onClick={cancelCategoryEdit}>Huỷ</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-outline btn-sm" onClick={()=>beginCategoryEdit(c)}>Sửa</button>
                    <button className="btn btn-outline btn-sm" onClick={()=>deleteCategory(c._id)}>Xoá</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <h3 className="font-semibold mb-2">Nhập hàng loạt</h3>
        <div className="text-sm text-gray-500 mb-2">Dán JSON array hoặc upload CSV. Với CSV, thêm cột images là danh sách URL phân tách bằng dấu ;</div>
        <form onSubmit={importBulk} className="space-y-2">
          <textarea className="input" rows={6} placeholder='[{{"name":"Tên","code":"CODE","category":"slug","price":100,"images":["/uploads/x.jpg"]}}]' value={bulkText} onChange={e=>setBulkText(e.target.value)} />
          <input ref={fileRef} type="file" accept=".json,.csv,text/csv" />
          <div className="flex gap-2"><button className="btn">Import</button><button type="button" onClick={()=>{ setBulkText(''); if(fileRef.current) fileRef.current.value=''; }} className="btn btn-outline">Clear</button></div>
        </form>
      </div>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      {items.map(p=> <div key={p._id} className="card space-y-2">
        {editingId===p._id ? (
          <>
            <input className="input" value={edit.name} onChange={e=>setEdit({...edit, name:e.target.value})} />
            <div className="grid grid-cols-3 gap-2">
              <input className="input" value={edit.code} onChange={e=>setEdit({...edit, code:e.target.value})} />
              <select className="input" value={edit.category} onChange={e=>setEdit({...edit, category:e.target.value})}>
                {categories.length ? categories.map(c=> (
                  <option key={c._id} value={c.slug}>{c.name}</option>
                )) : (
                  <>
                    <option value="basic">basic</option>
                    <option value="plus">plus</option>
                    <option value="premium">premium</option>
                  </>
                )}
              </select>
              <input className="input" value={edit.price} onChange={e=>setEdit({...edit, price:e.target.value})} />
            </div>
              <div className="mt-2">
                <label className="label">Hình ảnh (giữ nguyên nếu không thay đổi)</label>
                {/* show existing images as thumbnails with remove option */}
                <div className="flex gap-2 mb-2">
                  {edit.images && edit.images.length ? edit.images.map((url,idx)=> (
                    <div key={idx} className="relative w-20 h-16 rounded overflow-hidden border">
                      <img src={url} alt={`img-${idx}`} className="w-full h-full object-cover" />
                      <button type="button" className="absolute top-1 right-1 bg-black/40 text-white rounded px-1 text-xs" onClick={()=>{
                        const imgs = edit.images.filter((_,i)=> i!==idx);
                        setEdit({...edit, images: imgs});
                      }}>X</button>
                    </div>
                  )) : <div className="text-xs text-gray-500">Chưa có ảnh</div>}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Chọn file để thay thế toàn bộ ảnh (nếu muốn)</label>
                  <input type="file" multiple onChange={e=>setEdit({...edit, files: e.target.files})} />
                </div>
              </div>
            <textarea rows={2} className="input" value={edit.description} onChange={e=>setEdit({...edit, description:e.target.value})} />
            <div className="flex gap-2">
              <button onClick={()=>saveEdit(p._id)} className="btn btn-sm">Lưu</button>
              <button onClick={cancelEdit} className="btn btn-outline btn-sm">Huỷ</button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div className="w-28 h-20 bg-muted rounded overflow-hidden">
                {p.images && p.images.length ? (
                  <img src={p.images[0]} alt={p.name} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-gray-200/20 flex items-center justify-center text-xs">No image</div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{p.name}</h3>
                <div className="text-xs text-gray-500">Code: {p.code} • {p.category}</div>
              </div>
            </div>
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
