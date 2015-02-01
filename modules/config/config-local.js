'use strict';

module.exports = function(config) {
  config.bus.url = 'amqp://localhost/';
  config.logger.level = 'debug';
  config.logger.express.enabled = false;
  return config;
}
