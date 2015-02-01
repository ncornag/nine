'use strict';

exports.task = function(event, done) {
  return done(null, {code:201, data:event.params});
}
