'use strict';

module.exports = function(nine) {
  return {
    task: function(event, done) {
      return done(new Error('Something went wrong', 404));
    }
  }
}