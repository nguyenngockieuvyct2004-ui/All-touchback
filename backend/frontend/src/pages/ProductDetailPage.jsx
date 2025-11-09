import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api.js';
import ErrorMessage from '../components/ErrorMessage.jsx';
import { ProductCardSkeleton } from '../components/Skeleton.jsx';
import { fullUrl, thumbUrl } from '../lib/images.js';
import ResponsiveImage from '../components/ResponsiveImage.jsx';

export default function ProductDetailPage(){
  const { id } = useParams();
  const [product,setProduct] = useState(null);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState('');
  const [adding,setAdding] = useState(false);
  const [addMsg,setAddMsg] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  // Lựa chọn mục đích mua: 'memory' (A) hay 'nfc' (B)
  const [purpose,setPurpose] = useState('memory');

  useEffect(()=>{
    api.get(`/products`)
      .then(r=>{ const found = r.data.find(p=>p._id===id); setProduct(found); if(!found) setError('Không tìm thấy sản phẩm'); })
      .catch(()=> setError('Tải sản phẩm thất bại'))
      .finally(()=> setLoading(false));
  },[id]);

  async function addToCart(){
    setAdding(true); setAddMsg('');
    try {
      await api.post('/cart/add', { productId: id, quantity: 1, purpose });
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
          {/* Main image (auto handles portrait/landscape) */}
          <ResponsiveImage
            src={product.images[activeIdx]}
            alt={`Ảnh sản phẩm ${activeIdx + 1}`}
            ratio="aspect-video"
            sizes="(min-width: 1024px) 800px, 100vw"
            autoRatio
            framed
            hoverZoom={false}
          />
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
      {/* Chọn mục đích sử dụng (theo yêu cầu: A hoặc B) */}
      <div className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-2">
          <button type="button" onClick={()=>setPurpose('memory')} className={`p-3 rounded-lg border transition text-left ${purpose==='memory' ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-900/20' : 'border-border hover:border-foreground/30'}`}>
            <div className="font-medium">A. Lưu trữ ảnh/video</div>
            <div className="text-xs text-muted-foreground">Sau khi thanh toán, hệ thống sẽ tự tạo trang Memories để bạn tải ảnh/video, tiêu đề và nội dung.</div>
          </button>
          <button type="button" onClick={()=>setPurpose('nfc')} className={`p-3 rounded-lg border transition text-left ${purpose==='nfc' ? 'border-brand-600 bg-brand-50/60 dark:bg-brand-900/20' : 'border-border hover:border-foreground/30'}`}>
            <div className="font-medium">B. Danh thiếp</div>
            <div className="text-xs text-muted-foreground">Sau khi thanh toán, hệ thống sẽ tự tạo thẻ NFC ở trang /nfc để bạn điền hồ sơ và chia sẻ.</div>
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4 pt-2">
        <button onClick={addToCart} disabled={adding} className="btn btn-primary">
          {adding? 'Đang thêm...' : 'Thêm vào giỏ'}
        </button>
        {addMsg && <p className="text-sm text-emerald-600 dark:text-emerald-400">{addMsg}</p>}
      </div>
    </div>}
  </div>;
}
