import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { getCurrencyForCountry } from '../utils/currency.js';

export const configurePassport = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // 1. Existing Google user
          let user = await User.findOne({ googleId: profile.id, is_active: true });
          if (user) return done(null, user);

          // 2. Email already exists — link Google to existing account
          const existingEmailUser = await User.findOne({
            email: profile.emails[0].value,
            is_active: true,
          });

          if (existingEmailUser) {
            existingEmailUser.googleId = profile.id;
            existingEmailUser.authProvider = 'google';
            existingEmailUser.profilePicture =
              profile.photos[0]?.value || existingEmailUser.profilePicture;
            await existingEmailUser.save();
            return done(null, existingEmailUser);
          }

          // 3. Brand-new Google user — create Company + Admin
          // We don't have country from Google profile, so default currency to USD
          // They can update later. A proper flow would redirect to a country-picker page.
          const company = await Company.create({
            name: `${profile.displayName}'s Company`,
            country: 'United States',
            currency: 'USD',
          });

          user = await User.create({
            company_id: company._id,
            googleId: profile.id,
            fullName: profile.displayName,
            email: profile.emails[0].value,
            authProvider: 'google',
            profilePicture: profile.photos[0]?.value || '',
            role: 'admin',
          });

          return done(null, user);
        } catch (error) {
          console.error('Google Strategy error:', error);
          return done(error, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};