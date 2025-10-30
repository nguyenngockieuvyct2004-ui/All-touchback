import React, { useState } from 'react';

const TEAM = [
  { id: 1, name: 'Nhật Quang', role: 'Giám đốc Marketing (CMO)', img: '/uploads/nhat-quang.jpg', bio: 'Chịu trách nhiệm chiến lược marketing và truyền thông, kết nối cộng đồng.' },
  { id: 2, name: 'Hoàng Minh', role: 'Giám đốc Thiết kế (DD)', img: '/uploads/hoang-minh.jpg', bio: 'Lãnh đạo thiết kế, chịu trách nhiệm trải nghiệm người dùng và thẩm mỹ sản phẩm.' },
  { id: 3, name: 'Minh Huy', role: 'Giám đốc Điều hành (CEO)', img: '/uploads/minh-huy.jpg', bio: 'Điều hành hoạt động hàng ngày và đảm bảo tầm nhìn sản phẩm được thực hiện.' },
  { id: 4, name: 'Mỹ Hằng', role: 'Giám đốc Sản phẩm (CPO)', img: '/uploads/my-hang.jpg', bio: 'Quản lý lộ trình sản phẩm và ưu tiên tính năng theo nhu cầu người dùng.' },
  { id: 5, name: 'Kiều Vy', role: 'Giám đốc Tài chính (CFO)', img: '/uploads/kieu-vy.jpg', bio: 'Quản lý tài chính, ngân sách và chiến lược phát triển bền vững.' }
];

