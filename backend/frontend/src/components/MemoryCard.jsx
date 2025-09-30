import React from 'react';
import { Link } from 'react-router-dom';

export default function MemoryCard({ memory }){
  const id = memory._id || memory.id;
  const desc = memory.description ?? memory.content ?? '';
  return (
    <Link to={`/memories/${id}`} className="group card card-hover block min-h-[120px]">
      <h3 className="font-medium mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition line-clamp-1">{memory.title || 'Không tiêu đề'}</h3>
      {!!desc && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 whitespace-pre-line leading-relaxed">{desc}</p>
      )}
      <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
        {memory.createdAt && <span>{new Date(memory.createdAt).toLocaleDateString()}</span>}
        {memory.media?.length ? <span className="badge">{memory.media.length} media</span>: null}
      </div>
    </Link>
  );
}
