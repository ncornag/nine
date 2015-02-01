var config = require('config')
   ,logger = require('logger')
   ,winston = require('winston')
   ,expressWinston = require('express-winston')
   ,morgan = require('morgan')
   ,express = require('express')
   ,bodyParser = require('body-parser')
   ,multer = require('multer');

var app = express();

// configure body parser
app.use(bodyParser.json());                         // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer());                                  // for parsing multipart/form-data

// Log HTTP requests
if(config.logger.express.enabled) {
   app.use(morgan(config.logger.express.pattern))
}

// Add routes
var routes = require('routes')(app);

// Log errors
app.use(expressWinston.errorLogger({
   transports: [
      new winston.transports.Console({ json: true, colorize: true })
   ]
   ,statusLevels: true
}));

// A standard error handler - it picks up any left over errors and returns
// a nicely formatted server 500 error
app.use(function errorHandler(err, req, res, next){
   if (err.status) res.statusCode = err.status;
   if (res.statusCode < 400) res.status(500);
   //if ('test' != env) console.error(err.stack);
   var accept = req.headers.accept || '';
   //if (~accept.indexOf('html')) {
      //// html
      //var page_html = ejs.renderFile(config.server.distFolder + '/500.html',
      //   {open: '[%', close: '%]',
      //      url: req.originalUrl,
      //      error: err.toString()
      //   }, function(err, page_html){
      //      if (err) return res.send(500, 'Error with the error page. Funny.')
      //      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      //      res.send(page_html);
      //   });
   //} else
   if (~accept.indexOf('json')) {
      // json
      res.setHeader('Content-Type', 'application/json');
      var error = { message: err.message };
      for (var prop in err) error[prop] = err[prop];
      var json = JSON.stringify({ error: error });
      res.end(json);
   } else {
      // plain text
      res.setHeader('Content-Type', 'text/plain');
      res.end(err.toString());
   }
});

app.listen(config.http.port, config.http.host)
logger.info('[express] initialized on %s:%s', config.http.host, config.http.port)
module.exports = app
