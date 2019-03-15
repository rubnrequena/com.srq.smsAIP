var createError = require('http-errors');
var express = require('express');
const session = require('express-session');
const mongoStore = require('connect-mongo')(session);
var path = require('path');
var cookieParser = require('cookie-parser');
const passport = require('passport');
const compression = require('compression');

var CronJob = require('cron/lib/cron.js').CronJob;
const resHuerfanos = require('./controllers/RestaurarHuerfanos');
const job = new CronJob(resHuerfanos.retraso, resHuerfanos.job);
job.start();

var app = express(); 

app.locals.moment = require("moment");

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

let mongorc = require("./config/mongo");
app.use(session({
  secret: 'sms-secret-52', 
  //cookie: { maxAge: 60000 * 5 }, 
  resave: false, 
  saveUninitialized: false,
  store: new mongoStore({
    url:mongorc.uri,
    autoReconnect:true
  })
 }));

app.use(passport.initialize());
app.use(passport.session());
app.use((req,res,next) => {
  res.render2 = (view,opt) => {
    opt = opt || {};
    if (req.user) opt.usuario = req.user;
    res.render(view,opt);
  }
  next();
})

//routes
var indexRouter = require('./routes/index');
var usuariosRouter = require('./routes/usuario');
var smsRouter = require('./routes/sms');
var apiRouter = require('./routes/api/index');
var admRouter = require('./routes/admin');

app.use('/', indexRouter);
app.use('/usuario', usuariosRouter);
app.use('/sms',smsRouter);
app.use('/api',apiRouter);
app.use('/adm',admRouter);

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
