import NfcCard from "../models/NfcCard.js";
import Product from "../models/Product.js";
import { generateSlug } from "../utils/generateSlug.js";

function randomCode(len = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no O/0/1/I
  let out = "";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function provisionCardsForOrder(order) {
  if (!order || !order.items || !order.items.length) return [];
  const results = [];
  for (const item of order.items) {
    const quantity = Math.max(1, item.quantity || 1);
    const product = await Product.findById(item.productId).lean();
    for (let i = 0; i < quantity; i++) {
      const slug = generateSlug();
      const card = await NfcCard.create({
        userId: order.userId,
        slug,
        status: "unactivated",
        orderId: order._id,
        productId: item.productId,
        productCode: product?.code,
        activationCode: randomCode(),
        // prefill title from product name for easy identification
        title: `${product?.name || "NFC Card"} #${i + 1}`,
      });
      results.push(card);
    }
  }
  return results;
}

export async function activateCardByCodeOrTag({
  userId,
  activationCode,
  tagUid,
}) {
  const query = {};
  if (activationCode) query.activationCode = activationCode.trim();
  if (tagUid) query.tagUid = tagUid.trim();
  if (!query.activationCode && !query.tagUid) {
    throw new Error("Thiếu activationCode hoặc tagUid");
  }
  const card = await NfcCard.findOne(query);
  if (!card) throw new Error("Không tìm thấy thẻ phù hợp");
  // Claim/activate
  card.userId = userId;
  card.status = "active";
  card.isActive = true;
  // Once activated by code, clear activation code to avoid reuse
  if (activationCode) card.activationCode = undefined;
  await card.save();
  return card;
}
