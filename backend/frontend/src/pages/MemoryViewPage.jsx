import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { MemoryCardSkeleton } from '../components/Skeleton.jsx';

export default function MemoryViewPage(){
  const { id } = useParams();
  const [memory,setMemory] = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');

  useEffect(()=>{
    api.get(`/memories/${id}`)
      .then(r=> setMemory(r.data))
      .catch(e=> setError(e.response?.data?.message || 'Không tải được'))
      .finally(()=> setLoading(false));
  },[id]);

  return <div className="space-y-6 max-w-3xl">
    {loading && <MemoryCardSkeleton />}
    <ErrorMessage error={error} />
    {!loading && !error && !memory && <div className="text-sm text-muted-foreground">Không tìm thấy memory.</div>}
    {!loading && memory && <div className="panel space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight gradient-text">{memory.title}</h1>
        <Link to={`/memories/${id}/edit`} className="btn btn-outline btn-sm">Sửa</Link>
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert leading-relaxed whitespace-pre-wrap">
        {memory.description ?? memory.content}
      </div>
      {!!memory.media?.length && <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
        {memory.media.map((m,i)=> <div key={i} className="aspect-video rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground font-medium">{m.type}</div>)}
      </div>}
    </div>}
  </div>;
}
