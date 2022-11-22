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

      logger.info(profile);
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
