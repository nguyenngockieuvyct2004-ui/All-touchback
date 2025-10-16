import React from 'react';

export default function ComingSoon({ title = 'Coming soon', subtitle }){
  return (
    <div className="max-w-3xl mx-auto text-center space-y-6">
      <div className="relative inline-flex">
        <span className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-fuchsia-500/30 via-sky-400/30 to-emerald-400/30 blur" />
        <div className="relative w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-fuchsia-600 to-sky-500 text-white grid place-items-center shadow-xl">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-90">
            <path d="M12 2l9 5-9 5-9-5 9-5z"/>
            <path d="M3 12l9 5 9-5"/>
            <path d="M3 17l9 5 9-5"/>
          </svg>
        </div>
      </div>
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight gradient-text">{title}</h1>
      <p className="text-sm text-muted-foreground">
        {subtitle || 'Tính năng đang được phát triển. Hãy quay lại sau nhé!'}
      </p>
      <div className="mt-6">
        <a href="/" className="btn">Về trang chủ</a>
      </div>
    </div>
  );
}
