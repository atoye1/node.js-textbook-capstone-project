const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const logger = require('../logger');

const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const {
    email, nick, password, money,
  } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      const message = encodeURIComponent(`${exUser.provider}에서 이미 가입된 이메일입니다.`);
      return res.redirect(`/join?joinError=${message}`);
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
      money,
      provider: 'local',
    });
    return res.redirect('/');
  } catch (err) {
    logger.error(err);
    return next(err);
  }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {
      logger.error(authError);
      return next(authError);
    }

    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }

    return req.login(user, (loginError) => {
      if (loginError) {
        logger.error(loginError);
        return next(loginError);
      }
      return res.redirect('/');
    });
  })(req, res, next);
});

router.get('/logout', isLoggedIn, (req, res) => {
  req.logout(() => {
    req.session.destroy();
    return res.redirect('/');
  });
});

router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/',
}), (req, res) => {
  res.redirect('/');
});

router.get('/naver', passport.authenticate('naver', { authType: 'reprompt' }));

router.get('/naver/callback', passport.authenticate('naver', {
  failureRedirect: '/join?joinError=error while logging in with naver',
}), (req, res, done) => {
  logger.info(res);
  logger.info(done);
  res.redirect('/');
});

router.get('/github', passport.authenticate('github'));
router.get('/github/callback', passport.authenticate('github', {
  failureRedirect: '/',
}), (req, res) => {
  console.log(req, res);
  res.redirect('/');
});

router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));
router.get('/google/callback', passport.authenticate('google', {
  failureRedirect: '/',
}), (req, res) => {
  console.log(req, res);
  res.redirect('/');
});

module.exports = router;
