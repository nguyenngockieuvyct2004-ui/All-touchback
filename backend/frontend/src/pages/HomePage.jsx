import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatGroup from '../components/StatGroup.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import ProductCarousel from '../components/ProductCarousel.jsx';
import { IconCard, IconMemory, IconShop, IconLock, IconShield, IconLink } from '../icons';
import api from '../lib/api.js';

export default function HomePage(){
  const { user } = useAuth();
  const [statsState, setStatsState] = useState(stats);
  const [loadingStats, setLoadingStats] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(()=>{
    let mounted = true;
    async function load(){
      setLoadingStats(true);
      try{
        const res = await fetch('/api/stats');
        if(!res.ok) throw new Error('no stats');
        const data = await res.json();
        if(!mounted) return;
        setStatsState([
          { label: 'Thẻ NFC Demo', value: data.nfcCount ?? '—', desc: 'Tạo trong trang NFC' },
          { label: 'Kỷ niệm đã lưu', value: data.memoryCount ?? '—', desc: 'Xem trong Memories' },
          { label: 'Sản phẩm mẫu', value: data.productCount ?? '—', desc: '/products endpoint' },
          { label: 'Phiên bản', value: data.version ?? 'v0.1', desc: 'Demo preview' }
        ]);
      }catch(err){
        // keep defaults
        console.warn('failed to load stats', err);
      }finally{
        if(mounted) setLoadingStats(false);
      }
    }
    load();
    return ()=> mounted = false;
  }, []);

  useEffect(()=>{
    let mounted = true;
    setLoadingProducts(true);
    api.get('/products?limit=6').then(r=>{
      if(!mounted) return;
      const items = (r.data||[]).map(p=>({ id: p._id||p.id, title: p.name||p.title||'Sản phẩm', description: p.description||'', price: p.price?String(p.price):'', image: (p.images && p.images[0]) || p.image || '' , href: `/products/${p._id||p.id}`}));
      setProducts(items);
    }).catch(err=>{
      console.warn('load products failed', err);
    }).finally(()=>{ if(mounted) setLoadingProducts(false); });
    return ()=> mounted = false;
  }, []);
  return (
    <div className="space-y-20">
      <Hero />
      <div className="space-y-16">
        <section className="space-y-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Tính năng nổi bật</h2>
          <div className="grid-auto">
            {features.map(f=> (
              <div key={f.title} className="card card-hover group bg-[#fffdfa] dark:bg-gray-900 border-black/10 dark:border-gray-800 p-4">
                <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition bg-black/5 dark:bg-white/5 pointer-events-none" />
                <div className="flex items-start gap-3">
                  <span className="w-10 h-10 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl text-brand-600">{f.icon}</span>
                  <div>
                    <h3 className="font-medium text-lg mb-1 transition text-gray-900 dark:text-gray-100">{f.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="space-y-8">
          <h2 className="text-xl font-semibold">Sản phẩm nổi bật</h2>
          {loadingProducts ? (
            <div className="card p-6">
              <div className="h-32 animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          ) : (
            <ProductCarousel products={products.length ? products : sampleProducts} />
          )}
        </section>
        <section className="space-y-8">
          <h2 className="text-xl font-semibold">Số liệu nhanh</h2>
          {loadingStats ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({length:4}).map((_,i)=>(
                <div key={i} className="panel animate-pulse h-24" />
              ))}
            </div>
          ) : (
            <StatGroup stats={statsState} />
          )}
        </section>
        <section className="panel text-center py-16 relative overflow-hidden bg-[#fffdfa] dark:bg-gray-900 border-black/10 dark:border-gray-800">
          <div className="absolute inset-0 bg-gradient-to-r from-black/5 dark:from-white/5 to-transparent" />
          <div className="relative space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold">Bắt đầu tạo kỷ niệm của bạn</h2>
            <p className="max-w-2xl mx-auto text-sm md:text-base text-gray-700 dark:text-gray-400">Đăng ký ngay để trải nghiệm việc kết nối kỷ niệm với thẻ NFC và chia sẻ tức thì.</p>
            {!user ? (
              <div className="flex gap-4 justify-center">
                <Link to="/register" className="btn btn-lg">Đăng ký miễn phí</Link>
                <Link to="/products" className="btn-outline btn-lg">Xem sản phẩm</Link>
              </div>
            ) : (
              <div className="flex gap-4 justify-center">
                <Link to="/memories" className="btn btn-lg">Đi tới Memories</Link>
                <Link to="/nfc" className="btn-outline btn-lg">Quản lý thẻ NFC</Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function Hero(){
  const { user } = useAuth();
  return (
    <div className="hero relative">
      <div className="hero-glow" />
      <div className="hero-inner relative">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-4">
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/5 text-gray-800 dark:text-brand-300 text-xs font-medium">Phiên bản demo</p>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Một chạm chia sẻ tức thì bằng NFC</h1>
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-400 leading-relaxed">Gắn kỷ niệm vào thẻ NFC, tạo liên kết rút gọn và chia sẻ gọn, mọi thứ được bảo mật và dễ tìm.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <strong className="text-xl text-gray-900 dark:text-white">1.2k+</strong>
              <span>Người dùng</span>
            </div>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />
            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              <strong className="text-xl text-gray-900 dark:text-white">3k+</strong>
              <span>Kỷ niệm</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {!user ? (
              <>
                <Link to="/register" className="btn btn-lg shadow-focus">Bắt đầu</Link>
                <Link to="/login" className="btn-outline btn-lg">Đăng nhập</Link>
              </>
            ) : (
              <>
                <Link to="/memories" className="btn btn-lg shadow-focus">Mở Memories</Link>
                <Link to="/products" className="btn-outline btn-lg">Xem sản phẩm</Link>
              </>
            )}
            <div className="flex items-center gap-3 text-xs text-left text-gray-500 dark:text-gray-400">
              <div className="flex -space-x-2">
                {['#fde047','#38bdf8','#a78bfa'].map((c,i)=>(<span key={i} className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-gray-900" style={{background:c}} />))}
              </div>
              <span>Được xây dựng với React + Tailwind + Express</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const features = [
  { title: 'NFC Cards', desc: 'Tạo thẻ NFC gắn nhiều kỷ niệm, truy cập nhanh qua slug /m/<mã>.', icon: <IconCard />},
  { title: 'Memories', desc: 'Lưu trữ nội dung dạng văn bản, media và chia sẻ công khai hoặc riêng tư.', icon: <IconMemory />},
  { title: 'E-commerce', desc: 'Quản lý sản phẩm, giỏ hàng tích hợp chung nền tảng.', icon: <IconShop />},
  { title: 'Google Sign-In', desc: 'Đăng nhập nhanh bằng tài khoản Google (One Tap /OAuth).', icon: <IconLock />},
  { title: 'Role-based', desc: 'Phân quyền admin, manager, customer bảo mật API.', icon: <IconShield />},
  { title: 'API Ready', desc: 'RESTful endpoints rõ ràng dễ tích hợp.', icon: <IconLink />}
];

const stats = [
  { label: 'Thẻ NFC Demo', value: '—', desc: 'Tạo trong trang NFC' },
  { label: 'Kỷ niệm đã lưu', value: 'Live', desc: 'Xem trong Memories' },
  { label: 'Sản phẩm mẫu', value: 'API', desc: '/products endpoint' },
  { label: 'Phiên bản', value: 'v0.1', desc: 'Demo preview' }
];

const sampleProducts = [
  { id: 1, title: 'NFC Card - Classic', description: 'Thẻ NFC nhiều màu, in được logo.', price: '49.000', image: 'https://via.placeholder.com/320x180?text=Classic' },
  { id: 2, title: 'NFC Card - Premium', description: 'Metal finish, mã bảo mật.', price: '149.000', image: 'https://via.placeholder.com/320x180?text=Premium' },
  { id: 3, title: 'Gift Pack', description: 'Combo 3 thẻ + hộp quà.', price: '199.000', image: 'https://via.placeholder.com/320x180?text=Gift+Pack' }
];