export default function AboutPage(){
  const [openBio, setOpenBio] = useState(null);
  return (
    <div className="page">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="mt-6">
        <div className="rounded-lg overflow-hidden shadow-lg bg-gradient-to-r from-amber-50 to-white dark:from-gray-900 dark:to-gray-800">
          <div className="px-6 py-12">
            <div className="max-w-4xl mx-auto space-y-4 flex flex-col items-center text-center">
              <p className="uppercase tracking-wider text-xs text-gray-500 dark:text-gray-400">Giới thiệu · NFC Memory</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight inline-block max-w-3xl" style={{fontFamily:'var(--font-display, ui-serif)'}}>Một chạm — ký ức trở về</h1>
                <p className="text-lg md:text-xl leading-relaxed max-w-none text-gray-600 dark:text-gray-300">“Tôi mất một thứ, một ai đó, một ký ức... và từ đó, tôi quyết tâm tạo nên thứ giúp ký ức không bao giờ biến mất nữa”</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a href="/create" className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-md shadow">Tạo ký ức</a>
                <a href="/contact" className="inline-block border border-amber-200 hover:bg-amber-50 text-amber-700 px-4 py-2 rounded-md">Liên hệ</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alternate sections: Mission + Story with images */}
      <section className="section mt-8">
        {/* Hero-like feature with image on right */}
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold" style={{fontFamily:'var(--font-display, ui-serif)'}}>Về chúng tôi</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-300">NFC Memory biến công nghệ thành nơi lưu giữ cảm xúc — nhẹ nhàng, riêng tư và dễ dùng.</p>
          </div>
          <div className="hidden md:block">
              <img src="/assets/about-hero.jpg" alt="About hero" className="w-full rounded-md object-cover h-64 md:h-[260px] lg:h-[320px] transform-gpu transition-transform transition-shadow duration-300 ease-out hover:scale-105 hover:shadow-xl" />
          </div>
        </div>

        {/* Mission block: image left, text right */}
        <div className="mt-12 grid gap-8 md:grid-cols-2 items-center">
            <div className="order-2 md:order-1">
        <img src="/assets/mission.jpg" alt="Mission" className="w-full rounded-md object-cover h-64 md:h-[260px] lg:h-[320px] transform-gpu transition-transform transition-shadow duration-300 ease-out hover:scale-105 hover:shadow-xl" />
          </div>
          <div className="order-1 md:order-2">
            <h3 className="text-2xl md:text-3xl font-semibold">Sứ mệnh</h3>
            <p className="mt-3 text-gray-600 dark:text-gray-300">Biến công nghệ thành cầu nối cảm xúc. Mọi người có thể lưu và chia sẻ ký ức bằng một chạm.</p>
            <ul className="mt-3 list-disc list-inside text-gray-700 dark:text-gray-300">
              <li>Cảm xúc là trọng tâm</li>
              <li>Bảo mật từ thiết kế</li>
              <li>Tối giản và ấm áp</li>
            </ul>
          </div>
        </div>

        {/* Story block: text left, image right */}
        <div className="mt-12 grid gap-8 md:grid-cols-2 items-center">
          <div>
            <h3 className="text-2xl md:text-3xl font-semibold">Câu chuyện</h3>
            <p className="mt-3 text-gray-600 dark:text-gray-300">Lấy cảm hứng từ khoảnh khắc một bức ảnh bị mất không thể khôi phục, chúng tôi tạo ra NFC Memory để ký ức có thể được lưu giữ an toàn và dễ chia sẻ.</p>
            <details className="mt-3 text-sm text-gray-700 dark:text-gray-300">
              <summary className="cursor-pointer font-medium">Đọc câu chuyện đầy đủ</summary>
              <div className="mt-2">
                <p>Sáng lập viên đã từng làm mất ví vào một ngày mưa — bên trong có một tấm ảnh quý giá. Khi nhận lại, bức ảnh đã bị hư hỏng; khoảnh khắc đó đã thôi thúc ý tưởng: tạo cho ký ức một "định danh" kỹ thuật số để nó không bị mất mát theo thời gian. Chúng tôi xây dựng NFC Memory để những ký ức ấy luôn có thể chạm tới — nhẹ nhàng, riêng tư và dễ dùng.</p>
              </div>
            </details>
          </div>
            <div className="relative rounded-lg overflow-hidden shadow-md" style={{height: '20rem'}}>
              <video src="/assets/7111471291219.mp4" className="absolute inset-0 w-full h-full object-cover transform-gpu transition-transform duration-300 ease-out hover:scale-115" autoPlay muted loop playsInline controls />
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="section mt-8">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2" style={{fontFamily:'var(--font-display, ui-serif)'}}>Đội ngũ</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Đội ngũ nhỏ từ Cần Thơ — nhà thiết kế, người kể chuyện và kỹ sư — cùng xây dựng công nghệ ấm áp để giữ gìn ký ức.</p>

          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {TEAM.map(member => (
              <div key={member.id} className="relative group">
                <button
                  type="button"
                  onClick={() => setOpenBio(openBio === member.id ? null : member.id)}
                  className="w-full text-left p-3 rounded-md hover:bg-amber-50 dark:hover:bg-gray-800 transition transform-gpu hover:scale-102 hover:shadow-md"
                >
                  <div className="flex flex-col items-center">
                    <img src={member.img} alt={member.name} className="w-20 h-20 rounded-full object-cover shadow-md" />
                    <div className="mt-3 font-medium">{member.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{member.role}</div>
                  </div>
                </button>

                {/* Desktop tooltip */}
                <div className="hidden md:block pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute left-1/2 transform -translate-x-1/2 -top-2 -translate-y-full w-56 p-3 rounded-md bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-lg text-left text-sm">
                  <div className="font-medium">{member.name}</div>
                  <div className="mt-1 text-gray-600 dark:text-gray-300">{member.bio}</div>
                </div>

                {/* Mobile expandable bio */}
                {openBio === member.id && (
                  <div className="md:hidden mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm text-gray-700 dark:text-gray-300">{member.bio}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      

  </div>

  <section className="section mt-8">
        <div className="panel p-6 text-center">
          <p className="text-lg md:text-xl font-medium">Sẵn sàng để ký ức tìm về tổ ấm?</p>
          <div className="mt-4">
            <a href="/create" className="inline-block bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-md">Tạo ký ức</a>
          </div>
        </div>
      </section>
    </div>
  );
}
