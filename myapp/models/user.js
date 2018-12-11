var bcrypt = require('bcryptjs');
var fs = require('fs');
var InputValidator = require('input-validate');



custom_rules = {
	alphabets: true,
	numbers: '0-9',
	spaces: false,
	symbols: '-', 
	minlength: '',
	maxlength: '',
};



let authenticate = function(username, password, callback){


    var user = JSON.parse(fs.readFileSync('../myapp/storage/config.json', 'utf8')).user;
    
    //for development
    //return callback(null, user);


    if(user.username === username){
        if(user.password === 'monoid' && user.hasChangedPassword === false){
            setLastLogin()
            return callback(null, user);
        }
        bcrypt.compare(password, user.password , function(error, result) {
            if (result === true) {
                setLastLogin()
              return callback(null, user);
            } else {
              return callback();
            }
          })
 
    }else{

        var err = new Error('Wrong credentials');
        err.status = 404;
        return callback(err);

    }

}

// hash password
let hashpassword =  function(password) {
    return new Promise(function (resolve, reject) {

  bcrypt.hash(password, 10, function(err, hash) {
    if (err) {
        console.log ('error during encryption, changed pw back to default')
        return resolve("monoid")
    }

    return resolve(hash)
})
  })
}


let getUserObject = function(){
    return JSON.parse(fs.readFileSync('../myapp/storage/config.json', 'utf8')).user;
}

let updateUser = function(items_to_update){
    return new Promise(function (resolve, reject) {

    var storage = JSON.parse(fs.readFileSync('../myapp/storage/config.json', 'utf8'));


    //SANITIZE INPUT!

    storage.user.hasChangedPassword = true

    for (let key in items_to_update){
        if(key == "password"){
            hash = hashpassword(items_to_update.password).then(function(hash){
                storage.user[key] = hash        
            })
        }else{
            if(InputValidator.customOr(items_to_update[key], custom_rules)){
                storage.user[key] = items_to_update[key]
            }else{
                return reject("weird characters used in "+ items_to_update[key])
            }
        }
    }
    return resolve(storage)
    });
}



let writeToConfig = function(new_storage){
    fs.writeFileSync('../myapp/storage/config.json' ,JSON.stringify(new_storage,null, 2),'utf8')
}

let setLastLogin = function(){
    var storage = JSON.parse(fs.readFileSync('../myapp/storage/config.json', 'utf8'));

    storage.user.last_logged_in = Date.now();

    fs.writeFileSync('../myapp/storage/config.json',JSON.stringify(storage,null,2),'utf8')
}

module.exports = {
    authenticate,
    updateUser,
    getUserObject,
    writeToConfig
}