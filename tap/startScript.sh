#!/bin/bash

#run tshark on br0

bash /home/monoid_dev/raspberry-pi/tap/tsharkScript.sh & bash /home/monoid_dev/raspberry-pi/tap/sendData.sh

#start listening on the output folder and send the pcap files in json to api