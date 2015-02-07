var winston = require('winston')

module.exports = function(nine) {
  var level = nine.config.get('logger:level');
  var logger = new (winston.Logger)({
    transports: [
      new (winston.transports.Console)({ level: level, json: false, timestamp: true, colorize: true })
    ],
    exceptionHandlers: [
      new (winston.transports.Console)({ level: level, json: false, timestamp: true, colorize: true, silent: false, prettyPrint: true  })
    ],
    exitOnError: false
  });
  logger.info('[logger] initialized with [%s] level', level);
  return logger;
}

