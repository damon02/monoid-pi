const express = require('express');
const router = express.Router();
const mid = require('../middleware');
const model = require('../models/user');
const owasp = require('owasp-password-strength-test');
const systemData = require('../modules/systemData')
const Tap = require('../modules/Tap')
const ip = require("ip");



/* GET landing page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Monoid',password:"Mono1d_INC!"});
});




// GET /dashboard
router.get('/dashboard', mid.requiresLogin, function(req, res, next) {

  let User = model.getUserObject()

  if (req.session.user && req.cookies.user_sid) {
      return res.render('dashboard', 
      {title: 'Dashboard', 
      username: User.username, 
      token: User.api_token, 
      ip_adr: ip.address()
    })

  }else{
    var err = new Error('Page not found');
    err.status = 404;
    return next("error");
  }
});

// POST /login
router.post('/login', function(req, res, next) {

  if (req.body.username && req.body.password) {
    model.authenticate(req.body.username, req.body.password, function (error, user) {
      if (error || !user) {
        return res.render('login', { message: 'username or password incorrect'});

      }  else {

        req.session.user = user;

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
      res.clearCookie('user_sid');
      res.redirect('/');
  } else {
      res.redirect('/');
  }
});

router.get('/changedefault', mid.requiresLogin, function(req, res, next) {
  if (req.session.user && req.cookies.user_sid) {
        return res.render('changedefault', { title: 'Change Default Credentials'});
  }else{
    var err = new Error('Page not found');
    err.status = 404;
    return next("error");
  }
});


router.post('/changedefault',mid.requiresLogin, (req, res,next) => {

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

router.post('/updateApiToken',mid.requiresLogin, (req, res,next) => {

  if (req.session.user && req.cookies.user_sid) {
    if(req.body.apiToken.length > 5 && req.body.apiToken.length  < 40){
      let itemsToUpdate = {"api_token": req.body.apiToken}
    return model.updateUser(itemsToUpdate).then(function(new_storage_object){
      model.writeToConfig(new_storage_object)
      return res.redirect('/dashboard');
    }).catch(err =>{
      return res.redirect('/logout');
    })
  }else{
    return res.render('dashboard', { message: 'Bad Token'});
  }
  }else {
    err.status = 404;
    return next(err);
}

})


router.post('/updateUsername',mid.requiresLogin, (req, res,next) => {
  if (req.session.user && req.cookies.user_sid) {
    if(req.body.username.length > 3 && req.body.username.length  < 30){
      let itemsToUpdate = {"username": req.body.username}
    return model.updateUser(itemsToUpdate).then(function(new_storage_object){
      model.writeToConfig(new_storage_object)
      return res.redirect('/dashboard');
    }).catch(err =>{
      return res.redirect('/logout');
    })
  }else{
    return res.render('/dashboard', { message: 'poor username'});
  }
  }else {
    err.status = 404;
    return next(err);
}
  
}) 


router.post('/updatePassword', mid.requiresLogin, (req, res,next) => {

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

router.post('/startTap',mid.requiresLogin, (req, res,next) => {
  if (req.session.user && req.cookies.user_sid) {


    Tap.startTap().then(response =>{

      return response
      
    })



  }else {
    err.status = 404;
    return next(err);
}

}) 


router.post('/stopTap',mid.requiresLogin, (req, res,next) => {
  if (req.session.user && req.cookies.user_sid) {

    Tap.stopTap().then(response =>{
      return response

    })
  }else {
    err.status = 404;
    return next(err);
}

}) 


router.get('/testConnection',mid.requiresLogin, (req, res,next) => {

  Tap.testConnection().then(response =>{

    return response
  }).catch( err =>{
    return err
  })

}) 





module.exports = router;
