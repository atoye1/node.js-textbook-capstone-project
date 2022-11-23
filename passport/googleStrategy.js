/* eslint-disable no-underscore-dangle */
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const logger = require('../logger');
const User = require('../models/user');

module.exports = () => {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    logger.info('google profile', profile);
    try {
      const exUser = await User.findOne({ where: { snsId: profile.id, provider: 'google' } });
      if (exUser) {
        done(null, exUser);
      } else {
        const sameEmailUser = await User.findOne({ where: { email: profile._json.email } });
        if (sameEmailUser) {
          logger.error('user with same email found, error');
          return done({ type: 'same email exists', message: `해당 이메일은 ${sameEmailUser.provider || '로컬'}로 가입되어 있습니다.` });
        }

        const newUser = await User.create({
          email: profile._json.email || `no-email${profile.id}@google.com`,
          nick: `${profile.displayName}_google`,
          snsId: profile.id,
          provider: 'google',
        });
        done(null, newUser);
      }
    } catch (err) {
      logger.error(err);
      done(err);
    }
  }));
};
