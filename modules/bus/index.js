'use strict';

var config = require('config')
    ,url = require('url')
    ,logger = require('logger');

function bus(config) {
  var parsedUrl = url.parse(config.url);
  var data = {
    url: 'amqp://' + (parsedUrl.auth ? (parsedUrl.auth + '@') : '') + parsedUrl.host
    ,vhost: parsedUrl.path.substring(1)
  }
  var bus = require('servicebus').bus(data);
  logger.info('[bus] connected to [%s]', parsedUrl.host)
  return bus;
}

module.exports = exports = bus(config.bus);
