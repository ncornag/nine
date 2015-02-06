'use strict';

var config = require('config')([
  'modules/config/' + (process.env.NODE_ENV || 'local') + '.json'
  ,'modules/config/defaults.json'
])

var nine = require('nine')({
  config: config
});

module.exports = nine.app;  // easy testing.