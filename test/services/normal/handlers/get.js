'use strict';

exports.task = function(event, done) {
  return done(null, event.params);
}
