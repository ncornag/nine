'use strict';

module.exports = function(config) {
  config.bus.url = process.env.RABBITMQ_URL || 'amqp://localhost/';
  config.bus.impl = process.env.NINE_BUS || 'bus-local';
  config.logger.level = process.env.NINE_LOG || 'debug';
  config.logger.express.enabled = false;
  return config;
}
