const fs = require('fs');
var shelljs = require('shelljs');
var rp = require('request-promise');


let startTap = function(){

    return new Promise(function (resolve, reject) {

    //run script
    if(shelljs.which('w')){

        //check of de startScript ook wel echt runt

        shelljs.exec("bash /home/monoid_dev/raspberry-pi/tap/test.sh")

        var obj = JSON.parse(fs.readFileSync('/home/monoid_dev/raspberry-pi/tap/status.json', 'utf8'));

        for(let key in obj){
            if(obj[key] == "down"){
                return resolve({success:false,isRunning:false,current_status:"Could not start tap", msg: key +" is down"})
            }
        }

        shelljs.exec("sh /home/monoid_dev/raspberry-pi/tap/startScript.sh")


        /*

        add aditional checks to see if the tap is actually running!

        */
        return resolve({success:true,isRunning:true,current_status:"Tap is running", msg: ""})
    }else{
        return resolve({success:true, isRunning:true, current_status:"Tap is running", msg: "Cannot run on windows"})
    }
})
    //verify that it is running correctly
}

//status.current_status
//status.msg
//status.isRunning

let stopTap = function(msg){
    return new Promise(function (resolve, reject) {

    if(shelljs.which('w')){

    shelljs.exec('sh /home/monoid_dev/raspberry-pi/tap/stopScript.sh')

        //verify that it stopped correctly


        return resolve({success: true,isRunning:false, current_status:"Tap not running", msg:""})
    }else{
        return resolve({success:true, isRunning:false, current_status:"Tap not running", msg: "Cannot run on windows"})
    }
})

}

//TODO
let isRunning = function(){

    return new Promise(function (resolve, reject) {

    if(shelljs.which('w')){
        shelljs.exec('/home/monoid_dev/raspberry-pi/tap/isRunning.sh',{silent:true})


        /*

        Check hier of ie wel echt aan echt aan het running is
        */


        return resolve({success: true,isRunning:true, current_status:"Tap is running", msg:""})
    }else{
        return resolve({success: true,isRunning:false, current_status:"Tap not running", msg:"Can't run on Windows"})
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

        rp({
        url: "https://api.monoidinc.nl/data/store-packets",
        method: "POST",
        headers : {
            "Authorization" : token
        },
        json: true,   // <--Very important!!!
        body: {}
    }).then(body =>{
        return resolve(body)
    }).catch(err =>{
        return reject(err)
    })
    })
}


module.exports = {
    testConnection,
    isRunning,
    stopTap,
    startTap
}
