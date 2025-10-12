import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api.js';

// Simple icon mapping (could be expanded later)
const socialIcon = (label) => {
  const k = (label||'').toLowerCase();
  if(k.includes('facebook')) return '📘';
  if(k.includes('zalo')) return '💬';
  if(k.includes('youtube')) return '▶';
  if(k.includes('tiktok')) return '🎵';
  if(k.includes('instagram')) return '📸';
  if(k.includes('github')) return '🐙';
  return '🔗';
};

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
  // Always derive profile/memory before any conditional render to keep hook order stable
  const profile = data?.profile || {};
  const memory = data?.memory || null;

  const actions = useMemo(()=>{
    const arr = [];
    if(profile.phone) arr.push({ key:'call', label:'Lưu danh bạ', href:`/public/cards/${slug}/vcard`, primary:true });
    arr.push({ key:'share', label:'Chia sẻ', href:'#share', variant:'secondary' });
    return arr;
  },[profile, slug]);

  // Derived contact list for separate section
  const contactItems = [
    profile.phone && { icon:'📞', label: profile.phone, href:`tel:${profile.phone}` },
    profile.phone && { icon:'💬', label: profile.phone, href:`sms:${profile.phone}` },
    profile.email && { icon:'✉️', label: profile.email, href:`mailto:${profile.email}` },
    profile.address && { icon:'📍', label: profile.address, href:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}` },
    profile.website && { icon:'🌐', label: profile.website.replace(/^https?:\/\//,'').replace(/\/$/,'') , href: profile.website }
  ].filter(Boolean);

  // Loading / error placeholders rendered inside final return to avoid hook order change
  return (
    <div className="w-full max-w-[680px] mx-auto pb-16">
      {loading && (
        <div className="py-10 text-center text-gray-500">Đang tải...</div>
      )}
      {!loading && error && (
        <div className="py-10 text-center text-red-600">{error}</div>
      )}
      {(!loading && !error) && <>
      {/* Cover Image */}
      <div className="relative rounded-b-3xl overflow-hidden shadow-sm bg-gray-200 dark:bg-gray-800 aspect-[16/6]">
        {profile.cover ? (
          <img src={profile.cover} alt="cover" className="w-full h-full object-cover" />
        ): <div className="w-full h-full bg-gradient-to-br from-sky-400 to-indigo-600" />}
      </div>

      {/* Avatar overlapping */}
      <div className="relative -mt-16 flex items-end px-6">
        <div className="w-32 h-32 rounded-full ring-4 ring-white dark:ring-gray-900 overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-700">
          {profile.avatar ? <img src={profile.avatar} alt={profile.name||''} className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-3xl">🪪</div>}
        </div>
      </div>

      {/* Header info */}
      <div className="px-6 mt-4 space-y-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{profile.name || data?.card?.title || 'Danh thiếp'}</h1>
          {(profile.title || profile.company) && (
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">{[profile.title, profile.company].filter(Boolean).join(' · ')}</p>
          )}
        </div>
        {/* Social round buttons */}
        {!!profile.socials?.length && (
          <div className="flex flex-wrap gap-3 pt-1">
            {profile.socials.map((s,i)=> (
              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#031a2c] dark:bg-gray-800 hover:brightness-110 grid place-items-center text-white text-lg transition">
                <span>{socialIcon(s.label)}</span>
              </a>
            ))}
          </div>
        )}
        {/* Primary action buttons */}
        <div className="flex gap-3 pt-2">
          {actions.map(a=> (
            <a key={a.key} href={a.href} className={"flex-1 h-11 inline-flex items-center justify-center rounded-full text-sm font-medium transition shadow-sm " + (a.primary? 'bg-[#031a2c] text-white hover:bg-[#05243b]':'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100 hover:bg-gray-300/70 dark:hover:bg-gray-700')}>
              {a.label}
            </a>
          ))}
        </div>
      </div>

      {/* Intro Section */}
      {(memory?.description || memory?.content) && (
        <section className="mt-10 px-6 space-y-4">
          <h2 className="font-semibold text-[15px] flex items-center gap-2"><span className="inline-block w-1 h-5 rounded bg-[#031a2c] dark:bg-sky-500" />Giới thiệu</h2>
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700 dark:text-gray-300">{memory.description ?? memory.content}</p>
        </section>
      )}

      {/* Social list row version (if want icons again) */}
      {!!profile.socials?.length && (
        <section className="mt-8 px-6 space-y-4">
          <h2 className="font-semibold text-[15px] flex items-center gap-2"><span className="inline-block w-1 h-5 rounded bg-[#031a2c] dark:bg-sky-500" />Mạng xã hội</h2>
          <div className="flex flex-wrap gap-2">
            {profile.socials.map((s,i)=> (
              <a key={i} href={s.url} target="_blank" rel="noreferrer" className="h-10 px-4 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm inline-flex items-center gap-2 font-medium transition">
                <span>{socialIcon(s.label)}</span><span>{s.label||'Link'}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Contact Section */}
      {!!contactItems.length && (
        <section className="mt-8 px-6 space-y-3">
          <h2 className="font-semibold text-[15px] flex items-center gap-2"><span className="inline-block w-1 h-5 rounded bg-[#031a2c] dark:bg-sky-500" />Thông tin liên hệ</h2>
          <div className="space-y-2">
            {contactItems.map((c,i)=>(
              <a key={i} href={c.href} className="w-full h-11 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-5 flex items-center gap-3 text-sm font-medium text-gray-800 dark:text-gray-200 transition overflow-hidden">
                <span className="text-base">{c.icon}</span>
                <span className="truncate">{c.label}</span>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Gallery / Inspiration Images */}
      {!!memory?.media?.length && (
        <section className="mt-8 px-6 space-y-4">
          <h2 className="font-semibold text-[15px] flex items-center gap-2"><span className="inline-block w-1 h-5 rounded bg-[#031a2c] dark:bg-sky-500" />Hình ảnh truyền cảm hứng</h2>
          <div className="grid grid-cols-3 gap-2">
            {memory.media.slice(0,6).map((m,i)=>(
              <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                {m.type==='image' ? <img src={m.url} alt={m.caption||''} className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-xl">🎥</div>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Video (take first video media if exists) */}
      {memory?.media?.some(m=> m.type==='video') && (
        <section className="mt-8 px-6 space-y-4">
          <h2 className="font-semibold text-[15px] flex items-center gap-2"><span className="inline-block w-1 h-5 rounded bg-[#031a2c] dark:bg-sky-500" />Video</h2>
          <div className="rounded-xl overflow-hidden bg-black aspect-video grid place-items-center text-white text-sm">Video</div>
        </section>
      )}

      {/* Map placeholder if address */}
      {profile.address && (
        <section className="mt-8 px-6 space-y-4">
          <h2 className="font-semibold text-[15px] flex items-center gap-2"><span className="inline-block w-1 h-5 rounded bg-[#031a2c] dark:bg-sky-500" />Bản đồ</h2>
          <div className="w-full aspect-[5/3] rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 relative">
            <iframe
              title="map"
              className="absolute inset-0 w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/search?key=AIzaSyD-PLACEHOLDER&q=${encodeURIComponent(profile.address)}`}
            />
          </div>
        </section>
      )}

      <footer className="mt-12 px-6 text-center pb-10 text-[11px] text-gray-500 dark:text-gray-500">© 2025 TouchBack</footer>
      </>}
    </div>
  );
}
