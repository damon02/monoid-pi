//const si = require('systeminformation')
const fs = require('fs');
var shelljs = require('shelljs');

let getSystemData = async function(){

    let datetime = new Date();


    if(shelljs.which('w')){


    mon_nic = {'avg':'0'}

    in_nic ={'avg':'0'}

    out_nic = {'avg':'0'}

    nic = {mon_nic,in_nic, out_nic}


    ram_usage = shelljs.exec("free -m | awk '/Mem:/ { print $3 } '") /shelljs.exec("free -m | awk '/Mem:/ { print $2 } '") * 100
	file_usage = shelljs.exec("df -h | grep /dev/root | awk '{ print $5 }'")
    cpu_usage = 100 - shelljs.exec("echo $(vmstat 1 2|tail -1|awk '{print $15}')")
    
     return {
            "datetime": datetime,
            'ram_usage': Math.round(ram_usage),
            'filesys': file_usage.substr(0, file_usage.length -1),
            'cpu_usage': cpu_usage,
            'nic': nic
        }
    }else{
        console.log('Windows')
        return {
            "datetime": datetime,
            "system": system,
            'ram_usage': 'BAH WINDOWS',
            'filesys': 'BAH WINDOWS',
            'cpu_usage': 'BAH WINDOWS',
            'nic': nic
        }

    }


    return {
        "datetime": datetime,
        "system": system,
        "cpu_load": await cpuLoad(),
        //"cpu_temp": await cpuTemp(),
        "mem": await mem(),
        "fs_size": await fsSize(),
        "net_stat_eth_in": await networkStats(system.eth_in),
        "net_stat_eth_out": await networkStats(system.eth_out),
        "net_stat_eth_mon": await networkStats(system.eth_mon),
        "inet_check": await inetChecksite(system.api_url_dev),
        "inet_latency": await inetLatency(system.api_url_dev),
        //"processes":processes()
    }


}

let cpuLoad = async function(){

    try {
        const data = await si.currentLoad();
        //console.log(data);
        return data;
    }
    catch (error) {
        console.error(error);
        return ""
    }
}


let cpuTemp = async function(){

    try {
        const data = await si.cpuTemperature();
        console.log(data);
        return data;
    }
    catch (error) {
        console.error(error);
        return ""
    }
}


let mem = async function(){
    try {
        const data = await si.mem();
        //console.log(data);
        return data;
    }
    catch (error) {
        console.error(error);
        return ""
    }
}

let fsSize = async function(){
    
    try {
        const data = await si.fsSize();
        return {"total_size":data[0].size,"used":data[0].used}
    }
    catch (error) {
         console.error(error);
         return ""
    }
}



let networkStats = async function(iface){

    try {
        const data = await si.networkStats();
        //console.log(data);
        return data;
    }
    catch (error) {
        console.error(error);
        return ""
    }
}


let inetChecksite = async function(host){

    try {
        const data = await si.inetChecksite(host);
        //console.log(data);
        return data;
    }
    catch (error) {
        console.error(error);
        return ""
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
