import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

export default function PaymentPage() {
  const { token } = useAuth();
  const [cardId, setCardId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  async function handleTopup() {
    try {
      const res = await axios.post(
        "/api/payment/topup",
        { cardId, amount: Number(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(`✅ Nạp thành công! Số dư mới: ${res.data.balance} VND`);
    } catch (err) {
      setMessage("❌ Lỗi: " + (err.response?.data?.message || "Không xác định"));
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Thanh toán bằng SmartKey NFC</h1>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        Chạm thẻ SmartKey để thanh toán tức thì — không cần mật khẩu, không cần OTP.
      </p>

      {/* THẺ NFC */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 mb-10">
        <h2 className="text-xl font-semibold">Thẻ SmartKey NFC</h2>
        <p className="text-gray-500 dark:text-gray-400">
          Đây là thẻ NFC tích hợp thanh toán 1 chạm. Không cần OTP, không cần mật khẩu.
        </p>
      </div>

      {/* FORM NẠP TIỀN */}
      <div className="p-6 border rounded-xl bg-white dark:bg-gray-800 shadow">
        <h3 className="text-xl font-semibold mb-4">💳 Nạp tiền vào SmartKey</h3>

        <label className="block mb-2 text-sm">Mã thẻ (cardId)</label>
        <input
          className="w-full px-3 py-2 mb-4 rounded border dark:bg-gray-700"
          placeholder="Nhập UID NFC của thẻ"
          value={cardId}
          onChange={(e) => setCardId(e.target.value)}
        />

        <label className="block mb-2 text-sm">Số tiền muốn nạp (VND)</label>
        <input
          className="w-full px-3 py-2 mb-4 rounded border dark:bg-gray-700"
          type="number"
          placeholder="50.000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button
          onClick={handleTopup}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Nạp tiền
        </button>

        {message && (
          <p className="mt-4 p-3 rounded bg-gray-100 dark:bg-gray-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
