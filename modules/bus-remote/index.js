'use strict';

var url = require('url')
   ,servicebus = require('servicebus');

module.exports = function(nine) {

  function init(config) {
    var parsedUrl = url.parse(config.url);
    var data = {
      url: 'amqp://' + (parsedUrl.auth ? (parsedUrl.auth + '@') : '') + parsedUrl.host
      ,vhost: parsedUrl.path.substring(1)
    }
    var bus = servicebus.bus(data);
    nine.logger.info('[bus] connected to [%s]', parsedUrl.host)
    return bus;
  }

  var bus = init(nine.config.get('bus'));

  return {
    send: function (channel, data) {
      bus.send(channel, data);
    },
    listen: function (channel, handler) {
      bus.listen(channel, handler);
    }
  }
};
