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
  const visCanvasRef = useRef(null);
  const tiltRef = useRef(null);
  const [showQR, setShowQR] = useState(false);
  const videoRef = useRef(null);
  const [vidPlaying, setVidPlaying] = useState(true);
  const [vidMuted, setVidMuted] = useState(true); // start muted for autoplay; unmute on user action

  useEffect(()=>{
    setLoading(true);
    api.get(`/public/memories/${slug}`)
      .then(r=> setData(r.data))
      .catch(e=> setError(e.response?.data?.message || 'Không tìm thấy'))
      .finally(()=> setLoading(false));
  },[slug]);

  // Restore timeupdate -> progress for background audio
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

  // Audio visualizer when bgAudioUrl is present
  useEffect(()=>{
    if(!data?.bgAudioUrl) return;
    const audioEl = audioRef.current;
    const canvas = visCanvasRef.current;
    if(!audioEl || !canvas) return;
  // Ensure volume reasonable (do not force mute/unmute toggles)
  try { if(audioEl.volume === 0) audioEl.volume = 1.0; } catch {}
    let audioCtx, analyser, source, rafId;
    const ctx = canvas.getContext('2d');
    const DPR = window.devicePixelRatio || 1;

    const resize = () => {
      const w = canvas.clientWidth || 600; const h = canvas.clientHeight || 42;
      if(canvas.width !== w*DPR || canvas.height !== h*DPR){ canvas.width = w*DPR; canvas.height = h*DPR; }
      ctx.setTransform(DPR,0,0,DPR,0,0);
    };
    const draw = (dataArray) => {
      resize(); const w = canvas.clientWidth; const h = canvas.clientHeight; ctx.clearRect(0,0,w,h);
      const grad = ctx.createLinearGradient(0,0,w,0); grad.addColorStop(0,'#8b5cf6'); grad.addColorStop(0.5,'#22d3ee'); grad.addColorStop(1,'#60a5fa'); ctx.fillStyle = grad;
      const barCount = dataArray.length; const barW = Math.max(2, Math.floor(w/(barCount*1.3))); let x = 10;
      for(let i=0;i<barCount;i++){ const v = dataArray[i]/255; const barH = Math.max(4, v*(h-10)); const y = (h-barH)/2; const r = Math.min(6, barW/2);
        ctx.beginPath(); ctx.moveTo(x, y+r); ctx.arcTo(x,y, x+r,y, r); ctx.lineTo(x+barW-r, y); ctx.arcTo(x+barW,y, x+barW,y+r, r);
        ctx.lineTo(x+barW, y+barH-r); ctx.arcTo(x+barW,y+barH, x+barW-r,y+barH, r); ctx.lineTo(x+r, y+barH); ctx.arcTo(x,y+barH, x,y+barH-r, r);
        ctx.closePath(); ctx.fill(); x += barW+6; }
    };
    let bufferLength, dataArray;
    const setup = () => {
      try {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        source = audioCtx.createMediaElementSource(audioEl);
        source.connect(analyser);
        analyser.connect(audioCtx.destination); // output via Web Audio graph
        const loop = () => { analyser.getByteFrequencyData(dataArray); draw(dataArray); rafId = requestAnimationFrame(loop); };
        loop();
      } catch {}
    };
    const onPlay = async () => {
      try {
        if(!audioCtx || !source) setup();
        if(audioCtx && audioCtx.state === 'suspended') await audioCtx.resume();
      } catch {}
    };
    audioEl.addEventListener('play', onPlay);
    const t = setTimeout(()=>{ if(!source && !audioEl.paused) setup(); }, 300);
    return ()=>{ clearTimeout(t); audioEl.removeEventListener('play', onPlay); if(rafId) cancelAnimationFrame(rafId); try{ source&&source.disconnect(); analyser&&analyser.disconnect(); audioCtx&&audioCtx.close(); }catch{} };
  },[data?.bgAudioUrl]);

  const firstVideo = useMemo(()=> data?.media?.find(m=> m.type==='video') || null, [data]);
  const firstImage = useMemo(()=> data?.coverImageUrl || data?.media?.find(m=> m.type==='image')?.url || null, [data]);
  const images = useMemo(()=> {
    const all = (data?.media||[]).filter(m=> m.type==='image');
    if(!data?.coverImageUrl) return all;
    return all.filter(m=> m.url !== data.coverImageUrl);
  }, [data]);

  // Auto-play carousel every 5 seconds (pause during drag)
  useEffect(()=>{
    if(!images.length || data?.galleryStyle !== 'carousel') return;
    const id = setInterval(()=>{ if(!dragging) setCurIdx(idx => (idx+1) % images.length); }, 5000);
    return ()=> clearInterval(id);
  }, [images.length, data?.galleryStyle, dragging]);

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
                {/* Preview lớn: ưu tiên video nếu có, nếu không thì ảnh bìa/ảnh đầu tiên */}
                <div ref={tiltRef} className="max-w-3xl mx-auto rounded-2xl overflow-hidden border border-black/10 bg-white/70 dark:bg-white/5 tb-tilt"
                     onMouseMove={(e)=>{
                       const el = tiltRef.current; if(!el) return; const r = el.getBoundingClientRect();
                       const x = (e.clientX - r.left)/r.width; const y = (e.clientY - r.top)/r.height;
                       const rx = (0.5 - y) * 6; const ry = (x - 0.5) * 8; el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg)`;
                     }}
                     onMouseLeave={()=>{ const el = tiltRef.current; if(el) el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)'; }}>
                  <div className="aspect-video relative grid place-items-center bg-black">
                    {firstVideo ? (
                      <>
                        <video
                          ref={videoRef}
                          src={firstVideo.url}
                          poster={firstImage || undefined}
                          className="w-full h-full object-contain object-center"
                          playsInline
                          muted={vidMuted}
                          controls
                          autoPlay
                          loop
                          onPlay={()=> setVidPlaying(true)}
                          onPause={()=> setVidPlaying(false)}
                        />
                        {/* Overlay controls (play/pause + mute) */}
                        <div className="absolute bottom-3 right-3 flex gap-2">
                          {/* <button
                            aria-label={vidPlaying? 'Tạm dừng video':'Phát video'}
                            onClick={()=>{
                              const v = videoRef.current; if(!v) return;
                              if(v.paused){ v.play(); } else { v.pause(); }
                            }}
                            className="px-3 h-9 rounded-full bg-white/90 dark:bg-white/20 backdrop-blur border border-black/10 text-sm shadow"
                          >{vidPlaying? 'Pause':'Play'}</button> */}
                          {/* <button
                            aria-label={vidMuted? 'Bật tiếng':'Tắt tiếng'}
                            onClick={()=>{ const v = videoRef.current; if(!v) return; const next = !vidMuted; setVidMuted(next); v.muted = next; if(!next){ try{ v.volume = Math.max(0.6, v.volume||0.6); }catch{} } }}
                            className="px-3 h-9 rounded-full bg-white/90 dark:bg-white/20 backdrop-blur border border-black/10 text-sm shadow"
                          >{vidMuted? 'Unmute':'Mute'}</button> */}
                        </div>
                      </>
                    ) : firstImage ? (
                      <img loading="lazy" src={firstImage} alt={data.title} className="w-full h-full object-contain object-center" />
                    ) : (
                      <div className="text-5xl">🖼️</div>
                    )}
                  </div>
                  {/* Player thật cho nhạc nền (nếu có) */}
                  {data?.bgAudioUrl && (
                    <div className="px-5 py-3 border-t border-black/10 bg-white/70 dark:bg-white/5">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={()=>{ const a = audioRef.current; if(!a) return; if(a.paused){ a.play(); setPlaying(true);} else { a.pause(); setPlaying(false);} }}
                          className="w-9 h-9 rounded-full bg-white border border-black/10 grid place-items-center text-gray-700 dark:text-gray-300"
                          aria-label={playing? 'Tạm dừng':'Phát'}
                        >{playing? '❚❚':'▶'}</button>
                        <input type="range" min="0" max="100" value={progress} onChange={(e)=>{ const a = audioRef.current; if(!a || !a.duration) return; const v = Number(e.target.value); setProgress(v); a.currentTime = (v/100)*a.duration; }} className="flex-1 h-2 rounded-full accent-indigo-500" />
                        <div className="text-lg">🎵</div>
                        <audio ref={audioRef} src={data.bgAudioUrl} crossOrigin="anonymous" autoPlay loop onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} />
                      </div>
                      <div className="mt-2"><canvas ref={visCanvasRef} className="tb-visualizer" /></div>
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
                                    <img loading="lazy" src={m.url} alt={m.caption||''} className="w-full h-full object-contain object-center bg-black" />
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
                        <div key={i} className="rounded-xl overflow-hidden border border-black/10 bg-black">
                          <img loading="lazy" src={m.url} alt={m.caption||''} className="w-full h-full object-contain object-center" />
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
                  <div className="mt-3 flex items-stretch justify-center gap-3 whitespace-nowrap">
                    <a href="/" className="inline-flex items-center gap-2 h-11 px-6 rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 text-white font-medium shadow-lg hover:brightness-110 transition min-w-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12l2-2 7-7 7 7 2 2"/><path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"/></svg>
                      <span className="truncate">Về trang chủ TouchBack</span>
                    </a>
                    <button onClick={()=> setShowQR(true)} className="btn-share shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 3h8v8H3V3zm0 10h8v8H3v-8zm10-10h8v8h-8V3zm0 10h3v3h-3v-3zm5 0h3v3h-3v-3zm-5 5h3v3h-3v-3zm5 0h3v3h-3v-3z" fill="currentColor"/></svg>
                      Chia sẻ
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Standalone: không có footer chung; có thể giữ bản quyền rất nhỏ nếu muốn */}
            {standalone ? null : <div className="text-center text-[11px] mt-6 text-gray-500">© 2025 TouchBack</div>}
          </div>
        )}
      </div>
      {showQR && (
        <div className="tb-modal-backdrop" onClick={()=> setShowQR(false)}>
          <div className="tb-modal-card" onClick={(e)=> e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-3">Quét để mở kỷ niệm</h3>
            <img className="mx-auto rounded-lg" src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(window.location.href)}`} alt="QR" />
            <div className="mt-4 flex justify-between gap-2">
              <button className="btn btn-sm" onClick={()=> navigator.clipboard.writeText(window.location.href)}>Sao chép link</button>
              <button className="btn btn-sm" onClick={()=> setShowQR(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
