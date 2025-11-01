import React, { useState } from 'react';
import { toast } from '../lib/toast.js';
import api from '../lib/api.js';

export default function ContactPage(){
  const [form, setForm] = useState({ name:'', email:'', phone:'', subject:'', message:'' });
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    if(!form.name || !form.email || !form.message){
      toast.error?.('Vui lòng điền đầy đủ tên, số điện thoại, email và nội dung.');
      return;
    }
    // Very lightweight email check
    const okEmail = /.+@.+\..+/.test(form.email);
    if(!okEmail){ toast.error?.('Email không hợp lệ.'); return; }
    try {
      setSubmitting(true);
      await api.post('/contact', form);
      toast.success?.('Đã gửi tin nhắn! Chúng tôi sẽ phản hồi sớm.');
  setForm({ name:'', email:'', phone:'', subject:'', message:'' });
    } catch (e) {
      toast.error?.(e.response?.data?.message || 'Gửi thất bại');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">📧 Gửi tin nhắn cho chúng tôi</h1>
      </div>

      {/* Wrapper card */}
      <div className="rounded-2xl overflow-hidden border border-black/5 bg-white shadow-xl grid grid-cols-1 md:grid-cols-2">
        {/* Left: gradient form using brand palette (purple → lavender → pink) */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-[#8056D3] via-[#AE84E6] to-[#D691E1] text-white">
          <h2 className="text-lg sm:text-xl font-semibold mb-6">Để lại lời nhắn</h2>
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm opacity-90">Họ và tên</label>
              <input
                name="name"
                value={form.name}
                onChange={onChange}
                placeholder="Nhập họ và tên của bạn"
                className="mt-1 block w-full bg-transparent border-0 border-b border-white/60 focus:border-white focus:ring-0 placeholder-white/70"
              />
            </div>
            <div>
              <label className="text-sm opacity-90">Số điện thoại</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={onChange}
                placeholder="Nhập số điện thoại (VD: 036 8822 490)"
                className="mt-1 block w-full bg-transparent border-0 border-b border-white/60 focus:border-white focus:ring-0 placeholder-white/70"
              />
            </div>
            <div>
              <label className="text-sm opacity-90">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="Nhập địa chỉ email (VD: you@example.com)"
                className="mt-1 block w-full bg-transparent border-0 border-b border-white/60 focus:border-white focus:ring-0 placeholder-white/70"
              />
            </div>
            <div>
              <label className="text-sm opacity-90">Chủ đề</label>
              <input
                name="subject"
                value={form.subject}
                onChange={onChange}
                placeholder="Nhập chủ đề bạn muốn trao đổi"
                className="mt-1 block w-full bg-transparent border-0 border-b border-white/60 focus:border-white focus:ring-0 placeholder-white/70"
              />
            </div>
            <div>
              <label className="text-sm opacity-90">Nội dung</label>
              <textarea
                name="message"
                rows={4}
                value={form.message}
                onChange={onChange}
                placeholder="Nhập nội dung tin nhắn của bạn..."
                className="mt-1 block w-full bg-transparent border-0 border-b border-white/60 focus:border-white focus:ring-0 placeholder-white/70 resize-y"
              />
            </div>
            <div className="pt-2">
              <button disabled={submitting} className="px-4 py-2 rounded-md bg-white/90 text-[#5b2bbf] font-medium shadow hover:bg-white disabled:opacity-60">
                {submitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
              </button>
            </div>
          </form>
        </div>

        {/* Right: contact info */}
        <div className="p-6 sm:p-8 bg-white">
          <h2 className="text-lg sm:text-xl font-semibold mb-6">Liên hệ với chúng tôi</h2>
          <p className="text-sm text-gray-600 mb-6">Chúng tôi luôn sẵn sàng lắng nghe ý kiến của bạn</p>

          <div className="space-y-5 text-sm">
            <div className="flex items-start gap-3">
              <span className="inline-flex w-9 h-9 rounded-full bg-gray-100 border border-black/5 items-center justify-center">📍</span>
              <div>
                <div className="text-gray-800 font-medium">Địa chỉ</div>
                <div className="text-gray-600">Ninh Kiều - Cần Thơ</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="inline-flex w-9 h-9 rounded-full bg-gray-100 border border-black/5 items-center justify-center">📞</span>
              <div>
                <div className="text-gray-800 font-medium">Di động</div>
                <a className="text-blue-600" href="tel:0368822490">036 8822 490</a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="inline-flex w-9 h-9 rounded-full bg-gray-100 border border-black/5 items-center justify-center">✉️</span>
              <div>
                <div className="text-gray-800 font-medium">Email</div>
                <a className="text-blue-600" href="mailto:Servicetb01@gmail.com">Servicetb01@gmail.com</a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="inline-flex w-9 h-9 rounded-full bg-gray-100 border border-black/5 items-center justify-center">🌐</span>
              <div>
                <div className="text-gray-800 font-medium">Website</div>
                <a className="text-blue-600" href="/">Touch Back</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
