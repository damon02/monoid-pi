const fs = require('fs');
var shelljs = require('shelljs');
var rp = require('request-promise');
const os = require("os");


let startTap = function(){

    return new Promise(function (resolve, reject) {

    //run script
    if(!(os.platform() == 'win32')){

        //check of de startScript ook wel echt runt

        shelljs.exec("bash /home/monoid_dev/raspberry-pi/tap/check.sh")

        var obj = JSON.parse(fs.readFileSync('/home/monoid_dev/raspberry-pi/tap/status.json', 'utf8'));

        for(let key in obj){
            if(obj[key] == "down"){
                return resolve({success:false,isRunning:false,current_status:"Could not start tap", msg: key +" is down"})
            }
        }

        let startScript = shelljs.exec("sh /home/monoid_dev/raspberry-pi/tap/startScript.sh",{async:true})

        startScript.stdout.on('data', data =>{
            isRunning().then(response =>{
                if(response.isRunning){
                    return resolve({success: true, isRunning:true, current_status:"Tap is running", msg:""})
                }else{
                    return resolve({success: false, isRunning:false, current_status:"Tap is not running", msg:"Could not start tap!"})
                }
    
            })

        })


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

    if(!(os.platform() == 'win32')){

    shelljs.exec('sh /home/monoid_dev/raspberry-pi/tap/stopScript.sh')

        isRunning().then(response =>{

            if(response.isRunning){
                return resolve({success: false,isRunning:true, current_status:"Tap is running", msg:"could not stop tap!"})
            }else{
                return resolve({success: true,isRunning:false, current_status:"Tap not running", msg:""})
            }

        })

        //verify that it stopped correctly

    }else{
        return resolve({success:true, isRunning:false, current_status:"Tap not running", msg: "Cannot run on windows"})
    }
})

}

let isRunning = function(){

    return new Promise(function (resolve, reject) {

    if(!(os.platform() == 'win32')){
        x = shelljs.exec('sh /home/monoid_dev/raspberry-pi/tap/isRunning.sh').stdout

        
        if(x.includes('true')){
            return resolve({success: true,isRunning:true, current_status:"Tap is running", msg:""})
        }else{
            return resolve({success: true,isRunning:false, current_status:"Tap not running", msg:""})
        }

    }else{
        return resolve({success: true,isRunning:false, current_status:"Tap not running", msg:"Can't run on Windows"})
    }
})

}


let testConnection = function(){

    return new Promise(function (resolve, reject) {

    let token = JSON.parse(fs.readFileSync('../myapp/storage/config.json', 'utf8')).user.api_token;

        rp({
        url: "https://api.monoidinc.nl/data/store-packets",
        method: "GET",
        headers : {
            "Authorization" : token
        },
        json: true,   // <--Very important!!!
        body: {}
    }).then(body =>{
        return resolve(body)
    }).catch(err =>{
        return reject("Could not connect to API")
    })
    })
}


module.exports = {
    testConnection,
    isRunning,
    stopTap,
    startTap
}
