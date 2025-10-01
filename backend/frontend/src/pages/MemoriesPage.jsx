import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import MemoryCard from '../components/MemoryCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { MemoryCardSkeleton } from '../components/Skeleton.jsx';

export default function MemoriesPage(){
  const [memories,setMemories] = useState([]);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('newest');

  async function load(){
    setLoading(true); setError('');
    try{
      const r = await api.get('/memories');
      setMemories(r.data || []);
    }catch(e){
      setError(e.response?.data?.message || 'Tải thất bại');
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{ load(); },[]);

  const filtered = useMemo(()=>{
    const kw = q.trim().toLowerCase();
    let arr = [...memories];
    if(kw){
      arr = arr.filter(m => (m.title||'').toLowerCase().includes(kw) || (m.description||m.content||'').toLowerCase().includes(kw) || (m.tags||[]).some(t=> (t||'').toLowerCase().includes(kw)));
    }
    arr.sort((a,b)=> sort==='newest' ? new Date(b.createdAt)-new Date(a.createdAt) : new Date(a.createdAt)-new Date(b.createdAt));
    return arr;
  },[q, sort, memories]);

  async function onDelete(id){
    if(!confirm('Xoá kỷ niệm này?')) return;
    try{ await api.delete(`/memories/${id}`); setMemories(prev => prev.filter(m=> (m._id||m.id)!==id)); }
    catch{ alert('Xoá thất bại'); }
  }

  return <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      <h1 className="text-2xl font-semibold tracking-tight">Memories</h1>
      <div className="flex items-center gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} className="input h-10 w-56" placeholder="Tìm kiếm..." />
        <select value={sort} onChange={e=>setSort(e.target.value)} className="input h-10 w-36">
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
        </select>
  <Link to="/memories/new" className="btn btn-primary h-10 px-5 whitespace-nowrap">Tạo mới</Link>
      </div>
    </div>
    <ErrorMessage error={error} />
    {loading && <div className="grid-auto">{Array.from({length:6}).map((_,i)=><MemoryCardSkeleton key={i} />)}</div>}
    {!loading && filtered.length>0 && <div className="grid-auto">
      {filtered.map(m=> (
        <div key={m._id||m.id} className="relative group">
          <MemoryCard memory={m} />
          <button onClick={()=>onDelete(m._id||m.id)} className="opacity-0 group-hover:opacity-100 transition absolute top-3 right-3 btn btn-outline btn-sm">Xoá</button>
        </div>
      ))}
    </div>}
    {!loading && !filtered.length && (
      <div className="max-w-xl">
        <EmptyState title="Chưa có memory" description="Hãy tạo memory đầu tiên của bạn." action={<Link to="/memories/new" className="btn btn-primary">Tạo memory</Link>} />
      </div>
    )}
  </div>;
}
