'use strict';

var config = require('config')
    ,url = require('url')
    ,logger = require('logger');

function init(config) {
  var parsedUrl = url.parse(config.url);
  var data = {
    url: 'amqp://' + (parsedUrl.auth ? (parsedUrl.auth + '@') : '') + parsedUrl.host
    ,vhost: parsedUrl.path.substring(1)
  }
  var bus = require('servicebus').bus(data);
  logger.info('[bus] connected to [%s]', parsedUrl.host)
  return bus;
}

var bus = init(config.bus);

module.exports = exports = {
  send: function (channel, data) {
    bus.send(channel, data);
  },
  listen: function(channel, handler) {
    bus.listen(channel, handler);
  }
};
