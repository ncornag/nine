'use strict';

module.exports = function(nine) {
  return {
    routes: [
      {path: '/:id', method: 'get', service: 'get'}
      ,{path: '/:id', method: 'post', service: 'post'}
    ]
  }
}