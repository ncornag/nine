'use strict';

/**
 * Module dependencies.
 */
var events = require('events');

var utils = {

  /**
   * App wide events emmiter
   */
  eventEmitter: new events.EventEmitter()

  ,randomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

}

module.exports = utils;