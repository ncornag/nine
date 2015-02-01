'use strict';

module.exports = function(config) {
  config.bus.impl = process.env.S_BUS || 'bus-local';
  config.logger.express.enabled = false;
  config.services.basePath = config.rootPath + '/test/services';
  return config;
}
