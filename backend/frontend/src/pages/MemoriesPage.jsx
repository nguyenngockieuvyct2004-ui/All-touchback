import React, { useEffect, useState } from 'react';
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

  useEffect(()=>{
    api.get('/memories')
      .then(r=> setMemories(r.data))
      .catch(e=> setError(e.response?.data?.message || 'Tải thất bại'))
      .finally(()=> setLoading(false));
  },[]);

  return <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold tracking-tight">Memories</h1>
      <Link to="/memories/new/edit" className="btn btn-primary">Tạo mới</Link>
    </div>
    <ErrorMessage error={error} />
    {loading && <div className="grid-auto">{Array.from({length:6}).map((_,i)=><MemoryCardSkeleton key={i} />)}</div>}
    {!loading && memories.length>0 && <div className="grid-auto">{memories.map(m=> <MemoryCard key={m._id} memory={m} />)}</div>}
  {!loading && !memories.length && <EmptyState title="Chưa có memory" description="Hãy tạo memory đầu tiên của bạn." action={<Link to="/memories/new/edit" className="btn btn-primary">Tạo memory</Link>} />}
  </div>;
}
