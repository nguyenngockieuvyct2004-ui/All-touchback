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
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Also update hash without jumping
        history.replaceState(null, '', id);
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
          <aside className="lg:sticky lg:top-6 h-max rounded-2xl border border-black/10 dark:border-white/10 bg-[#fffdfa]/80 dark:bg-gray-900/70 backdrop-blur p-4" aria-label="Mục lục Hướng dẫn sử dụng">
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
                <a key={s.id} href={`#${s.id}`} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-sm">
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
          <main className="space-y-4">
            {/* Hero */}
            <section className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 backdrop-blur p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="max-w-2xl">
                  <h2 className="text-xl font-semibold">Hướng dẫn nhanh sử dụng TouchBack</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Làm quen trong 5 phút — xem sản phẩm, mua hàng, tạo/chia sẻ Memories và Danh thiếp NFC.</p>
                </div>
                <div className="flex items-center gap-2">
                  <a href="#quick-start" className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-sm shadow">Bắt đầu</a>
                  <a href="#contact" className="inline-flex items-center justify-center px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 text-sm">Yêu cầu hỗ trợ</a>
                </div>
              </div>
            </section>

            {/* Quick Start */}
            <section id="quick-start" className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 p-5">
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
            <section id="browse-buy" className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 p-5">
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
            <section id="memories" className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 p-5">
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
            <section id="cards" className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 p-5">
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
            <section id="account-orders" className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 p-5">
              <h3 className="text-lg font-semibold">Tài khoản & theo dõi đơn hàng</h3>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <li><strong>Hồ sơ:</strong> xem/chỉnh sửa thông tin tại mục Hồ sơ.</li>
                <li><strong>Đổi mật khẩu:</strong> menu tài khoản → Đổi mật khẩu.</li>
                <li><strong>Đơn hàng:</strong> xem trạng thái và lịch sử tại mục Đơn hàng.</li>
              </ul>
            </section>

            {/* Troubleshooting */}
            <section id="troubleshooting" className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 p-5">
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
            <section id="faq" className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 p-5">
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
            <section id="contact" className="rounded-2xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-gray-900/50 p-5">
              <h3 className="text-lg font-semibold">Liên hệ hỗ trợ</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Nếu bạn không thể tự khắc phục, hãy liên hệ đội hỗ trợ TouchBack:</p>
              <div className="mt-2 text-sm">
                <div><span className="font-medium">Email:</span> support@touchback.vn</div>
                <div><span className="font-medium">Hotline:</span> +84 123 456 789</div>
              </div>
            </section>

            <footer className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div>© {new Date().getFullYear()} TouchBack. All rights reserved.</div>
              <div className="hidden sm:block">In trang này: Ctrl/Cmd + P</div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
