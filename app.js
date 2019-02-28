var createError = require('http-errors');
var express = require('express');
const session = require('express-session');
const mongoStore = require('connect-mongo')(session);
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require('passport');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var smsRouter = require('./routes/sms');
var apiRouter = require('./routes/api');

var CronJob = require('cron/lib/cron.js').CronJob;
const job = new CronJob('*/5 * * * * *', require('./controllers/RestaurarHuerfanos'));
//job.start();

var app = express(); 

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'sms-secret-52', 
  cookie: { maxAge: 60000 * 5 }, 
  resave: false, 
  saveUninitialized: false,
  store: new mongoStore({
    url:'mongodb://dario:dario123@ds139985.mlab.com:39985/srqhermes',
    autoReconnect:true
  })
 }));

app.use(passport.initialize());
app.use(passport.session()); 

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/sms',smsRouter);
app.use('/api',apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
