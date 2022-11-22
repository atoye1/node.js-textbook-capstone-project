// 필요한 패키지를 설치한다.
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');
const nunjucks = require('nunjucks');
const Redis = require('ioredis');
const RedisStore = require('connect-redis')(session);

const dotenv = require('dotenv');
dotenv.config();

// 사용자 정의 패키지를 불러온다.
const logger = require('./logger');
// const checkAuction = require('./checkAuction');
const { sequelize } = require('./models');
const passportConfig = require('./passport');

// 라우터를 불러온다.
const indexRouter = require('./routes');
const authRouter = require('./routes/auth');
const sse = require('./reference/sse');

const app = express();
passportConfig();
// checkAuction();

app.set('port', process.env.PORT || 8010);
app.set('view engine', 'html');

nunjucks.configure('views', {
  express: app,
  watch: true,
});

sequelize.sync({ force: false })
  .then(() => {
    logger.info('데이터베이스 연결 성공');
  }).catch((err) => {
    logger.error(err);
  });

const redisClient = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

const sessionMiddleware = session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
  store: new RedisStore({ client: redisClient }),
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/auth', authRouter);

// no router error
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

const server = app.listen(app.get('port'), () => {
  logger.info(app.get('port'), '번 포트에서 대기중');
});

// WebSocket(server, app);
// sse(server);
