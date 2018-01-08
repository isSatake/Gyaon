var express     = require('express');
var http        = require('http');
var app         = express();

var path        = require('path');
var logger      = require('morgan');
var bodyParser  = require('body-parser');
var debug       = require('debug')('gyaon:server');

var routes      = require('./routes/index');

/**
 * server setup
 */
app.set('port', process.env.PORT || 3000);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

function forceHttps(req, res, next){
  if (process.env.FORCE_SSL === 'true' && req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] === "http") {
    res.redirect('https://' + req.headers.host + req.url);
  }else {
    return next();
  }
};

app.all('*', forceHttps)
app.use('/', routes);

var server = http.createServer(app);
var io = require('socket.io')(server);
app.set('socket.io', io);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

/**
 * error handlers
 */
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send(err.message)
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send(err.message)
});

/**
 * server start
 */
server.listen(app.get('port'));
server.on('error', onError);
server.on('listening', onListening);


function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var port = app.get('port')
  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

module.exports = app;
