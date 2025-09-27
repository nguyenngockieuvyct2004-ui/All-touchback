import React from 'react';
import { Link } from 'react-router-dom';
import StatGroup from '../components/StatGroup.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function HomePage(){
  const { user } = useAuth();
  return (
    <div className="space-y-20">
      <Hero />
      <div className="space-y-16">
        <section className="space-y-8">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Tính năng nổi bật</h2>
          <div className="grid-auto">
            {features.map(f=> <div key={f.title} className="card card-hover group">
              <div className="absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-br from-brand-600/10 to-brand-400/10 pointer-events-none" />
              <h3 className="font-medium text-lg mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">{f.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{f.desc}</p>
            </div>)}
          </div>
        </section>
        <section className="space-y-8">
          <h2 className="text-xl font-semibold">Số liệu nhanh</h2>
          <StatGroup stats={stats} />
        </section>
        <section className="panel text-center py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-brand-600/10 to-brand-400/10" />
          <div className="relative space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold">Bắt đầu tạo kỷ niệm của bạn</h2>
            <p className="max-w-2xl mx-auto text-sm md:text-base text-gray-600 dark:text-gray-400">Đăng ký ngay để trải nghiệm việc kết nối kỷ niệm với thẻ NFC và chia sẻ tức thì.</p>
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
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-600/10 text-brand-600 dark:text-brand-400 text-xs font-medium ring-1 ring-brand-600/20">Phiên bản demo</p>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight text-gradient">Kết nối kỷ niệm với công nghệ NFC</h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">TouchBack giúp bạn lưu giữ, tổ chức và chia sẻ kỷ niệm thông qua thẻ NFC và liên kết rút gọn bảo mật.</p>
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
  { title: 'NFC Cards', desc: 'Tạo thẻ NFC gắn nhiều kỷ niệm, truy cập nhanh qua slug /m/<mã>.'},
  { title: 'Memories', desc: 'Lưu trữ nội dung dạng văn bản, media và chia sẻ công khai hoặc riêng tư.'},
  { title: 'E-commerce', desc: 'Quản lý sản phẩm, giỏ hàng tích hợp chung nền tảng.'},
  { title: 'Google Sign-In', desc: 'Đăng nhập nhanh bằng tài khoản Google (One Tap / OAuth).'},
  { title: 'Role-based', desc: 'Phân quyền admin, manager, customer bảo mật API.'},
  { title: 'API Ready', desc: 'RESTful endpoints rõ ràng dễ tích hợp.'}
];

const stats = [
  { label: 'Thẻ NFC Demo', value: '—', desc: 'Tạo trong trang NFC' },
  { label: 'Kỷ niệm đã lưu', value: 'Live', desc: 'Xem trong Memories' },
  { label: 'Sản phẩm mẫu', value: 'API', desc: '/products endpoint' },
  { label: 'Phiên bản', value: 'v0.1', desc: 'Demo preview' }
];
