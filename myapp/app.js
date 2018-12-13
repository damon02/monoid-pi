const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressValidator = require('express-validator')
const indexRouter = require('./routes/index');

var session = require('express-session')
const bodyParser = require('body-parser');
const app = express();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressValidator())

//SECURITY STUFF
app.use(helmet.noCache())
app.use(helmet());

// /**
//  * Rate limit all requests
//  */
// var limiter = new rateLimit({
//   windowMs: 60*1000, // How long is the timespan?
//   delayAfter: 0, //begin slowing down responses after the first request
//   delayMs: 0, //slow down subsequent responses by 3 seconds per request
//   max: 5000, //start blocking after 5 requests
//   message:"Too many request, try again in {minutes} minutes",
// headers:true//show header stats with attemts remaining
// });

// //  apply to all requests
// app.use(limiter);


//remove server header
app.disable('x-powered-by');


app.use(function (req, res, next) {
  res.setHeader( 'Server', 'Go away script kiddie' );
  next();
});


// use sessions for tracking logins
app.use(session({
  key: 'user_sid',
  secret: '5c3537cd0132a595cbe0abf171428063bab4bdbb79900361f870c35d4d4267be',
  resave: false,
  saveUninitialized: false,
  cookie: {
    //secure: true, //moet true gezet worden als er HTTPS is
    httpOnly: true,
    path: '/',
    expires: new Date(Date.now() + 60 * 60 * 1000)  //one hour
  }
}));


// This middleware will check if user's cookie is still saved in browser and user is not set, then automatically log the user out.
// This usually happens when you stop your express server after login, your cookie still remains saved in the browser.
app.use((req, res, next) => {
  if (req.cookies.user_sid && !req.session.user) {
      res.clearCookie('user_sid');        
  }
  next();
});


// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', indexRouter);


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
