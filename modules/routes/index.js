'use strict';

var config = require('config')
    ,fs = require('fs')
    ,express = require('express')
    ,bus = require('bus')
    ,util = require('util')
    ,utils = require('utils')
    ,logger = require('logger')
    ,newId = require('node-uuid')
    ,validator = require('is-my-json-valid');

module.exports = function(rootApp) {

  var serverId = utils.newShortId();
  var waitQueue = {};

  // HTTP request reception
  function requestHandler(queueName) {
    return function(req, res, next) {
      var responseQueueName = util.format('%s.%s.RESPONSE', queueName, serverId);
      var event = {
        method: req.method
        ,params: req.params
        ,query: req.query
        ,body: req.body
        ,headers: req.headers
        ,cid: newId()
        ,originalUrl: req.originalUrl
        ,replyTo: responseQueueName
      }
      logger.debug('[router] [%s] request [%s] [%s] [%s]', serverId, event.cid, queueName, req.originalUrl);
      // Wait for this cid
      waitQueue[event.cid] = res;
      //var options = {
      //  replyTo: responseQueueName
      //}
      // Send event to be consumed by the worker
      bus.send(queueName, event); //, options);
    }
  }

  // Message reception and worker execution
  function serviceHandler(responseQueueName, service) {
    return function(event) {
      logger.debug('[service] [%s] received [%s] [%s.%s]', serverId, event.cid, service.moduleName, service.name);

      var response = {cid: event.cid};
      if (service.validateIn && !service.validateIn(event.body)) {
        response.data = {message: 'Validation errors', errors: service.validateIn.errors};
        response.code = 400;
        bus.send(responseQueueName, response);
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
        logger.debug('[service] [%s] result [%s] [%s.%s]', serverId, event.cid, service.moduleName, service.name);
        bus.send(event.replyTo, response);
      })
    }
  }

  // HTTP response
  function responseHandler() {
    return function(event) {
      var res = waitQueue[event.cid];
      if (res) {
        logger.debug('[router] [%s] response [%s] [%s]', serverId, event.cid, res.req.originalUrl);
        res.setHeader('Content-Type', 'application/json');
        res.send(event.code, event.data);
        delete waitQueue[event.cid];
      } else {
        logger.error('[router] [%s] not found [%s] event', serverId, event.cid)
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

        var queueName = util.format('%s.%s', moduleName, route.service);
        var responseQueueName = util.format('%s.%s.RESPONSE', queueName, serverId);
        var serviceFileName = util.format('%s/%s/handlers/%s.js', config.services.basePath, moduleName, route.service)

        var service = require(serviceFileName);
        service.moduleName = moduleName;
        service.name = route.service;

        if(service.schemas && service.schemas.in) {
          service.validateIn = validator(service.schemas.in);
        }

        // Wire the route to the handler that sends the event.
        moduleApp[route.method](route.path, requestHandler(queueName));

        // Worker listener
        bus.listen(queueName, serviceHandler(responseQueueName, service));

        // Response listener
        bus.listen(responseQueueName, responseHandler());

      })
      rootApp.use(config.services.apiRootPath + '/' + moduleName, moduleApp)

    })
  })

};