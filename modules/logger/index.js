var config = require('config')
   ,winston = require('winston')

module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ level: config.logger.level, json: false, timestamp: true, colorize: true })
  ],
  exceptionHandlers: [
    new (winston.transports.Console)({ level: config.logger.level, json: false, timestamp: true, colorize: true, silent: false, prettyPrint: true  })
  ],
  exitOnError: false
});

module.exports.info('[logger] initialized with [%s] level', config.logger.level)
