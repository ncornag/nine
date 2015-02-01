'use strict';

var defaults = require('./config-defaults')
module.exports = require('./config-' + defaults.env + '.js')(defaults);
console.log('%s - \u001b[32minfo\u001b[39m: [config] using [%s] configuration', new Date().toISOString(), defaults.env)
