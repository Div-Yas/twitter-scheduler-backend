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
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value || `${profile.id}@google.local`;
          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            user = await User.create({ email, googleId: profile.id });
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

