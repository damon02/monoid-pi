#!/bin/bash

#run tshark on eth0
bash tsharkScript.sh & bash sendData.sh

#start listening on the output folder and send the pcap files in json to api
