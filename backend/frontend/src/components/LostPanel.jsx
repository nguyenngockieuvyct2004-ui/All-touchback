import React from 'react';

// Panel hiển thị khi ở chế độ Lost: bên trái là hình minh họa, bên phải là thông tin người liên hệ
export default function LostPanel({ lost, imageSrc, fullImage = false }){
  const title = lost?.title?.trim() || 'Thẻ của tôi đã bị đánh rơi';
  const message = lost?.message || '';
  const contact = lost?.contact || {};
  return (  
    
    <div className="rounded-2xl overflow-hidden border border-black/5 bg-white shadow-xl grid grid-cols-1 md:grid-cols-2">
      {/* Bên trái: ảnh minh họa thất lạc */}
      
      <div className={`${fullImage ? 'p-0' : 'p-6 sm:p-8'} bg-gradient-to-b from-[#8056D3] via-[#AE84E6] to-[#D691E1] text-white flex items-center justify-center`}>
        {fullImage ? (
          // full-bleed image filling the left column
          <div className="w-full h-full">
            <img src={imageSrc} alt="lost" className="w-full h-full object-cover drop-shadow-md" />
          </div>
        ) : (
          <div className="w-[260px] max-w-[90%] aspect-square rounded-xl bg-white shadow-md grid place-items-center overflow-hidden">
            <img src={imageSrc} alt="lost" className="max-h-[85%] w-auto object-contain" />
          </div>
        )}
      </div>
      {/* Bên phải: thông tin chủ thẻ / liên hệ */}
      <div className="p-6 sm:p-8 bg-white">
        <h2 className="text-lg sm:text-xl font-semibold mb-2">{title}</h2>
        {!!message && <p className="text-sm text-gray-700 mb-4 whitespace-pre-line">{message}</p>}
        <div className="space-y-3 text-sm">
          {contact.name && (
            <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-gray-100 grid place-items-center">👤</span><div className="font-medium">{contact.name}</div></div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-gray-100 grid place-items-center">📞</span><a className="text-blue-600" href={`tel:${String(contact.phone).replace(/\s+/g,'')}`}>{contact.phone}</a></div>
          )}
          {contact.email && (
            <div className="flex items-center gap-3"><span className="w-8 h-8 rounded-full bg-gray-100 grid place-items-center">✉️</span><a className="text-blue-600" href={`mailto:${contact.email}`}>{contact.email}</a></div>
          )}
        </div>
      </div>
    </div>
  );
}
