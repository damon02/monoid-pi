const express = require('express');
const router = express.Router();
const mid = require('../middleware');
const model = require('../models/user');
var owasp = require('owasp-password-strength-test');


/* GET landing page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Monoid',message:"Mono1d_INC!"});
});


// GET /dashboard
router.get('/dashboard', mid.requiresLogin, function(req, res, next) {

  let User = model.getUserObject()
  if (req.session.user && req.cookies.user_sid) {
        return res.render('dashboard', { title: 'dashboard', name: User.username, token: User.auth_token });
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


router.post('/changedefault', (req, res,next) => {

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
                console.log('new storage:',new_storage_object)
                model.writeToConfig(new_storage_object)
                return res.redirect('/dashboard');
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


module.exports = router;
