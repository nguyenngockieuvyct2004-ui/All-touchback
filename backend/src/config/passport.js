import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";

export function setupPassport() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;
  if(!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET){
    console.warn('> Google OAuth disabled: thiếu GOOGLE_CLIENT_ID hoặc GOOGLE_CLIENT_SECRET trong .env');
    return; // Không đăng ký strategy để tránh crash khi dev chưa cấu hình OAuth
  }
  // CHÚ Ý: Không commit giá trị thực của GOOGLE_CLIENT_SECRET lên repo public.

  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
  }, async (_at,_rt, profile, done)=>{
    try {
      let user = await User.findOne({ googleId: profile.id });
      if(!user){
        user = await User.create({
          fullName: profile.displayName,
          email: profile.emails?.[0]?.value,
          googleId: profile.id,
          provider: 'google',
          role: 'customer'
        });
      }
      return done(null, user);
    } catch(e){
      return done(e);
    }
  }));
}
