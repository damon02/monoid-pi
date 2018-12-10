const fs = require('fs');
var shelljs = require('shelljs');


let startTap = async function(){
    //run script
    shelljs.exec('startScript.sh')

    //verify that it is running correctly
}


let stopTap = async function(){
    //run script
    shelljs.exec('stopScript.sh')

    //verify that it stopped correctly

}

let isRunning = async function(){
    //run script
    shelljs.exec('isRunning.sh')

    //check if it is running or not
}

let tapInfo = async function(){

    //check if it is running propperly
    shelljs.exec('tapInfo.sh')
}