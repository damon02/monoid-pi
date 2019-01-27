//const si = require('systeminformation')
const fs = require('fs');
var shelljs = require('shelljs');
const os = require("os");

let getSystemData = function(){

    return new Promise(function (resolve, reject) {

    if(!(os.platform() == 'win32')){

        let str = shelljs.exec('sh /home/monoid_dev/raspberry-pi/myapp/modules/getSystemData.sh',{silent:true}).stdout

        let sys_data = JSON.parse(str).sys_data

        sys_data.datetime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')

        sys_data.ram_usage = Math.round(sys_data.ram_usage_1/sys_data.ram_usage_2 * 100)

        sys_data.cpu_usage = Math.round(sys_data.cpu_usage)
        sys_data.cpu_temp = Math.round(sys_data.cpu_temp/1000)
        sys_data.file_usage = sys_data.file_usage.substring(0, sys_data.file_usage.length -1)
        return resolve(sys_data)

    }else{
        //niet pi
        return resolve({
            "datetime": new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
            'ram_usage': getRandomInt(1,10),
            'file_usage': "5",
            'cpu_usage': getRandomInt(20,50),
            'cpu_temp': getRandomInt(51,55),
            'nic': {'mon_nic':{'status': 'up'}, 'br_nic':{'status': 'up'}}
        })
    }
})

}

function getRandomInt(min, max) {

    if(Math.floor(Math.random() % 2 == 0)){

    }
    min = Math.ceil(min);
    max = Math.floor(max);
    return (Math.floor(Math.random() * (max - min + 1)) + min).toString();
}



module.exports = {
    getSystemData
}
