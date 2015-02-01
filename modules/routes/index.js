'use strict';

var config = require('config')
    ,fs = require('fs')
    ,express = require('express')
    ,bus = require('bus')
    ,util = require('util')
    ,logger = require('logger')
    ,newId = require('node-uuid')
    ,validator = require('is-my-json-valid');

module.exports = function(rootApp) {

  var waitQueue = {};

  // HTTP request reception
  function requestHandler(channelName) {
    return function(req, res, next) {
      var event = {
        method: req.method
        ,params: req.params
        ,query: req.query
        ,body: req.body
        ,headers: req.headers
        ,cid: newId()
        ,originalUrl: req.originalUrl
      }
      logger.debug('[router] request in \'%s\'. Sending \'%s\' event to \'%s\'.', req.originalUrl, event.cid, channelName);
      // Wait for this cid
      waitQueue[event.cid] = res;
      // Send event to be consumed by the worker
      bus.send(channelName, event);
    }
  }

  // Message reception and worker execution
  function serviceHandler(responseChannelName, service) {
    return function(event) {
      logger.debug('[service] \'%s.%s\' received \'%s\' event.', service.moduleName, service.name, event.cid);

      var response = {cid: event.cid};
      if (service.validateIn && !service.validateIn(event.body)) {
        response.data = {message: 'Validation errors', errors: service.validateIn.errors};
        response.code = 400;
        bus.send(responseChannelName, response);
        return
      }

      service.task(event, function(err, result) {
        if (err) {
          response.data = {message: err.message};
          response.code = 500;
        } else {
          response.data = result.data?result.data:result;
          response.code = result.code || 200;
        }
        logger.debug('[service] \'%s.%s\' sending \'%s\' event to \'%s\'.', service.moduleName, service.name, event.cid, responseChannelName);
        bus.send(responseChannelName, response);
      })
    }
  }

  // HTTP response
  function responseHandler() {
    return function(event) {
      var res = waitQueue[event.cid];
      if (res) {
        logger.debug('[router] response \'%s\'', event.cid);
        res.setHeader('Content-Type', 'application/json');
        res.send(event.code, event.data);
        delete waitQueue[event.cid];
      } else {
        logger.error('[router] not found \'%s\' event', event.cid)
      }
    }
  }


  // Bootstrap modules
  fs.readdir(config.services.basePath, function(err, files) {
    if (err) {
      logger.error('[router]', err)
      return;
    }
    files.forEach(function(moduleName){
      logger.info('[router] bootstrapping [%s] module', moduleName)
      var module = require(config.services.basePath + '/' + moduleName);

      var moduleApp = express.Router();
      module.routes.forEach(function(route){
        logger.debug('[router] bootstrapping [%s.%s] service in \'%s/%s%s\' (%s)', moduleName, route.service, config.services.apiRootPath, moduleName, route.path, route.method)

        var channelName = util.format('%s.%s', moduleName, route.service);
        var responseChannelName = util.format('%s.RESPONSE', channelName);
        var serviceFileName = util.format('%s/%s/handlers/%s.js', config.services.basePath, moduleName, route.service)

        var service = require(serviceFileName);
        service.moduleName = moduleName;
        service.name = route.service;

        if(service.schemas && service.schemas.in) {
          service.validateIn = validator(service.schemas.in);
        }

        // Wire the route to the handler that sends the event.
        moduleApp[route.method](route.path, requestHandler(channelName));

        // Worker listener
        bus.listen(channelName, serviceHandler(responseChannelName, service));

        // Response listener
        bus.listen(responseChannelName, responseHandler());

      })
      rootApp.use(config.services.apiRootPath + '/' + moduleName, moduleApp)

    })
  })

};