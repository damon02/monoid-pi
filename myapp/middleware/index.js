function loggedOut(req, res, next) {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie('user_sid');
        return res.redirect('/');
    }
    return next();
  }
  function requiresLogin(req, res, next) {
    if (req.session.user && req.cookies.user_sid) {
        return next();
    } else {
      var err = new Error('Page not found');
      err.status = 404;
      return next(err);
    }
  }
  
  function validateInput(req, res, next) {
    const { check, validationResult } = require('express-validator/check');
    


  }

  module.exports.loggedOut = loggedOut;
  module.exports.requiresLogin = requiresLogin;
  