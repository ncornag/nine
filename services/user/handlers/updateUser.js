'use strict';

var logger = require('logger');

exports.task = function(event, done) {
  return done(null, {data:{params: event.params}});
}
