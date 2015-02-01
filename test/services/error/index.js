'use strict';

var logger = require('logger');

exports.routes = [
  {path: '/:id', method: 'get', service: 'get'}
  ,{path: '/:id', method: 'post', service: 'post'}
]