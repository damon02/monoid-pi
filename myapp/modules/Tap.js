const fs = require('fs');
var shelljs = require('shelljs');


let startTap = async function(){
    //run script
    if(shelljs.which('w')){

        //check of de startScript ook wel echt runt
        shelljs.exec('/home/monoid_dev/raspberry-pi/tap/startScript.sh')
        return "Tap is Running"
    }else{
        return "windows"
    }

    //verify that it is running correctly
}


let stopTap = async function(){
    //run script
    if(shelljs.which('w')){

    shelljs.exec('/home/monoid_dev/raspberry-pi/tap/stopScript.sh')
    return "Tap Stoped"
    }else{
        return "windows"
}


    //verify that it stopped correctly

}

let isRunning = async function(){
    //run script

    if(shelljs.which('w')){
        shelljs.exec('/home/monoid_dev/raspberry-pi/tap/isRunning.sh')
    }else{
        return "windows"
    }


    //check if it is running or not
}

let tapInfo = async function(){

    //check if it is running propperly
    if(shelljs.which('w')){
        shelljs.exec('/home/monoid_dev/raspberry-pi/tap/tapInfo.sh')
    }else{
        return "windows"
    }
}

let tapTest = async function(){

    if(shelljs.which('w')){
        shelljs.exec('/home/monoid_dev/raspberry-pi/tap/tapTest.sh')
    }else{
        return "windows"
    }
}


module.exports = {
    tapInfo,
    isRunning,
    stopTap,
    startTap
}
