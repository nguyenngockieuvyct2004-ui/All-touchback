// Controller xử lý tích hợp VNPay (tách riêng để code Checkout gọn gàng)
// Lưu ý: KHÔNG viết secret thật vào code, tất cả lấy từ biến môi trường (.env)

import crypto from "crypto";
import qs from "qs";
import Order from "../models/Order.js";

// Sắp xếp & encode tham số giống đúng format của code demo VNPay
// Quan trọng để hash trùng khớp (space => '+')
export function sortVnpParams(obj) {
  const sorted = {};
  const keys = Object.keys(obj).filter(
    (k) => obj[k] !== undefined && obj[k] !== null && obj[k] !== ""
  );
  keys.sort();
  keys.forEach((k) => {
    sorted[k] = encodeURIComponent(obj[k]).replace(/%20/g, "+");
  });
  return sorted;
}

// Tạo URL thanh toán VNPay cho đơn hàng (được gọi trong bước checkout nếu chọn phương thức 'bank')
export function buildVnpayPaymentUrl({ order, total, req }) {
  const date = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  const createDate = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(
    date.getDate()
  )}${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

  // Mã tham chiếu giao dịch phía VNPay yêu cầu duy nhất theo ngày: có thể dùng _id + timestamp rút gọn
  const vnpTxnRef = `${order._id.toString().slice(-8)}${Date.now()
    .toString()
    .slice(-6)}`;

  const tmnCode = process.env.VNP_TMN_CODE;
  const secretKey = process.env.VNP_HASH_SECRET;
  const vnpUrlBase =
    process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
  // URL người dùng sẽ được redirect về (có thể là FE route hoặc backend rồi redirect tiếp)
  const returnUrl =
    process.env.VNP_RETURN_URL ||
    `${req.protocol}://${req.get("host")}/orders/vnpay_return`;
  const ipAddr =
    req.headers["x-forwarded-for"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip;

  if (!tmnCode || !secretKey) {
    throw new Error("Thiếu cấu hình VNPay (VNP_TMN_CODE / VNP_HASH_SECRET)");
  }

  const vnp_Params = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: "vn", // hoặc 'en'
    vnp_CurrCode: "VND",
    vnp_TxnRef: vnpTxnRef,
    vnp_OrderInfo: `Thanh toan don hang ${order._id}`,
    vnp_OrderType: "other", // tuỳ chỉnh theo danh mục đã đăng ký với VNPay
    vnp_Amount: total * 100, // số tiền * 100 (quy định của VNPay)
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  };

  const sorted = sortVnpParams(vnp_Params);
  const signData = qs.stringify(sorted, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  sorted["vnp_SecureHash"] = signed;
  const payUrl = `${vnpUrlBase}?${qs.stringify(sorted, { encode: false })}`;

  return { payUrl, vnpTxnRef };
}

// IPN: VNPay gọi server -> server để báo kết quả (quan trọng nhất để xác nhận thanh toán)
export async function vnpayIpn(req, res) {
  try {
    let vnp_Params = { ...req.query };
    const secureHash = vnp_Params["vnp_SecureHash"]; // chữ ký gửi kèm
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"]; // không đưa vào khi hash lại
    const secretKey = process.env.VNP_HASH_SECRET;
    const sorted = sortVnpParams(vnp_Params);
    const signData = qs.stringify(sorted, { encode: false });
    const signed = crypto
      .createHmac("sha512", secretKey)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");
    if (secureHash !== signed) {
      return res.status(200).json({ RspCode: "97", Message: "Sai chữ ký" });
    }
    const vnpTxnRef = vnp_Params["vnp_TxnRef"];
    const order = await Order.findOne({ "payment.vnpTxnRef": vnpTxnRef });
    if (!order) {
      return res
        .status(200)
        .json({ RspCode: "01", Message: "Không tìm thấy đơn" });
    }
    if (order.status === "pending") {
      // Mã thành công: ResponseCode = 00 và TransactionStatus = 00
      const isSuccess =
        vnp_Params["vnp_ResponseCode"] === "00" &&
        vnp_Params["vnp_TransactionStatus"] === "00";
      if (isSuccess) {
        order.status = "paid";
        order.payment = {
          ...order.payment,
          vnpTransactionNo: vnp_Params["vnp_TransactionNo"],
          vnpBankCode: vnp_Params["vnp_BankCode"],
          // Một số sandbox có thể trả code 76 (ngân hàng không hỗ trợ) nếu chọn bankCode không hợp lệ / hoặc thiếu tham số -> log để debug
          vnpCardType: vnp_Params["vnp_CardType"],
          vnpPayDate: vnp_Params["vnp_PayDate"],
          vnpResponseCode: vnp_Params["vnp_ResponseCode"],
          vnpTransactionStatus: vnp_Params["vnp_TransactionStatus"],
          rawIpnData: vnp_Params,
          paidAt: new Date(),
        };
        await order.save();
      } else {
        order.payment = {
          ...order.payment,
          vnpResponseCode: vnp_Params["vnp_ResponseCode"],
          vnpTransactionStatus: vnp_Params["vnp_TransactionStatus"],
          rawIpnData: vnp_Params,
        };
        await order.save();
      }
    }
    res.status(200).json({ RspCode: "00", Message: "Thành công" });
  } catch (e) {
    console.error("VNPay IPN error", e);
    res.status(200).json({ RspCode: "99", Message: "Lỗi hệ thống" });
  }
}

// Return URL: Người dùng được redirect về sau khi bấm thanh toán trên VNPay
// -> Chỉ dùng để hiển thị nhanh; kết quả CHÍNH xác nhận vẫn dựa vào IPN
export async function vnpayReturn(req, res) {
  try {
    let vnp_Params = { ...req.query };
    const secureHash = vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];
    const secretKey = process.env.VNP_HASH_SECRET;
    const sorted = sortVnpParams(vnp_Params);
    const signData = qs.stringify(sorted, { encode: false });
    const signed = crypto
      .createHmac("sha512", secretKey)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");
    const success =
      secureHash === signed &&
      vnp_Params["vnp_ResponseCode"] === "00" &&
      vnp_Params["vnp_TransactionStatus"] === "00";
    res
      .status(200)
      .send(
        `<!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"><title>Kết quả thanh toán</title></head><body style="font-family:Arial;text-align:center;padding:40px">${
          success
            ? "<h2 style='color:green'>Thanh toán thành công</h2>"
            : "<h2 style='color:red'>Thanh toán thất bại</h2>"
        }<p>Mã tham chiếu: ${
          vnp_Params["vnp_TxnRef"] || ""
        }</p><p>Mã phản hồi: ${
          vnp_Params["vnp_ResponseCode"]
        }</p><p>(Lưu ý: Trạng thái cuối cùng dựa vào IPN)</p></body></html>`
      );
  } catch (e) {
    res.status(500).send("Lỗi xử lý kết quả thanh toán");
  }
}
