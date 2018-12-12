//const si = require('systeminformation')
const fs = require('fs');
var shelljs = require('shelljs');

let getSystemData = async function(){

    let datetime = new Date().toISOString()
    .replace(/T/, ' ')
    .replace(/\..+/, '')

    let mon_nic = {}
    let br_nic = {}


    if(shelljs.which('w')){

    if(shelljs.test('-e','cat /sys/class/net/eth0/statistics/rx_bytes')){
        mon_nic =  {'online':true}
    }

    if(shelljs.test('-e','/sys/class/net/br0/statistics/rx_bytes')){
    shelljs.exec("cat /sys/class/net/br0/statistics/rx_bytes")
        br_nic = {'online':true}

    }

    let ram_usage = shelljs.exec("free -m | awk '/Mem:/ { print $3 } '") /shelljs.exec("free -m | awk '/Mem:/ { print $2 } '") * 100
	let file_usage = shelljs.exec("df -h | grep /dev/root | awk '{ print $5 }'",{silent: true})
    let cpu_usage = shelljs.exec("grep 'cpu ' /proc/stat | awk '{usage=($2+$4)*100 / ($2+$4+$5)} END {print usage}'",{silent: true})

    let cpu_temp = shelljs.exec("cat /sys/class/thermal/thermal_zone0/temp",{silent: true}) /1000
    
     return {
            "datetime": datetime,
            'ram_usage': Math.round(ram_usage),
            'filesys': file_usage.substr(0, file_usage.length -2),
            'cpu_usage': Math.round(cpu_usage),
            'cpu_temp': cpu_temp,
            'nic': {'mon_nic':mon_nic, 'br_nic':br_nic}
        }
    }else{
        //niet pi
        return {
            "datetime": datetime,
            'ram_usage': 'N/A',
            'filesys': 'N/A',
            'cpu_usage': 'N/A',
            'cpu_temp': 'N/A',

            'nic': {'mon_nic':mon_nic, 'br_nic':br_nic}
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
