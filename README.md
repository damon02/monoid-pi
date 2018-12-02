# Raspberry Pi

This project contains two parts
*app
*tap


## Tap
Tap is the script that runs tshark to listen for traffic. This scripts contains two distinc parts:
*Sniffer
*Sender

Sniffer is the continously running tshark command which outputs .pcap files in a /output folder.

Sender is the continously running command which check for pcap files in the /output folder, parses those using tshark -T -F to JSON and sends it to the API. If the api has consumed the JSON in a correct manner the script should receive the 200 status and than the script can remove the .pcap file and continue the process.

## App

Simple but secure nodeJS application for the enduser to setup up the inital configurations:
*First setup is done with a default username and password
*User is forced to change password
*Dashboard

### Dashboard

The dasboard needs to have a:
*Test connection to API function
*Posiblity to change username and password
*Set and change API token
*Start the tap or stop the tap
