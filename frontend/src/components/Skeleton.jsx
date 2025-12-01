import React from 'react';

export function Skeleton({ className='' }){
  return <div className={`skeleton ${className}`} />;
}

export function SkeletonText({ lines=3 }){
  return <div className="space-y-2">
    {Array.from({length:lines}).map((_,i)=>(
      <div key={i} className="skeleton h-3 w-full rounded" style={{animationDelay: `${i*60}ms`}} />
    ))}
  </div>;
}

export function ProductCardSkeleton(){
  return <div className="card space-y-3 animate-pulse">
    <div className="h-4 w-1/2 skeleton" />
    <div className="h-3 skeleton w-full" />
    <div className="h-3 skeleton w-5/6" />
    <div className="h-3 skeleton w-2/3" />
    <div className="h-4 skeleton w-24" />
  </div>;
}

export function MemoryCardSkeleton(){
  return <div className="card space-y-3 animate-pulse">
    <div className="h-4 w-2/3 skeleton" />
    <div className="h-3 skeleton w-full" />
    <div className="h-3 skeleton w-4/5" />
    <div className="h-3 skeleton w-2/3" />
  </div>;
}
