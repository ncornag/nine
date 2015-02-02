'use strict';

var path = require('path')
   ,rootPath = path.normalize(__dirname + '/../..');

var env = process.env.NODE_ENV = process.env.NODE_ENV || 'local';

module.exports = {
   env: env
  ,rootPath: rootPath
  ,bus: {
    impl: process.env.NINE_BUS || 'bus-remote'
    ,url: process.env.RABBITMQ_URL
  }
  ,logger: {
     level: process.env.NINE_LOG || 'info'
    ,express: {
       enabled: true
      ,pattern: ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms'
    }
  }
  ,http: {
     port: process.env.PORT || 3000           // The port on which the server is to listen
    ,host: process.env.IP || '0.0.0.0'        // The bind on which the server is to listen
  }
  ,services: {
    apiRootPath: '/api'
    ,basePath: rootPath + '/services'
  }
}
