import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api.js';

export default function PublicMemoryPage({ standalone = false }){
  const { slug } = useParams();
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [curIdx, setCurIdx] = useState(0);
  const viewportRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragDX, setDragDX] = useState(0);

  useEffect(()=>{
    setLoading(true);
    api.get(`/public/memories/${slug}`)
      .then(r=> setData(r.data))
      .catch(e=> setError(e.response?.data?.message || 'Không tìm thấy'))
      .finally(()=> setLoading(false));
  },[slug]);

  useEffect(()=>{
    const a = audioRef.current;
    if(!a) return;
    const onTime = ()=>{
      if(!a.duration) return;
      setProgress(Math.min(100, (a.currentTime / a.duration) * 100));
    };
    a.addEventListener('timeupdate', onTime);
    return ()=> a.removeEventListener('timeupdate', onTime);
  },[data?.bgAudioUrl]);

  const firstImage = useMemo(()=> data?.coverImageUrl || data?.media?.find(m=> m.type==='image')?.url || null, [data]);
  const images = useMemo(()=> {
    const all = (data?.media||[]).filter(m=> m.type==='image');
    if(!data?.coverImageUrl) return all;
    return all.filter(m=> m.url !== data.coverImageUrl);
  }, [data]);

  // Nếu standalone: phủ toàn màn hình, tự có nền, không navbar/footer của site
  return (
    <div className={`${standalone ? 'min-h-screen' : ''} bg-gradient-to-br from-pink-50 via-indigo-50 to-teal-50 dark:from-[#151122] dark:via-[#101a2a] dark:to-[#0a1616]`}>
      <div className="w-full max-w-[980px] mx-auto px-4 sm:px-6 pb-16">
        {loading && <div className="py-10 text-center text-gray-500">Đang tải...</div>}
        {!loading && error && <div className="py-10 text-center text-red-600">{error}</div>}

        {!loading && !error && data && (
          <div className={`${standalone ? 'pt-8 sm:pt-12' : 'mt-6'}`}>
            {/* Khung trình bày kiểu cửa sổ ứng dụng + nền pastel giống mockup */}
            <div className="rounded-2xl overflow-hidden shadow-xl border border-black/5 bg-gradient-to-br from-pink-100 via-indigo-100 to-teal-100 dark:from-[#241a35] dark:via-[#1a243a] dark:to-[#0e1c1c]">
              {/* Thanh tiêu đề giả lập cửa sổ */}
              <div className="h-11 px-4 flex items-center gap-2 bg-white/70 dark:bg-white/5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
                <div className="ml-3 text-xs text-gray-500 dark:text-gray-400 select-none">MEMORY</div>
              </div>

              {/* Nội dung */}
              <div className="p-6 md:p-10">
                {/* Ảnh preview lớn nếu có */}
                <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden border border-black/10 bg-white/70 dark:bg-white/5">
                  <div className="aspect-video grid place-items-center">
                    {firstImage ? (
                      <img loading="lazy" src={firstImage} alt={data.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-5xl">🖼️</div>
                    )}
                  </div>
                  {/* Player thật cho nhạc nền (nếu có) */}
                  {data?.bgAudioUrl && (
                    <div className="px-5 py-3 border-t border-black/10 bg-white/70 dark:bg-white/5 flex items-center gap-3">
                      <button
                        onClick={()=>{ const a = audioRef.current; if(!a) return; if(a.paused){ a.play(); setPlaying(true);} else { a.pause(); setPlaying(false);} }}
                        className="w-9 h-9 rounded-full bg-white border border-black/10 grid place-items-center text-gray-700 dark:text-gray-300"
                        aria-label={playing? 'Tạm dừng':'Phát'}
                      >{playing? '❚❚':'▶'}</button>
                      <input type="range" min="0" max="100" value={progress} onChange={(e)=>{ const a = audioRef.current; if(!a || !a.duration) return; const v = Number(e.target.value); setProgress(v); a.currentTime = (v/100)*a.duration; }} className="flex-1 h-2 rounded-full accent-indigo-500" />
                      <div className="text-lg">🎵</div>
                      <audio ref={audioRef} src={data.bgAudioUrl} autoPlay loop onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} />
                    </div>
                  )}
                </div>

                {/* Tiêu đề + mô tả */}
                <div className="text-center mt-8 space-y-3">
                  <h1 className="text-2xl md:text-3xl font-semibold tracking-tight" style={{fontFamily:'ui-serif'}}>{data.title}</h1>
                  {data.description && (
                    <p className="max-w-2xl mx-auto text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                      {data.description}
                    </p>
                  )}
                </div>

                {/* Album ảnh: grid dọc hoặc carousel */}
                {!!images.length && (
                  data.galleryStyle === 'carousel' ? (
                    <div className="mt-8">
                      <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white/70 dark:bg-white/5">
                        {/* Slides viewport (no native scroll) */}
                        <div
                          ref={viewportRef}
                          className={`w-full overflow-hidden ${dragging? 'cursor-grabbing select-none' : 'cursor-grab'}`}
                          onPointerDown={(e)=>{
                            if(e.pointerType === 'mouse' && e.button !== 0) return; // only left
                            setDragging(true); setDragStartX(e.clientX); setDragDX(0); e.currentTarget.setPointerCapture?.(e.pointerId);
                          }}
                          onPointerMove={(e)=>{
                            if(!dragging) return; setDragDX(e.clientX - dragStartX);
                          }}
                          onPointerUp={(e)=>{
                            if(!dragging) return; const el = viewportRef.current; const width = el?.clientWidth || 1; const delta = dragDX;
                            const threshold = width * 0.2;
                            let next = curIdx;
                            if(delta > threshold) next = Math.max(0, curIdx - 1);
                            else if(delta < -threshold) next = Math.min(images.length - 1, curIdx + 1);
                            setCurIdx(next); setDragging(false); setDragDX(0);
                            e.currentTarget.releasePointerCapture?.(e.pointerId);
                          }}
                          onPointerLeave={(e)=>{ if(!dragging) return; setDragging(false); setDragDX(0); e.currentTarget.releasePointerCapture?.(e.pointerId); }}
                        >
                          <div className="flex w-full transition-transform duration-500 ease-out"
                               style={{ transform: `translateX(calc(-${curIdx * 100}% + ${dragging && viewportRef.current ? (dragDX / viewportRef.current.clientWidth) * 100 : 0}%))` }}>
                            {images.map((m,i)=> (
                              <div key={i} className="shrink-0 w-full">
                                <div className="p-3">
                                  <div className="rounded-xl overflow-hidden aspect-video bg-black/10">
                                    <img loading="lazy" src={m.url} alt={m.caption||''} className="w-full h-full object-cover" />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Nav arrows */}
                        {images.length > 1 && (
                          <>
                            <button
                              aria-label="Prev"
                              className="absolute left-2 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full bg-white/80 dark:bg-white/10 border border-black/10 shadow hover:scale-105 transition"
                              onClick={()=> setCurIdx((curIdx - 1 + images.length) % images.length)}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
                            </button>
                            <button
                              aria-label="Next"
                              className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center w-9 h-9 rounded-full bg-white/80 dark:bg-white/10 border border-black/10 shadow hover:scale-105 transition"
                              onClick={()=> setCurIdx((curIdx + 1) % images.length)}
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6"/></svg>
                            </button>
                          </>
                        )}

                        {/* Dots */}
                        {images.length > 1 && (
                          <div className="py-3 flex justify-center gap-2">
                            {images.map((_,i)=> (
                              <button key={i} aria-label={`Go to slide ${i+1}`} onClick={()=> setCurIdx(i)} className={`w-2.5 h-2.5 rounded-full ${curIdx===i? 'bg-gradient-to-r from-indigo-500 to-fuchsia-500':'bg-gray-300 dark:bg-gray-600'}`} />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {images.map((m,i)=> (
                        <div key={i} className="rounded-xl overflow-hidden border border-black/10 bg-white/60 dark:bg-white/5">
                          <img loading="lazy" src={m.url} alt={m.caption||''} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )
                )}

                {/* CTA cuối trang */}
                <div className="mt-12">
                  <div className="max-w-xl mx-auto text-center text-[13px] md:text-sm text-gray-700 dark:text-gray-300">
                    Tạo ký ức lưu trữ của riêng bạn tại đây
                  </div>
                  <div className="mt-3 flex justify-center">
                    <a href="/" className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-medium shadow-lg hover:brightness-110 transition">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2 7-7 7 7 2 2"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/></svg>
                      <span>Về trang chủ TouchBack</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Standalone: không có footer chung; có thể giữ bản quyền rất nhỏ nếu muốn */}
            {standalone ? null : <div className="text-center text-[11px] mt-6 text-gray-500">© 2025 TouchBack</div>}
          </div>
        )}
      </div>
    </div>
  );
}
