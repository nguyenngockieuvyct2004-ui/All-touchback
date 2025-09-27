import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';

export default function MemoryEditPage(){
  const { id } = useParams();
  const isNew = id === 'new';
  const navigate = useNavigate();
  const [title,setTitle] = useState('');
  const [description,setDescription] = useState('');
  const [error,setError] = useState('');
  const [saving,setSaving] = useState(false);

  useEffect(()=>{
    if(!isNew){
  api.get(`/memories/${id}`).then(r=>{ setTitle(r.data.title||''); setDescription(r.data.description ?? r.data.content ?? ''); })
        .catch(()=> setError('Không tải được dữ liệu'));
    }
  },[id,isNew]);

  async function save(e){
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if(isNew){
        const r = await api.post('/memories',{ title, description });
        navigate(`/memories/${r.data._id}`);
      } else {
        await api.put(`/memories/${id}`, { title, description });
        navigate(`/memories/${id}`);
      }
    } catch(e){
      setError(e.response?.data?.message || 'Lưu thất bại');
    } finally { setSaving(false); }
  }

  return <div className="max-w-2xl space-y-6">
    <div>
      <h1 className="text-3xl font-bold tracking-tight gradient-text mb-2">{isNew? 'Tạo Memory':'Sửa Memory'}</h1>
      <p className="text-sm text-muted-foreground">Ghi lại khoảnh khắc đặc biệt của bạn. Bạn có thể viết nhiều dòng.</p>
    </div>
    <ErrorMessage error={error} />
    <form onSubmit={save} className="panel space-y-5">
      <div className="space-y-1.5">
        <label className="label">Tiêu đề</label>
        <input className="input" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ví dụ: Buổi chiều ở Đà Lạt" />
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="label">Nội dung</label>
          <span className="text-[11px] text-muted-foreground">Có thể xuống dòng để tách đoạn.</span>
        </div>
  <textarea rows={10} className="input font-mono text-sm leading-relaxed" value={description} onChange={e=>setDescription(e.target.value)} placeholder={"Hôm nay..."} />
      </div>
      <div className="flex items-center gap-3 pt-2">
        <button disabled={saving || !title.trim()} className="btn btn-primary min-w-[120px]">{saving?'Đang lưu...':'Lưu'}</button>
        {!title.trim() && <span className="text-xs text-amber-600 dark:text-amber-400">Cần tiêu đề.</span>}
      </div>
    </form>
  </div>;
}
