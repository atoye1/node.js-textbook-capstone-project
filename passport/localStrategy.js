const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const logger = require('../logger');
const User = require('../models/user');

module.exports = () => {
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  }, async (email, password, done) => {
    try {
      const exUser = await User.findOne({ where: { email } });
      if (!exUser) return done(null, false, { message: '가입되지 않은 회원입니다.' });
      if (exUser.provider) return done(null, false, { message: `해당 이메일은 소셜로그인 제공자 ${exUser.provder}로 가입되어 있습니다.` });

      const result = await bcrypt.compare(password, exUser.password);
      if (!result) return done(null, false, { message: '비밀번호가 일치하지 않습니다.' });

      return done(null, exUser);
    } catch (err) {
      logger.error(err);
      return done(err);
    }
  }));
};
