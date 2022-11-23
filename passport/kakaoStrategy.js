/* eslint-disable no-underscore-dangle */
const passport = require('passport');
const KakaoStrategy = require('passport-kakao').Strategy;
const logger = require('../logger');
const User = require('../models/user');

module.exports = () => {
  passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_ID,
    callbackURL: '/auth/kakao/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    logger.info('kakao profile', profile);
    try {
      const exUser = await User.findOne({ where: { snsId: profile.id, provider: 'kakao' } });
      if (exUser) {
        done(null, exUser);
      } else {
        const newUser = await User.create({
          email: profile._json.kakao_accout_email || `email-not-provided${profile.id}@kakao.com`,
          nick: `${profile.displayName}_kakao`,
          snsId: profile.id,
          provider: 'kakao',
        });
        done(null, newUser);
      }
    } catch (err) {
      logger.error(err);
      done(err);
    }
  }));
};
