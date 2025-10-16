import User from "../models/User.js";

export async function getMyProfile(req, res) {
  const user = await User.findById(req.user.id).select(
    "email fullName profile"
  );
  res.json(user || {});
}

export async function updateMyProfile(req, res) {
  const data = req.body?.profile || {};
  const allowed = {
    "profile.avatar": data.avatar ?? "",
    "profile.cover": data.cover ?? "",
    "profile.name": data.name ?? "",
    "profile.title": data.title ?? "",
    "profile.company": data.company ?? "",
    "profile.phone": data.phone ?? "",
    "profile.email": data.email ?? "",
    "profile.website": data.website ?? "",
    "profile.address": data.address ?? "",
    "profile.socials": Array.isArray(data.socials)
      ? data.socials.slice(0, 20)
      : [],
  };
  const updated = await User.findByIdAndUpdate(
    req.user.id,
    { $set: allowed },
    { new: true }
  );
  res.json({ ok: true, profile: updated.profile });
}
