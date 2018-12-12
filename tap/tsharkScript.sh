#!/bin/bash

IP_ADDR=$(ip addr show eth0 | grep "inet\b" | awk '{print $2}' | cut -d/ -f1)

FILTER_STRING="host not $IP_ADDR"

echo $FILTER_STRING

tshark -i br0  -b duration:1 -b files:20 -w "/home/monoid_dev/raspberry-pi/tap/outputFiles/packets" -f "$FILTER_STRING"  -j "eth eth.src frame ip"
