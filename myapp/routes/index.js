const express = require('express');
const router = express.Router();
const mid = require('../middleware');
const model = require('../models/user');
const owasp = require('owasp-password-strength-test');
const systemData = require('../modules/systemData')
const Tap = require('../modules/Tap')
const ip = require("ip");
let csrf = require('csurf');
var bodyParser = require('body-parser')
const uuidv4 = require('uuid/v4');

// setup route middlewares
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false })




/* GET landing page. */
router.get('/',csrfProtection, function(req, res, next) {
    res.render('index', {password:"Mono1d_INC!", username: 'monoid', csrfToken: req.csrfToken() });
}); 


// GET /dashboard
router.get('/dashboard',csrfProtection, mid.requiresLogin, function(req, res, next) {

  let User = model.getUserObject()

  if (req.session.user && req.cookies.user_sid) {

      return res.render('dashboard', 
      {title: 'Dashboard', 
      username: User.username, 
      token: User.api_token, 
      ip_adr: ip.address(),
      last_logged_in: User.last_logged_in,
      csrfToken: req.csrfToken(),
      socketToken: req.session.socketToken
    })

  }else{
    var err = new Error('Page not found');
    err.status = 404;
    return next("error");
  }
});

// POST /login
router.post('/login', parseForm, csrfProtection, function(req, res, next) {

  if (req.body.username && req.body.password) {
    model.authenticate(req.body.username, req.body.password, function (error, user) {
      if (error || !user) {
        return res.render('index', { message: 'username or password incorrect'});

      }  else {

        req.session.user = user;
        req.session.socketToken = uuidv4();

        if(user.hasChangedPassword === false){
          return res.redirect('/changedefault');

        }
        return res.redirect('/dashboard');
      }
    });
  } else {
    var err = new Error('Username and password are required.');
    err.status = 404;
    return next(err);
  }
});


// route for user logout
router.get('/logout', (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
      model.setLastLogin()
      res.clearCookie('user_sid');
      res.redirect('/');
  } else {
      res.redirect('/');
  }
});

router.get('/changedefault', csrfProtection,mid.requiresLogin, function(req, res, next) {
  if (req.session.user && req.cookies.user_sid) {
      if(!model.hasChangedPassword()){
        return res.render('changedefault', { title: 'passwords cannot be restored when lost!', csrfToken: req.csrfToken()});
      }else{
        res.redirect('/dashboard')
      }
  }else{
    var err = new Error('Page not found');
    err.status = 404;
    return next("error");
  }
});


router.post('/changedefault',parseForm, csrfProtection,mid.requiresLogin, (req, res,next) => {

  if (req.session.user && req.cookies.user_sid) {

    if (req.body.username_new && req.body.password_new  && req.body.password_new_verify) {
          if(req.body.password_new != req.body.password_new_verify){
            return res.render('changedefault', { message: 'New password does not match!'});
          }
        
          let result = owasp.test(req.body.password_new);

          if(result.errors.length > 1){
            return res.render('changedefault', { message: 'Password too weak!'});

          }else{

            if(req.body.username_new.length > 0 && req.body.username_new.length  < 30){
              let itemsToUpdate = {"username": req.body.username_new, "password": req.body.password_new}

              return model.updateUser(itemsToUpdate).then(function(new_storage_object){
                model.writeToConfig(new_storage_object)
                return res.redirect('/dashboard');
              }).catch(err =>{
                return res.redirect('/logout');
              })
            }else{
              return res.render('changedefault', { message: 'poor username'});
            }

          }

          }else{
            return res.render('changedefault', { message: 'Incomplete form'});

          }          
        }else {
          err.status = 404;
          return next(err);
  }
});

// router.get('/userData', (req, res,next) => {

// }) 

router.post('/updateApiToken', parseForm, csrfProtection,mid.requiresLogin, (req, res,next) => {

  if (req.session.user && req.cookies.user_sid) {
    if(req.body.apiToken.length > 5 && req.body.apiToken.length  < 40){
      let itemsToUpdate = {"api_token": req.body.apiToken}
    return model.updateUser(itemsToUpdate).then(function(new_storage_object){
      model.writeToConfig(new_storage_object)
      return res.redirect('/dashboard');
    }).catch(err =>{
      res.clearCookie('user_sid');
      return res.render('index', {password:"Mono1d_INC!", username: 'monoid', message:'Congrats script kiddo,  you are now officially comprimised!' });
    })
  }else{
    return res.render('dashboard', { message: 'Bad Token'});
  }
  }else {
    err.status = 404;
    return next(err);
}

})


router.post('/updateUsername', parseForm, csrfProtection,mid.requiresLogin, (req, res,next) => {
  if (req.session.user && req.cookies.user_sid) {
    if(req.body.username.length > 3 && req.body.username.length  < 30){
      let itemsToUpdate = {"username": req.body.username}
    return model.updateUser(itemsToUpdate).then(function(new_storage_object){
      model.writeToConfig(new_storage_object)
      return res.redirect('/dashboard');
    }).catch(err =>{
      res.clearCookie('user_sid');
      return res.render('index', {password:"Mono1d_INC!", username: 'monoid', message:'Congrats script kiddo, you are now officially comprimised!' });
    })
  }else{
    return res.render('/dashboard', { message: 'poor username'});
  }
  }else {
    err.status = 404;
    return next(err);
}
  
}) 


router.post('/updatePassword', parseForm, csrfProtection, mid.requiresLogin, (req, res,next) => {

  if (req.session.user && req.cookies.user_sid) {

    if(req.body.password_new != req.body.password_new_verify){
      return res.render('changedefault', { message: 'New password does not match!'});
    }
  
    let result = owasp.test(req.body.password_new);
  
    if(result.errors.length > 1){
      return res.render('changedefault', { message: 'Password too weak!'});
    }else{
      let itemsToUpdate = {"password": req.body.password_new}
    return model.updateUser(itemsToUpdate).then(function(new_storage_object){

      model.writeToConfig(new_storage_object)
      return res.redirect('/dashboard');
    })

  }
  }else {
    err.status = 404;
    return next(err);
}

  

  
}) 

// router.post('/startTap',mid.requiresLogin, (req, res,next) => {
//   if (req.session.user && req.cookies.user_sid) {


//     Tap.startTap().then(response =>{

//       return response
      
//     })



//   }else {
//     err.status = 404;
//     return next(err);
// }

// }) 


// router.post('/stopTap',mid.requiresLogin, (req, res,next) => {
//   if (req.session.user && req.cookies.user_sid) {

//     Tap.stopTap().then(response =>{
//       return response

//     })
//   }else {
//     err.status = 404;
//     return next(err);
// }

// }) 


// router.post('/testConnection',mid.requiresLogin, (req, res,next) => {

//   Tap.testConnection().then(response =>{

    

//     return response
//   }).catch( err =>{
//     return err
//   })

// }) 





module.exports = router;
