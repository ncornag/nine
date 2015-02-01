'use strict';

module.exports = function(config) {
  config.bus.url = 'amqp://localhost/';
  config.logger.express.enabled = false;
  config.services.basePath = config.rootPath + '/test/services';
  return config;
}
