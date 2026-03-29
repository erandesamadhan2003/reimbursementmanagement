import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/User.js";

export const configurePassport = () => {

    passport.use(
        new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: '/api/auth/google/callback'
        },

            async (accessToken, refershToken, profile, done) => {
                try {
                    let user = await User.findOne({ googleId: profile.id });
                    if (user) {
                        console.log("Existing Google user found: ", user.email);
                        return done(null, user);
                    }

                    const existingEmailUser = await User.findOne({
                        email: profile.emails[0].value
                    });

                    if (existingEmailUser) {
                        console.log('🔗 Linking Google account to existing user:', existingEmailUser.email);
                        existingEmailUser.googleId = profile.id;
                        existingEmailUser.authProvider = 'google';
                        existingEmailUser.profilePicture = profile.photos[0]?.value || '';
                        await existingEmailUser.save();
                        return done(null, existingEmailUser);
                    }

                    user = await User.create({
                        googleId: profile.id,
                        fullName: profile.displayName,
                        email: profile.emails[0].value,
                        authProvider: 'google',
                        profilePicture: profile.photos[0]?.value || ''
                    });

                    console.log("New Google user created: ", user.email);
                    done(null, user);

                } catch (error) {
                    console.error("Error in Google Strategy: ", error);
                    done(error, null);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await User.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    });
};