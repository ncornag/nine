'use strict';

exports.task = function(event, done) {
  return done(new Error('Something went wrong', 404));
}
