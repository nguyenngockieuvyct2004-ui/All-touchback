import React from 'react';
import { Link } from 'react-router-dom';

export default function MemoryCard({ memory }){
  return (
    <Link to={`/memories/${memory._id}`} className="group card card-hover">
      <h3 className="font-medium mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition line-clamp-1">{memory.title}</h3>
  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-4 whitespace-pre-line leading-relaxed">{memory.description?.slice(0,180)}</p>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
        <span>{new Date(memory.createdAt).toLocaleDateString()}</span>
        {memory.media?.length ? <span className="badge">{memory.media.length} media</span>: null}
      </div>
    </Link>
  );
}
