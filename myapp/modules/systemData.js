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
            'ram_usage': 'N/A',
            'file_usage': 'N/A',
            'cpu_usage': 'N/A',
            'cpu_temp': 'N/A',
            'nic': {'mon_nic':{'status': 'not detected'}, 'br_nic':{'status': 'not detected'}}
        })
    }
})

}


module.exports = {
    getSystemData
}
