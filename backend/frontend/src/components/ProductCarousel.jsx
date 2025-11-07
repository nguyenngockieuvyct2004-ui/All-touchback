import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';

export default function ProductCarousel({ products = [] }){
  const [idx, setIdx] = useState(0);
  const len = products.length;
  const timer = useRef(null);
  const containerRef = useRef(null);
  const [paused, setPaused] = useState(false);

  const startAuto = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    if (len > 1 && !paused) {
      timer.current = setInterval(() => setIdx(i => (i + 1) % len), 4500);
    }
  }, [len, paused]);

  const stopAuto = useCallback(() => {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
  }, []);

  useEffect(() => { startAuto(); return stopAuto; }, [startAuto, stopAuto]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') { setIdx(i => (i - 1 + len) % len); setPaused(true); }
      if (e.key === 'ArrowRight') { setIdx(i => (i + 1) % len); setPaused(true); }
    };
    el.addEventListener('keydown', onKey);
    return () => el.removeEventListener('keydown', onKey);
  }, [len]);

  useEffect(()=>{
    if(paused){ stopAuto(); const t = setTimeout(()=> setPaused(false), 5000); return ()=> clearTimeout(t); }
    startAuto();
  }, [paused, startAuto, stopAuto]);

  if (len === 0) return (
    <div className="text-center text-sm text-gray-500">Không có sản phẩm mẫu</div>
  );

  const prev = () => { setIdx(i => (i - 1 + len) % len); setPaused(true); };
  const next = () => { setIdx(i => (i + 1) % len); setPaused(true); };

  return (
    <div className="relative" ref={containerRef} tabIndex={0} aria-roledescription="carousel" aria-label="Sản phẩm mẫu">
      <div className="overflow-hidden rounded-md">
        <div className="flex transition-transform duration-500" style={{ transform: `translateX(-${idx * 100}%)` }}>
          {products.map((p, i) => (
            <article key={p.id || i} className="min-w-full px-2" aria-hidden={i!==idx}>
              <div className="card p-6 flex flex-col md:flex-row items-start gap-6 bg-white dark:bg-gray-900 border-black/5 dark:border-gray-800">
                <div className="w-full md:w-48 h-32 bg-gray-100 dark:bg-gray-800 rounded-md flex-shrink-0 overflow-hidden">
                  <img
                    src={p.image || 'https://via.placeholder.com/320x180?text=No+image'}
                    alt={p.title}
                    className="w-full h-full object-cover"
                    onError={(e)=>{ e.currentTarget.onerror = null; e.currentTarget.src = 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 120%22><rect width=%22200%22 height=%22120%22 fill=%22%23f3f4f6%22/><text x=%22100%22 y=%2266%22 font-size=%2216%22 text-anchor=%22middle%22 fill=%22%239ca3af%22 font-family=%22Segoe UI,Arial%22>No image</text></svg>'; }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-lg text-gray-900 dark:text-gray-100">{p.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{p.description}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <Link to={p.href || '/products'} className="btn btn-sm">Xem</Link>
                    <span className="text-sm text-gray-500">{p.price ? `₫${p.price}` : ''}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <button aria-label="Previous product" onClick={prev} onFocus={()=>setPaused(true)} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} className="btn btn-ghost btn-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">◀</button>
      </div>
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        <button aria-label="Next product" onClick={next} onFocus={()=>setPaused(true)} onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} className="btn btn-ghost btn-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500">▶</button>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2" role="tablist" aria-label="Product slides">
        {products.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i===idx}
            aria-controls={`slide-${i}`}
            id={`tab-${i}`}
            tabIndex={0}
            onClick={() => { setIdx(i); setPaused(true); }}
            onKeyDown={(e)=>{ if(e.key === 'Enter' || e.key === ' ') { setIdx(i); setPaused(true); e.preventDefault(); } }}
            className={`w-2 h-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${i === idx ? 'bg-gray-800 dark:bg-white' : 'bg-gray-300 dark:bg-gray-600'}`}
          />
        ))}
      </div>

      <div className="sr-only" aria-live="polite">Slide {idx+1} of {len}: {products[idx].title}</div>
    </div>
  );
}
