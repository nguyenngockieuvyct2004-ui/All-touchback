import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../lib/api.js';
import { toast } from '../lib/toast.js';
import { motion } from 'framer-motion';

// Helpers to show brand-specific icons (Facebook, TikTok, etc.) via site favicon
const normalizeUrl = (u='') => {
  if (!u) return '';
  try {
    // Prepend https if scheme missing
    const hasScheme = /^https?:\/\//i.test(u);
    return hasScheme ? u : `https://${u}`;
  } catch {
    return u;
  }
};

const getHost = (u='') => {
  if (!u) return '';
  try {
    const url = new URL(normalizeUrl(u));
    return (url.hostname || '').replace(/^www\./, '');
  } catch {
    return '';
  }
};

const getFaviconUrl = (u='') => {
  const host = getHost(u);
  if (!host) return '';
  // Google s2 favicon service - light and fast
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
};

const BrandFavicon = ({ url, label, size = 18 }) => {
  const src = getFaviconUrl(url);
  const title = getHost(url) || label || 'link';
  // Render favicon with a tiny fallback glyph if it fails
  return (
    <img
      src={src}
      alt={title}
      title={title}
      style={{ width: size, height: size }}
      onError={(e) => {
        e.currentTarget.onerror = null;
        // Minimal fallback: Unicode link symbol
        e.currentTarget.style.display = 'none';
        const parent = e.currentTarget.parentElement;
        if (parent && !parent.dataset.fbFallback) {
          parent.dataset.fbFallback = '1';
          const span = document.createElement('span');
          span.textContent = '🔗';
          span.style.fontSize = '14px';
          parent.appendChild(span);
        }
      }}
    />
  );
};

