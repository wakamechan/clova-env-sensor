const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const {SERVER_PORT} = require('./config.js');
const routes = require('./routes');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
global.io = io;

io.on('connection', function(socket){
  console.log('a user connected');
});

app.use(bodyParser.json())
app.use(morgan('common'));
app.use((err, req, res, next) => next());

app.use('/', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

server.listen(SERVER_PORT, () => {
  console.log(`Server is running on ${SERVER_PORT} port`);
});
