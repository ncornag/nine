'use strict';

module.exports = function(nine) {
  return {
    task: function(event, done) {
      return done(null, event.params);
    }
  }
}