import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api.js';

export default function PublicCardPage(){
  const { slug } = useParams();
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');

  useEffect(()=>{
    setLoading(true);
    api.get(`/public/cards/${slug}`)
      .then(r=> setData(r.data))
      .catch(e=> setError(e.response?.data?.message || 'Không tìm thấy'))
      .finally(()=> setLoading(false));
  },[slug]);

  const profile = data?.profile || {};
  const memory = data?.memory || null;

  const actions = useMemo(()=>{
    const out = [];
    if(profile.phone) out.push({ label: 'Gọi', href: `tel:${profile.phone}` });
    if(profile.phone) out.push({ label: 'Nhắn tin', href: `sms:${profile.phone}` });
    if(profile.email) out.push({ label: 'Email', href: `mailto:${profile.email}` });
    if(profile.website) out.push({ label: 'Website', href: profile.website });
    out.push({ label: 'Lưu vCard', href: `/public/cards/${slug}/vcard` });
    return out;
  },[profile, slug]);

  if(loading) return <div className="py-10 text-center text-gray-500">Đang tải...</div>;
  if(error) return <div className="py-10 text-center text-red-600">{error}</div>;

  return <div className="max-w-3xl mx-auto">
    <div className="panel overflow-hidden">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-600/15 to-brand-600/30 overflow-hidden">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.name||''} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-xl">🪪</div>
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold truncate">{profile.name || data?.card?.title || 'Danh thiếp'}</h1>
          {(profile.title || profile.company) && (
            <p className="text-sm text-muted-foreground truncate">{[profile.title, profile.company].filter(Boolean).join(' · ')}</p>
          )}
        </div>
      </div>

      {!!actions.length && <div className="flex flex-wrap gap-2 mt-4">
        {actions.map((a,i)=> <a key={i} href={a.href} className="btn btn-outline btn-sm" target={a.href.startsWith('/')? undefined : '_blank'} rel="noopener noreferrer">{a.label}</a>)}
      </div>}

      {memory && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Giới thiệu</h2>
          <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap leading-relaxed">
            {memory.description ?? memory.content}
          </div>
          {!!memory.media?.length && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
              {memory.media.slice(0,6).map((m,i)=> (
                <div key={i} className="aspect-video rounded-lg overflow-hidden bg-muted">
                  {m.type==='image' ? (
                    <img src={m.url} alt={m.caption||''} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-2xl">🎥</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!!profile.socials?.length && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-2">Liên kết</h2>
          <div className="flex flex-wrap gap-2">
            {profile.socials.map((s, i)=> <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">{s.label || 'Link'}</a>)}
          </div>
        </div>
      )}
    </div>
  </div>;
}
