const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Good, Auction, User } = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const logger = require('../logger');

const router = express.Router();

router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

router.get('/', async (req, res, next) => {
  try {
    const goods = await Good.findAll({ where: { SoldId: null } });
    res.render('main', {
      title: 'NodeAuction',
      goods,
    });
  } catch (err) {
    logger.error(err);
    next(err);
  }
});

router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join', {
    title: '회원가입 - Node Auction',
  });
});

router.get('/good', isLoggedIn, (req, res) => {
  res.render('good', { title: '상품 등록 - Node Auction' });
});

try {
  fs.readdirSync('uploads');
} catch (err) {
  logger.error(err);
  logger.info('uploads 폴더를 새로 만듭니다.');
  fs.mkdirSync('uploads');
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, '/uploads');
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/good', isLoggedIn, upload.single('img'), async (req, res, next) => {
  try {
    const { name, price } = req.body;
    await Good.create({
      OwnerId: req.user.id,
      name,
      img: req.file.filename,
      price,
    });
    return res.redirect('/');
  } catch (err) {
    logger.error(err);
    next(err);
  }
});

module.exports = router;