const fs = require('fs');
var shelljs = require('shelljs');
var request = require('request');


let startTap = function(){

    return new Promise(function (resolve, reject) {

    //run script
    if(shelljs.which('w')){

        //check of de startScript ook wel echt runt
        shelljs.exec('/home/monoid_dev/raspberry-pi/tap/startScript.sh')
        return resolve("Tap is Running")
    }else{
        return resolve("Can't run on Windows")
    }
})
    //verify that it is running correctly
}


let stopTap = function(){
    return new Promise(function (resolve, reject) {

    if(shelljs.which('w')){

    shelljs.exec('/home/monoid_dev/raspberry-pi/tap/stopScript.sh')
    return resolve("Tap Stoped")
    }else{
        return resolve("Can't run on Windows")
}
    })
    //verify that it stopped correctly

}

//TODO
let isRunning = function(){

    return new Promise(function (resolve, reject) {

    if(shelljs.which('w')){
        shelljs.exec('/home/monoid_dev/raspberry-pi/tap/isRunning.sh')
    }else{
        return "windows"
    }
})

}

// let tapInfo = async function(){

//     //check if it is running propperly
//     if(shelljs.which('w')){
//         shelljs.exec('/home/monoid_dev/raspberry-pi/tap/tapInfo.sh')
//     }else{
//         return "windows"
//     }
// }

// let tapTest = async function(){

//     if(shelljs.which('w')){
//         shelljs.exec('/home/monoid_dev/raspberry-pi/tap/tapTest.sh')
//     }else{
//         return "windows"
//     }
// }


let testConnection = function(){

    return new Promise(function (resolve, reject) {

    let token = JSON.parse(fs.readFileSync('../myapp/storage/config.json', 'utf8')).user.api_token;

    request({
        url: "https://api.monoidinc.nl/data/store-packets",
        method: "POST",
        headers : {
            "Authorization" : token
        },
        json: true,   // <--Very important!!!
        body: {"test":"test"}
    }, function (error, response, body){
        if(!error){
            return resolve(body)
        }else{
            return reject(error)
        }
    });

    })


    
}


module.exports = {
    testConnection,
    isRunning,
    stopTap,
    startTap
}
