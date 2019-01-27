const express = require('express');
const router = express.Router();
const mid = require('../middleware');
const model = require('../models/user');
const owasp = require('owasp-password-strength-test');
const systemData = require('../modules/systemData')
const Tap = require('../modules/Tap')
let csrf = require('csurf');
var bodyParser = require('body-parser')
const uuidv4 = require('uuid/v4');
var bcrypt = require('bcryptjs');

// setup route middlewares
var csrfProtection = csrf({ cookie: true })
var parseForm = bodyParser.urlencoded({ extended: false })


/* GET landing page. */
router.get('/',csrfProtection, function(req, res, next) {
    res.render('index', {csrfToken: req.csrfToken() });
}); 


// GET /dashboard
router.get('/dashboard',csrfProtection, mid.requiresLogin, function(req, res, next) {

  let User = model.getUserObject()


  if (req.session.user && req.cookies.user_sid) {

    let msg = ""

    if(req.session.msg){

      msg = req.session.msg

    }
    delete req.session.msg


    res.render('dashboard', 
    {title: 'Dashboard',
    message: msg, 
    token: User.api_token, 
    current_ip: User.current_ip,
    last_ip: User.last_ip,
    current_logged_in: User.current_logged_in,
    last_logged_in: User.last_logged_in,
    csrfToken: req.csrfToken(),
    socketToken: req.session.socketToken
  })

  }else{
    res.status(404);
    res.render('404');
  }
});

// POST /login
router.post('/login', parseForm, csrfProtection, function(req, res, next) {

  if (req.body.username && req.body.password) {
    model.authenticate(req.body.username, req.body.password, function (error, user) {
      if (error || !user) {
        return res.render('index', { message: 'Invalid Credentials',csrfToken: req.csrfToken()});
      }  else {

        if(user.hasChangedPassword){

          req.session.user = user;
          req.session.socketToken = uuidv4();
          return res.redirect('/dashboard');
        }
        req.session.user = user;
        return res.redirect('/changedefault');

      }
    });
  } 
  else {
    res.status(404);
    return res.render('404');
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

router.get('/changedefault',csrfProtection, function(req, res, next) {

  if (req.session.user && req.cookies.user_sid) {
      if(model.hasChangedPassword()){
        return res.redirect('/dashboard')
    }else{
      return res.render('changedefault', {csrfToken: req.csrfToken()});
    }
  }else{
    res.status(404);
    return res.render('index');
  }
});


router.post('/changedefault',parseForm, csrfProtection, (req, res,next) => {

  if (req.session.user && req.cookies.user_sid) {
    if(req.session.user.hasChangedPassword) {
      return res.redirect('/dashboard');
    }

    if (req.body.username_new && req.body.password_new  && req.body.password_new_verify) {
          if(req.body.password_new != req.body.password_new_verify){
            
            return res.render('changedefault', { message: 'New password does not match!',csrfToken: req.csrfToken()});
          }
        
          let result = owasp.test(req.body.password_new);

          if(req.body.password_new === "Monoid_inc_Rulez"){
            return res.render('changedefault', { message: 'Cannot set new password to the default password',csrfToken: req.csrfToken()});
          }

          if(result.errors.length > 1){
            return res.render('changedefault', { message: 'Password not allowed!',csrfToken: req.csrfToken()});

          }else{

            if(req.body.username_new.length > 0 && req.body.username_new.length  < 30){

              model.hashpassword(req.body.password_new).then(hash =>{

                bcrypt.compare(req.body.password_new, hash, function(error, result) {
                  if(result){

                    model.updateUser({"username": req.body.username_new, "password": hash}).then(function(new_storage_object){
  
                      model.writeToConfig(new_storage_object)
    
                      model.setCurrentLogin()
      
                      return res.redirect('/dashboard');
                    }).catch(err =>{
                      return res.render('changedefault', { message: 'Something went wrong',csrfToken: req.csrfToken()});

                    })

                  }else{
                    return res.render('changedefault', { message: 'Something went wrong',csrfToken: req.csrfToken()});

                  }

                 


                })


 
              })
              



            }else{
              return res.render('changedefault', { message: 'Invalid Username',csrfToken: req.csrfToken()});
            }

          }

          }else{
            return res.render('changedefault', { message: 'Incomplete form',csrfToken: req.csrfToken()});

          }          
        }else {
          err.status = 404;
          return next(err);
  }
});

router.post('/updateApiToken', parseForm, csrfProtection,mid.requiresLogin, (req, res,next) => {

  if (req.session.user && req.cookies.user_sid) {
    if(req.body.apiToken.length > 5 && req.body.apiToken.length  < 40){
      let itemsToUpdate = {"api_token": req.body.apiToken}
    return model.updateUser(itemsToUpdate).then(function(new_storage_object){
      model.writeToConfig(new_storage_object)
      return res.redirect('/dashboard');
    }).catch(err =>{
      res.clearCookie('user_sid');
      return res.render('index', {message:'Possible malicious behavior detected' });
    })
  }else{
    return res.redirect('/dashboard');
  }
  }else {
    err.status = 404;
    return next(err);
}

})




router.post('/updatePassword', parseForm, csrfProtection, mid.requiresLogin, (req, res,next) => {

  if (req.session.user && req.cookies.user_sid) {

    if (req.body.password && req.body.password_new && req.body.password_new_verify) {

      model.authenticate(req.session.user.username, req.body.password, function (error, user) {


        if (error || !user) {

          req.session.msg = "Invalid Credentials"

          return res.redirect('/dashboard');

        }

        if(req.body.password_new != req.body.password_new_verify){

          req.session.msg = "New password does not match!"

          return res.redirect('/dashboard');
        
        }

        let result = owasp.test(req.body.password_new);

        if(result.errors.length > 1){

          req.session.msg = "Password not allowed!"
          return res.redirect('/dashboard');

      }else{

        model.hashpassword(req.body.password_new).then(hash =>{

          bcrypt.compare(req.body.password_new, hash, function(error, result) {

            
          model.updateUser({"password": hash}).then(function(new_storage_object){
  
            model.writeToConfig(new_storage_object)

            req.session.msg = "Password changed succesfully"
            return res.redirect('/dashboard');

    
          }).catch(err =>{

            req.session.msg = "Something went wrong"
            return res.redirect('/dashboard');

          })
  
    
          })

        })
        
      }
      
      })

    }else {
      err.status = 404;
      return next(err);
    }
  }
})
    

  


  
  


module.exports = router;
