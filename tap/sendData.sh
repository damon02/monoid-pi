#!/bin/bash

FILE_PATH="/home/monoid_dev/raspberry-pi/tap/outputFiles/"

FILE_PATH_TEST="/home/monoid_dev/raspberry-pi/"



#API_HOST_TEST="http://192.168.1.235:3000"

API_HOST_PROD="https://api.monoidinc.nl/data/store-packets"

echo "$API_HOST_TEST"

inotifywait -m $FILE_PATH -e create -e moved_to |
        while read path action file; do

                #USER INPUT, VERY DANGEROUS!
                API_TOKEN=$(cat /home/monoid_dev/raspberry-pi/myapp/storage/config.json | jq -r ".user.api_token")
                #USER INPUT END

                #echo "The file '$file' appeared in the dir '$path' via '$action'"
                FILE=`find $FILE_PATH -maxdepth 1 | sort -t_ -nk2,2 | tail -n -2 | head -1`
                if [ -s $FILE ]
                FILE_SIZE=$(stat -c%s "$FILE")
                then
                if [[ $FILE_SIZE > 220 ]]
                then
                   JSON=`tshark -r $FILE  -T json`
                   BODY="{\"body\" : $JSON}"
                   echo "$BODY" > /home/monoid_dev/raspberry-pi/tap/tmp.json
                   RESPONSE=`curl -s -d @/home/monoid_dev/raspberry-pi/tap/tmp.json -H "Content-Type: application/json" -H "Authorization: $API_TOKEN" -X POST $API_HOST_PROD`
                   
                   echo $RESPONSE
                   if [[ $RESPONSE == *"true"* ]]
                   then
                      echo "OK"
                   else
                      echo "Error in response!"
                      
                      #bash /home/monoid_dev/raspberry-pi/tap/stopScript/.sh
                   fi
                else
                  echo "packet too small (probably br0 disconnected) "
                  #bash /home/monoid_dev/raspberry-pi/tap/stopScript/.sh
                fi
                else
                   echo "Tshark error?"
                   bash /home/monoid_dev/raspberry-pi/tap/stopScript/.sh
                fi
        done
