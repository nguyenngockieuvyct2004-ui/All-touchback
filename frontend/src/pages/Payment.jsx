import React, { useState } from "react";
import axios from "axios";

export default function Payment() {
  // -----------------------------------------------
  // STATE
  // -----------------------------------------------
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const [cardId, setCardId] = useState("");
  const [amount, setAmount] = useState(100000);

  const [lockMessage, setLockMessage] = useState("");

  // -----------------------------------------------
  // API BASE URL
  // -----------------------------------------------
  const API = "http://localhost:4000/api";

  // TOKEN AUTH
  const token = localStorage.getItem("token") || "";
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // -----------------------------------------------
  // 1. NFC PAYMENT (fake)
  // -----------------------------------------------
  const handleNFCPayment = () => {
    setStatus("waiting");
    setMessage("Đưa thẻ SmartKey NFC lại gần để thanh toán...");

    setTimeout(() => {
      setStatus("processing");
      setMessage("Đang xử lý thanh toán...");

      setTimeout(() => {
        setStatus("success");
        setMessage("Thanh toán thành công!");
      }, 1000);
    }, 1500);
  };

  // -----------------------------------------------
  // 2. TOPUP
  // -----------------------------------------------
  const handleTopup = async () => {
    try {
      const res = await axios.post(
        `${API}/payment/topup`,
        { cardId, amount: Number(amount) },
        config
      );

      alert(`Nạp tiền thành công! Số dư mới: ${res.data.balance} VND`);
    } catch (err) {
      alert("Lỗi khi nạp tiền: " + (err.response?.data?.message || err.message));
    }
  };

  // -----------------------------------------------
  // 3. LOCK
  // -----------------------------------------------
  const handleLockCard = async () => {
    try {
      await axios.post(`${API}/smartkey/lock`, { cardId }, config);
      setLockMessage("🔐 Thẻ đã bị khóa");
    } catch (err) {
      setLockMessage("❌ Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  // -----------------------------------------------
  // 4. UNLOCK
  // -----------------------------------------------
  const handleUnlockCard = async () => {
    try {
      await axios.post(`${API}/smartkey/unlock`, { cardId }, config);
      setLockMessage("🔓 Thẻ đã được mở khóa");
    } catch (err) {
      setLockMessage("❌ Lỗi: " + (err.response?.data?.message || err.message));
    }
  };

  // -----------------------------------------------
  // UI RENDER
  // -----------------------------------------------
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-4">Thanh toán bằng  NFC</h1>

      {/* NFC CARD */}
      <div className="bg-white shadow-lg rounded-xl p-6 border">
        <h2 className="text-xl font-semibold mb-2">Thẻ SmartKey NFC</h2>
        <p>Thẻ thanh toán 1 chạm — không cần mật khẩu hoặc OTP.</p>

        <button
          onClick={handleNFCPayment}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          Thanh toán bằng NFC
        </button>

        {message && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg">{message}</div>
        )}
      </div>

      {/* TOPUP */}
      <div className="bg-white p-6 rounded-xl shadow mt-10">
        <h2 className="text-xl font-semibold mb-4">💰 Nạp tiền vào SmartKey</h2>

        <input
          type="text"
          placeholder="UID thẻ NFC"
          className="w-full px-3 py-2 border rounded mb-3"
          value={cardId}
          onChange={(e) => setCardId(e.target.value)}
        />

        <input
          type="number"
          className="w-full px-3 py-2 border rounded mb-3"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <button
          onClick={handleTopup}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Nạp tiền
        </button>
      </div>

      {/* LOCK/UNLOCK */}
      <div className="bg-white p-6 rounded-xl shadow mt-10">
        <h2 className="text-xl font-semibold mb-4">🔐 Quản lý trạng thái thẻ</h2>

        <button
          onClick={handleLockCard}
          className="px-4 py-2 bg-red-600 text-white rounded mr-3"
        >
          Khóa thẻ Payment
        </button>

        <button
          onClick={handleUnlockCard}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Mở khóa thẻ Payment
        </button>

        {lockMessage && (
          <div className="mt-4 p-3 bg-gray-100 rounded">{lockMessage}</div>
        )}
      </div>
    </div>
  );
}
