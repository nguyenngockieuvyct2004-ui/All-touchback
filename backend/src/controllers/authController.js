import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Joi from "joi";
import crypto from "crypto";
import { sendMail } from "../utils/mail.js";
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
  password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const forgotSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).required(),
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
    const emailNorm = value.email.toLowerCase();
    const existing = await User.findOne({ email: emailNorm });
    if (existing) return res.status(400).json({ message: "Email đã tồn tại" });
    const passwordHash = await bcrypt.hash(value.password, 10);
    const user = await User.create({
      fullName: value.fullName,
      email: emailNorm,
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
    const emailNorm = value.email.toLowerCase();
    let user = await User.findOne({ email: emailNorm });
    if (!user) {
      // Fallback: case-insensitive exact match using regex (handles any legacy mixed-case or stray spaces)
      user = await User.findOne({
        email: {
          $regex: `^${emailNorm.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}$`,
          $options: "i",
        },
      });
      if (user && process.env.NODE_ENV !== "production") {
        console.warn(
          "[AUTH][login] Fallback regex matched user id",
          user._id.toString(),
          "storedEmail=",
          user.email
        );
      }
    }
    if (!user && process.env.NODE_ENV !== "production") {
      console.warn("[AUTH][login] User not found for", emailNorm);
    }
    if (!user)
      return res.status(401).json({ message: "Sai thông tin đăng nhập" });
    if (user.isActive === false) {
      return res.status(403).json({ message: "Tài khoản đã bị vô hiệu hoá" });
    }
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
        email: (payload.email || "").toLowerCase(),
        googleId: payload.sub,
        provider: "google",
        role: "customer",
      });
    }
    if (user.isActive === false) {
      return res.status(403).json({ message: "Tài khoản đã bị vô hiệu hoá" });
    }
    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, email: user.email, role: user.role },
    });
  } catch (e) {
    // Provide clearer error in non-production
    const msg =
      process.env.NODE_ENV === "production"
        ? "Xác thực Google thất bại"
        : `Google verify error: ${e?.message || e}`;
    res.status(400).json({ message: msg });
  }
}

// POST /auth/forgot { email }
export async function forgotPassword(req, res, next) {
  try {
    const { email } = await forgotSchema.validateAsync(req.body);
    const emailNorm = email.toLowerCase();
    let user = await User.findOne({ email: emailNorm });
    if (!user) {
      user = await User.findOne({
        email: {
          $regex: `^${emailNorm.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}$`,
          $options: "i",
        },
      });
      if (user && process.env.NODE_ENV !== "production") {
        console.warn(
          "[AUTH][forgot] Fallback regex matched user id",
          user._id.toString(),
          "storedEmail=",
          user.email
        );
      }
    }
    if (!user) {
      // Respond success anyway to prevent user enumeration
      return res.json({
        message: "Nếu email tồn tại chúng tôi đã gửi hướng dẫn đặt lại.",
      });
    }
    const tokenPlain = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(tokenPlain)
      .digest("hex");
    user.resetPasswordTokenHash = tokenHash;
    user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
    await user.save();
    const resetUrl = `${
      process.env.FRONTEND_URL || "http://localhost:5173"
    }/reset-password?token=${tokenPlain}`;
    const html = `<p>Xin chào ${user.fullName || ""},</p>
      <p>Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản TouchBack.</p>
      <p>Nhấp vào liên kết dưới đây để đặt lại mật khẩu (hiệu lực 15 phút):</p>
      <p><a href="${resetUrl}" target="_blank" rel="noopener">Đặt lại mật khẩu</a></p>
      <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>`;
    let mailOk = true;
    try {
      await sendMail({
        to: user.email,
        subject: "Đặt lại mật khẩu TouchBack",
        html,
      });
    } catch (e) {
      mailOk = false;
      console.error("[FORGOT] Send mail error", e);
    }
    res.json({
      message: "Nếu email tồn tại chúng tôi đã gửi hướng dẫn đặt lại.",
      ...(process.env.NODE_ENV !== "production"
        ? { devToken: tokenPlain, mailOk }
        : {}),
    });
  } catch (e) {
    next(e);
  }
}

// POST /auth/reset { token, password }
export async function resetPassword(req, res, next) {
  try {
    const { token, password } = await resetSchema.validateAsync(req.body);
    // Strength check (basic): at least 1 upper, 1 lower, 1 digit, 1 special
    const strengthRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!strengthRegex.test(password)) {
      return res.status(400).json({
        message:
          "Mật khẩu phải ≥8 ký tự và có ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt",
      });
    }
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordTokenHash: tokenHash,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user)
      return res
        .status(400)
        .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    // Ensure new password different from old
    if (user.passwordHash) {
      const same = await bcrypt.compare(password, user.passwordHash);
      if (same)
        return res
          .status(400)
          .json({ message: "Mật khẩu mới phải khác mật khẩu cũ" });
    }
    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    const authToken = signToken(user);
    res.json({ message: "Đặt lại mật khẩu thành công", token: authToken });
  } catch (e) {
    next(e);
  }
}
