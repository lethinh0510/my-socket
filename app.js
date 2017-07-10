var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', index);
// app.use('/users', users);

// catch 404 and forward to error handler


var http = require('http').Server(app);
var io = require('socket.io')(http);
var jwt = require('jsonwebtoken');
var jwtSecret = "ACBSSSMMS";

io.on('connection', function (socket) {
    console.log('a user connected');
});

app.post('/login', function (req, res) {
    var profile = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@doe.com',
        id: 123
    };

    // we are sending the profile in the token
    var token = jwt.sign(profile, jwtSecret, {expiresIn: 60});

    res.json({token: token});
});



var socketioJwt = require('socketio-jwt');

var sio = io.listen(http);

sio.set('authorization', socketioJwt.authorize({
    secret: jwtSecret,
    handshake: true
}));

sio.sockets
    .on('connection', function (socket) {
        console.log(socket.handshake.decoded_token.email, 'connected');
    });


app.post('', function (req, res) {

    sio.sockets
        .emit('admin', req.body.message);
    res.json('Success');
});








app.get('/', function (req, res) {

    res.render('index', {title: 'Express'});
});

app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

var port = normalizePort(process.env.PORT || '3000');
http.listen(port, function () {
    console.log('listening on *:' + port);
});

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}
