'use strict';
console.log(__dirname)
var config = require('../lib/modules/config')([
  '../test/config/test.json'
  ,'./modules/config/defaults.json' // nine defaults
])

//config.set('services:basePath', __dirname + '/services');
config.set('rootPath', __dirname); // Needed until the nine deploy to npm

console.log(config.get('services:basePath'))
console.log(config.get('rootPath'))

var nine = require('../lib/nine')({
  config: config
});

module.exports = nine.app;  // easy testing