import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User";

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
      },
      async (_accessToken: string, _refreshToken: string, profile: any, done: (err: any, user?: any) => void) => {
        try {
          const email = (profile.emails?.[0]?.value || `${profile.id}@google.local`).toLowerCase();
          const name = profile.displayName || undefined;
          const avatar = profile.photos?.[0]?.value || undefined;
          // Prefer linking by googleId; if absent, link existing account by email
          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            user = await User.findOne({ email });
            if (user) {
              user.googleId = profile.id;
              if (!user.name && name) user.name = name;
              if (!user.avatar && avatar) user.avatar = avatar;
              await user.save();
            } else {
              user = await User.create({ email, googleId: profile.id, name, avatar });
            }
          }
          return done(null, user);
        } catch (e) {
          return done(e as any, undefined);
        }
      }
    )
  );
};

export default configurePassport;

