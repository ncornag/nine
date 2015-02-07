'use strict';

module.exports = function(nine) {
  return {
    task: function(event, done) {
      return done(null, {code:201, data:event.body});
    }
  }
}