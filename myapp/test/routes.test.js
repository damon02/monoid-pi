const assert = require('assert');
const expect = require('chai').expect
const supertest = require('supertest');
//const request = require('request') 
var session = require('supertest-session');
const route = require('../routes/index.js')
const app = require('../app.js')

var cheerio = require('cheerio')


var session = require('supertest-session');

function extractCsrfToken (res) {
  var $ = cheerio.load(res.text);
  return $('[name=_csrf]').val();
}


var csrfToken;



describe('Unauthenticated stuff', function() {


    beforeEach(function (done) {
      supertest(app).get('/')
      .end(function (err, res) {
        if (err) return done(err);
        csrfToken = extractCsrfToken(res);
        done();
      });
    });

  
    // Called once before any of the tests in this block begin.
    before(function(done) {

      app.listen(function(err) {
        if (err) { return done(err); }
        done();
      });
    });

//Unauthenticated GETS
    
it('Unauthenticated GET /' , function(done) {
  supertest(app)
    .get('/')
    .expect(200,done)
});


// it('Unauthenticated GET /dashboard', function(done) {
//   supertest(app)
//     .get('/dashboard')
//     .expect(404,done)
// });
      
// it('Unauthenticated GET /changedefault', function(done) {
//   supertest(app)
//     .get('/changedefault')
//     .expect(404,done)
// });

it('Unauthenticated GET /logout', function(done) {
  supertest(app)
    .get('/logout')
    .expect(302,done)
});

//Unauthenticated POSTS

it('Unauthenticated POST /login', function(done) {
  supertest(app)
    .post('/login')
    .expect(403,done)
  });



  it('Unauthenticated POST /updateApiToken', function(done) {
    supertest(app)
      .post('/updateApiToken')
      .expect(403,done)
  });

  it('Unauthenticated POST /updateUsername', function(done) {
    supertest(app)
      .post('/updateUsername')
      .expect(403,done)
  });


it('Unauthenticated POST /updatePassword', function(done) {
    supertest(app)
      .post('/updatePassword')
      .expect(403,done)
});

it('Unauthenticated Valid  POST /login' , function(done) {
  supertest(app)
    .post('/login')
    .send({"_csrf": csrfToken,"username":'monoid', "password":'Mono1d_INC!'})
    .then(response => {
      //assert(response.body.email, 'foo@bar.com')
      done()
    })
  
  });


  it('Unauthenticated Invalid  POST /login' , function(done) {
    
    supertest(app)
      .post('/login')
      .send({"_csrf": csrfToken,"username":'monoid', "password":'bla'})
      .expect(403)
      .then(response => {
        done()
      })
    
   });


  }); 


  describe('Authenticated stuff', function() {

    //csrfToken = extractCsrfToken(res);

    let csrf
    let authenticatedSession;


    beforeEach(function (done) {
      
      supertest(app).get('/')
      .end(function (err, res) {
        if (err) return done(err);
        csrf = extractCsrfToken(res);
      })
      .then(function (err,res){
        supertest(app).post('/login')
        .send({"_csrf":csrf, username: 'monoid', password: 'Mono1d_INC!' })
        .end(function (err,res) {
          if (err) return done(err);
          authenticatedSession = supertest(app);
          return done();
        });
      });

    });
  
    // Called once before any of the tests in this block begin.
    before(function(done) {

      app.listen(function(err) {
        if (err) { return done(err); }
        done();
      });
    });

  //Authenticated GETS
  // it('Authenticated  GET /dashboard' , function(done) {
  //   authenticatedSession.get('/dashboard')
  //   .then(response => {
  //     done()
  //   })
  // });
  

  

  //Authenticated POSTS


  it('Authenticated  POST /updateApiToken' , function(done) {
    authenticatedSession.post('/updateApiToken')
    .then(response => {
      done()
    })
  });


  it('Authenticated  POST /updateUsername' , function(done) {
    authenticatedSession.post('/updateUsername')
    .then(response => {
      done()
    })
  });

  
  it('Authenticated  POST /updatePassword' , function(done) {
    authenticatedSession.post('/updatePassword')
    .then(response => {
      done()
    })
  });


  })




    

