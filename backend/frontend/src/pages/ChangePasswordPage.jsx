import React from 'react';

export default function ChangePasswordPage(){
  return (
    <div className="page">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Đổi mật khẩu</h1>
        <div className="card space-y-4">
          <p className="text-gray-600 dark:text-gray-300">Trang này là mô phỏng. Bạn có thể tích hợp API đổi mật khẩu sau.</p>
          <div className="grid gap-3">
            <input className="input" placeholder="Mật khẩu hiện tại" type="password" />
            <input className="input" placeholder="Mật khẩu mới" type="password" />
            <input className="input" placeholder="Xác nhận mật khẩu mới" type="password" />
            <button className="btn">Cập nhật mật khẩu</button>
          </div>
        </div>
      </div>
    </div>
  );
}
