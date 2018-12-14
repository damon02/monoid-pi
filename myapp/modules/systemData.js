//const si = require('systeminformation')
const fs = require('fs');
var shelljs = require('shelljs');

date = new Date()

let getSystemData = async function(){

    let datetime = date.toISOString()
    .replace(/T/, ' ')
    .replace(/\..+/, '')


    if(shelljs.which('w')){


    let str = shelljs.exec('sh /home/monoid_dev/raspberry-pi/myapp/modules/getSystemData.sh',{silent:true}).stdout

    let sys_data = JSON.parse(str).sys_data
    sys_data.ram_usage = obj.ram_usage_1/obj.ram_usage_2 * 100

     return sys_data

    }else{
        //niet pi
        return {
            "datetime": datetime,
            'ram_usage': 'N/A',
            'filesys': 'N/A',
            'cpu_usage': 'N/A',
            'cpu_temp': 'N/A',
            'nic': {'mon_nic':{'status': 'not detected'}, 'br_nic':{'status': 'not detected'}}
        }

    }
}


let inetLatency = async function(host){
    try {
        const data = await si.inetLatency(host);
        //console.log(data);
        return data;
    }
    catch (error) {
        console.error(error);
        return ""
    }
}

module.exports = {
    getSystemData
}
