'use strict';

var logger = require('logger');

exports.task = function(event, done) {
  //return done(new Error('Something went wrong', 404), 'test');
  //return done(null, {code:201, data:{params: event.params}});
  return done(null, event.params);
}
