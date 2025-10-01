import NfcCard from "../models/NfcCard.js";
import Memory from "../models/Memory.js";

export async function getPublicCard(req, res) {
  const slug = req.params.slug;
  const card = await NfcCard.findOne({ slug, isActive: true }).lean();
  if (!card) return res.status(404).json({ message: "Not found" });

  let primary = null;
  // Prefer explicitly set primary memory if public and linked
  if (card.primaryMemoryId) {
    primary = await Memory.findOne({
      _id: card.primaryMemoryId,
      isPublic: true,
    }).lean();
  }
  // Fallback to latest public among linkedMemoryIds
  if (!primary) {
    const memories = await Memory.find({
      _id: { $in: card.linkedMemoryIds || [] },
      isPublic: true,
    })
      .sort({ createdAt: -1 })
      .lean();
    primary = memories[0] || null;
  }

  // Return minimal public info
  res.json({
    card: { slug: card.slug, title: card.title || card.profile?.name || null },
    profile: card.profile || null,
    memory: primary,
  });
}

export async function getPublicCardVcard(req, res) {
  const slug = req.params.slug;
  const card = await NfcCard.findOne({ slug, isActive: true }).lean();
  if (!card) return res.status(404).json({ message: "Not found" });
  const p = card.profile || {};
  const name = p.name || card.title || "Contact";
  const fn = name;
  const nParts = name.split(" ");
  const last = nParts.pop() || "";
  const first = nParts.join(" ");
  const org = p.company || "";
  const title = p.title || "";
  const phone = p.phone || "";
  const email = p.email || "";
  const website = p.website || "";
  const address = p.address || "";

  const vcf = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${last};${first};;;`,
    `FN:${fn}`,
    org ? `ORG:${org}` : null,
    title ? `TITLE:${title}` : null,
    phone ? `TEL;TYPE=CELL:${phone}` : null,
    email ? `EMAIL;TYPE=INTERNET:${email}` : null,
    website ? `URL:${website}` : null,
    address ? `ADR;TYPE=WORK:;;${address};;;;` : null,
    "END:VCARD",
  ]
    .filter(Boolean)
    .join("\r\n");

  res.setHeader("Content-Type", "text/vcard; charset=utf-8");
  const fileNameSafe = fn.replace(/[^a-zA-Z0-9_-]+/g, "_");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=\"${fileNameSafe}.vcf\"`
  );
  res.send(vcf);
}
