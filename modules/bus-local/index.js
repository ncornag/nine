'use strict';

var logger = require('logger')
    ,events = require('events');

var eventEmitter = new events.EventEmitter();

logger.info('[bus] local')

module.exports = exports = {
  send: function (channel, data) {
    eventEmitter.emit(channel, data);
  },
  listen: function(channel, handler) {
    eventEmitter.on(channel, handler);
  }
};
