'use strict';

module.exports = function(nine) {
  return {
    routes: [
      {path: '/:id', method: 'post', service: 'post'}
    ]
  }
}