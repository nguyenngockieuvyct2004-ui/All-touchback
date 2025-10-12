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
  const [lightbox, setLightbox] = useState(null); // {type,url,caption}

  useEffect(()=>{
    api.get(`/memories/${id}`)
      .then(r=> setMemory(r.data))
      .catch(e=> setError(e.response?.data?.message || 'Không tải được'))
      .finally(()=> setLoading(false));
  },[id]);

  return <div className="space-y-6 max-w-3xl mx-auto px-4 sm:px-6">
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
  {!!memory.media?.length && <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {memory.media.map((m,i)=> (
          <button key={i} className="group aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-black/5 dark:bg-white/5 relative" onClick={()=> setLightbox(m)}>
              {m.type==='image' ? (
              <img loading="lazy" src={m.url} alt={m.caption||''} className="w-full h-full object-cover" onError={(e)=>{ e.currentTarget.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'640\' height=\'360\'><rect width=\'100%\' height=\'100%\' fill=\'%23222\'/><text x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%23aaa\' font-size=\'14\'>Không tải được ảnh</text></svg>'; }} />
            ) : (
              <div className="w-full h-full grid place-items-center text-3xl">🎥</div>
            )}
            {m.caption && <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2 text-[11px] text-white opacity-90 group-hover:opacity-100">{m.caption}</div>}
          </button>
        ))}
      </div>}

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm grid place-items-center p-4" onClick={()=> setLightbox(null)}>
          <div className="max-w-4xl w-full" onClick={e=> e.stopPropagation()}>
            <div className="flex justify-end mb-2">
              <button className="btn btn-outline btn-sm" onClick={()=> setLightbox(null)}>Đóng</button>
            </div>
            <div className="rounded-lg overflow-hidden bg-black">
              {lightbox.type==='image' ? (
                <img loading="lazy" src={lightbox.url} alt={lightbox.caption||''} className="max-h-[70vh] w-full object-contain bg-black" onError={(e)=>{ e.currentTarget.src='data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'800\' height=\'600\'><rect width=\'100%\' height=\'100%\' fill=\'%23222\'/><text x=\'50%\' y=\'50%\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%23aaa\' font-size=\'18\'>Không tải được ảnh</text></svg>'; }} />
              ) : (
                <video src={lightbox.url} controls className="max-h-[70vh] w-full bg-black" />
              )}
            </div>
            {lightbox.caption && <div className="mt-2 text-sm text-white/90">{lightbox.caption}</div>}
          </div>
        </div>
      )}
    </div>}
  </div>;
}
