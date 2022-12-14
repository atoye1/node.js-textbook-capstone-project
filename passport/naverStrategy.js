const passport = require('passport');
const NaverStrategy = require('passport-naver-v2').Strategy;
const logger = require('../logger');

const User = require('../models/user');

module.exports = () => {
  passport.use(new NaverStrategy({
    clientID: process.env.NAVER_ID,
    clientSecret: process.env.NAVER_PW,
    callbackURL: '/auth/naver/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    logger.info('naver profile', profile);
    try {
      const exUser = await User.findOne({ where: { snsId: profile.email.split('@')[0], provider: 'naver' } });
      if (exUser) return done(null, exUser);
      const sameEmailUser = await User.findOne({ where: { email: profile.email } });
      if (sameEmailUser) {
        logger.error('user with same email found, error');
        return done({ type: 'same email exists', message: `해당 이메일은 ${sameEmailUser.provider || '로컬'}로 가입되어 있습니다.` });
      }
      const newUser = await User.create({
        email: profile.email,
        nick: `${profile.nickname}_naver`,
        snsId: profile.email.split('@')[0],
        provider: 'naver',
      });
      return done(null, newUser);
    } catch (err) {
      logger.error(err);
      return done(err);
    }
  }));
};
