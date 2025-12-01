import React, { useState } from "react";
import axios from "axios";

export default function SmartKey() {
  // Nhập mã cửa
  const [doorId, setDoorId] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  // Nhập thẻ NFC
  const [cardId, setCardId] = useState("");

  // Trạng thái UI
  const [message, setMessage] = useState("");

  // API backend
  const API = "http://localhost:4000/api/smartkey";

  // Lấy token người dùng hiện đang đăng nhập
  const token = localStorage.getItem("token");

  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  /* ======================================================
        1️⃣ THÊM CỬA VÀO HỆ THỐNG
  ====================================================== */
  const handleAddDoor = async () => {
    try {
      const res = await axios.post(
        `${API}/add-door`,
        { doorId, roomNumber },
        config
      );
      setMessage("✔ Thêm cửa thành công!");
    } catch (err) {
      setMessage("❌ Lỗi: " + (err.response?.data?.message || "Không rõ lỗi"));
    }
  };

  /* ======================================================
        2️⃣ GÁN THẺ → CỬA (Thẻ nào mở cửa nào)
  ====================================================== */
  const handleGrantAccess = async () => {
    try {
      const res = await axios.post(
        `${API}/grant-access`,
        { cardId, doorId },
        config
      );
      setMessage("✔ Gán thẻ mở cửa thành công!");
    } catch (err) {
      setMessage("❌ Lỗi: " + (err.response?.data?.message || "Không rõ lỗi"));
    }
  };

  /* ======================================================
        3️⃣ MỞ CỬA (Giả lập)
  ====================================================== */
  const handleOpenDoor = async () => {
    try {
      const res = await axios.post(
        `${API}/open-door`,
        { cardId, doorId },
        config
      );
      setMessage("🔓 Cửa đã được mở thành công!");
    } catch (err) {
      setMessage("❌ Không thể mở cửa: " + (err.response?.data?.message || ""));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">🔑 Hệ thống SmartKey</h1>

      <p className="text-gray-600 mb-8">
        Quản lý cửa, gán thẻ và mở cửa thông minh bằng NFC.
      </p>

      {/* ======================== Thêm cửa ======================== */}
      <div className="bg-white p-6 rounded-lg shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">🏠 Thêm cửa mới</h2>

        <input
          type="text"
          placeholder="Nhập mã cửa (VD: DOOR-302)"
          value={doorId}
          onChange={(e) => setDoorId(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Số phòng (VD: 302)"
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        <button
          onClick={handleAddDoor}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          ➕ Thêm cửa
        </button>
      </div>

      {/* ======================== Gán thẻ vào cửa ======================== */}
      <div className="bg-white p-6 rounded-lg shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">🪪 Gán thẻ mở cửa</h2>

        <input
          type="text"
          placeholder="UID Thẻ NFC"
          value={cardId}
          onChange={(e) => setCardId(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Mã cửa muốn gán"
          value={doorId}
          onChange={(e) => setDoorId(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        <button
          onClick={handleGrantAccess}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          🔗 Gán thẻ → cửa
        </button>
      </div>

      {/* ======================== Mở cửa ======================== */}
      <div className="bg-white p-6 rounded-lg shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">🚪 Mở cửa</h2>

        <input
          type="text"
          placeholder="UID Thẻ NFC"
          value={cardId}
          onChange={(e) => setCardId(e.target.value)}
          className="w-full mb-3 p-2 border rounded"
        />

        <input
          type="text"
          placeholder="Mã cửa cần mở"
          value={doorId}
          onChange={(e) => setDoorId(e.target.value)}
          className="w-full mb-4 p-2 border rounded"
        />

        <button
          onClick={handleOpenDoor}
          className="px-4 py-2 bg-yellow-600 text-white rounded"
        >
          🔓 Mở cửa
        </button>
      </div>

      {/* ======================== Thông báo ======================== */}
      {message && (
        <div className="mt-4 p-4 bg-gray-100 border rounded-lg text-gray-800">
          {message}
        </div>
      )}
    </div>
  );
}
