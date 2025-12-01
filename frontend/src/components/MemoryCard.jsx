import React from 'react';
import { Link } from 'react-router-dom';

export default function MemoryCard({ memory }){
  const id = memory._id || memory.id;
  const desc = memory.description ?? memory.content ?? '';
  const hasMedia = Array.isArray(memory.media) && memory.media.length > 0;
  const firstType = hasMedia ? memory.media[0]?.type : undefined;
  const emoji = firstType === 'video' ? '🎥' : (hasMedia ? '🖼️' : '📝');
  return (
  <Link to={`/memories/${id}`} className="group card card-hover block min-h-[120px] relative">
      {/* Subtle glow (no blur, very light radial gradient) */}
      <div
        className="absolute -bottom-6 -right-6 w-24 h-24 pointer-events-none"
        aria-hidden
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(37,99,235,0.28), transparent 60%)',
          opacity: 0.5,
          filter: 'saturate(110%)',
        }}
      />

      {/* Public badge/link removed per request */}

      {/* Decorative emoji badge */}
      <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 shadow-sm flex items-center justify-center text-base pointer-events-none select-none" aria-hidden>
        {emoji}
      </div>

      <div className="relative z-10">
        <h3 className="font-medium mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition line-clamp-1">{memory.title || 'Không tiêu đề'}</h3>
        {!!desc && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 whitespace-pre-line leading-relaxed">{desc}</p>
        )}
        <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
          {memory.createdAt && <span>{new Date(memory.createdAt).toLocaleDateString()}</span>}
          {memory.media?.length ? <span className="badge">{memory.media.length} media</span>: null}
        </div>
          </div>
        </Link>
  );
}