export default function PublicCardPage() {
  const { slug } = useParams();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api
      .get(`/public/cards/${slug}`)
      .then((r) => setData(r.data))
      .catch((e) => setError(e.response?.data?.message || 'Không tìm thấy'))
      .finally(() => setLoading(false));
  }, [slug]);

  // Always derive profile/memory before any conditional render to keep hook order stable
  const profile = data?.profile || {};
  const memory = data?.memory || null;
  const theme = new URLSearchParams(location.search).get('theme') || 'classic'; // classic | slate | brand
  const tagLine = profile.tagline || 'Danh thiếp kỹ thuật số cá nhân';

  const accentBg = theme === 'slate' ? 'bg-slate-900' : theme === 'brand' ? 'bg-gradient-to-br from-indigo-600 to-sky-500' : 'bg-slate-900';
  const iconPhoneBg = theme === 'brand' ? 'bg-gradient-to-br from-pink-500 to-rose-500' : 'bg-slate-900';
  const iconMailBg = theme === 'brand' ? 'bg-indigo-700' : 'bg-slate-900';
  const iconWebBg = theme === 'brand' ? 'bg-emerald-600' : 'bg-slate-900';
  const iconAddrBg = theme === 'brand' ? 'bg-indigo-600' : 'bg-slate-900';
  // Soft row background per theme (avoid pure white)
  const rowBgClass = theme === 'slate'
    ? 'bg-slate-800/40'
    : theme === 'brand'
    ? 'bg-sky-50'
    : 'bg-[#F5EFE6]'; // classic: warm ivory that fits the site

  const actions = useMemo(() => {
    const arr = [];
    if (profile.phone)
      arr.push({ key: 'call', label: 'Lưu danh bạ', href: `/public/cards/${slug}/vcard`, primary: true });
    arr.push({ key: 'share', label: 'Chia sẻ', href: '#share', variant: 'secondary' });
    return arr;
  }, [profile, slug]);

  const [showShare, setShowShare] = useState(false);
  function copyToClipboard(text, label){
    if(!text) return;
    try{
      navigator.clipboard?.writeText(text);
      toast.success(`${label} đã sao chép`);
    }catch(e){
      // fallback
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
      toast.success(`${label} đã sao chép`);
    }
  }

  // Derived contact list for separate section
  const contactItems = [
    profile.phone && { icon: '📞', label: profile.phone, href: `tel:${profile.phone}` },
    profile.phone && { icon: '💬', label: profile.phone, href: `sms:${profile.phone}` },
    profile.email && { icon: '✉️', label: profile.email, href: `mailto:${profile.email}` },
    profile.address && { icon: '📍', label: profile.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}` },
    profile.website && { icon: '🌐', label: profile.website.replace(/^https?:\/\//, '').replace(/\/$/, ''), href: profile.website },
  ].filter(Boolean);

  return (
  <div className="w-full max-w-[940px] mx-auto pb-20 px-4 sm:px-6">
      {loading && <div className="py-10 text-center text-gray-500">Đang tải...</div>}
      {!loading && error && <div className="py-10 text-center text-red-600">{error}</div>}

      {!loading && !error && (
        <>
          {/* Hero / centered paper card */}
          <div className="relative">
            <div className="aspect-[16/6] sm:aspect-[18/6] w-full rounded-2xl overflow-hidden shadow-sm">
              {profile.cover ? (
                <img loading="lazy" src={profile.cover} alt="cover" className="w-full h-full object-cover" />
              ) : (
                <div className={`w-full h-full ${theme==='brand'?'bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400':'bg-gray-200 dark:bg-gray-800'}`} />
              )}
            </div>

            <div className="-mt-24 relative z-20">
              <div className="max-w-3xl mx-auto glass-card p-6 sm:p-8 animate-fadeInUp" style={{marginTop:'-2.6rem'}}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                  <div className="flex items-center justify-center sm:justify-start">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden shadow-2xl ring-4 ring-white dark:ring-gray-900 bg-gray-100 transition-transform">
                      {profile.avatar ? <img loading="lazy" src={profile.avatar} alt={profile.name||''} className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-3xl">🪪</div>}
                    </motion.div>
                  </div>

                  <div className="sm:col-span-2">
                    <div className="space-y-3">
                      <div>
                        <h1 className={`text-3xl sm:text-4xl font-extrabold ${theme==='slate'?'text-gray-900 dark:text-white':'text-slate-900 dark:text-slate-100'}`}>{profile.name || data?.card?.title || 'Danh thiếp'}</h1>
                        {(profile.title || profile.company) && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{[profile.title, profile.company].filter(Boolean).join(' · ')}</p>}
                        <p className="mt-2 text-xs text-gray-500 italic">{tagLine}</p>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        {actions.map(a => {
                          if (a.key === 'share') {
                            return (
                               <button key={a.key} onClick={() => setShowShare(true)} className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition ${a.primary ? 'btn-gradient' : 'btn'}`}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12v7a2 2 0 0 0 2 2h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 6l6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 6h-6v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                <span>{a.label}</span>
                              </button>
                            );
                          }
                          return (
                            <a key={a.key} href={a.href} className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold transition ${a.primary ? 'btn' : 'btn'}`}>
                              {a.primary ? <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-90 mr-1" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> : null}
                              <span>{a.label}</span>
                            </a>
                          );
                        })}
                      </div>
                    </div>

                    {/* (Header intentionally minimal: only name, subtitle, actions) */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact section: single place for contact details */}
          {(profile.phone || profile.email || profile.website || profile.address) && (
            <section className="mt-8 px-6 sm:px-8 space-y-4">
              <h2 className="font-semibold text-[15px] flex items-center gap-2"><span className={`inline-block w-1 h-5 rounded ${accentBg} dark:bg-sky-500`} />Thông tin liên hệ</h2>
              <div className="grid grid-cols-1 gap-3">
                {profile.phone && (
                  <div className={`flex items-center justify-between gap-3 p-3 rounded-lg ${rowBgClass} dark:bg-gray-800/60 border border-black/5 dark:border-white/5 hover:shadow-md hover:-translate-y-0.5 transition`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-black/10 grid place-items-center text-emerald-600">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.09 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72c.12.84.36 1.66.72 2.42a2 2 0 0 1-.45 2.11L9.91 9.91a16 16 0 0 0 6 6l1.66-1.66a2 2 0 0 1 2.11-.45c.76.36 1.58.6 2.42.72A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="truncate font-medium">{profile.phone}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`tel:${profile.phone}`} className="btn-sm btn-ghost">Gọi</a>
                      <button onClick={()=>copyToClipboard(profile.phone,'Số điện thoại')} className="btn-sm btn-ghost">Sao chép</button>
                    </div>
                  </div>
                )}

                {profile.email && (
                  <div className={`flex items-center justify-between gap-3 p-3 rounded-lg ${rowBgClass} dark:bg-gray-800/60 border border-black/5 dark:border-white/5 hover:shadow-md hover:-translate-y-0.5 transition`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-black/10 grid place-items-center text-indigo-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 8.5v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M3 8.5l8.5 5L20 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="truncate font-medium">{profile.email}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`mailto:${profile.email}`} className="btn-sm btn-ghost">Gửi</a>
                      <button onClick={()=>copyToClipboard(profile.email,'Email')} className="btn-sm btn-ghost">Sao chép</button>
                    </div>
                  </div>
                )}

                {profile.website && (
                  <div className={`flex items-center justify-between gap-3 p-3 rounded-lg ${rowBgClass} dark:bg-gray-800/60 border border-black/5 dark:border-white/5 hover:shadow-md hover:-translate-y-0.5 transition`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white dark:bg-white border border-black/10 grid place-items-center overflow-hidden">
                        <BrandFavicon url={profile.website} label={getHost(profile.website)} size={20} />
                      </div>
                      <div className="truncate font-medium">{profile.website.replace(/^https?:\/\//,'').replace(/\/$/,'')}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={normalizeUrl(profile.website)} target="_blank" rel="noreferrer" className="btn-sm btn-ghost">Mở</a>
                      <button onClick={()=>copyToClipboard(profile.website,'Website')} className="btn-sm btn-ghost">Sao chép</button>
                    </div>
                  </div>
                )}

                {profile.address && (
                  <div className={`flex items-center justify-between gap-3 p-3 rounded-lg ${rowBgClass} dark:bg-gray-800/60 border border-black/5 dark:border-white/5 hover:shadow-md hover:-translate-y-0.5 transition`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white border border-black/10 grid place-items-center text-rose-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1 1 18 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="truncate font-medium">{profile.address}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`} target="_blank" rel="noreferrer" className="btn-sm btn-ghost">Bản đồ</a>
                      <button onClick={()=>copyToClipboard(profile.address,'Địa chỉ')} className="btn-sm btn-ghost">Sao chép</button>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Intro Section: prefer profile.intro; fallback to memory.description/content */}
          {(profile.intro || memory?.description || memory?.content) && (
            <section className="mt-8 px-6 sm:px-8 space-y-4">
              <h2 className="font-semibold text-[15px] flex items-center gap-2"><span className="inline-block w-1 h-5 rounded bg-slate-900 dark:bg-sky-500" />Giới thiệu</h2>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700 dark:text-slate-300">{profile.intro ?? memory.description ?? memory.content}</p>
            </section>
          )}

          {/* Share modal (simple) */}
          {showShare && (
            <div className="tb-modal-backdrop" onClick={()=>setShowShare(false)}>
              <div className="tb-modal-card" onClick={e=>e.stopPropagation()}>
                <div className="space-y-3 text-center">
                  <h3 className="text-lg font-semibold">Chia sẻ danh thiếp</h3>
                  <div className="w-44 h-44 mx-auto rounded-lg overflow-hidden bg-gray-100 grid place-items-center">QR</div>
                  <div className="text-sm text-gray-600 break-all">{window.location.origin}/c/{slug}</div>
                  <div className="flex gap-2 justify-center">
                    <button className="btn" onClick={()=>{ copyToClipboard(`${window.location.origin}/c/${slug}`, 'Link chia sẻ'); setShowShare(false); }}>Sao chép link</button>
                    <button className="btn btn-outline" onClick={()=>setShowShare(false)}>Đóng</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social list row version with domain-based icons */}
          {!!profile.socials?.length && (
            <section className="mt-8 px-6 sm:px-8 space-y-4">
              <h2 className="font-semibold text-[15px] flex items-center gap-2"><span className="inline-block w-1 h-5 rounded bg-slate-900 dark:bg-sky-500" />Mạng xã hội</h2>
              <div className="flex flex-wrap gap-3">
                {profile.socials.map((s, i) => {
                  const host = getHost(s.url);
                  const display = s.label || host || 'Link';
                  return (
                    <a
                      key={i}
                      href={normalizeUrl(s.url)}
                      target="_blank"
                      rel="noreferrer"
                      className="h-10 pl-2 pr-4 rounded-full bg-white dark:bg-gray-800 hover:shadow-lg text-sm inline-flex items-center gap-2 font-medium transition border border-black/5 dark:border-white/5"
                    >
                      <span className="w-8 h-8 rounded-md bg-white border border-black/10 grid place-items-center overflow-hidden">
                        <BrandFavicon url={s.url} label={s.label} size={18} />
                      </span>
                      <span className="truncate max-w-[12rem]">{display}</span>
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {/* Contact Section (removed; consolidated above) */}

          {/* Gallery / Inspiration Images */}
          {!!memory?.media?.length && (
            <section className="mt-8 px-6 space-y-4">
              <h2 className="font-semibold text-[15px] flex items-center gap-2"><span className="inline-block w-1 h-5 rounded bg-[#031a2c] dark:bg-sky-500" />Hình ảnh truyền cảm hứng</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {memory.media.slice(0, 6).map((m, i) => (
                  <div key={i} className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {m.type === 'image' ? <img loading="lazy" src={m.url} alt={m.caption || ''} className="w-full h-full object-cover" /> : <div className="w-full h-full grid place-items-center text-xl">🎥</div>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Video (take first video media if exists) */}
          {memory?.media?.some(m => m.type === 'video') && (
            <section className="mt-8 px-6 space-y-4">
              <h2 className="font-semibold text-[15px] flex items-center gap-2"><span className="inline-block w-1 h-5 rounded bg-[#031a2c] dark:bg-sky-500" />Video</h2>
              <div className="rounded-xl overflow-hidden bg-black aspect-video grid place-items-center text-white text-sm">Video</div>
            </section>
          )}

          {/* Map placeholder if address */}
          {/* {profile.address && (
            <section className="mt-8 px-6 space-y-4">
              <h2 className="font-semibold text-[15px] flex items-center gap-2"><span className="inline-block w-1 h-5 rounded bg-[#031a2c] dark:bg-sky-500" />Bản đồ</h2>
              <div className="w-full aspect-[5/3] rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-800 relative"> */}
                {/* Hide iframe on small screens to save resources; provide link instead */}
                {/* <div className="hidden sm:block absolute inset-0">
                  <iframe
                    title="map"
                    className="absolute inset-0 w-full h-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/search?key=AIzaSyD-PLACEHOLDER&q=${encodeURIComponent(profile.address)}`}
                  />
                </div>
                <a className="block sm:hidden w-full h-full flex items-center justify-center text-sm text-blue-600 dark:text-blue-400" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(profile.address)}`} target="_blank" rel="noreferrer">Mở bản đồ trên Google Maps</a>
              </div>
            </section>
          )} */}

          <footer className="mt-12 px-6 text-center pb-12 text-[12px] text-gray-500 dark:text-gray-500">© 2025 TouchBack</footer>
        </>
      )}
    </div>
  );
}
