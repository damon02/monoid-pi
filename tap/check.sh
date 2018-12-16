#!/bin/bash

checkBr0(){

if ! (cat /sys/class/net/br0/operstate | grep "up");
then
	echo "down"
fi
}

checkEth0(){

if ! (cat /sys/class/net/eth0/operstate | grep "up");
then
	echo "down"
fi

}

checkAPI(){

API_TOKEN=$(cat /home/monoid_dev/raspberry-pi/myapp/storage/config.json | jq -r ".user.api_token")
API_HOST_PROD="https://api.monoidinc.nl/data/store-packets"
BODY="{\"body\" : {}}"
RESPONSE=`curl -s -d "$BODY" -H "Content-Type: application/json" -H "Authorization: $API_TOKEN" -X POST $API_HOST_PROD`
if [[ $RESPONSE == *"true"* ]];
    then
        echo "up"
    else
        echo "down"
    fi
}



echo {\"br0\": \"$(checkBr0)\", \"eth0\" :  \"$(checkEth0)\", \"api\" : \"$(checkAPI)\"} > /home/monoid_dev/raspberry-pi/tap/status.json