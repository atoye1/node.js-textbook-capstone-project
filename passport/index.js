const passport = require('passport');

const local = require('./localStrategy');
const User = require('../models/user');

module.exports = () => {
  // 로그인 이후 얻어진 사용자 정보 객체를 세션에 저장하고, 쿠키로 사용자 브라우저로 전송해준다.
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // 사용자 브라우저에서 보내온 쿠키에 있는 세션 아이디에 유저정보가 포함되었는지 검사하고, 응답을 돌려준다.
  passport.deserializeUser((id, done) => {
    User.findOne({ where: { id } })
      .then((user) => done(null, user))
      .catch((err) => done(err));
  });
  local();
};
