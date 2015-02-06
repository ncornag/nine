'use strict';

module.exports = function(nine) {
  return require(nine.config.get('bus:impl'))(nine);
}
