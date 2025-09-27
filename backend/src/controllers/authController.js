import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Joi from "joi";
// Dùng dynamic import để tránh crash server nếu chưa cài đặt google-auth-library
let _googleClient = null;
async function getGoogleClient() {
  if (!_googleClient) {
    try {
      const mod = await import("google-auth-library");
      const { OAuth2Client } = mod;
      _googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    } catch (e) {
      throw new Error(
        "google-auth-library chưa được cài đặt. Chạy: npm install google-auth-library"
      );
    }
  }
  return _googleClient;
}

const registerSchema = Joi.object({
  fullName: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

function signToken(user) {
  const secret =
    process.env.JWT_SECRET ||
    (process.env.NODE_ENV !== "production"
      ? "dev_fallback_secret_change_me"
      : undefined);
  if (!secret) {
    // Trả lỗi rõ ràng thay vì lỗi chung chung "secretOrPrivateKey must have a value"
    throw new Error(
      "JWT_SECRET is missing. Set it in backend/.env (JWT_SECRET=your_secret)"
    );
  }
  return jwt.sign(
    { sub: user._id, role: user.role, email: user.email },
    secret,
    { expiresIn: "1h" }
  );
}

export async function register(req, res, next) {
  try {
    const value = await registerSchema.validateAsync(req.body);
    const existing = await User.findOne({ email: value.email });
    if (existing) return res.status(400).json({ message: "Email đã tồn tại" });
    const passwordHash = await bcrypt.hash(value.password, 10);
    const user = await User.create({
      fullName: value.fullName,
      email: value.email,
      passwordHash,
      role: "customer",
    });
    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const value = await loginSchema.validateAsync(req.body);
    const user = await User.findOne({ email: value.email });
    if (!user)
      return res.status(401).json({ message: "Sai thông tin đăng nhập" });
    const ok = await bcrypt.compare(value.password, user.passwordHash || "");
    if (!ok)
      return res.status(401).json({ message: "Sai thông tin đăng nhập" });
    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (e) {
    next(e);
  }
}

export function googleCallback(req, res) {
  const user = req.user;
  const token = signToken(user);
  res.redirect(`${process.env.FRONTEND_URL}/oauth-success?token=${token}`);
}

// Google Sign-In (client gửi credential token của Google Identity Services)
// POST /auth/google-token  { credential: string }
export async function googleToken(req, res, next) {
  const { credential } = req.body || {};
  if (!credential)
    return res.status(400).json({ message: "Missing credential" });
  try {
    const client = await getGoogleClient();
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.sub)
      return res.status(400).json({ message: "Invalid token" });
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = await User.create({
        fullName: payload.name || payload.email,
        email: payload.email,
        googleId: payload.sub,
        provider: "google",
        role: "customer",
      });
    }
    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (e) {
    next(e);
  }
}
