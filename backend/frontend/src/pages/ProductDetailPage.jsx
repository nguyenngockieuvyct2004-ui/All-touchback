import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { ProductCardSkeleton } from '../components/Skeleton.jsx';
import { previewUrl, fullUrl, thumbUrl, makeSrcSet } from '../lib/images.js';

export default function ProductDetailPage(){
  const { id } = useParams();
  const [product,setProduct] = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [adding,setAdding] = useState(false);
  const [addMsg,setAddMsg] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(()=>{
    api.get(`/products`)
      .then(r=>{ const found = r.data.find(p=>p._id===id); setProduct(found); if(!found) setError('Không tìm thấy sản phẩm'); })
      .catch(()=> setError('Tải sản phẩm thất bại'))
      .finally(()=> setLoading(false));
  },[id]);

  async function addToCart(){
    setAdding(true); setAddMsg('');
    try {
      await api.post('/cart/add', { productId: id, quantity: 1 });
      setAddMsg('Đã thêm vào giỏ hàng');
    } catch(e){
      setAddMsg(e.response?.data?.message || 'Lỗi thêm giỏ hàng');
    } finally {
      setAdding(false);
    }
  }

  return <div className="space-y-6 max-w-4xl">
    {loading && <ProductCardSkeleton />}
    <ErrorMessage error={error} />
    {!loading && !error && !product && <div className="text-sm text-muted-foreground">Không tìm thấy sản phẩm.</div>}
    {!loading && product && <div className="panel space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 gradient-text">{product.name}</h1>
          <div className="text-primary font-semibold text-xl">{product.price?.toLocaleString()} đ</div>
        </div>
      </div>
      {/* Carousel with thumbnail selector */}
      {!!product.images?.length && (
        <div className="space-y-3">
          {/* Main image */}
          <div className="aspect-video rounded-lg overflow-hidden bg-muted">
            {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
            <img
              src={previewUrl(product.images[activeIdx])}
              srcSet={makeSrcSet(product.images[activeIdx])}
              sizes="(min-width: 1024px) 800px, 100vw"
              alt={`Ảnh sản phẩm ${activeIdx + 1}`}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {product.images.map((src, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={
                  'relative shrink-0 w-20 h-14 rounded-md overflow-hidden border transition ' +
                  (idx === activeIdx
                    ? 'border-brand-600 ring-2 ring-brand-400'
                    : 'border-border hover:border-foreground/30')
                }
                aria-label={`Chọn ảnh ${idx + 1}`}
              >
                {/* eslint-disable-next-line jsx-a11y/img-redundant-alt */}
                <img
                  src={thumbUrl(src)}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="prose max-w-none dark:prose-invert prose-sm leading-relaxed">
        {product.description?.split('\n').map((l,i)=><p key={i}>{l}</p>)}
      </div>
      <div className="flex items-center gap-4">
        <button onClick={addToCart} disabled={adding} className="btn btn-primary">
          {adding? 'Đang thêm...' : 'Thêm vào giỏ'}
        </button>
        {addMsg && <p className="text-sm text-emerald-600 dark:text-emerald-400">{addMsg}</p>}
      </div>
    </div>}
  </div>;
}
