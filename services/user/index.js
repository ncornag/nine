'use strict';

var logger = require('logger');

exports.routes = [
  {path: '/:id', method: 'get', service: 'getUser'}
  ,{path: '/:id', method: 'put', service: 'updateUser'}
  ,{path: '/:id', method: 'post', service: 'postUser'}
]