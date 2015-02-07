'use strict';

module.exports = function(options) {
  options = options || {
    // config: Configuration Object
    // logger: Logger service
  };

  var nine = {};

  // Configuration object
  nine.config = options.config;

  // Logger service
  nine.logger = options.logger || require('./modules/logger')(nine);

  // Bus
  nine.bus = options.bus || require('./modules/bus')(nine);

  // Express App
  nine.app = options.app || require('./modules/expressapp')(nine);

  return nine;
}
