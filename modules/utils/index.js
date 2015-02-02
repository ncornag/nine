'use strict';

/**
 * Module dependencies.
 */
var events = require('events')
   ,shortId = require('shortid');

shortId.seed(6977)

var utils = {

  /**
   * App wide events emmiter
   */
  eventEmitter: new events.EventEmitter()

  ,randomInt: function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Create shorth unique number
   */
  ,newShortId: function() {
    return shortId.generate();
  }

}

module.exports = utils;