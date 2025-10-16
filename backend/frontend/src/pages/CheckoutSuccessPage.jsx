import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

export default function CheckoutSuccessPage(){
  const [sp] = useSearchParams();
  const orderId = sp.get('orderId');
  return (
    <div className="max-w-xl mx-auto space-y-4 text-center">
      <h1 className="text-2xl font-semibold">Thanh toán thành công</h1>
      <p className="text-gray-600 dark:text-gray-400">
        Chúng tôi đã nhận đơn hàng{orderId ? ` #${orderId}` : ''}. Hãy hoàn tất cấu hình thẻ NFC của bạn ngay bây giờ.
      </p>
      <Link className="btn" to={`/nfc/new${orderId ? `?orderId=${orderId}` : ''}`}>Bắt đầu cấu hình thẻ</Link>
      <div>
        <Link className="text-sm text-brand-600" to="/orders">Xem đơn hàng của tôi</Link>
      </div>
    </div>
  );
}
