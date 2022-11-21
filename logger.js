const { createLogger, format, transports } = require('winston');

const toKST = () => new Date.toLocaleString('en-US', {
  timeZone: 'Asia/Seoul',
});

const logger = createLogger({
  level: 'info',
  format: format.combine(format.json(), format.timestamp({ format: toKST })),
  transports: [
    new transports.File({ filename: 'combined.log' }),
    new transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.combine(format.simple(), format.timestamp({ format: toKST })),
  }));
}

module.exports = logger;
