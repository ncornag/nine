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

  function bootstrapServices(modules, path) {
    modules.forEach(function(moduleData){

      var isLocal = path!=undefined;

      var modulePath = isLocal?(path + '/' + moduleData):config.rootPath+'/node_modules/' + moduleData.module;
      var module = require(modulePath);
      if(isLocal) {
        module.name = module.name || moduleData;
        module.route = module.route || module.name;
      } else {
        module.name = moduleData.name || module.name || moduleData.name;
        module.route = moduleData.route || module.route || module.name;
      }
      logger.info('[router] bootstrapping [%s] module in [%s/%s]', module.name, config.services.apiRootPath, module.route);

      var moduleApp = express.Router();
      module.routes.forEach(function(route){

        var queueName = util.format('%s.%s', module.name, route.service);
        var responseQueueName = util.format('%s.%s.RESPONSE', queueName, serverId);
        var serviceFileName = util.format('%s/handlers/%s.js', modulePath, route.service)

        var service = require(serviceFileName);
        service.moduleName = module.name;
        service.name = route.service;

        logger.debug('[router] bootstrapping [%s.%s] service in \'%s%s\' (%s)', module.name, route.service, module.route, route.path, route.method)

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
      rootApp.use(config.services.apiRootPath + '/' + module.route, moduleApp);

    })
  }

  // Bootstrap services
  if (config.services.basePath) {
    fs.readdir(config.services.basePath, function(err, files) {
      if (err) {
        logger.error('[router]', err)
        return;
      }
      bootstrapServices(files, config.services.basePath);
    })
  }

  if (config.services.modules) {
    bootstrapServices(config.services.modules);
  }

};