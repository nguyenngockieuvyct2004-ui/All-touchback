import ContactMessage from "../models/ContactMessage.js";

export async function createContact(req, res) {
  const { name, email, phone, subject, message } = req.body || {};
  if (!name || !email || !message)
    return res.status(400).json({ message: "Thiếu tên, email hoặc nội dung" });
  const doc = await ContactMessage.create({
    name,
    email,
    phone,
    subject,
    message,
    meta: { ip: req.ip, ua: req.headers["user-agent"] },
  });
  return res.status(201).json({ id: doc._id, message: "Đã gửi liên hệ" });
}

export async function listContacts(req, res) {
  const { page = 1, limit = 20, status, q: query, sort = "desc" } = req.query;
  const q = {};
  if (status && status !== "all") q.status = status;
  if (query) {
    const rx = new RegExp(
      String(query)
        .trim()
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      "i"
    );
    q.$or = [
      { name: rx },
      { email: rx },
      { phone: rx },
      { subject: rx },
      { message: rx },
    ];
  }
  const skip = (Number(page) - 1) * Number(limit);
  const sortSpec = { createdAt: String(sort).toLowerCase() === "asc" ? 1 : -1 };
  const [items, total] = await Promise.all([
    ContactMessage.find(q).sort(sortSpec).skip(skip).limit(Number(limit)),
    ContactMessage.countDocuments(q),
  ]);
  res.json({ items, total, page: Number(page), limit: Number(limit) });
}

export async function updateContactStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body || {};
  if (!["new", "read", "closed"].includes(status))
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  const doc = await ContactMessage.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
  if (!doc) return res.status(404).json({ message: "Không tìm thấy" });
  res.json(doc);
}
