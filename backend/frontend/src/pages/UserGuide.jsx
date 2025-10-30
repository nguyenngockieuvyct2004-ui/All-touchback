import React from 'react';
import TBLogo from '../../assets/TBlogo.png';

// Small helper to smooth scroll for hash links on this page
function useSmoothScroll() {
  React.useEffect(() => {
    function onClick(e) {
      const el = e.target.closest('a[href^="#"]');
      if (!el) return;
      const id = el.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const header = document.querySelector('header.sticky');
        const offset = (header?.offsetHeight || 72) + 12; // add small gap
        const y = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
        history.replaceState(null, '', id); // update hash without jump
      }
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}

export default function UserGuide(){
  useSmoothScroll();
  const [openFaq, setOpenFaq] = React.useState(null);
  const tocRef = React.useRef(null);
  const [activeId, setActiveId] = React.useState('quick-start');
  const isProgramScroll = React.useRef(false);

  React.useEffect(() => {
    function onKey(e){
      if(e.key?.toLowerCase() === 't'){
        const firstLink = tocRef.current?.querySelector('a');
        if(firstLink){
          e.preventDefault();
          firstLink.focus();
        }
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Highlight TOC item based on section in view
  React.useEffect(() => {
    const ids = ['quick-start','browse-buy','memories','cards','account-orders','troubleshooting','faq','contact'];
    const nodes = ids.map(id => document.getElementById(id)).filter(Boolean);
    if (nodes.length === 0) return;
    const header = document.querySelector('header.sticky');
    const headerHeight = (header?.offsetHeight || 72) + 12;
    const observer = new IntersectionObserver((entries) => {
      if (isProgramScroll.current) return; // avoid overriding manual selection during smooth scroll
      // prioritize the entry nearest to top when multiple intersect
      const visible = entries.filter(e => e.isIntersecting).sort((a,b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
      if (visible[0]) { setActiveId(visible[0].target.id); return; }
      // fallback when scrolling fast
      const sorted = entries.sort((a,b) => a.boundingClientRect.top - b.boundingClientRect.top);
      const current = sorted.find(e => e.boundingClientRect.top >= 0) || sorted[sorted.length-1];
      if (current?.target?.id) setActiveId(current.target.id);
    }, { root: null, rootMargin: `-${headerHeight}px 0px -60% 0px`, threshold: [0, 0.1, 0.5, 1] });
    nodes.forEach(n => observer.observe(n));
    return () => observer.disconnect();
  }, []);

  const sections = [
    { id: 'quick-start', title: '1. Bắt đầu nhanh', badge: 'Mới' },
    { id: 'browse-buy', title: '2. Xem & mua sản phẩm' },
    { id: 'memories', title: '3. Memories — tạo & chỉnh sửa' },
    { id: 'cards', title: '4. Danh thiếp NFC — tạo & chia sẻ' },
    { id: 'account-orders', title: '5. Tài khoản & đơn hàng' },
    { id: 'troubleshooting', title: '6. Khắc phục sự cố' },
    { id: 'faq', title: '7. Câu hỏi thường gặp' },
    { id: 'contact', title: 'Liên hệ hỗ trợ' }
  ];

  return (
    <div className="page">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 mt-2">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
          {/* Sidebar */}
          <aside className="lg:sticky lg:top-6 h-max rounded-2xl border border-black/10 dark:border-white/10 bg-[#fffdfa]/80 dark:bg-gray-900/70 backdrop-blur p-4 print:hidden" aria-label="Mục lục Hướng dẫn sử dụng">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center overflow-hidden">
                <img src={TBLogo} alt="TouchBack" className="w-10 h-10 md:w-16 md:h-16 object-contain rounded pointer-events-none select-none" />
              </div>
              <div>
                <h1 className="text-base font-semibold leading-tight">Hướng dẫn sử dụng</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">TouchBack · Phiên bản 1.0</p>
              </div>
            </div>

            <nav aria-label="Mục lục" className="mt-3 space-y-1" ref={tocRef}>
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={(e)=>{
                    e.preventDefault();
                    e.stopPropagation();
                    const target = document.getElementById(s.id);
                    if(!target) return;
                    const header = document.querySelector('header.sticky');
                    const offset = (header?.offsetHeight || 72) + 12;
                    const y = target.getBoundingClientRect().top + window.scrollY - offset;
                    setActiveId(s.id);
                    isProgramScroll.current = true;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                    history.replaceState(null, '', `#${s.id}`);
                    setTimeout(() => { isProgramScroll.current = false; }, 350);
                  }}
                  aria-current={activeId === s.id ? 'true' : undefined}
                  className={(activeId === s.id
                    ? 'bg-black/10 dark:bg-white/10 text-gray-900 dark:text-gray-100 shadow-sm '
                    : 'hover:bg-black/5 dark:hover:bg-white/5 text-gray-700 dark:text-gray-300 ') + 'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition'}>
                  <span className="truncate">{s.title}</span>
                  {s.badge && (
                    <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full border border-black/10 dark:border-white/10 text-gray-500 dark:text-gray-400">{s.badge}</span>
                  )}
                </a>
              ))}
            </nav>

            <div className="mt-3 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200/70 dark:border-amber-500/30 text-[12px] text-amber-800 dark:text-amber-200">
              Nhấn phím "t" để focus vào mục lục. Dùng Tab/Shift+Tab để di chuyển.
            </div>

            <div className="mt-3 text-[12px] text-gray-500 dark:text-gray-400">
              <div><span className="font-medium">Cập nhật:</span> 30/10/2025</div>
            </div>
          </aside>

          {/* Main content */}
          <main className="space-y-4 print:text-black">
            {/* Hero */}
            <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 backdrop-blur p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="max-w-2xl text-center md:text-left">
                  <h2 className="text-xl font-semibold">Hướng dẫn nhanh sử dụng TouchBack</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Làm quen trong 5 phút — xem sản phẩm, mua hàng, tạo/chia sẻ Memories và Danh thiếp NFC.</p>
                </div>
                <div className="flex items-center gap-2 justify-center md:justify-end">
                  <a href="#quick-start" className="inline-flex items-center justify-center px-4 h-10 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium shadow whitespace-nowrap">Bắt đầu</a>
                  <a href="#contact" className="inline-flex items-center justify-center px-4 h-10 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-sm font-medium whitespace-nowrap">Yêu cầu hỗ trợ</a>
                </div>
              </div>
            </section>

            {/* Quick Start */}
            <section id="quick-start" className="scroll-mt-28 md:scroll-mt-32 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 p-5 print:bg-white print:border-0 print:shadow-none print:p-0">
              <h3 className="text-lg font-semibold">Bắt đầu nhanh</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Chỉ với 3 bước:</p>
              <ol className="mt-2 list-decimal list-inside space-y-1 text-sm">
                <li><strong>Tạo/đăng nhập tài khoản:</strong> vào Đăng ký/Đăng nhập từ menu.</li>
                <li><strong>Khám phá sản phẩm:</strong> vào Sản phẩm, chọn sản phẩm và Thêm vào giỏ.</li>
                <li><strong>Tạo nội dung:</strong> vào Memories/Danh thiếp để tạo và chia sẻ công khai.</li>
              </ol>
              <div className="grid md:grid-cols-2 gap-3 mt-3">
                <div className="p-3 rounded-xl border border-black/10 dark:border-white/10 bg-amber-50/60 dark:bg-amber-500/10">
                  <h4 className="font-medium">An toàn & riêng tư</h4>
                  <p className="text-sm text-amber-900/90 dark:text-amber-200">Bạn kiểm soát quyền riêng tư của Memories/Danh thiếp. Chỉ chia sẻ công khai khi sẵn sàng.</p>
                </div>
                <div className="p-3 rounded-xl border border-black/10 dark:border-white/10 bg-blue-50/60 dark:bg-blue-500/10">
                  <h4 className="font-medium">Hiệu suất</h4>
                  <p className="text-sm text-blue-900/90 dark:text-blue-200">Tối ưu ảnh trước khi tải lên để hiển thị nhanh và đẹp hơn.</p>
                </div>
              </div>
            </section>

            {/* Browse & Buy */}
            <section id="browse-buy" className="scroll-mt-28 md:scroll-mt-32 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 p-5 print:bg-white print:border-0 print:shadow-none print:p-0">
              <h3 className="text-lg font-semibold">Xem & mua sản phẩm</h3>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Vào mục <a className="underline" href="/products">Sản phẩm</a> để xem danh mục.</li>
                  <li>Nhấn 1 sản phẩm để xem chi tiết, chọn biến thể (nếu có) và Thêm vào giỏ.</li>
                  <li>Mở <a className="underline" href="/cart">Giỏ hàng</a> để cập nhật số lượng, nhập mã giảm giá (nếu có) và thanh toán.</li>
                  <li>Thanh toán thành công sẽ chuyển đến trang Xác nhận đơn hàng.</li>
                </ol>
                <div className="mt-2 grid md:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-black/10 dark:border-white/10">
                    <h4 className="font-medium">Mẹo</h4>
                    <p className="text-sm">Đăng nhập để theo dõi trạng thái đơn trong mục Đơn hàng.</p>
                  </div>
                  <div className="p-3 rounded-xl border border-black/10 dark:border-white/10">
                    <h4 className="font-medium">Sau khi mua NFC</h4>
                    <p className="text-sm">Kích hoạt thẻ tại <a className="underline" href="/nfc/activate">/nfc/activate</a> để liên kết với nội dung của bạn.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Memories */}
            <section id="memories" className="scroll-mt-28 md:scroll-mt-32 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 p-5 print:bg-white print:border-0 print:shadow-none print:p-0">
              <h3 className="text-lg font-semibold">Memories — tạo & chỉnh sửa</h3>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Vào <a className="underline" href="/memories">Memories</a> (cần đăng nhập).</li>
                  <li>Nhấn “Tạo mới” để bắt đầu hoặc chọn 1 Memory để chỉnh sửa.</li>
                  <li>Tải ảnh/video, thêm tiêu đề, mô tả, thẻ tag… rồi Lưu.</li>
                  <li>Chia sẻ công khai: chuyển trạng thái “Công khai” để tạo liên kết.</li>
                </ol>
                <div className="p-3 rounded-xl border border-black/10 dark:border-white/10">
                  <div className="font-medium">Xem công khai (public)</div>
                  <p>Người khác có thể xem qua liên kết công khai dạng: <code className="px-1 rounded bg-black/5 dark:bg-white/10">/pm/&lt;slug&gt;</code>. Ví dụ: <span className="whitespace-nowrap">https://touchback.vn/pm/ky-uc-cua-toi</span></p>
                </div>
              </div>
            </section>

            {/* NFC Cards */}
            <section id="cards" className="scroll-mt-28 md:scroll-mt-32 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 p-5 print:bg-white print:border-0 print:shadow-none print:p-0">
              <h3 className="text-lg font-semibold">Danh thiếp NFC — tạo & chia sẻ</h3>
              <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Vào <a className="underline" href="/nfc">Danh thiếp</a> (cần đăng nhập).</li>
                  <li>Tạo mới hoặc chỉnh sửa: thêm tên, ảnh, liên kết MXH, số điện thoại, email…</li>
                  <li>Gắn với thẻ vật lý: sau khi mua, kích hoạt tại <a className="underline" href="/nfc/activate">/nfc/activate</a>.</li>
                  <li>Chia sẻ công khai: bật Công khai để có link.</li>
                </ol>
                <div className="p-3 rounded-xl border border-black/10 dark:border-white/10">
                  <div className="font-medium">Xem công khai (public)</div>
                  <p>Liên kết công khai có dạng: <code className="px-1 rounded bg-black/5 dark:bg-white/10">/c/&lt;slug&gt;</code>. Ví dụ: <span className="whitespace-nowrap">https://touchback.vn/c/huy-ltm</span></p>
                </div>
              </div>
            </section>

            {/* Account & Orders */}
            <section id="account-orders" className="scroll-mt-28 md:scroll-mt-32 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 p-5 print:bg-white print:border-0 print:shadow-none print:p-0">
              <h3 className="text-lg font-semibold">Tài khoản & theo dõi đơn hàng</h3>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li><strong>Hồ sơ:</strong> xem/chỉnh sửa thông tin tại mục Hồ sơ.</li>
                <li><strong>Đổi mật khẩu:</strong> menu tài khoản → Đổi mật khẩu.</li>
                <li><strong>Đơn hàng:</strong> xem trạng thái và lịch sử tại mục Đơn hàng.</li>
              </ul>
            </section>

            {/* Troubleshooting */}
            <section id="troubleshooting" className="scroll-mt-28 md:scroll-mt-32 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 p-5 print:bg-white print:border-0 print:shadow-none print:p-0">
              <h3 className="text-lg font-semibold">Khắc phục sự cố</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 dark:text-gray-400">
                      <th className="text-left py-2 border-b border-black/10 dark:border-white/10">Vấn đề</th>
                      <th className="text-left py-2 border-b border-black/10 dark:border-white/10">Nguyên nhân</th>
                      <th className="text-left py-2 border-b border-black/10 dark:border-white/10">Giải pháp</th>
                    </tr>
                  </thead>
                  <tbody className="align-top">
                    <tr className="border-b border-black/5 dark:border-white/5">
                      <td className="py-2">Không lưu được Memory/Card</td>
                      <td className="py-2">Thiếu trường bắt buộc hoặc mạng chậm</td>
                      <td className="py-2">Kiểm tra các trường bắt buộc, thử lại khi mạng ổn định</td>
                    </tr>
                    <tr className="border-b border-black/5 dark:border-white/5">
                      <td className="py-2">Tải ảnh/video thất bại</td>
                      <td className="py-2">Dung lượng lớn, định dạng không hỗ trợ</td>
                      <td className="py-2">Giảm kích thước, dùng JPG/PNG/MP4; thử lại</td>
                    </tr>
                    <tr className="border-b border-black/5 dark:border-white/5">
                      <td className="py-2">Không truy cập được đường dẫn công khai</td>
                      <td className="py-2">Nội dung chưa bật Công khai hoặc slug sai</td>
                      <td className="py-2">Bật Công khai và kiểm tra đúng dạng /pm/&lt;slug&gt; hoặc /c/&lt;slug&gt;</td>
                    </tr>
                    <tr>
                      <td className="py-2">Thanh toán không thành công</td>
                      <td className="py-2">Gián đoạn cổng thanh toán</td>
                      <td className="py-2">Thử lại sau vài phút; nếu vẫn lỗi hãy liên hệ hỗ trợ</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="scroll-mt-28 md:scroll-mt-32 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 p-5 print:bg-white print:border-0 print:shadow-none print:p-0">
              <h3 className="text-lg font-semibold">Câu hỏi thường gặp</h3>
              <div className="mt-2 space-y-2">
                {[
                  { q: 'Có cần tài khoản để tạo Memories/Danh thiếp?', a: 'Có. Bạn cần đăng nhập để tạo, chỉnh sửa và quản lý nội dung của mình.' },
                  { q: 'Làm sao để chia sẻ công khai?', a: 'Bật công tắc “Công khai” trong trang chỉnh sửa. Hệ thống sẽ tạo link /pm/<slug> hoặc /c/<slug> dành cho chia sẻ.' },
                  { q: 'Tôi có thể ẩn lại nội dung đã chia sẻ không?', a: 'Bạn có thể tắt “Công khai” bất cứ lúc nào. Liên kết cũ sẽ không còn truy cập được.' },
                  { q: 'Thẻ NFC có bắt buộc không?', a: 'Không. Bạn có thể dùng TouchBack chỉ với liên kết. NFC giúp chạm để mở nhanh hơn.' }
                ].map((item, idx) => (
                  <div key={idx} className="border border-black/10 dark:border-white/10 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      className="w-full flex items-center justify-between text-left px-3 py-2 hover:bg-black/5 dark:hover:bg-white/5"
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      aria-expanded={openFaq === idx}
                    >
                      <span className="font-medium text-sm">{item.q}</span>
                      <span className="text-lg leading-none">{openFaq === idx ? '−' : '+'}</span>
                    </button>
                    {openFaq === idx && (
                      <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300 border-t border-black/10 dark:border-white/10">{item.a}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* Contact */}
            <section id="contact" className="scroll-mt-28 md:scroll-mt-32 rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 p-5 print:bg-white print:border-0 print:shadow-none print:p-0">
              <h3 className="text-lg font-semibold">Liên hệ hỗ trợ</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Nếu bạn không thể tự khắc phục, hãy liên hệ đội hỗ trợ TouchBack:</p>
              <div className="mt-2 text-sm">
                <div><span className="font-medium">Email:</span> servicetb01@gmail.com</div>
                <div><span className="font-medium">Hotline:</span> +84 368 822 490</div>
              </div>
            </section>

            <footer className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 print:hidden">
              <div>© {new Date().getFullYear()} TouchBack. All rights reserved.</div>
              {/* <div className="hidden sm:block">In trang này: Ctrl/Cmd + P</div> */}
            </footer>
          </main>
        </div>
      </div>
      {/* Print-specific styles to produce a clean printout */}
      <style>{`
        @media print {
          html, body { background: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          header.sticky { display: none !important; }
          .fixed { display: none !important; }
          .backdrop-blur { -webkit-backdrop-filter: none !important; backdrop-filter: none !important; }
          .grid { display: block !important; }
        }
      `}</style>
    </div>
  );
}
