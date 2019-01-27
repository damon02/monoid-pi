const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const expressValidator = require('express-validator')
const indexRouter = require('./routes/index');
var ip = require("ip");
var session = require('express-session')
const bodyParser = require('body-parser');
const app = express();
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
var cors = require('cors');
const socket_io    = require( "socket.io" );
var cookie = require('cookie');
var sharedsession = require("express-socket.io-session");


const systemData = require('./modules/systemData');
const Tap = require('./modules/Tap');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressValidator())


/*
Helmet setup 
This middleware adds some protective headers see for more info -> https://www.npmjs.com/package/helmet
*/


app.use(helmet());
app.use(helmet.noCache())
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self' 'unsafe-inline'"],
        imgSrc: ["'self' data:"],
        scriptSrc: ["'self' 'unsafe-inline'"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
    }
}))
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));



/**
 * Rate limit all requests
 */
var limiter = new rateLimit({
  windowMs: 60*1000, // How long is the timespan?
  delayAfter: 0, //begin slowing down responses after the first request
  delayMs: 0, //slow down subsequent responses by 3 seconds per request
  max: 200, //start blocking after 200 requests
  message:"Congrats! you are rate-limited!",
headers:true//show header stats with attemts remaining
});

//  apply to all requests
app.use(limiter);


//remove server header
app.disable('x-powered-by');
app.set('etag', false); // turn off


app.use(function (req, res, next) {
  res.setHeader( 'Server', 'Go away script kiddie' );
  next();
});


// use sessions for tracking logins  
  
let sessionMiddleware = session({
  key: 'user_sid',
  secret: '5c3537cd0132a595cbe0abf171428063bab4bdbb79900361f870c35d4d4267be',
  resave: true,
  saveUninitialized: false,
  cookie: {
    secure: true, //moet true gezet worden als er HTTPS is
    httpOnly: true,
    path: '/',
    expires: new Date(Date.now() + 15 * 60 * 1000),  //15 minutes,
    sameSite: true
    
  }
})

app.use(sessionMiddleware)

//CORS

let adres= ip.address()

var corsOptions = {
  origin: adres,
  methods: 'GET,POST',
  allowedHeaders: ['Accept', 'Content-Type'],
  credentials: true,
  // preflightContinue: true
}
app.use(cors(corsOptions));


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
  res.status(404);
  res.render('404');
  // next(createError(404));
});


// error handler
app.use(function (err, req, res, next) {
  if (err.code == 'EBADCSRFTOKEN'){

     // handle CSRF token errors here
  res.status(403)
  res.render('403',{msg:"Form tampered with"});

  }

 
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'production' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



// Socket.io
var io           = socket_io();

io.use(sharedsession(sessionMiddleware, {
  autoSave:true
}));

app.io           = io;


io.set('authorization', function (data, accept) {
  // check if there's a cookie header

  if (data.headers.cookie) {
      // if there is, parse the cookie

      try {
        data.cookie = cookie.parse(data.headers.cookie);

        data.sessionID = data.cookie['user_sid'];

        accept(null, true);
        
      } catch (error) {

        return accept('', false);

      }


  } else {
     // if there isn't, turn down the connection with a message
     // and leave the function.
     return accept('', false);
  }
  // accept the incoming connection
});


io.on('connection', function (socket) {

  if(socket.handshake.session.user){

  Tap.isRunning().then(response =>{
    socket.emit('tap_status',response)
  })

  socket.on('stopTap', function(){
  
    Tap.stopTap().then(response =>{
      response.msg="user stopped the tap"
      socket.emit('tap_status',response)
    })
  
  })
  
  
socket.on('testApiConnection', function(){

  Tap.testConnection().then(connection_status =>{
    console.log(connection_status)


    socket.emit('connection_status',connection_status)

  }).catch(err =>{
    socket.emit('connection_status',{success:false,message:'Network error'})
  })

  Tap.isRunning().then(response =>{

    socket.emit('tap_status',response)
  })
})


  socket.on('startTap', function(){
    Tap.testConnection().then(response =>{
      if(response.success){
        Tap.startTap().then(result =>{
          
          socket.emit('tap_status',result)
        })
      }else{
        socket.emit('tap_status',{success:false, current_status:"Tap not running", msg:'could not connect to API'})
      }
  }).catch(err =>{
    socket.emit('tap_status',{success:false, current_status:"Tap not running", msg:'could not connect to API'})
  })
})


//get system data each second
  setInterval(function () {
    systemData.getSystemData().then(systemData =>{
      for(let key in systemData){
        socket.emit(key, systemData[key])
      }
  }).catch( err =>{
    console.log(err)
  })
  
}, 1000); 

}

});



module.exports = app;

