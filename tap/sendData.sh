#!/bin/bash

FILE_PATH="outputFiles/"
API_URL="http://192.168.1.235"
API_PORT="3000"
API_HOST="$API_URL:$API_PORT"

echo "$API_HOST"

inotifywait -m $FILE_PATH -e create -e moved_to |
	while read path action file; do
        	#echo "The file '$file' appeared in the dir '$path' via '$action'"
		FILE=`find $FILE_PATH -maxdepth 1 | sort -t_ -nk2,2 | tail -n -2 | head -1`
		if [ -s $FILE ]
		then
		   JSON=`tshark -r $FILE  -T json`
		   BODY="{\"body\" : $JSON}"
		   echo "$BODY" > tmp.json
		   RESPONSE=`curl -d @tmp.json --header "Content-Type: application/json" -X POST $API_HOST`

		   if [[ $RESPONSE == *"true"* ]]
		   then
		      echo "i should remove $FILE"
		      rm "$FILE"
		   else
		      echo "Error in response!"
		      rm "$FILE"
		   fi
		else
		   echo "File is Empty"
		fi
	done

