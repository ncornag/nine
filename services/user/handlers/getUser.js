'use strict';

var logger = require('logger');

exports.task = function(event, done) {
  return done(null, event.params);
}
