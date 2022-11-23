const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
const logger = require('../logger');
const User = require('../models/user');

module.exports = () => {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/auth/github/callback',
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const exUser = await User.findOne({ where: { snsId: profile.id, provider: 'github' } });
      if (exUser) return done(null, exUser);

      const sameEmailUser = await User.findOne({ where: { email: profile.emails[0].value } });
      if (sameEmailUser) {
        logger.error('user with same email found, error');
        return done({ type: 'same email exists', message: `해당 이메일은 ${sameEmailUser.provider || '로컬'}로 가입되어 있습니다.` });
      }

      const newUser = await User.create({
        email: profile.emails[0].value,
        nick: profile.displayName,
        snsId: profile.id,
        provider: 'github',
      });
      return done(null, newUser);
    } catch (err) {
      logger.error(err);
      return done(err);
    }
  }));
};
